import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import SpringButton from '../components/SpringButton.jsx'

const PHASES = ['draft', 'submissions', 'voting', 'results']

export default function Admin() {
  const [authed, setAuthed] = useState(sessionStorage.getItem('turbina_admin') === '1')
  const [pw, setPw] = useState('')
  const [contests, setContests] = useState([])
  const [title, setTitle] = useState('')
  const [cats, setCats] = useState('Setup más lindo, Setup más caótico')
  const [err, setErr] = useState('')

  const load = async () => {
    const { data } = await supabase.from('contests')
      .select('*, categories(*), entries(count), votes(count)')
      .order('created_at', { ascending: false })
    setContests(data ?? [])
  }
  useEffect(() => { if (authed) load() }, [authed])

  const login = () => {
    if (pw === import.meta.env.VITE_ADMIN_PASSWORD) {
      sessionStorage.setItem('turbina_admin', '1'); setAuthed(true)
    } else setErr('Password incorrecta.')
  }

  const create = async () => {
    if (!title.trim()) return
    setErr('')
    const { data, error } = await supabase.from('contests').insert({ title: title.trim() }).select()
    if (error) { setErr(error.message); return }
    const names = cats.split(',').map(s => s.trim()).filter(Boolean)
    if (names.length) {
      await supabase.from('categories').insert(names.map(n => ({ contest_id: data[0].id, name: n })))
    }
    setTitle(''); load()
  }

  const setPhase = async (id, phase) => {
    await supabase.from('contests').update({ phase }).eq('id', id)
    load()
  }

  const remove = async (id) => {
    if (!confirm('¿Borrar este concurso y todo lo suyo?')) return
    await supabase.from('contests').delete().eq('id', id)
    load()
  }

  if (!authed) return (
    <div className="page" style={{ maxWidth: 420 }}>
      <p className="kicker">ZONA RESTRINGIDA</p>
      <h1 className="display">Admin</h1>
      <div className="panel">
        <input type="password" placeholder="Password" value={pw}
          onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} />
        <div style={{ marginTop: 16 }}>
          <SpringButton className="btn primary" onClick={login}>ENTRAR</SpringButton>
        </div>
        {err && <p className="msg error">{err}</p>}
      </div>
    </div>
  )

  return (
    <div className="page">
      <p className="kicker">PANEL DE CONTROL</p>
      <h1 className="display">Admin</h1>

      <div className="panel">
        <p style={{ fontSize: 13, letterSpacing: 1, marginBottom: 12, color: 'var(--ink-dim)' }}>NUEVO CONCURSO</p>
        <input type="text" placeholder="Título (ej: Concurso de Setups · Ronda 1)"
          value={title} onChange={e => setTitle(e.target.value)} />
        <div style={{ marginTop: 10 }}>
          <input type="text" placeholder="Categorías separadas por coma"
            value={cats} onChange={e => setCats(e.target.value)} />
        </div>
        <div style={{ marginTop: 16 }}>
          <SpringButton className="btn primary" onClick={create} disabled={!title.trim()}>CREAR</SpringButton>
        </div>
        {err && <p className="msg error">{err}</p>}
      </div>

      {contests.map(c => (
        <div className="panel" key={c.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600 }}>{c.title}</p>
              <p className="msg" style={{ marginTop: 4 }}>
                {c.categories?.map(x => x.name).join(' · ') || 'sin categorías'} ·{' '}
                {c.entries?.[0]?.count ?? 0} entradas · {c.votes?.[0]?.count ?? 0} votos
              </p>
            </div>
            <SpringButton className="btn" onClick={() => remove(c.id)} style={{ borderColor: 'rgba(240,149,149,0.4)', color: '#F09595' }}>
              BORRAR
            </SpringButton>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            {PHASES.map(p => (
              <SpringButton key={p}
                className={'btn' + (c.phase === p ? ' primary' : '')}
                sound={p === 'results' ? 'bloom' : 'thock'}
                onClick={() => setPhase(c.id, p)}>
                {p.toUpperCase()}
              </SpringButton>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
