import { Routes, Route, Navigate } from 'react-router-dom'
import { Nav } from './components/Nav'
import Home from './pages/Home'
import Problems from './pages/Problems'
import ProblemDetail from './pages/ProblemDetail'
import Practice from './pages/Practice'
import Feedback from './pages/Feedback'
import History from './pages/History'
import CreateProblem from './pages/CreateProblem'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/problems/new" element={<CreateProblem />} />
          <Route path="/problems/:id" element={<ProblemDetail />} />
          <Route path="/practice/:attemptId" element={<Practice />} />
          <Route path="/feedback/:attemptId" element={<Feedback />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}
