"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shuffle, Users, Sparkles, ArrowLeft, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card as UICard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
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

interface DrawCardProps {
  cards: CardData[]
  isOpen: boolean
  onClose: () => void
  currentUserId?: string
}

export default function DrawCard({ cards, isOpen, onClose, currentUserId }: DrawCardProps) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawnCard, setDrawnCard] = useState<CardData | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [drawRecord, setDrawRecord] = useState<DrawRecord | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [remainingCooldown, setRemainingCooldown] = useState<number>(0)

  // 初始化抽卡記錄
  useEffect(() => {
    if (!currentUserId || !isOpen) return

    const initialize = async () => {
      try {
        setIsInitializing(true)
        setError(null)
        const record = await initializeDrawRecord(currentUserId)
        setDrawRecord(record)
      } catch (error) {
        console.error('初始化抽卡記錄失敗:', error)
        setError('載入抽卡記錄失敗，請重試')
      } finally {
        setIsInitializing(false)
      }
    }

    initialize()
  }, [currentUserId, isOpen])

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

  // 獲取可抽取的卡片
  const getAvailableCards = (): CardData[] => {
    if (!drawRecord) return []
    
    return cards.filter(card => {
      // 排除自己的卡片
      if (currentUserId && card.userId === currentUserId) {
        return false
      }
      
      // 排除已抽過的卡片
      if (drawRecord.drawnCardIds.includes(card.id)) {
        return false
      }
      
      return true
    })
  }

  const drawRandomCard = async () => {
    if (!currentUserId || !drawRecord) return

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

    setIsDrawing(true)
    setShowResult(false)
    setError(null)

    try {
      // 模擬抽卡動畫
      setTimeout(async () => {
        try {
          const randomIndex = Math.floor(Math.random() * availableCards.length)
          const selectedCard = availableCards[randomIndex]
          
          // 記錄抽卡
          const updatedRecord = await recordDrawnCard(currentUserId, selectedCard.id)
          setDrawRecord(updatedRecord)
          setDrawnCard(selectedCard)
          setShowResult(true)
        } catch (error) {
          console.error('記錄抽卡失敗:', error)
          setError('抽卡記錄失敗，請重試')
        } finally {
          setIsDrawing(false)
        }
      }, 2000)
    } catch (error) {
      setIsDrawing(false)
      setError('抽卡失敗，請重試')
    }
  }

  const getCardAnimation = (index: number) => ({
    initial: { opacity: 0, scale: 0.8, y: 50 },
    animate: { opacity: 1, scale: 1, y: 0 },
    transition: { duration: 0.5, delay: index * 0.1 }
  })

  if (!isOpen) return null

  // 計算統計資訊
  const availableCards = getAvailableCards()
  const stats = drawRecord ? {
    totalCards: cards.length,
    ownCards: currentUserId ? cards.filter(card => card.userId === currentUserId).length : 0,
    availableCards: availableCards.length,
    drawnCount: drawRecord.drawCount,
    remainingDraws: DRAW_LIMITS.MAX_DRAWS - drawRecord.drawCount
  } : null

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

        {/* 載入狀態 */}
        {isInitializing && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-6"></div>
            <p className="text-muted-foreground text-lg">載入抽卡記錄中...</p>
          </motion.div>
        )}

        {/* 錯誤提示 */}
        {error && (
          <motion.div 
            className="mb-8 p-6 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="w-6 h-6 text-red-400 mr-4 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}

        {/* 統計資訊 */}
        {stats && !isInitializing && (
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-center p-4 glass-morphism rounded-2xl">
              <div className="text-3xl font-bold text-blue-400 mb-1">{stats.availableCards}</div>
              <div className="text-sm text-muted-foreground">可抽取</div>
            </div>
            <div className="text-center p-4 glass-morphism rounded-2xl">
              <div className="text-3xl font-bold text-green-400 mb-1">{stats.drawnCount}</div>
              <div className="text-sm text-muted-foreground">已抽取</div>
            </div>
            <div className="text-center p-4 glass-morphism rounded-2xl">
              <div className="text-3xl font-bold text-orange-400 mb-1">{stats.remainingDraws}</div>
              <div className="text-sm text-muted-foreground">剩餘次數</div>
            </div>
            <div className="text-center p-4 glass-morphism rounded-2xl">
              <div className="text-3xl font-bold text-purple-400 mb-1">{DRAW_LIMITS.COOLDOWN_MINUTES}</div>
              <div className="text-sm text-muted-foreground">冷卻(分鐘)</div>
            </div>
            <div className="text-center p-4 glass-morphism rounded-2xl">
              <div className="text-3xl font-bold text-pink-400 mb-1">{DRAW_LIMITS.MAX_DRAWS}</div>
              <div className="text-sm text-muted-foreground">總上限</div>
            </div>
          </motion.div>
        )}

        {/* 冷卻時間提示 */}
        {remainingCooldown > 0 && (
          <motion.div 
            className="mb-8 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex items-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Clock className="w-6 h-6 text-yellow-400 mr-4 flex-shrink-0" />
            <div>
              <p className="text-yellow-400 font-medium mb-1">冷卻中</p>
              <p className="text-yellow-400/70 text-sm">還需等待 {formatRemainingTime(remainingCooldown)}</p>
            </div>
          </motion.div>
        )}

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
          {!isInitializing && drawRecord && (
            <Button
              onClick={drawRandomCard}
              disabled={
                isDrawing || 
                !drawRecord || 
                availableCards.length === 0 || 
                remainingCooldown > 0 ||
                drawRecord.drawCount >= DRAW_LIMITS.MAX_DRAWS
              }
              className="glow-button text-white px-12 py-6 rounded-2xl font-syne text-xl font-semibold h-auto"
              size="lg"
            >
              {isDrawing ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3" />
                  抽卡中...
                </>
              ) : remainingCooldown > 0 ? (
                <>
                  <Clock className="w-6 h-6 mr-3" />
                  冷卻中 ({formatRemainingTime(remainingCooldown)})
                </>
              ) : drawRecord.drawCount >= DRAW_LIMITS.MAX_DRAWS ? (
                <>
                  <AlertCircle className="w-6 h-6 mr-3" />
                  已達總上限
                </>
              ) : availableCards.length === 0 ? (
                <>
                  <Users className="w-6 h-6 mr-3" />
                  無可抽卡片
                </>
              ) : (
                <>
                  <Shuffle className="w-6 h-6 mr-3" />
                  {showResult ? '再抽一張' : '開始抽卡'}
                </>
              )}
            </Button>
          )}

          {availableCards.length === 0 && !isInitializing && drawRecord && (
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
              </UICard>
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
                  </UICard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
