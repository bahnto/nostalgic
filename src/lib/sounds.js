// Sistema de sonido TURBINA — jerarquía de materiales:
// lo blando suena a tacto (thock, seco), lo que brilla abre el espacio
// (bloom/wash, con reverb de convolución). Diseñado en la sesión de audio.
let ctx = null, master = null, verb = null, wet = null

function makeIR(seconds, decay) {
  const rate = ctx.sampleRate, len = rate * seconds
  const buf = ctx.createBuffer(2, len, rate)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch); let lp = 0
    for (let i = 0; i < len; i++) {
      const n = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay)
      lp = lp * 0.82 + n * 0.18; d[i] = lp
    }
  }
  return buf
}

export function ensureAudio() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return }
  ctx = new (window.AudioContext || window.webkitAudioContext)()
  master = ctx.createGain(); master.gain.value = 0.85; master.connect(ctx.destination)
  verb = ctx.createConvolver(); verb.buffer = makeIR(3, 2.6)
  wet = ctx.createGain(); wet.gain.value = 0.6
  verb.connect(wet); wet.connect(master)
}

function send(node, dry) {
  const g = ctx.createGain(); g.gain.value = dry
  node.connect(g); g.connect(master)
  node.connect(verb)
}

function noiseBuf(seconds) {
  const len = ctx.sampleRate * seconds
  const b = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = b.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  return b
}

export function thock() {
  if (!ctx) return
  const t = ctx.currentTime
  const o = ctx.createOscillator(); o.type = 'sine'
  o.frequency.setValueAtTime(210, t)
  o.frequency.exponentialRampToValueAtTime(120, t + 0.07)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.3, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09)
  o.connect(g); send(g, 0.9)
  o.start(t); o.stop(t + 0.12)
}

export function bloom() {
  if (!ctx) return
  const t = ctx.currentTime
  ;[78, 117.2, 156].forEach((fr, i) => {
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = fr
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.2 - i * 0.05, t + 0.35 + i * 0.1)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4)
    o.connect(g); send(g, 0.5)
    o.start(t); o.stop(t + 2.6)
  })
}

export function wash() {
  if (!ctx) return
  const t = ctx.currentTime
  const src = ctx.createBufferSource(); src.buffer = noiseBuf(1.6)
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.1
  f.frequency.setValueAtTime(380, t)
  f.frequency.exponentialRampToValueAtTime(1600, t + 0.7)
  f.frequency.exponentialRampToValueAtTime(500, t + 1.5)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.18, t + 0.45)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.55)
  src.connect(f); f.connect(g); send(g, 0.35)
  src.start(t)
}
