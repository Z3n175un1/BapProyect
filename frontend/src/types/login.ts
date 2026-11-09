import type { LoginCredentials } from '../types'

export type LoginFormValues = LoginCredentials & { rememberMe: boolean }

export type LoginFormErrors = {
  email?: string
  password?: string
}

export type LoginStatus = 'idle' | 'loading' | 'error' | 'success' | 'totp'
