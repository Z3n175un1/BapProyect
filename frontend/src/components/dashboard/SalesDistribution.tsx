import { salesDistribution } from '../../data/salesData'
import { formatCurrency } from '../../utils/format'

const RADIUS = 21
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** Distribución de ventas por línea de negocio (donut SVG sin librerías). */
export default function SalesDistribution() {
  let offset = 0

  return (
    <section
      className="animate-fade-in-up rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy-100 sm:p-6"
      style={{ animationDelay: '400ms' }}
    >
      <header>
        <h2 className="text-base font-bold text-navy-900">Distribución de ventas</h2>
        <p className="mt-0.5 text-sm text-navy-500">Por línea de negocio, del período actual</p>
      </header>

      <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row">
        <div className="relative shrink-0" role="img" aria-label="Distribución de ventas por línea de negocio">
          <svg viewBox="0 0 100 100" className="-rotate-90">
            {salesDistribution.map((slice) => {
              const length = (slice.share / 100) * CIRCUMFERENCE
              const circle = (
                <circle
                  key={slice.label}
                  cx="50"
                  cy="50"
                  r={RADIUS}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth="11"
                  strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                  strokeDashoffset={-offset}
                  className="transition-all duration-500 hover:brightness-110"
                />
              )
              offset += length
              return circle
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-navy-950">45%</span>
            <span className="text-[10px] uppercase tracking-wider text-navy-400">Contables</span>
          </div>
        </div>

        <ul className="w-full space-y-2.5">
          {salesDistribution.map((slice) => (
            <li key={slice.label} className="flex items-center gap-3 text-sm">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
              <span className="min-w-0 flex-1 truncate text-navy-700">{slice.label}</span>
              <span className="text-xs font-semibold text-navy-950">{slice.share}%</span>
              <span className="hidden text-xs text-navy-400 md:inline">{formatCurrency(slice.value)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
