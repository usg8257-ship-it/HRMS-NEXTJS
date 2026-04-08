'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { GAS } from '@/lib/gas'

const FLAGS: Record<string,string> = {
  INDIA:'🇮🇳',PAKISTAN:'🇵🇰',PHILIPPINES:'🇵🇭',NEPAL:'🇳🇵',
  BANGLADESH:'🇧🇩',EGYPT:'🇪🇬',KENYA:'🇰🇪','SRI LANKA':'🇱🇰',
  UGANDA:'🇺🇬',NIGERIA:'🇳🇬',INDONESIA:'🇮🇩',MYANMAR:'🇲🇲',
}

function KPICard({ label, value, sub, color, delay=0 }: {
  label:string; value:string|number; sub?:string; color:string; delay?:number
}) {
  return (
    <div className="apple-card fade-up" style={{
      padding:'20px 22px', animationDelay:`${delay}ms`,
      borderTop:`3px solid ${color}`,
    }}>
      <div style={{ fontSize:28, fontWeight:700, color:'var(--text)', letterSpacing:-.5, lineHeight:1, marginBottom:5, fontVariantNumeric:'tabular-nums' }}>
        {typeof value==='number' ? value.toLocaleString() : value}
      </div>
      <div style={{ fontSize:13, color:'var(--text2)', marginBottom:sub?4:0 }}>{label}</div>
      {sub && <div style={{ fontSize:12, color, fontWeight:500 }}>{sub}</div>}
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [synced, setSynced] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const r: any = await GAS.loadAll()
      const master     = r?.master?.data     || []
      const deletions  = r?.deletions?.data  || []
      const onboarding = r?.onboarding?.data || []

      const delIds = new Set(deletions.map((d:any)=>d.EMP_ID))
      const active = master.filter((e:any)=>e.STATUS!=='DELETED'&&!delIds.has(e.ID))

      const locs:Record<string,number>={}, ents:Record<string,number>={}, nats:Record<string,number>={}
      const lics:Record<string,number>={PSBD:0,SIRA:0,NIL:0}

      active.forEach((e:any)=>{
        const loc=e.STATUS||'OTHER'; locs[loc]=(locs[loc]||0)+1
        const ent=e.ENTITY||'USG';   ents[ent]=(ents[ent]||0)+1
        const nat=(e.NATIONALITY||'').toUpperCase(); if(nat) nats[nat]=(nats[nat]||0)+1
        const lic=e['LIC AUTH']||'NIL'; lics[lic]=(lics[lic]||0)+1
      })

      const year = new Date().getFullYear().toString()
      const newJoins = active.filter((e:any)=>String(e['DATE OF JOIN']||'').includes(year)).length

      setStats({
        total:master.length, active:active.length, ex:deletions.length,
        pending:onboarding.filter((o:any)=>o.STATUS==='Pending').length,
        transferred:onboarding.filter((o:any)=>o.STATUS==='Transferred').length,
        newJoins, locs, ents, nats, lics,
      })
      setSynced(new Date().toLocaleTimeString('en-AE',{hour12:false}))
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  const topNats = stats ? Object.entries(stats.nats as Record<string,number>)
    .sort((a:any,b:any)=>b[1]-a[1]).slice(0,8) : []

  const RefreshBtn = (
    <button onClick={loadData} className="btn-apple btn-secondary btn-sm" disabled={loading}>
      {loading ? <><span className="spinner" style={{width:13,height:13,borderWidth:1.5}}/> Syncing</> : '↻ Refresh'}
    </button>
  )

  const SyncBadge = synced && (
    <div style={{
      display:'flex', alignItems:'center', gap:6,
      fontSize:12, color:'var(--text3)',
      background:'rgba(0,0,0,.04)', borderRadius:980,
      padding:'5px 12px',
    }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--apple-green)', display:'inline-block' }} />
      Synced {synced}
    </div>
  )

  return (
    <AppLayout
      title="Dashboard"
      subtitle="United Group Holding — Live HR Overview"
      actions={<>{SyncBadge}{RefreshBtn}</>}
    >
      {loading && !stats ? (
        <div className="stagger" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
          {Array.from({length:8}).map((_,i)=>(
            <div key={i} className="skeleton fade-up" style={{height:100}} />
          ))}
        </div>
      ) : stats ? (
        <>
          {/* KPI Row */}
          <div className="stagger" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
            <KPICard label="Active Employees"    value={stats.active}    color="var(--apple-blue)"   sub="Master − Deletions"   delay={0}/>
            <KPICard label="Total in Master"     value={stats.total}     color="var(--apple-indigo)" sub="All time"             delay={60}/>
            <KPICard label="Ex-Employees"        value={stats.ex}        color="var(--apple-red)"    sub="Resigned / terminated" delay={120}/>
            <KPICard label="Onboarding Pending"  value={stats.pending}   color="var(--apple-orange)" sub="Awaiting transfer"    delay={180}/>
          </div>

          {/* Second row */}
          <div className="stagger" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
            <KPICard label="New Joins This Year" value={stats.newJoins}      color="var(--apple-green)"  delay={0}/>
            <KPICard label="Transferred"         value={stats.transferred}   color="var(--apple-teal)"   delay={60}/>
            <KPICard label="PSBD Licensed"       value={stats.lics.PSBD||0}  color="var(--apple-blue)"   delay={120}/>
            <KPICard label="SIRA Licensed"       value={stats.lics.SIRA||0}  color="var(--apple-indigo)" delay={180}/>
          </div>

          {/* Charts Row */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>

            {/* By Company */}
            <div className="apple-card fade-up" style={{ padding:'20px 22px', animationDelay:'240ms' }}>
              <div style={{ fontSize:14, fontWeight:600, color:'var(--text)', marginBottom:16, letterSpacing:-.2 }}>
                By Company
              </div>
              {Object.entries(stats.ents as Record<string,number>).sort((a:any,b:any)=>b[1]-a[1]).map(([ent,cnt]:any)=>{
                const pct = stats.active>0 ? Math.round((cnt/stats.active)*100) : 0
                return (
                  <div key={ent} style={{ marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                      <span style={{ fontSize:13, fontWeight:500, color:'var(--text)' }}>{ent}</span>
                      <span style={{ fontSize:12, color:'var(--text3)', fontVariantNumeric:'tabular-nums' }}>{cnt.toLocaleString()} · {pct}%</span>
                    </div>
                    <div style={{ height:4, background:'var(--apple-gray2)', borderRadius:2, overflow:'hidden' }}>
                      <div style={{
                        height:'100%', width:`${pct}%`, borderRadius:2,
                        background:'var(--apple-blue)',
                        transition:'width .6s cubic-bezier(.16,1,.3,1)',
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* By Location */}
            <div className="apple-card fade-up" style={{ padding:'20px 22px', animationDelay:'300ms' }}>
              <div style={{ fontSize:14, fontWeight:600, color:'var(--text)', marginBottom:16, letterSpacing:-.2 }}>
                By Location
              </div>
              {Object.entries(stats.locs as Record<string,number>).sort((a:any,b:any)=>b[1]-a[1]).map(([loc,cnt]:any)=>(
                <div key={loc} style={{
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'9px 0', borderBottom:'1px solid rgba(0,0,0,.04)',
                }}>
                  <span style={{ fontSize:13.5, color:'var(--text2)' }}>{loc}</span>
                  <span style={{ fontSize:15, fontWeight:600, color:'var(--text)', fontVariantNumeric:'tabular-nums' }}>{cnt.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Top Nationalities */}
            <div className="apple-card fade-up" style={{ padding:'20px 22px', animationDelay:'360ms' }}>
              <div style={{ fontSize:14, fontWeight:600, color:'var(--text)', marginBottom:16, letterSpacing:-.2 }}>
                Top Nationalities
              </div>
              {topNats.map(([nat,cnt]:any)=>(
                <div key={nat} style={{
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'7px 0', borderBottom:'1px solid rgba(0,0,0,.04)',
                }}>
                  <span style={{ fontSize:13.5, color:'var(--text2)' }}>
                    {FLAGS[nat]||'🌍'} {nat}
                  </span>
                  <span style={{ fontSize:14, fontWeight:600, color:'var(--text)', fontVariantNumeric:'tabular-nums' }}>{cnt.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </AppLayout>
  )
}
