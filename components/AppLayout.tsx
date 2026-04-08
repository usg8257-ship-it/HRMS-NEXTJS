'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'

interface Props {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export default function AppLayout({ children, title, subtitle, actions }: Props) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--apple-gray1)' }}>
      <div style={{ textAlign:'center' }}>
        <div className="spinner" style={{ margin:'0 auto 12px' }} />
        <div style={{ fontSize:13, color:'var(--text3)' }}>Loading...</div>
      </div>
    </div>
  )

  if (!user) return null

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--apple-gray1)' }}>
      <Sidebar />
      <main style={{ marginLeft:220, flex:1, display:'flex', flexDirection:'column', minHeight:'100vh' }}>
        {/* Topbar */}
        {(title || actions) && (
          <div className="apple-topbar" style={{ justifyContent:'space-between' }}>
            <div>
              {title && (
                <div style={{ fontSize:17, fontWeight:600, color:'var(--text)', letterSpacing:-.3 }}>
                  {title}
                </div>
              )}
              {subtitle && (
                <div style={{ fontSize:12, color:'var(--text3)', marginTop:1 }}>{subtitle}</div>
              )}
            </div>
            {actions && (
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                {actions}
              </div>
            )}
          </div>
        )}
        {/* Content */}
        <div style={{ flex:1, padding:'24px 24px' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
