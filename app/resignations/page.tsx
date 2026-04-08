'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { GAS } from '@/lib/gas'

interface Resignation {
  EMP_ID: string; FULL_NAME: string; DESIGNATION: string
  DATE_OF_JOIN: string; DELETED_DATE: string; REASON: string
  GROUP: string; ENTITY: string
}

function yos(join: string, exit: string) {
  if (!join || !exit) return '—'
  const parse = (s: string) => {
    const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
    if (m) return new Date(+m[3], +m[2]-1, +m[1])
    return new Date(s)
  }
  const j = parse(join), e = parse(exit)
  if (isNaN(j.getTime()) || isNaN(e.getTime()) || e < j) return '—'
  let years = e.getFullYear() - j.getFullYear()
  let months = e.getMonth() - j.getMonth()
  if (months < 0) { years--; months += 12 }
  if (years < 0) return '—'
  if (years === 0 && months === 0) return '< 1 mo'
  if (years === 0) return `${months} mo`
  if (months === 0) return `${years} yr${years !== 1 ? 's' : ''}`
  return `${years} yr ${months} mo`
}

export default function ResignationsPage() {
  const [data, setData] = useState<Resignation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [orgFilter, setOrgFilter] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const r: any = await GAS.getResignations()
      setData(r?.data || [])
    } catch { } finally { setLoading(false) }
  }

  const filtered = data.filter(r => {
    const q = search.toLowerCase()
    const matchQ = !q || (r.FULL_NAME||'').toLowerCase().includes(q) || (r.EMP_ID||'').includes(q)
    const matchO = !orgFilter || (r.GROUP||r.ENTITY||'') === orgFilter
    return matchQ && matchO
  })

  return (
    <AppLayout>
      <div style={{
        background:'#fff', borderBottom:'1px solid var(--border)',
        padding:'0 22px', height:56, display:'flex', alignItems:'center',
        justifyContent:'space-between', position:'sticky', top:0, zIndex:100,
        boxShadow:'0 1px 4px rgba(18,36,80,.06)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:17, fontWeight:700, color:'var(--navy)' }}>Recent Resignations</span>
          <span style={{ background:'rgba(200,48,48,.1)', color:'var(--red)', borderRadius:12, padding:'2px 9px', fontSize:11, fontWeight:700 }}>
            {data.length} records
          </span>
        </div>
        <button onClick={loadData} style={{
          background:'var(--bg)', border:'1px solid var(--border)', borderRadius:7,
          padding:'6px 13px', fontSize:12, color:'var(--muted)', cursor:'pointer', fontWeight:600,
        }}>↻ Refresh</button>
      </div>

      <div style={{ padding:'18px 22px' }}>
        <div style={{
          background:'#fff', border:'1px solid var(--border)', borderRadius:10,
          padding:'10px 14px', marginBottom:14, display:'flex', gap:10, alignItems:'center',
          boxShadow:'0 1px 4px rgba(18,36,80,.06)',
        }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name or ID..."
            style={{
              flex:1, maxWidth:280, background:'var(--bg)', border:'1px solid var(--border)',
              borderRadius:7, padding:'7px 11px', fontSize:12, color:'var(--text)',
              outline:'none', fontFamily:"'DM Sans',sans-serif",
            }}
          />
          <select value={orgFilter} onChange={e => setOrgFilter(e.target.value)} style={{
            background:'var(--bg)', border:'1px solid var(--border)', borderRadius:7,
            padding:'7px 10px', fontSize:12, color:'var(--text)', outline:'none',
          }}>
            <option value="">All Companies</option>
            {['USG','UG','UST','USG-M'].map(o => <option key={o}>{o}</option>)}
          </select>
          <span style={{ fontSize:11, color:'var(--muted)', marginLeft:'auto' }}>{filtered.length} results</span>
        </div>

        <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:10, overflow:'hidden', boxShadow:'0 1px 4px rgba(18,36,80,.06)' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#f4f6fb' }}>
                  {['#','ID','Name','Designation','Joined','Last Working Day','Service','Company','Reason'].map(h => (
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
                  <tr><td colSpan={9} style={{ textAlign:'center', padding:40, color:'var(--muted)' }}>Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign:'center', padding:40, color:'var(--muted)' }}>No records found</td></tr>
                ) : filtered.map((r, i) => (
                  <tr key={r.EMP_ID + i} style={{ borderBottom:'1px solid var(--border)' }}
                    onMouseEnter={e => (e.currentTarget.style.background='rgba(200,48,48,.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background='')}>
                    <td style={{ padding:'8px 11px', fontSize:10.5, color:'var(--muted)' }}>{i+1}</td>
                    <td style={{ padding:'8px 11px', fontSize:11.5, fontFamily:"'JetBrains Mono',monospace", fontWeight:600, color:'var(--navy)' }}>{r.EMP_ID}</td>
                    <td style={{ padding:'8px 11px', fontSize:12.5, fontWeight:600 }}>{r.FULL_NAME}</td>
                    <td style={{ padding:'8px 11px', fontSize:11.5, color:'var(--muted)' }}>{r.DESIGNATION || '—'}</td>
                    <td style={{ padding:'8px 11px', fontSize:11.5 }}>{r.DATE_OF_JOIN || '—'}</td>
                    <td style={{ padding:'8px 11px', fontSize:11.5, fontWeight:600, color:'var(--red)' }}>{r.DELETED_DATE || '—'}</td>
                    <td style={{ padding:'8px 11px', fontSize:11.5, color:'var(--teal)', fontWeight:600 }}>{yos(r.DATE_OF_JOIN, r.DELETED_DATE)}</td>
                    <td style={{ padding:'8px 11px' }}>
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:4, background:'rgba(30,71,153,.08)', color:'var(--navy)' }}>
                        {r.GROUP || r.ENTITY || '—'}
                      </span>
                    </td>
                    <td style={{ padding:'8px 11px', fontSize:11.5, color:'var(--muted)', maxWidth:180 }}>{r.REASON || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
