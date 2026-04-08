'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { GAS } from '@/lib/gas'

const STEPS: Record<string, { label: string; short: string }> = {
  STEP_VISA:      { label: 'Visa/Entry',      short: 'VI' },
  STEP_LABOR:     { label: 'Labor Card',      short: 'LC' },
  STEP_MEDICAL:   { label: 'Medical',         short: 'MD' },
  STEP_INSURANCE: { label: 'Insurance',       short: 'MI' },
  STEP_NSI:       { label: 'NSI Training',    short: 'NS' },
  STEP_EID:       { label: 'EID & Residency', short: 'EI' },
}

const STATUS_CLS: Record<string, { bg: string; color: string; border: string }> = {
  Done:        { bg:'rgba(19,110,66,.12)',  color:'#136e42', border:'rgba(19,110,66,.4)' },
  Fit:         { bg:'rgba(19,110,66,.12)',  color:'#136e42', border:'rgba(19,110,66,.4)' },
  Pending:     { bg:'rgba(184,112,0,.1)',   color:'#b87000', border:'rgba(184,112,0,.4)' },
  Problem:     { bg:'rgba(200,48,48,.08)',  color:'#c83030', border:'rgba(200,48,48,.4)' },
  Unfit:       { bg:'rgba(200,48,48,.08)',  color:'#c83030', border:'rgba(200,48,48,.4)' },
  'Not Started':{ bg:'rgba(82,98,120,.07)', color:'#526278', border:'rgba(82,98,120,.2)' },
}

interface TrackerRecord {
  DS_ID: string; EMP_ID: string; EMP_NAME: string; DESIGNATION: string
  RESPONSIBLE_HR: string; TRANSFER_DATE: string; TOTAL_DAYS_ELAPSED: string
  OB_COMPLETE: string; CANCELLED: string
  STEP_VISA: any; STEP_LABOR: any; STEP_MEDICAL: any
  STEP_INSURANCE: any; STEP_NSI: any; STEP_EID: any
}

function StepPill({ stepKey, data }: { stepKey: string; data: any }) {
  const step = data || { status: 'Pending' }
  const status = step.status || 'Pending'
  const s = STATUS_CLS[status] || STATUS_CLS['Not Started']
  const short = STEPS[stepKey]?.short || '??'
  return (
    <span title={`${STEPS[stepKey]?.label}: ${status}`} style={{
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      width:28, height:28, borderRadius:'50%',
      background: s.bg, color: s.color,
      border: `2px solid ${s.border}`,
      fontSize:9, fontWeight:800, fontFamily:"'JetBrains Mono',monospace",
      cursor:'default', flexShrink:0,
    }}>{short}</span>
  )
}

export default function TrackerPage() {
  const [data, setData] = useState<TrackerRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'active'|'complete'|'delayed'|'cancelled'>('active')
  const [search, setSearch] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const r: any = await GAS.get20DSTracker()
      setData(r?.data || [])
    } catch { } finally { setLoading(false) }
  }

  const filtered = data.filter(r => {
    const days = parseInt(r.TOTAL_DAYS_ELAPSED || '0', 10)
    const q = search.toLowerCase()
    const matchQ = !q || (r.EMP_NAME||'').toLowerCase().includes(q) || (r.EMP_ID||'').includes(q)
    const matchTab =
      tab === 'active'    ? r.CANCELLED !== 'TRUE' && r.OB_COMPLETE !== 'TRUE' && days <= 20 :
      tab === 'complete'  ? r.OB_COMPLETE === 'TRUE' :
      tab === 'delayed'   ? r.CANCELLED !== 'TRUE' && r.OB_COMPLETE !== 'TRUE' && days > 20 :
      tab === 'cancelled' ? r.CANCELLED === 'TRUE' : true
    return matchQ && matchTab
  })

  const counts = {
    active:    data.filter(r => r.CANCELLED !== 'TRUE' && r.OB_COMPLETE !== 'TRUE' && parseInt(r.TOTAL_DAYS_ELAPSED||'0') <= 20).length,
    complete:  data.filter(r => r.OB_COMPLETE === 'TRUE').length,
    delayed:   data.filter(r => r.CANCELLED !== 'TRUE' && r.OB_COMPLETE !== 'TRUE' && parseInt(r.TOTAL_DAYS_ELAPSED||'0') > 20).length,
    cancelled: data.filter(r => r.CANCELLED === 'TRUE').length,
  }

  const TABS = [
    { key:'active',    label:'In Progress', color:'var(--teal)' },
    { key:'delayed',   label:'Over Stage',  color:'var(--red)' },
    { key:'complete',  label:'Completed',   color:'var(--green)' },
    { key:'cancelled', label:'Cancelled',   color:'var(--muted)' },
  ]

  return (
    <AppLayout>
      <div style={{
        background:'#fff', borderBottom:'1px solid var(--border)',
        padding:'0 22px', height:56, display:'flex', alignItems:'center',
        justifyContent:'space-between', position:'sticky', top:0, zIndex:100,
        boxShadow:'0 1px 4px rgba(18,36,80,.06)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:17, fontWeight:700, color:'var(--navy)' }}>Progress Tracker</span>
          {counts.delayed > 0 && (
            <span style={{ background:'rgba(200,48,48,.1)', color:'var(--red)', borderRadius:12, padding:'2px 9px', fontSize:11, fontWeight:700 }}>
              ⚠ {counts.delayed} over-stage
            </span>
          )}
        </div>
        <button onClick={loadData} style={{
          background:'var(--bg)', border:'1px solid var(--border)', borderRadius:7,
          padding:'6px 13px', fontSize:12, color:'var(--muted)', cursor:'pointer', fontWeight:600,
        }}>↻ Refresh</button>
      </div>

      <div style={{ padding:'18px 22px' }}>
        {/* Step legend */}
        <div style={{
          background:'#fff', border:'1px solid var(--border)', borderRadius:10,
          padding:'12px 16px', marginBottom:14, display:'flex', gap:14, flexWrap:'wrap',
          alignItems:'center', boxShadow:'0 1px 4px rgba(18,36,80,.06)',
        }}>
          <span style={{ fontSize:11, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:.05 }}>Steps:</span>
          {Object.entries(STEPS).map(([k, s]) => (
            <span key={k} style={{ fontSize:11, color:'var(--muted)', display:'flex', alignItems:'center', gap:5 }}>
              <span style={{
                display:'inline-flex', alignItems:'center', justifyContent:'center',
                width:22, height:22, borderRadius:'50%', fontSize:8, fontWeight:800,
                background:'rgba(0,122,138,.1)', color:'var(--teal)', border:'2px solid rgba(0,122,138,.3)',
              }}>{s.short}</span>
              {s.label}
            </span>
          ))}
          <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
            {Object.entries(STATUS_CLS).slice(0, 4).map(([status, s]) => (
              <span key={status} style={{
                fontSize:10, padding:'2px 7px', borderRadius:4,
                background:s.bg, color:s.color, border:`1px solid ${s.border}`, fontWeight:700,
              }}>{status}</span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:0, marginBottom:14, background:'#fff', border:'1px solid var(--border)', borderRadius:10, overflow:'hidden' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)} style={{
              flex:1, padding:'10px', border:'none', cursor:'pointer',
              background: tab===t.key ? 'var(--bg)' : '#fff',
              color: tab===t.key ? t.color : 'var(--muted)',
              fontWeight: tab===t.key ? 700 : 400,
              fontSize:12, borderBottom: tab===t.key ? `2px solid ${t.color}` : '2px solid transparent',
              fontFamily:"'DM Sans',sans-serif",
            }}>
              {t.label} <span style={{
                marginLeft:5, background: tab===t.key ? t.color : 'var(--border)',
                color: tab===t.key ? '#fff' : 'var(--muted)',
                borderRadius:10, padding:'1px 7px', fontSize:10, fontWeight:700,
              }}>{counts[t.key as keyof typeof counts]}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginBottom:12 }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search employee name or ID..."
            style={{
              width:280, background:'#fff', border:'1px solid var(--border)',
              borderRadius:7, padding:'7px 11px', fontSize:12, color:'var(--text)',
              outline:'none', fontFamily:"'DM Sans',sans-serif",
            }}
          />
        </div>

        {/* Table */}
        <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:10, overflow:'hidden', boxShadow:'0 1px 4px rgba(18,36,80,.06)' }}>
          <div style={{ padding:'10px 15px', borderBottom:'1px solid var(--border)', background:'var(--bg)', display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontSize:12, fontWeight:700, color:'var(--navy)' }}>📋 Employee Tracker</span>
            <span style={{ fontSize:11, color:'var(--muted)' }}>{filtered.length} records</span>
          </div>
          <div style={{ overflowX:'auto', maxHeight:'65vh', overflowY:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead style={{ position:'sticky', top:0, zIndex:5 }}>
                <tr style={{ background:'#f4f6fb' }}>
                  {['Emp ID','Name','Designation','Hired By','Days','Steps','Progress'].map(h => (
                    <th key={h} style={{
                      padding:'8px 11px', textAlign:'left', fontSize:10, fontWeight:700,
                      color:'var(--muted)', textTransform:'uppercase', letterSpacing:.05,
                      borderBottom:'1px solid var(--border)', whiteSpace:'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ textAlign:'center', padding:40, color:'var(--muted)' }}>Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign:'center', padding:40, color:'var(--muted)' }}>No records found</td></tr>
                ) : filtered.map(r => {
                  const days = parseInt(r.TOTAL_DAYS_ELAPSED || '0', 10)
                  const isOver = days > 20 && r.OB_COMPLETE !== 'TRUE'
                  const stepKeys = Object.keys(STEPS)
                  const done = stepKeys.filter(k => {
                    const s = r[k as keyof TrackerRecord]
                    return typeof s === 'object' && s && (s.status === 'Done' || s.status === 'Fit')
                  }).length
                  const pct = Math.round((done / stepKeys.length) * 100)
                  const daysColor = r.OB_COMPLETE==='TRUE' ? 'var(--green)' : isOver ? 'var(--red)' : days > 10 ? 'var(--gold)' : 'var(--teal)'

                  return (
                    <tr key={r.DS_ID} style={{
                      borderBottom:'1px solid var(--border)',
                      background: isOver ? 'rgba(200,48,48,.02)' : '',
                    }}
                      onMouseEnter={e => !isOver && (e.currentTarget.style.background='rgba(0,122,138,.02)')}
                      onMouseLeave={e => (e.currentTarget.style.background=isOver?'rgba(200,48,48,.02)':'')}>
                      <td style={{ padding:'9px 11px', fontSize:11.5, fontFamily:"'JetBrains Mono',monospace", color:'var(--teal)', fontWeight:600 }}>{r.EMP_ID}</td>
                      <td style={{ padding:'9px 11px', fontSize:12.5, fontWeight:700 }}>{r.EMP_NAME}</td>
                      <td style={{ padding:'9px 11px', fontSize:11.5, color:'var(--muted)' }}>{r.DESIGNATION || '—'}</td>
                      <td style={{ padding:'9px 11px', fontSize:11.5 }}>{r.RESPONSIBLE_HR || '—'}</td>
                      <td style={{ padding:'9px 11px' }}>
                        <span style={{ fontSize:13, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", color:daysColor }}>
                          {r.OB_COMPLETE==='TRUE' ? '✓' : `${days}d`}
                        </span>
                      </td>
                      <td style={{ padding:'9px 11px' }}>
                        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                          {stepKeys.map(k => (
                            <StepPill key={k} stepKey={k} data={r[k as keyof TrackerRecord]} />
                          ))}
                        </div>
                      </td>
                      <td style={{ padding:'9px 11px', minWidth:120 }}>
                        <div style={{ height:5, background:'var(--bg)', borderRadius:3, overflow:'hidden', marginBottom:3 }}>
                          <div style={{
                            height:'100%', width:`${pct}%`, borderRadius:3,
                            background: r.OB_COMPLETE==='TRUE' ? 'var(--green)' : isOver ? 'var(--red)' : 'var(--teal)',
                            transition:'width .4s ease',
                          }} />
                        </div>
                        <span style={{ fontSize:10, color:'var(--muted)', fontFamily:"'JetBrains Mono',monospace" }}>
                          {r.OB_COMPLETE==='TRUE' ? 'Complete ✓' : `${done}/${stepKeys.length} · ${pct}%`}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
