import type { IconName } from '../components/ui/Icon'

export type UserRole = 'admin' | 'contador'

export type ModuleSlug =
  | 'dashboard'
  | 'usuarios-activos'
  | 'ganancias-del-dia'
  | 'modulos-habilitados'
  | 'respaldos'
  | 'estadisticas'
  | 'asistente'
  | 'contabilidad'
  | 'finanzas'
  | 'reportes'

export type ModuleStatus = 'Activo' | 'En desarrollo'

export interface ModuleFeature {
  label: string
  status: ModuleStatus
}

export interface ModuleLink {
  slug: ModuleSlug
  label: string
  description: string
  icon: IconName
  section: 'General' | 'Gestión' | 'Sistema' | 'Finanzas'
  status: ModuleStatus
  features: ModuleFeature[]
}

export type KpiFormat = 'currency' | 'number'

export interface KpiMetric {
  id: string
  label: string
  value: number
  format: KpiFormat
  delta: number
  trend: 'up' | 'down'
  positive: boolean
  icon: IconName
}

export interface SalesPoint {
  label: string
  current: number
  previous: number
}

export type SalesRange = 'anual' | 'semestral'

export interface SalesSeries {
  totals: Record<SalesRange, { current: number; previous: number }>
  series: Record<SalesRange, SalesPoint[]>
}

export interface DistributionSlice {
  label: string
  share: number
  value: number
  color: string
}

export interface PerformancePoint {
  week: string
  value: number
}

export type ActivityType = 'venta' | 'cliente' | 'producto' | 'inventario' | 'transaccion' | 'alerta'

export interface ActivityItem {
  id: string
  type: ActivityType
  description: string
  detail: string
  time: string
  icon: IconName
}

export type NotificationCategory = 'venta' | 'sistema' | 'alerta' | 'cliente'

export interface NotificationItem {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  category: NotificationCategory
  icon: IconName
}

export interface QuickAction {
  slug: ModuleSlug
  label: string
  description: string
  icon: IconName
}

/* ------------------------------------------------------------------ */
/* Módulo Usuarios activos                                             */
/* ------------------------------------------------------------------ */

export type SystemUserStatus = 'activo' | 'inactivo'

export interface SystemUser {
  id: number
  name: string
  email: string
  role: UserRole
  position: string
  department: string
  status: SystemUserStatus
  lastLogin: string
  /** Iteraciones por día en la última semana (Lun–Dom). */
  weeklyActivity: number[]
  memberSince: string
}

/* ------------------------------------------------------------------ */
/* Módulo Ganancias del día                                            */
/* ------------------------------------------------------------------ */

export type EarningsTransactionType = 'ingreso' | 'egreso'

export interface EarningsTransaction {
  id: string
  time: string
  concept: string
  source: string
  type: EarningsTransactionType
  amount: number
}

export interface EarningsMonthPoint {
  month: string
  ingresos: number
  egresos: number
}

export interface DailyEarnings {
  date: string
  ingresosDelta: number
  egresosDelta: number
  netoDelta: number
  margenDelta: number
  ingresos: EarningsTransaction[]
  series: EarningsMonthPoint[]
}

/* ------------------------------------------------------------------ */
/* Módulo Contabilidad                                                 */
/* ------------------------------------------------------------------ */

export type AccountingTab =
  | 'planes-de-cuentas'
  | 'asientos'
  | 'libros'
  | 'estados-financieros'
  | 'conciliacion'

export interface AccountingAccount {
  code: string
  name: string
  type: 'Activo' | 'Pasivo' | 'Patrimonio' | 'Ingreso' | 'Egreso'
  balance: number
  status: 'Conciliada' | 'Por revisar'
}

export interface AccountingEntry {
  id: string
  date: string
  reference: string
  gloss: string
  debit: number
  credit: number
  status: 'Contabilizado' | 'Por aprobar'
}

export interface BankReconciliationRow {
  id: string
  bank: string
  date: string
  reference: string
  amount: number
  matched: boolean
}
