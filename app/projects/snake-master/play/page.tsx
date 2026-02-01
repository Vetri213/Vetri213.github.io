"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, Camera, CameraOff, Keyboard, Loader2 } from "lucide-react"

// Hand landmark indices for fingertips
const TIP_IDS = [4, 8, 12, 16, 20]

type Direction = "up" | "down" | "left" | "right" | null

// MediaPipe types
interface Landmark {
  x: number
  y: number
  z: number
}

interface HandLandmarks {
  landmarks: Landmark[][]
}

declare global {
  interface Window {
    FilesetResolver: any
    HandLandmarker: any
  }
}

export default function SnakeMasterPlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const handCanvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number | null>(null)
  const lastMoveTimeRef = useRef<number>(0)
  const handLandmarkerRef = useRef<any>(null)
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
  const [modelLoading, setModelLoading] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  const snakeRef = useRef([{ x: 10, y: 10 }])
  const directionRef = useRef<{ x: number; y: number }>({ x: 1, y: 0 })
  const foodRef = useRef({ x: 15, y: 15 })
  const gameOverRef = useRef(false)

  const GRID_SIZE = 20
  const CELL_SIZE = 20
  const GAME_SPEED = 150

  // Detect direction from hand landmarks - replicating Python logic exactly
  const detectDirection = useCallback((landmarks: Landmark[]): Direction => {
    if (!landmarks || landmarks.length < 21) return null

    // Scale landmarks to pixel coordinates for comparison (using 320x240 video)
    const scale = (lm: Landmark) => ({
      x: lm.x * 320,
      y: lm.y * 240
    })

    const lm8 = scale(landmarks[8])   // Index tip
    const lm7 = scale(landmarks[7])   // Index DIP
    const lm6 = scale(landmarks[6])   // Index PIP
    const lm5 = scale(landmarks[5])   // Index MCP
    const lm9 = scale(landmarks[9])   // Middle MCP
    const lm13 = scale(landmarks[13]) // Ring MCP
    const lm10 = scale(landmarks[10]) // Middle PIP
    const lm3 = scale(landmarks[3])   // Thumb IP
    const lm2 = scale(landmarks[2])   // Thumb MCP

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
    
    // LEFT: Index finger pointing left (camera is mirrored)
    if (
      lm8.x < lm10.x &&
      lm8.x < lm7.x &&
      lm8.x < lm6.x &&
      lm8.x < lm5.x
    ) {
      return "left"
    }
    
    // RIGHT: Index finger pointing right (camera is mirrored)
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
  const countFingersUp = useCallback((landmarks: Landmark[]): number => {
    if (!landmarks || landmarks.length < 21) return 0
    
    let count = 0
    
    // Thumb - check if thumb tip is to the left of thumb IP (for right hand)
    // Note: x values are normalized 0-1, with 0 being left of image
    if (landmarks[TIP_IDS[0]].x < landmarks[TIP_IDS[0] - 1].x) {
      count++
    }
    
    // Other fingers - tip should be above PIP joint (lower y value = higher on screen)
    for (let i = 1; i < 5; i++) {
      if (landmarks[TIP_IDS[i]].y < landmarks[TIP_IDS[i] - 2].y) {
        count++
      }
    }
    
    return count
  }, [])

  // Draw hand landmarks
  const drawLandmarks = useCallback((landmarksArray: Landmark[][], canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    landmarksArray.forEach((landmarks, handIndex) => {
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
        const p1 = landmarks[start]
        const p2 = landmarks[end]
        if (p1 && p2) {
          ctx.beginPath()
          ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height)
          ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height)
          ctx.stroke()
        }
      })

      // Draw points
      landmarks.forEach((point, idx) => {
        ctx.beginPath()
        ctx.arc(point.x * canvas.width, point.y * canvas.height, 4, 0, 2 * Math.PI)
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

  // Load MediaPipe Hand Landmarker
  const loadModel = useCallback(async () => {
    if (modelLoaded || modelLoading) return
    
    setModelLoading(true)
    setErrorMessage(null)

    try {
      // Dynamically load the MediaPipe vision tasks script
      const script = document.createElement("script")
      script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/vision_bundle.min.js"
      script.crossOrigin = "anonymous"
      
      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve()
        script.onerror = () => reject(new Error("Failed to load MediaPipe"))
        document.head.appendChild(script)
      })

      // Wait for globals to be available
      await new Promise(resolve => setTimeout(resolve, 500))

      const { FilesetResolver, HandLandmarker } = window as any

      if (!FilesetResolver || !HandLandmarker) {
        throw new Error("MediaPipe not properly loaded")
      }

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
      )

      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 2
      })

      handLandmarkerRef.current = handLandmarker
      setModelLoaded(true)
    } catch (error) {
      console.error("Failed to load model:", error)
      setErrorMessage("Failed to load hand tracking model. Try refreshing the page.")
    } finally {
      setModelLoading(false)
    }
  }, [modelLoaded, modelLoading])

  // Start camera and hand detection
  const startCamera = useCallback(async () => {
    if (!modelLoaded) {
      await loadModel()
      if (!handLandmarkerRef.current) return
    }

    setCameraLoading(true)
    setErrorMessage(null)

    try {
      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" }
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        // Wait for video to be ready
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play()
              resolve()
            }
          }
        })
      }

      setCameraEnabled(true)
      setControlMode("camera")

      // Start detection loop
      let lastVideoTime = -1

      const detectHands = () => {
        if (!handLandmarkerRef.current || !videoRef.current || !streamRef.current) {
          animationRef.current = requestAnimationFrame(detectHands)
          return
        }

        const video = videoRef.current
        
        if (video.currentTime !== lastVideoTime && video.readyState >= 2) {
          lastVideoTime = video.currentTime
          
          try {
            const results = handLandmarkerRef.current.detectForVideo(video, performance.now())

            if (results.landmarks && results.landmarks.length > 0) {
              // First hand controls direction
              const direction = detectDirection(results.landmarks[0])
              
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
              if (results.landmarks.length > 1 && gameOverRef.current) {
                const fingers = countFingersUp(results.landmarks[1])
                if (fingers === 3) {
                  restartGame()
                }
              }

              // Draw landmarks
              if (handCanvasRef.current) {
                drawLandmarks(results.landmarks, handCanvasRef.current)
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
        }

        animationRef.current = requestAnimationFrame(detectHands)
      }

      animationRef.current = requestAnimationFrame(detectHands)
    } catch (error: any) {
      console.error("Failed to start camera:", error)
      if (error.name === "NotAllowedError") {
        setErrorMessage("Camera access denied. Please allow camera access in your browser settings and refresh.")
      } else if (error.name === "NotFoundError") {
        setErrorMessage("No camera found. Please connect a camera and refresh.")
      } else {
        setErrorMessage("Failed to access camera. Please check permissions and refresh.")
      }
    } finally {
      setCameraLoading(false)
    }
  }, [modelLoaded, loadModel, detectDirection, countFingersUp, drawLandmarks, restartGame])

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
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-center">
              {errorMessage}
            </div>
          )}

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

            {/* Controls Panel */}
            <div className="w-full lg:w-80 space-y-6">
              {/* Control Mode */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-purple-400">Control Mode</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      stopCamera()
                      setControlMode("keyboard")
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors ${
                      controlMode === "keyboard"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    <Keyboard size={18} />
                    Keyboard
                  </button>
                  <button
                    onClick={toggleCamera}
                    disabled={cameraLoading || modelLoading}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors ${
                      controlMode === "camera"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {cameraLoading || modelLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : cameraEnabled ? (
                      <CameraOff size={18} />
                    ) : (
                      <Camera size={18} />
                    )}
                    {cameraLoading ? "Starting..." : modelLoading ? "Loading..." : "Camera"}
                  </button>
                </div>
              </div>

              {/* Camera Preview */}
              {controlMode === "camera" && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 text-purple-400">Camera Feed</h3>
                  <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                    />
                    <canvas
                      ref={handCanvasRef}
                      width={320}
                      height={240}
                      className="absolute inset-0 w-full h-full transform scale-x-[-1]"
                    />
                    {!cameraEnabled && (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                        <p>{cameraLoading ? "Starting camera..." : "Camera off"}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-sm text-gray-400">Detected Direction:</p>
                    <p className="text-lg font-bold text-purple-400">{detectedDirection}</p>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-purple-400">How to Play</h3>
                <div className="space-y-3 text-sm text-gray-400">
                  <div>
                    <p className="font-semibold text-white mb-1">Keyboard Mode:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Use Arrow Keys or WASD to move</li>
                      <li>Press SPACE to restart after game over</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-white mb-1">Camera Mode:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Point your index finger to control direction</li>
                      <li>Show 3 fingers with second hand to restart</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Gesture Guide */}
              {controlMode === "camera" && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 text-purple-400">Gesture Guide</h3>
                  <div className="grid grid-cols-2 gap-3 text-center text-sm">
                    <div className="bg-gray-800/50 p-3 rounded-lg">
                      <div className="text-2xl mb-1">Up</div>
                      <p className="text-gray-500">Point index finger up</p>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded-lg">
                      <div className="text-2xl mb-1">Down</div>
                      <p className="text-gray-500">Point index finger down</p>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded-lg">
                      <div className="text-2xl mb-1">Left</div>
                      <p className="text-gray-500">Point index finger left</p>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded-lg">
                      <div className="text-2xl mb-1">Right</div>
                      <p className="text-gray-500">Point index finger right</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
