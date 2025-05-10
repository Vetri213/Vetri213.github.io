import "./globals.css"
import type { ReactNode } from "react"
import Navbar from "./components/Navbar"
import ParticleBackground from "./components/ParticleBackground"
import { Inter } from "next/font/google"

// Initialize the Inter font
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata = {
  title: "Vetri Balaji | Portfolio",
  description: "Mechatronics Engineer specializing in AI, robotics, and software development",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <div className="relative z-0 overflow-hidden">
          {/* Background elements */}
          <div className="fixed inset-0 -z-10">
            {/* Simple dark background */}
            <div className="absolute inset-0 bg-black" />

            {/* Subtle grid pattern */}
            <div className="absolute inset-0 grid-pattern opacity-10" />
          </div>

          {/* Interactive particle background */}
          <ParticleBackground />

          <Navbar />
          {children}

          {/* Footer */}
          <footer className="py-6 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Vetri Balaji. All rights reserved.
          </footer>
        </div>
      </body>
    </html>
  )
}
