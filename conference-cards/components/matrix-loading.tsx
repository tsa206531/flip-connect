"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface MatrixLoadingProps {
  onComplete: () => void
}

export default function MatrixLoading({ onComplete }: MatrixLoadingProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(0)
  const [showSkipHint, setShowSkipHint] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // 程式碼片段和關鍵字 - 擴展更多內容適合8秒動畫
  const codeSnippets = [
    "const cards = await fetchCards()",
    "import { motion } from 'framer-motion'",
    "function drawRandomCard() {",
    "useState<Card[]>([]);",
    "export default function",
    "className='matrix-effect'",
    "background: linear-gradient",
    "transform: rotateY(180deg)",
    "onClick={() => setFlipped(!flipped)}",
    "border-radius: 12px;",
    "box-shadow: 0 4px 8px rgba",
    "transition: all 0.3s ease",
    "position: absolute;",
    "z-index: 999;",
    "overflow: hidden;",
    "LOADING_CARDS_DATA...",
    "INITIALIZING_SYSTEM...",
    "CONNECTING_TO_SERVER...",
    "PROCESSING_IMAGES...",
    "RENDERING_INTERFACE...",
    "COMPILING_COMPONENTS...",
    "OPTIMIZING_PERFORMANCE...",
    "ESTABLISHING_CONNECTION...",
    "VALIDATING_DATA_INTEGRITY...",
    "SYNCHRONIZING_STATE...",
    "MOUNTING_COMPONENTS...",
    "APPLYING_ANIMATIONS...",
    "LOADING_ASSETS...",
    "PREPARING_WORKSPACE...",
    "FINALIZING_SETUP...",
    "AUTHENTICATING_USER...",
    "DECRYPTING_DATABASE...",
    "PARSING_CONFIGURATIONS...",
    "BUILDING_VIRTUAL_DOM...",
    "INJECTING_DEPENDENCIES...",
    "CALIBRATING_SENSORS...",
    "ESTABLISHING_WEBSOCKET...",
    "PRELOADING_TEXTURES...",
    "COMPRESSING_ASSETS...",
    "VALIDATING_CHECKSUMS...",
    "INITIALIZING_CACHE...",
    "SPAWNING_WORKERS...",
    "ALLOCATING_MEMORY...",
    "SETTING_UP_ROUTES...",
    "CONFIGURING_MIDDLEWARE...",
    "LOADING_TRANSLATIONS...",
    "PREPARING_ANIMATIONS...",
    "WARMING_UP_ENGINE...",
    "SYSTEM_READY_STANDBY...",
  ]

  const keywords = [
    "REACT",
    "NEXTJS",
    "TYPESCRIPT",
    "TAILWIND",
    "FRAMER",
    "MOTION",
    "CARDS",
    "ANIMATION",
    "COMPONENT",
    "HOOK",
    "STATE",
    "EFFECT",
    "PROPS",
    "JSX",
    "CSS",
    "HTML",
    "API",
    "FETCH",
    "ASYNC",
    "AWAIT",
    "PROMISE",
    "CALLBACK",
    "EVENT",
    "HANDLER",
    "CLICK",
    "HOVER",
    "FOCUS",
    "BLUR",
    "SCROLL",
    "RESIZE",
    "LOAD",
    "ERROR",
    "SUCCESS",
    "PENDING",
    "COMPLETE",
    "INIT",
    "MATRIX",
    "CYBER",
    "NEON",
    "GLOW",
    "GLASS",
    "BLUR",
    "SHADOW",
    "GRADIENT",
    "TRANSFORM",
    "ROTATE",
    "SCALE",
    "TRANSLATE",
    "OPACITY",
    "FILTER",
    "BACKDROP",
    "BORDER",
    "RADIUS",
    "FLEX",
    "GRID",
    "ABSOLUTE",
    "RELATIVE",
    "FIXED",
    "STICKY",
    "HIDDEN",
    "VISIBLE",
    "BLOCK",
    "INLINE",
    "NONE",
    "AUTO",
    "FULL",
    "HALF",
    "QUARTER",
    "DOUBLE",
    "TRIPLE",
    "QUAD",
    "MAX",
  ]

  // 生成隨機文字行
  const generateRandomLine = () => {
    const isCode = Math.random() > 0.4
    if (isCode) {
      return codeSnippets[Math.floor(Math.random() * codeSnippets.length)]
    } else {
      const wordCount = Math.floor(Math.random() * 5) + 2
      return Array.from({ length: wordCount }, () => keywords[Math.floor(Math.random() * keywords.length)]).join(" ")
    }
  }

  // 創建更多文字行適合8秒動畫
  const [textLines] = useState(() =>
    Array.from({ length: 35 }, (_, i) => ({
      id: i,
      text: generateRandomLine(),
      speed: Math.random() * 4 + 2, // 2-6秒，適合8秒總時長
      delay: Math.random() * 3,
      highlight: false,
      highlightDelay: Math.random() * 4,
    })),
  )

  useEffect(() => {
    // 顯示跳過提示 - 1秒後顯示
    const skipTimer = setTimeout(() => setShowSkipHint(true), 1000)

    // 進度更新 - 3秒內完成，但設計為8秒節奏
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 100 / 30 // 3秒內完成 (30 * 100ms = 3000ms)
      })
    }, 100)

    // 3秒後完成載入
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onComplete, 500) // 淡出動畫時間
    }, 3000) // 每次重整都是3秒

    return () => {
      clearTimeout(skipTimer)
      clearInterval(progressInterval)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [onComplete])

  const handleSkip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsVisible(false)
    setTimeout(onComplete, 200)
  }

  if (!isVisible) {
    return (
      <motion.div
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100]"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      />
    )
  }

  return (
    <motion.div
      className="fixed inset-0 bg-background/90 backdrop-blur-md z-[100] overflow-hidden cursor-pointer font-mono"
      onClick={handleSkip}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* 磨沙玻璃背景層 */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 backdrop-blur-xl" />

      {/* 背景網格效果 - 使用主題色彩 */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* 文字流動效果 - 更密集適合8秒設計 */}
      <div className="relative w-full h-full">
        {textLines.map((line, index) => (
          <motion.div
            key={line.id}
            className="absolute whitespace-nowrap text-primary text-sm leading-5"
            style={{
              top: `${(index * 3) % 100}%`, // 更密集的分佈
              left: "-100%",
              textShadow: "0 0 8px hsl(var(--primary)), 0 0 16px hsl(var(--primary))",
            }}
            animate={{
              x: ["0%", "120vw"],
              opacity: progress >= 90 ? [1, 1, 0] : [0, 1, 1, 0],
            }}
            transition={{
              duration: line.speed,
              delay: line.delay,
              repeat: progress < 90 ? Number.POSITIVE_INFINITY : 0,
              ease: "linear",
            }}
          >
            {/* 主文字 */}
            <motion.span
              animate={{
                filter: ["hue-rotate(0deg)", "hue-rotate(5deg)", "hue-rotate(-5deg)", "hue-rotate(0deg)"],
              }}
              transition={{
                duration: 0.15,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: Math.random() * 2 + 1,
              }}
            >
              {line.text}
            </motion.span>

            {/* 隨機高亮效果 - 磨沙主題色 */}
            <motion.div
              className="absolute inset-0 bg-secondary/80 backdrop-blur-sm text-white px-1 -mx-1 rounded border border-secondary/30"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0, 1, 1, 0],
              }}
              transition={{
                duration: 0.4,
                delay: line.highlightDelay,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: Math.random() * 3 + 1.5,
              }}
            >
              {line.text}
            </motion.div>

            {/* RGB 色彩分離效果 - 綠色系 */}
            <motion.span
              className="absolute inset-0 text-red-400/60 opacity-40"
              animate={{
                x: [0, 2, -1, 0],
                opacity: [0, 0.4, 0],
              }}
              transition={{
                duration: 0.12,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: Math.random() * 4 + 1,
              }}
            >
              {line.text}
            </motion.span>

            <motion.span
              className="absolute inset-0 text-cyan-400/60 opacity-40"
              animate={{
                x: [0, -2, 1, 0],
                opacity: [0, 0.4, 0],
              }}
              transition={{
                duration: 0.12,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: Math.random() * 4 + 1,
                delay: 0.06,
              }}
            >
              {line.text}
            </motion.span>
          </motion.div>
        ))}
      </div>

      {/* 故障效果覆蓋層 - 透明主題色 */}
      <motion.div
        className="absolute inset-0 bg-primary/3 backdrop-blur-sm"
        animate={{
          opacity: [0, 0.1, 0, 0.05, 0],
        }}
        transition={{
          duration: 0.08,
          repeat: Number.POSITIVE_INFINITY,
          repeatDelay: Math.random() * 1.5 + 0.5,
        }}
      />

      {/* 掃描線效果 - 透明主題色 */}
      <motion.div
        className="absolute inset-0 opacity-15"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--primary) / 0.1) 2px, hsl(var(--primary) / 0.1) 4px)",
        }}
        animate={{
          opacity: [0.1, 0.25, 0.1],
        }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* 載入狀態區域 - 磨沙玻璃容器 */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center">
            <motion.div
              className="text-primary text-lg font-bold mb-6"
              style={{ textShadow: "0 0 12px hsl(var(--primary)), 0 0 24px hsl(var(--primary))" }}
              animate={{
                opacity: [0.7, 1, 0.7],
                textShadow: [
                  "0 0 12px hsl(var(--primary)), 0 0 24px hsl(var(--primary))",
                  "0 0 16px hsl(var(--primary)), 0 0 32px hsl(var(--primary)), 0 0 48px hsl(var(--primary))",
                  "0 0 12px hsl(var(--primary)), 0 0 24px hsl(var(--primary))",
                ],
              }}
              transition={{
                duration: 1.2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              INITIALIZING CARD SYSTEM...
            </motion.div>

            {/* 進度條 - 磨沙玻璃設計 */}
            <div className="w-80 h-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary backdrop-blur-sm relative"
                style={{
                  boxShadow: "0 0 12px hsl(var(--primary)), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
                animate={{
                  width: `${progress}%`,
                }}
                transition={{
                  duration: 0.1,
                  ease: "easeOut",
                }}
              >
                {/* 進度條內部光效 */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            </div>

            {/* 百分比顯示 */}
            <motion.div
              className="text-primary/80 text-xs mt-4 font-mono"
              style={{ textShadow: "0 0 8px hsl(var(--primary))" }}
              animate={{
                opacity: [0.6, 0.9, 0.6],
              }}
              transition={{
                duration: 0.8,
                repeat: Number.POSITIVE_INFINITY,
              }}
            >
              {Math.floor(progress)}% COMPLETE
            </motion.div>

            {/* 系統狀態指示 */}
            <motion.div
              className="text-primary/60 text-xs mt-2 font-mono"
              style={{ textShadow: "0 0 6px hsl(var(--primary))" }}
              animate={{
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
              }}
            >
              {progress < 30 && "LOADING CORE MODULES..."}
              {progress >= 30 && progress < 60 && "COMPILING COMPONENTS..."}
              {progress >= 60 && progress < 90 && "OPTIMIZING PERFORMANCE..."}
              {progress >= 90 && "FINALIZING SYSTEM..."}
            </motion.div>
          </div>
        </div>
      </div>

      {/* 跳過提示 - 磨沙玻璃 */}
      <AnimatePresence>
        {showSkipHint && (
          <motion.div
            className="absolute top-8 right-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            
          </motion.div>
        )}
      </AnimatePresence>

      {/* 最終歡迎訊息 - 磨沙玻璃 */}
      {progress >= 95 && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 shadow-2xl text-center">
            <motion.h1
              className="text-5xl font-bold text-primary mb-6"
              style={{ textShadow: "0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary))" }}
              animate={{
                textShadow: [
                  "0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary))",
                  "0 0 30px hsl(var(--primary)), 0 0 60px hsl(var(--primary)), 0 0 80px hsl(var(--primary))",
                  "0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary))",
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
              }}
            >
              WELCOME TO UX3
            </motion.h1>
            <motion.p
              className="text-primary/90 text-xl font-mono"
              style={{ textShadow: "0 0 10px hsl(var(--primary))" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              SYSTEM READY • CARDS LOADED • ENJOY
            </motion.p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
