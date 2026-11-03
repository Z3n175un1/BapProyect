import type { DistributionSlice, PerformancePoint, SalesRange, SalesSeries } from '../types/dashboard'

/** Ventas mensuales en miles de Bs: año en curso vs año anterior. */
export const salesData: SalesSeries = {
  totals: {
    anual: { current: 1245, previous: 1108 },
    semestral: { current: 613, previous: 589 },
  },
  series: {
    anual: [
      { label: 'Ene', current: 68, previous: 60 },
      { label: 'Feb', current: 72, previous: 65 },
      { label: 'Mar', current: 89, previous: 78 },
      { label: 'Abr', current: 94, previous: 81 },
      { label: 'May', current: 101, previous: 86 },
      { label: 'Jun', current: 78, previous: 90 },
      { label: 'Jul', current: 112, previous: 95 },
      { label: 'Ago', current: 108, previous: 99 },
      { label: 'Sep', current: 120, previous: 92 },
      { label: 'Oct', current: 131, previous: 101 },
      { label: 'Nov', current: 64, previous: 112 },
      { label: 'Dic', current: 208, previous: 149 },
    ],
    semestral: [
      { label: 'Jun', current: 78, previous: 90 },
      { label: 'Jul', current: 112, previous: 95 },
      { label: 'Ago', current: 108, previous: 99 },
      { label: 'Sep', current: 120, previous: 92 },
      { label: 'Oct', current: 131, previous: 101 },
      { label: 'Nov', current: 64, previous: 112 },
    ],
  },
}

/** Distribución de ventas por línea de negocio (1.245.000 Bs). */
export const salesDistribution: DistributionSlice[] = [
  { label: 'Servicios contables', share: 45, value: 560250, color: '#0d1f33' },
  { label: 'Licencias VisualGas', share: 25, value: 311250, color: '#2d567f' },
  { label: 'Soporte técnico', share: 15, value: 186750, color: '#5e88b8' },
  { label: 'Capacitación', share: 10, value: 124500, color: '#ffc400' },
  { label: 'Otros ingresos', share: 5, value: 62250, color: '#ffd54d' },
]

/** Rendimiento comercial semanal (miles de Bs). */
export const performanceSeries: PerformancePoint[] = [
  { week: 'S1', value: 42 },
  { week: 'S2', value: 45 },
  { week: 'S3', value: 51 },
  { week: 'S4', value: 49 },
  { week: 'S5', value: 58 },
  { week: 'S6', value: 62 },
  { week: 'S7', value: 68 },
  { week: 'S8', value: 74 },
]

export const RANGES: SalesRange[] = ['anual', 'semestral']

export function deltaTotal(range: SalesRange): number {
  const { current, previous } = salesData.totals[range]
  return ((current - previous) / previous) * 100
}
