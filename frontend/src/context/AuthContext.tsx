import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import * as authApi from '../services/authApi'
import type { SesionPayload, UsuarioSesion } from '../types/auth'

/**
 * Estado de sesión real (FASE C): token opaco en sessionStorage 'vg:token'.
 *
 * - Reglas: el token NUNCA se guarda en localStorage y contraseñas,
 *   secretos TOTP o códigos 2FA no se almacenan en ningún storage; los
 *   desafíos viven solo en memoria del paso de login.
 * - Al montar, si hay token se revalida con GET /auth/me.
 * - El frontend oculta opciones por modulos[], pero la autorización real
 *   la aplica el backend (el nav NO es medida de seguridad).
 */

const TOKEN_KEY = 'vg:token'

export type AuthStatus = 'initializing' | 'unauthenticated' | 'authenticated'

interface SesionInterna {
  user: UsuarioSesion
  modulos: string[]
  inactividadMinutos: number
}

interface AuthContextType {
  status: AuthStatus
  token: string | null
  user: UsuarioSesion | null
  modulos: string[]
  isAuthenticated: boolean
  /** Guarda token + usuario + módulos emitidos por login/2FA. */
  aplicarSesion: (payload: SesionPayload) => void
  /** Revalida GET /auth/me (recarga de página). */
  refrescarSesion: () => Promise<void>
  /** Cierra sesión local + revoca el token en el backend. */
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function desdeAlmacen(): SesionInterna | null {
  const token = sessionStorage.getItem(TOKEN_KEY)
  const crudo = sessionStorage.getItem('vg:sesion')
  if (!token || !crudo) return null
  try {
    const sesion = JSON.parse(crudo) as SesionInterna
    if (sesion?.user && Array.isArray(sesion.modulos)) return sesion
    return null
  } catch {
    return null
  }
}

function guardarAlmacen(token: string, sesion: SesionInterna): void {
  sessionStorage.setItem(TOKEN_KEY, token)
  sessionStorage.setItem('vg:sesion', JSON.stringify(sesion))
}

function limpiarAlmacen(): void {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem('vg:sesion')
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(fromTransition)
  const [sesion, setSesion] = useState<SesionInterna | null>(() => desdeAlmacen())
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(TOKEN_KEY))

  function fromTransition(): AuthStatus {
    return sessionStorage.getItem(TOKEN_KEY) ? 'initializing' : 'unauthenticated'
  }

  const aplicarSesion = (payload: SesionPayload): void => {
    const nueva: SesionInterna = {
      user: payload.usuario,
      modulos: payload.modulos,
      inactividadMinutos: payload.inactividad_minutos,
    }
    guardarAlmacen(payload.token, nueva)
    setToken(payload.token)
    setSesion(nueva)
    setStatus('authenticated')
  }

  const refrescarSesion = async (): Promise<void> => {
    const token = sessionStorage.getItem(TOKEN_KEY)
    if (!token) {
      setStatus('unauthenticated')
      setSesion(null)
      return
    }
    /* 'initializing' sólo si no hay sesión visible ya (evita parpadeos en
       los refrescos periódicos de fondo que sincronizan el menú). */
    if (!sessionStorage.getItem('vg:sesion')) {
      setStatus('initializing')
    }
    try {
      const payload = await authApi.yo(token)
      aplicarSesion({ ...payload, token })
    } catch {
      /* Token inválido o sesión expirada: se descarta y se exige login. */
      limpiarAlmacen()
      setSesion(null)
      setToken(null)
      setStatus('unauthenticated')
    }
  }

  const logout = (): void => {
    const tokenActual = sessionStorage.getItem(TOKEN_KEY)
    limpiarAlmacen()
    setToken(null)
    setSesion(null)
    setStatus('unauthenticated')
    if (tokenActual) void authApi.cerrarSesion(tokenActual)
  }

  useEffect(() => {
    if (desdeAlmacen()) {
      void refrescarSesion()
    }
    // Se ejecuta una única vez al montar el proveedor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Actualización dinámica del menú (FASE D/E): si un administrador
   * habilita/deshabilita módulos, la UI se re-sincroniza con el backend
   * al volver el foco a la pestaña y cada 5 minutos, sólo con sesión viva.
   */
  const refrescando = useRef(false)

  useEffect(() => {
    if (status !== 'authenticated') return

    const sincronizar = () => {
      if (refrescando.current) return
      refrescando.current = true
      void refrescarSesion().finally(() => {
        refrescando.current = false
      })
    }

    const enFoco = () => {
      if (document.visibilityState === 'visible') sincronizar()
    }

    window.addEventListener('focus', enFoco)
    document.addEventListener('visibilitychange', enFoco)
    const intervalo = window.setInterval(sincronizar, 5 * 60 * 1000)

    return () => {
      window.removeEventListener('focus', enFoco)
      document.removeEventListener('visibilitychange', enFoco)
      window.clearInterval(intervalo)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  return (
    <AuthContext.Provider
      value={{
        status,
        token,
        user: sesion?.user ?? null,
        modulos: sesion?.modulos ?? [],
        isAuthenticated: status === 'authenticated',
        aplicarSesion,
        refrescarSesion,
        logout,
      }}
    >
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
