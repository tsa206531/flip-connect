"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Trash2, Search, RefreshCw, User, Mail, Calendar, AlertTriangle } from "lucide-react"
import Image from "next/image"
import { findUserByEmail, getUserDrawRecord, clearUserDrawRecord, getUserInfo, removeUserDrawnCards } from "@/lib/admin-draw-management"
import { DrawRecord } from "@/lib/draw-cache"

interface CardData {
  id: string
  name: string
  position: string
  frontImageUrl: string
  backImageUrl: string
  createdAt: string
}

interface UserInfo {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  createdAt: any
}

export default function UserDrawManagement({ cards }: { cards: CardData[] }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [drawRecord, setDrawRecord] = useState<DrawRecord | null>(null)
  const [drawnCards, setDrawnCards] = useState<CardData[]>([])
  const [clearing, setClearing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([])
  const [removing, setRemoving] = useState(false)
  const [clearingAll, setClearingAll] = useState(false)

  const searchUser = async () => {
    if (!email.trim()) {
      setError('請輸入 email')
      return
    }

    setLoading(true)
    setError(null)
    setUserInfo(null)
    setDrawRecord(null)
    setDrawnCards([])
    setSelectedCardIds([])

    try {
      // 1. 根據 email 查找用戶
      const userId = await findUserByEmail(email.trim())
      if (!userId) {
        setError('找不到此 email 的用戶')
        return
      }

      // 2. 獲取用戶基本資訊
      const userInfoData = await getUserInfo(userId)
      if (userInfoData) {
        setUserInfo({
          uid: userId,
          email: userInfoData.email,
          displayName: userInfoData.displayName,
          photoURL: userInfoData.photoURL,
          createdAt: userInfoData.createdAt
        })
      }

      // 3. 獲取用戶抽卡記錄
      const record = await getUserDrawRecord(userId)
      setDrawRecord(record)

      // 4. 根據抽卡記錄找到對應的卡片
      if (record && record.drawnCardIds.length > 0) {
        const foundCards = record.drawnCardIds
          .map(cardId => cards.find(card => card.id === cardId))
          .filter(card => card !== undefined) as CardData[]
        
        setDrawnCards(foundCards)
      }

    } catch (error) {
      console.error('搜尋用戶失敗:', error)
      setError('搜尋失敗，請重試')
    } finally {
      setLoading(false)
    }
  }

  const clearUserRecord = async () => {
    if (!userInfo || !drawRecord) return

    if (!confirm(`確定要清空 ${userInfo.displayName || userInfo.email} 的抽卡記錄嗎？\n\n這將會：\n- 清空 Firestore 中的抽卡記錄\n- 用戶下次登入時 localStorage 也會被清空\n\n此操作無法撤銷！`)) {
      return
    }

    setClearing(true)
    try {
      await clearUserDrawRecord(userInfo.uid)
      
      // 更新本地狀態
      setDrawRecord({
        ...drawRecord,
        drawnCardIds: [],
        drawCount: 0,
        lastDrawTime: 0
      })
      setDrawnCards([])
      setSelectedCardIds([])
      
      alert('用戶抽卡記錄已清空！')
    } catch (error) {
      console.error('清空記錄失敗:', error)
      alert('清空失敗，請重試')
    } finally {
      setClearing(false)
    }
  }

  const removeSelectedCards = async () => {
    if (!userInfo || !drawRecord || selectedCardIds.length === 0) return

    if (!confirm(`確定要移除選中的 ${selectedCardIds.length} 張卡片記錄嗎？\n\n此操作將從用戶的抽卡記錄中移除這些卡片，但不會刪除卡片本身。`)) {
      return
    }

    setRemoving(true)
    try {
      const updatedRecord = await removeUserDrawnCards(userInfo.uid, selectedCardIds)
      
      // 更新本地狀態
      setDrawRecord(updatedRecord)
      setDrawnCards(prev => prev.filter(card => !selectedCardIds.includes(card.id)))
      setSelectedCardIds([])
      
      alert(`已移除 ${selectedCardIds.length} 張卡片記錄！`)
    } catch (error) {
      console.error('移除記錄失敗:', error)
      alert('移除失敗，請重試')
    } finally {
      setRemoving(false)
    }
  }

  const removeSingleCard = async (cardId: string) => {
    if (!userInfo || !drawRecord) return

    const card = drawnCards.find(c => c.id === cardId)
    if (!confirm(`確定要移除「${card?.name || cardId}」的抽卡記錄嗎？`)) {
      return
    }

    setRemoving(true)
    try {
      const updatedRecord = await removeUserDrawnCards(userInfo.uid, [cardId])
      
      // 更新本地狀態
      setDrawRecord(updatedRecord)
      setDrawnCards(prev => prev.filter(card => card.id !== cardId))
      setSelectedCardIds(prev => prev.filter(id => id !== cardId))
      
      alert('卡片記錄已移除！')
    } catch (error) {
      console.error('移除記錄失敗:', error)
      alert('移除失敗，請重試')
    } finally {
      setRemoving(false)
    }
  }

  const toggleCardSelection = (cardId: string) => {
    setSelectedCardIds(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    )
  }

  const selectAllCards = () => {
    if (selectedCardIds.length === drawnCards.length) {
      setSelectedCardIds([])
    } else {
      setSelectedCardIds(drawnCards.map(card => card.id))
    }
  }

  const clearAllUserDrawRecords = async () => {
    if (!userInfo || !drawRecord) return

    if (!confirm(`確定要清空 ${userInfo.displayName || userInfo.email} 的所有抽卡記錄嗎？\n\n此操作將會：\n- 清空該用戶的 Firestore 抽卡記錄\n- 清空該用戶的 localStorage (下次登入時生效)\n- 清空該用戶在此頁面顯示的所有抽卡記錄\n\n此操作無法撤銷！`)) {
      return
    }

    setClearingAll(true)
    try {
      // 清空 Firestore 記錄
      await clearUserDrawRecord(userInfo.uid)
      
      // 更新本地狀態
      setDrawRecord({
        userId: userInfo.uid,
        drawnCardIds: [],
        drawCount: 0,
        lastDrawTime: 0,
        lastSyncTime: Date.now(),
        drawnCardTimestamps: {}
      })
      setDrawnCards([])
      setSelectedCardIds([])
      
      // 清空當前瀏覽器的 localStorage (如果是同一用戶)
      // 注意：這只能清空當前瀏覽器的記錄，其他裝置需要用戶重新登入才會同步
      try {
        const currentDrawRecord = localStorage.getItem('conference_draw_record')
        if (currentDrawRecord) {
          const parsed = JSON.parse(currentDrawRecord)
          if (parsed.userId === userInfo.uid) {
            localStorage.removeItem('conference_draw_record')
            localStorage.removeItem('drawHistory')
            console.log('已清空當前瀏覽器的 localStorage')
          }
        }
      } catch (localStorageError) {
        console.warn('清空 localStorage 失敗:', localStorageError)
      }
      
      alert(`已成功清空 ${userInfo.displayName || userInfo.email} 的所有抽卡記錄！\n\n注意：用戶需要重新登入才能看到更新。`)
    } catch (error) {
      console.error('清空所有記錄失敗:', error)
      alert('清空失敗，請重試')
    } finally {
      setClearingAll(false)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '未知'
    
    let date: Date
    if (timestamp.toDate) {
      // Firestore Timestamp
      date = timestamp.toDate()
    } else if (typeof timestamp === 'number') {
      // Unix timestamp
      date = new Date(timestamp)
    } else {
      // String or Date
      date = new Date(timestamp)
    }
    
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white font-noto-sans-tc flex items-center gap-2">
          <User className="h-5 w-5" />
          用戶抽卡記錄管理
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 搜尋區域 */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="輸入用戶 email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchUser()}
              className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 font-syne"
            />
          </div>
          <Button
            onClick={searchUser}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-syne"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            搜尋
          </Button>
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-300 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          </div>
        )}

        {/* 用戶資訊 */}
        {userInfo && (
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3 font-noto-sans-tc">用戶資訊</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-syne">姓名:</span>
                  <span className="text-white font-syne">{userInfo.displayName || '未設定'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-syne">Email:</span>
                  <span className="text-white font-syne">{userInfo.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-syne">UID:</span>
                  <Badge variant="secondary" className="bg-gray-600 text-gray-200 font-mono text-xs">
                    {userInfo.uid}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-syne">註冊時間:</span>
                  <span className="text-white font-syne">{formatDate(userInfo.createdAt)}</span>
                </div>
                {drawRecord && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-syne">抽卡次數:</span>
                      <Badge className="bg-green-600 text-white font-syne">
                        {drawRecord.drawCount} 次
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-syne">最後抽卡:</span>
                      <span className="text-white font-syne">
                        {drawRecord.lastDrawTime ? formatDate(drawRecord.lastDrawTime) : '從未抽卡'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 抽卡記錄 */}
        {drawRecord && (
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white font-noto-sans-tc">
                抽到的卡片 ({drawnCards.length} 張)
                {selectedCardIds.length > 0 && (
                  <span className="text-sm text-blue-400 ml-2">
                    已選擇 {selectedCardIds.length} 張
                  </span>
                )}
              </h3>
              {drawnCards.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    onClick={selectAllCards}
                    variant="outline"
                    size="sm"
                    className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 font-syne"
                  >
                    {selectedCardIds.length === drawnCards.length ? '取消全選' : '全選'}
                  </Button>
                  
                  {selectedCardIds.length > 0 && (
                    <Button
                      onClick={removeSelectedCards}
                      disabled={removing}
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700 text-white font-syne"
                    >
                      {removing ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      移除選中 ({selectedCardIds.length})
                    </Button>
                  )}
                  
                  <Button
                    onClick={clearUserRecord}
                    disabled={clearing || removing || clearingAll}
                    variant="destructive"
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 font-syne"
                  >
                    {clearing ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    清空 Firestore
                  </Button>

                  <Button
                    onClick={clearAllUserDrawRecords}
                    disabled={clearing || removing || clearingAll}
                    variant="destructive"
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700 font-syne"
                  >
                    {clearingAll ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    清空 draw 全部
                  </Button>
                </div>
              )}
            </div>

            {drawnCards.length === 0 ? (
              <div className="text-center py-8 text-gray-400 font-syne">
                {drawRecord.drawnCardIds.length > 0 ? (
                  <div>
                    <p>找到 {drawRecord.drawnCardIds.length} 個卡片ID，但對應的卡片已被刪除</p>
                    <div className="mt-2 text-xs">
                      <p>卡片ID: {drawRecord.drawnCardIds.join(', ')}</p>
                    </div>
                  </div>
                ) : (
                  '此用戶還沒有抽過任何卡片'
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {drawnCards.map((card, index) => (
                  <div key={card.id} className="bg-gray-600/50 p-3 rounded-lg relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedCardIds.includes(card.id)}
                          onChange={() => toggleCardSelection(card.id)}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <Badge variant="secondary" className="bg-gray-500 text-gray-200 font-syne text-xs">
                          #{index + 1}
                        </Badge>
                        <Badge variant="secondary" className="bg-gray-500 text-gray-200 font-mono text-xs">
                          {card.id.slice(0, 8)}
                        </Badge>
                      </div>
                      <Button
                        onClick={() => removeSingleCard(card.id)}
                        disabled={removing}
                        size="sm"
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700 h-6 w-6 p-0"
                      >
                        {removing ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="relative aspect-[3/4] bg-gray-700 rounded overflow-hidden">
                        <Image
                          src={card.frontImageUrl || "/placeholder.svg"}
                          alt={`${card.name} 封面`}
                          fill
                          className="object-cover"
                          sizes="100px"
                        />
                      </div>
                      <div className="relative aspect-[3/4] bg-gray-700 rounded overflow-hidden">
                        <Image
                          src={card.backImageUrl || "/placeholder.svg"}
                          alt={`${card.name} 封底`}
                          fill
                          className="object-cover"
                          sizes="100px"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="text-white font-semibold font-noto-sans-tc text-sm">{card.name}</h4>
                      <p className="text-gray-300 font-syne text-xs">{card.position}</p>
                      <p className="text-gray-400 font-syne text-xs">
                        上傳: {formatDate(card.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}