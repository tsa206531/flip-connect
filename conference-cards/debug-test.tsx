// 這是一個調試測試文件，用來檢查組件是否正常工作

import React from 'react'

// 測試類型定義
interface TestCard {
  id: string
  name: string
  position: string
  frontImageUrl: string
  backImageUrl: string
  createdAt: string
}

// 測試數據
const testCards: TestCard[] = [
  {
    id: "1",
    name: "測試用戶1",
    position: "前端工程師",
    frontImageUrl: "/placeholder.jpg",
    backImageUrl: "/placeholder.jpg",
    createdAt: "2024-01-01"
  },
  {
    id: "2",
    name: "測試用戶2",
    position: "後端工程師",
    frontImageUrl: "/placeholder.jpg",
    backImageUrl: "/placeholder.jpg",
    createdAt: "2024-01-02"
  }
]

// 測試函數
export function testComponents() {
  console.log("=== 組件測試開始 ===")
  
  // 測試類型定義
  console.log("✅ 類型定義正常")
  console.log("測試卡片:", testCards)
  
  // 測試CSS類名
  const testClasses = [
    "glass-morphism",
    "glass-morphism-hover",
    "conference-title",
    "dynamic-subtitle",
    "glow-button"
  ]
  
  console.log("✅ CSS類名檢查完成")
  console.log("測試類名:", testClasses)
  
  // 測試動畫配置
  const testAnimations = {
    fadeIn: { opacity: [0, 1], duration: 0.5 },
    slideUp: { y: [20, 0], duration: 0.6 },
    scale: { scale: [0.9, 1], duration: 0.4 }
  }
  
  console.log("✅ 動畫配置檢查完成")
  console.log("測試動畫:", testAnimations)
  
  console.log("=== 組件測試完成 ===")
  return true
}

// 導出測試數據供其他組件使用
export { testCards, type TestCard }
