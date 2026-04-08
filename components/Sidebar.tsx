'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'

const NAV = [
  { section: 'OVERVIEW' },
  { href: '/dashboard',  label: 'Dashboard',        icon: '📊' },
  { href: '/onboarding', label: 'Onboarding',        icon: '🔄', badge: 'ob' },
  { href: '/tracker',    label: 'Progress Tracker',  icon: '📋', badge: 'ds' },
  { href: '/employees',  label: 'Active Manpower',   icon: '👥', badge: 'emp' },
  { section: 'HR OPS' },
  { href: '/resignations', label: 'Resignations',    icon: '🚫' },
  { href: '/master',       label: 'Master Data',     icon: '📁' },
  { href: '/letters',      label: 'Letters',         icon: '📄' },
  { href: '/leave',        label: 'Leave',           icon: '📅' },
  { section: 'SYSTEM' },
  { href: '/users',   label: 'Users',    icon: '👤' },
  { href: '/setup',   label: 'Setup',    icon: '⚙️' },
  { href: '/profile', label: 'My Profile', icon: '🙍' },
]

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: '#00c9b8', HR_OFFICER: '#6b9fff',
  ENTITY_MANAGER: '#9d8fff', STAFF: '#8fa3be', EMPLOYEE: '#ffb347',
}

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const role = user?.role || ''
  const initials = (user?.name || user?.email || '?').split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()

  const canAccess = (href: string) => {
    const restricted: Record<string, string[]> = {
      '/users':  ['SUPER_ADMIN', 'HR_OFFICER'],
      '/setup':  ['SUPER_ADMIN'],
      '/letters': ['SUPER_ADMIN', 'HR_OFFICER', 'ENTITY_MANAGER'],
      '/master':  ['SUPER_ADMIN', 'HR_OFFICER', 'ENTITY_MANAGER'],
      '/resignations': ['SUPER_ADMIN', 'HR_OFFICER', 'ENTITY_MANAGER'],
    }
    const allowed = restricted[href]
    if (!allowed) return true
    return allowed.includes(role)
  }

  return (
    <aside style={{
      width: 214, minWidth: 214, background: '#0d1e3a',
      display: 'flex', flexDirection: 'column', position: 'fixed',
      height: '100vh', zIndex: 200, overflowY: 'auto',
      boxShadow: '3px 0 20px rgba(0,0,0,.3)',
    }}>
      {/* Brand */}
      <div style={{
        padding: '16px 14px', borderBottom: '1px solid rgba(255,255,255,.07)',
        display: 'flex', alignItems: 'center', gap: 10, minHeight: 68,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: 'rgba(0,201,184,.15)', border: '1px solid rgba(0,201,184,.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" stroke="#00c9b8" strokeWidth="1.5" fill="none"/>
            <polygon points="12,6 18,10 18,14 12,18 6,14 6,10" stroke="#00c9b8" strokeWidth="1" fill="rgba(0,201,184,.15)"/>
          </svg>
        </div>
        <div>
          <div style={{ color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: .5 }}>United Group</div>
          <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 9.5, letterSpacing: 1 }}>HR COMMAND</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 0' }}>
        {NAV.map((item, i) => {
          if ('section' in item) {
            return (
              <div key={i} style={{
                padding: '14px 15px 4px',
                fontSize: 8.5, fontWeight: 700, color: 'rgba(255,255,255,.25)',
                letterSpacing: '0.12em',
              }}>
                {item.section}
              </div>
            )
          }
          if (!canAccess(item.href!)) return null
          const active = pathname.startsWith(item.href!)
          return (
            <Link key={item.href} href={item.href!} style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '9px 15px', textDecoration: 'none',
              color: active ? '#fff' : 'rgba(255,255,255,.55)',
              background: active ? 'rgba(255,255,255,.1)' : 'transparent',
              borderLeft: active ? '3px solid #00c9b8' : '3px solid transparent',
              fontSize: 12.5, fontWeight: active ? 600 : 400,
              transition: 'all .14s',
            }}>
              <span style={{ fontSize: 14, width: 18, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{
        padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,.07)',
        display: 'flex', alignItems: 'center', gap: 9,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
          background: 'rgba(0,201,184,.2)', border: '1.5px solid rgba(0,201,184,.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, color: '#00c9b8',
        }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.name || user?.email}
          </div>
          <div style={{ fontSize: 9.5, color: ROLE_COLORS[role] || '#8fa3be' }}>{role}</div>
        </div>
        <button onClick={logout} title="Sign out" style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,.3)',
          cursor: 'pointer', fontSize: 14, padding: 2,
        }}>⏻</button>
      </div>

      {/* Footer */}
      <div style={{ padding: '8px 14px 12px', borderTop: '1px solid rgba(255,255,255,.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#00c9b8', fontWeight: 600 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%', background: '#00c9b8',
            animation: 'pulse 2s infinite',
          }} />
          Live System
        </div>
      </div>
    </aside>
  )
}
