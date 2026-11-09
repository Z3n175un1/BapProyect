import { useCallback, useEffect, useState } from 'react'
import Icon from '../ui/Icon'
import type { ModuleLink } from '../../types/dashboard'
import { useAuth } from '../../context/AuthContext'
import {
  bloqueoDe,
  cambiarEstado,
  listarHistorial,
  listarHabilitadosDe,
  listarUsuarios,
  type AdminUsuarioListItem,
  type HistorialCambio,
  type ModuloDetalle,
} from '../../services/modulosApi'
import { ApiError } from '../../services/http'

/** Origen del acceso con etiqueta y color (A06). */
const ORIGEN: Record<string, { label: string; clase: string }> = {
  individual: { label: 'Individual', clase: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  rol: { label: 'Por rol', clase: 'bg-navy-50 text-navy-700 ring-1 ring-navy-200' },
  sin_acceso: { label: 'Sin acceso', clase: 'bg-red-50 text-red-600 ring-1 ring-red-200' },
  EN_DESARROLLO: { label: 'En desarrollo', clase: 'bg-pineapple-50 text-pineapple-700 ring-1 ring-pineapple-200' },
}

/** Panel administrativo REAL: habilitación/deshabilitación de módulos por usuario. */
export default function ModulosHabilitadosModule({ module }: { module: ModuleLink }) {
  const { token, user } = useAuth()

  const [usuarios, setUsuarios] = useState<AdminUsuarioListItem[]>([])
  const [cargandoUsuarios, setCargandoUsuarios] = useState(true)
  const [errorListado, setErrorListado] = useState<string | undefined>()
  const [bloqueoListado, setBloqueoListado] = useState<string | undefined>()

  const [seleccionado, setSeleccionado] = useState<AdminUsuarioListItem | null>(null)
  const [detalle, setDetalle] = useState<ModuloDetalle[] | null>(null)
  const [historial, setHistorial] = useState<HistorialCambio[]>([])
  const [cargandoDetalle, setCargandoDetalle] = useState(false)
  const [errorDetalle, setErrorDetalle] = useState<string | undefined>()

  /* Cambio en curso: módulo elegido + motivo antes de confirmar. */
  const [pendiente, setPendiente] = useState<{ modulo: ModuloDetalle; destino: boolean } | null>(null)
  const [motivo, setMotivo] = useState('')
  const [enviandoCambio, setEnviandoCambio] = useState(false)
  const [aviso, setAviso] = useState<string | undefined>()

  const cargarUsuarios = useCallback(async () => {
    if (!token) return
    setCargandoUsuarios(true)
    setErrorListado(undefined)
    setBloqueoListado(undefined)
    try {
      const datos = await listarUsuarios(token)
      setUsuarios(datos.usuarios)
    } catch (error) {
      const bloqueo = bloqueoDe(error)
      if (bloqueo) setBloqueoListado('Catálogo no disponible: el SQL de FASE 1/2 aún no está aplicado en PostgreSQL.')
      else setErrorListado(error instanceof ApiError ? error.message : 'No se pudo listar usuarios.')
    } finally {
      setCargandoUsuarios(false)
    }
  }, [token])

  useEffect(() => {
    void cargarUsuarios()
  }, [cargarUsuarios])

  const cargarDetalle = useCallback(async (usuarioId: number) => {
    if (!token) return
    setCargandoDetalle(true)
    setErrorDetalle(undefined)
    try {
      const datos = await listarHabilitadosDe(token, usuarioId)
      setDetalle(datos.modulos)
      const historialDatos = await listarHistorial(token, usuarioId)
      setHistorial(historialDatos.historial)
    } catch (error) {
      setDetalle(null)
      setErrorDetalle(error instanceof ApiError ? error.message : 'No se pudo cargar el detalle.')
    } finally {
      setCargandoDetalle(false)
    }
  }, [token])

  const abrirCambio = (modulo: ModuloDetalle, destino: boolean) => {
    setPendiente({ modulo, destino })
    setMotivo('')
    setAviso(undefined)
  }

  const confirmarCambio = async () => {
    if (!token || !seleccionado || !pendiente) return
    setEnviandoCambio(true)
    setAviso(undefined)
    try {
      const respuesta = await cambiarEstado(token, {
        usuario_id: seleccionado.id,
        modulo_codigo: pendiente.modulo.codigo,
        habilitado: pendiente.destino,
        motivo: motivo.trim() || undefined,
      })
      setPendiente(null)
      setAviso(respuesta.message)
      await cargarDetalle(seleccionado.id)
    } catch (error) {
      setAviso(error instanceof ApiError ? error.message : 'No se pudo aplicar el cambio.')
    } finally {
      setEnviandoCambio(false)
    }
  }

  return (
    <div className="animate-blurred-fade-in space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-950 sm:text-3xl">{module.label}</h1>
          <p className="mt-1 max-w-2xl text-sm text-navy-500">{module.description}</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-navy-700 ring-1 ring-navy-100">
          <Icon name="lock" className="h-3.5 w-3.5 text-navy-400" />
          Autorización validada en el servidor
        </span>
      </header>

      {bloqueoListado && (
        <div className="flex items-start gap-3 rounded-2xl border border-pineapple-200 bg-pineapple-50 p-4 text-sm text-pineapple-800" role="status">
          <Icon name="clock" className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{bloqueoListado} Los seeders y el SQL están listos; falta tu autorización para ejecutarlos.</p>
        </div>
      )}

      {errorListado && !bloqueoListado && (
        <StatusError>{errorListado}</StatusError>
      )}

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* --- Usuarios del ámbito administrable (mismo ámbito empresarial) --- */}
        <section
          aria-label="Usuarios administrables"
          className="rounded-2xl bg-white shadow-sm ring-1 ring-navy-100"
        >
          <header className="border-b border-navy-100 px-4 py-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-navy-500">
              Usuarios de tus empresas
            </h2>
          </header>
          <div className="max-h-[560px] overflow-y-auto p-2">
            {cargandoUsuarios ? (
              <Cargando />
            ) : usuarios.length === 0 ? (
              <p className="p-4 text-sm text-navy-500">
                No hay otros usuarios en las empresas que administras
                {user ? ` (${user.empresas[0]?.razon_social ?? 'sin empresa'})` : ''}.
              </p>
            ) : (
              <ul className="space-y-1">
                {usuarios.map((usuarioItem) => (
                  <li key={usuarioItem.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSeleccionado(usuarioItem)
                        setDetalle(null)
                        setHistorial([])
                        setPendiente(null)
                        void cargarDetalle(usuarioItem.id)
                      }}
                      className={`w-full rounded-xl px-3 py-2.5 text-left transition-colors duration-150 ${
                        seleccionado?.id === usuarioItem.id
                          ? 'bg-navy-900 text-white'
                          : 'hover:bg-navy-50'
                      }`}
                    >
                      <span className={`block truncate text-sm font-semibold ${seleccionado?.id === usuarioItem.id ? 'text-white' : 'text-navy-900'}`}>
                        {usuarioItem.nombre_completo}
                      </span>
                      <span className={`block truncate text-xs ${seleccionado?.id === usuarioItem.id ? 'text-navy-200' : 'text-navy-500'}`}>
                        {usuarioItem.correo} · {usuarioItem.empresas_comunes} {usuarioItem.empresas_comunes === 1 ? 'empresa común' : 'empresas comunes'}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* --- Detalle de módulos del usuario seleccionado --- */}
        <section aria-label="Módulos del usuario seleccionado" className="space-y-4">
          {!seleccionado ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 text-navy-300 ring-1 ring-navy-100">
                <Icon name="users" className="h-7 w-7" />
              </span>
              <p className="mt-4 text-sm text-navy-500">
                Selecciona un usuario para ver sus módulos habilitados y administrar su acceso.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy-100">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-navy-950">{seleccionado.nombre_completo}</p>
                  <p className="truncate text-xs text-navy-500">{seleccionado.correo}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${seleccionado.activo ? 'bg-emerald-50 text-emerald-600 ring-emerald-200' : 'bg-red-50 text-red-600 ring-red-200'}`}>
                  {seleccionado.activo ? 'Cuenta activa' : 'Cuenta inactiva'}
                </span>
              </div>

              {aviso && (
                <div className="rounded-xl border border-navy-100 bg-navy-50 px-4 py-3 text-sm text-navy-700" role="status">
                  {aviso}
                </div>
              )}

              {cargandoDetalle ? (
                <Cargando />
              ) : errorDetalle ? (
                <StatusError>{errorDetalle}</StatusError>
              ) : detalle === null ? null : (
                <>
                  <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy-100">
                    <table className="min-w-full divide-y divide-navy-100 text-sm">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Módulo</th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Origen</th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Estado</th>
                          <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-navy-500">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-navy-50">
                        {detalle.map((moduloDetalle) => (
                          <tr key={moduloDetalle.codigo}>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-navy-900">{moduloDetalle.nombre || moduloDetalle.slug}</p>
                              <p className="text-xs text-navy-400 font-mono">{moduloDetalle.codigo}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${ORIGEN[moduloDetalle.origen]?.clase ?? 'bg-navy-50 text-navy-600 ring-1 ring-navy-200'}`}>
                                {ORIGEN[moduloDetalle.origen]?.label ?? moduloDetalle.origen}
                              </span>
                              {moduloDetalle.estado === 'EN_DESARROLLO' && (
                                <span className="ml-1.5 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider bg-pineapple-50 text-pineapple-700 ring-1 ring-pineapple-200">
                                  En desarrollo
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <EstadoSwitch
                                habilitado={moduloDetalle.habilitado}
                                bloqueado={moduloDetalle.estado === 'INACTIVO'}
                              />
                            </td>
                            <td className="px-4 py-3 text-right">
                              {moduloDetalle.estado !== 'INACTIVO' && (
                                <button
                                  type="button"
                                  onClick={() => abrirCambio(moduloDetalle, !moduloDetalle.habilitado)}
                                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 transition-colors duration-150 ${
                                    moduloDetalle.habilitado
                                      ? 'text-red-600 ring-red-200 hover:bg-red-50'
                                      : 'text-emerald-700 ring-emerald-200 hover:bg-emerald-50'
                                  }`}
                                >
                                  {moduloDetalle.habilitado ? 'Deshabilitar' : 'Habilitar'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <HistorialPanel historial={historial} />
                </>
              )}
            </>
          )}
        </section>
      </div>

      {/* Confirmación con motivo (trazabilidad cambiado_por + motivo) */}
      {pendiente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={() => (enviandoCambio ? undefined : setPendiente(null))} aria-hidden="true" />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-navy-100">
            <h2 className="text-lg font-bold text-navy-950">
              {pendiente.destino ? 'Habilitar módulo' : 'Deshabilitar módulo'}
            </h2>
            <p className="mt-1 text-sm text-navy-600">
              <strong>{pendiente.modulo.nombre || pendiente.modulo.slug}</strong> para{' '}
              <strong>{seleccionado?.nombre_completo}</strong>. El cambio queda registrado en la
              bitácora con tu usuario como responsable.
            </p>
            <label className="mt-4 block text-sm font-medium text-navy-900" htmlFor="motivo-cambio">
              Motivo (opcional)
            </label>
            <input
              id="motivo-cambio"
              type="text"
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
              maxLength={255}
              placeholder="Ej.: Solicitado por el departamento contable"
              className="mt-1.5 w-full rounded-xl border border-navy-100 bg-neutral-100/80 px-4 py-2.5 text-sm text-navy-950 outline-none transition-all duration-200 placeholder:text-navy-300 focus:border-pineapple-300 focus:bg-white focus:ring-2 focus:ring-pineapple-200"
            />
            {aviso && <p className="mt-3 text-sm font-medium text-red-600">{aviso}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendiente(null)}
                disabled={enviandoCambio}
                className="rounded-xl border border-navy-200 px-4 py-2.5 text-sm font-semibold text-navy-700 transition-colors duration-200 hover:bg-navy-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void confirmarCambio()}
                disabled={enviandoCambio}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 ${
                  pendiente.destino ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
                }`}
              >
                {enviandoCambio ? 'Aplicando…' : pendiente.destino ? 'Confirmar habilitación' : 'Confirmar deshabilitación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EstadoSwitch({ habilitado, bloqueado }: { habilitado: boolean; bloqueado: boolean }) {
  if (bloqueado) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-500 ring-1 ring-navy-100">
        Inactivo en catálogo
      </span>
    )
  }
  return habilitado ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-200">
      <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
      Habilitado
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-200">
      <span className="h-2 w-2 rounded-full bg-red-400" aria-hidden="true" />
      Deshabilitado
    </span>
  )
}

function HistorialPanel({ historial }: { historial: HistorialCambio[] }) {
  if (historial.length === 0) return null
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy-100" aria-label="Historial de cambios">
      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-navy-500">
        <Icon name="clock" className="h-4 w-4" />
        Bitácora de cambios (inmutable)
      </h3>
      <ul className="mt-3 space-y-2 text-sm">
        {historial.slice(0, 15).map((cambio, indice) => (
          <li key={`${cambio.registrado_en}-${cambio.modulo_codigo}-${indice}`} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-navy-50/60 px-3 py-2">
            <span className="text-navy-800">
              <strong>{cambio.modulo_codigo}</strong> ·{' '}
              {cambio.estado_anterior === null ? 'Registro inicial' : cambio.estado_anterior ? 'Deshabilitado → Habilitado' : 'Habilitado → Deshabilitado'}
              {cambio.motivo ? ` · ${cambio.motivo}` : ''}
            </span>
            <span className="text-xs text-navy-400">
              {cambio.administrador ? `${cambio.administrador} · ` : ''}
              {new Date(cambio.registrado_en).toLocaleString('es-BO')}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Cargando() {
  return (
    <div className="flex items-center justify-center p-8" role="status">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-navy-200 border-t-pineapple-500" aria-hidden="true" />
      <span className="sr-only">Cargando…</span>
    </div>
  )
}

function StatusError({ children }: { children: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
      <Icon name="shield" className="mt-0.5 h-5 w-5 shrink-0" />
      <p>{children}</p>
    </div>
  )
}
