import Icon from '../ui/Icon'
import KpiCard from '../dashboard/KpiCard'
import { dailyEarnings } from '../../data/earnings'
import type { EarningsTransaction, KpiMetric } from '../../types/dashboard'
import { formatCurrency } from '../../utils/format'

type DailyEarningsModuleProps = {
  module: {
    label: string
    description: string
  }
}

/** Módulo "Ganancias del día" (Administrador y Contador, datos simulados). */
export default function DailyEarningsModule({ module }: DailyEarningsModuleProps) {
  const ingresos = dailyEarnings.ingresos
    .filter((tx: EarningsTransaction) => tx.type === 'ingreso')
    .reduce((sum, tx) => sum + tx.amount, 0)
  const egresos = dailyEarnings.ingresos
    .filter((tx: EarningsTransaction) => tx.type === 'egreso')
    .reduce((sum, tx) => sum + tx.amount, 0)
  const neto = ingresos - egresos
  const margen = ingresos ? (neto / ingresos) * 100 : 0
  const maxMonth = Math.max(...dailyEarnings.series.map((p: { ingresos: number; egresos: number }) => Math.max(p.ingresos, p.egresos)))

  const ingresosCount = dailyEarnings.ingresos.filter((tx) => tx.type === 'ingreso').length
  const egresosCount = dailyEarnings.ingresos.length - ingresosCount

  const kpis: KpiMetric[] = [
    {
      id: 'ingresos-dia',
      label: 'Ingresos registrados',
      value: ingresos,
      format: 'currency',
      delta: dailyEarnings.ingresosDelta,
      trend: 'up',
      positive: true,
      icon: 'trending-up',
    },
    {
      id: 'egresos-dia',
      label: 'Egresos registrados',
      value: egresos,
      format: 'currency',
      delta: Math.abs(dailyEarnings.egresosDelta),
      trend: 'down',
      positive: true,
      icon: 'wallet',
    },
    {
      id: 'neto-dia',
      label: 'Ganancia neta',
      value: neto,
      format: 'currency',
      delta: dailyEarnings.netoDelta,
      trend: 'up',
      positive: true,
      icon: 'check-circle',
    },
    {
      id: 'margen-dia',
      label: 'Margen del día',
      value: margen,
      format: 'number',
      delta: dailyEarnings.margenDelta,
      trend: 'up',
      positive: true,
      icon: 'bar-chart',
    },
  ]

  return (
    <div className="animate-blurred-fade-in space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-pineapple-300 ring-1 ring-navy-700">
            <Icon name="wallet" className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold capitalize tracking-tight text-navy-950">{module.label}</h1>
            <p className="mt-1 text-sm text-navy-500">
              {module.description} · {dailyEarnings.date}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-navy-700 ring-1 ring-navy-100">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          Cierre del día sincronizado hace 5 min
        </span>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((metric, index) => (
          <KpiCard key={metric.id} metric={metric} index={index} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <section
          aria-label="Comparativa entre meses"
          className="animate-fade-in-up rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy-100 sm:p-6 xl:col-span-2"
          style={{ animationDelay: '150ms' }}
        >
          <header>
            <h2 className="text-base font-bold text-navy-900">Ingresos vs. egresos</h2>
            <p className="mt-0.5 text-sm text-navy-500">Comparativa entre meses (miles de Bs)</p>
          </header>

          <div className="mt-4 flex items-center gap-3 text-xs font-medium text-navy-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-t from-pineapple-600 to-pineapple-400" />
              Ingresos
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-navy-800" />
              Egresos
            </span>
          </div>

          <div className="mt-5 flex items-end justify-between gap-2 sm:gap-3" style={{ height: 200 }}>
            {dailyEarnings.series.map((point) => (
              <div
                key={point.month}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                title={`${point.month}: ingresos ${point.ingresos} mil Bs · egresos ${point.egresos} mil Bs`}
              >
                <div className="flex h-full w-full items-end justify-center gap-1">
                  <div
                    className="w-full max-w-[9px] rounded-t-md bg-gradient-to-t from-pineapple-600 to-pineapple-400 transition-all duration-500 hover:brightness-110 sm:max-w-[13px]"
                    style={{ height: `${(point.ingresos / maxMonth) * 100}%` }}
                  />
                  <div
                    className="w-full max-w-[9px] rounded-t-md bg-navy-800 transition-all duration-500 hover:bg-navy-700 sm:max-w-[13px]"
                    style={{ height: `${(point.egresos / maxMonth) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-navy-400">
                  {point.month}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-navy-50 pt-4">
            <div>
              <p className="text-xs text-navy-400">Promedio de ganancia</p>
              <p className="mt-0.5 text-lg font-bold text-emerald-600">+34 mil Bs / mes</p>
            </div>
            <div>
              <p className="text-xs text-navy-400">Tendencia 6 meses</p>
              <p className="mt-0.5 flex items-center gap-1 text-lg font-bold text-navy-900">
                <Icon name="trending-up" className="h-4 w-4 text-emerald-500" />
                Creciente
              </p>
            </div>
          </div>
        </section>

        <section
          aria-label="Movimientos registrados hoy"
          className="animate-fade-in-up rounded-2xl bg-white shadow-sm ring-1 ring-navy-100 xl:col-span-3"
          style={{ animationDelay: '250ms' }}
        >
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-50 p-4 sm:px-6">
            <div>
              <h2 className="text-base font-bold text-navy-900">Movimientos registrados hoy</h2>
              <p className="mt-0.5 text-sm text-navy-500">
                {ingresosCount} ingresos y {egresosCount} egresos contabilizados
              </p>
            </div>
            <span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-semibold text-navy-600 ring-1 ring-navy-100">
              Período: hoy
            </span>
          </header>

          <div className="max-h-[430px] overflow-y-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="sticky top-0 z-10 bg-navy-50/95 backdrop-blur">
                <tr className="text-[11px] uppercase tracking-wider text-navy-400">
                  <th className="px-4 py-3 font-semibold sm:px-6">Hora</th>
                  <th className="px-4 py-3 font-semibold">Concepto</th>
                  <th className="px-4 py-3 font-semibold">Origen</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 text-right font-semibold sm:px-6">Monto</th>
                </tr>
              </thead>
              <tbody>
                {dailyEarnings.ingresos.map((tx) => (
                  <tr key={tx.id} className="border-b border-navy-50 transition-colors duration-200 last:border-0 hover:bg-pineapple-50/40">
                    <td className="px-4 py-3 font-mono text-xs text-navy-400 sm:px-6">{tx.time}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-900">{tx.concept}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-navy-500">{tx.source}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          tx.type === 'ingreso'
                            ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                            : 'bg-red-50 text-red-500 ring-1 ring-red-200'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${tx.type === 'ingreso' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                        {tx.type}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-semibold tabular-nums sm:px-6 ${
                        tx.type === 'ingreso' ? 'text-emerald-600' : 'text-red-500'
                      }`}
                    >
                      {tx.type === 'ingreso' ? '+' : '−'}
                      {formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-navy-100 bg-navy-50/60">
                  <td colSpan={4} className="px-4 py-3 text-sm font-bold text-navy-800 sm:px-6">
                    Ganancia neta del día
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold tabular-nums text-navy-950 sm:px-6">
                    {formatCurrency(neto)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
