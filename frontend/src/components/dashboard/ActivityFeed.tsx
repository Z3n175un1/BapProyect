import Icon from '../ui/Icon'
import { activityItems } from '../../data/activityFeed'

/** Feed de actividad reciente (NetSuite-style). */
export default function ActivityFeed() {
  const activityStyles: Record<string, string> = {
    venta: 'bg-emerald-50 text-emerald-600',
    cliente: 'bg-navy-50 text-navy-700',
    producto: 'bg-sky-50 text-sky-700',
    transaccion: 'bg-pineapple-50 text-pineapple-600',
    alerta: 'bg-red-50 text-red-600',
  }

  return (
    <section
      className="animate-fade-in-up rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy-100 sm:p-6"
      style={{ animationDelay: '600ms' }}
    >
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-navy-900">Actividad reciente</h2>
          <p className="mt-0.5 text-sm text-navy-500">Últimos movimientos del sistema</p>
        </div>
        <a
          href="#/transacciones"
          className="text-xs font-semibold text-navy-500 transition-colors duration-150 hover:text-pineapple-600"
        >
          Ver todo
        </a>
      </header>

      <ul className="mt-5 space-y-4">
        {activityItems.map((item) => (
          <li key={item.id} className="group flex gap-3.5">
            <span
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-navy-50 transition-transform duration-200 group-hover:scale-105 ${activityStyles[item.type] ?? 'bg-navy-50 text-navy-600'}`}
            >
              <Icon name={item.icon} className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-navy-900">{item.description}</p>
              <p className="mt-0.5 truncate text-xs text-navy-500">{item.detail}</p>
            </div>
            <span className="ml-auto shrink-0 text-[10px] font-medium uppercase tracking-wide text-navy-300">
              {item.time}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
