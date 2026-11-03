import Icon from '../ui/Icon'
import { moduleSectionsForRole } from '../../data/navModules'
import { useAuth } from '../../context/AuthContext'
import { HOME_ROUTE, LANDING_ROUTE } from '../../utils/routes'
import { initialsOf, roleLabel } from '../../utils/format'
import logoNew from '../../assets/loadingspinner.png'

type SidebarProps = {
  collapsed: boolean
  mobileOpen: boolean
  activeSlug: string
  onToggleCollapse: () => void
  onCloseMobile: () => void
}

/** Navegación lateral (Workday-style) colapsable y adaptada a pantallas pequeñas. */
export default function Sidebar({
  collapsed,
  mobileOpen,
  activeSlug,
  onToggleCollapse,
  onCloseMobile,
}: SidebarProps) {
  const { user, logout } = useAuth()
  const role: 'admin' | 'contador' = user?.role ?? 'contador'
  const sections = moduleSectionsForRole(role)

  const handleLogout = () => {
    logout()
    onCloseMobile()
    window.location.hash = HOME_ROUTE
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-navy-950/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col bg-navy-950 text-navy-100 shadow-2xl shadow-navy-950/40 transition-all duration-300 lg:translate-x-0 lg:shadow-none ${
          collapsed ? 'lg:w-[76px]' : 'lg:w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Navegación principal"
      >
        <div
          className={`flex h-16 items-center gap-3 border-b border-white/10 px-4 ${
            collapsed ? 'lg:justify-center lg:px-0' : ''
          }`}
        >
          <span
            className={`flex h-10 shrink-0 items-center overflow-hidden rounded-xl bg-white px-2 shadow-md shadow-black/25 ${
              collapsed ? 'lg:px-0' : ''
            }`}
          >
            <img
              src={logoNew}
              alt="BAP SRL"
              className={`h-6 w-auto object-contain ${collapsed ? 'lg:h-9 lg:w-9 lg:object-cover' : ''}`}
              style={collapsed ? { objectPosition: '88% 50%' } : undefined}
            />
          </span>
          <div className={collapsed ? 'lg:hidden' : ''}>
            <p className="text-sm font-semibold leading-tight text-white">VisualGas</p>
            <p className="text-[10px] uppercase tracking-widest text-pineapple-400">BAP SRL</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {sections.map((group, groupIndex) => (
            <div key={group.section} className={groupIndex > 0 ? 'mt-4' : ''}>
              <div className="mb-1.5 px-3">
                <p className={`text-[10px] font-semibold uppercase tracking-widest text-navy-400 ${collapsed ? 'lg:hidden' : ''}`}>
                  {group.section}
                </p>
                <div className={`my-2 h-px bg-white/10 ${collapsed ? 'hidden lg:block' : 'hidden'}`} />
              </div>
              <ul className="space-y-1">
                {group.modules.map((module, index) => {
                  const active = module.slug === activeSlug
                  return (
                    <li
                      key={module.slug}
                      className="animate-fade-in-left"
                      style={{ animationDelay: `${(groupIndex * 3 + index) * 40}ms` }}
                    >
                      <a
                        href={module.slug === 'dashboard' ? HOME_ROUTE : `#/${module.slug}`}
                        onClick={onCloseMobile}
                        title={collapsed ? module.label : undefined}
                        aria-current={active ? 'page' : undefined}
                        className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                          active
                            ? 'bg-white/10 text-white shadow-inner shadow-white/5'
                            : 'text-navy-200 hover:bg-white/5 hover:text-white'
                        } ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-pineapple-400" />
                        )}
                        <Icon
                          name={module.icon}
                          className={`h-5 w-5 shrink-0 transition-colors duration-200 ${
                            active ? 'text-pineapple-300' : 'text-navy-300 group-hover:text-white'
                          }`}
                        />
                        <span className={`flex-1 ${collapsed ? 'lg:hidden' : ''}`}>{module.label}</span>
                        {module.status === 'En desarrollo' && (
                          <span
                            className={`shrink-0 rounded-full bg-pineapple-400/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-pineapple-300 ring-1 ring-pineapple-400/30 ${collapsed ? 'lg:hidden' : ''}`}
                            title="Módulo en desarrollo"
                          >
                            Pronto
                          </span>
                        )}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <a
            href={LANDING_ROUTE}
            onClick={onCloseMobile}
            className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-navy-200 transition-all duration-200 hover:bg-white/5 hover:text-white ${
              collapsed ? 'lg:justify-center lg:px-0' : ''
            }`}
            title={collapsed ? 'Sitio web corporativo' : undefined}
          >
            <Icon name="globe" className="h-5 w-5 shrink-0 text-navy-300" />
            <span className={collapsed ? 'lg:hidden' : ''}>Sitio corporativo</span>
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-navy-200 transition-all duration-200 hover:bg-white/5 hover:text-pineapple-300 ${
              collapsed ? 'lg:justify-center lg:px-0' : ''
            }`}
            title={collapsed ? 'Cerrar sesión' : undefined}
          >
            <Icon name="log-out" className="h-5 w-5 shrink-0" />
            <span className={collapsed ? 'lg:hidden' : ''}>Cerrar sesión</span>
          </button>

          {user && (
            <div
              className={`mt-3 flex items-center gap-3 rounded-xl bg-white/5 p-2 ${
                collapsed ? 'lg:hidden' : ''
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pineapple-400 text-sm font-bold text-navy-950">
                {initialsOf(user.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-white">{user.name}</p>
                <p className="truncate text-[10px] text-navy-300">{roleLabel(user.role)}</p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            className="mt-3 hidden w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-navy-300 transition-colors duration-200 hover:bg-white/5 hover:text-white lg:flex"
            aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
          >
            <Icon name="chevrons-left" className={`h-4 w-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
            {!collapsed && <span>Contraer</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
