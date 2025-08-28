import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from './firebase'
import { DrawRecord } from './draw-cache'

// 根據 email 查找用戶 UID
export async function findUserByEmail(email: string): Promise<string | null> {
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('email', '==', email))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0]
      return userDoc.id // 返回 UID
    }
    
    return null
  } catch (error) {
    console.error('查找用戶失敗:', error)
    throw error
  }
}

// 獲取用戶的抽卡記錄
export async function getUserDrawRecord(userId: string): Promise<DrawRecord | null> {
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
        lastSyncTime: Date.now()
      }
    }
    
    return null
  } catch (error) {
    console.error('獲取用戶抽卡記錄失敗:', error)
    throw error
  }
}

// 清空用戶的抽卡記錄
export async function clearUserDrawRecord(userId: string): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'drawRecords', 'main')
    
    await setDoc(docRef, {
      drawnCardIds: [],
      drawCount: 0,
      lastDrawTime: 0,
      updatedAt: Date.now()
    }, { merge: true })
    
    console.log('用戶抽卡記錄已清空:', userId)
  } catch (error) {
    console.error('清空用戶抽卡記錄失敗:', error)
    throw error
  }
}

// 移除用戶的特定抽卡記錄
export async function removeUserDrawnCards(userId: string, cardIdsToRemove: string[]): Promise<DrawRecord> {
  try {
    // 先獲取當前記錄
    const currentRecord = await getUserDrawRecord(userId)
    if (!currentRecord) {
      throw new Error('找不到用戶抽卡記錄')
    }
    
    // 移除指定的卡片ID
    const updatedCardIds = currentRecord.drawnCardIds.filter(id => !cardIdsToRemove.includes(id))
    const newDrawCount = Math.max(0, currentRecord.drawCount - cardIdsToRemove.length)
    
    const docRef = doc(db, 'users', userId, 'drawRecords', 'main')
    
    const updatedRecord = {
      drawnCardIds: updatedCardIds,
      drawCount: newDrawCount,
      lastDrawTime: updatedCardIds.length > 0 ? currentRecord.lastDrawTime : 0,
      updatedAt: Date.now()
    }
    
    await setDoc(docRef, updatedRecord, { merge: true })
    
    console.log('用戶抽卡記錄已更新:', userId, '移除卡片:', cardIdsToRemove)
    
    return {
      userId,
      drawnCardIds: updatedCardIds,
      drawCount: newDrawCount,
      lastDrawTime: updatedCardIds.length > 0 ? currentRecord.lastDrawTime : 0,
      lastSyncTime: Date.now()
    }
  } catch (error) {
    console.error('移除用戶抽卡記錄失敗:', error)
    throw error
  }
}

// 獲取用戶基本資訊
export async function getUserInfo(userId: string): Promise<any> {
  try {
    const docRef = doc(db, 'users', userId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return docSnap.data()
    }
    
    return null
  } catch (error) {
    console.error('獲取用戶資訊失敗:', error)
    throw error
  }
}