import { useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import useHashRoute from './hooks/useHashRoute'
import HomePageBAP from './pages/HomePageBAP'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import UsuarioConfiguracion from './pages/usuario_configuracion'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { HOME_ROUTE } from './utils/routes'
import { seguridadPendiente } from './types/auth'

/** Rutas base de la aplicación (hash routing), p. ej. #/login?origen=ok. */
export default function App() {
  const hash = useHashRoute()
  const [route] = splitRoute(hash)

  return (
    <AuthProvider>
      <AppRoute route={route} />
    </AuthProvider>
  )
}

/** Separa la ruta base de su query (#/rutapa?a=b) para el matcher simple. */
function splitRoute(hash: string): [string, string] {
  const queryIndex = hash.indexOf('?')
  if (queryIndex === -1) return [hash, '']
  return [hash.slice(0, queryIndex), hash.slice(queryIndex + 1)]
}

/** Cambia el hash tras montarse (usado para forzar la configuración inicial). */
function Redireccion({ ruta }: { ruta: string }) {
  useEffect(() => {
    window.location.hash = ruta
  }, [ruta])
  return null
}

function AppRoute({ route }: { route: string }) {
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (isAuthenticated && route === 'login') {
      window.location.hash = HOME_ROUTE
    }
  }, [isAuthenticated, route])

  /*
   * FASE F — puerta de primer arranque: mientras la cuenta nueva no cambie su
   * contraseña temporal ni active el 2FA, toda ruta cae en la configuración.
   */
  if (isAuthenticated && user && seguridadPendiente(user) && route !== 'configuracion') {
    return (
      <Redireccion ruta="#/configuracion" />
    )
  }

  if (route === 'landing') return <HomePageBAP />
  if (route === 'recuperar-contrasena') return <LoginPage mode="recover" />
  if (route === 'login') return isAuthenticated ? null : <LoginPage mode="login" />
  if (route === 'configuracion') {
    return (
      <ProtectedRoute>
        <UsuarioConfiguracion />
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardPage activeSlug={route === '' ? 'dashboard' : route} />
    </ProtectedRoute>
  )
}
