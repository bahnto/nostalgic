
let ctx = null, master = null, verb = null, wet = null


const cache = {}
export function play(name, volume = 0.8) {
  if (!cache[name]) cache[name] = new Audio(`/sounds/${name}.mp3`)
  const a = cache[name].cloneNode()
  a.volume = volume
  a.play().catch(() => {})
}