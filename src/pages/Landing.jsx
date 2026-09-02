import { useNavigate } from 'react-router-dom'
import Turbine from '../components/Turbine.jsx'
import SpringButton from '../components/SpringButton.jsx'


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
          
        </p>
        <h1 style={{ fontSize: 'clamp(38px, 4.8vw, 64px)', fontWeight: 700, lineHeight: 1.05, margin: 0 }}>
          Concurso
        </h1>
        <h1
          style={{
            fontSize: 'clamp(38px, 4.8vw, 64px)', fontWeight: 700, lineHeight: 1.05,
            margin: '0 0 34px', color: 'transparent',
            WebkitTextStroke: '1.5px rgba(185, 195, 255, 0.45)'
          }}
        >
          de setups
        </h1>
        <p className="lead" style={{ fontSize: 'clamp(15px, 1.15vw, 18px)', marginBottom: 50, maxWidth: 460 }}>
          La votación se hará el 19 de Septiembre en lo de Ihar
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