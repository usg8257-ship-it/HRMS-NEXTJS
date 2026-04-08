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
    if (!email || !password) { setError('Email and password required'); return }
    setLoading(true); setError('')
    try {
      const r: any = await GAS.login(email, password)
      if (!r?.success) { setError(r?.error || 'Invalid credentials'); setLoading(false); return }
      login(r.token, r.profile)
      router.replace('/dashboard')
    } catch {
      setError('Connection error — check your network')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#080c18',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif", position: 'relative', overflow: 'hidden',
    }}>
      {/* Grid */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.4,
        backgroundImage: `linear-gradient(rgba(0,122,138,.06) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(0,122,138,.06) 1px, transparent 1px)`,
        backgroundSize: '44px 44px',
      }} />

      {/* Glow orbs */}
      <div style={{ position:'absolute', top:'20%', left:'15%', width:320, height:320,
        background:'radial-gradient(circle, rgba(30,71,153,.15) 0%, transparent 70%)', filter:'blur(40px)' }} />
      <div style={{ position:'absolute', bottom:'20%', right:'15%', width:280, height:280,
        background:'radial-gradient(circle, rgba(0,122,138,.12) 0%, transparent 70%)', filter:'blur(40px)' }} />

      {/* Corner brackets */}
      {[
        { top:20, left:20, borderTop:'2px solid rgba(0,122,138,.5)', borderLeft:'2px solid rgba(0,122,138,.5)' },
        { top:20, right:20, borderTop:'2px solid rgba(0,122,138,.5)', borderRight:'2px solid rgba(0,122,138,.5)' },
        { bottom:20, left:20, borderBottom:'2px solid rgba(0,122,138,.5)', borderLeft:'2px solid rgba(0,122,138,.5)' },
        { bottom:20, right:20, borderBottom:'2px solid rgba(0,122,138,.5)', borderRight:'2px solid rgba(0,122,138,.5)' },
      ].map((s, i) => (
        <div key={i} style={{ position:'absolute', width:36, height:36, ...s }} />
      ))}

      {/* Card */}
      <div style={{
        position:'relative', zIndex:10, width:'100%', maxWidth:420, margin:'0 16px',
        background:'rgba(255,255,255,.04)', border:'1px solid rgba(0,122,138,.25)',
        borderRadius:6, padding:'48px 40px',
        boxShadow:'0 0 60px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.05)',
      }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{
            display:'inline-flex', alignItems:'center', justifyContent:'center',
            width:52, height:52, marginBottom:14,
            border:'1px solid rgba(0,122,138,.5)', borderRadius:4,
            background:'rgba(0,122,138,.08)',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" stroke="#00c9b8" strokeWidth="1.5" fill="none"/>
              <polygon points="12,6 18,10 18,14 12,18 6,14 6,10" stroke="#00c9b8" strokeWidth="1" fill="rgba(0,201,184,.1)"/>
            </svg>
          </div>
          <div style={{ color:'#00c9b8', fontSize:11, letterSpacing:6, marginBottom:4, fontWeight:600 }}>
            UNITED GROUP
          </div>
          <div style={{ color:'rgba(255,255,255,.3)', fontSize:10, letterSpacing:3 }}>
            HR COMMAND SYSTEM
          </div>
        </div>

        {/* Divider */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:28 }}>
          <div style={{ flex:1, height:'1px', background:'rgba(0,122,138,.2)' }} />
          <span style={{ color:'rgba(0,122,138,.5)', fontSize:9, letterSpacing:3 }}>SECURE ACCESS</span>
          <div style={{ flex:1, height:'1px', background:'rgba(0,122,138,.2)' }} />
        </div>

        {/* Form */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <div style={{ color:'rgba(0,201,184,.7)', fontSize:9, letterSpacing:2, marginBottom:7, fontWeight:600 }}>
              EMAIL ADDRESS
            </div>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && document.getElementById('pwd-input')?.focus()}
              placeholder="your@email.com"
              style={{
                width:'100%', boxSizing:'border-box',
                background:'rgba(0,122,138,.06)', border:'1px solid rgba(0,122,138,.25)',
                borderRadius:3, padding:'11px 13px', color:'#fff', fontSize:13,
                fontFamily:"'DM Sans', sans-serif", outline:'none', letterSpacing:.5,
              }}
            />
          </div>

          <div>
            <div style={{ color:'rgba(0,201,184,.7)', fontSize:9, letterSpacing:2, marginBottom:7, fontWeight:600 }}>
              PASSWORD
            </div>
            <input
              id="pwd-input" type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              style={{
                width:'100%', boxSizing:'border-box',
                background:'rgba(0,122,138,.06)', border:'1px solid rgba(0,122,138,.25)',
                borderRadius:3, padding:'11px 13px', color:'#fff', fontSize:13,
                fontFamily:"'DM Sans', sans-serif", outline:'none',
              }}
            />
          </div>

          {error && (
            <div style={{
              background:'rgba(200,48,48,.08)', border:'1px solid rgba(200,48,48,.3)',
              borderRadius:3, padding:'9px 13px', color:'#ff6b6b', fontSize:12,
            }}>
              ⚠ {error}
            </div>
          )}

          <button
            onClick={handleLogin} disabled={loading}
            style={{
              marginTop:6, width:'100%', padding:'12px',
              background: loading ? 'rgba(0,122,138,.06)' : 'rgba(0,122,138,.15)',
              border:'1px solid rgba(0,122,138,.5)', borderRadius:3,
              color: loading ? 'rgba(0,201,184,.4)' : '#00c9b8',
              fontSize:10, letterSpacing:4, fontFamily:"'DM Sans', sans-serif",
              cursor: loading ? 'not-allowed' : 'pointer', fontWeight:600,
              transition:'all .2s',
            }}
          >
            {loading ? 'AUTHENTICATING...' : 'SIGN IN →'}
          </button>
        </div>

        <div style={{ marginTop:28, textAlign:'center', color:'rgba(255,255,255,.12)', fontSize:10, letterSpacing:2 }}>
          USG · UST · USG-M · UG
        </div>
      </div>
    </div>
  )
}
