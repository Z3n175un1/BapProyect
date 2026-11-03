import type { QuickAction } from '../types/dashboard'

/** Accesos rápidos contables (se filtran por rol del usuario autenticado). */
export const quickActions: QuickAction[] = [
  {
    slug: 'contabilidad',
    label: 'Registrar asiento',
    description: 'Libro diario y comprobantes',
    icon: 'book',
  },
  {
    slug: 'ganancias-del-dia',
    label: 'Resumen del día',
    description: 'Ingresos y egresos',
    icon: 'wallet',
  },
  {
    slug: 'reportes',
    label: 'Generar reporte',
    description: 'PDF y XLS del período',
    icon: 'file-text',
  },
  {
    slug: 'estadisticas',
    label: 'Ver estadísticas',
    description: 'Indicadores y actividad',
    icon: 'bar-chart',
  },
  {
    slug: 'respaldos',
    label: 'Respaldos',
    description: 'Backups del sistema',
    icon: 'database',
  },
  {
    slug: 'asistente',
    label: 'Asistente',
    description: 'Consultas inteligentes',
    icon: 'bot',
  },
]
