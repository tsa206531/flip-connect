"use client"

import { useState, useEffect } from "react"
import InteractiveCard from "./interactive-card"
import EmptyCard from "./empty-card"
import InitialEmptyState from "./initial-empty-state"
import CardModal from "./card-modal"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Calendar, Sparkles } from "lucide-react"






interface Card {
  id: string
  name: string
  position: string
  frontImageUrl: string
  backImageUrl: string
  createdAt: string
}

interface CardGridProps {
  onCardsLoaded?: (cards: Card[]) => void
}

export default function CardGrid({ onCardsLoaded }: CardGridProps) {
  const [allCards, setAllCards] = useState<Card[]>([])
  const [displayedCards, setDisplayedCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  
  // 分頁配置
  const INITIAL_LOAD = 8  // 初始載入8張
  const LOAD_MORE = 4     // 每次載入4張
  const MAX_CARDS = 20    // 最多20張

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    try {
      // First try to fetch from API
      const apiResponse = await fetch("/api/cards", {
        cache: "no-store",
      })
      
      let apiCards: Card[] = []
      if (apiResponse.ok) {
        const apiData = await apiResponse.json()
        apiCards = (apiData.cards || []).filter(
          (card: Card) =>
            card.id && card.name && card.position && card.frontImageUrl && card.backImageUrl && card.createdAt,
        )
      }

      // Also fetch mock data from JSON file
      const mockResponse = await fetch("/carddata.json", {
        cache: "no-store",
      })
      
      let mockCards: Card[] = []
      if (mockResponse.ok) {
        mockCards = await mockResponse.json()
        console.log("Fetched mock cards:", mockCards.length)
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
      
      console.log("API cards:", apiCards.length)
      console.log("Mock cards:", mockCards.length) 
      console.log("Combined cards (after deduplication):", combinedCards.length)
      
      // 限制最大卡片數量
      const limitedCards = combinedCards.slice(0, MAX_CARDS)
      
      setAllCards(limitedCards)
      
      // 初始只顯示前8張
      const initialCards = limitedCards.slice(0, INITIAL_LOAD)
      setDisplayedCards(initialCards)
      
      // 檢查是否還有更多卡片
      setHasMore(limitedCards.length > INITIAL_LOAD)
      
      onCardsLoaded?.(limitedCards)
    } catch (error) {
      console.error("Failed to fetch cards:", error)
      setAllCards([])
      setDisplayedCards([])
      setHasMore(false)
      onCardsLoaded?.([])
    } finally {
      setLoading(false)
    }
  }

  const refreshCards = () => {
    setLoading(true)
    fetchCards()
  }

  const loadMoreCards = () => {
    if (loadingMore || !hasMore) return
    
    setLoadingMore(true)
    
    // 模擬載入延遲，提供更好的用戶體驗
    setTimeout(() => {
      const currentCount = displayedCards.length
      const nextBatch = allCards.slice(currentCount, currentCount + LOAD_MORE)
      const newDisplayedCards = [...displayedCards, ...nextBatch]
      
      setDisplayedCards(newDisplayedCards)
      setHasMore(newDisplayedCards.length < allCards.length)
      setLoadingMore(false)
    }, 500)
  }

  const handleCardClick = (card: Card) => {
    setSelectedCard(card)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedCard(null)
  }

  useEffect(() => {
    const handleFocus = () => {
      fetchCards()
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [])

  // 滾動檢測，自動載入更多
  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore) return
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      
      // 當滾動到距離底部200px時載入更多
      if (scrollTop + windowHeight >= documentHeight - 200) {
        loadMoreCards()
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loadingMore, hasMore, displayedCards.length, allCards.length])

  if (loading) {
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

  // If no cards at all, show the large initial empty state
  if (allCards.length === 0) {
    console.log("No cards found, showing initial empty state")
    return <InitialEmptyState />
  }

  // If there are some cards, show them with one empty card at the beginning
  console.log("Rendering cards:", displayedCards.length, "of", allCards.length)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* 統計資訊 */}
      <motion.div
        className="flex justify-center items-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="glass-morphism rounded-2xl px-6 py-4 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-foreground font-semibold">{allCards.length}</span>
            <span className="text-muted-foreground">位參與者</span>
          </div>
          <div className="w-px h-6 bg-border/50" />
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-secondary" />
            <span className="text-foreground font-semibold">研討會</span>
            <span className="text-muted-foreground">即將開始</span>
          </div>
        </div>
      </motion.div>

      <div className="cards-container">
        {/* First position: Single empty card for upload */}
        <motion.div
          className="card-wrapper"
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <EmptyCard index={0} />
          <div className="card-info">
            <h3 className="card-name text-muted-foreground">點擊上傳</h3>
            <p className="card-position text-muted-foreground/70">新增名片</p>
          </div>
        </motion.div>

        {/* Render actual uploaded cards starting from second position */}
        {displayedCards.map((card, index) => (
          <motion.div
            key={card.id}
            className="card-wrapper"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.6, 
              delay: 0.4 + (index + 1) * 0.1,
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
          >
            <InteractiveCard card={card} index={index + 1} onCardClick={handleCardClick} />
            <div className="card-info">
              <h3 className="card-name">{card.name}</h3>
              <p className="card-position">{card.position}</p>
            </div>
          </motion.div>
        ))}

        {/* 載入更多指示器 */}
        {loadingMore && (
          <motion.div
            className="card-wrapper"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card-item bg-card/30 rounded-2xl backdrop-blur-sm border border-border/30 flex items-center justify-center">
              <div className="flex flex-col items-center space-y-3">
                <div className="shimmer-wrapper w-16 h-16 rounded-full bg-gray-200">
                  <div className="shimmer"></div>
                </div>
                <span className="text-muted-foreground text-sm font-syne">載入中...</span>
              </div>
            </div>
            <div className="card-info">
              <div className="h-5 bg-muted/50 rounded mb-2 animate-pulse" />
              <div className="h-4 bg-muted/30 rounded animate-pulse" />
            </div>
          </motion.div>
        )}
      </div>

      {/* 底部提示 */}
      <motion.div
        className="text-center mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="glass-morphism rounded-2xl px-6 py-4 inline-block">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-syne">
              點擊卡片可翻轉查看，點擊放大鏡可查看大圖
            </span>
          </div>
          
          {/* 載入進度提示 */}
          {allCards.length > INITIAL_LOAD && (
            <div className="text-xs text-muted-foreground/70 font-syne">
              {hasMore ? (
                <span>顯示 {displayedCards.length} / {allCards.length} 張卡片 • 向下滾動載入更多</span>
              ) : (
                <span>已顯示全部 {displayedCards.length} 張卡片</span>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Card Modal */}
      <CardModal card={selectedCard} isOpen={isModalOpen} onClose={handleModalClose} />
    </motion.div>
  )
}
