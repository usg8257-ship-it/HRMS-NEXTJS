'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GAS } from '@/lib/gas'
import { useAuth } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setLoading(true); setError('')
    try {
      const r: any = await GAS.login(email, password)
      if (!r?.success) { setError(r?.error || 'Invalid email or password.'); setLoading(false); return }
      login(r.token, r.profile)
      router.replace('/dashboard')
    } catch {
      setError('Unable to connect. Please check your internet connection.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight:'100vh',
      background:'var(--apple-gray1)',
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      fontFamily:'-apple-system,"SF Pro Text","Helvetica Neue",sans-serif'
    }} />
      {/* Background gradient - Apple style */}
      <div style={{
        position:'fixed', inset:0, zIndex:0,
        background:'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,113,227,.08) 0%, transparent 70%)',
        pointerEvents:'none'
      }} />

      <div style={{
        position:'relative', zIndex:1,
        width:'100%', maxWidth:380,
        margin:'0 20px'
      }} className="fade-up">

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{
            width:64, height:64, borderRadius:18,
            background:'linear-gradient(145deg,#0071e3,#34aadc)',
            margin:'0 auto 16px',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 8px 24px rgba(0,113,227,.3)',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="8" height="8" rx="2.5" fill="rgba(255,255,255,.95)"/>
              <rect x="13" y="3" width="8" height="8" rx="2.5" fill="rgba(255,255,255,.6)"/>
              <rect x="3" y="13" width="8" height="8" rx="2.5" fill="rgba(255,255,255,.6)"/>
              <rect x="13" y="13" width="8" height="8" rx="2.5" fill="rgba(255,255,255,.95)"/>
            </svg>
          </div>
          <div style={{ fontSize:26, fontWeight:700, color:'var(--text)', letterSpacing:-.5, marginBottom:4 }}>
            United Group Holding
          </div>
          <div style={{ fontSize:15, color:'var(--text3)' }}>
            HRMS - USG
          </div>
        </div>

        {/* Card */}
        <div style={{
          background:'rgba(255,255,255,.85)',
          backdropFilter:'blur(20px) saturate(180%)',
          WebkitBackdropFilter:'blur(20px) saturate(180%)',
          border:'1px solid rgba(255,255,255,.6)',
          borderRadius:var(--r-2xl),
          padding:'28px 28px 24px',
          boxShadow:'0 8px 32px rgba(0,0,0,.08), 0 2px 8px rgba(0,0,0,.04)',
        } as any}>

          {error && (
            <div style={{
              background:'rgba(255,59,48,.06)',
              border:'1px solid rgba(255,59,48,.2)',
              borderRadius:var(--r-md),
              padding:'10px 14px',
              marginBottom:16,
              fontSize:13.5,
              color:'var(--apple-red)',
              display:'flex',
              alignItems:'center',
              gap:8,
            } as any}>
              <span>⚠</span> {error}
            </div>
          )}

          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:13, fontWeight:500, color:'var(--text2)', display:'block', marginBottom:6 }}>
              Email Address
            </label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key==='Enter' && document.getElementById('pwd')?.focus()}
              placeholder="name@company.com"
              className="input-apple"
              autoComplete="email"
              autoFocus
            />
          </div>

          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:13, fontWeight:500, color:'var(--text2)', display:'block', marginBottom:6 }}>
              Password
            </label>
            <input
              id="pwd" type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key==='Enter' && handleLogin()}
              placeholder="Enter your password"
              className="input-apple"
              autoComplete="current-password"
            />
          </div>

          <button
            onClick={handleLogin} disabled={loading}
            className="btn-apple btn-primary"
            style={{ width:'100%', height:44, fontSize:15, fontWeight:500 }}
          >
            {loading ? (
              <span style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center' }}>
                <span className="spinner" style={{ width:16, height:16, borderWidth:2 }} />
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </div>

        <div style={{ textAlign:'center', marginTop:20, fontSize:12, color:'var(--text3)' }}>
          USG · UST · USG-M · UG &nbsp;·&nbsp; United Group Holding
        </div>
      </div>
    </div>
  )
}
