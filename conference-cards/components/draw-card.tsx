"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shuffle, Users, Sparkles, ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card as UICard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

interface CardData {
  id: string
  name: string
  position: string
  frontImageUrl: string
  backImageUrl: string
  createdAt: string
}

interface DrawCardProps {
  cards: CardData[]
  isOpen: boolean
  onClose: () => void
}

export default function DrawCard({ cards, isOpen, onClose }: DrawCardProps) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawnCard, setDrawnCard] = useState<CardData | null>(null)
  const [drawnCards, setDrawnCards] = useState<CardData[]>([])
  const [remainingCards, setRemainingCards] = useState<CardData[]>(cards)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    setRemainingCards(cards)
  }, [cards])

  const drawRandomCard = () => {
    if (remainingCards.length === 0) {
      alert("所有卡片都已抽完！")
      return
    }

    setIsDrawing(true)
    setShowResult(false)

    // 模擬抽卡動畫
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * remainingCards.length)
      const selectedCard = remainingCards[randomIndex]
      
      setDrawnCard(selectedCard)
      setDrawnCards(prev => [...prev, selectedCard])
      setRemainingCards(prev => prev.filter((_, index) => index !== randomIndex))
      setShowResult(true)
      setIsDrawing(false)
    }, 2000)
  }

  const resetDraw = () => {
    setDrawnCards([])
    setRemainingCards(cards)
    setDrawnCard(null)
    setShowResult(false)
  }

  const getCardAnimation = (index: number) => ({
    initial: { opacity: 0, scale: 0.8, y: 50 },
    animate: { opacity: 1, scale: 1, y: 0 },
    transition: { duration: 0.5, delay: index * 0.1 }
  })

  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 bg-background/95 backdrop-blur-xl z-50 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* 返回按鈕 */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            className="glass-morphism glass-morphism-hover text-muted-foreground hover:text-foreground p-3 rounded-xl"
            onClick={onClose}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            返回
          </Button>
        </motion.div>

        {/* 標題區域 */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="conference-title mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            現場抽卡配對
          </motion.h1>
          <p className="text-xl text-muted-foreground font-syne max-w-2xl mx-auto">
            從參與者名片中隨機抽取，進行現場交流配對
          </p>
        </motion.div>

        {/* 統計資訊 */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <UICard className="glass-morphism text-center">
            <CardContent className="p-6">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-2">{cards.length}</h3>
              <p className="text-muted-foreground">總參與者</p>
            </CardContent>
          </UICard>

          <UICard className="glass-morphism text-center">
            <CardContent className="p-6">
              <Shuffle className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-2">{drawnCards.length}</h3>
              <p className="text-muted-foreground">已抽取</p>
            </CardContent>
          </UICard>

          <UICard className="glass-morphism text-center">
            <CardContent className="p-6">
              <RefreshCw className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-2">{remainingCards.length}</h3>
              <p className="text-muted-foreground">剩餘</p>
            </CardContent>
          </UICard>
        </motion.div>

        {/* 抽卡區域 */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Button
            onClick={drawRandomCard}
            disabled={isDrawing || remainingCards.length === 0}
            className="glow-button text-white px-12 py-6 rounded-2xl font-syne text-xl font-semibold h-auto"
            size="lg"
          >
            {isDrawing ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3" />
                抽卡中...
              </>
            ) : (
              <>
                <Shuffle className="w-6 h-6 mr-3" />
                開始抽卡
              </>
            )}
          </Button>

          {remainingCards.length === 0 && (
            <motion.div
              className="mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Button
                onClick={resetDraw}
                variant="outline"
                className="glass-morphism glass-morphism-hover px-8 py-4 rounded-xl font-syne text-lg"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                重新開始
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* 抽卡結果 */}
        <AnimatePresence>
          {showResult && drawnCard && (
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
            >
              <UICard className="glass-morphism max-w-2xl mx-auto">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-3xl font-noto-sans-tc text-foreground">
                    恭喜抽中！
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    <Image
                      src={drawnCard.frontImageUrl}
                      alt={drawnCard.name}
                      width={200}
                      height={300}
                      className="rounded-2xl shadow-2xl mx-auto"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2 font-noto-sans-tc">
                    {drawnCard.name}
                  </h3>
                  <p className="text-xl text-muted-foreground font-syne mb-6">
                    {drawnCard.position}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-syne">開始交流吧！</span>
                    <Sparkles className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 已抽取的卡片 */}
        {drawnCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center font-noto-sans-tc">
              已抽取的參與者
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drawnCards.map((card, index) => (
                <motion.div
                  key={card.id}
                  {...getCardAnimation(index)}
                >
                  <UICard className="glass-morphism hover:scale-105 transition-transform duration-300">
                    <CardContent className="p-4">
                      <div className="mb-4">
                        <Image
                          src={card.frontImageUrl}
                          alt={card.name}
                          width={120}
                          height={180}
                          className="rounded-xl shadow-lg mx-auto"
                        />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-1 font-noto-sans-tc">
                        {card.name}
                      </h3>
                      <p className="text-muted-foreground font-syne">
                        {card.position}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
