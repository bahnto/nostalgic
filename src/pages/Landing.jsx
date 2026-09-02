import { useNavigate } from 'react-router-dom'
import Turbine from '../components/Turbine.jsx'
import SpringButton from '../components/SpringButton.jsx'

// Landing full-bleed: el canvas 3D ocupa toda la pantalla (turbina a la
// derecha, estrellas por todo el viewport) y el texto flota encima,
// a escala de pantalla real.
export default function Landing() {
  const nav = useNavigate()
  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <Turbine />
      <div
        style={{
          position: 'relative', zIndex: 2,
          maxWidth: 620,
          padding: 'clamp(70px, 16vh, 170px) 24px 0 clamp(28px, 8vw, 150px)',
          pointerEvents: 'none'
        }}
      >
        <p className="kicker" style={{ fontSize: 12, letterSpacing: 6 }}>
          OFICINA · GAMING · 2026
        </p>
        <h1 style={{ fontSize: 'clamp(38px, 4.8vw, 64px)', fontWeight: 700, lineHeight: 1.05, margin: 0 }}>
          Concurso
        </h1>
        <h1
          style={{
            fontSize: 'clamp(38px, 4.8vw, 64px)', fontWeight: 700, lineHeight: 1.05,
            margin: '0 0 26px', color: 'transparent',
            WebkitTextStroke: '1.5px rgba(185, 195, 255, 0.45)'
          }}
        >
          de setups
        </h1>
        <p className="lead" style={{ fontSize: 'clamp(15px, 1.15vw, 18px)', marginBottom: 34, maxWidth: 460 }}>
          Mostrá tu estación de batalla. Caos, orden, o eso que solo vos entendés.
        </p>
        <SpringButton
          className="btn primary"
          sound="bloom"
          onClick={() => nav('/join')}
          style={{ pointerEvents: 'auto', fontSize: 14, padding: '15px 30px', letterSpacing: 2 }}
        >
          SUBIR MI ENTRADA
        </SpringButton>
      </div>
    </div>
  )
}