import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Github, PlayCircle } from "lucide-react"

export default function SnakeMasterProjectPage() {
  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/#projects" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6">
          <ArrowLeft size={20} />
          <span>Back to Portfolio</span>
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">Snake Master</h1>

        <div className="mb-8 rounded-lg overflow-hidden">
          <Image
            src="/placeholder.svg?height=500&width=1000"
            alt="Snake Master Screenshot"
            width={1000}
            height={500}
            className="w-full object-cover"
          />
        </div>

        <div className="flex gap-4 mb-8">
          <Link
            href="/projects/snake-master/play"
            className="flex items-center gap-2 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 text-white font-medium px-6 py-3 rounded-lg"
          >
            <PlayCircle size={20} />
            Play Game
          </Link>
          <a
            href="https://github.com/username/snake-master"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-white font-medium px-6 py-3 rounded-lg"
          >
            <Github size={20} />
            View Source
          </a>
        </div>

        <div className="space-y-6 text-gray-300">
          <h2 className="text-2xl font-bold text-white">About the Project</h2>
          <p>
            Snake Master is a modern take on the classic Snake game. In the full version, you control the snake using
            hand gestures captured by your webcam. Point in a direction, and your snake will follow!
          </p>

          <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-4 my-6">
            <p className="text-purple-300">
              <strong>Note:</strong> The demo version uses keyboard arrows and mouse movement instead of webcam tracking
              for compatibility across all devices.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-white">How It Works</h2>
          <p>
            The full game uses TensorFlow.js with the HandPose model to track your hand movements in real-time through
            your webcam. By pointing in different directions, you can control the snake's movement. The game is built
            with HTML, CSS, and JavaScript, with the snake game logic running on HTML5 Canvas.
          </p>

          <h2 className="text-2xl font-bold text-white">Technologies Used</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>HTML5 Canvas for game rendering</li>
            <li>JavaScript for game logic</li>
            <li>TensorFlow.js for machine learning in the browser (full version)</li>
            <li>HandPose model for hand tracking and gesture recognition (full version)</li>
            <li>Next.js for website integration</li>
          </ul>

          <h2 className="text-2xl font-bold text-white">Challenges and Solutions</h2>
          <p>
            A major challenge was ensuring consistent hand tracking across different lighting conditions and webcam
            qualities. I implemented a robust gesture detection algorithm that can work even with imperfect hand
            visibility. Another challenge was optimizing the game to run smoothly alongside the hand tracking model,
            which I solved by using requestAnimationFrame for efficient rendering and processing.
          </p>

          <div className="pt-6">
            <Link
              href="/projects/snake-master/play"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 text-white font-medium px-8 py-4 rounded-lg text-lg"
            >
              <PlayCircle size={24} />
              Try it yourself!
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
