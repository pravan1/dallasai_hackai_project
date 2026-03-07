import argparse
import sys
from typing import Optional

import cv2

from .config import GestureConfig
from .detector import GestureDetector, GestureType


def run_camera_loop(config: GestureConfig) -> None:
    """
    Open the webcam, run the gesture detector, and display the annotated feed.

    Press 'q' to exit.
    """

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open default webcam (index 0).", file=sys.stderr)
        print("Make sure a camera is connected and not used by another application.", file=sys.stderr)
        return

    last_gesture: Optional[GestureType] = None

    def on_gesture(gesture: GestureType) -> None:
        """
        Callback invoked whenever a gesture is detected.

        This is the hook you can later connect into your main application
        (e.g., send 'NEXT' / 'PREVIOUS' events over a socket or message bus).
        """
        nonlocal last_gesture
        last_gesture = gesture
        print(gesture.value)

    detector = GestureDetector(config=config, on_gesture=on_gesture)

    window_name = "Gesture Control (press 'q' to quit)"

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Warning: Failed to read frame from webcam.", file=sys.stderr)
                break

            annotated_frame, gesture, _ = detector.process_frame(frame)

            # Optionally overlay the last gesture explicitly for clarity.
            if last_gesture is not None:
                cv2.putText(
                    annotated_frame,
                    f"Last gesture: {last_gesture.value}",
                    (10, 60),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.8,
                    (0, 255, 255),
                    2,
                    cv2.LINE_AA,
                )

            cv2.imshow(window_name, annotated_frame)

            key = cv2.waitKey(1) & 0xFF
            if key == ord("q"):
                break

    except KeyboardInterrupt:
        # Allow clean exit when user hits Ctrl+C in the terminal.
        pass
    finally:
        detector.close()
        cap.release()
        cv2.destroyAllWindows()


def parse_args() -> GestureConfig:
    """
    Parse optional CLI arguments to override key thresholds for experimentation.
    """
    parser = argparse.ArgumentParser(
        description="Webcam-based hand swipe gesture recognizer (NEXT/PREVIOUS)."
    )

    parser.add_argument(
        "--min-distance",
        type=int,
        default=GestureConfig.min_swipe_distance_px,
        help="Minimum horizontal swipe distance in pixels.",
    )
    parser.add_argument(
        "--max-duration",
        type=int,
        default=GestureConfig.max_swipe_duration_ms,
        help="Maximum duration of a swipe in milliseconds.",
    )
    parser.add_argument(
        "--cooldown",
        type=int,
        default=GestureConfig.cooldown_ms,
        help="Cooldown period between gestures in milliseconds.",
    )
    parser.add_argument(
        "--no-mirror",
        action="store_true",
        help="Disable mirror view (do not horizontally flip the camera feed).",
    )

    args = parser.parse_args()

    cfg = GestureConfig()
    cfg.min_swipe_distance_px = args.min_distance
    cfg.max_swipe_duration_ms = args.max_duration
    cfg.cooldown_ms = args.cooldown
    cfg.mirror_view = not args.no_mirror

    return cfg


def main() -> None:
    config = parse_args()
    run_camera_loop(config)


if __name__ == "__main__":
    main()

