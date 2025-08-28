import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'

// 抽卡記錄接口
export interface DrawRecord {
  userId: string
  drawnCardIds: string[]
  drawCount: number
  lastDrawTime: number
  lastSyncTime: number
  drawnCardTimestamps?: { [cardId: string]: number } // 新增：記錄每張卡片的抽取時間
}

// localStorage 鍵名
const DRAW_RECORD_KEY = 'conference_draw_record'

// 抽卡限制配置
export const DRAW_LIMITS = {
  MAX_DRAWS: 25,           // 最多抽25張
  COOLDOWN_MINUTES: 0,     // 暫時移除冷卻限制（測試用）
  COOLDOWN_MS: 0           // 暫時移除冷卻限制（測試用）
}

/**
 * 從 localStorage 載入抽卡記錄
 */
export function loadLocalDrawRecord(userId: string): DrawRecord | null {
  try {
    const stored = localStorage.getItem(DRAW_RECORD_KEY)
    if (!stored) return null
    
    const record: DrawRecord = JSON.parse(stored)
    
    // 檢查是否為同一用戶
    if (record.userId !== userId) {
      // 不同用戶，清除舊記錄
      localStorage.removeItem(DRAW_RECORD_KEY)
      return null
    }
    
    return record
  } catch (error) {
    console.error('載入本地抽卡記錄失敗:', error)
    return null
  }
}

/**
 * 儲存抽卡記錄到 localStorage
 */
export function saveLocalDrawRecord(record: DrawRecord): void {
  try {
    localStorage.setItem(DRAW_RECORD_KEY, JSON.stringify(record))
  } catch (error) {
    console.error('儲存本地抽卡記錄失敗:', error)
  }
}

/**
 * 從 Firestore 載入抽卡記錄
 */
export async function loadFirestoreDrawRecord(userId: string): Promise<DrawRecord | null> {
  try {
    const docRef = doc(db, 'users', userId, 'drawRecords', 'main')
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        userId,
        drawnCardIds: data.drawnCardIds || [],
        drawCount: data.drawCount || 0,
        lastDrawTime: data.lastDrawTime || 0,
        lastSyncTime: Date.now(),
        drawnCardTimestamps: data.drawnCardTimestamps || {}
      }
    }
    
    return null
  } catch (error) {
    console.error('載入 Firestore 抽卡記錄失敗:', error)
    return null
  }
}

/**
 * 儲存抽卡記錄到 Firestore
 */
export async function saveFirestoreDrawRecord(record: DrawRecord): Promise<void> {
  try {
    const docRef = doc(db, 'users', record.userId, 'drawRecords', 'main')
    
    await setDoc(docRef, {
      drawnCardIds: record.drawnCardIds,
      drawCount: record.drawCount,
      lastDrawTime: record.lastDrawTime,
      drawnCardTimestamps: record.drawnCardTimestamps || {},
      updatedAt: Date.now()
    }, { merge: true })
    
  } catch (error) {
    console.error('儲存 Firestore 抽卡記錄失敗:', error)
    throw error
  }
}

/**
 * 合併本地和雲端記錄
 */
export function mergeDrawRecords(local: DrawRecord | null, remote: DrawRecord | null, userId: string): DrawRecord {
  // 如果都沒有記錄，創建新記錄
  if (!local && !remote) {
    return {
      userId,
      drawnCardIds: [],
      drawCount: 0,
      lastDrawTime: 0,
      lastSyncTime: Date.now()
    }
  }
  
  // 只有本地記錄
  if (local && !remote) {
    return local
  }
  
  // 只有雲端記錄
  if (!local && remote) {
    return remote
  }
  
  // 兩邊都有記錄，需要合併
  if (local && remote) {
    // 合併已抽卡片ID（去重）
    const mergedCardIds = Array.from(new Set([
      ...local.drawnCardIds,
      ...remote.drawnCardIds
    ]))
    
    // 合併時間戳
    const mergedTimestamps = {
      ...remote.drawnCardTimestamps,
      ...local.drawnCardTimestamps
    }
    
    return {
      userId,
      drawnCardIds: mergedCardIds,
      drawCount: Math.max(local.drawCount, remote.drawCount),
      lastDrawTime: Math.max(local.lastDrawTime, remote.lastDrawTime),
      lastSyncTime: Date.now(),
      drawnCardTimestamps: mergedTimestamps
    }
  }
  
  // 理論上不會到這裡
  return {
    userId,
    drawnCardIds: [],
    drawCount: 0,
    lastDrawTime: 0,
    lastSyncTime: Date.now()
  }
}

/**
 * 初始化用戶抽卡記錄（跨裝置同步）
 */
export async function initializeDrawRecord(userId: string): Promise<DrawRecord> {
  try {
    // 1. 載入本地記錄
    const localRecord = loadLocalDrawRecord(userId)
    
    // 2. 載入雲端記錄
    const remoteRecord = await loadFirestoreDrawRecord(userId)
    
    // 3. 合併記錄
    const mergedRecord = mergeDrawRecords(localRecord, remoteRecord, userId)
    
    // 4. 儲存合併後的記錄到本地
    saveLocalDrawRecord(mergedRecord)
    
    // 5. 如果有變更，同步到雲端
    if (!remoteRecord || 
        mergedRecord.drawnCardIds.length !== remoteRecord.drawnCardIds.length ||
        mergedRecord.drawCount !== remoteRecord.drawCount) {
      await saveFirestoreDrawRecord(mergedRecord)
    }
    
    return mergedRecord
  } catch (error) {
    console.error('初始化抽卡記錄失敗:', error)
    
    // 如果雲端同步失敗，至少返回本地記錄
    const localRecord = loadLocalDrawRecord(userId)
    return localRecord || {
      userId,
      drawnCardIds: [],
      drawCount: 0,
      lastDrawTime: 0,
      lastSyncTime: Date.now()
    }
  }
}

/**
 * 檢查是否可以抽卡
 */
export function canDrawCard(record: DrawRecord): { canDraw: boolean; reason?: string; remainingTime?: number } {
  // 檢查抽卡次數限制
  if (record.drawCount >= DRAW_LIMITS.MAX_DRAWS) {
    return {
      canDraw: false,
      reason: `已達到最大抽卡次數限制（${DRAW_LIMITS.MAX_DRAWS}張）`
    }
  }
  
  // 檢查冷卻時間
  const now = Date.now()
  const timeSinceLastDraw = now - record.lastDrawTime
  
  if (record.lastDrawTime > 0 && timeSinceLastDraw < DRAW_LIMITS.COOLDOWN_MS) {
    const remainingTime = DRAW_LIMITS.COOLDOWN_MS - timeSinceLastDraw
    return {
      canDraw: false,
      reason: `請等待冷卻時間結束`,
      remainingTime
    }
  }
  
  return { canDraw: true }
}

/**
 * 記錄新的抽卡
 */
export async function recordDrawnCard(userId: string, cardId: string): Promise<DrawRecord> {
  try {
    // 1. 載入當前記錄
    const currentRecord = loadLocalDrawRecord(userId) || {
      userId,
      drawnCardIds: [],
      drawCount: 0,
      lastDrawTime: 0,
      lastSyncTime: Date.now(),
      drawnCardTimestamps: {}
    }
    
    const now = Date.now()
    
    // 2. 更新記錄
    const updatedRecord: DrawRecord = {
      ...currentRecord,
      drawnCardIds: [...currentRecord.drawnCardIds, cardId],
      drawCount: currentRecord.drawCount + 1,
      lastDrawTime: now,
      lastSyncTime: now,
      drawnCardTimestamps: {
        ...currentRecord.drawnCardTimestamps,
        [cardId]: now
      }
    }
    
    // 3. 儲存到本地
    saveLocalDrawRecord(updatedRecord)
    
    // 4. 同步到雲端（背景執行，不阻塞 UI）
    saveFirestoreDrawRecord(updatedRecord).catch(error => {
      console.error('背景同步到雲端失敗:', error)
    })
    
    return updatedRecord
  } catch (error) {
    console.error('記錄抽卡失敗:', error)
    throw error
  }
}

/**
 * 格式化剩餘時間
 */
export function formatRemainingTime(ms: number): string {
  const minutes = Math.ceil(ms / (1000 * 60))
  return `${minutes} 分鐘`
}