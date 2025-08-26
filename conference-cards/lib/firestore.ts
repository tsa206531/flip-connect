import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  setDoc,
  query,
  orderBy,
  where,
  Timestamp 
} from 'firebase/firestore'
import { db } from './firebase'

// 卡片資料介面
export interface CardData {
  id?: string
  userId: string
  name: string
  position: string
  frontImageUrl: string
  backImageUrl: string
  createdAt: Timestamp
}

// 用戶資料介面
export interface UserData {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  createdAt: Timestamp
}

// 儲存用戶資料到 Firestore
export async function saveUserToFirestore(user: any) {
  try {
    const userRef = doc(db, 'users', user.uid)
    const userData: UserData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      createdAt: Timestamp.now()
    }
    
    await setDoc(userRef, userData, { merge: true })
    console.log('用戶資料已儲存到 Firestore')
    return userData
  } catch (error) {
    console.error('儲存用戶資料失敗:', error)
    throw error
  }
}

// 上傳卡片到 Firestore
export async function uploadCardToFirestore(cardData: Omit<CardData, 'id' | 'createdAt'>) {
  try {
    const cardsRef = collection(db, 'cards')
    const newCard: Omit<CardData, 'id'> = {
      ...cardData,
      createdAt: Timestamp.now()
    }
    
    const docRef = await addDoc(cardsRef, newCard)
    console.log('卡片已上傳到 Firestore，ID:', docRef.id)
    
    return {
      id: docRef.id,
      ...newCard
    }
  } catch (error) {
    console.error('上傳卡片到 Firestore 失敗:', error)
    throw error
  }
}

// 從 Firestore 獲取所有卡片
export async function getCardsFromFirestore(): Promise<CardData[]> {
  try {
    const cardsRef = collection(db, 'cards')
    const q = query(cardsRef, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    const cards: CardData[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      cards.push({
        id: doc.id,
        userId: data.userId,
        name: data.name,
        position: data.position,
        frontImageUrl: data.frontImageUrl,
        backImageUrl: data.backImageUrl,
        createdAt: data.createdAt
      })
    })
    
    console.log('從 Firestore 獲取卡片數量:', cards.length)
    return cards
  } catch (error) {
    console.error('從 Firestore 獲取卡片失敗:', error)
    throw error
  }
}

// 獲取特定用戶的卡片
export async function getUserCardsFromFirestore(userId: string): Promise<CardData[]> {
  try {
    const cardsRef = collection(db, 'cards')
    const q = query(
      cardsRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    
    const cards: CardData[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      cards.push({
        id: doc.id,
        userId: data.userId,
        name: data.name,
        position: data.position,
        frontImageUrl: data.frontImageUrl,
        backImageUrl: data.backImageUrl,
        createdAt: data.createdAt
      })
    })
    
    console.log('用戶卡片數量:', cards.length)
    return cards
  } catch (error) {
    console.error('獲取用戶卡片失敗:', error)
    throw error
  }
}