import type { AccountingAccount, AccountingEntry, BankReconciliationRow } from '../types/dashboard'

/** Plan de cuentas (datos simulados). */
export const accountingAccounts: AccountingAccount[] = [
  { code: '1-01-001', name: 'Caja y Bancos', type: 'Activo', balance: 128450, status: 'Conciliada' },
  { code: '1-01-002', name: 'Cuentas por Cobrar', type: 'Activo', balance: 76200, status: 'Por revisar' },
  { code: '1-02-003', name: 'Almacén de Insumos', type: 'Activo', balance: 34100, status: 'Conciliada' },
  { code: '1-03-001', name: 'Activos Fijos · Equipos de Cómputo', type: 'Activo', balance: 95600, status: 'Conciliada' },
  { code: '2-01-001', name: 'Cuentas por Pagar Comerciales', type: 'Pasivo', balance: 51900, status: 'Por revisar' },
  { code: '2-02-001', name: 'Impuestos por Pagar', type: 'Pasivo', balance: 12300, status: 'Conciliada' },
  { code: '3-01-001', name: 'Capital Social', type: 'Patrimonio', balance: 150000, status: 'Conciliada' },
  { code: '3-03-001', name: 'Resultados Acumulados', type: 'Patrimonio', balance: 48750, status: 'Conciliada' },
  { code: '4-01-001', name: 'Ingresos por Servicios', type: 'Ingreso', balance: 212300, status: 'Conciliada' },
  { code: '4-02-001', name: 'Otros Ingresos', type: 'Ingreso', balance: 17400, status: 'Por revisar' },
  { code: '5-01-001', name: 'Sueldos y Salarios', type: 'Egreso', balance: 96100, status: 'Conciliada' },
  { code: '5-02-002', name: 'Gastos de Operación', type: 'Egreso', balance: 38900, status: 'Conciliada' },
]

/** Registros del libro diario (datos simulados). */
export const accountingEntries: AccountingEntry[] = [
  { id: 'A-0418', date: '03/11/2026', reference: 'F-1210', gloss: 'Cobro facturación F-1210 · Cliente Andes S.A.', debit: 12750, credit: 0, status: 'Contabilizado' },
  { id: 'A-0417', date: '03/11/2026', reference: 'SIE-0027', gloss: 'Compra de insumos de oficina', debit: 0, credit: 3180, status: 'Contabilizado' },
  { id: 'A-0416', date: '03/11/2026', reference: 'NOM-119', gloss: 'Asiento de nómina quincenal', debit: 9800, credit: 0, status: 'Contabilizado' },
  { id: 'A-0415', date: '02/11/2026', reference: 'F-1209', gloss: 'Suscripción VisualGas · Cliente Andina', debit: 4200, credit: 0, status: 'Contabilizado' },
  { id: 'A-0414', date: '02/11/2026', reference: 'SIE-0026', gloss: 'Pago al proveedor Logística Andina', debit: 0, credit: 2450, status: 'Por aprobar' },
  { id: 'A-0413', date: '02/11/2026', reference: 'AJ-0087', gloss: 'Ajuste de tipo de cambio de caja', debit: 260, credit: 0, status: 'Contabilizado' },
  { id: 'A-0412', date: '31/10/2026', reference: 'CIE-1221', gloss: 'Cierre contable de octubre', debit: 0, credit: 0, status: 'Contabilizado' },
  { id: 'A-0411', date: '31/10/2026', reference: 'F-1188', gloss: 'Cobro facturación F-1188 · Cliente Orbe', debit: 2450, credit: 0, status: 'Contabilizado' },
]

/** Libros contables disponibles. */
export const accountingBooks = [
  { id: 'DIA', title: 'Libro Diario', detail: '124 asientos registrados este mes', status: 'Actualizado' },
  { id: 'MAY', title: 'Libro Mayor', detail: 'Balance de sumas y saldos al día', status: 'Actualizado' },
  { id: 'COM', title: 'Libro de Compras', detail: '17 compras del período', status: 'Actualizado' },
  { id: 'VEN', title: 'Libro de Ventas', detail: '31 facturas emitidas del período', status: 'Por publicar' },
  { id: 'IVA', title: 'Registro IVA', detail: 'Liquidación mensual en preparación', status: 'Por publicar' },
  { id: 'HIS', title: 'Historial de Asientos', detail: 'Archivo completo desde 2021', status: 'Actualizado' },
]

/** Estados financieros disponibles. */
export const financialStatements = [
  { id: 'BG', title: 'Balance General', period: 'Al 3 de noviembre de 2026' },
  { id: 'ER', title: 'Estado de Resultados', period: 'Acumulado enero – noviembre de 2026' },
  { id: 'FE', title: 'Estado de Flujo de Efectivo', period: 'Enero – noviembre de 2026' },
  { id: 'EP', title: 'Estado de Cambios en el Patrimonio', period: 'Acumulado 2026' },
]

/** Conciliación bancaria (datos simulados). */
export const bankReconciliation: BankReconciliationRow[] = [
  { id: 'CON-201', bank: 'BCP · Cuenta Principal', date: '02/11/2026', reference: 'DEP-8812', amount: 12750, matched: true },
  { id: 'CON-200', bank: 'BCP · Cuenta Principal', date: '31/10/2026', reference: 'CHQ-4401', amount: -3180, matched: true },
  { id: 'CON-199', bank: 'Mercantil · Cuenta Operativa', date: '31/10/2026', reference: 'TRF-2210', amount: 4200, matched: true },
  { id: 'CON-198', bank: 'BCP · Cuenta Principal', date: '30/10/2026', reference: 'SIE-88', amount: -1240, matched: true },
  { id: 'CON-197', bank: 'Mercantil · Cuenta Operativa', date: '29/10/2026', reference: 'SIE-87', amount: -2450, matched: false },  { id: 'CON-196', bank: 'BCP · Cuenta Principal', date: '28/10/2026', reference: 'DEP-8790', amount: 8600, matched: false },
]
