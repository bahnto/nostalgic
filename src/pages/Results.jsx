import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase, getContest } from '../lib/supabase.js'

export default function Results() {
  const { contestId } = useParams()
  const [contest, setContest] = useState(null)
  const [winners, setWinners] = useState(null)

  useEffect(() => {
    getContest(contestId).then(async (c) => {
      setContest(c)
      if (!c || c.phase !== 'results') return
      const [{ data: votes }, { data: entries }] = await Promise.all([
        supabase.from('votes').select('*').eq('contest_id', c.id),
        supabase.from('entries').select('*').eq('contest_id', c.id)
      ])
      const result = c.categories.map(cat => {
        const counts = {}
        ;(votes ?? []).filter(v => v.category_id === cat.id).forEach(v => {
          counts[v.entry_id] = (counts[v.entry_id] || 0) + 1
        })
        const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
        const entry = top ? (entries ?? []).find(e => e.id === top[0]) : null
        return { category: cat, entry, count: top ? top[1] : 0 }
      })
      setWinners(result)
    })
  }, [contestId])

  if (!contest) return <div className="page"><p className="msg">Cargando…</p></div>
  if (contest.phase !== 'results') return (
    <div className="page" style={{ maxWidth: 460 }}>
      <h1 className="display">Todavía no</h1>
      <p className="msg">Los resultados de "{contest.title}" se liberan cuando la admin lo decida. Fase actual: <span className="phase-pill">{contest.phase}</span></p>
      <p className="msg"><Link to="/join" style={{ color: 'var(--ink-dim)' }}>← Ver otros concursos</Link></p>
    </div>
  )

  return (
    <div className="page">
      <p className="kicker">{contest.title.toUpperCase()}</p>
      <h1 className="display">Resultados</h1>
      {winners && winners.map(({ category, entry, count }) => (
        <div className="panel" key={category.id} style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          {entry && (
            <div className="entry-card" style={{ width: 180, cursor: 'default' }}>
              {entry.media_type === 'video'
                ? <video src={entry.media_url} controls />
                : <img src={entry.media_url} alt={entry.participant_name} />}
            </div>
          )}
          <div>
            <p style={{ fontSize: 12, letterSpacing: 2, color: 'var(--ink-dim)' }}>{category.name.toUpperCase()}</p>
            <p className="winner-glow" style={{ fontSize: 22, fontWeight: 700, margin: '6px 0' }}>
              {entry ? entry.participant_name : 'Sin votos'}
            </p>
            {entry && <p className="msg" style={{ marginTop: 0 }}>{count} {count === 1 ? 'voto' : 'votos'} · Otra coronación de gloria para vos.</p>}
          </div>
        </div>
      ))}
      <p className="msg"><Link to="/join" style={{ color: 'var(--ink-dim)' }}>← Ver otros concursos</Link></p>
    </div>
  )
}
