import type React from "react"
import type { Metadata } from "next"
import { Inter, Dela_Gothic_One, Syne, Noto_Sans_TC } from "next/font/google"
import FloatingDrawButton from "@/components/floating-draw-button"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/AuthContext"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
const delaGothicOne = Dela_Gothic_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dela-gothic",
})
const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
})
const notoSansTC = Noto_Sans_TC({
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-noto-sans-tc",
})

export const metadata: Metadata = {
  title: "研討會互動卡片 | Conference Interactive Cards",
  description: "一個讓研討會參與者上傳個人資料卡片並進行互動交流的平台",
  keywords: "研討會, 互動卡片, 交流, 網路活動",
  authors: [{ name: "Conference Team" }],
  openGraph: {
    title: "研討會互動卡片",
    description: "上傳您的個人資料卡片，與其他參與者互動交流",
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body className={`${inter.className} ${delaGothicOne.variable} ${syne.variable} ${notoSansTC.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <FloatingDrawButton />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
