"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const next = searchParams.get('next') || '/admin'

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include',
        cache: 'no-store',
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || '登入失敗')
      // 使用硬跳轉確保帶上 HttpOnly cookie 並觸發 middleware 判斷
      window.location.assign(next)
    } catch (err: any) {
      setError(err.message || '登入失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-gray-800/60 border border-gray-700 rounded-xl p-6 space-y-4">
        <h1 className="text-2xl font-bold text-white">管理員登入</h1>
        <p className="text-sm text-gray-400">請輸入管理密碼以繼續</p>
        <Input
          type="password"
          placeholder="管理密碼"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-gray-900 border-gray-700 text-white"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? '登入中...' : '登入'}
        </Button>
      </form>
    </div>
  )
}
