// Main application file that connects hand tracking with the game
document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM loaded, initializing game...")

  const startBtn = document.getElementById("startBtn")
  const restartBtn = document.getElementById("restartBtn")

  // Initialize game
  initGame()

  // Initialize hand tracker
  const initSuccess = await initHandTracking()

  if (!initSuccess) {
    alert("Failed to initialize hand tracking. Please make sure your browser supports webcam access and try again.")
    return
  }

  // Event listeners
  startBtn.addEventListener("click", () => {
    console.log("Starting game...")
    startGame()
    startTracking()
    startBtn.disabled = true
    restartBtn.disabled = false
  })

  restartBtn.addEventListener("click", () => {
    console.log("Restarting game...")
    resetGame()
    startGame()
  })

  // Keyboard controls (for testing/debugging)
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowUp":
        changeDirection("up")
        break
      case "ArrowDown":
        changeDirection("down")
        break
      case "ArrowLeft":
        changeDirection("left")
        break
      case "ArrowRight":
        changeDirection("right")
        break
      case "r":
        resetGame()
        startGame()
        break
    }
  })

  // Track direction from hand gestures
  function trackDirection() {
    // Get current direction from hand tracker
    const direction = getDirection()

    if (direction) {
      if (direction === "restart" && isGameOver()) {
        resetGame()
        startGame()
      } else if (direction === "quit" && isGameOver()) {
        // Reload page to quit
        window.location.reload()
      } else if (["up", "down", "left", "right"].includes(direction)) {
        changeDirection(direction)
      }
    }

    // Continue tracking
    requestAnimationFrame(trackDirection)
  }

  // Start direction tracking
  trackDirection()

  console.log("Game initialization complete")
})

// Dummy functions to resolve errors. These should be replaced with actual implementations.
function changeDirection(direction) {
  console.warn("changeDirection function is a placeholder. Direction:", direction)
}

function getDirection() {
  console.warn("getDirection function is a placeholder.")
  return null
}

function isGameOver() {
  console.warn("isGameOver function is a placeholder.")
  return false
}
