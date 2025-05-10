"use client"
import { motion } from "framer-motion"
import { Mail, Github, Linkedin, FileText } from "lucide-react"

export default function Contact() {
  const socialLinks = [
    { icon: <Mail size={24} />, href: "mailto:vetri@email.com", label: "Email" },
    { icon: <Github size={24} />, href: "https://github.com/vetrib", label: "GitHub" },
    { icon: <Linkedin size={24} />, href: "https://linkedin.com/in/vetrib", label: "LinkedIn" },
  ]

  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold section-heading">Let's Connect</h2>
          <p className="text-gray-400 mt-4">Based in Toronto, Canada</p>
          <p className="text-white mt-2 font-medium">vetri@email.com</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="flex justify-center gap-8 mt-6">
            {socialLinks.map((link, index) => (
              <motion.a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon text-gray-300 hover:text-purple-500"
                whileHover={{ y: -5 }}
                aria-label={link.label}
              >
                <div className="w-12 h-12 rounded-full feather-button flex items-center justify-center">

                  {link.icon}
                </div>
              </motion.a>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-12">
            <motion.a
              href="https://drive.google.com/file/d/1ozH9IgCP7Z8YANMJb2lB8q_9YbQQn_61/view"
              target="_blank"
              rel="noopener noreferrer"
              className="feather-button flex items-center gap-2 px-6 py-3 text-white font-medium rounded-lg"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              View Resume
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
