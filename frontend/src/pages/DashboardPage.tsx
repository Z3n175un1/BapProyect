import DashboardLayout from '../components/layout/DashboardLayout'
import ModulePlaceholder, { RestrictedModule } from '../components/layout/ModulePlaceholder'
import KpiCard from '../components/dashboard/KpiCard'
import SalesChart from '../components/dashboard/SalesChart'
import SalesDistribution from '../components/dashboard/SalesDistribution'
import PerformanceChart from '../components/dashboard/PerformanceChart'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import QuickActions from '../components/dashboard/QuickActions'
import UserPanel from '../components/dashboard/UserPanel'
import UsersModule from '../components/modules/UsersModule'
import DailyEarningsModule from '../components/modules/DailyEarningsModule'
import AccountingModule from '../components/modules/AccountingModule'
import { kpiMetrics } from '../data/kpiMetrics'
import { isModuleRoute, findModule, quickAccessAllowed } from '../data/navModules'
import { quickActions } from '../data/quickActions'
import type { ModuleSlug } from '../types/dashboard'
import { useAuth } from '../context/AuthContext'

type DashboardPageProps = {
  activeSlug: string
}

export default function DashboardPage({ activeSlug }: DashboardPageProps) {
  const normalized: ModuleSlug = isModuleRoute(activeSlug) ? activeSlug : 'dashboard'

  return (
    <DashboardLayout activeSlug={normalized}>
      {normalized === 'dashboard' ? <DashboardView /> : <ModuleRoute slug={normalized} />}
    </DashboardLayout>
  )
}

function ModuleRoute({ slug }: { slug: ModuleSlug }) {
  const module = findModule(slug)
  const { user } = useAuth()
  const role = user?.role ?? 'contador'

  if (!module || module.slug === 'dashboard') return null

  if (!module.roles.includes(role)) return <RestrictedModule module={module} role={role} />

  if (module.slug === 'usuarios-activos') return <UsersModule />
  if (module.slug === 'ganancias-del-dia') return <DailyEarningsModule module={module} />
  if (module.slug === 'contabilidad') return <AccountingModule module={module} />

  return <ModulePlaceholder module={module} />
}

function DashboardView() {
  const { user } = useAuth()
  const role = user?.role ?? 'contador'
  const now = new Date()
  const today = now.toLocaleDateString('es-BO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'
  const firstName = user?.name.split(' ')[0] ?? ''

  return (
    <div className="animate-blurred-fade-in space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-950 sm:text-3xl">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-sm capitalize text-navy-500">{today}</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-navy-700 ring-1 ring-navy-100">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          Sistema operativo · Todos los módulos sincronizados
        </span>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <section aria-label="Indicadores clave">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-5 w-1 rounded-full bg-pineapple-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-navy-500">
                Indicadores KPI
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {kpiMetrics.map((metric, index) => (
                <KpiCard key={metric.id} metric={metric} index={index} />
              ))}
            </div>
          </section>

          <SalesChart />

          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <PerformanceChart />
            </div>
            <div className="lg:col-span-2">
              <SalesDistribution />
            </div>
          </div>

          <ActivityFeed />
        </div>

        <aside className="min-w-0 space-y-6" aria-label="Panel complementario">
          <UserPanel />
          <QuickActions actions={quickActions.filter((action) => quickAccessAllowed(action.slug, role))} />
          <MiniAlerts />
        </aside>
      </div>
    </div>
  )
}

function MiniAlerts() {
  return (
    <section className="animate-fade-in-up rounded-2xl bg-navy-950 p-5 text-white shadow-sm" style={{ animationDelay: '550ms' }}>
      <header className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pineapple-400/15 text-pineapple-300 ring-1 ring-pineapple-400/30">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        </span>
        <h2 className="text-base font-bold">Alertas operativas</h2>
      </header>

      <ul className="mt-4 space-y-3 text-sm">
        <li className="flex items-start gap-3 rounded-xl bg-white/5 p-3">
          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-pineapple-400" />
          <p className="text-navy-100">
            <strong className="text-white">Cierre contable</strong> · Octubre listo para revisión y aprobación.
          </p>
        </li>
        <li className="flex items-start gap-3 rounded-xl bg-white/5 p-3">
          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-pineapple-400" />
          <p className="text-navy-100">
            <strong className="text-white">Conciliación pendiente</strong> · 2 movimientos bancarios por conciliar.
          </p>
        </li>
        <li className="flex items-start gap-3 rounded-xl bg-white/5 p-3">
          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-pineapple-400" />
          <p className="text-navy-100">
            <strong className="text-white">Facturación</strong> · 2 comprobantes pendientes de conciliar.
          </p>
        </li>
      </ul>
    </section>
  )
}
