"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"

export default function SnakeMasterGame() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Add inline game code instead of loading external files
    const initGame = () => {
      try {
        setLoading(true)

        // Create game elements
        const gameCanvas = document.getElementById("gameCanvas") as HTMLCanvasElement
        const ctx = gameCanvas.getContext("2d")
        const scoreElement = document.getElementById("score")
        const directionElement = document.getElementById("direction")
        const startBtn = document.getElementById("startBtn")
        const restartBtn = document.getElementById("restartBtn")

        if (!ctx || !scoreElement || !directionElement || !startBtn || !restartBtn) {
          throw new Error("Could not find required game elements")
        }

        // Game settings
        const blockSize = 20
        const width = gameCanvas.width
        const height = gameCanvas.height
        const speed = 150 // ms per move

        // Colors
        const colors = {
          background: "#1e293b",
          snake: "#8b5cf6",
          snakeHead: "#7c3aed",
          food: "#ef4444",
          text: "#ffffff","use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { Hands } from "@mediapipe/hands"
import { Camera } from "@mediapipe/camera_utils"

export default function SnakeMasterGame() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initGame = () => {
      try {
        setLoading(true)

        const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement
        const ctx = canvas.getContext("2d")!
        const scoreEl = document.getElementById("score")!
        const dirEl = document.getElementById("direction")!
        const startBtn = document.getElementById("startBtn") as HTMLButtonElement
        const restartBtn = document.getElementById("restartBtn") as HTMLButtonElement

        const blockSize = 20
        const width = canvas.width
        const height = canvas.height
        const speed = 150

        let snake: { x: number; y: number }[] = []
        let food = { x: 0, y: 0 }
        let direction = "right"
        let nextDirection = "right"
        let score = 0
        let gameLoop: any = null
        let gameOver = false

        const colors = {
          bg: "#1e293b",
          snake: "#8b5cf6",
          head: "#7c3aed",
          food: "#ef4444",
        }

        const resetGame = () => {
          const cx = Math.floor(width / (2 * blockSize)) * blockSize
          const cy = Math.floor(height / (2 * blockSize)) * blockSize
          snake = [
            { x: cx, y: cy },
            { x: cx - blockSize, y: cy },
            { x: cx - 2 * blockSize, y: cy },
          ]
          direction = "right"
          nextDirection = "right"
          score = 0
          gameOver = false
          placeFood()
          updateUI()
        }

        const placeFood = () => {
          const gx = Math.floor(Math.random() * (width / blockSize)) * blockSize
          const gy = Math.floor(Math.random() * (height / blockSize)) * blockSize
          food = { x: gx, y: gy }
        }

        const updateUI = () => {
          scoreEl.textContent = `Score: ${score}`
          dirEl.textContent = `Direction: ${direction}`
        }

        const changeDirection = (dir: string) => {
          if (
            (direction === "up" && dir === "down") ||
            (direction === "down" && dir === "up") ||
            (direction === "left" && dir === "right") ||
            (direction === "right" && dir === "left")
          )
            return
          nextDirection = dir
        }

        const update = () => {
          if (gameOver) return
          direction = nextDirection
          const head = { ...snake[0] }

          if (direction === "up") head.y -= blockSize
          if (direction === "down") head.y += blockSize
          if (direction === "left") head.x -= blockSize
          if (direction === "right") head.x += blockSize

          if (head.x < 0) head.x = width - blockSize
          if (head.x >= width) head.x = 0
          if (head.y < 0) head.y = height - blockSize
          if (head.y >= height) head.y = 0

          for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
              gameOver = true
              clearInterval(gameLoop)
              return
            }
          }

          snake.unshift(head)

          if (head.x === food.x && head.y === food.y) {
            score++
            placeFood()
          } else {
            snake.pop()
          }

          draw()
          updateUI()
        }

        const draw = () => {
          ctx.fillStyle = colors.bg
          ctx.fillRect(0, 0, width, height)

          snake.forEach((s, i) => {
            ctx.fillStyle = i === 0 ? colors.head : colors.snake
            ctx.fillRect(s.x, s.y, blockSize, blockSize)
          })

          ctx.fillStyle = colors.food
          ctx.fillRect(food.x, food.y, blockSize, blockSize)
        }

        const startGame = () => {
          if (gameLoop) return
          resetGame()
          gameLoop = setInterval(update, speed)
        }

        startBtn.onclick = () => {
          startGame()
          startBtn.disabled = true
          restartBtn.disabled = false
        }

        restartBtn.onclick = () => {
          clearInterval(gameLoop)
          gameLoop = null
          startGame()
        }

        /* ================= HAND TRACKING ================= */

        const video = document.getElementById("handCam") as HTMLVideoElement

        const hands = new Hands({
          locateFile: (f) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
        })

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.7,
        })

        hands.onResults((res) => {
          if (!res.multiHandLandmarks?.length) return
          const lm = res.multiHandLandmarks[0]

          const tip = lm[8]
          const base = lm[6]
          const mid = lm[10]

          if (tip.y > base.y && tip.y > mid.y) changeDirection("down")
          else if (tip.y < base.y && tip.y < mid.y) changeDirection("up")
          else if (tip.x < base.x) changeDirection("right")
          else if (tip.x > base.x) changeDirection("left")
        })

        const camera = new Camera(video, {
          onFrame: async () => {
            await hands.send({ image: video })
          },
          width: 640,
          height: 480,
        })

        camera.start()

        resetGame()
        draw()
        setLoading(false)
      } catch (e: any) {
        setError(e.message)
        setLoading(false)
      }
    }

    const t = setTimeout(initGame, 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <Link href="/#projects" className="mb-4 text-purple-400 flex gap-2">
        <ArrowLeft /> Back
      </Link>

      <h1 className="text-3xl font-bold text-purple-400 mb-2">Snake Master</h1>
      <p className="text-gray-400 mb-4">Control using hand gestures</p>

      <canvas
        id="gameCanvas"
        width={600}
        height={400}
        className="rounded-lg bg-slate-800"
      />

      <video id="handCam" className="hidden" playsInline />

      <div id="score" className="mt-3">Score: 0</div>
      <div id="direction">Direction: Right</div>

      <div className="mt-4 flex gap-4">
        <button
          id="startBtn"
          className="px-4 py-2 bg-purple-600 rounded"
        >
          Start
        </button>
        <button
          id="restartBtn"
          className="px-4 py-2 bg-gray-600 rounded"
          disabled
        >
          Restart
        </button>
      </div>

      {loading && <p className="mt-4 text-purple-300">Loading…</p>}
      {error && <p className="mt-4 text-red-400">{error}</p>}
    </div>
  )
}

        }

        // Game state
        let snake = []
        let food = { x: 0, y: 0 }
        let direction = "right"
        let nextDirection = "right"
        let score = 0
        let gameOver = false
        let gameLoop = null

        // Initialize snake in the middle
        const resetGame = () => {
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

        // Place food at random position
        const placeFood = () => {
          const gridWidth = Math.floor(width / blockSize)
          const gridHeight = Math.floor(height / blockSize)

          let newX, newY
          let validPosition = false

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

        // Update score display
        const updateScore = () => {
          scoreElement.textContent = `Score: ${score}`
        }

        // Update direction display
        const updateDirection = () => {
          directionElement.textContent = `Direction: ${direction.charAt(0).toUpperCase() + direction.slice(1)}`
        }

        // Change snake direction
        const changeDirection = (newDir) => {
          // Prevent 180-degree turns
          if (
            (direction === "up" && newDir === "down") ||
            (direction === "down" && newDir === "up") ||
            (direction === "left" && newDir === "right") ||
            (direction === "right" && newDir === "left")
          ) {
            return
          }

          nextDirection = newDir
          updateDirection()
        }

        // Game update function
        const update = () => {
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
            head.x < food.x + blockSize &&
            head.x + blockSize > food.x &&
            head.y < food.y + blockSize &&
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

        // Draw game state
        const draw = () => {
          // Clear canvas
          ctx.fillStyle = colors.background
          ctx.fillRect(0, 0, width, height)

          // Draw snake
          for (let i = 0; i < snake.length; i++) {
            ctx.fillStyle = i === 0 ? colors.snakeHead : colors.snake
            ctx.fillRect(snake[i].x, snake[i].y, blockSize, blockSize)

            // Add a border to make segments more visible
            ctx.strokeStyle = "#1e293b"
            ctx.lineWidth = 1
            ctx.strokeRect(snake[i].x, snake[i].y, blockSize, blockSize)
          }

          // Draw food
          ctx.fillStyle = colors.food
          ctx.fillRect(food.x, food.y, blockSize, blockSize)

          // Draw game over message
          if (gameOver) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
            ctx.fillRect(0, 0, width, height)

            ctx.font = "30px Arial"
            ctx.fillStyle = colors.text
            ctx.textAlign = "center"
            ctx.fillText("Game Over", width / 2, height / 2 - 20)

            ctx.font = "20px Arial"
            ctx.fillText(`Score: ${score}`, width / 2, height / 2 + 20)
          }
        }

        // Start game
        const startGame = () => {
          if (gameLoop) return

          resetGame()
          gameLoop = setInterval(update, speed)
        }

        // Stop game
        const stopGame = () => {
          if (gameLoop) {
            clearInterval(gameLoop)
            gameLoop = null
          }
        }

        // Initialize game
        resetGame()
        draw()

        // Event listeners
        startBtn.addEventListener("click", () => {
          startGame()
          startBtn.disabled = true
          restartBtn.disabled = false
        })

        restartBtn.addEventListener("click", () => {
          stopGame()
          resetGame()
          startGame()
        })

        // Keyboard controls
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
              stopGame()
              resetGame()
              startGame()
              break
          }
        })

        // Simulate hand gestures with mouse movement for demo purposes
        gameCanvas.addEventListener("mousemove", (e) => {
          const rect = gameCanvas.getBoundingClientRect()
          const centerX = rect.left + width / 2
          const centerY = rect.top + height / 2

          // Determine direction based on mouse position relative to center
          const dx = e.clientX - centerX
          const dy = e.clientY - centerY

          if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal movement is greater
            if (dx > 0) {
              changeDirection("right")
            } else {
              changeDirection("left")
            }
          } else {
            // Vertical movement is greater
            if (dy > 0) {
              changeDirection("down")
            } else {
              changeDirection("up")
            }
          }
        })

        setLoading(false)
      } catch (err) {
        console.error("Game initialization error:", err)
        setError(err.message || "Failed to initialize game")
        setLoading(false)
      }
    }

    // Initialize the game after a short delay to ensure DOM is ready
    const timer = setTimeout(initGame, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        <div className="flex items-center mb-4">
          <Link href="/#projects" passHref>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-purple-400 hover:text-purple-300"
            >
              <ArrowLeft size={20} />
              <span>Back to Portfolio</span>
            </motion.div>
          </Link>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          {loading && (
            <div className="text-center mb-8">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-purple-300">Loading game...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-300 p-4 rounded-lg mb-8">
              <p className="font-bold mb-2">Error loading game:</p>
              <p>{error}</p>
            </div>
          )}

          <div className={`container ${loading ? "opacity-50" : ""}`}>
            <h1 className="text-3xl font-bold text-center text-purple-400 mb-2">Snake Master</h1>
            <p className="text-center text-gray-400 mb-8">Use arrow keys or mouse movement to control the snake</p>

            <div className="game-container flex flex-col items-center">
              <div className="game-area relative mb-6">
                <canvas id="gameCanvas" width="600" height="400" className="bg-[#1e293b] rounded-lg shadow-lg"></canvas>
                <div id="score" className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded">
                  Score: 0
                </div>
                <div id="direction" className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded">
                  Direction: Right
                </div>
              </div>

              <div className="controls flex gap-4 mb-8">
                <button
                  id="startBtn"
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow"
                >
                  Start Game
                </button>
                <button id="restartBtn" className="px-6 py-2 bg-gray-600 text-white rounded-lg shadow" disabled>
                  Restart
                </button>
              </div>

              <div className="instructions bg-[#1e293b] p-6 rounded-lg max-w-2xl">
                <h2 className="text-xl font-semibold text-purple-400 mb-4 text-center">How to Play</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>
                    Use <strong>arrow keys</strong> to control the snake direction
                  </li>
                  <li>
                    Move your <strong>mouse</strong> over the game area to control direction
                  </li>
                  <li>Eat the red food to grow longer and increase your score</li>
                  <li>Avoid hitting yourself or the game will end</li>
                  <li>
                    Press <strong>R</strong> key to quickly restart the game
                  </li>
                </ul>
                <p className="mt-4 text-center text-gray-400 italic">
                  Note: This is a simplified version. The full game uses hand gestures via webcam.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
