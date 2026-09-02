import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import NebulaBackground from './components/NebulaBackground.jsx'
import Landing from './pages/Landing.jsx'
import Join from './pages/Join.jsx'
import Submit from './pages/Submit.jsx'
import Vote from './pages/Vote.jsx'
import Results from './pages/Results.jsx'
import Admin from './pages/Admin.jsx'

function Shell() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')
  return (
    <>
      {!isAdmin && <NebulaBackground />}
      <div className="app-layer">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/join" element={<Join />} />
          <Route path="/c/:contestId/submit" element={<Submit />} />
          <Route path="/c/:contestId/vote" element={<Vote />} />
          <Route path="/c/:contestId/results" element={<Results />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
      {!isAdmin && (
        <footer className="dedication">★ PARA LOS TEAMS DE JUNO, CORGI Y BULLDOG</footer>
      )}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}