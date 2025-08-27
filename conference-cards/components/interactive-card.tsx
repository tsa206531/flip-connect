"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import CardImage from "./card-image"
import { ZoomIn, RotateCcw, Eye } from "lucide-react"

interface Card {
  id: string
  name: string
  position: string
  frontImageUrl: string
  backImageUrl: string
  createdAt: string
}

interface InteractiveCardProps {
  card: Card
  index: number
  onCardClick?: (card: Card) => void
}

export default function InteractiveCard({ card, index, onCardClick }: InteractiveCardProps) {
  const [isFlipped, setIsFlipped] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest(".zoom-icon")) {
      e.stopPropagation()
      onCardClick?.(card)
      return
    }

    setIsFlipped(!isFlipped)
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
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 rounded-2xl blur-lg" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 rounded-2xl" />
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
            <div className="w-10 h-10 bg-primary/60 rounded-full blur-lg animate-pulse" />
            <div className="absolute inset-1 w-8 h-8 bg-secondary/40 rounded-full blur-md" />
            <div className="absolute inset-2 w-6 h-6 bg-accent/60 rounded-full blur-sm" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="relative w-full h-full cursor-pointer transform-style-preserve-3d z-15"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ 
          duration: 0.8, 
          ease: [0.4, 0, 0.2, 1],
          type: "spring",
          stiffness: 100,
          damping: 15
        }}
        onClick={handleClick}
        whileTap={{ scale: 0.95 }}
      >
        {/* 卡片背面 - 顯示封底圖片 */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          <div className="w-full h-full glass-morphism rounded-2xl shadow-2xl overflow-hidden relative">
            {/* 光效覆蓋 */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 rounded-2xl" />

            <div className="relative w-full h-full">
              <CardImage
                src={card.backImageUrl || "/placeholder.svg"}
                alt={`${card.name} 封底`}
                className="rounded-2xl"
                priority={index < 3} // 前3張卡片優先載入
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 rounded-2xl" />

              {/* 操作按鈕 */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                {/* 放大按鈕 */}
                <motion.div
                  className="zoom-icon"
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: isHovered ? 1 : 0.7 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="bg-black/70 backdrop-blur-sm rounded-full p-3 hover:bg-primary/80 transition-colors cursor-pointer group/btn"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ZoomIn className="w-5 h-5 text-white group-hover/btn:text-primary-foreground" />
                  </motion.div>
                </motion.div>

                {/* 翻轉提示 */}
                <motion.div
                  className="bg-black/70 backdrop-blur-sm rounded-full p-3 transition-colors"
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: isHovered ? 1 : 0.7 }}
                >
                  <RotateCcw className="w-5 h-5 text-white" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* 卡片正面 - 顯示封面圖片 */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
          <div className="w-full h-full glass-morphism rounded-2xl shadow-2xl overflow-hidden relative">
            {/* 光效覆蓋 */}
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-primary/10 rounded-2xl" />

            <div className="relative w-full h-full">
              <CardImage
                src={card.frontImageUrl || "/placeholder.svg"}
                alt={`${card.name} 封面`}
                className="rounded-2xl"
                priority={index < 3} // 前3張卡片優先載入
                isFlipped={!isFlipped}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 rounded-2xl" />

              {/* 操作按鈕 */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                {/* 放大按鈕 */}
                <motion.div
                  className="zoom-icon"
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: isHovered ? 1 : 0.7 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="bg-black/70 backdrop-blur-sm rounded-full p-3 hover:bg-primary/80 transition-colors cursor-pointer group/btn"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ZoomIn className="w-5 h-5 text-white group-hover/btn:text-primary-foreground" />
                  </motion.div>
                </motion.div>

                {/* 翻轉提示 */}
                <motion.div
                  className="bg-black/70 backdrop-blur-sm rounded-full p-3 transition-colors"
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: isHovered ? 1 : 0.7 }}
                >
                  <Eye className="w-5 h-5 text-white" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 翻轉提示文字 */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 z-30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="glass-morphism rounded-lg px-3 py-2 text-xs text-white font-syne whitespace-nowrap">
              {isFlipped ? "點擊查看封面" : "點擊查看封底"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
