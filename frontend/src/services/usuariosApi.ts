import { apiRequest } from './http'

/**
 * FASE F — endpoints del módulo `usuarios_activos`: listado, creación de
 * cuentas nuevas (contraseña temporal + 2FA pendiente), edición y baja.
 * El backend aplica el ámbito A07 (sólo usuarios de las empresas del admin).
 */

export interface UsuarioActivoItem {
  id: number
  nombre_completo: string
  correo: string
  activo: boolean
  requiere_cambio_contrasena: boolean
  roles: string[]
  empresas: string[]
  ultimo_acceso_en: string | null
  creado_en: string
}

export interface ListadoUsuarios {
  total: number
  usuarios: UsuarioActivoItem[]
}

export interface RolCatalogoItem {
  codigo: string
  nombre: string
  descripcion: string | null
}

export interface UsuarioNuevo {
  usuario: { id: number; nombre_completo: string; correo: string; rol: string }
  /** Única vez: contraseña temporal y elementos de 2FA para entregar/compartir. */
  contrasena_temporal: string
  codigos_respaldo: string[]
  secreto_totp: string
  message: string
}

/** GET /usuarios-activos — usuarios del ámbito del administrador. */
export async function listarUsuarios(token: string, busqueda?: string): Promise<ListadoUsuarios> {
  const ruta = busqueda && busqueda.trim()
    ? `/usuarios-activos?busqueda=${encodeURIComponent(busqueda.trim())}`
    : '/usuarios-activos'
  return apiRequest<ListadoUsuarios>(ruta, { token })
}

/** GET /usuarios-activos/roles — catálogo para selector. */
export async function listarRoles(token: string): Promise<RolCatalogoItem[]> {
  const datos = await apiRequest<{ roles: RolCatalogoItem[] }>('/usuarios-activos/roles', { token })
  return datos.roles
}

/** POST /usuarios-activos — crea la cuenta (devuelve secretos una sola vez). */
export function crearUsuario(
  token: string,
  entrada: { nombre_completo: string; correo: string; rol_codigo: string },
): Promise<UsuarioNuevo> {
  return apiRequest<UsuarioNuevo>('/usuarios-activos', { method: 'POST', token, body: entrada })
}

/** PUT /usuarios-activos/{id} — edición parcial (nombre/correo/rol). */
export function editarUsuario(
  token: string,
  usuarioId: number,
  cambios: { nombre_completo?: string; correo?: string; rol_codigo?: string },
): Promise<string> {
  return apiRequest<{ message: string }>(`/usuarios-activos/${usuarioId}`, {
    method: 'PUT',
    token,
    body: cambios,
  }).then((r) => r.message)
}

/** POST /usuarios-activos/{id}/estado — dar de baja / reactivar. */
export function cambiarEstadoUsuario(token: string, usuarioId: number, activo: boolean): Promise<string> {
  return apiRequest<{ message: string }>(`/usuarios-activos/${usuarioId}/estado`, {
    method: 'POST',
    token,
    body: { activo },
  }).then((r) => r.message)
}
