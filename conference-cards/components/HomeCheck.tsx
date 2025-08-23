"use client"

import { useEffect } from "react"

export function HomeCheck() {
  useEffect(() => {
    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL)
    console.log("Color:", process.env.NEXT_PUBLIC_COLOR)
  }, [])

  return <div className="text-green-500">環境變數檢查完成 ✅</div>
}