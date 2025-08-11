"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface AdminLoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AdminLoginModal({ isOpen, onClose }: AdminLoginModalProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Simple password check - in production, this should be more secure
  const ADMIN_PASSWORD = "sammi2024"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    if (password === ADMIN_PASSWORD) {
      // Success - redirect to admin page
      onClose()
      router.push("/admin")
    } else {
      setError("密碼錯誤，請重新輸入")
      setPassword("")
    }

    setIsLoading(false)
  }

  const handleClose = () => {
    setPassword("")
    setError("")
    setShowPassword(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 w-full max-w-md shadow-2xl border border-white/20"
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-noto-sans-tc">管理員登入</h3>
              </div>
            </div>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4 flex items-center gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm font-syne">{error}</p>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white font-syne">
                密碼
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="請輸入管理員密碼"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-gray-400 font-syne pr-12"
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-2"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 font-syne"
                onClick={handleClose}
                disabled={isLoading}
              >
                取消
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 text-white font-syne"
                disabled={isLoading || !password.trim()}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    驗證中...
                  </>
                ) : (
                  "登入"
                )}
              </Button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-gray-400 text-xs text-center font-syne">僅限管理員使用，請勿分享密碼</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
