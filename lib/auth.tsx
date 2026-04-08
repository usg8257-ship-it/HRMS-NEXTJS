'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { validateSession, logoutUser, getToken, setToken, clearToken } from './gas'

interface User {
  email: string
  name: string
  role: string
  entities: string[] | 'ALL'
  active: boolean
  mustChange?: boolean
}

interface AuthContextType {
  user: User | null
  token: string
  loading: boolean
  login: (token: string, user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null, token: '', loading: true,
  login: () => {}, logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setTokenState] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = getToken()
    if (!stored) { setLoading(false); return }
    validateSession(stored).then((r: any) => {
      if (r?.success) {
        setTokenState(stored)
        setUser(r.profile)
      } else {
        clearToken()
      }
    }).catch(() => clearToken())
    .finally(() => setLoading(false))
  }, [])

  const login = (tk: string, u: User) => {
    setToken(tk)
    setTokenState(tk)
    setUser(u)
  }

  const logout = () => {
    logoutUser(token).catch(() => {})
    clearToken()
    setTokenState('')
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
