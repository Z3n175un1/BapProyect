import { useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import useHashRoute from './hooks/useHashRoute'
import HomePageBAP from './pages/HomePageBAP'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { HOME_ROUTE } from './utils/routes'

export default function App() {
  const route = useHashRoute()

  return (
    <AuthProvider>
      <AppRoute route={route} />
    </AuthProvider>
  )
}

function AppRoute({ route }: { route: string }) {
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && route === 'login') {
      window.location.hash = HOME_ROUTE
    }
  }, [isAuthenticated, route])

  if (route === 'landing') return <HomePageBAP />
  if (route === 'recuperar-contrasena') return <LoginPage mode="recover" />
  if (route === 'login') return isAuthenticated ? null : <LoginPage mode="login" />

  return (
    <ProtectedRoute>
      <DashboardPage activeSlug={route === '' ? 'dashboard' : route} />
    </ProtectedRoute>
  )
}
