import { useCallback, useState, type ChangeEvent, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
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
 * Lógica del formulario de autenticación (fase mock).
 * La comprobación la realiza AuthContext; aquí se orquestan estados y
 * validaciones, manteniendo separada la presentación visual.
 */
export default function useLoginForm(onSubmitClick: () => void) {
  const { login } = useAuth()
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (status === 'loading' || status === 'success') return

    const validationErrors = validate(values)
    setErrors(validationErrors)
    if (validationErrors.email || validationErrors.password) {
      setSubmitAttempt((attempt) => attempt + 1)
      return
    }

    onSubmitClick()
    setStatus('loading')

    // Simulación de latencia de red (fase mock). Más adelante se sustituye
    // por una llamada real a la API sin tocar la presentación.
    window.setTimeout(() => {
      const email = values.email.trim().toLowerCase()
      const success = login({ email, password: values.password })
      if (success) {
        if (values.rememberMe) {
          window.localStorage.setItem(LAST_EMAIL_KEY, email)
        } else {
          window.localStorage.removeItem(LAST_EMAIL_KEY)
        }
        setStatus('success')
      } else {
        setStatus('error')
        setSubmitAttempt((attempt) => attempt + 1)
      }
    }, 900)
  }

  return {
    values,
    errors,
    status,
    showPassword,
    submitAttempt,
    updateField,
    handleBlur,
    handleSubmit,
    toggleShowPassword,
    updateRememberMe,
  }
}
