import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import Icon from '../ui/Icon'
import KpiCard from '../dashboard/KpiCard'
import { useAuth } from '../../context/AuthContext'
import { ApiError, apiDescarga } from '../../services/http'
import {
  cambiarEstadoUsuario,
  crearUsuario,
  editarUsuario,
  listarRoles,
  listarUsuarios,
  type RolCatalogoItem,
  type UsuarioActivoItem,
  type UsuarioNuevo,
} from '../../services/usuariosApi'
import { initialsOf } from '../../utils/format'
import type { KpiMetric } from '../../types/dashboard'

/** Módulo "Usuarios activos" del Administrador — datos reales de la API. */
export default function UsersModule() {
  const { token } = useAuth()

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | undefined>()
  const [datos, setDatos] = useState<UsuarioActivoItem[]>([])
  const [query, setQuery] = useState('')

  const [roles, setRoles] = useState<RolCatalogoItem[]>([])

  /* Modal de creación/edición (null = cerrado). */
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editandoA, setEditandoA] = useState<UsuarioActivoItem | null>(null)
  const [guardandoModal, setGuardandoModal] = useState(false)
  const [errorModal, setErrorModal] = useState<string | undefined>()

  /* Credenciales de cuenta nueva (una sola vez). */
  const [cuentaNueva, setCuentaNueva] = useState<UsuarioNuevo | null>(null)

  const [descargandoPdf, setDescargandoPdf] = useState(false)
  const [avisoEstado, setAvisoEstado] = useState<string | undefined>()

  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cargar = useCallback(async (tokenClaro: string, busqueda: string) => {
    setCargando(true)
    try {
      const listado = await listarUsuarios(tokenClaro, busqueda)
      setDatos(listado.usuarios)
      setError(undefined)
    } catch (excepcion) {
      setError(excepcion instanceof ApiError ? excepcion.message : 'No se pudo cargar el listado de usuarios.')
    } finally {
      setCargando(false)
    }
  }, [])

  /* Carga inicial + catálogo de roles. */
  useEffect(() => {
    if (!token) return
    void cargar(token, '')
    void listarRoles(token)
      .then(setRoles)
      .catch(() => setRoles([]))
  }, [token, cargar])

  /* Búsqueda contra el servidor con pequeño retardo (ilike en backend). */
  useEffect(() => {
    if (!token) return
    if (temporizador.current) clearTimeout(temporizador.current)
    temporizador.current = setTimeout(() => { void cargar(token, query) }, 350)
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current)
    }
  }, [query, token, cargar])

  const activos = datos.filter((u) => u.activo).length
  const deBaja = datos.length - activos
  const pendientes = datos.filter((u) => u.activo && u.requiere_cambio_contrasena).length

  const kpis: KpiMetric[] = [
    { id: 'users-total', label: 'Usuarios registrados', value: datos.length, format: 'number', delta: 0, trend: 'up', positive: true, icon: 'users' },
    { id: 'users-active', label: 'Activos', value: activos, format: 'number', delta: 0, trend: 'up', positive: true, icon: 'user-plus' },
    { id: 'users-inactive', label: 'De baja', value: deBaja, format: 'number', delta: 0, trend: 'up', positive: true, icon: 'user' },
    { id: 'users-pending', label: 'Setup pendiente', value: pendientes, format: 'number', delta: 0, trend: 'up', positive: true, icon: 'clipboard' },
  ]

  /* ------------------------------------------------------------------ */
  /* Acciones                                                            */
  /* ------------------------------------------------------------------ */

  const abrirCrear = () => {
    setEditandoA(null)
    setErrorModal(undefined)
    setModalAbierto(true)
  }

  const abrirEditar = (usuario: UsuarioActivoItem) => {
    setEditandoA(usuario)
    setErrorModal(undefined)
    setModalAbierto(true)
  }

  const enviarModal = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    if (!token) return
    const formulario = evento.currentTarget
    const fd = new FormData(formulario)
    const nombre = String(fd.get('nombre_completo') ?? '').trim()
    const correo = String(fd.get('correo') ?? '').trim().toLowerCase()
    const rol = String(fd.get('rol_codigo') ?? '')

    setGuardandoModal(true)
    setErrorModal(undefined)
    try {
      if (editandoA) {
        const cambios: { nombre_completo?: string; correo?: string; rol_codigo?: string } = {}
        if (nombre !== editandoA.nombre_completo) cambios.nombre_completo = nombre
        if (correo !== editandoA.correo) cambios.correo = correo
        if (rol !== (editandoA.roles[0] ?? '')) cambios.rol_codigo = rol
        if (Object.keys(cambios).length === 0) {
          setModalAbierto(false)
          return
        }
        setAvisoEstado(await editarUsuario(token, editandoA.id, cambios))
      } else {
        setCuentaNueva(await crearUsuario(token, { nombre_completo: nombre, correo, rol_codigo: rol }))
        setModalAbierto(false)
      }
      await cargar(token, query)
    } catch (excepcion) {
      setErrorModal(excepcion instanceof ApiError ? excepcion.message : 'No se pudo guardar el usuario.')
    } finally {
      setGuardandoModal(false)
    }
  }

  const alternarEstado = async (usuario: UsuarioActivoItem) => {
    if (!token) return
    const objetivo = !usuario.activo
    const mensaje = objetivo
      ? `¿Reactivar el acceso de ${usuario.nombre_completo}?`
      : `¿Dar de baja a ${usuario.nombre_completo}? Se cerrarán sus sesiones abiertas.`
    if (!window.confirm(mensaje)) return
    try {
      setAvisoEstado(await cambiarEstadoUsuario(token, usuario.id, objetivo))
      await cargar(token, query)
    } catch (excepcion) {
      setError(excepcion instanceof ApiError ? excepcion.message : 'No se pudo cambiar el estado.')
    }
  }

  const descargarPdf = async () => {
    if (!token) return
    setDescargandoPdf(true)
    try {
      await apiDescarga(token, '/usuarios-activos/pdf', 'usuarios_visualgas.pdf')
    } catch (excepcion) {
      setError(excepcion instanceof ApiError ? excepcion.message : 'No se pudo descargar el reporte.')
    } finally {
      setDescargandoPdf(false)
    }
  }

  const copiar = async (texto: string) => {
    try { await navigator.clipboard.writeText(texto) } catch { /* silencioso */ }
  }

  const tituloModal = useMemo(
    () => (editandoA ? 'Editar usuario' : 'Nuevo usuario'),
    [editandoA],
  )

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
              Gestión de cuentas del personal · alta con contraseña temporal y 2FA pendiente.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-navy-700 ring-1 ring-navy-100">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            {activos} activos de {datos.length}
          </span>
          <button
            type="button"
            onClick={descargarPdf}
            disabled={descargandoPdf}
            className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-navy-700 ring-1 ring-navy-100 transition-colors hover:bg-navy-50 disabled:opacity-50"
          >
            <Icon name="file-text" className="h-3.5 w-3.5 text-navy-400" />
            {descargandoPdf ? 'Generando…' : 'Descargar PDF'}
          </button>
          <button
            type="button"
            onClick={abrirCrear}
            className="inline-flex items-center gap-2 rounded-full bg-pineapple-400 px-4 py-1.5 text-xs font-bold text-navy-950 shadow-sm transition-colors hover:bg-pineapple-500"
          >
            <Icon name="user-plus" className="h-3.5 w-3.5" />
            Nuevo usuario
          </button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((metric, index) => (
          <KpiCard key={metric.id} metric={metric} index={index} />
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600" role="alert">
          <Icon name="alert-triangle" className="mt-0.5 h-5 w-5 shrink-0" />
          {error}
        </div>
      )}
      {avisoEstado && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700" role="status">
          <Icon name="check-circle" className="h-5 w-5 shrink-0" />
          {avisoEstado}
        </div>
      )}

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
              placeholder="Buscar por nombre o correo…"
              className="w-full rounded-xl border border-navy-100 bg-navy-50/40 py-2 pl-10 pr-3 text-sm text-navy-800 outline-none transition-all duration-200 placeholder:text-navy-300 focus:border-pineapple-300 focus:bg-white focus:ring-4 focus:ring-pineapple-100"
              aria-label="Buscar usuarios"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-navy-50 bg-navy-50/50 text-[11px] uppercase tracking-wider text-navy-400">
                <th className="px-4 py-3 font-semibold">Usuario</th>
                <th className="px-4 py-3 font-semibold">Rol</th>
                <th className="px-4 py-3 font-semibold">Empresas</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Último acceso</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-navy-400">Cargando usuarios…</td>
                </tr>
              )}
              {!cargando && datos.map((usuario) => (
                <tr key={usuario.id} className="border-b border-navy-50 transition-colors duration-200 last:border-0 hover:bg-pineapple-50/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          usuario.activo ? 'bg-pineapple-400 text-navy-950' : 'bg-navy-100 text-navy-400'
                        }`}
                      >
                        {initialsOf(usuario.nombre_completo)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-navy-900">{usuario.nombre_completo}</p>
                        <p className="truncate text-xs text-navy-400">{usuario.correo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-navy-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      {usuario.roles[0] ?? 'SIN ROL'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-navy-600">{usuario.empresas.join(', ') || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        usuario.activo
                          ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                          : 'bg-red-50 text-red-500 ring-1 ring-red-200'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${usuario.activo ? 'bg-emerald-500' : 'bg-red-400'}`} />
                      {usuario.activo ? 'Activo' : 'De baja'}
                    </span>
                    {usuario.activo && usuario.requiere_cambio_contrasena && (
                      <span className="ml-1 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-300">
                        Setup pendiente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-navy-500">
                    {usuario.ultimo_acceso_en
                      ? new Date(usuario.ultimo_acceso_en).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })
                      : 'Sin acceso'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => abrirEditar(usuario)}
                        title="Editar usuario"
                        className="rounded-md p-1.5 text-navy-300 transition hover:bg-navy-50 hover:text-navy-600"
                      >
                        <Icon name="settings" className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => alternarEstado(usuario)}
                        title={usuario.activo ? 'Dar de baja' : 'Reactivar cuenta'}
                        className={`rounded-md p-1.5 transition hover:bg-navy-50 ${
                          usuario.activo ? 'text-red-300 hover:text-red-500' : 'text-emerald-400 hover:text-emerald-600'
                        }`}
                      >
                        <Icon name={usuario.activo ? 'x' : 'check-circle'} className="h-4 w-4" />
                        <span className="sr-only">{usuario.activo ? 'Dar de baja' : 'Reactivar'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!cargando && datos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-navy-400">
                    {query ? `Sin resultados para "${query}".` : 'No hay usuarios en tu ámbito todavía.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="flex items-center justify-between border-t border-navy-50 px-4 py-3 text-xs text-navy-400">
          <span>{cargando ? 'Actualizando…' : `${datos.length} usuario(s) en tu ámbito de gestión`}</span>
          <span className="font-medium text-navy-500">Datos del servidor · módulo usuarios_activos</span>
        </footer>
      </section>

      {/* -------------------------------------------------------------- */}
      {/* Modal alta/edición                                              */}
      {/* -------------------------------------------------------------- */}
      {modalAbierto && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-navy-950/50 p-4" role="dialog" aria-modal="true" aria-label={tituloModal}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <header className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
              <h2 className="text-base font-bold text-navy-950">{tituloModal}</h2>
              <button type="button" onClick={() => setModalAbierto(false)} className="rounded-md p-1.5 text-navy-300 transition hover:text-navy-700" aria-label="Cerrar">
                <Icon name="x" className="h-4 w-4" />
              </button>
            </header>
            <form onSubmit={enviarModal} className="space-y-3 px-5 py-4">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-navy-600">Nombre completo</span>
                <input
                  name="nombre_completo"
                  required
                  minLength={3}
                  maxLength={160}
                  defaultValue={editandoA?.nombre_completo ?? ''}
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-pineapple-400 focus:outline-none focus:ring-2 focus:ring-pineapple-200"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-navy-600">Correo electrónico</span>
                <input
                  name="correo"
                  type="email"
                  required
                  maxLength={120}
                  defaultValue={editandoA?.correo ?? ''}
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-pineapple-400 focus:outline-none focus:ring-2 focus:ring-pineapple-200"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-navy-600">Rol asignado</span>
                <select
                  name="rol_codigo"
                  required
                  defaultValue={editandoA?.roles[0] ?? ''}
                  className="w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm font-medium text-navy-700 focus:border-pineapple-400 focus:outline-none focus:ring-2 focus:ring-pineapple-200"
                >
                  <option value="" disabled>Selecciona un rol…</option>
                  {roles.map((r) => (
                    <option key={r.codigo} value={r.codigo}>{r.codigo} — {r.nombre}</option>
                  ))}
                </select>
              </label>

              {errorModal && <p className="text-xs font-medium text-red-600" role="alert">{errorModal}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalAbierto(false)} className="rounded-lg px-3 py-2 text-xs font-semibold text-navy-500 transition hover:text-navy-800">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoModal}
                  className="rounded-lg bg-pineapple-400 px-4 py-2 text-xs font-bold text-navy-950 transition hover:bg-pineapple-500 disabled:opacity-50"
                >
                  {guardandoModal ? 'Guardando…' : editandoA ? 'Guardar cambios' : 'Crear cuenta'}
                </button>
              </div>
              {!editandoA && (
                <p className="text-[11px] leading-relaxed text-navy-400">
                  La cuenta nace <strong>inactiva de configuración</strong>: contraseña temporal +
                  2FA pendiente. Al crearla recibirás sus credenciales para entregarlas.
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------- */}
      {/* Modal credenciales de cuenta nueva (una sola vez)               */}
      {/* -------------------------------------------------------------- */}
      {cuentaNueva && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-navy-950/50 p-4" role="dialog" aria-modal="true" aria-label="Credenciales de la cuenta nueva">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <header className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-navy-950">Cuenta creada (ID #{cuentaNueva.usuario.id})</h2>
                <p className="text-xs text-navy-500">{cuentaNueva.usuario.correo}</p>
              </div>
              <button type="button" onClick={() => setCuentaNueva(null)} className="rounded-md p-1.5 text-navy-300 transition hover:text-navy-700" aria-label="Cerrar">
                <Icon name="x" className="h-4 w-4" />
              </button>
            </header>
            <div className="space-y-3 px-5 py-4 text-sm">
              <p className="rounded-xl bg-amber-50 p-3 text-xs font-medium text-amber-800 ring-1 ring-amber-300" role="alert">
                Estos datos se muestran <strong>una sola vez</strong>. Entrégaselos al usuario por un canal
                seguro; no vuelven a consultarse.
              </p>
              <div className="rounded-xl bg-navy-50 p-3 ring-1 ring-navy-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-navy-400">Contraseña temporal</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <code className="break-all font-mono text-xs text-navy-800">{cuentaNueva.contrasena_temporal}</code>
                  <button type="button" onClick={() => copiar(cuentaNueva.contrasena_temporal)} className="shrink-0 rounded-md bg-white px-2 py-1 text-[10px] font-bold text-navy-600 ring-1 ring-navy-200 hover:bg-navy-50">Copiar</button>
                </div>
              </div>
              <div className="rounded-xl bg-navy-50 p-3 ring-1 ring-navy-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-navy-400">Secreto TOTP (Base32)</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <code className="break-all font-mono text-xs text-navy-800">{cuentaNueva.secreto_totp}</code>
                  <button type="button" onClick={() => copiar(cuentaNueva.secreto_totp)} className="shrink-0 rounded-md bg-white px-2 py-1 text-[10px] font-bold text-navy-600 ring-1 ring-navy-200 hover:bg-navy-50">Copiar</button>
                </div>
              </div>
              <div className="rounded-xl bg-navy-50 p-3 ring-1 ring-navy-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-navy-400">8 códigos de respaldo</p>
                <ul className="mt-1 grid grid-cols-2 gap-x-3 font-mono text-xs text-navy-800">
                  {cuentaNueva.codigos_respaldo.map((codigo) => (
                    <li key={codigo}>{codigo}</li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setCuentaNueva(null)}
                className="w-full rounded-lg bg-navy-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-navy-800"
              >
                Entendido, las copié
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
