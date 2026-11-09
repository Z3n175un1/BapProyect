/**
 * Cliente HTTP mínimo sin dependencias externas (fetch nativo).
 *
 * - Token Bearer explícito por petición (nunca almacenado aquí).
 * - Errores tipificados con ApiError (status + bandera sesion_expirada)
 *   para que la UI distinga credenciales erróneas de sesión vencida.
 *
 * No almacena contraseñas, secretos 2FA ni tokens en localStorage;
 * el token de sesión vive únicamente en sessionStorage (AuthContext).
 */

export const API_BASE_URL: string = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8000/api'

export class ApiError extends Error {
  readonly status: number
  readonly sesionExpirada: boolean
  /** Marca de bloqueo de despliegue/seed (p. ej. 'SQL_NO_APLICADO'). */
  readonly bloqueo?: string

  constructor(mensaje: string, status: number, sesionExpirada = false, bloqueo?: string) {
    super(mensaje)
    this.name = 'ApiError'
    this.status = status
    this.sesionExpirada = sesionExpirada
    this.bloqueo = bloqueo
  }
}

export interface OpcionesPeticion {
  method?: 'GET' | 'POST' | 'PUT'
  body?: unknown
  token?: string | null
  signal?: AbortSignal
}

export async function apiRequest<T>(ruta: string, opciones: OpcionesPeticion = {}): Promise<T> {
  const encabezados: Record<string, string> = { Accept: 'application/json' }
  if (opciones.body !== undefined) encabezados['Content-Type'] = 'application/json'
  if (opciones.token) encabezados.Authorization = `Bearer ${opciones.token}`

  let respuesta: Response
  try {
    respuesta = await fetch(`${API_BASE_URL}${ruta}`, {
      method: opciones.method ?? 'GET',
      headers: encabezados,
      body: opciones.body !== undefined ? JSON.stringify(opciones.body) : undefined,
      signal: opciones.signal,
    })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Verifica tu conexión.', 0)
  }

  const texto = await respuesta.text()
  const datos: unknown = texto ? intentarParsear(texto) : null

  if (!respuesta.ok) {
    const cuerpo = (datos ?? {}) as { message?: unknown; sesion_expirada?: unknown; bloqueo?: unknown }
    const mensaje = typeof cuerpo.message === 'string' && cuerpo.message
      ? cuerpo.message
      : `Error ${respuesta.status}`
    throw new ApiError(
      mensaje,
      respuesta.status,
      cuerpo.sesion_expirada === true,
      typeof cuerpo.bloqueo === 'string' ? cuerpo.bloqueo : undefined,
    )
  }

  return datos as T
}

function intentarParsear(texto: string): unknown {
  try {
    return JSON.parse(texto) as unknown
  } catch {
    return texto
  }
}

/**
 * Descarga de archivos con el token (la ruta <a href> no permite headers):
 * obtiene el binario por fetch y dispara el guardado como archivo.
 */
export async function apiDescarga(token: string, ruta: string, nombreArchivo: string): Promise<void> {
  let respuesta: Response
  try {
    respuesta = await fetch(`${API_BASE_URL}${ruta}`, {
      headers: { Accept: 'application/pdf', Authorization: `Bearer ${token}` },
    })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Verifica tu conexión.', 0)
  }

  if (!respuesta.ok) {
    throw new ApiError(respuesta.status === 403 ? 'No tienes acceso al reporte.' : `Error ${respuesta.status}`, respuesta.status)
  }

  const blob = await respuesta.blob()
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreArchivo
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(url)
}
