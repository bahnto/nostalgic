import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import NebulaBackground from './components/NebulaBackground.jsx'
import Landing from './pages/Landing.jsx'
import Join from './pages/Join.jsx'
import Submit from './pages/Submit.jsx'
import Vote from './pages/Vote.jsx'
import Results from './pages/Results.jsx'
import Admin from './pages/Admin.jsx'
import MusicOrbs, { MuteButton } from './components/MusicOrbs.jsx'

function Shell() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')
  const inContest = pathname.startsWith('/c/')
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
        <footer className="dedication">° ˖✧ ˚ ʚ♡ɞ  PARA LOS TEAMS DE JUNO, CORGI Y BULLDOG   ʚ♡ɞ ˚ ✧˖ ° </footer>
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