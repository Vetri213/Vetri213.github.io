"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, Camera, CameraOff, Gamepad2 } from "lucide-react"

// MediaPipe Hand Landmark indices (same as Python)
const TIP_IDS = [4, 8, 12, 16, 20]

type Direction = "up" | "down" | "left" | "right" | null
type GameAction = "quit" | "continue" | "exit" | null

interface HandPose {
  direction: Direction
  action: GameAction
}

export default function SnakeMasterPlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const handCanvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number | null>(null)
  const lastMoveTimeRef = useRef<number>(0)
  
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [detectedPose, setDetectedPose] = useState<string>("None")
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [controlMode, setControlMode] = useState<"camera" | "keyboard">("keyboard")
  
  const snakeRef = useRef([{ x: 10, y: 10 }])
  const directionRef = useRef<{ x: number; y: number }>({ x: 1, y: 0 })
  const foodRef = useRef({ x: 15, y: 15 })
  const handsRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const gameOverRef = useRef(false)

  const GRID_SIZE = 20
  const CELL_SIZE = 20
  const GAME_SPEED = 150

  // Detect direction from hand landmarks - replicating Python logic exactly
  const detectPose = useCallback((landmarks: any[]): HandPose => {
    const result: HandPose = { direction: null, action: null }
    
    if (!landmarks || landmarks.length === 0) return result

    const firstHand = landmarks[0]
    if (firstHand && firstHand.length >= 21) {
      // Get landmark positions (x, y normalized 0-1)
      // Python: lmList[id][1] = x, lmList[id][2] = y
      // MediaPipe JS: landmark.x, landmark.y
      
      const lm8 = firstHand[8]   // Index tip
      const lm7 = firstHand[7]   // Index DIP
      const lm6 = firstHand[6]   // Index PIP
      const lm5 = firstHand[5]   // Index MCP
      const lm9 = firstHand[9]   // Middle MCP
      const lm13 = firstHand[13] // Ring MCP
      const lm10 = firstHand[10] // Middle PIP
      const lm3 = firstHand[3]   // Thumb IP
      const lm2 = firstHand[2]   // Thumb MCP

      // Python logic for DOWN:
      // if lm[8][2] > lm[7][2] and lm[8][2] > lm[6][2] and lm[8][2] > lm[5][2] and lm[8][2] > lm[9][2] and lm[8][2] > lm[13][2]
      if (
        lm8.y > lm7.y &&
        lm8.y > lm6.y &&
        lm8.y > lm5.y &&
        lm8.y > lm9.y &&
        lm8.y > lm13.y
      ) {
        result.direction = "down"
      }
      // Python logic for UP:
      // elif lm[8][2] < lm[7][2] and lm[8][2] < lm[6][2] and lm[8][2] < lm[5][2] and lm[8][2] < lm[9][2] and lm[8][2] < lm[13][2] and lm[10][2] < lm[3][2]
      else if (
        lm8.y < lm7.y &&
        lm8.y < lm6.y &&
        lm8.y < lm5.y &&
        lm8.y < lm9.y &&
        lm8.y < lm13.y &&
        lm10.y < lm3.y
      ) {
        result.direction = "up"
      }
      // Python logic for RIGHT:
      // elif lm[8][1] < lm[10][1] and lm[8][1] < lm[7][1] and lm[8][1] < lm[6][1] and lm[8][1] < lm[5][1]
      // Note: Video is flipped, so we need to swap left/right
      else if (
        lm8.x < lm10.x &&
        lm8.x < lm7.x &&
        lm8.x < lm6.x &&
        lm8.x < lm5.x
      ) {
        result.direction = "left" // Flipped because video is mirrored
      }
      // Python logic for LEFT:
      // elif lm[8][1] > lm[2][1] and lm[8][1] > lm[7][1] and lm[8][1] > lm[6][1] and lm[8][1] > lm[5][1]
      else if (
        lm8.x > lm2.x &&
        lm8.x > lm7.x &&
        lm8.x > lm6.x &&
        lm8.x > lm5.x
      ) {
        result.direction = "right" // Flipped because video is mirrored
      }
    }

    // Second hand for game actions (quit, continue, exit)
    if (landmarks.length > 1) {
      const secondHand = landmarks[1]
      if (secondHand && secondHand.length >= 21) {
        const fingers: number[] = []
        
        // Thumb (check x position) - Python: if lm[tipIds[0]][1] < lm[tipIds[0] - 1][1]
        if (secondHand[TIP_IDS[0]].x < secondHand[TIP_IDS[0] - 1].x) {
          fingers.push(1)
        } else {
          fingers.push(0)
        }

        // Other fingers (check y position - tip should be above PIP joint)
        // Python: if lm[tipIds[id]][2] < lm[tipIds[id] - 2][2]
        for (let i = 1; i < 5; i++) {
          if (secondHand[TIP_IDS[i]].y < secondHand[TIP_IDS[i] - 2].y) {
            fingers.push(1)
          } else {
            fingers.push(0)
          }
        }

        const totalFingers = fingers.reduce((a, b) => a + b, 0)
        
        // Python: if fingers.count(1) == 4: pose[1] = "quit"
        if (totalFingers === 4) {
          result.action = "quit"
        } 
        // Python: elif fingers.count(1) == 3: pose[1] = "continue"
        else if (totalFingers === 3) {
          result.action = "continue"
        } 
        // Python: elif fingers.count(1) == 2: if fingers[1] and fingers[4]: pose[1] = "exit"
        else if (totalFingers === 2 && fingers[1] === 1 && fingers[4] === 1) {
          result.action = "exit"
        }
      }
    }

    return result
  }, [])

  // Draw hand landmarks on canvas
  const drawHandLandmarks = useCallback((landmarks: any[], canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    landmarks.forEach((hand, handIndex) => {
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
        ctx.beginPath()
        ctx.moveTo(hand[start].x * canvas.width, hand[start].y * canvas.height)
        ctx.lineTo(hand[end].x * canvas.width, hand[end].y * canvas.height)
        ctx.stroke()
      })

      // Draw landmarks
      hand.forEach((point: any, idx: number) => {
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
    } while (snakeRef.current.some(segment => segment.x === newFood.x && segment.y === newFood.y))
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

  // Initialize MediaPipe Hands
  const initializeHandTracking = useCallback(async () => {
    if (typeof window === "undefined") return

    setCameraLoading(true)

    try {
      const loadScript = (src: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          if (document.querySelector(`script[src="${src}"]`)) {
            resolve()
            return
          }
          const script = document.createElement("script")
          script.src = src
          script.crossOrigin = "anonymous"
          script.onload = () => resolve()
          script.onerror = reject
          document.head.appendChild(script)
        })
      }

      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js")
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js")
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js")

      await new Promise(resolve => setTimeout(resolve, 500))

      const Hands = (window as any).Hands
      const Camera = (window as any).Camera

      if (!Hands || !Camera) {
        throw new Error("MediaPipe not loaded")
      }

      const hands = new Hands({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        }
      })

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.75,
        minTrackingConfidence: 0.5
      })

      hands.onResults((results: any) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const pose = detectPose(results.multiHandLandmarks)
          
          if (pose.direction) {
            setDetectedPose(pose.direction.toUpperCase())
            
            if (controlMode === "camera") {
              switch (pose.direction) {
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
            }
          } else {
            setDetectedPose("None")
          }

          if (pose.action === "continue" && gameOverRef.current) {
            restartGame()
          }

          if (handCanvasRef.current) {
            drawHandLandmarks(results.multiHandLandmarks, handCanvasRef.current)
          }
        } else {
          setDetectedPose("No hand")
          if (handCanvasRef.current) {
            const ctx = handCanvasRef.current.getContext("2d")
            if (ctx) ctx.clearRect(0, 0, handCanvasRef.current.width, handCanvasRef.current.height)
          }
        }
      })

      handsRef.current = hands

      if (videoRef.current) {
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (handsRef.current && videoRef.current) {
              await handsRef.current.send({ image: videoRef.current })
            }
          },
          width: 320,
          height: 240
        })
        cameraRef.current = camera
        await camera.start()
        setCameraEnabled(true)
        setControlMode("camera")
      }
    } catch (error) {
      console.error("Failed to initialize hand tracking:", error)
      alert("Failed to initialize camera. Please check permissions.")
    } finally {
      setCameraLoading(false)
    }
  }, [detectPose, drawHandLandmarks, controlMode, restartGame])

  const stopCamera = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop()
      cameraRef.current = null
    }
    setCameraEnabled(false)
    setControlMode("keyboard")
    setDetectedPose("None")
  }, [])

  const toggleCamera = useCallback(() => {
    if (cameraEnabled) {
      stopCamera()
    } else {
      initializeHandTracking()
    }
  }, [cameraEnabled, initializeHandTracking, stopCamera])

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

        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setGameOver(true)
          gameOverRef.current = true
          if (score > highScore) {
            setHighScore(score)
            localStorage.setItem("snakeHighScore", score.toString())
          }
          return
        }

        if (snakeRef.current.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true)
          gameOverRef.current = true
          if (score > highScore) {
            setHighScore(score)
            localStorage.setItem("snakeHighScore", score.toString())
          }
          return
        }

        snakeRef.current.unshift(newHead)

        if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
          setScore(prev => prev + 10)
          spawnFood()
        } else {
          snakeRef.current.pop()
        }
      }

      ctx.fillStyle = "#0a0a0a"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

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

  useEffect(() => {
    const saved = localStorage.getItem("snakeHighScore")
    if (saved) setHighScore(parseInt(saved))
  }, [])

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
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
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
                      {controlMode === "camera" ? "Show 3 fingers to restart" : "Press SPACE to restart"}
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

            <div className="flex flex-col items-center">
              <div className="mb-4 flex items-center gap-4">
                <button
                  onClick={toggleCamera}
                  disabled={cameraLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    cameraEnabled
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-purple-600 hover:bg-purple-700"
                  } ${cameraLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {cameraLoading ? (
                    <span className="animate-spin">...</span>
                  ) : cameraEnabled ? (
                    <>
                      <CameraOff size={18} />
                      Stop Camera
                    </>
                  ) : (
                    <>
                      <Camera size={18} />
                      Enable Camera
                    </>
                  )}
                </button>
                <div className="flex items-center gap-2 text-sm">
                  <Gamepad2 size={16} className={controlMode === "keyboard" ? "text-purple-400" : "text-gray-600"} />
                  <span className={controlMode === "keyboard" ? "text-purple-400" : "text-gray-600"}>Keyboard</span>
                  <span className="text-gray-600">/</span>
                  <Camera size={16} className={controlMode === "camera" ? "text-purple-400" : "text-gray-600"} />
                  <span className={controlMode === "camera" ? "text-purple-400" : "text-gray-600"}>Camera</span>
                </div>
              </div>

              <div className="relative w-80 h-60 bg-gray-900 rounded-lg overflow-hidden border border-white/10">
                <video
                  ref={videoRef}
                  className={`absolute inset-0 w-full h-full object-cover transform scale-x-[-1] ${
                    cameraEnabled ? "block" : "hidden"
                  }`}
                  playsInline
                  muted
                />
                <canvas
                  ref={handCanvasRef}
                  width={320}
                  height={240}
                  className={`absolute inset-0 w-full h-full transform scale-x-[-1] ${
                    cameraEnabled ? "block" : "hidden"
                  }`}
                />
                {!cameraEnabled && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                    <Camera size={48} className="mb-2 opacity-50" />
                    <p className="text-sm">Camera disabled</p>
                    <p className="text-xs mt-1">Click Enable Camera for hand gestures</p>
                  </div>
                )}
              </div>

              <div className="mt-4 text-center">
                <p className="text-gray-400 text-sm mb-1">Detected Gesture</p>
                <p className={`text-xl font-bold ${
                  detectedPose !== "None" && detectedPose !== "No hand"
                    ? "text-purple-400"
                    : "text-gray-600"
                }`}>
                  {detectedPose}
                </p>
              </div>

              <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-white/10 max-w-xs">
                <h3 className="font-semibold text-purple-400 mb-2">Hand Gestures</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>Point UP to move up</li>
                  <li>Point DOWN to move down</li>
                  <li>Point LEFT to move left</li>
                  <li>Point RIGHT to move right</li>
                  <li className="pt-2 border-t border-white/10 mt-2">
                    Show 3 fingers to restart
                  </li>
                  <li>Show 4 fingers to quit</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
