import { useEffect, useRef } from 'react'

// Turbina v22 — FULL BLEED: el canvas ocupa toda la sección, la turbina vive
// desplazada a la derecha dentro de la escena, las estrellas se reparten por
// todo el viewport y nada se corta. Vidrio esmerilado con transmisión real
// (dos pasadas), hombros redondeados, órbita chata con brillo por distancia.
export default function Turbine() {
  const mountRef = useRef(null)

  useEffect(() => {
    let disposed = false
    let cleanup = () => {}

    import('three').then((THREE) => {
      if (disposed || !mountRef.current) return
      const mount = mountRef.current

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      mount.appendChild(renderer.domElement)
      renderer.domElement.style.display = 'block'

      const dbSize = new THREE.Vector2()
      const bgRT = new THREE.WebGLRenderTarget(2, 2, {
        minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter
      })

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120)
      camera.position.set(0, 0.3, 30)
      camera.lookAt(0, 0, 0)

      const hash = (x, y) => { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n) }

      const makeStars = (count, zmin, zmax, size, op) => {
        const pos = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
          pos[i * 3] = (Math.random() - 0.5) * 110
          pos[i * 3 + 1] = (Math.random() - 0.5) * 62
          pos[i * 3 + 2] = zmin + Math.random() * (zmax - zmin)
        }
        const g = new THREE.BufferGeometry()
        g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
        return new THREE.Points(g, new THREE.PointsMaterial({
          color: 0xD8DCF8, size, sizeAttenuation: true, transparent: true, opacity: op, depthWrite: false
        }))
      }
      scene.add(makeStars(130, -55, -25, 0.22, 0.5))
      scene.add(makeStars(55, -24, -8, 0.3, 0.7))
      scene.add(makeStars(16, -6, 6, 0.38, 0.85))

      const vsh = `varying vec3 vN; varying vec3 vV; varying vec2 vUv;
        void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vUv = uv;
        gl_Position = projectionMatrix * mv; }`

      const EDGE = new THREE.Color(0.72, 0.62, 1.0)
      const BODY = new THREE.Color().setHSL(0.7, 0.7, 0.2)
      const CAPC = new THREE.Color().setHSL(0.7, 0.72, 0.66)

      const bodyMats = []
      const bodyMat = () => {
        const m = new THREE.ShaderMaterial({
          uniforms: {
            uBase: { value: BODY }, uEdge: { value: EDGE },
            uBg: { value: bgRT.texture }, uRes: { value: new THREE.Vector2(2, 2) }
          },
          vertexShader: vsh,
          fragmentShader: `
            uniform vec3 uBase; uniform vec3 uEdge; uniform sampler2D uBg; uniform vec2 uRes;
            varying vec3 vN; varying vec3 vV; varying vec2 vUv;
            vec3 tap(vec2 uv){ vec4 s = texture2D(uBg, uv); return s.rgb * s.a; }
            void main(){
              float d = abs(dot(normalize(vN), normalize(vV)));
              float f = pow(1.0 - d, 2.0);
              float rim = smoothstep(0.55, 0.95, 1.0 - d);
              vec2 suv = gl_FragCoord.xy / uRes;
              suv += normalize(vN).xy * 0.012;
              vec2 r1 = vec2(7.0) / uRes;
              vec2 r2 = vec2(14.0) / uRes;
              vec3 blur = tap(suv) * 0.2;
              blur += (tap(suv + vec2(r1.x, 0.0)) + tap(suv - vec2(r1.x, 0.0)) + tap(suv + vec2(0.0, r1.y)) + tap(suv - vec2(0.0, r1.y))) * 0.1;
              blur += (tap(suv + r1 * 0.7) + tap(suv - r1 * 0.7) + tap(suv + vec2(r1.x, -r1.y) * 0.7) + tap(suv + vec2(-r1.x, r1.y) * 0.7)) * 0.06;
              blur += (tap(suv + vec2(r2.x, 0.0)) + tap(suv - vec2(r2.x, 0.0)) + tap(suv + vec2(0.0, r2.y)) + tap(suv - vec2(0.0, r2.y))) * 0.04;
              vec3 col = uBase * (0.75 + f * 0.45) + blur * 0.95 + uEdge * (f * 1.05 + rim * 1.25);
              float a = 0.93 + f * 0.07;
              gl_FragColor = vec4(col, a);
            }`,
          transparent: true, depthWrite: true, side: THREE.FrontSide
        })
        bodyMats.push(m)
        return m
      }
      const haloMat = () => new THREE.ShaderMaterial({
        uniforms: { uEdge: { value: EDGE } },
        vertexShader: vsh,
        fragmentShader: `uniform vec3 uEdge; varying vec3 vN; varying vec3 vV; varying vec2 vUv;
          void main(){ float d = abs(dot(normalize(vN), normalize(vV)));
          float g = pow(d, 1.6);
          gl_FragColor = vec4(uEdge * g * 1.15, g * 0.5); }`,
        transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending
      })
      const capGlowMat = () => new THREE.ShaderMaterial({
        uniforms: { uCol: { value: CAPC } },
        vertexShader: vsh,
        fragmentShader: `uniform vec3 uCol; varying vec2 vUv;
          void main(){ float r = length(vUv - 0.5) * 2.0;
          float fall = 1.0 - smoothstep(0.5, 1.0, r);
          gl_FragColor = vec4(uCol * fall * 1.25, fall * 0.8); }`,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide
      })

      const roundedTubeGeo = (rad, len, cr, segs) => {
        const h = len / 2
        const pts = []
        pts.push(new THREE.Vector2(0.02, -h))
        pts.push(new THREE.Vector2(rad - cr, -h))
        for (let i = 1; i <= 6; i++) {
          const a = -Math.PI / 2 + (i / 6) * (Math.PI / 2)
          pts.push(new THREE.Vector2(rad - cr + Math.cos(a) * cr, -h + cr + Math.sin(a) * cr))
        }
        pts.push(new THREE.Vector2(rad, h - cr))
        for (let j = 1; j <= 6; j++) {
          const a2 = (j / 6) * (Math.PI / 2)
          pts.push(new THREE.Vector2(rad - cr + Math.cos(a2) * cr, h - cr + Math.sin(a2) * cr))
        }
        pts.push(new THREE.Vector2(0.02, h))
        return new THREE.LatheGeometry(pts, segs)
      }

      const turbine = new THREE.Group()
      turbine.position.set(0, 0.4, 0)
      turbine.scale.setScalar(0.8)
      scene.add(turbine)

      const N = 10
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2
        const len = 4.6 + hash(i, 77) * 1.3
        const rad = 0.58, cr = 0.18

        const body = new THREE.Mesh(roundedTubeGeo(rad, len, cr, 32), bodyMat())
        body.renderOrder = 2
        const halo = new THREE.Mesh(roundedTubeGeo(rad * 1.2, len * 1.02, cr * 1.2, 32), haloMat())
        halo.renderOrder = 1

        const arm = new THREE.Group()
        arm.add(halo); arm.add(body)
        ;[len / 2, -len / 2].forEach((yy, ci) => {
          const dir = ci === 0 ? 1 : -1
          const cap = new THREE.Mesh(
            new THREE.CircleGeometry(rad - cr * 0.9, 36),
            new THREE.MeshBasicMaterial({ color: CAPC, transparent: true, opacity: 0.95, side: THREE.DoubleSide })
          )
          cap.rotation.x = -dir * Math.PI / 2
          cap.position.y = yy + dir * 0.004; cap.renderOrder = 3
          arm.add(cap)
          const capBloom = new THREE.Mesh(new THREE.CircleGeometry(rad * 1.55, 36), capGlowMat())
          capBloom.rotation.x = -dir * Math.PI / 2
          capBloom.position.y = yy + dir * 0.03
          capBloom.renderOrder = 4
          arm.add(capBloom)
        })

        const r = 3.4 + len / 2
        arm.position.set(Math.cos(a) * r, Math.sin(a) * r, (hash(i, 133) - 0.5) * 0.5)
        arm.rotation.z = a - Math.PI / 2
        arm.rotation.x = (hash(i, 144) - 0.5) * 0.1
        turbine.add(arm)
      }

      const orbitGroup = new THREE.Group()
      orbitGroup.position.set(0, 0.4, 0)
      orbitGroup.rotation.x = 1.38
      scene.add(orbitGroup)
      const orbitMat = new THREE.ShaderMaterial({
        uniforms: {
          uNear: { value: 17.0 }, uFar: { value: 36.0 },
          uBright: { value: new THREE.Color(0xCFC2FF) },
          uDim: { value: new THREE.Color(0x3A3768) }
        },
        vertexShader: `varying float vZ; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vZ = -mv.z; gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `uniform float uNear; uniform float uFar; uniform vec3 uBright; uniform vec3 uDim; varying float vZ;
          void main(){ float nf = smoothstep(uFar, uNear, vZ);
          vec3 col = mix(uDim, uBright, nf);
          float a = mix(0.25, 1.0, nf);
          gl_FragColor = vec4(col, a); }`,
        transparent: true, depthWrite: true
      })
      const orbit = new THREE.Mesh(new THREE.TorusGeometry(10.2, 0.05, 10, 160), orbitMat)
      orbitGroup.add(orbit)
      const sat = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xD5CBFF })
      )
      orbitGroup.add(sat)

      // Layout responsive: turbina a la derecha en pantallas anchas,
      // centrada arriba en pantallas angostas. Nada se corta.
      let W = 1, H = 1
      const applySize = () => {
        W = mount.clientWidth; H = mount.clientHeight
        if (W < 2 || H < 2) return
        renderer.setSize(W, H)
        camera.aspect = W / H
        camera.updateProjectionMatrix()
        renderer.getDrawingBufferSize(dbSize)
        bgRT.setSize(Math.max(2, Math.round(dbSize.x / 2)), Math.max(2, Math.round(dbSize.y / 2)))
        bodyMats.forEach(m => m.uniforms.uRes.value.copy(dbSize))
        const halfW = Math.tan(21 * Math.PI / 180) * 30 * camera.aspect
        const tx = camera.aspect > 1.05 ? Math.min(7.2, halfW * 0.42) : 0
        const ty = camera.aspect > 1.05 ? 0.4 : 3.2
        turbine.position.set(tx, ty, 0)
        orbitGroup.position.set(tx, ty, 0)
      }
      applySize()
      window.addEventListener('resize', applySize)

      const tiltX = { x: 0, v: 0, target: 0 }, tiltY = { x: 0, v: 0, target: 0 }
      let spinV = 0, baseZ = 0

      const turbineScreenDist = (e) => {
        const r = mount.getBoundingClientRect()
        const vec = turbine.position.clone().project(camera)
        const sx = (vec.x * 0.5 + 0.5) * r.width
        const sy = (-vec.y * 0.5 + 0.5) * r.height
        const dx = (e.clientX - r.left) - sx, dy = (e.clientY - r.top) - sy
        return Math.sqrt(dx * dx + dy * dy)
      }
      const onMove = (e) => {
        const r = mount.getBoundingClientRect()
        tiltY.target = ((e.clientX - r.left) / r.width - 0.5) * 0.22
        tiltX.target = ((e.clientY - r.top) / r.height - 0.5) * 0.18
        mount.style.cursor = turbineScreenDist(e) < Math.min(r.width, r.height) * 0.32 ? 'pointer' : 'default'
      }
      const onLeave = () => { tiltX.target = 0; tiltY.target = 0 }
      const onDown = (e) => {
        const r = mount.getBoundingClientRect()
        if (turbineScreenDist(e) < Math.min(r.width, r.height) * 0.32) {
          spinV = Math.min(spinV + 1.6, 6)
        }
      }
      mount.addEventListener('pointermove', onMove)
      mount.addEventListener('pointerleave', onLeave)
      mount.addEventListener('pointerdown', onDown)

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      let raf = 0
      const t0 = performance.now(); let last = t0
      const tick = (now) => {
        const dt = Math.min((now - last) / 1000, 0.032)
        const t = (now - t0) / 1000
        last = now
        const aX = -40 * (tiltX.x - tiltX.target) - 10 * tiltX.v; tiltX.v += aX * dt; tiltX.x += tiltX.v * dt
        const aY = -40 * (tiltY.x - tiltY.target) - 10 * tiltY.v; tiltY.v += aY * dt; tiltY.x += tiltY.v * dt

        spinV *= Math.pow(0.45, dt)
        baseZ += ((reduced ? 0 : 0.1) + spinV) * dt

        turbine.rotation.z = baseZ
        if (!reduced) {
          turbine.rotation.y = t * 0.06 + Math.sin(t * 0.05) * 0.32 + tiltY.x
          turbine.rotation.x = Math.sin(t * 0.08) * 0.6 + Math.sin(t * 0.03 + 1.7) * 0.22 + tiltX.x
          orbit.rotation.z = t * 0.09
          const sa = t * 0.4
          sat.position.set(Math.cos(sa) * 10.2, Math.sin(sa) * 10.2, 0)
        }

        turbine.visible = false
        renderer.setRenderTarget(bgRT)
        renderer.render(scene, camera)
        renderer.setRenderTarget(null)
        turbine.visible = true
        renderer.render(scene, camera)

        raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)

      cleanup = () => {
        cancelAnimationFrame(raf)
        window.removeEventListener('resize', applySize)
        mount.removeEventListener('pointermove', onMove)
        mount.removeEventListener('pointerleave', onLeave)
        mount.removeEventListener('pointerdown', onDown)
        bgRT.dispose()
        renderer.dispose()
        if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
      }
    })

    return () => { disposed = true; cleanup() }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{ position: 'absolute', inset: 0, touchAction: 'none', overflow: 'hidden' }}
      aria-hidden="true"
    />
  )
}