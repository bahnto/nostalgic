import { useNavigate } from 'react-router-dom'
import Turbine from '../components/Turbine.jsx'
import SpringButton from '../components/SpringButton.jsx'

export default function Landing() {
  const nav = useNavigate()
  return (
    <div className="page" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24 }}>
      <div style={{ flex: '1 1 280px', minWidth: 260 }}>
        <p className="kicker">OFICINA · GAMING · 2026</p>
        <h1 className="display">Concurso<br /><span className="outline">de setups</span></h1>
        <p className="lead" style={{ margin: '18px 0 26px' }}>
          Mostrá tu estación de batalla. Caos, orden, o eso que solo vos entendés.
        </p>
        <SpringButton className="btn primary" sound="bloom" onClick={() => nav('/join')}>
          SUBIR MI ENTRADA
        </SpringButton>
      </div>
      <div style={{ flex: '1 1 340px', minWidth: 300 }}>
        <Turbine height={440} />
      </div>
    </div>
  )
}
