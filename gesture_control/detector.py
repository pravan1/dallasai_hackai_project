import time
from collections import deque
from dataclasses import dataclass
from enum import Enum
from typing import Callable, Deque, Optional, Tuple

import cv2
import mediapipe as mp
import numpy as np
from mediapipe.tasks import python as mp_tasks
from mediapipe.tasks.python import vision as mp_vision

from .config import GestureConfig

BaseOptions = mp_tasks.BaseOptions
HandLandmarkerOptions = mp_vision.HandLandmarkerOptions
HandLandmarker = mp_vision.HandLandmarker
VisionRunningMode = mp_vision.RunningMode


class GestureType(str, Enum):
    """High-level gestures emitted by the detector."""

    NEXT = "NEXT"
    PREVIOUS = "PREVIOUS"


class DetectorState(str, Enum):
    """Internal state of the gesture detector."""

    IDLE = "IDLE"
    TRACKING = "TRACKING"
    COOLDOWN = "COOLDOWN"


@dataclass
class TrackedPoint:
    """Represents one tracked hand position at a specific time."""

    x: int
    y: int
    t_ms: float


class GestureDetector:
    """
    Tracks a single hand using MediaPipe Hands and detects horizontal swipe gestures.

    Responsibilities:
    - Detect a hand and estimate stable reference point (approximate palm center)
    - Track that point over time in a short history buffer
    - Decide when the motion forms a left-to-right ("NEXT") or right-to-left
      ("PREVIOUS") swipe using simple heuristics
    - Fire a callback when a gesture is detected
    - Provide an annotated frame for visualization (trail, current point, status)
    """

    def __init__(
        self,
        config: Optional[GestureConfig] = None,
        on_gesture: Optional[Callable[[GestureType], None]] = None,
    ) -> None:
        self.config = config or GestureConfig()
        self.on_gesture = on_gesture

        # Initialize the MediaPipe Tasks Hand Landmarker using the modern API.
        #
        # RunningMode.VIDEO expects frames accompanied by monotonically increasing
        # timestamps in milliseconds, which we derive from time.monotonic().
        base_options = BaseOptions(model_asset_path=self.config.model_path)
        options = HandLandmarkerOptions(
            base_options=base_options,
            running_mode=VisionRunningMode.VIDEO,
            num_hands=1,
            min_hand_detection_confidence=self.config.min_detection_confidence,
            min_hand_presence_confidence=self.config.min_presence_confidence,
            min_tracking_confidence=self.config.min_tracking_confidence,
        )
        self._landmarker = HandLandmarker.create_from_options(options)

        self._points: Deque[TrackedPoint] = deque()
        self._state: DetectorState = DetectorState.IDLE

        self._last_gesture: Optional[GestureType] = None
        self._last_gesture_time_ms: float = 0.0

    def close(self) -> None:
        """Release MediaPipe resources."""
        if hasattr(self, "_landmarker"):
            self._landmarker.close()

    def process_frame(self, frame_bgr: np.ndarray) -> Tuple[np.ndarray, Optional[GestureType], str]:
        """
        Process a single BGR frame from OpenCV.

        Returns:
            annotated_frame: frame with overlays for visualization
            gesture: GestureType if a swipe was detected in this frame, else None
            status_text: short text describing current detector state
        """
        cfg = self.config
        now_ms = time.monotonic() * 1000.0

        frame = frame_bgr.copy()

        if cfg.mirror_view:
            frame = cv2.flip(frame, 1)

        height, width, _ = frame.shape

        # Convert to RGB and wrap the numpy array in a MediaPipe Image.
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)

        # For VIDEO running mode, detect_for_video uses the provided timestamp to
        # associate results with frames. We reuse now_ms so timing for gesture
        # logic and landmark detection stay aligned.
        result = self._landmarker.detect_for_video(mp_image, int(now_ms))

        hand_point: Optional[TrackedPoint] = None

        if result and result.hand_landmarks:
            # Use the first detected hand only (this module is single-hand oriented).
            landmarks = result.hand_landmarks[0]

            # Compute an approximate palm center by averaging all landmark coordinates.
            xs = [lm.x for lm in landmarks]
            ys = [lm.y for lm in landmarks]

            cx = int(np.mean(xs) * width)
            cy = int(np.mean(ys) * height)

            hand_point = TrackedPoint(x=cx, y=cy, t_ms=now_ms)
            self._update_history(hand_point)
        else:
            # No hand detected: gradually forget past positions and return to IDLE.
            self._decay_history(now_ms)

        gesture: Optional[GestureType] = None
        status = self._state.value

        if self._state == DetectorState.COOLDOWN:
            if now_ms - self._last_gesture_time_ms >= cfg.cooldown_ms:
                self._state = DetectorState.IDLE
                status = self._state.value
        else:
            gesture = self._detect_gesture(now_ms)
            if gesture is not None:
                self._last_gesture = gesture
                self._last_gesture_time_ms = now_ms
                self._state = DetectorState.COOLDOWN
                status = f"{self._state.value} ({gesture.value})"

                if self.on_gesture is not None:
                    self.on_gesture(gesture)

        # Draw the tracked point and motion trail to help visualize the algorithm.
        self._draw_trail(frame)

        # Draw status and last gesture on top of the frame.
        status_text = f"State: {self._state.value}"
        if self._last_gesture is not None:
            status_text += f" | Last: {self._last_gesture.value}"

        cv2.putText(
            frame,
            status_text,
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 255, 0),
            2,
            cv2.LINE_AA,
        )

        return frame, gesture, status_text

    def _update_history(self, point: TrackedPoint) -> None:
        """
        Add the new tracked hand position to the history buffer and remove
        any entries that are older than the configured history window.

        This history is later used to decide whether a swipe occurred by
        comparing the earliest and latest points within the time window.
        """
        self._points.append(point)

        # Enforce maximum history duration.
        cutoff_ms = point.t_ms - self.config.history_max_duration_ms
        while self._points and self._points[0].t_ms < cutoff_ms:
            self._points.popleft()

        # Trim to a maximum visual trail length for rendering.
        while len(self._points) > self.config.trail_max_length:
            self._points.popleft()

        if len(self._points) > 1:
            self._state = DetectorState.TRACKING
        else:
            self._state = DetectorState.IDLE

    def _decay_history(self, now_ms: float) -> None:
        """
        When no hand is visible, slowly drop old points so the detector
        naturally returns to an idle state.
        """
        cutoff_ms = now_ms - self.config.history_max_duration_ms
        while self._points and self._points[0].t_ms < cutoff_ms:
            self._points.popleft()

        if not self._points:
            self._state = DetectorState.IDLE

    def _detect_gesture(self, now_ms: float) -> Optional[GestureType]:
        """
        Core swipe classification logic.

        It looks at the earliest and latest tracked points in the recent history
        and checks:
          - Is the horizontal distance large enough?
          - Did the motion happen within an acceptable time window?
          - Is vertical movement small compared to horizontal (to filter out
            waving or up/down motions)?
        If all conditions pass, the function returns the corresponding gesture.
        """
        if len(self._points) < 2:
            return None

        cfg = self.config

        start = self._points[0]
        end = self._points[-1]

        dt = end.t_ms - start.t_ms
        if dt < cfg.min_swipe_duration_ms or dt > cfg.max_swipe_duration_ms:
            return None

        dx = end.x - start.x
        dy = end.y - start.y

        if abs(dx) < cfg.min_swipe_distance_px:
            return None

        # Strongly prefer horizontal motion.
        if abs(dy) / max(abs(dx), 1e-5) > cfg.max_vertical_displacement_ratio:
            return None

        # Decide direction: positive dx means movement towards the right side
        # of the frame, which we map to "NEXT".
        if dx > 0:
            return GestureType.NEXT

        return GestureType.PREVIOUS

    def _draw_trail(self, frame: np.ndarray) -> None:
        """
        Render the current tracking point and its recent motion trail on the frame.

        This visual feedback helps debug what the detector is seeing and how
        it interprets motion over time.
        """
        if not self._points:
            return

        # Draw motion trail.
        points_list = list(self._points)

        for i in range(1, len(points_list)):
            p1 = points_list[i - 1]
            p2 = points_list[i]
            cv2.line(frame, (p1.x, p1.y), (p2.x, p2.y), (0, 255, 255), 2)

        # Draw current tracking point as a distinct circle.
        current = points_list[-1]
        cv2.circle(frame, (current.x, current.y), 8, (0, 0, 255), thickness=-1)

