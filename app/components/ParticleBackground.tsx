"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
  alpha: number
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas to full screen
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = []
      const particleCount = Math.min(Math.floor(window.innerWidth * 0.05), 100) // Responsive particle count

      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: Math.random() * 0.5 - 0.25,
          speedY: Math.random() * 0.5 - 0.25,
          color: getRandomColor(),
          alpha: Math.random() * 0.5 + 0.1,
        })
      }
    }

    // Get random purple-ish color
    const getRandomColor = () => {
      const purples = [
        "rgba(139, 92, 246, alpha)", // Purple-500
        "rgba(124, 58, 237, alpha)", // Purple-600
        "rgba(109, 40, 217, alpha)", // Purple-700
        "rgba(167, 139, 250, alpha)", // Purple-400
      ]
      return purples[Math.floor(Math.random() * purples.length)]
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw and update particles
      particlesRef.current.forEach((particle) => {
        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color.replace("alpha", particle.alpha.toString())
        ctx.fill()

        // Update position
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Boundary check
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.speedX *= -1
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.speedY *= -1
        }

        // Mouse interaction
        const dx = mouseRef.current.x - particle.x
        const dy = mouseRef.current.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const maxDistance = 150

        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance
          const angle = Math.atan2(dy, dx)
          particle.speedX -= Math.cos(angle) * force * 0.02
          particle.speedY -= Math.sin(angle) * force * 0.02

          // Increase alpha when near mouse
          particle.alpha = Math.min(0.8, particle.alpha + 0.01)
        } else {
          // Gradually return to original alpha
          particle.alpha = Math.max(0.1, particle.alpha - 0.005)
        }

        // Add some randomness to movement
        particle.speedX += (Math.random() - 0.5) * 0.01
        particle.speedY += (Math.random() - 0.5) * 0.01

        // Limit speed
        const maxSpeed = 0.8
        const speed = Math.sqrt(particle.speedX * particle.speedX + particle.speedY * particle.speedY)
        if (speed > maxSpeed) {
          particle.speedX = (particle.speedX / speed) * maxSpeed
          particle.speedY = (particle.speedY / speed) * maxSpeed
        }
      })

      // Draw subtle gradient background
      const gradient = ctx.createRadialGradient(
        mouseRef.current.x || canvas.width / 2,
        mouseRef.current.y || canvas.height / 2,
        0,
        mouseRef.current.x || canvas.width / 2,
        mouseRef.current.y || canvas.height / 2,
        300,
      )
      gradient.addColorStop(0, "rgba(139, 92, 246, 0.03)")
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Set up event listeners
    window.addEventListener("resize", handleResize)
    window.addEventListener("mousemove", handleMouseMove)

    // Initialize
    handleResize()
    animate()

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 bg-transparent pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  )
}
