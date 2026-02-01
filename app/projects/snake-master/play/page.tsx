"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"

export default function SnakeMasterGame() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initGame = () => {
      try {
        setLoading(true)

        const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement
        const ctx = canvas?.getContext("2d")
        const scoreEl = document.getElementById("score")
        const dirEl = document.getElementById("direction")
        const startBtn = document.getElementById("startBtn") as HTMLButtonElement
        const restartBtn = document.getElementById("restartBtn") as HTMLButtonElement

        if (!ctx || !scoreEl || !dirEl || !startBtn || !restartBtn) {
          throw new Error("Could not find required game elements")
        }

        const blockSize = 20
        const width = canvas.width
        const height = canvas.height
        const speed = 150

        let snake: { x: number; y: number }[] = []
        let food = { x: 0, y: 0 }
        let direction = "right"
        let nextDirection = "right"
        let score = 0
        let gameLoop: ReturnType<typeof setInterval> | null = null
        let gameOver = false

        const colors = {
          bg: "#1e293b",
          snake: "#8b5cf6",
          head: "#7c3aed",
          food: "#ef4444",
          text: "#ffffff",
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
          const gw = Math.floor(width / blockSize)
          const gh = Math.floor(height / blockSize)
          let valid = false
          let nx = 0
          let ny = 0

          while (!valid) {
            nx = Math.floor(Math.random() * gw) * blockSize
            ny = Math.floor(Math.random() * gh) * blockSize
            valid = !snake.some((s) => s.x === nx && s.y === ny)
          }
          food = { x: nx, y: ny }
        }

        const updateUI = () => {
          scoreEl.textContent = `Score: ${score}`
          dirEl.textContent = `Direction: ${direction.charAt(0).toUpperCase() + direction.slice(1)}`
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
              if (gameLoop) clearInterval(gameLoop)
              draw()
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
            ctx.strokeStyle = "#1e293b"
            ctx.lineWidth = 1
            ctx.strokeRect(s.x, s.y, blockSize, blockSize)
          })

          ctx.fillStyle = colors.food
          ctx.fillRect(food.x, food.y, blockSize, blockSize)

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

        const startGame = () => {
          if (gameLoop) return
          resetGame()
          gameLoop = setInterval(update, speed)
        }

        const stopGame = () => {
          if (gameLoop) {
            clearInterval(gameLoop)
            gameLoop = null
          }
        }

        startBtn.onclick = () => {
          startGame()
          startBtn.disabled = true
          restartBtn.disabled = false
        }

        restartBtn.onclick = () => {
          stopGame()
          resetGame()
          startGame()
        }

        document.addEventListener("keydown", (e) => {
          if (e.key === "ArrowUp") changeDirection("up")
          if (e.key === "ArrowDown") changeDirection("down")
          if (e.key === "ArrowLeft") changeDirection("left")
          if (e.key === "ArrowRight") changeDirection("right")
          if (e.key === "r") {
            stopGame()
            resetGame()
            startGame()
          }
        })

        canvas.addEventListener("mousemove", (e) => {
          const rect = canvas.getBoundingClientRect()
          const centerX = rect.left + width / 2
          const centerY = rect.top + height / 2
          const dx = e.clientX - centerX
          const dy = e.clientY - centerY

          if (Math.abs(dx) > Math.abs(dy)) {
            changeDirection(dx > 0 ? "right" : "left")
          } else {
            changeDirection(dy > 0 ? "down" : "up")
          }
        })

        resetGame()
        draw()
        setLoading(false)
      } catch (err: any) {
        console.error("Game initialization error:", err)
        setError(err.message || "Failed to initialize game")
        setLoading(false)
      }
    }

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

          <div className={loading ? "opacity-50" : ""}>
            <h1 className="text-3xl font-bold text-center text-purple-400 mb-2">Snake Master</h1>
            <p className="text-center text-gray-400 mb-8">Use arrow keys or mouse movement to control the snake</p>

            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                <canvas id="gameCanvas" width="600" height="400" className="bg-[#1e293b] rounded-lg shadow-lg"></canvas>
                <div id="score" className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded">
                  Score: 0
                </div>
                <div id="direction" className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded">
                  Direction: Right
                </div>
              </div>

              <div className="flex gap-4 mb-8">
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

              <div className="bg-[#1e293b] p-6 rounded-lg max-w-2xl">
                <h2 className="text-xl font-semibold text-purple-400 mb-4 text-center">How to Play</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Use <strong>arrow keys</strong> to control the snake direction</li>
                  <li>Move your <strong>mouse</strong> over the game area to control direction</li>
                  <li>Eat the red food to grow longer and increase your score</li>
                  <li>Avoid hitting yourself or the game will end</li>
                  <li>Press <strong>R</strong> key to quickly restart the game</li>
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
