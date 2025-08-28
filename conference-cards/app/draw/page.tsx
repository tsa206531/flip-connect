"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shuffle, Users, ZoomIn, RotateCcw, Eye, Clock, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import OptimizedImage from "@/components/optimized-image"
import CardModal from "@/components/card-modal"
import { useAuth } from "@/contexts/AuthContext"
import { 
  initializeDrawRecord, 
  canDrawCard, 
  recordDrawnCard, 
  formatRemainingTime,
  DRAW_LIMITS,
  type DrawRecord 
} from "@/lib/draw-cache"

interface CardData {
  id: string
  name: string
  position: string
  frontImageUrl: string
  backImageUrl: string
  createdAt: string
  userId?: string
}

interface DrawnCard extends CardData {
  drawnAt: string
}

interface DrawnInteractiveCardProps {
  card: CardData
  index: number
  drawOrder: number
  drawnAt: string
  onCardClick?: (card: CardData) => void
}

function DrawnInteractiveCard({ card, index, drawOrder, drawnAt, onCardClick }: DrawnInteractiveCardProps) {
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
              <OptimizedImage
                src={card.backImageUrl || "/placeholder.svg"}
                alt={`${card.name} 封底`}
                fill
                className="object-cover rounded-2xl"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                priority={index < 3}
                quality={85}
                placeholder="blur"
                fallbackSrc="/placeholder.svg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 rounded-2xl" />

              {/* 抽取順序編號 */}
              <div className="absolute top-4 right-4 bg-green-500/90 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-syne font-bold">
                #{drawOrder}
              </div>
              
              {/* 抽取時間 */}
              <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-syne">
                {new Date(drawnAt).toLocaleString("zh-TW", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </div>

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
              <OptimizedImage
                src={card.frontImageUrl || "/placeholder.svg"}
                alt={`${card.name} 封面`}
                fill
                className="object-cover rounded-2xl"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                priority={index < 3}
                quality={85}
                placeholder="blur"
                fallbackSrc="/placeholder.svg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 rounded-2xl" />

              {/* 抽取順序編號 */}
              <div className="absolute top-4 right-4 bg-green-500/90 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-syne font-bold">
                #{drawOrder}
              </div>
              
              {/* 抽取時間 */}
              <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-syne">
                {new Date(drawnAt).toLocaleString("zh-TW", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </div>

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

export default function DrawPage() {
  const { user } = useAuth()
  const [cards, setCards] = useState<CardData[]>([])
  const [loading, setLoading] = useState(true)
  const [drawing, setDrawing] = useState(false)
  const [drawnCard, setDrawnCard] = useState<CardData | null>(null)
  const [drawHistory, setDrawHistory] = useState<DrawnCard[]>([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isMouseMoving, setIsMouseMoving] = useState(false)
  const [cardFlipped, setCardFlipped] = useState(false)
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [drawDisabled, setDrawDisabled] = useState(false)
  
  // 新的混合緩存系統狀態
  const [drawRecord, setDrawRecord] = useState<DrawRecord | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [remainingCooldown, setRemainingCooldown] = useState<number>(0)
  
  const router = useRouter()

  useEffect(() => {
    fetchCards()
    loadDrawHistory()

    // 讀取後台抽卡開關
    const fetchToggle = async () => {
      try {
        const res = await fetch('/api/admin/draw-toggle', { cache: 'no-store' })
        const data = await res.json()
        setDrawDisabled(data && data.enabled === false)
      } catch {
        setDrawDisabled(false)
      }
    }
    fetchToggle()
    
    // 每 10 秒輪詢一次，保持狀態同步
    const id = setInterval(fetchToggle, 10000)
    return () => clearInterval(id)
  }, [])

  // 當 cards 載入完成且有 drawRecord 時，重建歷史記錄
  useEffect(() => {
    if (cards.length > 0 && drawRecord && drawRecord.drawnCardIds.length > 0) {
      rebuildDrawHistoryFromFirestore(drawRecord.drawnCardIds)
    }
  }, [cards, drawRecord])

  // 初始化抽卡記錄
  useEffect(() => {
    if (!user) return

    const initialize = async () => {
      try {
        setIsInitializing(true)
        setError(null)
        const record = await initializeDrawRecord(user.uid)
        setDrawRecord(record)
        
        // 從 Firestore 的 drawnCardIds 重建 drawHistory
        if (record.drawnCardIds.length > 0) {
          await rebuildDrawHistoryFromFirestore(record.drawnCardIds)
        }
      } catch (error) {
        console.error('初始化抽卡記錄失敗:', error)
        setError('載入抽卡記錄失敗，請重試')
      } finally {
        setIsInitializing(false)
      }
    }

    initialize()
  }, [user])

  // 冷卻時間倒計時
  useEffect(() => {
    if (!drawRecord) return

    const checkCooldown = () => {
      const { canDraw, remainingTime } = canDrawCard(drawRecord)
      if (!canDraw && remainingTime) {
        setRemainingCooldown(remainingTime)
      } else {
        setRemainingCooldown(0)
      }
    }

    checkCooldown()
    const interval = setInterval(checkCooldown, 1000)
    return () => clearInterval(interval)
  }, [drawRecord])

  const fetchCards = async () => {
    try {
      // First try to fetch from API
      const apiResponse = await fetch("/api/cards", { cache: "no-store" })
      let apiCards: CardData[] = []
      if (apiResponse.ok) {
        const apiData = await apiResponse.json()
        apiCards = (apiData.cards || []).filter(
          (card: CardData) =>
            card.id && card.name && card.position && card.frontImageUrl && card.backImageUrl && card.createdAt,
        )
      }

      // Also fetch mock data from JSON file
      const mockResponse = await fetch("/carddata.json", { cache: "no-store" })
      let mockCards: CardData[] = []
      if (mockResponse.ok) {
        mockCards = await mockResponse.json()
        console.log("Fetched mock cards for draw:", mockCards.length)
      }

      // 去重合併：優先使用 API 卡片，避免重複
      const combinedCards = [...apiCards]
      
      // 只添加不重複的 mock 卡片
      mockCards.forEach(mockCard => {
        const isDuplicate = apiCards.some(apiCard => 
          apiCard.id === mockCard.id || 
          (apiCard.name === mockCard.name && apiCard.position === mockCard.position)
        )
        if (!isDuplicate) {
          combinedCards.push(mockCard)
        }
      })
      
      console.log("API cards for draw:", apiCards.length)
      console.log("Mock cards for draw:", mockCards.length) 
      console.log("Combined cards for draw (after deduplication):", combinedCards.length)
      setCards(combinedCards)
    } catch (error) {
      console.error("Failed to fetch cards:", error)
      setCards([])
    } finally {
      setLoading(false)
    }
  }

  const loadDrawHistory = () => {
    const saved = localStorage.getItem("drawHistory")
    if (saved) {
      try {
        setDrawHistory(JSON.parse(saved))
      } catch (error) {
        console.error("Failed to load draw history:", error)
      }
    }
  }

  const saveDrawHistory = (history: DrawnCard[]) => {
    localStorage.setItem("drawHistory", JSON.stringify(history))
  }

  // 從 Firestore 的 drawnCardIds 重建 drawHistory
  const rebuildDrawHistoryFromFirestore = async (drawnCardIds: string[]) => {
    try {
      console.log('=== 重建抽卡歷史 ===')
      console.log('要重建的卡片ID:', drawnCardIds)
      console.log('可用的卡片總數:', cards.length)
      console.log('drawRecord:', drawRecord)
      
      // 確保 cards 已載入
      if (cards.length === 0) {
        console.log('等待卡片資料載入...')
        return
      }
      
      // 根據 drawnCardIds 找到對應的卡片資料
      const drawnCards: DrawnCard[] = []
      const notFoundIds: string[] = []
      
      for (const cardId of drawnCardIds) {
        const card = cards.find(c => c.id === cardId)
        if (card) {
          // 使用記錄的抽卡時間，如果沒有則使用當前時間
          const drawnAt = drawRecord?.drawnCardTimestamps?.[cardId] 
            ? new Date(drawRecord.drawnCardTimestamps[cardId]).toISOString()
            : new Date().toISOString()
            
          drawnCards.push({
            ...card,
            drawnAt
          })
          console.log(`✓ 找到卡片: ${cardId} - ${card.name} (抽取時間: ${drawnAt})`)
        } else {
          notFoundIds.push(cardId)
          console.warn(`✗ 找不到卡片ID: ${cardId}`)
        }
      }
      
      console.log('成功重建的卡片數量:', drawnCards.length)
      console.log('找不到的卡片ID:', notFoundIds)
      
      if (drawnCards.length > 0) {
        // 按抽卡時間排序（最新在前）
        const sortedCards = drawnCards.sort((a, b) => 
          new Date(b.drawnAt).getTime() - new Date(a.drawnAt).getTime()
        )
        
        setDrawHistory(sortedCards)
        saveDrawHistory(sortedCards)
        console.log('✓ 抽卡歷史已更新到狀態和 localStorage')
      } else {
        console.log('⚠ 沒有找到任何有效的卡片')
      }
      
    } catch (error) {
      console.error('重建抽卡歷史失敗:', error)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setMousePosition({
      x: e.clientX,
      y: e.clientY,
    })
    setIsMouseMoving(true)
    setTimeout(() => setIsMouseMoving(false), 100)
  }

  // 獲取可抽取的卡片
  const getAvailableCards = (): CardData[] => {
    if (!drawRecord) return []
    
    return cards.filter(card => {
      // 排除自己的卡片
      if (user && card.userId === user.uid) {
        return false
      }
      
      // 排除已抽過的卡片
      if (drawRecord.drawnCardIds.includes(card.id)) {
        return false
      }
      
      return true
    })
  }

  const drawCard = async () => {
    if (!user || !drawRecord) return

    // 檢查是否可以抽卡
    const { canDraw, reason } = canDrawCard(drawRecord)
    if (!canDraw) {
      setError(reason || '無法抽卡')
      return
    }

    const availableCards = getAvailableCards()
    if (availableCards.length === 0) {
      setError('沒有可抽取的卡片了！')
      return
    }

    setDrawing(true)
    setDrawnCard(null)
    setCardFlipped(false)
    setError(null)

    try {
      // 抽卡動畫延遲
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // 隨機選擇一張卡片
      const randomIndex = Math.floor(Math.random() * availableCards.length)
      const selectedCard = availableCards[randomIndex]

      // 記錄抽卡到新系統
      const updatedRecord = await recordDrawnCard(user.uid, selectedCard.id)
      setDrawRecord(updatedRecord)
      
      setDrawnCard(selectedCard)

      // 立即重建 drawHistory 以反映最新的抽卡記錄
      if (updatedRecord.drawnCardIds.length > 0) {
        await rebuildDrawHistoryFromFirestore(updatedRecord.drawnCardIds)
      }

    } catch (error) {
      console.error('抽卡失敗:', error)
      setError('抽卡失敗，請重試')
    } finally {
      setDrawing(false)
    }
  }

  const resetDraw = () => {
    setDrawnCard(null)
    setCardFlipped(false)
  }


  const flipCard = () => {
    setCardFlipped(!cardFlipped)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedCard(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white font-syne">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden" onMouseMove={handleMouseMove}>
      {/* Global cursor glow effect */}
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

      {/* Background gradient effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-green-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-400/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            className="text-gray-300 hover:text-white p-2 hover:bg-gray-800/50"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            返回
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1
              className="text-5xl font-bold text-green-400 mb-4 font-noto-sans-tc"
              style={{ textShadow: "0 0 15px #22c55e, 0 0 30px #22c55e" }}
            >
              抽卡活動
            </h1>
            <p className="text-xl text-gray-300 font-syne mb-2">隨機抽取參與者名片</p>
            <p className="text-gray-400 font-syne flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              目前共有 {cards.length} 張名片
            </p>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {!drawnCard ? (
            /* Draw Button Section */
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="mb-8">
                <motion.div className="relative inline-block" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  {/* 透明磨沙抽卡按鈕 */}
                  <Button
                    onClick={drawCard}
                    disabled={
                      drawDisabled ||
                      drawing || 
                      !user || 
                      !drawRecord || 
                      isInitializing ||
                      getAvailableCards().length === 0 ||
                      remainingCooldown > 0 ||
                      (drawRecord && drawRecord.drawCount >= DRAW_LIMITS.MAX_DRAWS)
                    }
                    className={`relative h-32 w-32 rounded-full backdrop-blur-md border-2 font-bold text-xl shadow-2xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed ${drawDisabled ? 'bg-gray-700/40 border-gray-500/40 text-gray-400' : 'bg-white/10 border-green-400/30 hover:bg-white/15 hover:border-green-400/50 text-green-300'}`}
                    style={{
                      boxShadow:
                        "0 0 20px rgba(34, 197, 94, 0.3), 0 0 40px rgba(34, 197, 94, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                      textShadow: "0 0 12px #10b981, 0 0 24px #10b981",
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {drawing ? (
                        <motion.div
                          key="drawing"
                          initial={{ opacity: 0, rotate: -180 }}
                          animate={{ opacity: 1, rotate: 0 }}
                          exit={{ opacity: 0, rotate: 180 }}
                          className="flex flex-col items-center"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          >
                            <Shuffle
                              className="w-8 h-8 mb-2 text-green-400"
                              style={{ filter: "drop-shadow(0 0 8px #22c55e)" }}
                            />
                          </motion.div>
                          <span
                            className="text-sm text-green-300"
                            style={{ textShadow: "0 0 12px #10b981, 0 0 24px #10b981" }}
                          >
                            抽卡中...
                          </span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="ready"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex flex-col items-center"
                        >
                          <span
                            className={`text-sm ${drawDisabled ? 'text-gray-400' : 'text-green-300'}`}
                            style={{ textShadow: drawDisabled ? undefined : "0 0 12px #10b981, 0 0 24px #10b981" }}
                          >
                            {drawDisabled ? '禁止抽卡' : '開始抽卡'}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* 內部光效 */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-green-400/10 to-transparent"
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                    />

                    {/* Sparkle effects */}
                    {drawing && (
                      <div className="absolute inset-0 pointer-events-none">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-green-400 rounded-full"
                            style={{
                              left: `${20 + (i % 4) * 20}%`,
                              top: `${20 + Math.floor(i / 4) * 60}%`,
                              filter: "drop-shadow(0 0 4px #22c55e)",
                            }}
                            animate={{
                              scale: [0, 1, 0],
                              opacity: [0, 1, 0],
                              rotate: [0, 180, 360],
                            }}
                            transition={{
                              duration: 1,
                              repeat: Number.POSITIVE_INFINITY,
                              delay: i * 0.1,
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </Button>

                  {/* 外部光暈效果 */}
                  <motion.div
                    className="absolute inset-0 rounded-full pointer-events-none -z-10"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 50%, transparent 70%)",
                      filter: "blur(20px)",
                    }}
                    animate={{
                      scale: drawing ? [1, 1.3, 1] : [1, 1.1, 1],
                      opacity: drawing ? [0.3, 0.6, 0.3] : [0.2, 0.4, 0.2],
                    }}
                    transition={{
                      duration: drawing ? 1 : 2,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  />
                </motion.div>
              </div>

              {cards.length === 0 && <p className="text-gray-400 font-syne">目前沒有名片可以抽取</p>}
            </motion.div>
          ) : (
            /* Drawn Card Display */
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Card Display */}
              <div className="flex justify-center mb-8">
                <motion.div
                  className="relative perspective-1000"
                  initial={{ rotateY: -90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <motion.div
                    className="relative w-80 h-[490px] cursor-pointer transform-style-preserve-3d"
                    animate={{ rotateY: cardFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    onClick={flipCard}
                  >
                    {/* Card Back */}
                    <div className="absolute inset-0 w-full h-full backface-hidden">
                      <div className="w-full h-full bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden relative border border-gray-700/50">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-transparent to-green-400/20 rounded-2xl"></div>
                        <div className="relative w-full h-full">
                          <OptimizedImage
                            src={drawnCard.backImageUrl || "/placeholder.svg"}
                            alt={`${drawnCard.name} 封底`}
                            fill
                            className="object-cover rounded-2xl"
                            sizes="320px"
                            priority
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 rounded-2xl"></div>
                        </div>
                      </div>
                    </div>

                    {/* Card Front */}
                    <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
                      <div className="w-full h-full bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden relative border border-gray-700/50">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-transparent to-green-500/20 rounded-2xl"></div>
                        <div className="relative w-full h-full">
                          <OptimizedImage
                            src={drawnCard.frontImageUrl || "/placeholder.svg"}
                            alt={`${drawnCard.name} 封面`}
                            fill
                            className="object-cover rounded-2xl"
                            sizes="320px"
                            priority
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 rounded-2xl"></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Card Info */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <h3 className="text-3xl font-bold text-white mb-2 font-noto-sans-tc">{drawnCard.name}</h3>
                <p className="text-xl text-gray-300 font-syne">{drawnCard.position}</p>
                <p className="text-gray-500 text-sm mt-2 font-syne">點擊卡片翻面查看</p>
              </motion.div>

              {/* Action Buttons - 透明磨沙設計 */}
              <motion.div
                className="flex gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <Button
                  onClick={resetDraw}
                  variant="outline"
                  className="bg-white/10 backdrop-blur-md border-2 border-green-400/30 hover:bg-white/15 hover:border-green-400/50 text-green-400 font-syne px-6 py-3"
                  style={{
                    boxShadow: "0 0 15px rgba(34, 197, 94, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                    textShadow: "0 0 8px #22c55e",
                  }}
                >
                  關閉抽卡
                </Button>
                <Button
                  onClick={drawCard}
                  disabled={drawing}
                  className="bg-white/10 backdrop-blur-md border-2 border-green-400/30 hover:bg-white/15 hover:border-green-400/50 text-green-400 font-syne px-6 py-3 disabled:opacity-50"
                  style={{
                    boxShadow: "0 0 15px rgba(34, 197, 94, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                    textShadow: "0 0 8px #22c55e",
                  }}
                >
                  再抽一張
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* 已抽取的卡片顯示區域 */}
        {drawHistory.length > 0 && (
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-green-400 mb-4 font-noto-sans-tc">
                已抽取的卡片
              </h2>
              <p className="text-gray-300 font-syne">
                共抽取了 {drawHistory.length} 張卡片
              </p>
            </div>

            <div className="cards-container">
              {drawHistory.map((card, index) => (
                <motion.div
                  key={`${card.id}-${card.drawnAt}`}
                  className="card-wrapper"
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                >
                  <DrawnInteractiveCard 
                    card={card} 
                    index={index} 
                    drawOrder={drawHistory.length - index} 
                    drawnAt={card.drawnAt}
                    onCardClick={(card) => {
                      setSelectedCard(card)
                      setIsModalOpen(true)
                    }}
                  />
                  
                  <div className="card-info">
                    <h3 className="card-name">{card.name}</h3>
                    <p className="card-position">{card.position}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}


        {/* Card Modal */}
        <CardModal card={selectedCard} isOpen={isModalOpen} onClose={handleModalClose} />
      </div>
    </div>
  )
}
