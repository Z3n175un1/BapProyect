import type { ModuleLink, ModuleSlug } from '../types/dashboard'

/**
 * Catálogo de METADATOS de presentación (etiquetas, iconos, descripciones).
 *
 * NOTA FASE D/E: este catálogo NO decide permisos. Los módulos visibles
 * provienen EXCLUSIVAMENTE de AuthContext (modulos[] del backend, calculados
 * con la regla A06: veto individual > habilitación individual > rol).
 * El backend revalida el acceso en cada solicitud; ocultar aquí no protege.
 */
export const navModules: ModuleLink[] = [
  {
    slug: 'dashboard',
    label: 'Inicio',
    description: 'Vista general con indicadores, gráficos y accesos rápidos del sistema.',
    icon: 'home',
    section: 'General',
    status: 'Activo',
    features: [],
  },
  {
    slug: 'usuarios-activos',
    label: 'Usuarios activos',
    description: 'Usuarios registrados, estado de cuenta e indicadores de actividad.',
    icon: 'users',
    section: 'General',
    status: 'Activo',
    features: [
      { label: 'Visualizar usuarios registrados', status: 'Activo' },
      { label: 'Consultar usuarios activos e inactivos', status: 'Activo' },
      { label: 'Mostrar información general de los usuarios', status: 'Activo' },
      { label: 'Visualizar indicadores de actividad', status: 'Activo' },
    ],
  },
  {
    slug: 'ganancias-del-dia',
    label: 'Ganancias del día',
    description: 'Resumen de ingresos, egresos y ganancia neta con indicadores visuales.',
    icon: 'wallet',
    section: 'General',
    status: 'Activo',
    features: [
      { label: 'Resumen de ganancias del día', status: 'Activo' },
      { label: 'Ingresos registrados', status: 'Activo' },
      { label: 'Egresos registrados', status: 'Activo' },
      { label: 'Ganancia neta e indicadores visuales', status: 'Activo' },
    ],
  },
  {
    slug: 'contabilidad',
    label: 'Contabilidad',
    description: 'Plan de cuentas, asientos, libros, estados financieros y conciliación bancaria.',
    icon: 'book',
    section: 'General',
    status: 'Activo',
    features: [
      { label: 'Ver planes de cuentas', status: 'Activo' },
      { label: 'Registros de asientos contables', status: 'Activo' },
      { label: 'Libros contables', status: 'Activo' },
      { label: 'Estados financieros', status: 'Activo' },
      { label: 'Conciliación bancaria', status: 'Activo' },
    ],
  },
  {
    slug: 'modulos-habilitados',
    label: 'Módulos habilitados',
    description: 'Habilitación y deshabilitación de módulos por usuario, con bitácora de cambios.',
    icon: 'lock',
    section: 'Sistema',
    status: 'Activo',
    features: [
      { label: 'Visualizar los módulos disponibles para cada usuario', status: 'Activo' },
      { label: 'Habilitar y deshabilitar módulos por cuenta', status: 'Activo' },
      { label: 'Consultar el historial de cambios (bitácora)', status: 'Activo' },
    ],
  },
  {
    slug: 'respaldos',
    label: 'Respaldos',
    description: 'Historial con fechas, tamaños y estados de los respaldos del sistema.',
    icon: 'database',
    section: 'Sistema',
    status: 'Activo',
    features: [
      { label: 'Historial con fechas y estados de respaldos', status: 'Activo' },
      { label: 'Tamaños y estado por respaldo (exitoso/fallido/en progreso)', status: 'Activo' },
      { label: 'KPIs: último respaldo y resumen por estado', status: 'Activo' },
      { label: 'Búsqueda por nombre o descripción', status: 'Activo' },
    ],
  },
  {
    slug: 'finanzas',
    label: 'Finanzas',
    description: 'Libro mayor, cuentas por cobrar/pagar, efectivo y activos fijos.',
    icon: 'chart-pie',
    section: 'Finanzas',
    status: 'En desarrollo',
    features: [
      { label: 'Ver libro mayor', status: 'En desarrollo' },
      { label: 'Cuentas por cobrar y por pagar', status: 'En desarrollo' },
      { label: 'Gestión de efectivo', status: 'En desarrollo' },
      { label: 'Activos fijos', status: 'En desarrollo' },
    ],
  },
  {
    slug: 'estadisticas',
    label: 'Estadísticas',
    description: 'Indicadores y gráficos de utilización del sistema.',
    icon: 'bar-chart',
    section: 'Sistema',
    status: 'En desarrollo',
    features: [
      { label: 'Indicadores generales', status: 'En desarrollo' },
      { label: 'Estadísticas de utilización del sistema', status: 'En desarrollo' },
      { label: 'Gráficos de actividad', status: 'En desarrollo' },
      { label: 'Análisis de cuentas por cobrar y por pagar', status: 'En desarrollo' },
      { label: 'Presupuestos, proyecciones y reportes dinámicos', status: 'En desarrollo' },
    ],
  },
  {
    slug: 'asistente',
    label: 'Asistente',
    description: 'Espacio del asistente inteligente para consultas contables.',
    icon: 'bot',
    section: 'Sistema',
    status: 'En desarrollo',
    features: [
      { label: 'Interfaz de chatbot', status: 'En desarrollo' },
      { label: 'Consultas en lenguaje natural sobre tu información contable', status: 'En desarrollo' },
      { label: 'Preparar visualmente la integración futura', status: 'En desarrollo' },
    ],
  },
  {
    slug: 'reportes',
    label: 'Reportes',
    description: 'Reportes administrativos, contables y fiscales del sistema.',
    icon: 'file-text',
    section: 'Sistema',
    status: 'En desarrollo',
    features: [
      { label: 'Estados financieros', status: 'En desarrollo' },
      { label: 'Libros y registros contables', status: 'En desarrollo' },
      { label: 'Reportes analíticos', status: 'En desarrollo' },
      { label: 'Reportes fiscales', status: 'En desarrollo' },
    ],
  },
]

export function findModule(slug: string): ModuleLink | undefined {
  return navModules.find((m) => m.slug === slug)
}

export function isModuleRoute(route: string): route is ModuleSlug {
  return navModules.some((m) => m.slug === route)
}

/** Módulos visibles: Inicio (siempre) + los EFFECTIVOS emitidos por el backend. */
export function modulesFor(modulosAutorizados: string[]): ModuleLink[] {
  const autorizados = new Set(modulosAutorizados)
  return navModules.filter(
    (m) => m.slug === 'dashboard' || autorizados.has(m.slug),
  )
}

/** Agrupa los módulos visibles por sección, respetando el orden del catálogo. */
export function moduleSectionsFor(
  modulosAutorizados: string[],
): Array<{ section: string; modules: ModuleLink[] }> {
  const sections: Array<{ section: string; modules: ModuleLink[] }> = []
  for (const module of modulesFor(modulosAutorizados)) {
    const group = sections.find((s) => s.section === module.section)
    if (group) group.modules.push(module)
    else sections.push({ section: module.section, modules: [module] })
  }
  return sections
}

/* Accesos rápidos: permitir sólo slugs efectivos (incluye dashboard). */
export function quickAccessAllowed(slug: ModuleSlug, modulosAutorizados: string[]): boolean {
  if (slug === 'dashboard') return true
  return modulosAutorizados.includes(slug)
}
