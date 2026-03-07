# Gesture-based Navigation (Standalone Module)

This module implements a **standalone, local hand-gesture recognizer** that uses your webcam to detect:

- Swipe **left → right** → prints `NEXT`
- Swipe **right → left** → prints `PREVIOUS`

It is completely isolated from the rest of the project: no frontend, backend, or existing files are modified.

The implementation uses:

- **OpenCV** – webcam access, frame display, drawing overlays
- **MediaPipe Tasks Hand Landmarker** – modern MediaPipe API for hand landmark detection
- A **heuristic swipe detector** – tracks a stable point on the hand across frames and classifies horizontal swipes

> **Note**  
> Newer MediaPipe versions (0.10.30+) removed the legacy `mp.solutions` API.  
> This module therefore uses the **current MediaPipe Tasks API** (Hand Landmarker) instead of `mp.solutions.hands`.

---

## Files

- `gesture_control/config.py` – configuration and tuning parameters
- `gesture_control/detector.py` – core hand tracking and swipe detection logic
- `gesture_control/main.py` – executable entry point using your webcam
- `gesture_control/requirements.txt` – Python dependencies for this module
- `gesture_control/README.md` – this documentation

---

## Setup

1. **Create and activate a virtual environment (recommended)**

   ```bash
   cd /path/to/your/project
   python3 -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. **Download the MediaPipe hand landmarker model**

   Download the official `hand_landmarker.task` model file from the MediaPipe
   examples (for example, from the Hand Landmarker model assets in the
   MediaPipe GitHub repository) and place it in:

   ```text
   gesture_control/hand_landmarker.task
   ```

3. **Install dependencies**

   ```bash
   pip install -r gesture_control/requirements.txt
   ```

4. **Verify that your webcam is free**

   - Close other apps using the camera (Zoom, Teams, browser tabs with camera, etc.).

---

## Running the Gesture Recognizer

From the project root:

```bash
python -m gesture_control.main
```

Behavior:

- Opens a window titled `Gesture Control (press 'q' to quit)`.
- Uses your webcam to detect **one hand** via MediaPipe Tasks Hand Landmarker.
- Tracks an approximate **palm center** over time.
- Draws:
  - A **motion trail** of recent palm positions.
  - A red circle for the **current tracking point**.
  - Status text showing the detector state and **last gesture**.
- When it detects a swipe:
  - Prints `NEXT` or `PREVIOUS` to the terminal.
  - Updates the on-screen status text.
- Press **`q`** to exit.

By default, the view is **mirrored horizontally** (like a selfie camera), so:

- Moving your hand **from your left to your right on screen** → `NEXT`
- Moving your hand **from your right to your left on screen** → `PREVIOUS`

You can disable mirroring with `--no-mirror`:

```bash
python -m gesture_control.main --no-mirror
```

---

## How It Works

### 1. Hand Detection (MediaPipe Tasks Hand Landmarker)

- The detector uses the **MediaPipe Tasks Hand Landmarker** model loaded from
  `gesture_control/hand_landmarker.task`.
- The landmarker is configured with `running_mode=VIDEO`, which expects frames
  to be processed with monotonically increasing timestamps in milliseconds.
- For each frame with a detected hand:
  - It reads all landmarks for the first hand.
  - It computes an approximate **palm center** by averaging all landmark coordinates.

This palm center is treated as a **stable reference point** for motion tracking.

### 2. Motion Tracking Across Frames

- The palm center (x, y) and timestamp are stored as a `TrackedPoint` in a **history buffer**.
- The history contains only points from the most recent time window (`history_max_duration_ms`).
- This buffer forms a short **trajectory** of the hand’s motion.
- When no hand is detected, old points are gradually dropped until the detector returns to an **IDLE** state.

### 3. Swipe Classification (NEXT / PREVIOUS)

The core classification logic compares:

- The **earliest** point in the history window.
- The **latest** point in the history window.

It checks:

- **Horizontal distance** – must be at least `min_swipe_distance_px`.
- **Duration** – time between start and end must be between:
  - `min_swipe_duration_ms` and
  - `max_swipe_duration_ms`.
- **Horizontal vs vertical motion** – the ratio `|dy| / |dx|` must be **below**
  `max_vertical_displacement_ratio` so strongly vertical or diagonal motions are ignored.

If all checks pass:

- If horizontal movement is **to the right** → gesture is `NEXT`.
- If horizontal movement is **to the left** → gesture is `PREVIOUS`.

### 4. Reducing False Positives

The algorithm reduces accidental triggers by:

- Requiring a **minimum swipe distance** so small jitters are ignored.
- Enforcing a **swipe duration window** to ignore both:
  - Very fast, noisy flicks.
  - Very slow drifts.
- Rejecting swipes with large vertical components using `max_vertical_displacement_ratio`.
- Using a **cooldown period** (`cooldown_ms`) after each detection so repeated
  triggers from the same motion are suppressed.
- Tracking only **one hand** at a time (the first one detected).
- Using MediaPipe confidence thresholds (`min_detection_confidence`,
  `min_presence_confidence`, `min_tracking_confidence`) to avoid weak/unstable detections.

---

## Tuning Thresholds

All key thresholds are defined in `gesture_control/config.py` via `GestureConfig`:

- `model_path` – filesystem path to the `hand_landmarker.task` model.
- `min_swipe_distance_px` – minimum horizontal movement in pixels.
- `min_swipe_duration_ms` / `max_swipe_duration_ms` – allowed swipe time window.
- `history_max_duration_ms` – how long to keep recent points in history.
- `cooldown_ms` – delay between gesture detections.
- `max_vertical_displacement_ratio` – tolerance for vertical motion.
- `min_detection_confidence`, `min_presence_confidence`, `min_tracking_confidence` – MediaPipe thresholds for the Hand Landmarker.
- `trail_max_length` – length of the visual motion trail.
- `mirror_view` – whether to mirror the camera image.

You can also override some thresholds at runtime:

```bash
python -m gesture_control.main \
  --min-distance 200 \
  --max-duration 600 \
  --cooldown 1000
```

### Practical Tips

- **Lighting**: Ensure your hand is well lit and not strongly backlit.
- **Background**: A simpler background behind your hand often improves stability.
- **Camera angle**: Point the camera at your upper body with your arm free to move
  mostly horizontally.
- **Distance to camera**: Keep your hand large enough in the frame that MediaPipe
  can reliably track landmarks.

If you see many false positives:

- Increase `min_swipe_distance_px`.
- Decrease `max_vertical_displacement_ratio`.
- Increase `min_swipe_duration_ms`.
- Lengthen `cooldown_ms`.

If gestures are hard to trigger:

- Decrease `min_swipe_distance_px` slightly.
- Increase `max_swipe_duration_ms`.
- Make sure your hand stays within the camera frame for the full swipe.

---

## Integrating with Your App Later

The module is designed so you can plug it into another system by **hooking into the gesture callback**.

In `gesture_control/main.py`, the `GestureDetector` is created with an `on_gesture` callback:

```python
def on_gesture(gesture: GestureType) -> None:
    # This is where you can bridge into your app:
    # - emit a WebSocket event
    # - send a message to your backend
    # - trigger navigation in a local UI
    print(gesture.value)
```

To integrate with your own app, replace the body of this callback with whatever
logic you need (for example, call a function that sends `NEXT` / `PREVIOUS`
events to your learning system). The core gesture recognition code remains
unchanged and self-contained.

# Gesture-based Navigation (Standalone Module)

This module implements a **standalone, local hand-gesture recognizer** that uses your webcam to detect:

- Swipe **left → right** → prints `NEXT`
- Swipe **right → left** → prints `PREVIOUS`

It is completely isolated from the rest of the project: no frontend, backend, or existing files are modified.

The implementation uses:

- **OpenCV** – webcam access, frame display, drawing overlays
- **MediaPipe Hands** – robust hand landmark detection and tracking
- A **heuristic swipe detector** – tracks a stable point on the hand across frames and classifies horizontal swipes

---

## Files

- `gesture_control/config.py` – configuration and tuning parameters
- `gesture_control/detector.py` – core hand tracking and swipe detection logic
- `gesture_control/main.py` – executable entry point using your webcam
- `gesture_control/requirements.txt` – Python dependencies for this module
- `gesture_control/README.md` – this documentation

---

## Setup

1. **Create and activate a virtual environment (recommended)**

   ```bash
   cd /path/to/your/project
   python3 -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. **Install dependencies**

   ```bash
   pip install -r gesture_control/requirements.txt
   ```

3. **Verify that your webcam is free**

   - Close other apps using the camera (Zoom, Teams, browser tabs with camera, etc.).

---

## Running the Gesture Recognizer

From the project root:

```bash
python -m gesture_control.main
```

Behavior:

- Opens a window titled `Gesture Control (press 'q' to quit)`.
- Uses your webcam to detect **one hand**.
- Tracks an approximate **palm center** over time.
- Draws:
  - The MediaPipe hand skeleton.
  - A **motion trail** of recent palm positions.
  - A red circle for the **current tracking point**.
  - Status text showing the detector state and **last gesture**.
- When it detects a swipe:
  - Prints `NEXT` or `PREVIOUS` to the terminal.
  - Updates the on-screen status text.
- Press **`q`** to exit.

By default, the view is **mirrored horizontally** (like a selfie camera), so:

- Moving your hand **from your left to your right on screen** → `NEXT`
- Moving your hand **from your right to your left on screen** → `PREVIOUS`

You can disable mirroring with `--no-mirror`:

```bash
python -m gesture_control.main --no-mirror
```

---

## How It Works

### 1. Hand Detection (MediaPipe Hands)

- The detector uses **MediaPipe Hands** to find 21 hand landmarks in each frame.
- For each frame with a detected hand:
  - It draws the hand skeleton for visualization.
  - It computes an approximate **palm center** by averaging all landmark coordinates.

This palm center is treated as a **stable reference point** for motion tracking.

### 2. Motion Tracking Across Frames

- The palm center (x, y) and timestamp are stored as a `TrackedPoint` in a **history buffer**.
- The history contains only points from the most recent time window (`history_max_duration_ms`).
- This buffer forms a short **trajectory** of the hand’s motion.
- When no hand is detected, old points are gradually dropped until the detector returns to an **IDLE** state.

### 3. Swipe Classification (NEXT / PREVIOUS)

The core classification logic compares:

- The **earliest** point in the history window.
- The **latest** point in the history window.

It checks:

- **Horizontal distance** – must be at least `min_swipe_distance_px`.
- **Duration** – time between start and end must be between:
  - `min_swipe_duration_ms` and
  - `max_swipe_duration_ms`.
- **Horizontal vs vertical motion** – the ratio `|dy| / |dx|` must be **below**
  `max_vertical_displacement_ratio` so strongly vertical or diagonal motions are ignored.

If all checks pass:

- If horizontal movement is **to the right** → gesture is `NEXT`.
- If horizontal movement is **to the left** → gesture is `PREVIOUS`.

### 4. Reducing False Positives

The algorithm reduces accidental triggers by:

- Requiring a **minimum swipe distance** so small jitters are ignored.
- Enforcing a **swipe duration window** to ignore both:
  - Very fast, noisy flicks.
  - Very slow drifts.
- Rejecting swipes with large vertical components using `max_vertical_displacement_ratio`.
- Using a **cooldown period** (`cooldown_ms`) after each detection so repeated
  triggers from the same motion are suppressed.
- Tracking only **one hand** at a time (the first one detected).

---

## Tuning Thresholds

All key thresholds are defined in `gesture_control/config.py` via `GestureConfig`:

- `min_swipe_distance_px` – minimum horizontal movement in pixels.
- `min_swipe_duration_ms` / `max_swipe_duration_ms` – allowed swipe time window.
- `history_max_duration_ms` – how long to keep recent points in history.
- `cooldown_ms` – delay between gesture detections.
- `max_vertical_displacement_ratio` – tolerance for vertical motion.
- `min_detection_confidence`, `min_tracking_confidence` – MediaPipe thresholds.
- `trail_max_length` – length of the visual motion trail.
- `mirror_view` – whether to mirror the camera image.

You can also override some thresholds at runtime:

```bash
python -m gesture_control.main \
  --min-distance 200 \
  --max-duration 600 \
  --cooldown 1000
```

### Practical Tips

- **Lighting**: Ensure your hand is well lit and not strongly backlit.
- **Background**: A simpler background behind your hand often improves stability.
- **Camera angle**: Point the camera at your upper body with your arm free to move
  mostly horizontally.
- **Distance to camera**: Keep your hand large enough in the frame that MediaPipe
  can reliably track landmarks.

If you see many false positives:

- Increase `min_swipe_distance_px`.
- Decrease `max_vertical_displacement_ratio`.
- Increase `min_swipe_duration_ms`.
- Lengthen `cooldown_ms`.

If gestures are hard to trigger:

- Decrease `min_swipe_distance_px` slightly.
- Increase `max_swipe_duration_ms`.
- Make sure your hand stays within the camera frame for the full swipe.

---

## Integrating with Your App Later

The module is designed so you can plug it into another system by **hooking into the gesture callback**.

In `gesture_control/main.py`, the `GestureDetector` is created with an `on_gesture` callback:

```python
def on_gesture(gesture: GestureType) -> None:
    # This is where you can bridge into your app:
    # - emit a WebSocket event
    # - send a message to your backend
    # - trigger navigation in a local UI
    print(gesture.value)
```

To integrate with your own app, replace the body of this callback with whatever
logic you need (for example, call a function that sends `NEXT` / `PREVIOUS`
events to your learning system). The core gesture recognition code remains
unchanged and self-contained.

