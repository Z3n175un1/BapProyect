import { useState } from 'react'
import Icon from '../ui/Icon'
import { deltaTotal, RANGES, salesData } from '../../data/salesData'
import type { SalesRange } from '../../types/dashboard'
import { formatDelta } from '../../utils/format'

/** Gráfico de ventas en barras comparado con el período anterior (CSS puro). */
export default function SalesChart() {
  const [range, setRange] = useState<SalesRange>('anual')

  const points = salesData.series[range]
  const totals = salesData.totals[range]
  const max = Math.max(...points.map((point) => Math.max(point.current, point.previous)))
  const delta = deltaTotal(range)

  return (
    <section className="animate-fade-in-up rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy-100 sm:p-6" style={{ animationDelay: '300ms' }}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-navy-900">Análisis de ventas</h2>
          <p className="mt-0.5 text-sm text-navy-500">
            Comparativa del período actual frente al anterior
          </p>
        </div>

        <div className="flex rounded-xl bg-navy-50 p-1" role="group" aria-label="Período">
          {RANGES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                range === option
                  ? 'bg-navy-900 text-white shadow'
                  : 'text-navy-500 hover:text-navy-800'
              }`}
            >
              {option === 'anual' ? '12 meses' : '6 meses'}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
          {formatDelta(delta)} vs. período anterior
        </span>
        <span className="text-xs text-navy-400">
          Total actual: {totals.current} mil Bs · Anterior: {totals.previous} mil Bs
        </span>
      </div>

      <div className="mt-6 flex items-end justify-between gap-1.5 sm:gap-3" style={{ height: 220 }}>
        {points.map((point) => (
          <div key={`${range}-${point.label}`} className="flex h-full flex-1 flex-col justify-end" title={`${point.label}: ${point.current} mil Bs (anterior ${point.previous} mil Bs)`}>
            <div className="flex h-full items-end justify-center gap-1">
              <div className="flex h-full w-full max-w-[9px] flex-col justify-end sm:max-w-[14px]">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-pineapple-600 to-pineapple-400 transition-all duration-500 hover:brightness-110"
                  style={{ height: `${(point.current / max) * 100}%` }}
                />
              </div>
              <div className="flex h-full w-full max-w-[9px] flex-col justify-end sm:max-w-[14px]">
                <div
                  className="w-full rounded-t-md bg-navy-100 transition-all duration-500"
                  style={{ height: `${(point.previous / max) * 100}%` }}
                />
              </div>
            </div>
            <p className="mt-2 text-center text-[10px] font-medium text-navy-400 sm:text-xs">
              {point.label}
            </p>
          </div>
        ))}
      </div>

      <footer className="mt-4 flex items-center gap-5 border-t border-navy-50 pt-3 text-xs text-navy-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-pineapple-400" />
          Período actual
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-navy-200" />
          Período anterior
        </span>
        <span className="ml-auto hidden items-center gap-1.5 sm:flex">
          <Icon name="bar-chart" className="h-3.5 w-3.5" />
          Miles de Bs
        </span>
      </footer>
    </section>
  )
}
