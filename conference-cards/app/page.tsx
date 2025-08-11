"use client"

import type React from "react"
import { Suspense, useState, useEffect } from "react"
import CardGrid from "@/components/card-grid"
import { Button } from "@/components/ui/button"
import AdminLoginModal from "@/components/admin-login-modal"
import MatrixLoading from "@/components/matrix-loading"
import DrawCard from "@/components/draw-card"
import { Download, FileImage, Sparkles, Users, Calendar, Shuffle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Card {
  id: string
  name: string
  position: string
  frontImageUrl: string
  backImageUrl: string
  createdAt: string
}

function DynamicSubtitle() {
  const subtitles = [
    "下一個改變世界的合作，可能就在下一張卡片",
    "翻一翻，也許你的獨角獸合夥人就在這裡",
    "每張卡片背後，都藏著一個改變你人生的機會",
    "翻牌如開盲盒，驚喜合作等著你",
    "找到你缺少的那塊拼圖",
    "技能互補，火花四射",
    "你的弱項，正好是我的強項",
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % subtitles.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          className="dynamic-subtitle inline-block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {subtitles[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  )
}

function FeatureHighlights() {
  const features = [
    {
      icon: Download,
      title: "下載模板",
      description: "使用專業設計模板製作名片",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "認識參與者",
      description: "提前了解研討會參與者",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Calendar,
      title: "現場抽卡",
      description: "研討會現場抽卡配對交流",
      color: "from-orange-500 to-red-500"
    }
  ]

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          className="glass-morphism glass-morphism-hover rounded-2xl p-6 text-center group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
          whileHover={{ y: -5, scale: 1.02 }}
        >
          <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <feature.icon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 font-noto-sans-tc">{feature.title}</h3>
          <p className="text-muted-foreground text-sm font-syne">{feature.description}</p>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isMouseMoving, setIsMouseMoving] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [showLoading, setShowLoading] = useState(true)
  const [showDrawModal, setShowDrawModal] = useState(false)
  const [cards, setCards] = useState<Card[]>([])

  const handleLoadingComplete = () => {
    setShowLoading(false)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setMousePosition({
      x: e.clientX,
      y: e.clientY,
    })
    setIsMouseMoving(true)

    setTimeout(() => setIsMouseMoving(false), 100)
  }

  const handleDownloadTemplate = () => {
    const link = document.createElement("a")
    link.href = "/templates/card-template.fig"
    link.download = "UX3研討會名片模板.fig"
    link.click()
  }

  if (showLoading) {
    return <MatrixLoading onComplete={handleLoadingComplete} />
  }

  return (
    <motion.div
      className="min-h-screen bg-background relative overflow-hidden"
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 動態背景效果 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 主背景漸層 */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
        
        {/* 浮動光球效果 */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 4
          }}
        />
        
        {/* 網格背景 */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* 滑鼠光效 */}
      <motion.div
        className="fixed pointer-events-none z-50"
        style={{
          left: mousePosition.x - 30,
          top: mousePosition.y - 30,
        }}
        animate={{
          opacity: isMouseMoving ? 0.6 : 0,
          scale: isMouseMoving ? 1 : 0.8,
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="w-16 h-16 bg-primary/40 rounded-full blur-xl" />
        <div className="absolute inset-2 w-12 h-12 bg-secondary/30 rounded-full blur-lg" />
        <div className="absolute inset-4 w-8 h-8 bg-accent/40 rounded-full blur-md" />
      </motion.div>

      {/* 管理員按鈕 */}
      <motion.div
        className="absolute top-6 left-6 z-40"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Button
          onClick={() => setShowAdminModal(true)}
          variant="ghost"
          className="glass-morphism glass-morphism-hover text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl font-syne text-sm"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          sammi
        </Button>
      </motion.div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* 頁面標題區域 */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h1
            className="conference-title mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            UX3 三刀流交流研討會
          </motion.h1>

          <DynamicSubtitle />

          {/* 下載模板按鈕 */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <motion.div
              className="inline-block"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleDownloadTemplate}
                className="glow-button text-white px-8 py-4 rounded-2xl font-syne text-lg font-semibold h-auto"
              >
                <Download className="w-5 h-5 mr-3" />
                下載名片模板
              </Button>
            </motion.div>
            <motion.p
              className="text-muted-foreground text-sm mt-3 font-syne"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              Figma 設計模板，幫助您製作專業名片
            </motion.p>
          </motion.div>
        </motion.div>

        {/* 功能特色 */}
        <FeatureHighlights />

        {/* 抽卡按鈕 */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <motion.div
            className="inline-block"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => setShowDrawModal(true)}
              className="bg-gradient-to-r from-secondary to-accent text-white px-8 py-4 rounded-2xl font-syne text-lg font-semibold h-auto shadow-lg hover:shadow-xl"
            >
              <Shuffle className="w-5 h-5 mr-3" />
              現場抽卡配對
            </Button>
          </motion.div>
          <motion.p
            className="text-muted-foreground text-sm mt-3 font-syne"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            研討會現場進行抽卡配對，促進參與者交流
          </motion.p>
        </motion.div>

        {/* 卡片網格 */}
        <Suspense fallback={<CardGridSkeleton />}>
          <CardGrid onCardsLoaded={setCards} />
        </Suspense>
      </div>

      {/* 管理員登入模態框 */}
      <AdminLoginModal isOpen={showAdminModal} onClose={() => setShowAdminModal(false)} />

      {/* 抽卡模態框 */}
      <DrawCard 
        cards={cards} 
        isOpen={showDrawModal} 
        onClose={() => setShowDrawModal(false)} 
      />
    </motion.div>
  )
}

function CardGridSkeleton() {
  return (
    <div className="cards-container">
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="card-wrapper"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
        >
          <div className="card-item bg-card/50 rounded-2xl animate-pulse backdrop-blur-sm border border-border/50" />
          <div className="card-info">
            <div className="h-5 bg-muted rounded mb-2 animate-pulse" />
            <div className="h-4 bg-muted/70 rounded animate-pulse" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
