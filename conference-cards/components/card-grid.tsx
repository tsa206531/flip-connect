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
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    try {
      const response = await fetch("/api/cards", {
        cache: "no-store",
      })
      if (response.ok) {
        const data = await response.json()
        console.log("Fetched cards:", data.cards?.length || 0)

        // Only set real uploaded cards, filter out any potential mock data
        const realCards = (data.cards || []).filter(
          (card: Card) =>
            card.id && card.name && card.position && card.frontImageUrl && card.backImageUrl && card.createdAt,
        )

        console.log("Real cards after filtering:", realCards.length)
        setCards(realCards)
        onCardsLoaded?.(realCards)
      }
    } catch (error) {
      console.error("Failed to fetch cards:", error)
      setCards([]) // Ensure empty array on error
      onCardsLoaded?.([])
    } finally {
      setLoading(false)
    }
  }

  const refreshCards = () => {
    setLoading(true)
    fetchCards()
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
  if (cards.length === 0) {
    console.log("No cards found, showing initial empty state")
    return <InitialEmptyState />
  }

  // If there are some cards, show them with one empty card at the beginning
  console.log("Rendering cards:", cards.length)
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
            <span className="text-foreground font-semibold">{cards.length}</span>
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
        {cards.map((card, index) => (
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
      </div>

      {/* 底部提示 */}
      <motion.div
        className="text-center mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="glass-morphism rounded-2xl px-6 py-4 inline-block">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-syne">
              點擊卡片可翻轉查看，點擊放大鏡可查看大圖
            </span>
          </div>
        </div>
      </motion.div>

      {/* Card Modal */}
      <CardModal card={selectedCard} isOpen={isModalOpen} onClose={handleModalClose} />
    </motion.div>
  )
}
