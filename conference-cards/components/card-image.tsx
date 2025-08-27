"use client"

import { useState } from 'react'
import OptimizedImage from './optimized-image'
import { motion } from 'framer-motion'

interface CardImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  isFlipped?: boolean
  onLoad?: () => void
  onError?: () => void
}

// 為卡片生成特定的模糊佔位符
const generateCardBlurDataURL = () => {
  return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImNhcmRHcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmOWZhZmI7c3RvcC1vcGFjaXR5OjEiIC8+CjxzdG9wIG9mZnNldD0iNTAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZjNmNGY2O3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNlNWU3ZWI7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjY2FyZEdyYWRpZW50KSIgcng9IjEyIi8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjE2MCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNkMWQ1ZGIiIHJ4PSI4Ii8+CjxyZWN0IHg9IjIwIiB5PSIxNDAiIHdpZHRoPSIxMjAiIGhlaWdodD0iMTYiIGZpbGw9IiNkMWQ1ZGIiIHJ4PSI4Ii8+CjxyZWN0IHg9IjIwIiB5PSIxNzAiIHdpZHRoPSI4MCIgaGVpZ2h0PSIxMiIgZmlsbD0iI2UxZTVlOSIgcng9IjYiLz4KPC9zdmc+"
}

export default function CardImage({
  src,
  alt,
  className = '',
  priority = false,
  isFlipped = false,
  onLoad,
  onError
}: CardImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleLoad = () => {
    setImageLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    onError?.()
  }

  return (
    <motion.div
      className={`relative w-full h-full ${className}`}
      animate={{
        rotateY: isFlipped ? 180 : 0
      }}
      transition={{
        duration: 0.6,
        ease: "easeInOut"
      }}
      style={{
        transformStyle: "preserve-3d"
      }}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        className="object-cover rounded-lg"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={priority}
        quality={85}
        placeholder="blur"
        blurDataURL={generateCardBlurDataURL()}
        onLoad={handleLoad}
        onError={handleError}
        fallbackSrc="/placeholder.svg"
        lazy={!priority}
      />

    </motion.div>
  )
}