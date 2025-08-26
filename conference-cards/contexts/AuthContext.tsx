"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  User, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { saveUserToFirestore } from '@/lib/firestore'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    try {
      console.log('開始 Google 登入...')
      const result = await signInWithPopup(auth, googleProvider)
      console.log('Google 登入成功:', result.user)
      
      // 儲存用戶資料到 Firestore
      await saveUserToFirestore(result.user)
      
      return result
    } catch (error: any) {
      console.error('Google 登入失敗:', error)
      console.error('錯誤代碼:', error.code)
      console.error('錯誤訊息:', error.message)
      
      // 顯示用戶友好的錯誤訊息
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('用戶關閉了登入彈窗')
      } else if (error.code === 'auth/popup-blocked') {
        alert('瀏覽器阻止了彈窗，請允許彈窗後重試')
      } else if (error.code === 'auth/unauthorized-domain') {
        alert('網域未授權，請檢查 Firebase 設定')
      }
      
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error('登出失敗:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}