// Snake game implementation
let gameCanvas
let gameCtx
let scoreElement
let highScoreElement
let directionElement

// Game settings
const blockSize = 20
const foodSize = 20
const speed = 150 // ms per move
let width, height

// Colors
const colors = {
  background: "#1e293b",
  snake: "#8b5cf6",
  snakeHead: "#7c3aed",
  food: "#ef4444",
  text: "#ffffff",
}

// Game state
let snake = []
let food = { x: 0, y: 0 }
let direction = "right"
let nextDirection = "right"
let score = 0
let highScore = 0
let gameOver = false
let gameLoop = null

function initGame() {
  gameCanvas = document.getElementById("gameCanvas")
  gameCtx = gameCanvas.getContext("2d")
  scoreElement = document.getElementById("score")
  highScoreElement = document.getElementById("highScore")
  directionElement = document.getElementById("direction")

  width = gameCanvas.width
  height = gameCanvas.height

  // Load high score
  highScore = loadHighScore()

  // Initialize snake in the middle
  resetGame()

  // Draw initial state
  draw()

  console.log("Game initialized successfully")
}

function resetGame() {
  const centerX = Math.floor(width / (2 * blockSize)) * blockSize
  const centerY = Math.floor(height / (2 * blockSize)) * blockSize

  snake = [
    { x: centerX, y: centerY },
    { x: centerX - blockSize, y: centerY },
    { x: centerX - 2 * blockSize, y: centerY },
  ]

  direction = "right"
  nextDirection = "right"
  score = 0
  gameOver = false

  // Place food
  placeFood()

  // Update displays
  updateScore()
  updateDirection()
}

function startGame() {
  if (gameLoop) return

  resetGame()
  gameLoop = setInterval(update, speed)
}

function stopGame() {
  if (gameLoop) {
    clearInterval(gameLoop)
    gameLoop = null
  }
}

function update() {
  if (gameOver) return

  // Update direction
  direction = nextDirection

  // Calculate new head position
  const head = { ...snake[0] }

  switch (direction) {
    case "up":
      head.y -= blockSize
      break
    case "down":
      head.y += blockSize
      break
    case "left":
      head.x -= blockSize
      break
    case "right":
      head.x += blockSize
      break
  }

  // Wrap around edges
  if (head.x >= width) head.x = 0
  if (head.x < 0) head.x = width - blockSize
  if (head.y >= height) head.y = 0
  if (head.y < 0) head.y = height - blockSize

  // Check collision with self
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      gameOver = true
      stopGame()
      return
    }
  }

  // Add new head
  snake.unshift(head)

  // Check if food eaten
  if (
    head.x < food.x + foodSize &&
    head.x + blockSize > food.x &&
    head.y < food.y + foodSize &&
    head.y + blockSize > food.y
  ) {
    // Increase score
    score++
    updateScore()

    // Place new food
    placeFood()
  } else {
    // Remove tail if no food eaten
    snake.pop()
  }

  // Draw updated state
  draw()
}

function draw() {
  // Clear canvas
  gameCtx.fillStyle = colors.background
  gameCtx.fillRect(0, 0, width, height)

  // Draw snake
  for (let i = 0; i < snake.length; i++) {
    gameCtx.fillStyle = i === 0 ? colors.snakeHead : colors.snake
    gameCtx.fillRect(snake[i].x, snake[i].y, blockSize, blockSize)

    // Add a border to make segments more visible
    gameCtx.strokeStyle = "#1e293b"
    gameCtx.lineWidth = 1
    gameCtx.strokeRect(snake[i].x, snake[i].y, blockSize, blockSize)
  }

  // Draw food
  gameCtx.fillStyle = colors.food
  gameCtx.fillRect(food.x, food.y, foodSize, foodSize)

  // Draw game over message
  if (gameOver) {
    gameCtx.fillStyle = "rgba(0, 0, 0, 0.7)"
    gameCtx.fillRect(0, 0, width, height)

    gameCtx.font = "30px Arial"
    gameCtx.fillStyle = colors.text
    gameCtx.textAlign = "center"
    gameCtx.fillText("Game Over", width / 2, height / 2 - 20)

    gameCtx.font = "20px Arial"
    gameCtx.fillText(`Score: ${score}`, width / 2, height / 2 + 20)
    gameCtx.fillText("Show 3 fingers to restart", width / 2, height / 2 + 60)
  }
}

function placeFood() {
  // Calculate grid positions
  const gridWidth = Math.floor(width / blockSize)
  const gridHeight = Math.floor(height / blockSize)

  let newX, newY
  let validPosition = false

  // Keep trying until a valid position is found
  while (!validPosition) {
    newX = Math.floor(Math.random() * gridWidth) * blockSize
    newY = Math.floor(Math.random() * gridHeight) * blockSize

    validPosition = true

    // Check if position overlaps with snake
    for (let i = 0; i < snake.length; i++) {
      if (newX === snake[i].x && newY === snake[i].y) {
        validPosition = false
        break
      }
    }
  }

  food = { x: newX, y: newY }
}

function changeDirection(newDirection) {
  // Prevent 180-degree turns
  if (
    (direction === "up" && newDirection === "down") ||
    (direction === "down" && newDirection === "up") ||
    (direction === "left" && newDirection === "right") ||
    (direction === "right" && newDirection === "left")
  ) {
    return
  }

  nextDirection = newDirection
  updateDirection()
}

function updateScore() {
  scoreElement.textContent = `Score: ${score}`

  if (score > highScore) {
    highScore = score
    saveHighScore()
  }

  highScoreElement.textContent = `High Score: ${highScore}`
}

function updateDirection() {
  directionElement.textContent = `Direction: ${direction.charAt(0).toUpperCase() + direction.slice(1)}`
}

function loadHighScore() {
  const savedHighScore = localStorage.getItem("snakeMasterHighScore")
  return savedHighScore ? Number.parseInt(savedHighScore) : 0
}

function saveHighScore() {
  localStorage.setItem("snakeMasterHighScore", highScore.toString())
  highScoreElement.textContent = `High Score: ${highScore}`
}

function isGameOver() {
  return gameOver
}

// Make functions available globally
window.initGame = initGame
window.startGame = startGame
window.resetGame = resetGame
window.changeDirection = changeDirection
window.isGameOver = isGameOver
