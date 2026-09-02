import { useEffect, useRef } from 'react'

// Fondo v16: capa tileable derivando a la izquierda (55s) + hotspot estático
// de la v3 en mix-blend screen + grano + viñeta. Todo procedural, cero assets.
function hash(x, y) { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n) }
function vnoise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy)
  const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1)
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy
}
function fbm(x, y) {
  let v = 0, amp = 0.5, f = 1
  for (let o = 0; o < 5; o++) { v += vnoise(x * f, y * f) * amp; f *= 2.1; amp *= 0.52 }
  return v
}

export default function NebulaBackground() {
  const driftRef = useRef(null)
  const staticRef = useRef(null)
  const grainRef = useRef(null)

  useEffect(() => {
    const W = window.innerWidth, H = window.innerHeight
    const NW = 220, NH = Math.round(220 * H / W)
    const SPAN = 4.5
    const tiled = (fn, u, v, fx) => fn(u, v) * (1 - fx) + fn(u - SPAN, v) * fx

    // Capa que deriva (tileable sin costura, al 60%)
    const off = document.createElement('canvas')
    off.width = NW; off.height = NH
    const nctx = off.getContext('2d')
    const img = nctx.createImageData(NW, NH)
    for (let py = 0; py < NH; py++) for (let px = 0; px < NW; px++) {
      const fx = px / NW, u = fx * SPAN, v2 = py / NH * 3.2
      const n = tiled((a, b) => fbm(a + 13.7, b + 7.3), u, v2, fx)
      const m = tiled((a, b) => fbm(a * 1.7 + 40.2, b * 1.7 + 21.8), u, v2, fx)
      const soot = tiled((a, b) => fbm(a * 2.4 + 91.1, b * 2.4 + 55.5), u, v2, fx)
      let cloud = Math.pow(Math.max(0, n - 0.28) * 1.6, 1.9)
      cloud *= (0.55 + 0.45 * m)
      cloud *= (1 - Math.pow(soot, 2.2) * 0.75)
      const cy = (py / NH - 0.45)
      cloud *= Math.max(0.2, 1 - cy * cy * 2.0)
      cloud *= 0.6
      const r = 34 + 74 * m * cloud + cloud * 30
      const g = 22 + 50 * m * cloud + cloud * 16
      const b2 = 52 + 116 * cloud
      const i4 = (py * NW + px) * 4
      img.data[i4] = Math.min(255, 14 + r * cloud * 1.4)
      img.data[i4 + 1] = Math.min(255, 10 + g * cloud * 1.4)
      img.data[i4 + 2] = Math.min(255, 28 + b2 * cloud * 1.3)
      img.data[i4 + 3] = 255
    }
    nctx.putImageData(img, 0, 0)
    const el = driftRef.current
    el.style.backgroundImage = `url(${off.toDataURL()})`
    el.style.backgroundRepeat = 'repeat-x'
    el.style.backgroundSize = `${W}px ${H}px`
    if (!document.getElementById('nebdrift-kf')) {
      const st = document.createElement('style')
      st.id = 'nebdrift-kf'
      st.textContent = `@keyframes nebdrift { from { background-position: 0 0; } to { background-position: -${W}px 0; } }`
      document.head.appendChild(st)
    }
    el.style.animation = 'nebdrift 35s linear infinite'

    // Hotspot estático (composición de la v3)
    const nst = staticRef.current
    nst.width = NW; nst.height = NH
    const sctx = nst.getContext('2d')
    const simg = sctx.createImageData(NW, NH)
    for (let sy = 0; sy < NH; sy++) for (let sx = 0; sx < NW; sx++) {
      const su = sx / NW * 4.5, sv = sy / NH * 3.2
      const sn = fbm(su + 13.7, sv + 7.3)
      const sm = fbm(su * 1.7 + 40.2, sv * 1.7 + 21.8)
      const ssoot = fbm(su * 2.4 + 91.1, sv * 2.4 + 55.5)
      let scloud = Math.pow(Math.max(0, sn - 0.28) * 1.6, 1.9)
      scloud *= (0.55 + 0.45 * sm)
      scloud *= (1 - Math.pow(ssoot, 2.2) * 0.75)
      const scx = (sx / NW - 0.62), scy = (sy / NH - 0.42)
      scloud *= Math.max(0, 1 - (scx * scx + scy * scy * 1.6) * 1.5)
      const sr = 34 + 74 * sm * scloud + scloud * 30
      const sg = 22 + 50 * sm * scloud + scloud * 16
      const sb = 52 + 116 * scloud
      const si = (sy * NW + sx) * 4
      simg.data[si] = Math.min(255, sr * scloud * 1.4)
      simg.data[si + 1] = Math.min(255, sg * scloud * 1.4)
      simg.data[si + 2] = Math.min(255, sb * scloud * 1.3)
      simg.data[si + 3] = 255
    }
    sctx.putImageData(simg, 0, 0)

    // Grano
    const gr = grainRef.current
    gr.width = 480; gr.height = Math.round(480 * H / W)
    const gctx = gr.getContext('2d')
    const gimg = gctx.createImageData(gr.width, gr.height)
    for (let gi = 0; gi < gimg.data.length; gi += 4) {
      const gv = Math.random() * 255
      gimg.data[gi] = gv; gimg.data[gi + 1] = gv; gimg.data[gi + 2] = gv
      gimg.data[gi + 3] = Math.random() < 0.5 ? 7 : 0
    }
    gctx.putImageData(gimg, 0, 0)
  }, [])

  const layer = { position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }
  return (
    <>
      <div ref={driftRef} className="nebula-drift" style={{ ...layer, filter: 'blur(1.5px)' }} />
      <canvas ref={staticRef} style={{ ...layer, width: '100%', height: '100%', filter: 'blur(1.5px)', mixBlendMode: 'screen' }} />
      <canvas ref={grainRef} style={{ ...layer, width: '100%', height: '100%', opacity: 0.5 }} />
      <div style={{ ...layer, zIndex: 1, background: 'radial-gradient(ellipse 120% 100% at 50% 45%, rgba(0,0,0,0) 55%, rgba(8,5,16,0.55) 100%)' }} />
    </>
  )
}
