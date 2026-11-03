import type { DailyEarnings } from '../types/dashboard'

const today = new Date()
const formatted = today.toLocaleDateString('es-BO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/** Resumen financiero del día y comparativa mensual (datos simulados). */
export const dailyEarnings: DailyEarnings = {
  date: formatted,
  ingresosDelta: 6.8,
  egresosDelta: -3.2,
  netoDelta: 9.4,
  margenDelta: 2.1,
  ingresos: [
    { id: 'ing-01', time: '09:15', concept: 'Servicio de consultoría contable', source: 'Cliente Mushka', type: 'ingreso', amount: 8600 },
    { id: 'ing-02', time: '10:02', concept: 'Suscripción VisualGas · Plan Pro', source: 'Cliente Andina', type: 'ingreso', amount: 4200 },
    { id: 'ing-03', time: '11:23', concept: 'Factura F-1201 · Implementación', source: 'Cliente Andes S.A.', type: 'ingreso', amount: 12750 },
    { id: 'ing-04', time: '12:40', concept: 'Mantenimiento de licencias', source: 'Cliente Lago Ltda.', type: 'ingreso', amount: 3100 },
    { id: 'ing-05', time: '15:18', concept: 'Capacitación de personal', source: 'Cliente Orbe', type: 'ingreso', amount: 2450 },
    { id: 'egr-01', time: '08:30', concept: 'Nómina quincenal', source: 'Tesorería', type: 'egreso', amount: 9800 },
    { id: 'egr-02', time: '09:45', concept: 'Servicios básicos · Noviembre', source: 'Proveedores', type: 'egreso', amount: 1850 },
    { id: 'egr-03', time: '11:05', concept: 'Renovación de licencias de software', source: 'Tecnología', type: 'egreso', amount: 3650 },
    { id: 'egr-04', time: '14:22', concept: 'Fletes y courier', source: 'Logística', type: 'egreso', amount: 780 },
    { id: 'egr-05', time: '16:05', concept: 'Imprevistos operativos', source: 'Administración', type: 'egreso', amount: 1200 },
  ],
  series: [
    { month: 'Jun', ingresos: 84, egresos: 61 },
    { month: 'Jul', ingresos: 92, egresos: 67 },
    { month: 'Ago', ingresos: 88, egresos: 72 },
    { month: 'Sep', ingresos: 101, egresos: 64 },
    { month: 'Oct', ingresos: 110, egresos: 70 },
    { month: 'Nov', ingresos: 117, egresos: 69 },
  ],
}
