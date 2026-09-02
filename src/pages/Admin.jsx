import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import SpringButton from '../components/SpringButton.jsx'

const PHASES = ['draft', 'submissions', 'voting', 'results']

// Tema "sala de máquinas": sin nebulosa, fondo sólido con subtono rojizo,
// señalética de peligro en ASCII. Acá no se juega.
const DANGER = '#D98A8A'
const DANGER_DIM = 'rgba(217, 110, 110, 0.4)'
const DANGER_FAINT = 'rgba(217, 110, 110, 0.14)'

const hazardStripe = {
  height: 6,
  background: 'repeating-linear-gradient(45deg, rgba(217,110,110,0.28) 0 10px, transparent 10px 20px)',
  borderRadius: 3,
  margin: '18px 0'
}

const dangerPanel = {
  background: 'rgba(30, 14, 18, 0.75)',
  border: `1px solid ${DANGER_DIM}`,
  borderRadius: 14,
  padding: 22,
  marginTop: 22
}

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

  return (
    <>
      {/* Fondo sólido: acá no hay espacio, hay mantenimiento */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: '#140B10' }} />

      <div className="page" style={{ position: 'relative', zIndex: 1 }}>
        <p className="kicker" style={{ color: DANGER, letterSpacing: 5 }}>
          {⚠︎ ZONA RESTRINGIDA ⚠︎}
        </p>
        <h1 className="display">Admin</h1>
        <div style={hazardStripe} />

        {!authed ? (
          <div style={{ ...dangerPanel, maxWidth: 380 }}>
            <p style={{ fontSize: 12, letterSpacing: 1.5, color: '#B08789', marginBottom: 14 }}>
              SOLO PERSONAL AUTORIZADO
            </p>
            <input type="password" placeholder="Password" value={pw}
              onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()}
              style={{ borderColor: DANGER_DIM, background: 'rgba(20, 8, 12, 0.7)' }} />
            <div style={{ marginTop: 16 }}>
              <SpringButton className="btn" onClick={login}
                style={{ borderColor: DANGER_DIM, background: DANGER_FAINT, color: '#F0D3D3' }}>
                ENTRAR
              </SpringButton>
            </div>
            {err && <p className="msg error">{err}</p>}
          </div>
        ) : (
          <>
            <div style={dangerPanel}>
              <p style={{ fontSize: 13, letterSpacing: 1, marginBottom: 12, color: '#B08789' }}>NUEVO CONCURSO</p>
              <input type="text" placeholder="Título (ej: Concurso de Setups · Ronda 1)"
                value={title} onChange={e => setTitle(e.target.value)}
                style={{ borderColor: DANGER_DIM, background: 'rgba(20, 8, 12, 0.7)' }} />
              <div style={{ marginTop: 10 }}>
                <input type="text" placeholder="Categorías separadas por coma"
                  value={cats} onChange={e => setCats(e.target.value)}
                  style={{ borderColor: DANGER_DIM, background: 'rgba(20, 8, 12, 0.7)' }} />
              </div>
              <div style={{ marginTop: 16 }}>
                <SpringButton className="btn" onClick={create} disabled={!title.trim()}
                  style={{ borderColor: DANGER_DIM, background: DANGER_FAINT, color: '#F0D3D3' }}>
                  CREAR
                </SpringButton>
              </div>
              {err && <p className="msg error">{err}</p>}
            </div>

            {contests.map(c => (
              <div style={dangerPanel} key={c.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600 }}>{c.title}</p>
                    <p className="msg" style={{ marginTop: 4 }}>
                      {c.categories?.map(x => x.name).join(' · ') || 'sin categorías'} ·{' '}
                      {c.entries?.[0]?.count ?? 0} entradas · {c.votes?.[0]?.count ?? 0} votos
                    </p>
                  </div>
                  <SpringButton className="btn" onClick={() => remove(c.id)}
                    style={{ borderColor: 'rgba(240, 120, 120, 0.55)', color: '#F09595', background: 'rgba(240, 120, 120, 0.08)' }}>
                    {'/!\\'} BORRAR
                  </SpringButton>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                  {PHASES.map(p => (
                    <SpringButton key={p}
                      className="btn"
                      sound={p === 'results' ? 'bloom' : 'thock'}
                      onClick={() => setPhase(c.id, p)}
                      style={c.phase === p
                        ? { borderColor: DANGER, background: DANGER_FAINT, color: '#F0D3D3', boxShadow: `0 0 14px ${DANGER_FAINT}` }
                        : { borderColor: 'rgba(217,110,110,0.22)', color: '#C9A9AB' }}>
                      {p.toUpperCase()}
                    </SpringButton>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  )
}