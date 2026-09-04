const cache = {}
const live = new Set()
let muted = false

export function play(name, volume = 0.8) {
  if (!cache[name]) cache[name] = new Audio(`/sounds/${name}.mp3`)
  const a = cache[name].cloneNode()
  a.volume = volume
  a.muted = muted
  live.add(a)
  a.addEventListener('ended', () => live.delete(a))
  a.play().catch(() => {})
  return a
}

// Para audios de larga vida (la música): se anotan en el registro
export function registerAudio(a) { live.add(a); a.muted = muted; return a }

export function setMuted(m) {
  muted = m
  live.forEach(a => { a.muted = m })
}
export function isMuted() { return muted }