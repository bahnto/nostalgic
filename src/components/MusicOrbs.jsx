import { useRef, useState } from 'react'
import { registerAudio, setMuted, isMuted } from '../lib/sounds.js'


const PLAYLIST = ['bg-sound']
const VOLUME = 0.25

// ——— Reproductor: bolitas PS2 que despiertan como botones ———
export default function MusicOrbs({ hidden }) {
  const audioRef = useRef(null)
  const trackRef = useRef(0)
  const [open, setOpen] = useState(false)
  const [playing, setPlaying] = useState(false)

  const ensure = () => {
    if (!audioRef.current) {
      const a = new Audio(`/sounds/${PLAYLIST[0]}.mp3`)
      a.volume = VOLUME
      a.addEventListener('ended', () => skip(1))
      registerAudio(a)
      audioRef.current = a
    }
    return audioRef.current
  }
  const playNow = () => { ensure().play().catch(() => {}); setPlaying(true) }
  const pauseNow = () => { ensure().pause(); setPlaying(false) }
  const skip = (dir) => {
    const a = ensure()
    trackRef.current = (trackRef.current + dir + PLAYLIST.length) % PLAYLIST.length
    a.src = `/sounds/${PLAYLIST[trackRef.current]}.mp3`
    playNow()
  }
if (hidden) return null
  if (!open) {
    return (
      <div className="music-orbs orb-cluster" onClick={() => { setOpen(true); playNow() }} title="Música">
        <span className="orb o1" /><span className="orb o2" /><span className="orb o3" />
      </div>
    )
  }

  return (
    <div className="music-orbs orb-row">
      <button className="music-btn f1" onClick={() => skip(-1)} title="Anterior">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 5h2v14H6zM20 5v14L9.5 12z" />
        </svg>
      </button>
      <button className="music-btn f2" onClick={playing ? pauseNow : playNow} title="Play/Pausa">
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 5l12 7-12 7z" />
          </svg>
        )}
      </button>
      <button className="music-btn f3" onClick={() => skip(1)} title="Siguiente">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 5h2v14h-2zM4 5v14l10.5-7z" />
        </svg>
      </button>
    </div>
  )
}

// ——— Mute global: independiente, vive en toda la app ———

export function MuteButton() {
  const [muted, setLocalMuted] = useState(isMuted())
  const toggle = () => {
    const m = !isMuted()
    setMuted(m)
    setLocalMuted(m)
  }
  return (
    <button
      className="mute-float"
      onClick={toggle}
      title={muted ? 'Activar sonido' : 'Silenciar'}
      style={{ textDecoration: muted ? 'line-through' : 'none', opacity: muted ? 0.4 : 0.75 }}
    >♪</button>
  )
}