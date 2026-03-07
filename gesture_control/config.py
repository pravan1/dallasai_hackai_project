from dataclasses import dataclass
from pathlib import Path


@dataclass
class GestureConfig:
    """
    Configuration values for the swipe gesture detector.

    All distances are in pixels relative to the camera frame.
    All durations are in milliseconds.
    """

    # Filesystem location of the MediaPipe Tasks hand landmarker model.
    # By default this expects a file named "hand_landmarker.task" placed
    # next to this module inside the gesture_control directory.
    model_path: str = str(Path(__file__).with_name("hand_landmarker.task"))

    # Minimum horizontal travel of the tracked hand point to be considered a swipe.
    min_swipe_distance_px: int = 150

    # Minimum and maximum allowed duration for a swipe.
    # Very short movements are likely noise, very long ones feel like slow drifts.
    min_swipe_duration_ms: int = 100
    max_swipe_duration_ms: int = 700

    # Amount of history to keep when tracking hand positions.
    # This should be at least as large as max_swipe_duration_ms.
    history_max_duration_ms: int = 900

    # Cooldown after a gesture is detected before another one can fire.
    cooldown_ms: int = 900

    # Reject movements that are too vertical: if |dy| / |dx| is above this ratio,
    # the motion is considered ambiguous or vertical rather than horizontal.
    max_vertical_displacement_ratio: float = 0.5

    # MediaPipe Tasks detection, presence and tracking confidence thresholds.
    min_detection_confidence: float = 0.7
    min_presence_confidence: float = 0.7
    min_tracking_confidence: float = 0.6

    # Number of points to keep in the visible motion trail.
    trail_max_length: int = 20

    # Whether to mirror the camera image horizontally.
    # When True, moving your hand to your right on screen corresponds to "NEXT".
    mirror_view: bool = True


