import { apiRequest } from './http'

/**
 * FASE F — endpoint del módulo `respaldos` (registro informativo de backups).
 * Datos reales del backend (test.respaldos); el frontend no simula estados.
 */

export type EstadoRespaldo = 'EXITOSO' | 'FALLIDO' | 'EN_PROCESO'

export interface RespaldoItem {
  id: number
  nombre: string
  descripcion: string | null
  tamano_bytes: number
  estado: EstadoRespaldo
  respaldado_en: string
}

export interface RespaldosListado {
  total: number
  respaldos: RespaldoItem[]
}

/** GET /respaldos — historial de respaldos del sistema (ordenado por fecha). */
export async function listarRespaldos(token: string, busqueda?: string): Promise<RespaldosListado> {
  const ruta = busqueda && busqueda.trim()
    ? `/respaldos?busqueda=${encodeURIComponent(busqueda.trim())}`
    : '/respaldos'
  return apiRequest<RespaldosListado>(ruta, { token })
}
