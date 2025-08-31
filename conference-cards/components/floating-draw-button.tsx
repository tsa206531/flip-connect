"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function FloatingDrawButton() {
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()

  const handleClick = () => {
    router.push("/draw")
  }

  return (
    <motion.div
      className="hidden md:block fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 1 }}
    >
      {/* Outer glow effect */}
      <motion.div
        className="absolute inset-0 rounded-lg bg-green-400/20 blur-xl scale-110"
        animate={{
          opacity: isHovered ? [0.2, 0.4, 0.2] : [0.1, 0.2, 0.1],
          scale: isHovered ? [1.1, 1.2, 1.1] : [1.1, 1.15, 1.1],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Main button */}
      <motion.button
        onClick={handleClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative w-32 h-16 bg-black/90 border-2 border-green-400/60 rounded-lg shadow-2xl overflow-hidden group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(34, 197, 94, 0.15) 1px, transparent 0)`,
          backgroundSize: "8px 8px",
        }}
      >
        {/* Animated border glow */}
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-green-400/80"
          animate={{
            boxShadow: isHovered
              ? [
                  "0 0 5px #22c55e, 0 0 10px #22c55e, 0 0 15px #22c55e",
                  "0 0 10px #22c55e, 0 0 20px #22c55e, 0 0 30px #22c55e",
                  "0 0 5px #22c55e, 0 0 10px #22c55e, 0 0 15px #22c55e",
                ]
              : [
                  "0 0 2px #22c55e, 0 0 4px #22c55e",
                  "0 0 4px #22c55e, 0 0 8px #22c55e",
                  "0 0 2px #22c55e, 0 0 4px #22c55e",
                ],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Scanline effect */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34, 197, 94, 0.1) 2px, rgba(34, 197, 94, 0.1) 4px)",
          }}
          animate={{
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Content Container */}
        <div className="relative z-10 flex justify-center w-full h-full px-0 items-center">
          {/* Card Icon */}
          <motion.div
            className="mr-2"
            animate={{
              rotate: isHovered ? [0, 10, -10, 0] : 0,
            }}
            transition={{
              duration: 0.6,
              ease: "easeInOut",
            }}
          >
            <div className="relative w-5 h-5 flex items-center justify-center">
              <Image
                src="/icons/card-icon.png"
                alt="Card Icon"
                width={20}
                height={20}
                style={{
                  filter: "brightness(0) invert(1) sepia(1) saturate(5) hue-rotate(90deg) brightness(1.5)",
                }}
              />
              {/* Icon glow */}
              <motion.div
                className="absolute inset-0"
                animate={{
                  boxShadow: isHovered
                    ? ["0 0 5px #22c55e", "0 0 10px #22c55e", "0 0 5px #22c55e"]
                    : ["0 0 2px #22c55e", "0 0 4px #22c55e", "0 0 2px #22c55e"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>

          {/* Text */}
          
        </div>

        {/* Glitch effect overlay */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 bg-green-400/5"
            animate={{
              opacity: [0, 0.1, 0, 0.05, 0],
            }}
            transition={{
              duration: 0.1,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 2,
            }}
          />
        )}

        {/* Matrix-style particles */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-0.5 h-0.5 bg-green-400 rounded-full"
                style={{
                  left: `${10 + (i % 4) * 20}%`,
                  top: `${20 + Math.floor(i / 4) * 20}%`,
                }}
                animate={{
                  y: [-8, 8, -8],
                  opacity: [0.3, 1, 0.3],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        )}

        {/* Data stream effect */}
        <motion.div
          className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent"
          animate={{
            x: ["-100%", "100%"],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            repeatDelay: 1,
          }}
        />
      </motion.button>

      {/* Cyberpunk tooltip */}
      <motion.div
        className="absolute bottom-full right-0 mb-4 px-4 py-2 bg-black/95 border border-green-400/60 rounded shadow-2xl"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(34, 197, 94, 0.1) 1px, transparent 0)`,
          backgroundSize: "6px 6px",
          boxShadow: "0 0 10px rgba(34, 197, 94, 0.3)",
        }}
        initial={{ opacity: 0, y: 10, scale: 0.8 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          y: isHovered ? 0 : 10,
          scale: isHovered ? 1 : 0.8,
        }}
        transition={{ duration: 0.2 }}
      >
        <p
          className="text-green-400 text-xs font-mono whitespace-nowrap font-bold tracking-wider"
          style={{
            textShadow: "0 0 5px #22c55e",
          }}
        >
          DRAW_CARD.EXE
        </p>
        <div className="absolute top-full right-4 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-green-400/60" />
      </motion.div>
    </motion.div>
  )
}
