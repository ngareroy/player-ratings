import { createContext, useContext, useState, useEffect } from 'react'
import { auth, onAuthStateChanged, getAdminRole, logout } from '../firebase'

const AuthContext = createContext(null)

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [adminData, setAdminData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [roleLoading, setRoleLoading] = useState(false)

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser)
                setRoleLoading(true)
                const role = await getAdminRole(firebaseUser.uid)
                setAdminData(role)
                setRoleLoading(false)
            } else {
                setUser(null)
                setAdminData(null)
                setRoleLoading(false)
            }
            setLoading(false)
        })
        return () => unsub()
    }, [])

    const refreshRole = async () => {
        if (user) {
            const role = await getAdminRole(user.uid)
            setAdminData(role)
        }
    }

    const handleLogout = async () => {
        await logout()
        setUser(null)
        setAdminData(null)
    }

    const value = {
        user,
        adminData,
        loading: loading || roleLoading,
        isAdmin: !!adminData,
        isHeadCoach: adminData?.role === 'head_coach',
        isAssistant: adminData?.role === 'assistant_coach',
        role: adminData?.role || null,
        logout: handleLogout,
        refreshRole,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}