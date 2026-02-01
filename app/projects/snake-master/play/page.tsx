"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, Camera, CameraOff, Keyboard } from "lucide-react"
import Script from "next/script"

// Hand landmark indices
const TIP_IDS = [4, 8, 12, 16, 20]

type Direction = "up" | "down" | "left" | "right" | null

// Declare globals for TensorFlow.js loaded via CDN
declare global {
  interface Window {
    tf: any
    handPoseDetection: any
  }
}

export default function SnakeMasterPlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const handCanvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number | null>(null)
  const lastMoveTimeRef = useRef<number>(0)
  const detectorRef = useRef<any>(null)
  const animationRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [detectedDirection, setDetectedDirection] = useState<string>("None")
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [controlMode, setControlMode] = useState<"camera" | "keyboard">("keyboard")
  const [scriptsLoaded, setScriptsLoaded] = useState(0)
  
  const snakeRef = useRef([{ x: 10, y: 10 }])
  const directionRef = useRef<{ x: number; y: number }>({ x: 1, y: 0 })
  const foodRef = useRef({ x: 15, y: 15 })
  const gameOverRef = useRef(false)

  const GRID_SIZE = 20
  const CELL_SIZE = 20
  const GAME_SPEED = 150
  const REQUIRED_SCRIPTS = 3

  // Detect direction from hand landmarks - replicating Python logic
  const detectDirection = useCallback((keypoints: any[]): Direction => {
    if (!keypoints || keypoints.length < 21) return null

    // Get key landmarks
    const lm8 = keypoints[8]   // Index tip
    const lm7 = keypoints[7]   // Index DIP
    const lm6 = keypoints[6]   // Index PIP
    const lm5 = keypoints[5]   // Index MCP
    const lm9 = keypoints[9]   // Middle MCP
    const lm13 = keypoints[13] // Ring MCP
    const lm10 = keypoints[10] // Middle PIP
    const lm3 = keypoints[3]   // Thumb IP
    const lm2 = keypoints[2]   // Thumb MCP

    // DOWN: Index finger pointing down
    if (
      lm8.y > lm7.y &&
      lm8.y > lm6.y &&
      lm8.y > lm5.y &&
      lm8.y > lm9.y &&
      lm8.y > lm13.y
    ) {
      return "down"
    }
    
    // UP: Index finger pointing up
    if (
      lm8.y < lm7.y &&
      lm8.y < lm6.y &&
      lm8.y < lm5.y &&
      lm8.y < lm9.y &&
      lm8.y < lm13.y &&
      lm10.y < lm3.y
    ) {
      return "up"
    }
    
    // LEFT: Index finger pointing left (flipped due to mirror)
    if (
      lm8.x < lm10.x &&
      lm8.x < lm7.x &&
      lm8.x < lm6.x &&
      lm8.x < lm5.x
    ) {
      return "left"
    }
    
    // RIGHT: Index finger pointing right (flipped due to mirror)
    if (
      lm8.x > lm2.x &&
      lm8.x > lm7.x &&
      lm8.x > lm6.x &&
      lm8.x > lm5.x
    ) {
      return "right"
    }

    return null
  }, [])

  // Count fingers up for restart detection
  const countFingersUp = useCallback((keypoints: any[]): number => {
    if (!keypoints || keypoints.length < 21) return 0
    
    let count = 0
    
    // Thumb - check x position
    if (keypoints[TIP_IDS[0]].x < keypoints[TIP_IDS[0] - 1].x) {
      count++
    }
    
    // Other fingers - tip should be above PIP joint (lower y value)
    for (let i = 1; i < 5; i++) {
      if (keypoints[TIP_IDS[i]].y < keypoints[TIP_IDS[i] - 2].y) {
        count++
      }
    }
    
    return count
  }, [])

  // Draw hand landmarks
  const drawLandmarks = useCallback((hands: any[], canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    hands.forEach((hand, handIndex) => {
      const keypoints = hand.keypoints
      const color = handIndex === 0 ? "#a855f7" : "#22c55e"
      
      // Draw connections
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4],
        [0, 5], [5, 6], [6, 7], [7, 8],
        [0, 9], [9, 10], [10, 11], [11, 12],
        [0, 13], [13, 14], [14, 15], [15, 16],
        [0, 17], [17, 18], [18, 19], [19, 20],
        [5, 9], [9, 13], [13, 17]
      ]

      ctx.strokeStyle = color
      ctx.lineWidth = 2
      connections.forEach(([start, end]) => {
        if (keypoints[start] && keypoints[end]) {
          ctx.beginPath()
          ctx.moveTo(keypoints[start].x, keypoints[start].y)
          ctx.lineTo(keypoints[end].x, keypoints[end].y)
          ctx.stroke()
        }
      })

      // Draw points
      keypoints.forEach((point: any, idx: number) => {
        ctx.beginPath()
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI)
        ctx.fillStyle = TIP_IDS.includes(idx) ? "#fff" : color
        ctx.fill()
      })
    })
  }, [])

  // Spawn food
  const spawnFood = useCallback(() => {
    let newFood
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      }
    } while (snakeRef.current.some(s => s.x === newFood.x && s.y === newFood.y))
    foodRef.current = newFood
  }, [])

  // Restart game
  const restartGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }]
    directionRef.current = { x: 1, y: 0 }
    setScore(0)
    setGameOver(false)
    gameOverRef.current = false
    spawnFood()
  }, [spawnFood])

  // Handle script load
  const handleScriptLoad = useCallback(() => {
    setScriptsLoaded(prev => prev + 1)
  }, [])

  // Check if all scripts are loaded
  const allScriptsLoaded = scriptsLoaded >= REQUIRED_SCRIPTS

  // Start camera and hand detection
  const startCamera = useCallback(async () => {
    if (typeof window === "undefined") return
    if (!allScriptsLoaded) {
      alert("Please wait for the hand tracking model to load...")
      return
    }

    setCameraLoading(true)

    try {
      const tf = window.tf
      const handPoseDetection = window.handPoseDetection

      if (!tf || !handPoseDetection) {
        throw new Error("TensorFlow.js or hand-pose-detection not loaded")
      }

      // Initialize TensorFlow backend
      await tf.ready()
      await tf.setBackend("webgl")

      // Create detector if not exists
      if (!detectorRef.current) {
        const model = handPoseDetection.SupportedModels.MediaPipeHands
        const detector = await handPoseDetection.createDetector(model, {
          runtime: "tfjs",
          modelType: "full",
          maxHands: 2,
        })
        detectorRef.current = detector
      }

      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" }
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setCameraEnabled(true)
      setControlMode("camera")

      // Start detection loop
      const detectHands = async () => {
        if (!detectorRef.current || !videoRef.current || !streamRef.current) {
          animationRef.current = requestAnimationFrame(detectHands)
          return
        }

        try {
          const hands = await detectorRef.current.estimateHands(videoRef.current, {
            flipHorizontal: true
          })

          if (hands && hands.length > 0) {
            // First hand controls direction
            const direction = detectDirection(hands[0].keypoints)
            
            if (direction) {
              setDetectedDirection(direction.toUpperCase())
              
              switch (direction) {
                case "up":
                  if (directionRef.current.y !== 1) directionRef.current = { x: 0, y: -1 }
                  break
                case "down":
                  if (directionRef.current.y !== -1) directionRef.current = { x: 0, y: 1 }
                  break
                case "left":
                  if (directionRef.current.x !== 1) directionRef.current = { x: -1, y: 0 }
                  break
                case "right":
                  if (directionRef.current.x !== -1) directionRef.current = { x: 1, y: 0 }
                  break
              }
            } else {
              setDetectedDirection("Detecting...")
            }

            // Second hand for restart (3 fingers)
            if (hands.length > 1 && gameOverRef.current) {
              const fingers = countFingersUp(hands[1].keypoints)
              if (fingers === 3) {
                restartGame()
              }
            }

            // Draw landmarks
            if (handCanvasRef.current) {
              drawLandmarks(hands, handCanvasRef.current)
            }
          } else {
            setDetectedDirection("No hand detected")
            if (handCanvasRef.current) {
              const ctx = handCanvasRef.current.getContext("2d")
              if (ctx) ctx.clearRect(0, 0, handCanvasRef.current.width, handCanvasRef.current.height)
            }
          }
        } catch (e) {
          // Silently continue on detection errors
        }

        animationRef.current = requestAnimationFrame(detectHands)
      }

      animationRef.current = requestAnimationFrame(detectHands)
    } catch (error) {
      console.error("Failed to start camera:", error)
      alert("Failed to access camera. Please check permissions.")
    } finally {
      setCameraLoading(false)
    }
  }, [allScriptsLoaded, detectDirection, countFingersUp, drawLandmarks, restartGame])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setCameraEnabled(false)
    setControlMode("keyboard")
    setDetectedDirection("None")
  }, [])

  // Toggle camera
  const toggleCamera = useCallback(() => {
    if (cameraEnabled) {
      stopCamera()
    } else {
      startCamera()
    }
  }, [cameraEnabled, startCamera, stopCamera])

  // Start game
  const startGame = useCallback(() => {
    setGameStarted(true)
    restartGame()
  }, [restartGame])

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const gameLoop = (timestamp: number) => {
      if (timestamp - lastMoveTimeRef.current >= GAME_SPEED) {
        lastMoveTimeRef.current = timestamp

        const head = snakeRef.current[0]
        const newHead = {
          x: head.x + directionRef.current.x,
          y: head.y + directionRef.current.y
        }

        // Wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setGameOver(true)
          gameOverRef.current = true
          if (score > highScore) {
            setHighScore(score)
            localStorage.setItem("snakeHighScore", score.toString())
          }
          return
        }

        // Self collision
        if (snakeRef.current.some(s => s.x === newHead.x && s.y === newHead.y)) {
          setGameOver(true)
          gameOverRef.current = true
          if (score > highScore) {
            setHighScore(score)
            localStorage.setItem("snakeHighScore", score.toString())
          }
          return
        }

        snakeRef.current.unshift(newHead)

        // Food collision
        if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
          setScore(prev => prev + 10)
          spawnFood()
        } else {
          snakeRef.current.pop()
        }
      }

      // Draw game
      ctx.fillStyle = "#0a0a0a"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Grid
      ctx.strokeStyle = "rgba(139, 92, 246, 0.1)"
      ctx.lineWidth = 1
      for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath()
        ctx.moveTo(i * CELL_SIZE, 0)
        ctx.lineTo(i * CELL_SIZE, canvas.height)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, i * CELL_SIZE)
        ctx.lineTo(canvas.width, i * CELL_SIZE)
        ctx.stroke()
      }

      // Food
      ctx.fillStyle = "#ef4444"
      ctx.shadowColor = "#ef4444"
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.arc(
        foodRef.current.x * CELL_SIZE + CELL_SIZE / 2,
        foodRef.current.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 2,
        0,
        Math.PI * 2
      )
      ctx.fill()
      ctx.shadowBlur = 0

      // Snake
      snakeRef.current.forEach((segment, index) => {
        const gradient = ctx.createRadialGradient(
          segment.x * CELL_SIZE + CELL_SIZE / 2,
          segment.y * CELL_SIZE + CELL_SIZE / 2,
          0,
          segment.x * CELL_SIZE + CELL_SIZE / 2,
          segment.y * CELL_SIZE + CELL_SIZE / 2,
          CELL_SIZE / 2
        )
        if (index === 0) {
          gradient.addColorStop(0, "#a855f7")
          gradient.addColorStop(1, "#7c3aed")
        } else {
          gradient.addColorStop(0, "#8b5cf6")
          gradient.addColorStop(1, "#6d28d9")
        }
        ctx.fillStyle = gradient
        ctx.fillRect(
          segment.x * CELL_SIZE + 1,
          segment.y * CELL_SIZE + 1,
          CELL_SIZE - 2,
          CELL_SIZE - 2
        )
      })

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameStarted, gameOver, score, highScore, spawnFood])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted) return

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          if (directionRef.current.y !== 1) directionRef.current = { x: 0, y: -1 }
          break
        case "ArrowDown":
        case "s":
        case "S":
          if (directionRef.current.y !== -1) directionRef.current = { x: 0, y: 1 }
          break
        case "ArrowLeft":
        case "a":
        case "A":
          if (directionRef.current.x !== 1) directionRef.current = { x: -1, y: 0 }
          break
        case "ArrowRight":
        case "d":
        case "D":
          if (directionRef.current.x !== -1) directionRef.current = { x: 1, y: 0 }
          break
        case " ":
          if (gameOver) restartGame()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [gameStarted, gameOver, restartGame])

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem("snakeHighScore")
    if (saved) setHighScore(parseInt(saved))
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      stopCamera()
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [stopCamera])

  return (
    <>
      {/* Load TensorFlow.js and hand-pose-detection via CDN */}
      <Script
        src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core@4.17.0/dist/tf-core.min.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl@4.17.0/dist/tf-backend-webgl.min.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/@tensorflow-models/hand-pose-detection@2.0.1/dist/hand-pose-detection.min.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />

      <div className="min-h-screen bg-black text-white">
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/#projects" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
              <span>Back to Portfolio</span>
            </Link>
            <h1 className="text-xl font-bold text-purple-400">Snake Master</h1>
          </div>
        </header>

        <main className="pt-24 pb-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
              {/* Game Area */}
              <div className="flex flex-col items-center">
                <div className="mb-4 flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Score</p>
                    <p className="text-2xl font-bold text-purple-400">{score}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">High Score</p>
                    <p className="text-2xl font-bold text-yellow-400">{highScore}</p>
                  </div>
                </div>

                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={GRID_SIZE * CELL_SIZE}
                    height={GRID_SIZE * CELL_SIZE}
                    className="border-2 border-purple-500/30 rounded-lg"
                  />

                  {!gameStarted && (
                    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center rounded-lg">
                      <h2 className="text-3xl font-bold text-purple-400 mb-4">Snake Master</h2>
                      <p className="text-gray-400 mb-6 text-center max-w-xs">
                        Control the snake using hand gestures or keyboard arrows
                      </p>
                      <button
                        onClick={startGame}
                        className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
                      >
                        Start Game
                      </button>
                    </div>
                  )}

                  {gameOver && (
                    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center rounded-lg">
                      <h2 className="text-3xl font-bold text-red-400 mb-2">Game Over</h2>
                      <p className="text-xl text-gray-400 mb-4">Score: {score}</p>
                      {score === highScore && score > 0 && (
                        <p className="text-yellow-400 mb-4">New High Score!</p>
                      )}
                      <p className="text-gray-500 mb-4 text-sm">
                        {controlMode === "camera" ? "Show 3 fingers with second hand to restart" : "Press SPACE to restart"}
                      </p>
                      <button
                        onClick={restartGame}
                        className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
                      >
                        Play Again
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 text-center text-gray-500 text-sm">
                  <p>
                    {controlMode === "camera"
                      ? "Point your index finger to control direction"
                      : "Use Arrow Keys or WASD to move"}
                  </p>
                </div>
              </div>

              {/* Camera & Controls Panel */}
              <div className="flex flex-col gap-4 w-full lg:w-auto">
                {/* Control Mode Toggle */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Control Mode</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (cameraEnabled) stopCamera()
                        setControlMode("keyboard")
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        controlMode === "keyboard"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      }`}
                    >
                      <Keyboard size={18} />
                      <span>Keyboard</span>
                    </button>
                    <button
                      onClick={toggleCamera}
                      disabled={cameraLoading || !allScriptsLoaded}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        controlMode === "camera"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      } ${(cameraLoading || !allScriptsLoaded) ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {cameraEnabled ? <CameraOff size={18} /> : <Camera size={18} />}
                      <span>{cameraLoading ? "Loading..." : !allScriptsLoaded ? "Loading Model..." : "Camera"}</span>
                    </button>
                  </div>
                </div>

                {/* Camera Feed */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Camera Feed</h3>
                  <div className="relative w-80 h-60 bg-gray-900 rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      width={320}
                      height={240}
                      autoPlay
                      playsInline
                      muted
                      className={`absolute inset-0 w-full h-full object-cover transform scale-x-[-1] ${
                        cameraEnabled ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <canvas
                      ref={handCanvasRef}
                      width={320}
                      height={240}
                      className="absolute inset-0 w-full h-full transform scale-x-[-1]"
                    />
                    {!cameraEnabled && (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <CameraOff size={48} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Camera disabled</p>
                          {!allScriptsLoaded && (
                            <p className="text-xs text-purple-400 mt-2">Loading hand tracking model...</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Detection Status */}
                  <div className="mt-3 text-center">
                    <p className="text-xs text-gray-500">Detected Direction</p>
                    <p className={`text-lg font-bold ${
                      detectedDirection === "None" || detectedDirection === "No hand detected" || detectedDirection === "Detecting..."
                        ? "text-gray-500"
                        : "text-purple-400"
                    }`}>
                      {detectedDirection}
                    </p>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Hand Gesture Controls</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400">Point Up</span>
                      <span>Move Up</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400">Point Down</span>
                      <span>Move Down</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400">Point Left</span>
                      <span>Move Left</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400">Point Right</span>
                      <span>Move Right</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-gray-500">
                    <p><span className="text-green-400">Second Hand:</span> Show 3 fingers to restart after game over</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
