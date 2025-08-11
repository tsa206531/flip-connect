"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Upload, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

interface EmptyCardProps {
  index: number
}

export default function EmptyCard({ index }: EmptyCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const router = useRouter()

  const handleClick = () => {
    router.push("/upload")
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  // 創建交錯的浮動動畫
  const floatingAnimation = {
    y: [-8, 8, -8],
    transition: {
      duration: 3 + (index % 3) * 0.5,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
      delay: index * 0.2,
    },
  }

  return (
    <motion.div
      className="card-item perspective-1000 relative group"
      animate={floatingAnimation}
      whileHover={{
        scale: 1.05,
        y: -15,
        transition: { duration: 0.4, ease: "easeOut" },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {/* 懸停時的光效 */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-primary/10 to-accent/20 rounded-2xl blur-lg" />
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-primary/10 rounded-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 滑鼠光效 */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute pointer-events-none z-20"
            style={{
              left: mousePosition.x - 20,
              top: mousePosition.y - 20,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-10 h-10 bg-secondary/60 rounded-full blur-lg animate-pulse" />
            <div className="absolute inset-1 w-8 h-8 bg-primary/40 rounded-full blur-md" />
            <div className="absolute inset-2 w-6 h-6 bg-accent/60 rounded-full blur-sm" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="relative w-full h-full cursor-pointer z-15" 
        whileTap={{ scale: 0.95 }}
      >
        {/* 空卡片設計 */}
        <div className="w-full h-full glass-morphism rounded-2xl shadow-2xl overflow-hidden border-2 border-dashed border-muted/50 relative group/card">
          {/* 內容 */}
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6">
            {/* 主要圖標 */}
            <motion.div
              className="mb-6 relative"
              animate={{
                scale: isHovered ? 1.2 : 1,
                rotate: isHovered ? 90 : 0,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-secondary to-primary rounded-2xl flex items-center justify-center shadow-lg group-hover/card:shadow-2xl transition-all duration-300">
                <Plus className="w-10 h-10 text-white" />
              </div>
              
              {/* 發光效果 */}
              <motion.div
                className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-secondary/50 to-primary/50 rounded-2xl blur-xl"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut"
                }}
              />
            </motion.div>

            {/* 文字內容 */}
            <div className="text-center space-y-2">
              <motion.h3
                className="text-xl font-bold text-white font-noto-sans-tc"
                animate={{
                  color: isHovered ? "hsl(var(--secondary))" : "hsl(var(--foreground))",
                }}
                transition={{ duration: 0.3 }}
              >
                上傳名片
              </motion.h3>
              <motion.p
                className="text-muted-foreground text-sm font-syne"
                animate={{
                  color: isHovered ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                }}
                transition={{ duration: 0.3 }}
              >
                點擊開始製作您的名片
              </motion.p>
            </div>

            {/* 上傳提示圖標 */}
            <motion.div
              className="mt-4 opacity-60"
              animate={{
                y: isHovered ? [-5, 5, -5] : 0,
                opacity: isHovered ? 1 : 0.6,
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut"
              }}
            >
              <Upload className="w-6 h-6 text-muted-foreground" />
            </motion.div>
          </div>

          {/* 動態邊框 */}
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-transparent"
            animate={{
              borderColor: isHovered 
                ? ["rgba(34, 197, 94, 0.3)", "rgba(59, 130, 246, 0.3)", "rgba(34, 197, 94, 0.3)"] 
                : "rgba(255, 255, 255, 0.1)",
            }}
            transition={{ duration: 0.6 }}
          />

          {/* 浮動粒子效果 */}
          <AnimatePresence>
            {isHovered && (
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-gradient-to-r from-secondary to-primary rounded-full"
                    style={{
                      left: `${15 + i * 10}%`,
                      top: `${20 + (i % 2) * 60}%`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      y: [-10, 10, -10],
                      x: [-5, 5, -5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* 閃爍效果 */}
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
              delay: 1
            }}
          />
        </div>
      </motion.div>

      {/* 懸停提示 */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 z-30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="glass-morphism rounded-lg px-3 py-2 text-xs text-white font-syne whitespace-nowrap flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-secondary" />
              點擊上傳名片
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
