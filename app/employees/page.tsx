'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { GAS } from '@/lib/gas'

interface Employee {
  ID: string; NAME: string; DESIGNATION: string
  'DATE OF JOIN': string; ENTITY: string; 'LIC AUTH': string
  'PASSPORT NO': string; 'EID NO': string; STATUS: string
  NATIONALITY: string; 'BIRTH DATE': string; AGE: string
}

const LIC_STYLE: Record<string, { bg: string; color: string }> = {
  PSBD:  { bg:'rgba(30,71,153,.1)',   color:'#1e4799' },
  SIRA:  { bg:'rgba(0,122,138,.1)',   color:'#007a8a' },
  NIL:   { bg:'rgba(82,98,120,.07)',  color:'#526278' },
  OTHER: { bg:'rgba(78,66,184,.08)', color:'#4e42b8' },
}

export default function EmployeesPage() {
  const [all, setAll] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [entFilter, setEntFilter] = useState('')
  const [licFilter, setLicFilter] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 50

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const r: any = await GAS.loadAll()
      const master    = r?.master?.data    || []
      const deletions = r?.deletions?.data || []
      const delIds = new Set(deletions.map((d: any) => d.EMP_ID))
      const active = master.filter((e: any) => e.STATUS !== 'DELETED' && !delIds.has(e.ID))
      setAll(active)
      setPage(1)
    } catch { } finally { setLoading(false) }
  }

  const filtered = all.filter(e => {
    const q = search.toLowerCase()
    const matchQ = !q || (e.NAME||'').toLowerCase().includes(q) || (e.ID||'').toLowerCase().includes(q) || (e['PASSPORT NO']||'').toLowerCase().includes(q)
    const matchE = !entFilter || e.ENTITY === entFilter
    const matchL = !licFilter || e['LIC AUTH'] === licFilter
    return matchQ && matchE && matchL
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageData   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <AppLayout>
      <div style={{
        background:'#fff', borderBottom:'1px solid var(--border)',
        padding:'0 22px', height:56, display:'flex', alignItems:'center',
        justifyContent:'space-between', position:'sticky', top:0, zIndex:100,
        boxShadow:'0 1px 4px rgba(18,36,80,.06)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:17, fontWeight:700, color:'var(--navy)' }}>Active Manpower</span>
          <span style={{
            background:'rgba(0,122,138,.1)', color:'var(--teal)',
            borderRadius:12, padding:'2px 9px', fontSize:11, fontWeight:700,
          }}>{all.length.toLocaleString()} active</span>
        </div>
        <button onClick={loadData} style={{
          background:'var(--bg)', border:'1px solid var(--border)', borderRadius:7,
          padding:'6px 13px', fontSize:12, color:'var(--muted)', cursor:'pointer', fontWeight:600,
        }}>↻ Refresh</button>
      </div>

      <div style={{ padding:'18px 22px' }}>
        {/* Filters */}
        <div style={{
          background:'#fff', border:'1px solid var(--border)', borderRadius:10,
          padding:'10px 14px', marginBottom:14, display:'flex', gap:10, alignItems:'center',
          boxShadow:'0 1px 4px rgba(18,36,80,.06)', flexWrap:'wrap',
        }}>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search name, ID, passport..."
            style={{
              flex:1, minWidth:180, background:'var(--bg)', border:'1px solid var(--border)',
              borderRadius:7, padding:'7px 11px', fontSize:12, color:'var(--text)',
              outline:'none', fontFamily:"'DM Sans',sans-serif",
            }}
          />
          {[
            { label:'Company', value:entFilter, options:['USG','UG','UST','USG-M'], setter:(v:string)=>{ setEntFilter(v); setPage(1) } },
            { label:'License', value:licFilter, options:['PSBD','SIRA','NIL','OTHER'], setter:(v:string)=>{ setLicFilter(v); setPage(1) } },
          ].map(f => (
            <select key={f.label} value={f.value} onChange={e => f.setter(e.target.value)} style={{
              background:'var(--bg)', border:'1px solid var(--border)', borderRadius:7,
              padding:'7px 10px', fontSize:12, color:'var(--text)', outline:'none',
            }}>
              <option value="">All {f.label}</option>
              {f.options.map(o => <option key={o}>{o}</option>)}
            </select>
          ))}
          <span style={{ fontSize:11, color:'var(--muted)', marginLeft:'auto' }}>
            {filtered.length.toLocaleString()} results
          </span>
        </div>

        {/* Table */}
        <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:10, overflow:'hidden', boxShadow:'0 1px 4px rgba(18,36,80,.06)' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#f4f6fb' }}>
                  {['#','Emp ID','Name','Designation','Date of Join','Company','License','Location','EID No'].map(h => (
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
                ) : pageData.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign:'center', padding:40, color:'var(--muted)' }}>No records found</td></tr>
                ) : pageData.map((e, i) => {
                  const ls = LIC_STYLE[e['LIC AUTH']] || LIC_STYLE.NIL
                  return (
                    <tr key={e.ID} style={{ borderBottom:'1px solid var(--border)' }}
                      onMouseEnter={ev => (ev.currentTarget.style.background='rgba(0,122,138,.03)')}
                      onMouseLeave={ev => (ev.currentTarget.style.background='')}>
                      <td style={{ padding:'8px 11px', fontSize:10.5, color:'var(--muted)' }}>{(page-1)*PAGE_SIZE+i+1}</td>
                      <td style={{ padding:'8px 11px', fontSize:11.5, fontFamily:"'JetBrains Mono',monospace", fontWeight:600, color:'var(--navy)' }}>{e.ID}</td>
                      <td style={{ padding:'8px 11px', fontSize:12.5, fontWeight:600 }}>{e.NAME}</td>
                      <td style={{ padding:'8px 11px', fontSize:11.5, color:'var(--muted)' }}>{e.DESIGNATION || '—'}</td>
                      <td style={{ padding:'8px 11px', fontSize:11.5 }}>{e['DATE OF JOIN'] || '—'}</td>
                      <td style={{ padding:'8px 11px' }}>
                        <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:4, background:'rgba(30,71,153,.08)', color:'var(--navy)' }}>{e.ENTITY || '—'}</span>
                      </td>
                      <td style={{ padding:'8px 11px' }}>
                        <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:4, ...ls }}>{e['LIC AUTH'] || 'NIL'}</span>
                      </td>
                      <td style={{ padding:'8px 11px', fontSize:11.5, color:'var(--muted)' }}>{e.STATUS || '—'}</td>
                      <td style={{ padding:'8px 11px', fontSize:11, fontFamily:"'JetBrains Mono',monospace", color:'var(--teal)' }}>{e['EID NO'] || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display:'flex', justifyContent:'center', alignItems:'center', gap:5,
              padding:12, background:'#f4f6fb', borderTop:'1px solid var(--border)',
            }}>
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} style={{
                background:'#fff', border:'1px solid var(--border)', borderRadius:5,
                minWidth:28, height:28, cursor:'pointer', fontSize:12, color:'var(--muted)',
                opacity: page===1 ? .3 : 1,
              }}>‹</button>
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                let p = i + 1
                if (totalPages > 7) {
                  if (page <= 4) p = i + 1
                  else if (page >= totalPages - 3) p = totalPages - 6 + i
                  else p = page - 3 + i
                }
                return (
                  <button key={p} onClick={() => setPage(p)} style={{
                    background: p===page ? 'var(--navy)' : '#fff',
                    color: p===page ? '#fff' : 'var(--muted)',
                    border:'1px solid var(--border)', borderRadius:5,
                    minWidth:28, height:28, cursor:'pointer', fontSize:12,
                  }}>{p}</button>
                )
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} style={{
                background:'#fff', border:'1px solid var(--border)', borderRadius:5,
                minWidth:28, height:28, cursor:'pointer', fontSize:12, color:'var(--muted)',
                opacity: page===totalPages ? .3 : 1,
              }}>›</button>
              <span style={{ fontSize:11, color:'var(--muted)', marginLeft:6 }}>
                {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)} / {filtered.length.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
