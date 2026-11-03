import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { AuthState, LoginCredentials, User } from '../types'
import usersData from '../data/users.json'

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const users: User[] = usersData as User[]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const saved = sessionStorage.getItem('auth')
    if (saved) {
      try {
        return JSON.parse(saved) as AuthState
      } catch {
        return { user: null, isAuthenticated: false }
      }
    }
    return { user: null, isAuthenticated: false }
  })

  const login = useCallback((credentials: LoginCredentials): boolean => {
    const found = users.find(
      u => u.email === credentials.email && u.password === credentials.password
    )
    if (found) {
      const { password: _, ...userWithoutPassword } = found
      const newState: AuthState = { user: userWithoutPassword, isAuthenticated: true }
      setAuthState(newState)
      sessionStorage.setItem('auth', JSON.stringify(newState))
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    const newState: AuthState = { user: null, isAuthenticated: false }
    setAuthState(newState)
    sessionStorage.removeItem('auth')
  }, [])

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
