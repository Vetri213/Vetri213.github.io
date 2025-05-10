"use client"
import { motion } from "framer-motion"
import { Code, Cpu, Rocket } from "lucide-react"
import Image from "next/image"

export default function About() {
  const skills = [
    { name: "AI & Machine Learning", icon: <Cpu className="w-5 h-5" /> },
    { name: "Robotics & Embedded Systems", icon: <Rocket className="w-5 h-5" /> },
    { name: "Full-Stack Development", icon: <Code className="w-5 h-5" /> },
  ]

  return (
    <section id="about" className="py-24 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold section-heading">About Me</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12 items-center">
          {/* Photo Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex justify-center"
          >
            <div className="relative w-48 h-48 md:w-56 md:h-56">
              <Image
                src="https://ztjys5oa1uctmhma.public.blob.vercel-storage.com/Vetri_pic-L3M3TJud0WH9ptmWMFsaLQyGFFszwr.jpg"
                alt="Vetri Balaji"
                width={300}
                height={300}
                className="profile-image object-cover"
              />
            </div>
          </motion.div>

          {/* About Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
            className="md:col-span-2"
          >
            <div className="space-y-4">
              <p className="text-gray-300 leading-relaxed">
                I'm a <span className="text-gradient font-semibold">Mechatronics Engineering Student</span> at{" "}
                <span className="text-gradient font-semibold">McMaster University</span>, working at the intersection of
                code, hardware, and purpose. I care about building systems that matter: tools that help people live
                better, move faster, and do things they once thought impossible.
              </p>
              <p className="text-gray-300 leading-relaxed">
                I'm driven by curiosity, grounded in real-world impact, and fueled by the belief that technology can
                make anything happen and should always serve people first.
              </p>

              <h3 className="text-xl font-semibold mt-8 mb-4">Skills & Expertise</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {skills.map((skill, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center text-purple-400">
                      {skill.icon}
                    </div>
                    <span>{skill.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
