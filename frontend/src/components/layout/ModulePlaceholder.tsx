import Icon from '../ui/Icon'
import type { ModuleLink, UserRole } from '../../types/dashboard'
import { HOME_ROUTE } from '../../utils/routes'
import { roleLabel } from '../../utils/format'

type ModulePlaceholderProps = {
  module: ModuleLink
}

/** Estado informativo para módulos aún no implementados. */
export default function ModulePlaceholder({ module }: ModulePlaceholderProps) {
  const statusStyle =
    module.status === 'Activo'
      ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
      : 'bg-pineapple-50 text-pineapple-700 ring-1 ring-pineapple-200'

  return (
    <section className="animate-blurred-fade-in flex min-h-[60vh] flex-col rounded-2xl border border-dashed border-navy-200 bg-white p-8 sm:p-10">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-navy-50 text-navy-400 ring-1 ring-navy-100">
          <Icon name={module.icon} className="h-9 w-9" />
        </span>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-navy-900">{module.label}</h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-navy-600">{module.description}</p>

        <span className={`mt-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest ${statusStyle}`}>
          <Icon name="clock" className="h-3.5 w-3.5" />
          {module.status}
        </span>

        <p className="mt-4 max-w-sm text-xs leading-relaxed text-navy-400">
          Este módulo se habilitará en una siguiente fase. La estructura de
          navegación, permisos y rutas ya está preparada.
        </p>
      </div>

      {module.features.length > 0 && (
        <div className="mx-auto mt-8 w-full max-w-xl">
          <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-widest text-navy-400">
            Alcance planificado
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {module.features.map((feature) => (
              <li
                key={feature.label}
                className="flex items-start gap-2.5 rounded-xl bg-navy-50/60 px-3.5 py-2.5 text-sm text-navy-700 ring-1 ring-navy-100"
              >
                <Icon
                  name={feature.status === 'Activo' ? 'check-circle' : 'clock'}
                  className={`mt-0.5 h-4 w-4 shrink-0 ${feature.status === 'Activo' ? 'text-emerald-500' : 'text-navy-300'}`}
                />
                <span>{feature.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto flex justify-center pt-8">
        <a
          href={HOME_ROUTE}
          className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-navy-800"
        >
          <Icon name="home" className="h-4 w-4" />
          Volver al inicio
        </a>
      </div>
    </section>
  )
}

/** Pantalla cuando el perfil autenticado no puede abrir el módulo. */
export function RestrictedModule({ module, role }: { module: ModuleLink; role: UserRole }) {
  return (
    <section className="animate-blurred-fade-in flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 bg-white p-10 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50 text-red-400 ring-1 ring-red-200">
        <Icon name="shield" className="h-9 w-9" />
      </span>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-navy-900">Acceso restringido</h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-navy-600">
        El módulo <strong className="text-navy-800">{module.label}</strong> no está habilitado
        para el perfil de {roleLabel(role)}.
      </p>
      <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-red-600 ring-1 ring-red-200">
        <Icon name="lock" className="h-3.5 w-3.5" />
        Sin permisos de acceso
      </span>
      <a
        href={HOME_ROUTE}
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-navy-800"
      >
        <Icon name="home" className="h-4 w-4" />
        Volver al inicio
      </a>
    </section>
  )
}
