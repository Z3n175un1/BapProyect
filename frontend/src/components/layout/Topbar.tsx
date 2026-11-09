import { useState, useMemo, type FormEvent } from 'react'
import Icon from '../ui/Icon'
import { notificationItems } from '../../data/notifications'
import { modulesFor } from '../../data/navModules'
import { useAuth } from '../../context/AuthContext'
import type { NotificationItem } from '../../types/dashboard'
import { HOME_ROUTE, LOGIN_ROUTE, LANDING_ROUTE } from '../../utils/routes'
import { initialsOf, roleLabel } from '../../utils/format'
import logoNewUrl from '../../assets/logo.new.png'

type TopbarProps = {
  onMenuClick: () => void
}

/** Barra superior (NetSuite-style): identidad, búsqueda global y accesos. */
export default function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-navy-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="flex h-16 items-center gap-2 px-3 sm:gap-4 sm:px-5">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir navegación"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-navy-700 transition-colors duration-200 hover:bg-navy-50 lg:hidden"
        >
          <Icon name="menu" />
        </button>

        <a href={HOME_ROUTE} className="flex shrink-0 items-center gap-2.5">
          <img
            src={logoNewUrl}
            alt="BAP SRL"
            className="h-7 w-auto object-contain"
          />
          <span className="hidden truncate text-sm font-bold text-navy-900 md:block">
            Visual<span className="text-pineapple-600">Gas</span>
          </span>
        </a>

        <SearchBar />

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <NotificationsMenu />
          <a
            href="#/configuracion"
            title="Configuración"
            aria-label="Configuración"
            className="hidden h-10 w-10 items-center justify-center rounded-xl text-navy-600 transition-colors duration-200 hover:bg-navy-50 sm:flex"
          >
            <Icon name="settings" />
          </a>
          <span className="hidden h-6 w-px bg-navy-100 sm:block" />
          <ProfileMenu />
        </div>
      </div>
    </header>
  )
}

function SearchBar() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const { modulos } = useAuth()
  /* Búsqueda limitada a los módulos efectivos emitidos por el backend. */
  const allowed = modulesFor(modulos)

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return allowed
    return allowed.filter((m) => m.label.toLowerCase().includes(normalized))
  }, [query, allowed])

  const navigateTo = (slug: string) => {
    window.location.hash = slug === 'dashboard' ? HOME_ROUTE : `#/${slug}`
    setQuery('')
    setOpen(false)
  }

  const onInput = (value: string) => {
    setQuery(value)
    setOpen(true)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (results[0]) navigateTo(results[0].slug)
  }

  return (
    <div className="relative hidden flex-1 sm:mx-4 sm:block lg:max-w-md">
      <form onSubmit={handleSubmit} role="search">
        <Icon name="search" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
        <input
          type="search"
          value={query}
          placeholder="Buscar módulo…"
          aria-label="Buscar módulo"
          onFocus={() => setOpen(true)}
          onChange={(event) => onInput(event.target.value)}
          className="w-full rounded-xl border border-navy-100 bg-neutral-100/80 py-2.5 pl-10 pr-4 text-sm text-navy-900 outline-none transition-all duration-200 placeholder:text-navy-300 focus:border-pineapple-300 focus:bg-white focus:ring-2 focus:ring-pineapple-200"
        />
      </form>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
          />
          <div className="absolute z-20 mt-2 w-full animate-slide-in-top overflow-hidden rounded-xl border border-navy-100 bg-white shadow-xl shadow-navy-900/10">
            {results.length > 0 ? (
              <ul className="max-h-72 overflow-y-auto p-1.5">
                {results.map((module) => (
                  <li key={module.slug}>
                    <button
                      type="button"
                      onClick={() => navigateTo(module.slug)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-navy-800 transition-colors duration-150 hover:bg-navy-50"
                    >
                      <Icon name={module.icon} className="h-4 w-4 text-navy-400" />
                      {module.label}
                      <Icon name="arrow-right" className="ml-auto h-3.5 w-3.5 text-navy-200" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-3 text-sm text-navy-500">Sin resultados para «{query}».</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function NotificationsMenu() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationItem[]>(notificationItems)
  const unread = items.filter((item) => !item.read).length

  const markAllRead = () => setItems((current) => current.map((item) => ({ ...item, read: true })))
  const markRead = (id: string) =>
    setItems((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)))

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Notificaciones"
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-navy-600 transition-colors duration-200 hover:bg-navy-50"
      >
        <Icon name="bell" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-pineapple-500 px-0.5 text-[10px] font-bold text-navy-950 ring-2 ring-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
          />
          <section
            role="dialog"
            aria-label="Notificaciones"
            className="absolute right-0 z-20 mt-2 w-80 max-w-[calc(100vw-1.5rem)] animate-slide-in-top overflow-hidden rounded-xl border border-navy-100 bg-white shadow-xl shadow-navy-900/10"
          >
            <header className="flex items-center justify-between border-b border-navy-50 px-4 py-3">
              <h2 className="text-sm font-semibold text-navy-900">Notificaciones</h2>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs font-semibold text-navy-500 transition-colors duration-150 hover:text-pineapple-600"
                >
                  Marcar todas como leídas
                </button>
              )}
            </header>
            <ul className="max-h-80 overflow-y-auto">
              {items.map((item) => (
                <li key={item.id} className="border-b border-navy-50 last:border-0">
                  <button
                    type="button"
                    onClick={() => markRead(item.id)}
                    className={`flex w-full gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-navy-50 ${
                      item.read ? 'opacity-60' : ''
                    }`}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-600">
                      <Icon name={item.icon} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-navy-900">{item.title}</span>
                        {!item.read && <span className="h-2 w-2 shrink-0 rounded-full bg-pineapple-500" />}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-navy-600">{item.message}</span>
                      <span className="mt-1 block text-[10px] font-medium uppercase tracking-wider text-navy-300">
                        {item.time}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}

function ProfileMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    window.location.hash = LOGIN_ROUTE
  }

  if (!user) return null

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-xl p-1.5 pr-2 transition-colors duration-200 hover:bg-navy-50"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pineapple-400 text-sm font-bold text-navy-950 ring-2 ring-white">
          {initialsOf(user.name)}
        </span>
        <span className="hidden text-left md:block">
          <span className="block max-w-[140px] truncate text-sm font-semibold leading-tight text-navy-900">
            {user.name}
          </span>
          <span className="block max-w-[140px] truncate text-[10px] uppercase tracking-wider text-navy-400">
            {roleLabel(user.role)}
          </span>
        </span>
        <Icon
          name="chevron-down"
          className={`hidden h-4 w-4 text-navy-400 transition-transform duration-200 md:block ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-64 max-w-[calc(100vw-1.5rem)] animate-slide-in-top overflow-hidden rounded-xl border border-navy-100 bg-white shadow-xl shadow-navy-900/10">
            <div className="flex items-center gap-3 border-b border-navy-50 px-4 py-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-pineapple-300">
                {initialsOf(user.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-navy-900">{user.name}</p>
                <p className="truncate text-xs text-navy-500">{user.email}</p>
              </div>
            </div>
            <div className="p-1.5">
              <a
                href="#/configuracion"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-navy-800 transition-colors duration-150 hover:bg-navy-50"
              >
                <Icon name="settings" className="h-4 w-4 text-navy-400" />
                Configuración
              </a>
              <a
                href={LANDING_ROUTE}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-navy-800 transition-colors duration-150 hover:bg-navy-50"
              >
                <Icon name="globe" className="h-4 w-4 text-navy-400" />
                Sitio corporativo
              </a>
            </div>
            <div className="border-t border-navy-50 p-1.5">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors duration-150 hover:bg-red-50"
              >
                <Icon name="log-out" className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
