import { useCallback, useState, type ChangeEvent, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../services/http'
import * as authApi from '../services/authApi'
import type { TotpChallengePayload } from '../types/auth'
import type { LoginFormErrors, LoginFormValues, LoginStatus } from '../types/login'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6
const LAST_EMAIL_KEY = 'login:last-email'

export function validateEmail(email: string): string | undefined {
  const trimmed = email.trim()
  if (!trimmed) return 'Ingresa tu correo electrónico.'
  if (!EMAIL_REGEX.test(trimmed)) return 'El formato del correo no es válido.'
  return undefined
}

function validate(values: LoginFormValues): LoginFormErrors {
  const errors: LoginFormErrors = {}
  const emailError = validateEmail(values.email)
  if (emailError) errors.email = emailError
  if (!values.password) {
    errors.password = 'Ingresa tu contraseña.'
  } else if (values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres.'
  }
  return errors
}

/**
 * Flujo real de autenticación contra la API (FASE C):
 * validar → POST /auth/login → si TOTP está activo queda pendiente
 * verificarDesafio2FA() → aplicarSesion() en AuthContext.
 *
 * El password y los códigos 2FA NO se persisten en ningún storage; solo el
 * correo queda recordado (last.email) si el usuario lo pide.
 */
export default function useLoginForm(onSubmitClick: () => void) {
  const { aplicarSesion } = useAuth()
  const [values, setValues] = useState<LoginFormValues>(() => {
    const rememberedEmail = window.localStorage.getItem(LAST_EMAIL_KEY)
    return {
      email: rememberedEmail ?? '',
      password: '',
      rememberMe: Boolean(rememberedEmail),
    }
  })
  const [errors, setErrors] = useState<LoginFormErrors>({})
  const [status, setStatus] = useState<LoginStatus>('idle')
  const [submitAttempt, setSubmitAttempt] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  /** Desafío TOTP pendiente (solo en memoria; expira en ~5 min en el API). */
  const [desafioTotp, setDesafioTotp] = useState<TotpChallengePayload | null>(null)
  const [mensajeServidor, setMensajeServidor] = useState<string | undefined>()
  const [verificando2fa, setVerificando2fa] = useState(false)

  const marcarError = useCallback((mensaje: string) => {
    setMensajeServidor(mensaje)
    setStatus('error')
    setSubmitAttempt((attempt) => attempt + 1)
  }, [])

  const updateField =
    (field: 'email' | 'password') =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      setValues((current) => ({ ...current, [field]: value }))
      setErrors((current) => {
        if (current[field]) {
          return { ...current, [field]: undefined }
        }
        return current
      })
      if (status === 'error') setStatus('idle')
    }

  const handleBlur = (field: 'email' | 'password') => () => {
    const fieldError = validate(values)[field]
    if (fieldError) {
      setErrors((current) => ({ ...current, [field]: fieldError }))
    }
  }

  const toggleShowPassword = useCallback(() => {
    setShowPassword((visible) => !visible)
  }, [])

  const updateRememberMe = useCallback((checked: boolean) => {
    setValues((current) => ({ ...current, rememberMe: checked }))
  }, [])

  const recordarCorreo = () => {
    const correo = values.email.trim().toLowerCase()
    if (values.rememberMe) {
      window.localStorage.setItem(LAST_EMAIL_KEY, correo)
    } else {
      window.localStorage.removeItem(LAST_EMAIL_KEY)
    }
  }

  /** Paso 1: credenciales (correo + contraseña). */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (status === 'loading' || status === 'success' || verificando2fa) return

    const validationErrors = validate(values)
    setErrors(validationErrors)
    if (validationErrors.email || validationErrors.password) {
      setSubmitAttempt((attempt) => attempt + 1)
      return
    }

    onSubmitClick()
    setStatus('loading')
    setMensajeServidor(undefined)

    try {
      const resultado = await authApi.iniciarSesion(
        values.email.trim().toLowerCase(),
        values.password,
      )

      if (resultado.status === 'TOTP_REQUERIDO') {
        setDesafioTotp(resultado)
        setStatus('totp')
        return
      }

      recordarCorreo()
      aplicarSesion(resultado)
      setStatus('success')
    } catch (error) {
      marcarError(
        error instanceof ApiError
          ? error.message
          : 'No se pudo procesar la solicitud. Intenta de nuevo.',
      )
    }
  }

  /** Paso 2 (solo si TOTP está activo): verificar el código de 6 dígitos. */
  const verificarDesafio2FA = async (codigo: string) => {
    if (!desafioTotp || status !== 'totp' || verificando2fa) return

    setVerificando2fa(true)
    setMensajeServidor(undefined)

    try {
      const payload = await authApi.verificar2FA(desafioTotp.desafio, codigo)
      recordarCorreo()
      setDesafioTotp(null)
      aplicarSesion(payload)
      setStatus('success')
    } catch (error) {
      marcarError(
        error instanceof ApiError
          ? error.message
          : 'No se pudo verificar el código. Intenta de nuevo.',
      )
      if (error instanceof ApiError && error.status === 401) {
        /* El desafío expiró o fue consumido: volver al paso de credenciales. */
        setDesafioTotp(null)
        setStatus('idle')
      }
    } finally {
      setVerificando2fa(false)
    }
  }

  /** Volver del paso TOTP a credenciales (descarta el desafío en memoria). */
  const cancelarTotp = useCallback(() => {
    setDesafioTotp(null)
    setMensajeServidor(undefined)
    setStatus('idle')
  }, [])

  return {
    values,
    errors,
    status,
    showPassword,
    submitAttempt,
    mensajeServidor,
    desafioTotp,
    verificando2fa,
    updateField,
    handleBlur,
    handleSubmit,
    toggleShowPassword,
    updateRememberMe,
    verificarDesafio2FA,
    cancelarTotp,
  }
}
