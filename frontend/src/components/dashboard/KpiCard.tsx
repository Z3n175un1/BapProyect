import Icon from '../ui/Icon'
import type { KpiMetric } from '../../types/dashboard'
import { formatCurrency, formatDelta, formatNumber } from '../../utils/format'

type KpiCardProps = {
  metric: KpiMetric
  index: number
}

/** Tarjeta de indicador (KPI) con tendencia y variación porcentual. */
export default function KpiCard({ metric, index }: KpiCardProps) {
  const value = metric.format === 'currency' ? formatCurrency(metric.value) : formatNumber(metric.value)

  return (
    <article
      className="group animate-fade-in-up rounded-2xl bg-white p-5 ring-1 ring-navy-100 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:ring-pineapple-200"
      style={{ animationDelay: `${index * 80}ms` }}
      aria-label={`${metric.label}: ${value}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-navy-400">{metric.label}</p>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-700 ring-1 ring-navy-100 transition-all duration-300 group-hover:bg-pineapple-50 group-hover:text-pineapple-600 group-hover:ring-pineapple-200">
          <Icon name={metric.icon} className="h-5 w-5" />
        </span>
      </div>

      <p className="mt-3 text-2xl font-bold tracking-tight text-navy-950">{value}</p>

      <div className="mt-2.5 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
            metric.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          }`}
        >
          <Icon name={metric.trend === 'up' ? 'trending-up' : 'trending-down'} className="h-3 w-3" />
          {formatDelta(metric.delta)}
        </span>
        <span className="text-xs text-navy-400">vs. período anterior</span>
      </div>
    </article>
  )
}
