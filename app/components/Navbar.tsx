"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Menu, X, FileText } from "lucide-react"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { name: "About", href: "#about" },
    { name: "Experience", href: "#experience" },
    { name: "Education", href: "#education" },
    { name: "Projects", href: "#projects" },
    { name: "Contact", href: "#contact" },
    {
      name: "Resume",
      href: "https://drive.google.com/file/d/1LIUchG4-cafyDsoWUFHx4QanshAQ8zs6/view?usp=sharing",
      download: true,
    },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`w-full px-6 py-4 flex justify-between items-center sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-[var(--nav-bg)] shadow-md backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <a href="#" className="text-xl font-bold text-gradient">
        Vetri
      </a>

      {/* Desktop Navigation */}
      <ul className="hidden md:flex gap-8 text-sm">
        {navLinks.map((link) => (
          <motion.li key={link.name} whileHover={{ y: -2 }}>
            <a
              href={link.href}
              className="relative text-gray-300 hover:text-white transition-colors duration-300 py-2 flex items-center"
              download={link.download}
              target={link.download ? "_blank" : undefined}
              rel={link.download ? "noopener noreferrer" : undefined}
            >
              {link.name}
              {link.icon}
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 hover:w-full"></span>
            </a>
          </motion.li>
        ))}
      </ul>

      {/* Mobile Menu Button */}
      <button className="md:hidden text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-full left-0 right-0 bg-[var(--nav-bg)] shadow-lg py-4 md:hidden"
        >
          <ul className="flex flex-col items-center gap-4">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                  download={link.download}
                  target={link.download ? "_blank" : undefined}
                  rel={link.download ? "noopener noreferrer" : undefined}
                >
                  {link.name}
                  {link.icon}
                </a>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.nav>
  )
}
