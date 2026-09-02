import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, getActiveContests, getName, setName } from '../lib/supabase.js'
import SpringButton from '../components/SpringButton.jsx'

const phaseRoute = { submissions: 'submit', voting: 'vote', results: 'results' }
const phaseLabel = { submissions: 'RECIBIENDO ENTRADAS', voting: 'VOTACIÓN ABIERTA', results: 'RESULTADOS' }

export default function Join() {
  const nav = useNavigate()
  const name = getName()
  const [local, setLocal] = useState(name)
  const [contests, setContests] = useState(undefined)
  const [mine, setMine] = useState({}) // contest_id -> true si ya tiene entrada

  useEffect(() => {
    getActiveContests().then(async (cs) => {
      setContests(cs)
      if (!cs.length || !name) return
      const { data } = await supabase.from('entries')
        .select('contest_id').eq('participant_name', name)
        .in('contest_id', cs.map(c => c.id))
      const m = {}; (data ?? []).forEach(e => { m[e.contest_id] = true })
      setMine(m)
    })
  }, [])

  const enter = (contest) => {
    if (!local.trim()) return
    setName(local)
    nav(`/c/${contest.id}/${phaseRoute[contest.phase]}`)
  }

  return (
    <div className="page" style={{ maxWidth: 560 }}>
      <p className="kicker"></p>
      <h1 className="display">¿Quién  ̶c̶h̶o̶t̶a̶   sos?</h1>

      <div className="panel">
        <input
          type="text"
          placeholder="Nombre/apodo/pseudonimo/lo que quieras"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
        />
      </div>

      <p className="kicker" style={{ marginTop: 34 }}>CONCURSOS ACTIVOS</p>
      {contests === undefined && <p className="msg">Escaneando el sector…</p>}
      {contests?.length === 0 && (
        <p className="msg">No hay concursos activos por el momento. Volvé cuando la admin se ponga las pilas. Ah re que soy yo.</p>
      )}
      {contests?.map(c => (
        <div className="panel" key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 600 }}>
              {c.title} {mine[c.id] && <span className="phase-pill" style={{ marginLeft: 6 }}>YA PARTICIPÁS</span>}
            </p>
            <p className="msg" style={{ marginTop: 4 }}>
              {c.categories?.map(x => x.name).join(' · ') || 'sin categorías'}
            </p>
            <span className="phase-pill" style={{ marginTop: 8, display: 'inline-block' }}>{phaseLabel[c.phase]}</span>
          </div>
          <SpringButton className="btn primary" disabled={!local.trim()} onClick={() => enter(c)}>
            ENTRAR
          </SpringButton>
        </div>
      ))}
      {contests?.length > 0 && !local.trim() && (
        <p className="msg">Poné tu nombre arriba para poder entrar a un concurso.</p>
      )}
    </div>
  )
}
