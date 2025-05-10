# How Hand Tracking Works in Snake Master

The Snake Master game uses computer vision to track your hand movements and convert them into game controls. Here's how it works:

## Technology Stack

1. **OpenCV** - Captures video from your webcam and processes the frames
2. **MediaPipe** - Google's framework for building multimodal machine learning pipelines
3. **Hand Landmark Detection** - Identifies 21 key points on your hand

## Hand Detection Process

1. **Capture Frame**: The webcam captures a video frame
2. **Convert to RGB**: The frame is converted from BGR to RGB format for MediaPipe
3. **Hand Detection**: MediaPipe detects hands in the frame
4. **Landmark Extraction**: 21 landmarks are identified on each detected hand
5. **Gesture Recognition**: The positions of these landmarks are analyzed to determine the gesture

## Gesture Recognition Logic

The game recognizes four main gestures:

### Up Gesture
- Index finger is pointing up
- Index finger tip is higher than all other finger joints

### Down Gesture
- Index finger is pointing down
- Index finger tip is lower than all other finger joints

### Left Gesture
- Index finger is pointing left
- Index finger tip is to the left of all other finger joints

### Right Gesture
- Index finger is pointing right
- Index finger tip is to the right of all other finger joints

## Additional Controls

The game also recognizes finger counting gestures for menu navigation:
- 3 fingers up: Retry game
- 4 fingers up: Quit game

## Implementation Details

The hand tracking is implemented in two main modules:

1. **HandTrackingModule.py**: A wrapper around MediaPipe's hand tracking functionality
2. **direction.py**: Interprets the hand landmarks to determine direction

This approach allows for intuitive control of the snake without using a keyboard!
