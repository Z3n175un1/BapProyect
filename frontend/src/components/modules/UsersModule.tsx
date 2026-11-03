import { useMemo, useState } from 'react'
import Icon from '../ui/Icon'
import KpiCard from '../dashboard/KpiCard'
import { systemUsers } from '../../data/systemUsers'
import type { KpiMetric, SystemUser, SystemUserStatus } from '../../types/dashboard'
import { initialsOf, roleLabel } from '../../utils/format'

type StatusFilter = 'todos' | SystemUserStatus
type RoleFilter = 'todos' | 'admin' | 'contador'

type ActivityBarProps = {
  values: number[]
}

/** Barras de iteraciones por día (Lun–Dom) de la última semana. */
function ActivityBars({ values }: ActivityBarProps) {
  const max = Math.max(...values, 1)
  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  return (
    <div className="flex items-end gap-1" role="img" aria-label={`Iteraciones de la semana: ${values.join(', ')}`}>
      {values.map((value, index) => (
        <span key={index} className="flex flex-col items-center gap-0.5" title={`${days[index]}: ${value} iteraciones`}>
          <span
            className={`w-1.5 rounded-full transition-all duration-300 ${value === 0 ? 'bg-navy-100' : 'bg-pineapple-400'}`}
            style={{ height: Math.max(4, (value / max) * 24) }}
          />
          <span className="text-[8px] leading-none text-navy-300">{days[index]}</span>
        </span>
      ))}
    </div>
  )
}

/** Módulo "Usuarios activos" del Administrador (datos simulados). */
export default function UsersModule() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('todos')
  const [role, setRole] = useState<RoleFilter>('todos')

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return systemUsers.filter((user) => {
      const matchesQuery =
        !normalized ||
        user.name.toLowerCase().includes(normalized) ||
        user.email.toLowerCase().includes(normalized) ||
        user.position.toLowerCase().includes(normalized)
      const matchesStatus = status === 'todos' || user.status === status
      const matchesRole = role === 'todos' || user.role === role
      return matchesQuery && matchesStatus && matchesRole
    })
  }, [query, status, role])

  const activeUsers = systemUsers.filter((u) => u.status === 'activo').length
  const inactiveUsers = systemUsers.length - activeUsers
  const activityRate = systemUsers.length ? (activeUsers / systemUsers.length) * 100 : 0
  const avgActivity = Math.round(
    systemUsers.reduce((sum, u) => sum + u.weeklyActivity.reduce((a, b) => a + b, 0), 0) /
      (systemUsers.length * 7),
  )

  const kpis: KpiMetric[] = [
    {
      id: 'users-total',
      label: 'Usuarios registrados',
      value: systemUsers.length,
      format: 'number',
      delta: 8.3,
      trend: 'up',
      positive: true,
      icon: 'users',
    },
    {
      id: 'users-active',
      label: 'Usuarios activos',
      value: activeUsers,
      format: 'number',
      delta: 4.2,
      trend: 'up',
      positive: true,
      icon: 'user-plus',
    },
    {
      id: 'users-inactive',
      label: 'Usuarios inactivos',
      value: inactiveUsers,
      format: 'number',
      delta: -6.5,
      trend: 'down',
      positive: true,
      icon: 'user',
    },
    {
      id: 'users-rate',
      label: 'Actividad promedio',
      value: avgActivity,
      format: 'number',
      delta: 2.7,
      trend: 'up',
      positive: true,
      icon: 'clipboard',
    },
  ]

  return (
    <div className="animate-blurred-fade-in space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-pineapple-300 ring-1 ring-navy-700">
            <Icon name="users" className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-navy-950">Usuarios activos</h1>
            <p className="mt-1 text-sm text-navy-500">
              Cuentas registradas, estado de acceso e indicadores de actividad.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-navy-700 ring-1 ring-navy-100">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          {activeUsers} activos de {systemUsers.length} · {activityRate.toFixed(0)}% de tasa
        </span>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((metric, index) => (
          <KpiCard key={metric.id} metric={metric} index={index} />
        ))}
      </div>

      <section
        aria-label="Listado de usuarios"
        className="animate-fade-in-up rounded-2xl bg-white shadow-sm ring-1 ring-navy-100"
        style={{ animationDelay: '150ms' }}
      >
        <div className="flex flex-wrap items-center gap-3 border-b border-navy-50 p-4">
          <div className="relative min-w-[220px] flex-1">
            <Icon name="search" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre, correo o cargo…"
              className="w-full rounded-xl border border-navy-100 bg-navy-50/40 py-2 pl-10 pr-3 text-sm text-navy-800 outline-none transition-all duration-200 placeholder:text-navy-300 focus:border-pineapple-300 focus:bg-white focus:ring-4 focus:ring-pineapple-100"
              aria-label="Buscar usuarios"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-navy-500">
            Estado
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
              className="rounded-lg border border-navy-100 bg-white px-2.5 py-2 text-sm font-medium text-navy-700 outline-none transition-colors duration-200 focus:border-pineapple-300 focus:ring-4 focus:ring-pineapple-100"
            >
              <option value="todos">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-navy-500">
            Perfil
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as RoleFilter)}
              className="rounded-lg border border-navy-100 bg-white px-2.5 py-2 text-sm font-medium text-navy-700 outline-none transition-colors duration-200 focus:border-pineapple-300 focus:ring-4 focus:ring-pineapple-100"
            >
              <option value="todos">Todos</option>
              <option value="admin">Administrador</option>
              <option value="contador">Contador</option>
            </select>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-navy-50 bg-navy-50/50 text-[11px] uppercase tracking-wider text-navy-400">
                <th className="px-4 py-3 font-semibold">Usuario</th>
                <th className="px-4 py-3 font-semibold">Perfil</th>
                <th className="px-4 py-3 font-semibold">Departamento</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Último acceso</th>
                <th className="px-4 py-3 font-semibold">Actividad semanal</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user: SystemUser) => (
                <tr key={user.id} className="border-b border-navy-50 transition-colors duration-200 last:border-0 hover:bg-pineapple-50/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          user.status === 'activo'
                            ? 'bg-pineapple-400 text-navy-950'
                            : 'bg-navy-100 text-navy-400'
                        }`}
                      >
                        {initialsOf(user.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-navy-900">{user.name}</p>
                        <p className="truncate text-xs text-navy-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        user.role === 'admin'
                          ? 'bg-navy-900 text-white'
                          : 'bg-navy-50 text-navy-600 ring-1 ring-navy-100'
                      }`}
                    >
                      {roleLabel(user.role)}
                    </span>
                    <p className="mt-1 text-xs text-navy-400">{user.position}</p>
                  </td>
                  <td className="px-4 py-3 text-navy-700">{user.department}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        user.status === 'activo'
                          ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                          : 'bg-red-50 text-red-500 ring-1 ring-red-200'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${user.status === 'activo' ? 'bg-emerald-500' : 'bg-red-400'}`}
                      />
                      {user.status === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-navy-500">{user.lastLogin}</td>
                  <td className="px-4 py-3">
                    <ActivityBars values={user.weeklyActivity} />
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-navy-400">
                    No hay usuarios que coincidan con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="flex items-center justify-between border-t border-navy-50 px-4 py-3 text-xs text-navy-400">
          <span>
            Mostrando {filtered.length} de {systemUsers.length} usuarios
          </span>
          <span className="font-medium text-navy-500">Datos simulados · fase de maquetado</span>
        </footer>
      </section>
    </div>
  )
}
