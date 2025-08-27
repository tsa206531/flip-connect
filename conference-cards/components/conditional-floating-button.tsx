"use client"

import { usePathname } from 'next/navigation'
import FloatingDrawButton from './floating-draw-button'

export default function ConditionalFloatingButton() {
  const pathname = usePathname()
  
  // 只在首頁顯示浮動按鈕
  if (pathname === '/') {
    return <FloatingDrawButton />
  }
  
  return null
}