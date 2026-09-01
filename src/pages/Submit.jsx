import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase, getContest, getName } from '../lib/supabase.js'
import SpringButton from '../components/SpringButton.jsx'

export default function Submit() {
  const nav = useNavigate()
  const { contestId } = useParams()
  const name = getName()
  const [contest, setContest] = useState(null)
  const [mine, setMine] = useState(null)
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!name) { nav('/join'); return }
    getContest(contestId).then(async (c) => {
      setContest(c)
      if (!c) return
      const { data } = await supabase.from('entries')
        .select('*').eq('contest_id', c.id).eq('participant_name', name)
      setMine(data?.[0] ?? null)
    })
  }, [contestId])

  const upload = async () => {
    if (!file || !contest) return
    setBusy(true); setErr('')
    try {
      const ext = file.name.split('.').pop()
      const path = `${contest.id}/${name.replace(/\s+/g, '_')}_${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('entries').upload(path, file)
      if (upErr) throw upErr
      const { data: pub } = supabase.storage.from('entries').getPublicUrl(path)
      const mediaType = file.type.startsWith('video') ? 'video' : 'image'
      const { data, error } = await supabase.from('entries').insert({
        contest_id: contest.id,
        participant_name: name,
        media_url: pub.publicUrl,
        media_type: mediaType
      }).select()
      if (error) throw error
      setMine(data[0])
    } catch (e) {
      setErr(e.message?.includes('duplicate') ? 'Ya tenés una entrada en ESTE concurso.' : `No se pudo subir: ${e.message}`)
    } finally { setBusy(false) }
  }

  if (!contest) return <div className="page"><p className="msg">Cargando…</p></div>
  if (contest.phase !== 'submissions') return (
    <div className="page" style={{ maxWidth: 460 }}>
      <h1 className="display">Entradas cerradas</h1>
      <p className="msg">"{contest.title}" está en fase <span className="phase-pill">{contest.phase}</span>.</p>
      <div className="panel" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {contest.phase === 'voting' && <SpringButton onClick={() => nav(`/c/${contest.id}/vote`)}>IR A VOTAR</SpringButton>}
        {contest.phase === 'results' && <SpringButton onClick={() => nav(`/c/${contest.id}/results`)}>VER RESULTADOS</SpringButton>}
        <SpringButton onClick={() => nav('/join')}>OTROS CONCURSOS</SpringButton>
      </div>
    </div>
  )

  return (
    <div className="page" style={{ maxWidth: 520 }}>
      <p className="kicker">{contest.title.toUpperCase()}</p>
      <h1 className="display">Tu entrada</h1>
      <p className="lead" style={{ marginTop: 10 }}>
        Una por persona <em>en este concurso</em>. Compite en:
        {' '}{contest.categories.map(c => c.name).join(' · ')}.
      </p>
      <div className="panel">
        {mine ? (
          <>
            <p className="msg" style={{ marginTop: 0 }}>Tu entrada para "{contest.title}" ya está en órbita, {name}:</p>
            <div className="entry-card" style={{ maxWidth: 320, marginTop: 12, cursor: 'default' }}>
              {mine.media_type === 'video'
                ? <video src={mine.media_url} controls />
                : <img src={mine.media_url} alt="Tu entrada" />}
              <p className="name">{name}</p>
            </div>
          </>
        ) : (
          <>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ color: 'var(--ink-dim)', fontSize: 13 }}
            />
            <div style={{ marginTop: 16 }}>
              <SpringButton className="btn primary" sound="bloom" onClick={upload} disabled={!file || busy}>
                {busy ? 'SUBIENDO…' : 'LANZAR AL ESPACIO'}
              </SpringButton>
            </div>
            {err && <p className="msg error">{err}</p>}
          </>
        )}
      </div>
      <p className="msg"><Link to="/join" style={{ color: 'var(--ink-dim)' }}>← Ver otros concursos activos</Link></p>
    </div>
  )
}
