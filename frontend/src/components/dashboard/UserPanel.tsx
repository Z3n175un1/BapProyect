import Icon from '../ui/Icon'
import { useAuth } from '../../context/AuthContext'
import { LOGIN_ROUTE, LANDING_ROUTE } from '../../utils/routes'
import { initialsOf, roleLabel } from '../../utils/format'

/** Panel de información del usuario autenticado (Workday-style). */
export default function UserPanel() {
  const { user, logout } = useAuth()

  if (!user) return null

  const handleLogout = () => {
    logout()
    window.location.hash = LOGIN_ROUTE
  }

  return (
    <section
      className="animate-slide-in-right overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy-100"
      style={{ animationDelay: '250ms' }}
    >
      <header className="relative bg-navy-950 px-5 pb-14 pt-5">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          aria-hidden="true"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        <div className="relative">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-pineapple-300">
            Mi cuenta
          </p>
          <h2 className="mt-1 text-base font-bold text-white">Ficha del usuario</h2>
        </div>
      </header>

      <div className="px-5 pb-5">
        <div className="-mt-10 flex items-end justify-between">
          <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-pineapple-400 text-2xl font-bold text-navy-950 shadow-lg ring-4 ring-white">
            {initialsOf(user.name)}
          </span>
          <span className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-200">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Cuenta activa
          </span>
        </div>

        <h3 className="mt-3 text-lg font-bold text-navy-950">{user.name}</h3>
        <p className="text-sm text-navy-500">{user.position}</p>

        <dl className="mt-5 space-y-3 border-t border-navy-50 pt-4 text-sm">
          <div className="flex items-center gap-3">
            <Icon name="briefcase" className="h-4 w-4 shrink-0 text-navy-300" />
            <dt className="sr-only">Departamento</dt>
            <dd className="min-w-0 font-medium text-navy-800">{user.department}</dd>
          </div>
          <div className="flex items-center gap-3">
            <Icon name="mail" className="h-4 w-4 shrink-0 text-navy-300" />
            <dt className="sr-only">Correo electrónico</dt>
            <dd className="min-w-0 truncate text-navy-800">{user.email}</dd>
          </div>
          <div className="flex items-center gap-3">
            <Icon name="shield" className="h-4 w-4 shrink-0 text-navy-300" />
            <dt className="sr-only">Rol</dt>
            <dd className="font-medium text-navy-800">
              Rol del sistema: <span className="text-pineapple-600">{roleLabel(user.role)}</span>
            </dd>
          </div>
          <div className="flex items-center gap-3">
            <Icon name="calendar" className="h-4 w-4 shrink-0 text-navy-300" />
            <dt className="sr-only">Miembro desde</dt>
            <dd className="text-navy-800">Miembro desde {user.memberSince}</dd>
          </div>
        </dl>

        <nav className="mt-5 space-y-1 border-t border-navy-50 pt-4" aria-label="Accesos del perfil">
          <a
            href="#/configuracion"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-navy-700 transition-colors duration-200 hover:bg-navy-50"
          >
            <Icon name="settings" className="h-4 w-4 text-navy-400" />
            Preferencias y permisos
          </a>
          <a
            href="#/recuperar-contrasena"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-navy-700 transition-colors duration-200 hover:bg-navy-50"
          >
            <Icon name="clock" className="h-4 w-4 text-navy-400" />
            Cambiar contraseña
          </a>
          <a
            href={LANDING_ROUTE}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-navy-700 transition-colors duration-200 hover:bg-navy-50"
          >
            <Icon name="globe" className="h-4 w-4 text-navy-400" />
            Sitio corporativo
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition-colors duration-200 hover:bg-red-50"
          >
            <Icon name="log-out" className="h-4 w-4" />
            Cerrar sesión
          </button>
        </nav>
      </div>
    </section>
  )
}
