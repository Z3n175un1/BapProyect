import { useId } from 'react'
import Icon from '../ui/Icon'
import { performanceSeries } from '../../data/salesData'
import { formatCompactCurrency } from '../../utils/format'

const WIDTH = 560
const HEIGHT = 180
const PADDING = 10

/** Rendimiento comercial semanal (gráfico de área SVG). */
export default function PerformanceChart() {
  const gradientId = useId()

  const max = Math.max(...performanceSeries.map((point) => point.value))
  const stepX = (WIDTH - PADDING * 2) / (performanceSeries.length - 1)

  const coordinates = performanceSeries.map((point, index) => {
    const x = PADDING + index * stepX
    const y = HEIGHT - PADDING - (point.value / max) * (HEIGHT - PADDING * 2)
    return { x, y, ...point }
  })

  const line = coordinates.map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const area = `${line} L ${coordinates[coordinates.length - 1].x} ${HEIGHT - PADDING} L ${PADDING} ${HEIGHT - PADDING} Z`
  const last = coordinates[coordinates.length - 1]

  return (
    <section
      className="animate-fade-in-up rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy-100 sm:p-6"
      style={{ animationDelay: '500ms' }}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-navy-900">Rendimiento comercial</h2>
          <p className="mt-0.5 text-sm text-navy-500">Ventas por semana · últimas 8 semanas</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
          <Icon name="trending-up" className="h-3 w-3" />
          Tendencia positiva
        </span>
      </header>

      <div className="relative mt-5">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-44 w-full text-pineapple-500"
          preserveAspectRatio="none"
          role="img"
          aria-label="Rendimiento comercial semanal"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffc400" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ffc400" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75].map((fraction) => (
            <line
              key={fraction}
              x1={PADDING}
              x2={WIDTH - PADDING}
              y1={PADDING + fraction * (HEIGHT - PADDING * 2)}
              y2={PADDING + fraction * (HEIGHT - PADDING * 2)}
              stroke="#dce6f2"
              strokeDasharray="4 6"
            />
          ))}

          <path d={area} fill={`url(#${gradientId})`} />
          <path d={line} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <circle cx={last.x} cy={last.y} r="6" fill="currentColor" stroke="#fff" strokeWidth="3" />
        </svg>

        <div
          className="absolute -translate-y-1/2 rounded-lg bg-white px-2 py-1 text-xs font-bold text-navy-950 shadow ring-1 ring-navy-100"
          style={{ left: `${(last.x / WIDTH) * 100}%`, top: `${(last.y / HEIGHT) * 100}%` }}
        >
          {last.value} mil Bs
        </div>
      </div>

      <footer className="mt-3 flex justify-between border-t border-navy-50 pt-3 text-[10px] font-medium text-navy-400 sm:text-xs">
        {performanceSeries.map((point) => (
          <span key={point.week}>{point.week}</span>
        ))}
      </footer>

      <p className="mt-2 text-xs text-navy-400">
        Mejor semana: <strong className="text-navy-700">{performanceSeries[performanceSeries.length - 1].week}</strong> con {formatCompactCurrency(performanceSeries[performanceSeries.length - 1].value)} · Total 8 semanas: {formatCompactCurrency(performanceSeries.reduce((sum, point) => sum + point.value, 0))}
      </p>
    </section>
  )
}
