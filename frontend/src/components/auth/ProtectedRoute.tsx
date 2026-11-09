import { useEffect, type ReactNode } from 'react'
import { useAuth } from '../../context/AuthContext'
import LoginPage from '../../pages/LoginPage'
import { LOGIN_ROUTE } from '../../utils/routes'
import loadSpinnerUrl from '../../assets/loadingspinner.png'

/**
 * Bloquea el acceso al dashboard sin sesión y redirige al Login.
 * Mientras el token guardado se revalida contra /auth/me (initializing)
 * muestra una pantalla neutra en lugar de mostrar el Login por unos ms.
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, status } = useAuth()

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.hash = LOGIN_ROUTE
    }
  }, [status])

  if (status === 'initializing') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-950" role="status" aria-live="polite">
        <img src={loadSpinnerUrl} alt="" aria-hidden="true" className="h-8 w-8 animate-spin opacity-70" />
        <span className="sr-only">Restaurando sesión…</span>
      </div>
    )
  }

  if (!isAuthenticated) return <LoginPage mode="login" />

  return <>{children}</>
}
