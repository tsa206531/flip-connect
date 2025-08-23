"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X, AlertCircle, ArrowLeft, CheckCircle, Info, Sparkles, FileImage } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

interface PopupProps {
  type: "success" | "error" | "info"
  message: string
  details?: string
  onClose: () => void
}

function Popup({ type, message, details, onClose }: PopupProps) {
  const [showDetails, setShowDetails] = useState(false)

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-8 h-8 text-success" />
      case "error":
        return <AlertCircle className="w-8 h-8 text-destructive" />
      case "info":
        return <Info className="w-8 h-8 text-primary" />
    }
  }

  const getButtonClass = () => {
    switch (type) {
      case "success":
        return "bg-success hover:bg-success/90 text-success-foreground"
      case "error":
        return "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
      case "info":
        return "bg-primary hover:bg-primary/90 text-primary-foreground"
    }
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="glass-morphism rounded-3xl p-8 max-w-md w-full shadow-2xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <motion.div
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/20 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {getIcon()}
          </motion.div>

          <motion.h3
            className="text-2xl font-bold text-foreground mb-3 font-noto-sans-tc"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {type === "success" ? "上傳成功！" : type === "error" ? "上傳失敗" : "提示"}
          </motion.h3>

          <motion.p
            className="text-muted-foreground mb-6 font-syne"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {message}
          </motion.p>

          {details && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="text-muted-foreground hover:text-foreground"
              >
                {showDetails ? "隱藏" : "顯示"}詳細信息
              </Button>
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    className="mt-3 p-4 bg-muted/30 rounded-lg text-left"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">{details}</pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={onClose}
              className={`w-full h-12 rounded-xl font-syne text-base ${getButtonClass()}`}
            >
              確定
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function UploadPage() {
  const [name, setName] = useState("")
  const [position, setPosition] = useState("")
  const [frontImage, setFrontImage] = useState<File | null>(null)
  const [backImage, setBackImage] = useState<File | null>(null)
  const [frontPreview, setFrontPreview] = useState<string | null>(null)
  const [backPreview, setBackPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [frontDragActive, setFrontDragActive] = useState(false)
  const [backDragActive, setBackDragActive] = useState(false)
  const [popup, setPopup] = useState<{ type: "success" | "error" | "info"; message: string; details?: string } | null>(
    null,
  )
  // 移除滑鼠追蹤狀態以避免不必要的重新渲染
  const frontFileInputRef = useRef<HTMLInputElement>(null)
  const backFileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // 移除滑鼠移動處理函數以避免不必要的重新渲染

  const handleDrag = (e: React.DragEvent, type: "front" | "back") => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      if (type === "front") {
        setFrontDragActive(true)
      } else {
        setBackDragActive(true)
      }
    } else if (e.type === "dragleave") {
      if (type === "front") {
        setFrontDragActive(false)
      } else {
        setBackDragActive(false)
      }
    }
  }

  const handleDrop = (e: React.DragEvent, type: "front" | "back") => {
    e.preventDefault()
    e.stopPropagation()
    if (type === "front") {
      setFrontDragActive(false)
    } else {
      setBackDragActive(false)
    }

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0], type)
    }
  }

  const handleFile = (file: File, type: "front" | "back") => {
    console.log(`Processing ${type} file:`, file.name, file.size, file.type)

    const maxFileSize = 1.5 * 1024 * 1024 // 1.5MB

    if (file.size > maxFileSize) {
      setPopup({
        type: "error",
        message: `檔案大小不能超過 1.5MB (當前: ${(file.size / 1024 / 1024).toFixed(1)}MB)`,
      })
      return
    }

    if (!file.type.startsWith("image/")) {
      setPopup({
        type: "error",
        message: `請選擇圖片檔案 (當前類型: ${file.type})`,
      })
      return
    }

    if (type === "front") {
      setFrontImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setFrontPreview(e.target?.result as string)
      }
      reader.onerror = (e) => {
        console.error("FileReader error for front image:", e)
        setPopup({
          type: "error",
          message: "封面圖片預覽失敗",
        })
      }
      reader.readAsDataURL(file)
    } else {
      setBackImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setBackPreview(e.target?.result as string)
      }
      reader.onerror = (e) => {
        console.error("FileReader error for back image:", e)
        setPopup({
          type: "error",
          message: "封底圖片預覽失敗",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, type: "front" | "back") => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file, type)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("=== Starting Upload Process ===")

    if (!name.trim() || !position.trim() || !frontImage || !backImage) {
      setPopup({
        type: "error",
        message: "請填寫所有必填欄位並選擇封面和封底圖片",
      })
      return
    }

    setUploading(true)

    try {
      console.log("Creating FormData...")
      const formData = new FormData()
      formData.append("name", name.trim())
      formData.append("position", position.trim())
      formData.append("frontImage", frontImage)
      formData.append("backImage", backImage)

      console.log("FormData created, sending request...")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      console.log("Response received:", response.status, response.statusText)

      const responseText = await response.text()
      console.log("Response text length:", responseText.length)

      if (!response.ok) {
        console.error("Upload failed with status:", response.status)
        console.error("Response text:", responseText)

        let errorData
        try {
          errorData = JSON.parse(responseText)
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError)
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        throw new Error(errorData.error || "上傳失敗")
      }

      let result
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Failed to parse success response:", parseError)
        throw new Error("服務器回應格式錯誤")
      }

      console.log("Upload successful:", result)

      if (result.success) {
        // Clear form
        setName("")
        setPosition("")
        setFrontImage(null)
        setBackImage(null)
        setFrontPreview(null)
        setBackPreview(null)

        // Clear file inputs
        if (frontFileInputRef.current) frontFileInputRef.current.value = ""
        if (backFileInputRef.current) backFileInputRef.current.value = ""

        setPopup({
          type: "success",
          message: result.message || "您的名片已成功上傳！",
          details: `存儲方式: ${result.card?.storageType || "unknown"}\n總名片數: ${result.totalCards || 0}`,
        })
      } else {
        throw new Error(result.error || "上傳失敗")
      }
    } catch (error) {
      console.error("=== Upload Error ===")
      console.error("Error:", error)

      setPopup({
        type: "error",
        message: error instanceof Error ? error.message : "上傳失敗，請重試",
        details: error instanceof Error ? error.stack : String(error),
      })
    } finally {
      setUploading(false)
    }
  }

  const clearImage = (type: "front" | "back") => {
    if (type === "front") {
      setFrontImage(null)
      setFrontPreview(null)
      if (frontFileInputRef.current) {
        frontFileInputRef.current.value = ""
      }
    } else {
      setBackImage(null)
      setBackPreview(null)
      if (backFileInputRef.current) {
        backFileInputRef.current.value = ""
      }
    }
  }

  const handlePopupClose = () => {
    setPopup(null)
    if (popup?.type === "success") {
      router.push("/")
    }
  }

  const UploadArea = ({
    type,
    preview,
    dragActive,
    fileInputRef,
  }: {
    type: "front" | "back"
    preview: string | null
    dragActive: boolean
    fileInputRef: React.RefObject<HTMLInputElement>
  }) => (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Label Section */}
      <div className="text-center">
        <Label className="text-lg font-medium text-foreground font-noto-sans-tc">
          {type === "front" ? "封面圖片" : "封底圖片"} *
        </Label>
      </div>

      {/* Upload Section */}
      <motion.div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
          dragActive 
            ? "border-primary/60 bg-primary/10 scale-105" 
            : "border-muted/40 hover:border-primary/40 hover:bg-muted/10"
        }`}
        onDragEnter={(e) => handleDrag(e, type)}
        onDragLeave={(e) => handleDrag(e, type)}
        onDragOver={(e) => handleDrag(e, type)}
        onDrop={(e) => handleDrop(e, type)}
        whileHover={{ scale: dragActive ? 1.05 : 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {!preview ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
              animate={{
                scale: dragActive ? 1.1 : 1,
                rotate: dragActive ? 5 : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              <Upload className="h-8 w-8 text-primary" />
            </motion.div>
            <h3 className="text-lg mb-2 font-syne text-foreground font-semibold">
              {type === "front" ? "上傳封面" : "上傳封底"}
            </h3>
            <p className="text-sm mb-6 font-syne text-muted-foreground">PNG、JPG，限制 1.5MB</p>
            <Button
              type="button"
              variant="outline"
              className="glass-morphism glass-morphism-hover border-primary/30 hover:border-primary/50 px-6 py-2 rounded-xl font-syne text-foreground"
              onClick={() => fileInputRef.current?.click()}
            >
              選擇檔案
            </Button>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative inline-block">
              <Image
                src={preview || "/placeholder.svg"}
                alt={type === "front" ? "封面預覽" : "封底預覽"}
                width={120}
                height={160}
                className="rounded-xl shadow-lg max-h-32 w-auto"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-7 w-7 rounded-full p-0 shadow-lg"
                onClick={() => clearImage(type)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs font-syne text-muted-foreground">點擊 X 重新選擇</p>
          </motion.div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileInput(e, type)}
          className="hidden"
        />
      </motion.div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-safe">
      {/* 動態背景效果 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 主背景漸層 */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
        
        {/* 浮動光球效果 */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        {/* 網格背景 */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* 移除滑鼠光效以避免閃爍問題 */}

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* 返回按鈕 */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            type="button"
            variant="ghost"
            className="glass-morphism glass-morphism-hover text-muted-foreground hover:text-foreground p-3 rounded-xl"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            返回
          </Button>
        </motion.div>

        {/* 主要表單卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="glass-morphism shadow-2xl border border-white/20 rounded-3xl overflow-hidden">
            <CardHeader className="text-center pb-8 px-8 pt-8">
              <motion.div
                className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <FileImage className="w-10 h-10 text-primary" />
              </motion.div>
              <CardTitle className="text-3xl font-noto-sans-tc mb-3 font-bold text-foreground">
                上傳個人名片
              </CardTitle>
              <p className="font-syne text-lg text-muted-foreground">
                上傳您的個人名片封面和封底，讓其他參與者認識您
              </p>
            </CardHeader>

            <CardContent className="space-y-8 px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* 姓名輸入 */}
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Label htmlFor="name" className="text-lg font-medium text-foreground font-noto-sans-tc">
                    姓名 *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="請輸入您的姓名"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-14 text-lg border-border/50 rounded-xl font-noto-sans-tc font-semibold glass-morphism placeholder-muted-foreground text-foreground focus:border-primary/50 focus:ring-primary/20"
                    required
                  />
                </motion.div>

                {/* 職位輸入 */}
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Label htmlFor="position" className="text-lg font-medium text-foreground font-syne">
                    職位 *
                  </Label>
                  <Input
                    id="position"
                    type="text"
                    placeholder="請輸入您的職位"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full h-14 text-lg border-border/50 rounded-xl font-syne glass-morphism placeholder-muted-foreground text-foreground focus:border-primary/50 focus:ring-primary/20"
                    required
                  />
                </motion.div>

                {/* 上傳區域 */}
                <div className="space-y-8">
                  <UploadArea
                    type="front"
                    preview={frontPreview}
                    dragActive={frontDragActive}
                    fileInputRef={frontFileInputRef}
                  />
                  <UploadArea
                    type="back"
                    preview={backPreview}
                    dragActive={backDragActive}
                    fileInputRef={backFileInputRef}
                  />
                </div>

                {/* 操作按鈕 */}
                <motion.div
                  className="flex gap-4 pt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-14 glass-morphism glass-morphism-hover border-border/50 hover:border-primary/50 rounded-xl font-syne text-lg text-foreground"
                    onClick={() => router.push("/")}
                    disabled={uploading}
                  >
                    取消
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-syne text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={uploading || !name.trim() || !position.trim() || !frontImage || !backImage}
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                        <span className="text-base">上傳中...</span>
                      </>
                    ) : (
                      <span className="text-base">確認上傳</span>
                    )}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 彈出通知 */}
      <AnimatePresence>
        {popup && (
          <Popup type={popup.type} message={popup.message} details={popup.details} onClose={handlePopupClose} />
        )}
      </AnimatePresence>
    </div>
  )
}
