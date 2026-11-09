import { apiRequest } from './http'
import type {
  DtoDesafioTotp,
  DtoSesion,
  ResultadoInicioSesion,
  RestablecerEntrada,
  SesionPayload,
} from '../types/auth'

/** Almacenes de la API de autenticación (rutas alineadas con routes/api.php). */

type DtoAuth = DtoSesion | DtoDesafioTotp

/** POST /auth/login — 'OK' con sesión o 'TOTP_REQUERIDO' con desafío. */
export async function iniciarSesion(correo: string, contrasena: string): Promise<ResultadoInicioSesion> {
  const dto = await apiRequest<DtoAuth>('/auth/login', {
    method: 'POST',
    body: { correo, contrasena },
  })
  return dto.status === 'TOTP_REQUERIDO' ? dto : aSesionPayload(dto as DtoSesion)
}

/** POST /auth/2fa — consume el desafío y devuelve la sesión completa. */
export async function verificar2FA(desafio: string, codigo: string): Promise<SesionPayload> {
  const dto = await apiRequest<DtoSesion>('/auth/2fa', {
    method: 'POST',
    body: { desafio, codigo },
  })
  return aSesionPayload(dto)
}

/** GET /auth/me — revalida el token tras recargar la página. */
export async function yo(token: string): Promise<SesionPayload> {
  const dto = await apiRequest<DtoSesion>('/auth/me', { token })
  return aSesionPayload(dto)
}

/** POST /auth/logout — revoca el token en el backend (mejor esfuerzo). */
export async function cerrarSesion(token: string): Promise<void> {
  try {
    await apiRequest('/auth/logout', { method: 'POST', token })
  } catch {
    /* Si el token ya expiró, el logout local igualmente limpia el estado. */
  }
}

/** POST /auth/perfil — actualiza nombre visible y/o correo de la cuenta propia. */
export async function actualizarPerfil(
  token: string,
  cambios: { nombre_completo?: string; correo?: string },
): Promise<DtoSesion['usuario']> {
  const datos = await apiRequest<{ message: string; usuario: DtoSesion['usuario'] }>('/auth/perfil', {
    method: 'POST',
    token,
    body: cambios,
  })
  return datos.usuario
}

/** POST /auth/cambiar-contrasena — valida la actual y revoca las demás sesiones. */
export async function cambiarContrasena(token: string, actual: string, nueva: string): Promise<string> {
  const datos = await apiRequest<{ message: string }>('/auth/cambiar-contrasena', {
    method: 'POST',
    token,
    body: { actual, nueva, confirmacion: nueva },
  })
  return datos.message
}

/** POST /auth/recuperar/solicitar — respuesta sin enumeración de cuentas. */
export function solicitarRecuperacion(correo: string): Promise<void> {
  return apiRequest('/auth/recuperar/solicitar', {
    method: 'POST',
    body: { correo },
  })
}

/** POST /auth/recuperar/restablecer — token + respuesta secreta + nueva clave. */
export function restablecerContrasena(entrada: RestablecerEntrada): Promise<void> {
  return apiRequest('/auth/recuperar/restablecer', {
    method: 'POST',
    body: entrada,
  })
}

function aSesionPayload(dto: DtoSesion): SesionPayload {
  return {
    status: 'OK',
    token: dto.token,
    inactividad_minutos: dto.inactividad_minutos,
    usuario: {
      id: dto.usuario.id,
      name: dto.usuario.name,
      email: dto.usuario.email,
      roles: dto.usuario.roles,
      empresas: dto.usuario.empresas,
      /* Transición hacia FASE D: filtro mock del menú por primer rol
         backend; será sustituido por modulos[] reales del backend. */
      role: dto.usuario.roles.includes('ADMINISTRADOR') ? 'admin' : 'contador',
      requiereCambioContrasena: dto.usuario.requiere_cambio_contrasena === true,
      totpPendiente: dto.usuario.totp_pendiente === true,
      totpConfigurado: dto.usuario.totp_configurado === true,
    },
    modulos: dto.modulos,
  }
}

/* ---------------------------------------------------------------------- */
/* 2FA de configuración de cuenta (FASE F)                                 */
/* ---------------------------------------------------------------------- */

/** Resultado de preparar el segundo factor. */
export interface Setup2FA {
  secreto: string
  otpauth_uri: string
}

/** POST /auth/2fa/preparar — secreto + URI otpauth para escanear/manual. */
export async function preparar2FA(token: string): Promise<Setup2FA> {
  return apiRequest<Setup2FA>('/auth/2fa/preparar', { method: 'POST', token })
}

/** POST /auth/2fa/activar — valida el código y habilita el segundo factor. */
export async function activar2FA(token: string, codigo: string): Promise<string> {
  const datos = await apiRequest<{ message: string }>('/auth/2fa/activar', {
    method: 'POST',
    token,
    body: { codigo },
  })
  return datos.message
}
