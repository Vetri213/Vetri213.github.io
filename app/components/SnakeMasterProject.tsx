"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { ExternalLink, Github, PlayCircle, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function SnakeMasterProject() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const project = {
    name: "Snake Master",
    desc: "A gesture-controlled Snake game where you use hand movements captured by your webcam to control the snake in real-time.",
    longDesc:
      "Snake Master reimagines the classic Snake game with modern computer vision technology. Using your webcam, the game tracks your hand movements in real-time and translates them into game controls. Point in any direction, and the snake will follow! This project combines web technologies with machine learning to create an engaging, hands-free gaming experience.",
    image: "/placeholder.svg?height=500&width=800",
    video: "/snake-master-demo.mp4", // Replace with actual video if available
    tags: ["JavaScript", "TensorFlow.js", "HandPose", "HTML5 Canvas", "Computer Vision"],
    techStack: ["JavaScript", "TensorFlow.js", "HandPose Model", "HTML5 Canvas", "CSS3", "Web APIs", "Next.js"],
    role: "Designed and implemented the entire application, from the game mechanics to the hand tracking integration. Created a responsive UI that works across different devices.",
    impact:
      "Showcased the potential of browser-based computer vision for gaming. The project has been used as a teaching tool for introducing students to machine learning concepts.",
    links: {
      github: "https://github.com/username/snake-master",
      live: "/projects/snake-master/play",
    },
  }

  return (
    <section className="py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          layout
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="w-full"
          onMouseEnter={() => !isExpanded && setIsHovered(true)}
          onMouseLeave={() => !isExpanded && setIsHovered(false)}
        >
          <motion.div
            layout
            className={`bg-[rgba(15,15,15,0.5)] rounded-lg overflow-hidden border border-[rgba(139,92,246,0.1)] relative ${
              isExpanded ? "flex flex-col md:flex-row" : ""
            }`}
            animate={{
              boxShadow: isHovered || isExpanded ? "0 10px 30px rgba(139, 92, 246, 0.2)" : "0 0 0 rgba(0, 0, 0, 0)",
              y: isHovered && !isExpanded ? -5 : 0,
              borderColor: isHovered || isExpanded ? "rgba(139, 92, 246, 0.3)" : "rgba(139, 92, 246, 0.1)",
            }}
            transition={{ duration: 0.3 }}
            onClick={() => !isExpanded && setIsExpanded(true)}
          >
            {/* Media Section */}
            <motion.div
              layout
              className={`relative overflow-hidden ${isExpanded ? "md:w-1/2 md:h-auto" : "h-64 md:h-80"}`}
            >
              {project.video && isExpanded ? (
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    !isExpanded ? "group-hover:scale-105" : ""
                  }`}
                >
                  <source src={project.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <Image
                  src={project.image || "/placeholder.svg"}
                  alt={project.name}
                  width={isExpanded ? 800 : 600}
                  height={isExpanded ? 600 : 400}
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    !isExpanded ? "group-hover:scale-105" : ""
                  }`}
                />
              )}

              {!isExpanded && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.8)] to-transparent flex items-end justify-end p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex gap-3">
                    <motion.a
                      href={project.links.github}
                      className="w-9 h-9 rounded-full bg-[rgba(0,0,0,0.5)] flex items-center justify-center text-white hover:bg-purple-600 transition-colors"
                      aria-label="View GitHub repository"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Github size={18} />
                    </motion.a>
                    <Link href={project.links.live} passHref>
                      <motion.a
                        className="w-9 h-9 rounded-full bg-[rgba(0,0,0,0.5)] flex items-center justify-center text-white hover:bg-purple-600 transition-colors"
                        aria-label="Play Snake Master"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={18} />
                      </motion.a>
                    </Link>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Content Section */}
            <motion.div layout className={`p-6 ${isExpanded ? "md:w-1/2 md:p-8" : ""}`}>
              {isExpanded && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[rgba(0,0,0,0.5)] flex items-center justify-center text-white hover:bg-purple-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsExpanded(false)
                  }}
                >
                  <X size={16} />
                </motion.button>
              )}

              <motion.h3 layout className="text-2xl md:text-3xl font-bold mb-2 text-gradient">
                {project.name}
              </motion.h3>

              <motion.p layout className="text-gray-300 mb-6 text-lg">
                {isExpanded ? project.longDesc : project.desc}
              </motion.p>

              {isExpanded && project.role && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-4"
                >
                  <h4 className="text-sm font-semibold text-purple-400 mb-1">My Role</h4>
                  <p className="text-gray-300">{project.role}</p>
                </motion.div>
              )}

              {isExpanded && project.impact && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-4"
                >
                  <h4 className="text-sm font-semibold text-purple-400 mb-1">Impact</h4>
                  <p className="text-gray-300">{project.impact}</p>
                </motion.div>
              )}

              {isExpanded && project.techStack && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-4"
                >
                  <h4 className="text-sm font-semibold text-purple-400 mb-1">Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded-full bg-[rgba(139,92,246,0.15)] text-purple-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.div layout className="flex flex-wrap gap-3 mb-8">
                {project.tags.map((tag, i) => (
                  <motion.span
                    key={i}
                    layout
                    className="text-xs px-3 py-1 rounded-full bg-purple-900/30 text-purple-300 border border-purple-800/50"
                    whileHover={{
                      backgroundColor: "rgba(139, 92, 246, 0.2)",
                      borderColor: "rgba(139, 92, 246, 0.4)",
                    }}
                  >
                    {tag}
                  </motion.span>
                ))}
              </motion.div>

              {isExpanded ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex gap-4"
                >
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[rgba(0,0,0,0.3)] hover:bg-[rgba(139,92,246,0.2)] px-4 py-2 rounded-lg text-white transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Github size={16} />
                    View Code
                  </a>
                  <Link href={project.links.live} passHref>
                    <motion.div
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 px-4 py-2 rounded-lg text-white transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <PlayCircle size={16} />
                      Play Game
                    </motion.div>
                  </Link>
                </motion.div>
              ) : (
                <div className="flex justify-center">
                  <Link href={project.links.live} passHref>
                    <motion.div
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 text-white font-medium px-8 py-3 rounded-lg"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <PlayCircle size={20} />
                      Play Snake Master
                    </motion.div>
                  </Link>
                </div>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
