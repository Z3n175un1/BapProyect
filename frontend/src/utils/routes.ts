/** Rutas base de la aplicación (hash routing). */
export const HOME_ROUTE = '#/'
export const LOGIN_ROUTE = '#/login'
export const LANDING_ROUTE = '#/landing'
export const RECOVER_ROUTE = '#/recuperar-contrasena'

export function navigate(route: string): void {
  window.location.hash = route
}
