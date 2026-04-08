'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { GAS } from '@/lib/gas'
import { useAuth } from '@/lib/auth'

interface Candidate {
  OB_ID: string
  FULL_NAME: string
  PASSPORT_NO: string
  POSITION_TYPE: string
  MOBILE: string
  VISA_STATUS: string
  EXP_JOIN_DATE: string
  DATE_ADDED: string
  STATUS: string
  NOTES: string
  ASSIGNED_TO: string
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Pending:     { bg: 'rgba(184,112,0,.1)',   color: '#b87000' },
  Transferred: { bg: 'rgba(0,122,138,.1)',   color: '#007a8a' },
  Cancelled:   { bg: 'rgba(82,98,120,.08)',  color: '#526278' },
}

export default function OnboardingPage() {
  const { user } = useAuth()
  const [data, setData] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    FULL_NAME: '', PASSPORT_NO: '', MOBILE: '',
    VISA_STATUS: 'Inside UAE', POSITION_TYPE: 'PSBD',
    EXP_JOIN_DATE: '', NOTES: '',
  })

  const isReadOnly = user?.role === 'STAFF' || user?.role === 'EMPLOYEE'

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const r: any = await GAS.loadAll()
      setData(r?.onboarding?.data || [])
    } catch { } finally { setLoading(false) }
  }

  async function handleSave() {
    if (!form.FULL_NAME || !form.PASSPORT_NO) return alert('Name and Passport required')
    setSaving(true)
    try {
      const obId = 'OB-' + Date.now().toString().slice(-8)
      const payload = {
        ...form,
        OB_ID: obId,
        DATE_ADDED: new Date().toLocaleDateString('en-GB'),
        STATUS: 'Pending',
        ASSIGNED_TO: user?.name || user?.email || '',
        FULL_NAME: form.FULL_NAME.toUpperCase(),
        PASSPORT_NO: form.PASSPORT_NO.toUpperCase(),
      }
      const r: any = await GAS.addOnboarding(payload)
      if (r?.success) {
        setData(prev => [payload as any, ...prev])
        setShowModal(false)
        setForm({ FULL_NAME:'', PASSPORT_NO:'', MOBILE:'', VISA_STATUS:'Inside UAE', POSITION_TYPE:'PSBD', EXP_JOIN_DATE:'', NOTES:'' })
      } else alert(r?.error || 'Save failed')
    } catch (e: any) { alert(e.message) }
    setSaving(false)
  }

  const filtered = data.filter(c => {
    const q = search.toLowerCase()
    const matchQ = !q || (c.FULL_NAME||'').toLowerCase().includes(q) || (c.PASSPORT_NO||'').toLowerCase().includes(q)
    const matchS = !statusFilter || c.STATUS === statusFilter
    return matchQ && matchS
  })

  const pending = data.filter(c => c.STATUS === 'Pending').length

  return (
    <AppLayout>
      {/* Topbar */}
      <div style={{
        background:'#fff', borderBottom:'1px solid var(--border)',
        padding:'0 22px', height:56, display:'flex', alignItems:'center',
        justifyContent:'space-between', position:'sticky', top:0, zIndex:100,
        boxShadow:'0 1px 4px rgba(18,36,80,.06)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:17, fontWeight:700, color:'var(--navy)' }}>Onboarding Pipeline</span>
          <span style={{
            background:'rgba(184,112,0,.1)', color:'#b87000',
            borderRadius:12, padding:'2px 9px', fontSize:11, fontWeight:700,
          }}>{pending} pending</span>
        </div>
        {!isReadOnly && (
          <button onClick={() => setShowModal(true)} style={{
            background:'var(--teal)', color:'#fff', border:'none',
            borderRadius:7, padding:'8px 15px', fontSize:12.5,
            fontWeight:600, cursor:'pointer',
          }}>+ Add Candidate</button>
        )}
      </div>

      <div style={{ padding:'18px 22px' }}>
        {/* Filters */}
        <div style={{
          background:'#fff', border:'1px solid var(--border)', borderRadius:10,
          padding:'10px 14px', marginBottom:14, display:'flex', gap:10, alignItems:'center',
          boxShadow:'0 1px 4px rgba(18,36,80,.06)',
        }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name or passport..."
            style={{
              flex:1, maxWidth:280, background:'var(--bg)', border:'1px solid var(--border)',
              borderRadius:7, padding:'7px 11px', fontSize:12, color:'var(--text)',
              outline:'none', fontFamily:"'DM Sans', sans-serif",
            }}
          />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{
            background:'var(--bg)', border:'1px solid var(--border)', borderRadius:7,
            padding:'7px 10px', fontSize:12, color:'var(--text)', outline:'none',
          }}>
            <option value="">All Status</option>
            <option>Pending</option>
            <option>Transferred</option>
            <option>Cancelled</option>
          </select>
          <button onClick={loadData} style={{
            marginLeft:'auto', background:'var(--bg)', border:'1px solid var(--border)',
            borderRadius:7, padding:'7px 13px', fontSize:12, color:'var(--muted)',
            cursor:'pointer', fontWeight:600,
          }}>↻ Refresh</button>
        </div>

        {/* Table */}
        <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:10, overflow:'hidden', boxShadow:'0 1px 4px rgba(18,36,80,.06)' }}>
          <div style={{ padding:'11px 15px', borderBottom:'1px solid var(--border)', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:12, fontWeight:700, color:'var(--navy)' }}>🔄 Candidates</span>
            <span style={{ fontSize:11, color:'var(--muted)' }}>{filtered.length} records</span>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#f4f6fb' }}>
                  {['OB ID','Full Name','Passport','Type','Mobile','Visa Status','Exp. Join','Added','Status','By'].map(h => (
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
                  <tr><td colSpan={10} style={{ textAlign:'center', padding:40, color:'var(--muted)' }}>Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={10} style={{ textAlign:'center', padding:40, color:'var(--muted)' }}>No candidates found</td></tr>
                ) : filtered.map(c => {
                  const ss = STATUS_STYLE[c.STATUS] || STATUS_STYLE.Cancelled
                  return (
                    <tr key={c.OB_ID} style={{ borderBottom:'1px solid var(--border)' }}
                      onMouseEnter={e => (e.currentTarget.style.background='rgba(0,122,138,.03)')}
                      onMouseLeave={e => (e.currentTarget.style.background='')}>
                      <td style={{ padding:'8px 11px', fontSize:10.5, fontFamily:"'JetBrains Mono',monospace", color:'var(--gold)', fontWeight:600 }}>{c.OB_ID}</td>
                      <td style={{ padding:'8px 11px', fontSize:12.5, fontWeight:600 }}>{c.FULL_NAME}</td>
                      <td style={{ padding:'8px 11px', fontSize:11, fontFamily:"'JetBrains Mono',monospace" }}>{c.PASSPORT_NO}</td>
                      <td style={{ padding:'8px 11px' }}>
                        <span style={{
                          fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:4,
                          background: c.POSITION_TYPE==='PSBD' ? 'rgba(30,71,153,.1)' : 'rgba(0,122,138,.1)',
                          color: c.POSITION_TYPE==='PSBD' ? 'var(--navy)' : 'var(--teal)',
                        }}>{c.POSITION_TYPE}</span>
                      </td>
                      <td style={{ padding:'8px 11px', fontSize:11.5 }}>{c.MOBILE}</td>
                      <td style={{ padding:'8px 11px', fontSize:11, color:'var(--muted)' }}>{c.VISA_STATUS}</td>
                      <td style={{ padding:'8px 11px', fontSize:11 }}>{c.EXP_JOIN_DATE}</td>
                      <td style={{ padding:'8px 11px', fontSize:10.5, color:'var(--muted)' }}>{c.DATE_ADDED}</td>
                      <td style={{ padding:'8px 11px' }}>
                        <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:4, ...ss }}>{c.STATUS}</span>
                      </td>
                      <td style={{ padding:'8px 11px', fontSize:11, color:'var(--muted)' }}>{c.ASSIGNED_TO || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(12,24,60,.5)',
          zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center',
          backdropFilter:'blur(3px)',
        }} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{
            background:'#fff', borderRadius:14, width:520, maxHeight:'90vh',
            overflowY:'auto', boxShadow:'0 20px 60px rgba(12,24,60,.25)',
          }}>
            <div style={{ padding:'16px 20px 13px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:15, fontWeight:700, color:'var(--navy)' }}>Add Candidate</span>
              <button onClick={() => setShowModal(false)} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:'var(--muted)' }}>×</button>
            </div>
            <div style={{ padding:'16px 20px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[
                { label:'Full Name *', key:'FULL_NAME', placeholder:'Legal full name' },
                { label:'Passport No *', key:'PASSPORT_NO', placeholder:'e.g. EA1234567' },
                { label:'Mobile', key:'MOBILE', placeholder:'+971...' },
                { label:'Expected Join Date', key:'EXP_JOIN_DATE', type:'date' },
              ].map(f => (
                <div key={f.key}>
                  <div style={{ fontSize:9.5, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:.05, marginBottom:4 }}>{f.label}</div>
                  <input
                    type={f.type || 'text'}
                    value={(form as any)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{
                      width:'100%', background:'var(--bg)', border:'1px solid var(--border)',
                      borderRadius:7, padding:'8px 10px', fontSize:12.5,
                      color:'var(--text)', outline:'none', fontFamily:"'DM Sans',sans-serif",
                      boxSizing:'border-box',
                    }}
                  />
                </div>
              ))}
              <div>
                <div style={{ fontSize:9.5, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:.05, marginBottom:4 }}>Position Type</div>
                <select value={form.POSITION_TYPE} onChange={e => setForm(prev => ({...prev, POSITION_TYPE: e.target.value}))} style={{
                  width:'100%', background:'var(--bg)', border:'1px solid var(--border)',
                  borderRadius:7, padding:'8px 10px', fontSize:12.5, color:'var(--text)', outline:'none',
                }}>
                  <option>PSBD</option><option>SIRA</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize:9.5, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:.05, marginBottom:4 }}>Visa Status</div>
                <select value={form.VISA_STATUS} onChange={e => setForm(prev => ({...prev, VISA_STATUS: e.target.value}))} style={{
                  width:'100%', background:'var(--bg)', border:'1px solid var(--border)',
                  borderRadius:7, padding:'8px 10px', fontSize:12.5, color:'var(--text)', outline:'none',
                }}>
                  <option>Inside UAE</option><option>Outside UAE</option><option>Visit Visa</option>
                </select>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <div style={{ fontSize:9.5, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:.05, marginBottom:4 }}>Notes</div>
                <textarea value={form.NOTES} onChange={e => setForm(prev => ({...prev, NOTES: e.target.value}))}
                  placeholder="Source, agency, remarks..." rows={2} style={{
                  width:'100%', background:'var(--bg)', border:'1px solid var(--border)',
                  borderRadius:7, padding:'8px 10px', fontSize:12.5,
                  color:'var(--text)', outline:'none', resize:'vertical', fontFamily:"'DM Sans',sans-serif",
                  boxSizing:'border-box',
                }} />
              </div>
            </div>
            <div style={{ padding:'0 20px 16px', display:'flex', gap:8, justifyContent:'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{
                background:'var(--bg)', border:'1px solid var(--border)', borderRadius:7,
                padding:'8px 16px', fontSize:12, cursor:'pointer', color:'var(--muted)',
              }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{
                background:'var(--teal)', color:'#fff', border:'none', borderRadius:7,
                padding:'8px 20px', fontSize:12.5, fontWeight:600, cursor:'pointer',
                opacity: saving ? .6 : 1,
              }}>{saving ? 'Saving...' : 'Save Candidate'}</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
