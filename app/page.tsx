'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (user) router.replace('/dashboard')
    else router.replace('/login')
  }, [user, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="spin w-8 h-8 rounded-full border-2 border-transparent" style={{ borderTopColor: 'var(--teal)' }} />
    </div>
  )
}
