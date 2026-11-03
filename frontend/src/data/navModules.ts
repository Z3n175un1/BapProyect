import type { ModuleLink, ModuleSlug, UserRole } from '../types/dashboard'

/** Módulos del sistema contable, con roles, secciones y estado de implementación. */
export const navModules: ModuleLink[] = [
  {
    slug: 'dashboard',
    label: 'Inicio',
    description: 'Vista general con indicadores, gráficos y accesos rápidos del sistema.',
    icon: 'home',
    roles: ['admin', 'contador'],
    section: 'General',
    status: 'Activo',
    features: [],
  },
  {
    slug: 'usuarios-activos',
    label: 'Usuarios activos',
    description: 'Usuarios registrados, estado de cuenta e indicadores de actividad.',
    icon: 'users',
    roles: ['admin'],
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
    roles: ['admin', 'contador'],
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
    roles: ['contador'],
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
    description: 'Módulos disponibles y permisos de acceso por cuenta de usuario.',
    icon: 'lock',
    roles: ['admin'],
    section: 'Sistema',
    status: 'En desarrollo',
    features: [
      { label: 'Visualizar los módulos disponibles para cada usuario', status: 'En desarrollo' },
      { label: 'Consultar los módulos habilitados de cada cuenta', status: 'En desarrollo' },
      { label: 'Estructura para gestionar permisos y accesos', status: 'En desarrollo' },
    ],
  },
  {
    slug: 'respaldos',
    label: 'Respaldos',
    description: 'Fechas y estados de respaldos del sistema y futura gestión de backups.',
    icon: 'database',
    roles: ['admin'],
    section: 'Sistema',
    status: 'En desarrollo',
    features: [
      { label: 'Información sobre respaldos del sistema', status: 'En desarrollo' },
      { label: 'Fechas y estados de los respaldos', status: 'En desarrollo' },
      { label: 'Interfaz para futuras operaciones de backup', status: 'En desarrollo' },
    ],
  },
  {
    slug: 'finanzas',
    label: 'Finanzas',
    description: 'Libro mayor, cuentas por cobrar/pagar, efectivo y activos fijos.',
    icon: 'chart-pie',
    roles: ['contador'],
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
    roles: ['admin', 'contador'],
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
    roles: ['admin', 'contador'],
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
    roles: ['admin', 'contador'],
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

/** ¿El rol puede abrir este módulo? (accesos rápidos y guards de ruta) */
export function quickAccessAllowed(slug: ModuleSlug, role: UserRole): boolean {
  const module = findModule(slug)
  return Boolean(module && module.roles.includes(role))
}

export function modulesForRole(role: UserRole): ModuleLink[] {
  return navModules.filter((m) => m.roles.includes(role))
}

/** Agrupa los módulos del rol por sección, respetando el orden de definición. */
export function moduleSectionsForRole(
  role: UserRole,
): Array<{ section: string; modules: ModuleLink[] }> {
  const sections: Array<{ section: string; modules: ModuleLink[] }> = []
  for (const module of modulesForRole(role)) {
    const group = sections.find((s) => s.section === module.section)
    if (group) group.modules.push(module)
    else sections.push({ section: module.section, modules: [module] })
  }
  return sections
}
