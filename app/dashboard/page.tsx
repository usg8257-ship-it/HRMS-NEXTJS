'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { GAS } from '@/lib/gas'

interface Stats {
  totalMaster: number
  activeEmp: number
  exEmp: number
  pending: number
  transferred: number
  locations: Record<string, number>
  entities: Record<string, number>
  nationalities: Record<string, number>
  lastSync: string
}

const FLAGS: Record<string, string> = {
  INDIA:'🇮🇳', PAKISTAN:'🇵🇰', PHILIPPINES:'🇵🇭', NEPAL:'🇳🇵',
  BANGLADESH:'🇧🇩', EGYPT:'🇪🇬', KENYA:'🇰🇪', 'SRI LANKA':'🇱🇰',
}

function StatCard({ title, value, sub, color, icon }: {
  title: string; value: number | string; sub?: string; color: string; icon: string
}) {
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border)', borderRadius: 10,
      padding: '16px 18px', boxShadow: '0 1px 4px rgba(18,36,80,.06)',
      borderTop: `3px solid ${color}`, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ fontSize: 22, marginBottom: 10, opacity: .8 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--navy)', lineHeight: 1, fontFamily: "'JetBrains Mono', monospace" }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5 }}>{title}</div>
      {sub && <div style={{ fontSize: 10, color, marginTop: 3, fontWeight: 600 }}>{sub}</div>}
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const r: any = await GAS.loadAll()
      if (!r) { setError('No response from server'); return }

      const master    = r.master?.data     || []
      const deletions = r.deletions?.data  || []
      const onboarding= r.onboarding?.data || []

      // Active = master minus deletions
      const delIds = new Set(deletions.map((d: any) => d.EMP_ID))
      const active = master.filter((e: any) => e.STATUS !== 'DELETED' && !delIds.has(e.ID))

      // Counts
      const locs: Record<string, number> = {}
      const ents: Record<string, number> = {}
      const nats: Record<string, number> = {}
      active.forEach((e: any) => {
        const loc = e.STATUS || 'OTHER'
        locs[loc] = (locs[loc] || 0) + 1
        const ent = e.ENTITY || 'USG'
        ents[ent] = (ents[ent] || 0) + 1
        const nat = (e.NATIONALITY || '').toUpperCase()
        if (nat) nats[nat] = (nats[nat] || 0) + 1
      })

      const pendingOB = onboarding.filter((o: any) => o.STATUS === 'Pending').length
      const transOB   = onboarding.filter((o: any) => o.STATUS === 'Transferred').length

      setStats({
        totalMaster: master.length,
        activeEmp: active.length,
        exEmp: deletions.length,
        pending: pendingOB,
        transferred: transOB,
        locations: locs,
        entities: ents,
        nationalities: nats,
        lastSync: new Date().toLocaleTimeString('en-AE', { hour12: false }),
      })
    } catch (e: any) {
      setError(e.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const topNats = stats
    ? Object.entries(stats.nationalities).sort((a, b) => b[1] - a[1]).slice(0, 6)
    : []

  return (
    <AppLayout>
      {/* Topbar */}
      <div style={{
        background: '#fff', borderBottom: '1px solid var(--border)',
        padding: '0 22px', height: 56, display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 4px rgba(18,36,80,.06)',
      }}>
        <div>
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--navy)' }}>Dashboard</span>
          <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 8 }}>· United Group Holding</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {stats && (
            <span style={{
              fontSize: 10.5, color: 'var(--teal)', background: 'rgba(0,122,138,.08)',
              border: '1px solid rgba(0,122,138,.2)', borderRadius: 16,
              padding: '4px 11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              Synced {stats.lastSync}
            </span>
          )}
          <button onClick={loadData} disabled={loading} style={{
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 7, padding: '6px 13px', fontSize: 12,
            color: 'var(--muted)', cursor: 'pointer', fontWeight: 600,
          }}>
            {loading ? '...' : '↻ Refresh'}
          </button>
        </div>
      </div>

      <div style={{ padding: '20px 22px' }}>
        {error && (
          <div style={{
            background: 'rgba(200,48,48,.07)', border: '1px solid rgba(200,48,48,.2)',
            borderRadius: 8, padding: '12px 16px', color: 'var(--red)',
            fontSize: 13, marginBottom: 16,
          }}>
            ⚠ {error}
          </div>
        )}

        {loading && !stats ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 13 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{
                background: '#fff', border: '1px solid var(--border)', borderRadius: 10,
                height: 110, animation: 'pulse 1.5s ease-in-out infinite',
                opacity: 0.6,
              }} />
            ))}
          </div>
        ) : stats ? (
          <>
            {/* KPI Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 13, marginBottom: 18 }}>
              <StatCard title="Total in Master" value={stats.totalMaster} icon="📋"
                color="var(--navy)" sub="All employees ever joined" />
              <StatCard title="Active Employees" value={stats.activeEmp} icon="👥"
                color="var(--teal)" sub="Master − Deletion Log" />
              <StatCard title="Ex-Employees" value={stats.exEmp} icon="🚫"
                color="var(--red)" sub="Resigned / Terminated" />
              <StatCard title="Onboarding Pending" value={stats.pending} icon="🔄"
                color="var(--gold)" sub="Awaiting transfer" />
            </div>

            {/* Second row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 13, marginBottom: 18 }}>

              {/* Location breakdown */}
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 10, padding: 18, boxShadow: '0 1px 4px rgba(18,36,80,.06)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: .5 }}>
                  📍 By Location
                </div>
                {Object.entries(stats.locations).sort((a, b) => b[1] - a[1]).map(([loc, cnt]) => (
                  <div key={loc} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{loc}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', fontFamily: "'JetBrains Mono', monospace" }}>{cnt.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Entity breakdown */}
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 10, padding: 18, boxShadow: '0 1px 4px rgba(18,36,80,.06)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: .5 }}>
                  🏢 By Company
                </div>
                {Object.entries(stats.entities).sort((a, b) => b[1] - a[1]).map(([ent, cnt]) => {
                  const pct = stats.activeEmp > 0 ? Math.round((cnt / stats.activeEmp) * 100) : 0
                  return (
                    <div key={ent} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{ent}</span>
                        <span style={{ fontSize: 11, color: 'var(--teal)', fontFamily: "'JetBrains Mono', monospace" }}>{cnt} ({pct}%)</span>
                      </div>
                      <div style={{ height: 5, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--teal)', borderRadius: 3 }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Top Nationalities */}
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 10, padding: 18, boxShadow: '0 1px 4px rgba(18,36,80,.06)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: .5 }}>
                  🌍 Top Nationalities
                </div>
                {topNats.map(([nat, cnt]) => (
                  <div key={nat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 12 }}>{FLAGS[nat] || '🌍'} {nat}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', fontFamily: "'JetBrains Mono', monospace" }}>{cnt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Onboarding Summary */}
            <div style={{
              background: '#fff', border: '1px solid var(--border)', borderRadius: 10,
              padding: '16px 20px', boxShadow: '0 1px 4px rgba(18,36,80,.06)',
              display: 'flex', gap: 32, alignItems: 'center',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>🔄 Onboarding Pipeline</div>
              {[
                { label: 'Pending', value: stats.pending, color: 'var(--gold)' },
                { label: 'Transferred', value: stats.transferred, color: 'var(--teal)' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </AppLayout>
  )
}
