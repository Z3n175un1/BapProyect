import { useSyncExternalStore } from 'react'

export type Route = string

function subscribe(callback: () => void) {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}

function getSnapshot(): Route {
  return window.location.hash.replace(/^#\/?/, '')
}

/** Rutas basadas en hash (#/login). Evita añadir dependencias de router. */
export default function useHashRoute(): Route {
  return useSyncExternalStore(subscribe, getSnapshot)
}
