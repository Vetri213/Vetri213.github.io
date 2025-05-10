"use client"
import { motion } from "framer-motion"
import { ArrowDown } from "lucide-react"
import { useEffect, useState } from "react"

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  }

  return (
    <section className="min-h-screen flex flex-col justify-center items-center text-center px-4 relative">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        className="z-10"
      >
        <motion.div variants={itemVariants} className="mb-2 text-sm font-mono text-purple-400 tracking-wider">
          HELLO, I'M
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold mb-4 animate-text-glow relative">
          <span className="text-gradient animate-gradient-text">Vetri Balaji</span>
        </motion.h1>

        <motion.div
          variants={itemVariants}
          className="h-0.5 w-16 bg-gradient-to-r from-purple-600 to-purple-400 mx-auto mb-6"
        />

        <motion.p variants={itemVariants} className="mt-4 text-lg text-gray-300 max-w-xl leading-relaxed">
          I build intelligent systems that help people do more, live better, and unlock what was once impossible.
        </motion.p>

        <motion.div variants={itemVariants} className="mt-10">
          <motion.a
            href="#projects"
            className="feather-button inline-flex items-center gap-2 px-8 py-3 text-white font-medium"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            View My Work
          </motion.a>

        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.7, y: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="absolute bottom-10"
      >
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}>
          <ArrowDown className="text-gray-400" />
        </motion.div>
      </motion.div>
    </section>
  )
}
