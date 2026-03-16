import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import PublicView from './pages/PublicView'
import AdminView from './pages/AdminView'
import LoginPage from './pages/LoginPage'

function ProtectedRoute({ children }) {
    const { user, isAdmin, loading } = useAuth()

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

    return children
}

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<PublicView />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={
                <ProtectedRoute>
                    <AdminView />
                </ProtectedRoute>
            } />
            {/* Redirect old secret URL to new login */}
            <Route path="/admin/:secretKey" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}