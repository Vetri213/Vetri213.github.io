"use client"

import { Briefcase } from "lucide-react"
import { motion } from "framer-motion"

export default function Experience() {
  const timeline = [
    {
      title: "Robotics/AI Engineering Intern",
      company: "Bornea Dynamics",
      period: "Jan 2025 – Apr 2025",
      desc: "Built full-stack AI tools to help internal reps manage referrals and fraud analysis.",
      skills: ["AI", "Full-Stack", "React", "Python"],
    },
    {
      title: "Software Engineering Intern",
      company: "Canadian Space Agency",
      period: "Jan 2025 – Apr 2025",
      desc: "Automated CI/CD and test pipelines for ISS systems with Playwright and GitHub Actions.",
      skills: ["Playwright", "GitHub Actions", "CI/CD", "Space Systems"],
    },
    {
      title: "Software Engineering Intern",
      company: "TD Bank",
      period: "May 2024 – Aug 2024",
      desc: "Built full-stack AI tools to help internal reps manage referrals and fraud analysis.",
      skills: ["AI", "Full-Stack", "React", "Python"],
    },
  ]

  return (
    <section id="experience" className="py-24 px-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-100px" }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold section-heading">Experience</h2>
      </motion.div>

      <div className="relative">
        {/* Timeline vertical line - fixed to go through the middle of icons */}
        <div className="absolute left-6 top-0 bottom-0 flex justify-center">
          <div className="w-0.5 bg-gradient-to-b from-purple-600/70 via-purple-500/40 to-transparent h-full" />
        </div>

        <div className="space-y-16">
          {timeline.map((item, index) => (
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
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Experience card - simplified */}
              <div className="flex-1 bg-[rgba(15,15,15,0.5)] rounded-lg p-6 border border-[rgba(139,92,246,0.1)] mt-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <span className="text-sm text-gray-400 font-mono">{item.period}</span>
                </div>
                <p className="text-purple-400 font-medium mb-3">{item.company}</p>
                <p className="text-gray-300 mb-4">{item.desc}</p>

                <div className="flex flex-wrap gap-2">
                  {item.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 rounded-full bg-purple-900/30 text-purple-300 border border-purple-800/50"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
