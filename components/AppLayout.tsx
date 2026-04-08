'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div style={{ width:32, height:32, borderRadius:'50%', border:'3px solid rgba(0,122,138,.2)', borderTopColor:'var(--teal)', animation:'spin .7s linear infinite' }} />
    </div>
  )

  if (!user) return null

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar />
      <main style={{ marginLeft:214, flex:1, display:'flex', flexDirection:'column', minHeight:'100vh' }}>
        {children}
      </main>
    </div>
  )
}
