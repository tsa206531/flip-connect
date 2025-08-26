// Firebase 配置和初始化
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Firebase 配置 - 請替換為你的 Firebase 專案配置
const firebaseConfig = {
  apiKey: "AIzaSyD85hOHzb1pghv-er_2Mhdr73zHkBsM2ek",
  authDomain: "drawcard-30a35.firebaseapp.com",
  projectId: "drawcard-30a35",
  storageBucket: "drawcard-30a35.firebasestorage.app",
  messagingSenderId: "133654617393",
  appId: "1:133654617393:web:c2cba1c4be58767e8fe410",
}

// 初始化 Firebase
const app = initializeApp(firebaseConfig)

// 初始化服務
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Google 登入提供者
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

export default app