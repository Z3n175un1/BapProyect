/** Tipos del flujo de autenticación con la API (FASE C). */

export interface EmpresaSesion {
  id: number
  razon_social: string | null
}

export type RolVisual = 'admin' | 'contador'

/** Usuario tal como lo consume la app; `role` es derivado (ver authApi). */
export interface UsuarioSesion {
  id: number
  name: string
  email: string
  /** Códigos de roles del backend (ADMINISTRADOR, CONTADOR, …). */
  roles: string[]
  role: RolVisual
  empresas: EmpresaSesion[]
  /** Debe cambiar la contraseña temporall de su cuenta nueva antes de continuar. */
  requiereCambioContrasena?: boolean
  /** Cuenta nueva con fila de seguridad pero TOTP sin activar (2FA pendiente). */
  totpPendiente?: boolean
  /** El segundo factor ya quedó activado. */
  totpConfigurado?: boolean
}

/** ¿El usuario aún debe completar la seguridad de su cuenta nueva? */
export function seguridadPendiente(usuario: UsuarioSesion): boolean {
  return usuario.requiereCambioContrasena === true || usuario.totpPendiente === true
}

/** Respuesta de sesión completa (login directo, 2FA o /auth/me). */
export interface SesionPayload {
  status: 'OK'
  token: string
  inactividad_minutos: number
  usuario: UsuarioSesion
  /** Slugs de módulos autorizados (dash, p. ej. 'usuarios-activos'). */
  modulos: string[]
}

/** El usuario tiene TOTP activo: falta el segundo factor. */
export interface TotpChallengePayload {
  status: 'TOTP_REQUERIDO'
  desafio: string
  expiracion_minutos: number
}

export type ResultadoInicioSesion = SesionPayload | TotpChallengePayload

/** Contratos crudos del backend (tal cual en AuthController::contextoSesion). */
export interface DtoSesion {
  status: 'OK'
  token: string
  inactividad_minutos: number
  usuario: {
    id: number
    name: string
    email: string
    roles: string[]
    empresas: EmpresaSesion[]
    requiere_cambio_contrasena: boolean
    totp_pendiente: boolean
    totp_configurado: boolean
  }
  modulos: string[]
}

export interface DtoDesafioTotp {
  status: 'TOTP_REQUERIDO'
  desafio: string
  expiracion_minutos: number
}

export interface RestablecerEntrada {
  correo: string
  token: string
  respuesta_secreta: string
  contrasena: string
  contrasena_confirmation: string
}
