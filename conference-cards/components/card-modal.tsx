"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import OptimizedImage from "@/components/optimized-image"

interface Card {
  id: string
  name: string
  position: string
  frontImageUrl: string
  backImageUrl: string
  createdAt: string
}

interface CardModalProps {
  card: Card | null
  isOpen: boolean
  onClose: () => void
}

export default function CardModal({ card, isOpen, onClose }: CardModalProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  if (!card) return null

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleClose = () => {
    setIsFlipped(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="relative max-w-2xl w-full max-h-[90vh] flex flex-col items-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Card Container */}
            <div className="relative perspective-1000 px-6 sm:px-0">
              {/* Close Button over the card */}
              <div className="absolute -top-5 -right-1 sm:-top-6 sm:-right-4 z-10">
                <Button
                  onClick={handleClose}
                  variant="destructive"
                  size="sm"
                  className="rounded-full p-0 shadow-xl hover:shadow-2xl bg-red-500 hover:bg-red-600 border-2 border-white transition-all duration-200 hover:scale-110 h-10 w-10 flex items-center justify-center"
                >
                  <X className="w-6 h-6 text-white" />
                </Button>
              </div>
              <motion.div
                className="relative w-[360px] h-[554px] sm:w-[400px] sm:h-[615px] max-[408px]:w-[calc(100vw-48px)] max-[408px]:h-[calc((100vw-48px)*1.5375)] cursor-pointer transform-style-preserve-3d"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                onClick={handleFlip}
              >
                {/* Card Back - 顯示封底圖片 */}
                <div className="absolute inset-0 w-full h-full backface-hidden">
                  <div className="w-full h-full bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden relative border border-gray-700/50">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-transparent to-blue-500/20 rounded-2xl"></div>

                    <div className="relative w-full h-full">
                      <OptimizedImage
                        src={card.backImageUrl || "/placeholder.svg"}
                        alt={`${card.name} 封底`}
                        fill
                        className="object-cover rounded-2xl"
                        sizes="400px"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 rounded-2xl"></div>

                      {/* Flip indicator */}
                      <motion.div
                        className="absolute bottom-6 right-6 bg-black/70 backdrop-blur-sm rounded-full p-3"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <RotateCcw className="w-5 h-5 text-white" />
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Card Front - 顯示封面圖片 */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
                  <div className="w-full h-full bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden relative border border-gray-700/50">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-green-500/20 rounded-2xl"></div>

                    <div className="relative w-full h-full">
                      <OptimizedImage
                        src={card.frontImageUrl || "/placeholder.svg"}
                        alt={`${card.name} 封面`}
                        fill
                        className="object-cover rounded-2xl"
                        sizes="400px"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 rounded-2xl"></div>

                      {/* Flip indicator */}
                      <motion.div
                        className="absolute bottom-6 right-6 bg-black/70 backdrop-blur-sm rounded-full p-3"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <RotateCcw className="w-5 h-5 text-white" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Card Info */}
            <div className="mt-6 text-center">
              <h3 className="text-2xl font-bold text-white mb-2 font-noto-sans-tc">{card.name}</h3>
              <p className="text-gray-300 text-lg font-syne">{card.position}</p>
              <p className="text-gray-500 text-sm mt-2 font-syne">
                上傳時間: {new Date(card.createdAt).toLocaleString("zh-TW")}
              </p>
            </div>

            {/* Instructions */}
            <div className="mt-4 text-center">
              <p className="text-gray-400 text-sm font-syne">點擊卡片翻面 • 點擊X關閉</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
