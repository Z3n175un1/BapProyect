import { apiRequest, ApiError } from './http'

/**
 * FASE D/E — endpoints de catálogo/autorización de módulos.
 * Las respuestas provienen del backend (autorización real A06); el
 * frontend no simula estados ni permisos.
 */

export interface ModuloActivo {
  id: number
  codigo: string
  slug: string
  nombre: string
  descripcion: string | null
  estado: 'ACTIVO' | 'EN_DESARROLLO' | 'INACTIVO'
  habilitado: boolean
  origen: 'individual' | 'rol' | 'sin_acceso'
}

export interface ModuloIndividual {
  habilitado: boolean
  habilitado_en: string | null
  deshabilitado_en: string | null
  motivo: string | null
  cambiado_por: number | null
}

export interface ModuloDetalle extends ModuloActivo {
  individual: ModuloIndividual | null
}

export interface AdminAmbito {
  id: number
  razon_social: string
}

export interface AdminUsuarioListItem {
  id: number
  nombre_completo: string
  correo: string
  activo: boolean
  empresas_comunes: number
}

export interface HistorialCambio {
  modulo_codigo: string
  estado_anterior: boolean | null
  estado_nuevo: boolean
  motivo: string | null
  registrado_en: string
  administrador: string | null
}

class BloqueoError extends Error {
  readonly bloqueo: string

  constructor(mensaje: string, bloqueo: string) {
    super(mensaje)
    this.name = 'BloqueoError'
    this.bloqueo = bloqueo
  }
}

export { BloqueoError }

/** GET /modulos — catálogo completo con acceso del propio usuario. */
export async function listarCatalogo(token: string): Promise<ModuloActivo[]> {
  const datos = await apiRequest<{ modulos: ModuloActivo[] }>('/modulos', { token })
  return datos.modulos
}

/** GET /modulos/habilitados/{usuarioId} — vista admin de un usuario. */
export async function listarHabilitadosDe(
  token: string,
  usuarioId: number,
): Promise<{ usuario_id: number; modulos: ModuloDetalle[] }> {
  return apiRequest(`/modulos/habilitados/${usuarioId}`, { token })
}

/** GET /modulos/usuarios — usuarios del ámbito administrable del admin. */
export async function listarUsuarios(
  token: string,
  busqueda = '',
): Promise<{ ambito: AdminAmbito[]; usuarios: AdminUsuarioListItem[] }> {
  const parametro = busqueda ? `?busqueda=${encodeURIComponent(busqueda)}` : ''
  return apiRequest(`/modulos/usuarios${parametro}`, { token })
}

/** GET /modulos/historial/{usuarioId} — bitácora append-only. */
export async function listarHistorial(
  token: string,
  usuarioId: number,
): Promise<{ usuario_id: number; historial: HistorialCambio[] }> {
  return apiRequest(`/modulos/historial/${usuarioId}`, { token })
}

/** POST /modulos/habilitados — habilitar/deshabilitar con motivo. */
export async function cambiarEstado(
  token: string,
  entrada: {
    usuario_id: number
    modulo_codigo: string
    habilitado: boolean
    motivo?: string
  },
): Promise<{ message: string; habilitado: boolean }> {
  return apiRequest('/modulos/habilitados', {
    method: 'POST',
    token,
    body: entrada,
  })
}

/** Calcula la marca de bloqueo de despliegue/seed si el error la trae. */
export function bloqueoDe(error: unknown): string | null {
  if (error instanceof ApiError && error.bloqueo) return error.bloqueo
  return null
}
