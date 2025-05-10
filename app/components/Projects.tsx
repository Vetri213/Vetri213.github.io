"use client"
import { motion, AnimatePresence } from "framer-motion"
import type React from "react"
import { useEffect, useRef } from "react"
import { ExternalLink, Github, X } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import Link from "next/link"

interface ProjectType {
  id: string
  name: string
  desc: string
  longDesc?: string | React.ReactNode
  image: string
  video?: string
  tags: string[]
  techStack?: string[]
  role?: string
  impact?: string
  links?: {
    github?: string
    live?: string
  }
}

interface ProjectCardProps {
  project: ProjectType
  index: number
  onClick: () => void
}

function ProjectCard({ project, index, onClick }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-100px" }}
      className="h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="relative bg-[rgba(15,15,15,0.5)] rounded-lg overflow-hidden border border-[rgba(139,92,246,0.1)] flex flex-col h-full cursor-pointer"
        animate={{
          boxShadow: isHovered ? "0 10px 30px rgba(139, 92, 246, 0.2)" : "0 0 0 rgba(0, 0, 0, 0)",
          y: isHovered ? -5 : 0,
          borderColor: isHovered ? "rgba(139, 92, 246, 0.3)" : "rgba(139, 92, 246, 0.1)",
        }}
        transition={{ duration: 0.3 }}
        onClick={onClick}
      >
        {/* Media Section */}
        <div className="relative overflow-hidden aspect-[16/9]">
          <Image
            src={project.image || "/placeholder.svg"}
            alt={project.name}
            width={1200}
            height={600}
            className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? "scale-105" : ""}`}
          />

          {/* Overlay with links */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.8)] to-transparent flex items-end justify-end p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex gap-3">
              {project.links?.github && (
                <motion.a
                  href={project.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[rgba(0,0,0,0.5)] flex items-center justify-center text-white hover:bg-purple-600 transition-colors"
                  aria-label="View GitHub repository"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    window.open(project.links.github, "_blank")
                  }}
                >
                  <Github size={18} />
                </motion.a>
              )}
              {project.links?.live && (
                <motion.a
                  href={project.links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[rgba(0,0,0,0.5)] flex items-center justify-center text-white hover:bg-purple-600 transition-colors"
                  aria-label="View live project"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    window.open(project.links.live, "_blank")
                  }}
                >
                  <ExternalLink size={18} />
                </motion.a>
              )}
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-xl font-semibold mb-2 text-gradient">{project.name}</h3>

          <p className="text-gray-300 mb-4">{project.desc}</p>

          <div className="flex flex-wrap gap-2 mt-auto pt-4">
            {project.tags.map((tag, i) => (
              <motion.span
                key={i}
                className="text-xs px-2 py-1 rounded-full bg-purple-900/30 text-purple-300 border border-purple-800/50"
                whileHover={{
                  backgroundColor: "rgba(139, 92, 246, 0.2)",
                  borderColor: "rgba(139, 92, 246, 0.4)",
                }}
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ProjectModal({ project, onClose }: { project: ProjectType; onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    // Close modal when pressing Escape key
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscKey)

    // Focus trap
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )

    if (focusableElements && focusableElements.length > 0) {
      ;(focusableElements[0] as HTMLElement).focus()
    }

    // Prevent scrolling of background content
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscKey)
      document.body.style.overflow = "auto"
    }
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-[rgba(15,15,15,0.95)] border border-[rgba(139,92,246,0.2)] rounded-lg overflow-hidden w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[rgba(0,0,0,0.6)] flex items-center justify-center text-white hover:bg-purple-600 transition-colors z-20 shadow-lg"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Media Section */}
        <div className="relative w-full aspect-[16/9]">
          {project.video ? (
            <video autoPlay muted loop playsInline className="w-full h-full object-cover">
              <source src={project.video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <Image
              src={project.image || "/placeholder.svg"}
              alt={project.name}
              width={1200}
              height={600}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Content */}
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-4 text-gradient">{project.name}</h2>

          <div className="text-gray-300 mb-8 space-y-4">{project.longDesc}</div>

          {project.role && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-purple-400 mb-2">My Role</h3>
              <p className="text-gray-300">{project.role}</p>
            </div>
          )}

          {project.impact && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-purple-400 mb-2">Impact</h3>
              <p className="text-gray-300">{project.impact}</p>
            </div>
          )}

          {project.techStack && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-purple-400 mb-2">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech, i) => (
                  <span key={i} className="text-sm px-3 py-1 rounded-full bg-[rgba(139,92,246,0.15)] text-purple-300">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 mt-8">
            {project.links?.github && (
              <a
                href={project.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[rgba(0,0,0,0.3)] hover:bg-[rgba(139,92,246,0.2)] px-6 py-3 rounded-lg text-white transition-colors"
              >
                <Github size={18} />
                View Code
              </a>
            )}

            {project.links?.live &&
              (project.links.live.startsWith("/") ? (
                <Link href={project.links.live} passHref>
                  <span className="flex items-center gap-2 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 px-6 py-3 rounded-lg text-white transition-colors cursor-pointer">
                    <ExternalLink size={18} />
                    Live Demo
                  </span>
                </Link>
              ) : (
                <a
                  href={project.links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 px-6 py-3 rounded-lg text-white transition-colors"
                >
                  <ExternalLink size={18} />
                  Live Demo
                </a>
              ))}
          </div>

          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-[rgba(139,92,246,0.2)]">
            {project.tags.map((tag, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded-full bg-purple-900/30 text-purple-300 border border-purple-800/50"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null)

  const projects: ProjectType[] = [
    {
      id: "mcmaster-lab",
      name: "Multi-Sensor Obstacle Detection for Autonomous Robots",
      desc: "Fused LiDAR and depth camera data for real-time robotics navigation",
      longDesc: (
        <>
          <p>
            Conducted robotics research under McMaster's Telerobotics, Haptics, and Computational Vision Lab, focused on
            enhancing obstacle detection for a self-driving robot.
          </p>
          <p>
            Used ROS and C++ to integrate LiDAR and depth camera data, achieving low-latency multi-sensor
            synchronization. The system improved reliability in detecting obstacles along walls and navigating complex
            indoor environments in real time.
          </p>
        </>
      ),
      image: "/placeholder.svg?height=400&width=600",
      tags: ["Robotics", "ROS", "Sensor Fusion", "Obstacle Avoidance"],
      techStack: ["C++", "ROS", "LiDAR", "Depth Camera"],
      role: "Developed and debugged the sensor fusion pipeline, integrating camera and LiDAR input in ROS to enable real-time environmental awareness.",
      impact:
        "Enhanced obstacle detection accuracy and responsiveness in a self-driving robot by synchronizing multi-sensor data streams with minimal latency.",
      links: {
        github: "#",
        live: "#",
      },
    },
    {
      id: "mind-link",
      name: "Mind-Link",
      desc: "Real-time EEG-based intent detection system using machine learning and Muse headband",
      longDesc: (
        <>
          <p>
            A brain-computer interface that helps non-verbal stroke patients communicate basic needs like discomfort,
            pain, or urgency. The system reads EEG signals using a Muse headband and classifies mental states in
            real-time using a custom-trained model.
          </p>
          <p>
            The project uses Scikit-learn to classify alpha and beta wave patterns into actionable categories like
            "Pain," "Alert," and "Calm." A lightweight React Native mobile app displays the detections live and is being
            extended to support push notifications for caregivers.
          </p>
        </>
      ),
      image: "https://ztjys5oa1uctmhma.public.blob.vercel-storage.com/Muse2-zQypOKFPPOOcBvW1njkzjAap8AZd2r.webp",
      tags: ["BCI", "Python", "React Native", "Machine Learning", "EEG", "Healthcare"],
      techStack: ["Python", "Scikit-learn", "NumPy", "Pandas", "Matplotlib", "React Native", "Expo", "Muse SDK"],
      role: "Designed and implemented the EEG classification pipeline, including data collection, model training, and real-time signal analysis. Built the React Native app UI and integrated frontend with the Python classifier via WebSocket.",
      impact:
        "Built an end-to-end brain signal detection system for use by non-verbal patients. Achieved 97% model accuracy and developed an extensible mobile interface to deliver real-time alerts to caregivers.",
      links: {
        github: "https://github.com/vetri-code/mind-link",
        live: "",
      },
    },
    {
      id: "pancreai",
      name: "PancreAI",
      desc: "AI-driven risk assessment and explainability for pancreatic cancer",
      longDesc: (
        <>
          <p>
            PancreAI is a machine learning-powered system designed to assist with early detection of pancreatic cancer
            by analyzing clinical and demographic data. It provides risk predictions and explainable reasoning to
            support patient care decisions.
          </p>
          <p>
            The system uses a LightGBM model trained on synthetic and public datasets to evaluate cancer risk, while
            Cohere's Retrieval-Augmented Generation (RAG) is used to generate human-readable explanations for the
            model's outputs. The project also integrates synthetic patient profiles to enhance interpretability and
            robustness.
          </p>
        </>
      ),
      image: "https://ztjys5oa1uctmhma.public.blob.vercel-storage.com/images/pancrai-CNIPA7HKIrjrQJV1n8t9rIfVBro6is.jpg",
      tags: ["Medical AI", "Explainable AI", "Cohere RAG", "LightGBM", "Healthcare"],
      techStack: ["Python", "LightGBM", "Pandas", "Cohere", "Scikit-learn"],
      role: "Built the tabular AI pipeline for cancer risk prediction and integrated Cohere RAG to generate explainable outputs based on model decisions and patient data.",
      impact:
        "Delivered a fully functioning prototype for AI-assisted early cancer risk screening with integrated natural language explainability using real and synthetic data.",
      links: {
        github: "#",
        live: "#",
      },
    },
    {
      id: "omni-bot",
      name: "Gesture-Controlled Omni-Bot",
      desc: "Hand-pose-controlled robot using OpenCV and Arduino",
      longDesc: (
        <>
          <p>
            Built a responsive omni-directional robot that interprets hand gestures in real-time to control movement. I
            used OpenCV and MediaPipe for hand pose tracking and sent control signals from a laptop to an Arduino-based
            motor system.
          </p>
          <p>
            The bot used independent motor drivers and PWM control for smooth directional movement, and the logic was
            written from scratch to simulate ECU-style control on limited hardware. It was built in under 48 hours for a
            hackathon to explore natural human-robot interaction.
          </p>
        </>
      ),
      image: "https://ztjys5oa1uctmhma.public.blob.vercel-storage.com/OmniBot-EJWsS6cOvcrRCZHITCnQoXpQjmDq0e.jpg",
      tags: ["OpenCV", "MediaPipe", "Arduino", "Gesture Control", "Embedded"],
      techStack: ["Python", "OpenCV", "MediaPipe", "Arduino", "C++"],
      role: "Designed and implemented the entire system: vision pipeline, signal transmission, and motor control logic. Also built the hardware assembly and tested multi-directional movement.",
      impact:
        "Created a fully functioning robot that responds to intuitive hand gestures in real-time, showcasing the potential for gesture-based robotics interfaces using low-cost hardware.",
      links: {
        github: "#",
        live: "#",
      },
    },
    {
      id: "heatcode",
      name: "HeatCode (WIP)",
      desc: "Gamified platform for coding interview prep with live code execution",
      longDesc: (
        <>
          <p>
            HeatCode is a LeetCode-meets-Duolingo-style platform designed to make coding practice engaging and
            structured. It includes a custom editor powered by the Judge0 API for real-time code execution and XP-based
            progression through problem sets.
          </p>
          <p>
            The platform features step-by-step lessons, a polished UI, and a backend that supports multiple programming
            languages. Future plans include gamified user profiles, daily challenges, and progress tracking.
          </p>
        </>
      ),
      image: "/placeholder.svg?height=400&width=600",
      tags: ["Full-Stack", "Judge0", "React", "Gamified Learning", "Work In Progress"],
      techStack: ["React", "Next.js", "Tailwind CSS", "Node.js", "Judge0", "MongoDB"],
      role: "Designed and developed the full-stack application architecture, implemented the code editor with test case validation, and built dynamic lesson flows with future gamification features.",
      impact:
        "Launched a working prototype with real-time code execution and a structured UI, setting the foundation for an engaging coding education platform.",
      links: {
        github: "https://github.com/yourusername/heatcode",
        live: "#",
      },
    },
    {
      id: "snake-master",
      name: "Snake Master",
      desc: "A gesture-controlled Snake game where you use hand movements captured by your webcam to control the snake in real-time.",
      longDesc: (
        <>
          <p>
            Snake Master reimagines the classic Snake game with modern computer vision technology. Using your webcam,
            the game tracks your hand movements in real-time and translates them into game controls. Point in any
            direction, and the snake will follow!
          </p>
          <p>
            This project redefines how we interact with digital systems, taking a step toward a future where we no
            longer rely on keyboards, cursors, or even voice commands to communicate intent.
          </p>
        </>
      ),
      image: "https://ztjys5oa1uctmhma.public.blob.vercel-storage.com/Snake_Master-0XcmJaLyAfM5SxDhJrBNQb4PMeqMeN.png",
      tags: ["Hand Pose Estimation", "Gesture Control", "Game", "Computer Vision"],
      techStack: ["Python", "MediaPipe", "PyGame"],
      role: "Took on everything from core game logic to hand tracking integration, using the project as a hands-on way to explore gesture-based control.",
      impact:
        "Demonstrated how gesture control and hand pose estimation can enable more natural and intuitive human-computer interaction, showcasing its potential to power next-generation technology beyond traditional input methods.",
      links: {
        github: "https://github.com/username/snake-master",
        live: "/projects/snake-master/play",
      },
    },
  ]

  return (
    <section id="projects" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold section-heading">Projects</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} onClick={() => setSelectedProject(project)} />
          ))}
        </div>

        <AnimatePresence>
          {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
        </AnimatePresence>
      </div>
    </section>
  )
}
