import { HandTracker } from "./hand-tracker.js"
import { SnakeGame } from "./snake-game.js"

document.addEventListener("DOMContentLoaded", async () => {
  const startBtn = document.getElementById("startBtn")
  const restartBtn = document.getElementById("restartBtn")

  // Initialize hand tracker
  const handTracker = new HandTracker()
  const initSuccess = await handTracker.init()

  if (!initSuccess) {
    alert("Failed to initialize hand tracking. Please make sure your browser supports webcam access and try again.")
    return
  }

  // Initialize game
  const game = new SnakeGame("gameCanvas")

  // Event listeners
  startBtn.addEventListener("click", () => {
    startGame()
  })

  restartBtn.addEventListener("click", () => {
    game.restart()
  })

  // Keyboard controls (for testing)
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowUp":
        game.changeDirection("up")
        break
      case "ArrowDown":
        game.changeDirection("down")
        break
      case "ArrowLeft":
        game.changeDirection("left")
        break
      case "ArrowRight":
        game.changeDirection("right")
        break
      case "r":
        game.restart()
        break
    }
  })

  function startGame() {
    // Start hand tracking
    handTracker.startTracking()

    // Start game
    game.start()

    // Update button states
    startBtn.disabled = true
    restartBtn.disabled = false

    // Start direction tracking
    trackDirection()
  }

  function trackDirection() {
    // Get current direction from hand tracker
    const direction = handTracker.getDirection()

    if (direction) {
      if (direction === "restart" && game.isGameOver()) {
        game.restart()
      } else if (direction === "quit" && game.isGameOver()) {
        // Reload page to quit
        window.location.reload()
      } else if (["up", "down", "left", "right"].includes(direction)) {
        game.changeDirection(direction)
      }
    }

    // Continue tracking
    requestAnimationFrame(trackDirection)
  }
})
