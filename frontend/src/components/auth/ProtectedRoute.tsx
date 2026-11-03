import { useEffect, type ReactNode } from 'react'
import { useAuth } from '../../context/AuthContext'
import LoginPage from '../../pages/LoginPage'
import { LOGIN_ROUTE } from '../../utils/routes'

/** Bloquea el acceso al dashboard sin sesión y redirige al Login. */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.hash = LOGIN_ROUTE
    }
  }, [isAuthenticated])

  if (!isAuthenticated) return <LoginPage mode="login" />

  return <>{children}</>
}
