"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Trash2, Search, RefreshCw, Users, Calendar, Eye, EyeOff, Database, HardDrive } from "lucide-react"
import Image from "next/image"
import OptimizedImage from "@/components/optimized-image"
import Link from "next/link"
import UserDrawManagement from "@/components/user-draw-management"

interface AdminCard {
  id: string
  name: string
  position: string
  frontImageUrl: string
  backImageUrl: string
  createdAt: string
}

interface CardsResponse {
  success: boolean
  cards: AdminCard[]
  count: number
  totalCount: number
  page: number
  totalPages: number
  hasMore: boolean
}

export default function AdminPage() {
  const [cards, setCards] = useState<AdminCard[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const [showImages, setShowImages] = useState(true)
  const [deleting, setDeleting] = useState<string[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [clearingDrawRecords, setClearingDrawRecords] = useState(false)

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/cards", {
        cache: "no-store",
      })
      if (response.ok) {
        const data: CardsResponse = await response.json()
        setCards(data.cards || [])
        setTotalCount(data.totalCount || 0)
        console.log(`Loaded ${data.count} cards (${data.totalCount} total)`)
      }
    } catch (error) {
      console.error("Failed to fetch cards:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteCard = async (cardId: string) => {
    if (!confirm("確定要刪除這張名片嗎？")) return

    try {
      setDeleting((prev) => [...prev, cardId])
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        const result = await response.json()
        setCards((prev) => prev.filter((card) => card.id !== cardId))
        setSelectedCards((prev) => prev.filter((id) => id !== cardId))
        setTotalCount(result.remainingCards || 0)
      } else {
        alert("刪除失敗，請重試")
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("刪除失敗，請重試")
    } finally {
      setDeleting((prev) => prev.filter((id) => id !== cardId))
    }
  }

  const deleteSelectedCards = async () => {
    if (selectedCards.length === 0) return
    if (!confirm(`確定要刪除選中的 ${selectedCards.length} 張名片嗎？`)) return

    try {
      setDeleting((prev) => [...prev, ...selectedCards])

      const deletePromises = selectedCards.map((cardId) => fetch(`/api/cards/${cardId}`, { method: "DELETE" }))

      await Promise.all(deletePromises)

      setCards((prev) => prev.filter((card) => !selectedCards.includes(card.id)))
      setTotalCount((prev) => prev - selectedCards.length)
      setSelectedCards([])
    } catch (error) {
      console.error("Batch delete error:", error)
      alert("批量刪除失敗，請重試")
    } finally {
      setDeleting([])
    }
  }

  const clearAllCards = async () => {
    if (!confirm("確定要清空所有名片嗎？此操作無法撤銷！")) return

    try {
      setLoading(true)
      const response = await fetch("/api/cards", {
        method: "DELETE",
      })

      if (response.ok) {
        const result = await response.json()
        setCards([])
        setSelectedCards([])
        setTotalCount(0)
        alert(`已清空 ${result.deletedCount} 張名片`)
      } else {
        alert("清空失敗，請重試")
      }
    } catch (error) {
      console.error("Clear all error:", error)
      alert("清空失敗，請重試")
    } finally {
      setLoading(false)
    }
  }

  const clearAllDrawRecords = async () => {
    if (!confirm("確定要清空所有用戶的抽卡記錄嗎？\n\n此操作將會：\n- 清空所有用戶的 Firestore 抽卡記錄\n- 用戶下次登入時 localStorage 也會被清空\n\n此操作無法撤銷！")) return

    try {
      setClearingDrawRecords(true)
      
      const response = await fetch("/api/draw-records", {
        method: "DELETE",
      })

      if (response.ok) {
        const result = await response.json()
        
        if (result.errors && result.errors.length > 0) {
          alert(`${result.message}\n\n錯誤詳情：\n${result.errors.join('\n')}`)
        } else {
          alert(result.message)
        }
        
        // 清空所有用戶的 localStorage (只能在客戶端清空當前用戶的)
        localStorage.removeItem('conference_draw_record')
        localStorage.removeItem('drawHistory')
        
      } else {
        const errorData = await response.json()
        alert(`清空失敗：${errorData.error || '未知錯誤'}`)
      }
    } catch (error) {
      console.error("Clear all draw records error:", error)
      alert("清空抽卡記錄失敗，請重試")
    } finally {
      setClearingDrawRecords(false)
    }
  }

  const toggleCardSelection = (cardId: string) => {
    setSelectedCards((prev) => (prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]))
  }

  const selectAllCards = () => {
    if (selectedCards.length === filteredCards.length) {
      setSelectedCards([])
    } else {
      setSelectedCards(filteredCards.map((card) => card.id))
    }
  }

  const filteredCards = cards.filter(
    (card) =>
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.position.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Calculate capacity utilization
  const capacityPercentage = Math.round((totalCount / 300) * 100)
  const isNearCapacity = capacityPercentage > 80
  const isAtCapacity = capacityPercentage >= 100

  const [drawEnabled, setDrawEnabled] = useState<boolean>(true)

  useEffect(() => {
    // 讀取初始開關狀態
    fetch('/api/admin/draw-toggle', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setDrawEnabled(!!data.enabled))
      .catch(() => setDrawEnabled(true))
  }, [])

  const toggleDraw = async () => {
    try {
      const res = await fetch('/api/admin/draw-toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !drawEnabled }),
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || '切換失敗')
      setDrawEnabled(data.enabled)
    } catch (e: any) {
      alert(e.message || '切換失敗')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 font-noto-sans-tc">管理後台</h1>
              <p className="text-gray-400 font-syne">管理研討會互動卡片</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-800/50 border border-gray-700 rounded-full px-3 py-2">
                <span className={`text-sm font-syne ${drawEnabled ? 'text-gray-400' : 'text-red-400'}`}>關閉抽卡</span>
                <button
                  onClick={toggleDraw}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${drawEnabled ? 'bg-green-500/80' : 'bg-gray-600'}`}
                  aria-label="切換抽卡開關"
                  title={drawEnabled ? '目前：允許抽卡' : '目前：禁止抽卡'}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${drawEnabled ? 'translate-x-5' : 'translate-x-1'}`}
                  />
                </button>
                <span className="text-sm font-syne text-green-400">開放抽卡</span>
              </div>
              <Link href="/">
                <Button
                  variant="outline"
                  className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 font-syne"
                >
                  返回首頁
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold text-white font-syne">{totalCount}</p>
                    <p className="text-sm text-gray-400 font-syne">總名片數</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Search className="h-8 w-8 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-white font-syne">{filteredCards.length}</p>
                    <p className="text-sm text-gray-400 font-syne">搜尋結果</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-purple-400" />
                  <div>
                    <p className="text-2xl font-bold text-white font-syne">{selectedCards.length}</p>
                    <p className="text-sm text-gray-400 font-syne">已選擇</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`border-gray-700 ${
                isAtCapacity ? "bg-red-900/50" : isNearCapacity ? "bg-yellow-900/50" : "bg-gray-800/50"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Database
                    className={`h-8 w-8 ${
                      isAtCapacity ? "text-red-400" : isNearCapacity ? "text-yellow-400" : "text-cyan-400"
                    }`}
                  />
                  <div>
                    <p
                      className={`text-2xl font-bold font-syne ${
                        isAtCapacity ? "text-red-300" : isNearCapacity ? "text-yellow-300" : "text-white"
                      }`}
                    >
                      {capacityPercentage}%
                    </p>
                    <p className="text-sm text-gray-400 font-syne">容量 ({totalCount}/300)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Capacity Warning */}
          {isNearCapacity && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                isAtCapacity
                  ? "bg-red-900/20 border-red-500/30 text-red-300"
                  : "bg-yellow-900/20 border-yellow-500/30 text-yellow-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                <p className="font-syne">
                  {isAtCapacity ? "⚠️ 已達到容量上限！無法上傳更多名片。" : "⚠️ 容量即將滿載，建議清理不需要的名片。"}
                </p>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜尋姓名或職位..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 font-syne"
                />
              </div>
              <Button
                onClick={fetchCards}
                disabled={loading}
                variant="outline"
                className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <Button
                onClick={() => setShowImages(!showImages)}
                variant="outline"
                className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 font-syne"
              >
                {showImages ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showImages ? "隱藏圖片" : "顯示圖片"}
              </Button>

              <Button
                onClick={selectAllCards}
                variant="outline"
                className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 font-syne"
              >
                {selectedCards.length === filteredCards.length ? "取消全選" : "全選"}
              </Button>

              {selectedCards.length > 0 && (
                <Button
                  onClick={deleteSelectedCards}
                  disabled={deleting.length > 0}
                  className="bg-red-600 hover:bg-red-700 text-white font-syne"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  刪除選中 ({selectedCards.length})
                </Button>
              )}

              <Button
                onClick={clearAllCards}
                disabled={loading || totalCount === 0}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 font-syne"
              >
                清空全部名片
              </Button>

              <Button
                onClick={clearAllDrawRecords}
                disabled={clearingDrawRecords}
                variant="destructive"
                className="bg-orange-600 hover:bg-orange-700 font-syne"
              >
                {clearingDrawRecords ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                清空 draw 全部
              </Button>
            </div>
          </div>
        </div>

        {/* User Draw Management */}
        <div className="mb-8">
          <UserDrawManagement cards={cards} />
        </div>

        {/* Cards List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4">
                  <div className="animate-pulse">
                    <div className="h-32 bg-gray-700 rounded mb-4"></div>
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-600 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCards.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-8 text-center">
              <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2 font-syne">
                {searchTerm ? "沒有找到匹配的名片" : "還沒有名片"}
              </h3>
              <p className="text-gray-400 font-syne">{searchTerm ? "請嘗試其他搜尋關鍵字" : "等待參與者上傳名片"}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCards.map((card) => (
              <Card key={card.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedCards.includes(card.id)}
                        onChange={() => toggleCardSelection(card.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                      <Badge variant="secondary" className="bg-gray-700 text-gray-300 font-syne">
                        {card.id.slice(0, 8)}
                      </Badge>
                    </div>
                    <Button
                      onClick={() => deleteCard(card.id)}
                      disabled={deleting.includes(card.id)}
                      size="sm"
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deleting.includes(card.id) ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {showImages && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="relative aspect-[3/4] bg-gray-700 rounded overflow-hidden">
                        <Image
                          src={card.frontImageUrl || "/placeholder.svg"}
                          alt={`${card.name} 封面`}
                          fill
                          className="object-cover"
                          sizes="150px"
                        />
                        <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded font-syne">
                          封面
                        </div>
                      </div>
                      <div className="relative aspect-[3/4] bg-gray-700 rounded overflow-hidden">
                        <Image
                          src={card.backImageUrl || "/placeholder.svg"}
                          alt={`${card.name} 封底`}
                          fill
                          className="object-cover"
                          sizes="150px"
                        />
                        <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded font-syne">
                          封底
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white font-noto-sans-tc">{card.name}</h3>
                    <p className="text-gray-400 font-syne">{card.position}</p>
                    <p className="text-xs text-gray-500 font-syne">上傳時間: {formatDate(card.createdAt)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
