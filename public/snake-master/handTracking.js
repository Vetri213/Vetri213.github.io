// Hand tracking implementation using TensorFlow.js and HandPose
let handposeModel
let video
let handCanvas
let handCtx
let gestureDisplay
let currentDirection = null
let isTracking = false

// Import Handpose (if not already imported via script tag)
import * as handpose from "@tensorflow-models/handpose"

// Finger indices
const fingerTips = [4, 8, 12, 16, 20] // thumb, index, middle, ring, pinky
const fingerBaseKnuckles = [2, 5, 9, 13, 17]
const fingerMiddleKnuckles = [3, 6, 10, 14, 18]

async function initHandTracking() {
  try {
    video = document.getElementById("webcam")
    handCanvas = document.getElementById("handCanvas")
    handCtx = handCanvas.getContext("2d")
    gestureDisplay = document.getElementById("gesture")

    // Load the HandPose model
    handposeModel = await handpose.load()
    console.log("HandPose model loaded")

    // Setup webcam
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: 320,
        height: 240,
      },
    })
    video.srcObject = stream

    return true
  } catch (error) {
    console.error("Error initializing hand tracking:", error)
    alert("Could not initialize hand tracking. Please ensure your browser has camera access.")
    return false
  }
}

function startTracking() {
  if (!handposeModel) {
    console.error("HandPose model not loaded")
    return
  }

  isTracking = true
  trackHands()
}

function stopTracking() {
  isTracking = false
}

async function trackHands() {
  if (!isTracking) return

  try {
    // Detect hands
    const hands = await handposeModel.estimateHands(video)

    // Clear canvas
    handCtx.clearRect(0, 0, handCanvas.width, handCanvas.height)

    if (hands.length > 0) {
      // Get the first hand
      const hand = hands[0]

      // Draw hand landmarks
      drawHand(hand)

      // Detect direction gesture
      detectDirectionGesture(hand)
    } else {
      gestureDisplay.textContent = "Detected Gesture: None"
      // Keep the last direction to prevent jittery controls
    }
  } catch (error) {
    console.error("Error in hand tracking:", error)
  }

  // Continue tracking
  requestAnimationFrame(trackHands)
}

function drawHand(hand) {
  const landmarks = hand.landmarks

  // Draw connections
  handCtx.strokeStyle = "#8b5cf6"
  handCtx.lineWidth = 2

  // Draw palm connections
  handCtx.beginPath()
  for (let i = 0; i < 5; i++) {
    const baseIndex = i === 0 ? 0 : i * 4 + 1
    handCtx.moveTo(landmarks[0][0], landmarks[0][1])
    handCtx.lineTo(landmarks[baseIndex][0], landmarks[baseIndex][1])
  }
  handCtx.stroke()

  // Draw finger connections
  for (let i = 0; i < 5; i++) {
    const baseIndex = i === 0 ? 0 : i * 4 + 1
    const tipIndex = i === 0 ? 4 : i * 4 + 4

    handCtx.beginPath()
    for (let j = baseIndex; j <= tipIndex; j++) {
      if (j === baseIndex) {
        handCtx.moveTo(landmarks[j][0], landmarks[j][1])
      } else {
        handCtx.lineTo(landmarks[j][0], landmarks[j][1])
      }
    }
    handCtx.stroke()
  }

  // Draw landmarks
  for (let i = 0; i < landmarks.length; i++) {
    const [x, y] = landmarks[i]
    handCtx.beginPath()
    handCtx.arc(x, y, 4, 0, 2 * Math.PI)
    handCtx.fillStyle = i === 8 ? "#ff0000" : "#a78bfa" // Highlight index fingertip
    handCtx.fill()
  }
}

function detectDirectionGesture(hand) {
  const landmarks = hand.landmarks

  // Get index finger tip and base positions
  const indexTip = landmarks[8] // Index fingertip
  const indexBase = landmarks[5] // Index finger base

  // Calculate direction based on index finger orientation
  const dx = indexTip[0] - indexBase[0]
  const dy = indexTip[1] - indexBase[1]

  let direction = null

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

  // Count extended fingers for game control (restart/quit)
  const extendedFingers = countExtendedFingers(landmarks)

  if (extendedFingers === 3) {
    gestureDisplay.textContent = "Detected Gesture: Restart (3 fingers)"
    currentDirection = "restart"
  } else if (extendedFingers === 4) {
    gestureDisplay.textContent = "Detected Gesture: Quit (4 fingers)"
    currentDirection = "quit"
  } else if (direction) {
    gestureDisplay.textContent = `Detected Gesture: ${direction.toUpperCase()}`
    currentDirection = direction
  } else {
    gestureDisplay.textContent = "Detected Gesture: None"
    // Keep the last direction
  }
}

function isFingerExtended(landmarks, fingerIndex) {
  const tipIndex = fingerTips[fingerIndex]
  const baseIndex = fingerBaseKnuckles[fingerIndex]
  const middleIndex = fingerMiddleKnuckles[fingerIndex]

  // Special case for thumb
  if (fingerIndex === 0) {
    const thumbTip = landmarks[tipIndex]
    const thumbMcp = landmarks[2] // Metacarpophalangeal joint

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

function countExtendedFingers(landmarks) {
  let count = 0

  for (let i = 0; i < 5; i++) {
    if (isFingerExtended(landmarks, i)) {
      count++
    }
  }

  return count
}

function getDirection() {
  return currentDirection
}

// Make functions available globally
window.initHandTracking = initHandTracking
window.startTracking = startTracking
window.stopTracking = stopTracking
window.getDirection = getDirection
