import * as handpose from "@tensorflow-models/handpose"

class HandTracker {
  constructor() {
    this.video = document.getElementById("webcam")
    this.handCanvas = document.getElementById("handCanvas")
    this.handCtx = this.handCanvas.getContext("2d")
    this.gestureDisplay = document.getElementById("gesture")

    this.handpose = null
    this.currentDirection = null
    this.lastDirection = null
    this.isTracking = false

    // Landmarks for fingertips and knuckles
    this.fingerTips = [4, 8, 12, 16, 20] // thumb, index, middle, ring, pinky
    this.fingerBaseKnuckles = [2, 5, 9, 13, 17] // thumb, index, middle, ring, pinky
    this.fingerMiddleKnuckles = [3, 6, 10, 14, 18] // thumb, index, middle, ring, pinky
  }

  async init() {
    try {
      // Load the HandPose model
      this.handpose = await handpose.load()
      console.log("HandPose model loaded")

      // Setup webcam
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 320,
          height: 240,
        },
      })
      this.video.srcObject = stream

      return true
    } catch (error) {
      console.error("Error initializing hand tracking:", error)
      return false
    }
  }

  async startTracking() {
    if (!this.handpose) {
      console.error("HandPose model not loaded")
      return
    }

    this.isTracking = true
    this.trackHands()
  }

  stopTracking() {
    this.isTracking = false
  }

  async trackHands() {
    if (!this.isTracking) return

    // Detect hands
    const hands = await this.handpose.estimateHands(this.video)

    // Clear canvas
    this.handCtx.clearRect(0, 0, this.handCanvas.width, this.handCanvas.height)

    if (hands.length > 0) {
      // Get the first hand
      const hand = hands[0]

      // Draw hand landmarks
      this.drawHand(hand)

      // Detect direction gesture
      this.detectDirectionGesture(hand)
    } else {
      this.gestureDisplay.textContent = "Detected Gesture: None"
      this.currentDirection = null
    }

    // Continue tracking
    requestAnimationFrame(() => this.trackHands())
  }

  drawHand(hand) {
    const landmarks = hand.landmarks

    // Draw connections
    this.handCtx.strokeStyle = "#8b5cf6"
    this.handCtx.lineWidth = 2

    // Draw palm connections
    this.handCtx.beginPath()
    for (let i = 0; i < 5; i++) {
      const baseIndex = i === 0 ? 0 : i * 4 + 1
      this.handCtx.moveTo(landmarks[0][0], landmarks[0][1])
      this.handCtx.lineTo(landmarks[baseIndex][0], landmarks[baseIndex][1])
    }
    this.handCtx.stroke()

    // Draw finger connections
    for (let i = 0; i < 5; i++) {
      const baseIndex = i === 0 ? 0 : i * 4 + 1
      const tipIndex = i === 0 ? 4 : i * 4 + 4

      this.handCtx.beginPath()
      for (let j = baseIndex; j <= tipIndex; j++) {
        if (j === baseIndex) {
          this.handCtx.moveTo(landmarks[j][0], landmarks[j][1])
        } else {
          this.handCtx.lineTo(landmarks[j][0], landmarks[j][1])
        }
      }
      this.handCtx.stroke()
    }

    // Draw landmarks
    for (let i = 0; i < landmarks.length; i++) {
      const [x, y] = landmarks[i]
      this.handCtx.beginPath()
      this.handCtx.arc(x, y, 4, 0, 2 * Math.PI)
      this.handCtx.fillStyle = i === 8 ? "#ff0000" : "#a78bfa" // Highlight index fingertip
      this.handCtx.fill()
    }
  }

  detectDirectionGesture(hand) {
    const landmarks = hand.landmarks

    // Get index finger tip and base positions
    const indexTip = landmarks[8] // Index fingertip
    const indexBase = landmarks[5] // Index finger base
    const indexMiddle = landmarks[6] // Index finger middle joint
    const indexBottom = landmarks[7] // Index finger bottom joint
    const wrist = landmarks[0] // Wrist

    // Check if index finger is extended (and other fingers are closed)
    const indexExtended = this.isFingerExtended(landmarks, 1) // Index finger
    const otherFingersClosed =
      !this.isFingerExtended(landmarks, 0) && // Thumb
      !this.isFingerExtended(landmarks, 2) && // Middle
      !this.isFingerExtended(landmarks, 3) && // Ring
      !this.isFingerExtended(landmarks, 4) // Pinky

    let direction = null

    if (indexExtended) {
      // Determine direction based on index finger orientation
      const dx = indexTip[0] - indexBase[0]
      const dy = indexTip[1] - indexBase[1]

      // Check if pointing up
      if (dy < -30 && Math.abs(dx) < Math.abs(dy)) {
        direction = "up"
      }
      // Check if pointing down
      else if (dy > 30 && Math.abs(dx) < Math.abs(dy)) {
        direction = "down"
      }
      // Check if pointing left (mirrored in webcam)
      else if (dx > 30 && Math.abs(dx) > Math.abs(dy)) {
        direction = "right"
      }
      // Check if pointing right (mirrored in webcam)
      else if (dx < -30 && Math.abs(dx) > Math.abs(dy)) {
        direction = "left"
      }
    }

    // Count extended fingers for game control (restart/quit)
    const extendedFingers = this.countExtendedFingers(landmarks)

    if (extendedFingers === 3) {
      this.gestureDisplay.textContent = "Detected Gesture: Restart (3 fingers)"
      this.currentDirection = "restart"
    } else if (extendedFingers === 4) {
      this.gestureDisplay.textContent = "Detected Gesture: Quit (4 fingers)"
      this.currentDirection = "quit"
    } else if (direction) {
      this.gestureDisplay.textContent = `Detected Gesture: ${direction.toUpperCase()}`
      this.currentDirection = direction
    } else {
      this.gestureDisplay.textContent = "Detected Gesture: None"
      // Keep the last direction if no new direction is detected
    }
  }

  isFingerExtended(landmarks, fingerIndex) {
    const tipIndex = this.fingerTips[fingerIndex]
    const baseIndex = this.fingerBaseKnuckles[fingerIndex]
    const middleIndex = this.fingerMiddleKnuckles[fingerIndex]

    // Special case for thumb
    if (fingerIndex === 0) {
      const thumbTip = landmarks[tipIndex]
      const thumbIp = landmarks[3] // Interphalangeal joint
      const thumbMcp = landmarks[2] // Metacarpophalangeal joint
      const thumbCmc = landmarks[1] // Carpometacarpal joint

      // Check if thumb is extended to the side
      const dx = thumbTip[0] - thumbMcp[0]
      const dy = thumbTip[1] - thumbMcp[1]

      return Math.sqrt(dx * dx + dy * dy) > 40
    }

    // For other fingers, check if tip is higher than base (in y-coordinate)
    const tip = landmarks[tipIndex]
    const base = landmarks[baseIndex]
    const middle = landmarks[middleIndex]

    return tip[1] < middle[1] && middle[1] < base[1]
  }

  countExtendedFingers(landmarks) {
    let count = 0

    for (let i = 0; i < 5; i++) {
      if (this.isFingerExtended(landmarks, i)) {
        count++
      }
    }

    return count
  }

  getDirection() {
    return this.currentDirection
  }
}
