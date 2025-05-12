"use client"

import { GraduationCap } from "lucide-react"
import { motion } from "framer-motion"

export default function Education() {
  const education = [
    {
      title: "Deep Dive into Blockchain",
      institution: "University of Zurich (UZH)",
      period: "Summer 2025",
      achievements: ["The Ronald William Merkel Travel Scholarship in Engineering", "McMaster Partner Scholarship"],
      description:
        "Selected for an intensive program on decentralized systems, smart contracts, and blockchain's role in identity, sustainability, and finance.",
    },
    {
      title: "B.Eng. in Mechatronics Engineering",
      institution: "McMaster University",
      period: "Fall 2021 – Spring 2026",
      achievements: ["Dean's Honour List (All Terms)", "GPA: 3.8/4.0"],
      description: "Coursework in robotics, AI, embedded systems, and software development",
    },
  ]

  return (
    <section id="education" className="py-24 px-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-100px" }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold section-heading">Education</h2>
      </motion.div>

      <div className="relative">
        {/* Timeline vertical line - fixed to go through the middle of icons */}
        <div className="absolute left-6 top-0 bottom-0 flex justify-center">
          <div className="w-0.5 bg-gradient-to-b from-purple-600/70 via-purple-500/40 to-transparent h-full" />
        </div>

        <div className="space-y-16">
          {education.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative flex items-start gap-6 pl-16"
            >
              {/* Timeline icon - positioned to be centered on the line */}
              <div className="absolute left-0 top-0 flex items-center justify-center z-10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-700 to-purple-500 flex items-center justify-center shadow-md shadow-purple-600/10">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Education card - simplified */}
              <div className="flex-1 bg-[rgba(15,15,15,0.5)] rounded-lg p-6 border border-[rgba(139,92,246,0.1)] mt-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                  <h3 className="text-xl font-semibold">{item.institution}</h3>
                  <span className="text-sm text-gray-400 font-mono">{item.period}</span>
                </div>
                <p className="text-purple-400 font-medium mb-3">{item.title}</p>
                <p className="text-gray-300 mb-4">{item.description}</p>

                {item.achievements && item.achievements.length > 0 && (
                  <div className="space-y-2">
                    {item.achievements.map((achievement, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2" />
                        <p className="text-gray-300">{achievement}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
