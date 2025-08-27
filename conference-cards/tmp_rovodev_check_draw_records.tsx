// 檢查抽卡記錄工具
import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { loadFirestoreDrawRecord } from '@/lib/draw-cache'

export function CheckDrawRecords() {
  const { user } = useAuth()
  
  useEffect(() => {
    if (!user) return
    
    const checkRecords = async () => {
      try {
        console.log('=== 抽卡記錄檢查 ===')
        console.log('當前用戶ID:', user.uid)
        console.log('用戶信息:', {
          email: user.email,
          displayName: user.displayName
        })
        
        const record = await loadFirestoreDrawRecord(user.uid)
        
        if (record) {
          console.log('✅ 找到抽卡記錄:', record)
          console.log('已抽卡片ID:', record.drawnCardIds)
          console.log('抽卡次數:', record.drawCount)
          console.log('最後抽卡時間:', new Date(record.lastDrawTime))
        } else {
          console.log('⚠️ 沒有找到抽卡記錄')
          console.log('可能原因：')
          console.log('1. 還沒有進行過抽卡')
          console.log('2. 記錄還沒有同步到 Firestore')
          console.log('3. 用戶ID不匹配')
        }
        
        // 檢查 localStorage
        const localRecord = localStorage.getItem('conference_draw_record')
        if (localRecord) {
          console.log('📱 本地記錄:', JSON.parse(localRecord))
        } else {
          console.log('📱 沒有本地記錄')
        }
        
      } catch (error) {
        console.error('檢查抽卡記錄失敗:', error)
      }
    }
    
    checkRecords()
  }, [user])
  
  return null
}

// 使用說明：
// 1. 將此組件添加到頁面中
// 2. 登入後打開 Console 查看結果
// 3. 如果沒有記錄，嘗試抽一張卡片後再檢查