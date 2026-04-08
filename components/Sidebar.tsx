'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'

const NAV = [
  { section: 'Overview' },
  { href:'/dashboard',    label:'Dashboard',        icon:'⊞' },
  { href:'/onboarding',   label:'Onboarding',       icon:'⟳' },
  { href:'/tracker',      label:'Progress Tracker',  icon:'◈' },
  { href:'/employees',    label:'Active Manpower',   icon:'◉' },
  { section: 'HR Operations' },
  { href:'/master',       label:'Master Data',       icon:'⊟' },
  { href:'/resignations', label:'Resignations',      icon:'⊖' },
  { href:'/letters',      label:'Letters',           icon:'◻' },
  { href:'/leave',        label:'Leave',             icon:'◷' },
  { section: 'System' },
  { href:'/users',        label:'Users',             icon:'◯' },
  { href:'/profile',      label:'My Profile',        icon:'◐' },
]

const ROLE_LABEL: Record<string,string> = {
  SUPER_ADMIN:'Super Admin', HR_OFFICER:'HR Officer',
  ENTITY_MANAGER:'Entity Manager', STAFF:'Staff', EMPLOYEE:'Employee',
}

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const initials = (user?.name || user?.email || '?')
    .split(' ').map((w:string) => w[0]).slice(0,2).join('').toUpperCase()

  return (
    <aside className="apple-sidebar">
      {/* Brand */}
      <div style={{
        padding:'20px 16px 16px',
        borderBottom:'1px solid var(--border)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:36, height:36, borderRadius:10, flexShrink:0,
            background:'linear-gradient(135deg,#0071e3,#34aadc)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="8" height="8" rx="2" fill="rgba(255,255,255,.9)"/>
              <rect x="13" y="3" width="8" height="8" rx="2" fill="rgba(255,255,255,.6)"/>
              <rect x="3" y="13" width="8" height="8" rx="2" fill="rgba(255,255,255,.6)"/>
              <rect x="13" y="13" width="8" height="8" rx="2" fill="rgba(255,255,255,.9)"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:'var(--text)', letterSpacing:-.3 }}>
              United Group
            </div>
            <div style={{ fontSize:11, color:'var(--text3)', marginTop:1 }}>
              HR System
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'8px 8px', overflowY:'auto' }}>
        {NAV.map((item, i) => {
          if ('section' in item) {
            return (
              <div key={i} style={{
                padding:'16px 10px 5px',
                fontSize:11, fontWeight:600,
                color:'var(--text3)', letterSpacing:.03,
              }}>
                {item.section}
              </div>
            )
          }
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href!} style={{
              display:'flex', alignItems:'center', gap:8,
              padding:'8px 10px', textDecoration:'none',
              borderRadius:var(--r-md),
              color: active ? 'var(--apple-blue)' : 'var(--text2)',
              background: active ? 'rgba(0,113,227,.08)' : 'transparent',
              fontSize:14, fontWeight: active ? 500 : 400,
              transition:'all .15s', marginBottom:1,
            } as any}
              onMouseEnter={e => !active && ((e.currentTarget as HTMLElement).style.background='rgba(0,0,0,.04)')}
              onMouseLeave={e => !active && ((e.currentTarget as HTMLElement).style.background='transparent')}
            >
              <span style={{
                width:28, height:28, borderRadius:7, flexShrink:0,
                background: active ? 'rgba(0,113,227,.12)' : 'rgba(0,0,0,.04)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:13, color: active ? 'var(--apple-blue)' : 'var(--text3)',
                transition:'all .15s',
              }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{
        padding:'12px 12px', borderTop:'1px solid var(--border)',
        display:'flex', alignItems:'center', gap:10,
      }}>
        <div style={{
          width:32, height:32, borderRadius:'50%', flexShrink:0,
          background:'linear-gradient(135deg,#0071e3,#34aadc)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:12, fontWeight:600, color:'#fff',
        }}>{initials}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:500, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            {user?.name || user?.email}
          </div>
          <div style={{ fontSize:11, color:'var(--text3)', marginTop:1 }}>
            {ROLE_LABEL[user?.role || ''] || user?.role}
          </div>
        </div>
        <button onClick={logout} title="Sign out" style={{
          background:'rgba(0,0,0,.05)', border:'none', borderRadius:7,
          width:28, height:28, cursor:'pointer', color:'var(--text3)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:13, transition:'all .15s', flexShrink:0,
        }}
          onMouseEnter={e => (e.currentTarget.style.background='rgba(255,59,48,.1)')}
          onMouseLeave={e => (e.currentTarget.style.background='rgba(0,0,0,.05)')}
        >↩</button>
      </div>
    </aside>
  )
}
