import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "管理後台 | 研討會互動卡片",
  description: "管理研討會互動卡片的後台系統",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
