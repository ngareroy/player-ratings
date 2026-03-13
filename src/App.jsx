import { Routes, Route } from 'react-router-dom'
import PublicView from './pages/PublicView'
import AdminView from './pages/AdminView'

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<PublicView />} />
            <Route path="/admin/:secretKey" element={<AdminView />} />
        </Routes>
    )
}