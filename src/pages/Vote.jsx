import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase, getContest, getName } from '../lib/supabase.js'
import SpringButton from '../components/SpringButton.jsx'

export default function Vote() {
  const nav = useNavigate()
  const { contestId } = useParams()
  const name = getName()
  const [contest, setContest] = useState(null)
  const [entries, setEntries] = useState([])
  const [myVotes, setMyVotes] = useState({})
  const [picks, setPicks] = useState({})
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [zoom, setZoom] = useState(null)

  useEffect(() => {
    if (!name) { nav('/join'); return }
    getContest(contestId).then(async (c) => {
      setContest(c)
      if (!c) return
      const [{ data: es }, { data: vs }] = await Promise.all([
        supabase.from('entries').select('*').eq('contest_id', c.id),
        supabase.from('votes').select('*').eq('contest_id', c.id).eq('voter_name', name)
      ])
      setEntries(es ?? [])
      const mv = {}
      ;(vs ?? []).forEach(v => { mv[v.category_id] = v.entry_id })
      setMyVotes(mv)
    })
  }, [contestId])

  const submitVote = async (categoryId) => {
    const entryId = picks[categoryId]
    if (!entryId || !contest) return
    setBusy(true); setErr('')
    const { error } = await supabase.from('votes').insert({
      contest_id: contest.id, category_id: categoryId, entry_id: entryId, voter_name: name
    })
    if (error) setErr(error.message.includes('duplicate') ? 'Ya votaste en esta categoría.' : error.message)
    else setMyVotes({ ...myVotes, [categoryId]: entryId })
    setBusy(false)
  }

  if (!contest) return <div className="page"><p className="msg">Cargando…</p></div>
  if (contest.phase !== 'voting') return (
    <div className="page" style={{ maxWidth: 460 }}>
      <h1 className="display">Votación no disponible</h1>
      <p className="msg">"{contest.title}" está en fase <span className="phase-pill">{contest.phase}</span>.</p>
      <p className="msg"><Link to="/join" style={{ color: 'var(--ink-dim)' }}>← Ver otros concursos</Link></p>
    </div>
  )

  return (
    <div className="page">
      <p className="kicker">{contest.title.toUpperCase()} · VOTANDO COMO {name.toUpperCase()}</p>
      <h1 className="display">Votación</h1>
      <p className="lead" style={{ marginTop: 10 }}>Un voto por categoría. Considera bien tu elección.</p>

      {contest.categories.map(cat => {
        const voted = myVotes[cat.id]
        return (
          <div className="panel" key={cat.id}>
            <p style={{ fontSize: 15, fontWeight: 600, letterSpacing: 1, marginBottom: 14 }}>
              {cat.name} {voted && <span className="phase-pill" style={{ marginLeft: 8 }}>VOTADO</span>}
            </p>
            <div className="grid">
              {entries.map(e => (
                <div
                  key={e.id}
                  className={'entry-card' + ((voted === e.id || picks[cat.id] === e.id) ? ' selected' : '')}
                  style={voted ? { cursor: 'default', opacity: voted === e.id ? 1 : 0.45 } : {}}
                  onClick={() => { if (!voted) setPicks({ ...picks, [cat.id]: e.id }) }}
                >
                  {e.media_type === 'video'
                    ? <video src={e.media_url} muted loop onPointerEnter={ev => ev.target.play()} onPointerLeave={ev => ev.target.pause()} />
                    : <img src={e.media_url} alt={e.participant_name} onClick={(ev) => { ev.stopPropagation(); setZoom(e) }} />>}
                  <p className="name">{e.participant_name}</p>
                </div>
              ))}
            </div>
            {!voted && (
              <div style={{ marginTop: 16 }}>
                <SpringButton className="btn primary" sound="bloom" disabled={!picks[cat.id] || busy} onClick={() => submitVote(cat.id)}>
                  CONFIRMAR VOTO
                </SpringButton>
              </div>
            )}
          </div>
        )
      })}
      {err && <p className="msg error">{err}</p>}
      <p className="msg"><Link to="/join" style={{ color: 'var(--ink-dim)' }}>← Ver otros concursos</Link></p>
      {zoom && (
  <div onClick={() => setZoom(null)}
    style={{ position: 'fixed', inset: 0, zIndex: 99, display: 'grid', placeItems: 'center', background: 'rgba(5,3,12,0.88)', cursor: 'zoom-out' }}>
    {zoom.media_type === 'video'
      ? <video src={zoom.media_url} controls autoPlay style={{ maxWidth: '92vw', maxHeight: '86vh', borderRadius: 10 }} />
      : <img src={zoom.media_url} alt="" style={{ maxWidth: '92vw', maxHeight: '86vh', borderRadius: 10 }} />}
  </div>
)}
    </div>
  )
}
