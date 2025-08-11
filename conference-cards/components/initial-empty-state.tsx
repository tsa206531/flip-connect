"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Upload, Sparkles, Users, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

export default function InitialEmptyState() {
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

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <motion.div
        className="relative w-full max-w-4xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      >
        {/* 主要內容區域 */}
        <div className="text-center mb-12">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-foreground mb-6 font-noto-sans-tc"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            開始建立您的研討會名片
          </motion.h2>
          <motion.p
            className="text-xl text-muted-foreground font-syne max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            上傳您的個人名片，讓其他參與者提前認識您，為研討會的交流配對做好準備
          </motion.p>
        </div>

        {/* 功能特色 */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {[
            {
              icon: Upload,
              title: "簡單上傳",
              description: "拖拽或點擊上傳封面和封底圖片",
              color: "from-primary to-primary/80"
            },
            {
              icon: Users,
              title: "認識參與者",
              description: "瀏覽其他參與者的名片和職位",
              color: "from-secondary to-secondary/80"
            },
            {
              icon: Calendar,
              title: "現場配對",
              description: "研討會現場抽卡配對交流",
              color: "from-accent to-accent/80"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              className="glass-morphism rounded-2xl p-6 text-center group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 font-noto-sans-tc">{feature.title}</h3>
              <p className="text-muted-foreground text-sm font-syne">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* 主要上傳區域 */}
        <motion.div
          className="relative w-full max-w-2xl mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          {/* 滑鼠光效 */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute pointer-events-none z-20"
                style={{
                  left: mousePosition.x - 30,
                  top: mousePosition.y - 30,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-16 h-16 bg-secondary/60 rounded-full blur-lg animate-pulse" />
                <div className="absolute inset-2 w-12 h-12 bg-primary/40 rounded-full blur-md" />
                <div className="absolute inset-4 w-8 h-8 bg-accent/60 rounded-full blur-sm" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 懸停光效 */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute inset-0 rounded-3xl pointer-events-none z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-primary/10 to-accent/20 rounded-3xl blur-xl" />
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-primary/10 rounded-3xl" />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className="relative cursor-pointer z-15"
            whileHover={{
              scale: 1.02,
              y: -10,
              transition: { duration: 0.3 },
            }}
            whileTap={{ scale: 0.98 }}
          >
            {/* 大型上傳區域 */}
            <div className="w-full aspect-[4/5] glass-morphism rounded-3xl shadow-2xl overflow-hidden border-2 border-dashed border-muted/50 relative group/card">
              {/* 內容 */}
              <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
                {/* 主要圖標 */}
                <motion.div
                  className="mb-8 relative"
                  animate={{
                    scale: isHovered ? 1.3 : 1,
                    rotate: isHovered ? 90 : 0,
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-secondary to-primary rounded-3xl flex items-center justify-center shadow-2xl group-hover/card:shadow-3xl transition-all duration-300">
                    <Plus className="w-12 h-12 text-white" />
                  </div>
                  
                  {/* 發光效果 */}
                  <motion.div
                    className="absolute inset-0 w-24 h-24 bg-gradient-to-br from-secondary/50 to-primary/50 rounded-3xl blur-2xl"
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
                <div className="text-center space-y-3">
                  <motion.h3
                    className="text-3xl font-bold text-foreground font-noto-sans-tc"
                    animate={{
                      color: isHovered ? "hsl(var(--secondary))" : "hsl(var(--foreground))",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    上傳名片
                  </motion.h3>
                  <motion.p
                    className="text-muted-foreground text-lg font-syne"
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
                  className="mt-6 opacity-60"
                  animate={{
                    y: isHovered ? [-8, 8, -8] : 0,
                    opacity: isHovered ? 1 : 0.6,
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut"
                  }}
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </motion.div>
              </div>

              {/* 動態邊框 */}
              <motion.div
                className="absolute inset-0 rounded-3xl border-2 border-transparent"
                animate={{
                  borderColor: isHovered 
                    ? ["rgba(34, 197, 94, 0.4)", "rgba(59, 130, 246, 0.4)", "rgba(34, 197, 94, 0.4)"] 
                    : "rgba(255, 255, 255, 0.1)",
                }}
                transition={{ duration: 0.8 }}
              />

              {/* 浮動粒子效果 */}
              <AnimatePresence>
                {isHovered && (
                  <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-gradient-to-r from-secondary to-primary rounded-full"
                        style={{
                          left: `${10 + (i % 5) * 20}%`,
                          top: `${15 + Math.floor(i / 5) * 20}%`,
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0],
                          y: [-20, 20, -20],
                          x: [-10, 10, -10],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: i * 0.15,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>

              {/* 閃爍效果 */}
              <motion.div
                className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/5 to-transparent"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                  delay: 1.5
                }}
              />
            </div>

            {/* 底部文字 */}
            <motion.div
              className="text-center mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <h3 className="text-2xl font-bold text-foreground group-hover:text-secondary transition-colors duration-300 mb-2">
                點擊上傳
              </h3>
              <p className="text-muted-foreground group-hover:text-primary transition-colors duration-300 font-syne text-lg">
                新增名片
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* 底部提示 */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <div className="glass-morphism rounded-2xl px-6 py-4 inline-block">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-syne">
                成為第一個上傳名片的參與者！
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
