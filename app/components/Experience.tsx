"use client"

import { Briefcase } from "lucide-react"
import { motion } from "framer-motion"

export default function Experience() {
  const timeline = [
    {
      title: "Robotics/AI Engineering Intern",
      company: "Bornea Dynamics",
      period: "Jan 2025 – Apr 2025",
      desc: "Trained and optimized YOLO models for the UK Ministry of Defence in mission-critical environments.\nPrototyped a LLaMA-based behavior classification system for defense AI.",
      skills: ["AI", "Computer Vision", "YOLO", "LLaMA", "ONNX", "Quantization", "Python", "Defense", "Chatbot", "Model Optimization", "NLP"]

    },
    {
      title: "Software Engineering Intern",
      company: "Canadian Space Agency",
      period: "Sep 2024 – Dec 2024",
      desc: "Automated testing for International Space Station (ISS) web systems that support Canadarm2 and DEXTRE, reducing a 2.5-year manual QA process to under 24 hours using CI/CD tools and Playwright.",
      skills: ["CI/CD", "Automation", "Playwright", "Docker", "Azure DevOps", "Python", "Space Systems", "Web Testing", "QA", "Git"]

    },
    {
      title: "Software Engineering Intern",
      company: "TD Bank",
      period: "May 2024 – Aug 2024",
      desc: "Built and deployed 3 integrated React + Java web apps for a Unified Referral System, improving client routing and referral speed by 60%.\nCreated AI tools using OpenAI and Azure to support fraud detection and service efficiency; demoed to executives for potential rollout.",
      skills: ["Full-Stack", "React", "Java", "Node.js", "OpenAI", "Azure", "Git", "Bitbucket", "JIRA", "Banking", "AI", "Fraud Detection", "Agile", "Stakeholder Demos"]

    },
    {
      title: "Robotics Research Student",
      company: "McMaster University Telerobotics, Haptics and Computational Vision Laboratory",
      period: "Sep 2023 – Dec 2023",
      desc: "Integrated depth cameras and LiDAR with ROS for real-time obstacle avoidance on a self-driving robot.",
      skills: ["Robotics", "ROS", "Sensor Fusion", "LiDAR", "Depth Cameras", "C++", "Python", "Embedded Systems"]

    },
    {
      title: "AI Research Student",
      company: "Unity Health Toronto",
      period: "Jun 2022 – Aug 2022",
      desc: "Developed a real-time AI system to monitor CT scan rooms using pose estimation; improved efficiency by 40% while preserving patient privacy through edge deployment on Raspberry Pi and Google Coral.",
      skills: ["AI", "Computer Vision", "Pose Estimation", "Python", "TensorFlow", "OpenCV", "Raspberry Pi", "Google Coral", "Edge AI", "Healthcare", "Real-Time Systems"]

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
                  <h3 className="text-xl font-semibold">{item.company}</h3>
                  <span className="text-sm text-gray-400 font-mono">{item.period}</span>
                </div>
                <p className="text-purple-400 font-medium mb-3">{item.title}</p>
                <p className="text-gray-300 mb-4" style={{ whiteSpace: "pre-line" }}>{item.desc}</p>


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
