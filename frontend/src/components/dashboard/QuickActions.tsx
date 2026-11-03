import Icon from '../ui/Icon'
import type { QuickAction } from '../../types/dashboard'

type QuickActionsProps = {
  actions: QuickAction[]
}

/** Accesos rápidos (Dynamics 365 POS-style). */
export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <section
      className="animate-slide-in-right rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy-100"
      style={{ animationDelay: '450ms' }}
    >
      <header>
        <h2 className="text-base font-bold text-navy-900">Accesos rápidos</h2>
        <p className="mt-0.5 text-sm text-navy-500">Operaciones del día a día</p>
      </header>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <a
            key={action.label}
            href={`#/${action.slug}`}
            className="group animate-fade-in-up flex flex-col items-start gap-2.5 rounded-xl border border-navy-100 bg-white p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-pineapple-300 hover:shadow-md hover:shadow-pineapple-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pineapple-500"
            style={{ animationDelay: `${500 + index * 70}ms` }}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-pineapple-300 transition-colors duration-300 group-hover:bg-pineapple-400 group-hover:text-navy-950">
              <Icon name={action.icon} className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold leading-tight text-navy-900">
                {action.label}
              </span>
              <span className="mt-0.5 block text-xs text-navy-400">{action.description}</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}
