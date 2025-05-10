class SnakeGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId)
    this.ctx = this.canvas.getContext("2d")
    this.scoreElement = document.getElementById("score")
    this.highScoreElement = document.getElementById("highScore")
    this.directionElement = document.getElementById("direction")

    // Game settings
    this.blockSize = 20
    this.foodSize = 20
    this.width = this.canvas.width
    this.height = this.canvas.height
    this.speed = 150 // ms per move

    // Colors
    this.colors = {
      background: "#1e293b",
      snake: "#8b5cf6",
      snakeHead: "#7c3aed",
      food: "#ef4444",
      text: "#ffffff",
    }

    // Game state
    this.snake = []
    this.food = { x: 0, y: 0 }
    this.direction = "right"
    this.nextDirection = "right"
    this.score = 0
    this.highScore = this.loadHighScore()
    this.gameOver = false
    this.gameLoop = null

    // Initialize
    this.init()
  }

  init() {
    // Initialize snake in the middle
    const centerX = Math.floor(this.width / (2 * this.blockSize)) * this.blockSize
    const centerY = Math.floor(this.height / (2 * this.blockSize)) * this.blockSize

    this.snake = [
      { x: centerX, y: centerY },
      { x: centerX - this.blockSize, y: centerY },
      { x: centerX - 2 * this.blockSize, y: centerY },
    ]

    this.direction = "right"
    this.nextDirection = "right"
    this.score = 0
    this.gameOver = false

    // Place food
    this.placeFood()

    // Update score display
    this.updateScore()
    this.updateDirection()
  }

  start() {
    if (this.gameLoop) return

    this.gameLoop = setInterval(() => {
      this.update()
      this.draw()
    }, this.speed)
  }

  stop() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop)
      this.gameLoop = null
    }
  }

  update() {
    if (this.gameOver) return

    // Update direction
    this.direction = this.nextDirection

    // Calculate new head position
    const head = { ...this.snake[0] }

    switch (this.direction) {
      case "up":
        head.y -= this.blockSize
        break
      case "down":
        head.y += this.blockSize
        break
      case "left":
        head.x -= this.blockSize
        break
      case "right":
        head.x += this.blockSize
        break
    }

    // Wrap around edges
    if (head.x >= this.width) head.x = 0
    if (head.x < 0) head.x = this.width - this.blockSize
    if (head.y >= this.height) head.y = 0
    if (head.y < 0) head.y = this.height - this.blockSize

    // Check collision with self
    for (let i = 0; i < this.snake.length; i++) {
      if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
        this.gameOver = true
        this.stop()
        return
      }
    }

    // Add new head
    this.snake.unshift(head)

    // Check if food eaten
    if (
      head.x < this.food.x + this.foodSize &&
      head.x + this.blockSize > this.food.x &&
      head.y < this.food.y + this.foodSize &&
      head.y + this.blockSize > this.food.y
    ) {
      // Increase score
      this.score++
      this.updateScore()

      // Place new food
      this.placeFood()
    } else {
      // Remove tail if no food eaten
      this.snake.pop()
    }
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = this.colors.background
    this.ctx.fillRect(0, 0, this.width, this.height)

    // Draw snake
    for (let i = 0; i < this.snake.length; i++) {
      this.ctx.fillStyle = i === 0 ? this.colors.snakeHead : this.colors.snake
      this.ctx.fillRect(this.snake[i].x, this.snake[i].y, this.blockSize, this.blockSize)

      // Add a border to make segments more visible
      this.ctx.strokeStyle = "#1e293b"
      this.ctx.lineWidth = 1
      this.ctx.strokeRect(this.snake[i].x, this.snake[i].y, this.blockSize, this.blockSize)
    }

    // Draw food
    this.ctx.fillStyle = this.colors.food
    this.ctx.fillRect(this.food.x, this.food.y, this.foodSize, this.foodSize)

    // Draw game over message
    if (this.gameOver) {
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      this.ctx.fillRect(0, 0, this.width, this.height)

      this.ctx.font = "30px Arial"
      this.ctx.fillStyle = this.colors.text
      this.ctx.textAlign = "center"
      this.ctx.fillText("Game Over", this.width / 2, this.height / 2 - 20)

      this.ctx.font = "20px Arial"
      this.ctx.fillText(`Score: ${this.score}`, this.width / 2, this.height / 2 + 20)
      this.ctx.fillText("Show 3 fingers to restart", this.width / 2, this.height / 2 + 60)
    }
  }

  placeFood() {
    // Calculate grid positions
    const gridWidth = Math.floor(this.width / this.blockSize)
    const gridHeight = Math.floor(this.height / this.blockSize)

    let newX, newY
    let validPosition = false

    // Keep trying until a valid position is found
    while (!validPosition) {
      newX = Math.floor(Math.random() * gridWidth) * this.blockSize
      newY = Math.floor(Math.random() * gridHeight) * this.blockSize

      validPosition = true

      // Check if position overlaps with snake
      for (let i = 0; i < this.snake.length; i++) {
        if (newX === this.snake[i].x && newY === this.snake[i].y) {
          validPosition = false
          break
        }
      }
    }

    this.food = { x: newX, y: newY }
  }

  changeDirection(newDirection) {
    // Prevent 180-degree turns
    if (
      (this.direction === "up" && newDirection === "down") ||
      (this.direction === "down" && newDirection === "up") ||
      (this.direction === "left" && newDirection === "right") ||
      (this.direction === "right" && newDirection === "left")
    ) {
      return
    }

    this.nextDirection = newDirection
    this.updateDirection()
  }

  updateScore() {
    this.scoreElement.textContent = `Score: ${this.score}`

    if (this.score > this.highScore) {
      this.highScore = this.score
      this.saveHighScore()
    }

    this.highScoreElement.textContent = `High Score: ${this.highScore}`
  }

  updateDirection() {
    this.directionElement.textContent = `Direction: ${this.direction.charAt(0).toUpperCase() + this.direction.slice(1)}`
  }

  loadHighScore() {
    const savedHighScore = localStorage.getItem("snakeMasterHighScore")
    return savedHighScore ? Number.parseInt(savedHighScore) : 0
  }

  saveHighScore() {
    localStorage.setItem("snakeMasterHighScore", this.highScore.toString())
    this.highScoreElement.textContent = `High Score: ${this.highScore}`
  }

  restart() {
    this.stop()
    this.init()
    this.start()
  }

  isGameOver() {
    return this.gameOver
  }
}
