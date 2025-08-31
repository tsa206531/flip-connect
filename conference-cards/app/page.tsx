"use client"

import type React from "react"
import { Suspense, useState, useEffect } from "react"
import CardGrid from "@/components/card-grid"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"
const MatrixLoading = dynamic(() => import("@/components/matrix-loading"), { ssr: false })
import DrawCard from "@/components/draw-card"
import UserMenu from "@/components/user-menu"
import { Download, FileImage, Sparkles, Users, Calendar, Shuffle, Eye } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { HomeCheck } from "@/components/HomeCheck"
import { useAuth } from "@/contexts/AuthContext"
import CardModal from "@/components/card-modal"






interface Card {
  id: string
  name: string
  position: string
  frontImageUrl: string
  backImageUrl: string
  createdAt: string
  userId?: string  // 添加 userId 字段来识别卡片所有者
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
      className="mb-8 pt-8"
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

function FeatureHighlights({ onViewMyCard }: { onViewMyCard: () => void }) {
  const features = [
    {
      icon: Download,
      title: "下載模板",
      description: "使用專業設計模板製作名片",
      color: "from-blue-500 to-cyan-500",
      onClick: () => window.open("https://www.figma.com/design/NSEoYuzHTWzkDqReTYPgDO/2025-UX-%E4%B8%89%E5%88%80%E6%B5%81-%E4%BA%A4%E6%B5%81%E7%A0%94%E8%A8%8E%E5%B9%B4%E6%9C%83?node-id=0-1&p=f&t=Nl51XNjkc5zNICry-0", "_blank")
    },
    {
      icon: Eye,
      title: "檢視我的卡片",
      description: "查看您上傳的名片內容",
      color: "from-green-500 to-emerald-500",
      onClick: onViewMyCard
    },
    {
      icon: Calendar,
      title: "現場抽卡",
      description: "研討會現場抽卡配對交流",
      color: "from-orange-500 to-red-500",
      onClick: () => window.location.href = "/draw"
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
          className={`glass-morphism glass-morphism-hover rounded-2xl p-6 text-center group ${feature.onClick ? 'cursor-pointer' : ''}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
          whileHover={{ y: -5, scale: 1.02 }}
          onClick={feature.onClick}
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

export default function Page() {
  const { user } = useAuth()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isMouseMoving, setIsMouseMoving] = useState(false)
  const [showLoading, setShowLoading] = useState(true)
  const [showDrawModal, setShowDrawModal] = useState(false)
  const [cards, setCards] = useState<Card[]>([])
  const [showUserCardModal, setShowUserCardModal] = useState(false)
  const [selectedUserCard, setSelectedUserCard] = useState<Card | null>(null)

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

  const handleViewMyCard = () => {
    if (!user) {
      // 如果用户未登录，可以提示登录
      alert("請先登入以查看您的名片")
      return
    }

    // 找到使用者所有自己的卡片，並取最新一張
    const userCards = cards.filter(card => card.userId === user.uid)

    if (userCards.length > 0) {
      const parseTime = (v: any) => {
        try {
          if (!v) return 0
          // 兼容字串/時間戳/Date
          if (typeof v === 'string') return new Date(v).getTime() || 0
          if (typeof v === 'number') return v
          if (typeof v?.toDate === 'function') return v.toDate().getTime()
          if (v instanceof Date) return v.getTime()
          return 0
        } catch { return 0 }
      }

      const latestUserCard = [...userCards].sort((a, b) => parseTime(b.createdAt as any) - parseTime(a.createdAt as any))[0]

      setSelectedUserCard(latestUserCard)
      setShowUserCardModal(true)
    } else {
      // 如果用户还没有上传卡片
      alert("您還沒有上傳名片，請先上傳您的名片")
    }
  }

  if (showLoading) {
    return <MatrixLoading onComplete={handleLoadingComplete} />
  }

  return (
    <main>
    <motion.div
      className="min-h-screen bg-black relative overflow-hidden"
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background gradient effects - 增強光球顯示 */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/40 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-green-400/35 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.35, 0.7, 0.35],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-400/30 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 4
          }}
        />
      </div>

      {/* Global cursor glow effect - 與 /draw 頁面一致 */}
      <motion.div
        className="fixed pointer-events-none z-40"
        style={{
          left: mousePosition.x - 30,
          top: mousePosition.y - 30,
        }}
        animate={{
          opacity: isMouseMoving ? 0.45 : 0,
          scale: isMouseMoving ? 1 : 0.8,
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="w-16 h-16 bg-yellow-400/45 rounded-full blur-xl"></div>
        <div className="absolute inset-2 w-12 h-12 bg-yellow-300/35 rounded-full blur-lg"></div>
        <div className="absolute inset-4 w-8 h-8 bg-yellow-200/50 rounded-full blur-md"></div>
      </motion.div>

      {/* 用戶選單 */}
      <motion.div
        className="fixed left-[calc(1rem+env(safe-area-inset-left))] bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 md:absolute md:top-6 md:left-6 md:bottom-auto"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <UserMenu />
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
            <span>2025 UX 三刀流</span>{' '}<span className="inline max-[450px]:block">交流研討年會</span>
          </motion.h1>

          <DynamicSubtitle />

        </motion.div>

        {/* 功能特色 */}
        <FeatureHighlights onViewMyCard={handleViewMyCard} />


        {/* 卡片網格 */}
        <Suspense fallback={<CardGridSkeleton />}>
          <CardGrid onCardsLoaded={setCards} />
        </Suspense>
      </div>


      {/* 抽卡模態框 */}
      <DrawCard 
        cards={cards} 
        isOpen={showDrawModal} 
        onClose={() => setShowDrawModal(false)}
        currentUserId={user?.uid}
      />

      {/* 用户卡片查看模態框 */}
      <CardModal 
        card={selectedUserCard} 
        isOpen={showUserCardModal} 
        onClose={() => {
          setShowUserCardModal(false)
          setSelectedUserCard(null)
        }} 
      />
    </motion.div>
    </main>
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
