"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { LogOut, User, Upload, Sparkles } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import GoogleLoginModal from "./google-login-modal"
import Image from "next/image"

export default function UserMenu() {
  const { user, signOut, loading } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      setShowUserMenu(false)
    } catch (error) {
      console.error('登出失敗:', error)
    }
  }

  if (loading) {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse" />
    )
  }

  if (!user) {
    return (
      <>
        <Button
          onClick={() => setShowLoginModal(true)}
          variant="ghost"
          className="glass-morphism glass-morphism-hover text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl font-syne text-sm"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          登入
        </Button>
        
        <GoogleLoginModal 
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      </>
    )
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="flex items-center gap-3 glass-morphism glass-morphism-hover px-4 py-2 rounded-xl transition-all duration-200"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="w-8 h-8 rounded-full overflow-hidden">
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.displayName || "用戶頭像"}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
        <span className="text-white font-syne text-sm hidden md:block">
          {user.displayName || "用戶"}
        </span>
      </motion.button>

      <AnimatePresence>
        {showUserMenu && (
          <motion.div
            className="absolute top-full left-0 mt-2 w-48 glass-morphism rounded-xl border border-border/50 shadow-2xl z-[60]"
            style={{ 
              position: 'fixed',
              top: '4rem',
              left: '1.5rem'
            }}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-2">
              <div className="px-3 py-2 border-b border-border/50">
                <p className="text-white font-semibold text-sm font-noto-sans-tc">
                  {user.displayName}
                </p>
                <p className="text-muted-foreground text-xs font-syne">
                  {user.email}
                </p>
              </div>
              
              <div className="mt-2 space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left font-syne text-sm"
                  onClick={() => {
                    window.location.href = '/upload'
                    setShowUserMenu(false)
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  上傳名片
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left font-syne text-sm text-red-400 hover:text-red-300"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  登出
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 點擊外部關閉選單 */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-[50]"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  )
}