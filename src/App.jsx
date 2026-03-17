import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import HomePage from './pages/HomePage'
import PublicView from './pages/PublicView'
import PublicFixtures from './pages/PublicFixtures'
import AdminView from './pages/AdminView'
import LoginPage from './pages/LoginPage'
import ManageTeam from './pages/ManageTeam'
import TeamManager from './pages/TeamManager'
import AssessmentManager from './pages/AssessmentManager'
import MatchCenter from './pages/MatchCenter'
import MatchDetail from './pages/MatchDetail'
import ClubSettings from './pages/ClubSettings'
import NewsDetail from './pages/NewsDetail'

function ProtectedRoute({ children, requireHeadCoach }) {
  const { user, isAdmin, isHeadCoach, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "system-ui", fontSize: 14 }}>Loading...</p>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />
  }

  if (requireHeadCoach && !isHeadCoach) {
    return <Navigate to="/admin" replace />
  }

  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/players" element={<PublicView />} />
      <Route path="/fixtures" element={<PublicFixtures />} />
      <Route path="/news/:postId" element={<NewsDetail />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminView />
        </ProtectedRoute>
      } />
      <Route path="/admin/manage" element={
        <ProtectedRoute requireHeadCoach>
          <ManageTeam />
        </ProtectedRoute>
      } />
      <Route path="/admin/teams" element={
        <ProtectedRoute requireHeadCoach>
          <TeamManager />
        </ProtectedRoute>
      } />
      <Route path="/admin/assessments" element={
        <ProtectedRoute>
          <AssessmentManager />
        </ProtectedRoute>
      } />
      <Route path="/admin/matches" element={
        <ProtectedRoute>
          <MatchCenter />
        </ProtectedRoute>
      } />
      <Route path="/admin/matches/:matchId" element={
        <ProtectedRoute>
          <MatchDetail />
        </ProtectedRoute>
      } />
      <Route path="/admin/club" element={
        <ProtectedRoute requireHeadCoach>
          <ClubSettings />
        </ProtectedRoute>
      } />
      <Route path="/admin/:secretKey" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}