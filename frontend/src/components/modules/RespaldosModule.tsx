import { useCallback, useEffect, useMemo, useState } from 'react'
import Icon, { type IconName } from '../ui/Icon'
import type { ModuleLink } from '../../types/dashboard'
import { useAuth } from '../../context/AuthContext'
import { listarRespaldos, type EstadoRespaldo, type RespaldoItem } from '../../services/respaldosApi'
import { ApiError, apiDescarga } from '../../services/http'

/** Etiquetas y colores por estado del respaldo (CHECK de 03_respaldos.sql). */
const ESTADO: Record<EstadoRespaldo, { label: string; clase: string; icono: IconName }> = {
  EXITOSO: { label: 'Exitoso', clase: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', icono: 'check-circle' },
  FALLIDO: { label: 'Fallido', clase: 'bg-red-50 text-red-600 ring-1 ring-red-200', icono: 'alert-triangle' },
  EN_PROCESO: { label: 'En progreso', clase: 'bg-pineapple-50 text-pineapple-700 ring-1 ring-pineapple-200', icono: 'clock' },
}

function fechaCompleta(iso: string): string {
  return new Date(iso).toLocaleDateString('es-BO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function relativo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const dias = Math.floor(diff / 86_400_000)
  if (dias >= 30) {
    const meses = Math.floor(dias / 30)
    return `hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`
  }
  if (dias >= 1) return `hace ${dias} día${dias > 1 ? 's' : ''}`
  const horas = Math.max(0, Math.floor(diff / 3_600_000))
  if (horas >= 1) return `hace ${horas} h`
  const minutos = Math.max(0, Math.floor(diff / 60_000))
  return minutos > 0 ? `hace ${minutos} min` : 'hace instantes'
}

function tamano(bytes: number): string {
  if (bytes <= 0) return 'N/A'
  const gb = bytes / 1024 ** 3
  if (gb >= 1) return `${gb.toFixed(1)} GB`
  const mb = bytes / 1024 ** 2
  if (mb >= 1) return `${mb.toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

/** Panel REAL del módulo respaldos: fechas y estados del registro de backups. */
export default function RespaldosModule({ module }: { module: ModuleLink }) {
  const { token } = useAuth()

  const [respaldos, setRespaldos] = useState<RespaldoItem[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | undefined>()

  const [busqueda, setBusqueda] = useState('')
  const [busquedaAplicada, setBusquedaAplicada] = useState('')
  const [descargandoPdf, setDescargandoPdf] = useState(false)

  /* Reporte PDF del registro (dompdf en el backend). */
  const descargarPdf = async () => {
    if (!token) return
    setDescargandoPdf(true)
    try {
      const ruta = busquedaAplicada
        ? `/respaldos/pdf?busqueda=${encodeURIComponent(busquedaAplicada)}`
        : '/respaldos/pdf'
      await apiDescarga(token, ruta, 'respaldos_visualgas.pdf')
    } catch (excepcion) {
      setError(excepcion instanceof ApiError ? excepcion.message : 'No se pudo descargar el reporte.')
    } finally {
      setDescargandoPdf(false)
    }
  }

  const listar = useCallback(async (busquedaActual: string) => {
    if (!token) return
    setCargando(true)
    setError(undefined)
    try {
      const datos = await listarRespaldos(token, busquedaActual || undefined)
      setRespaldos(datos.respaldos)
    } catch (exception) {
      setError(exception instanceof ApiError ? exception.message : 'No se pudo listar los respaldos.')
    } finally {
      setCargando(false)
    }
  }, [token])

  useEffect(() => {
    void listar(busquedaAplicada)
  }, [listar, busquedaAplicada])

  const aplicarBusqueda = () => setBusquedaAplicada(busqueda)

  const resumen = useMemo(() => {
    const exitosos = respaldos.filter((r) => r.estado === 'EXITOSO').length
    const ultimo = respaldos[0] ?? null
    return {
      total: respaldos.length,
      exitosos,
      fallidos: respaldos.filter((r) => r.estado === 'FALLIDO').length,
      ultimo,
    }
  }, [respaldos])

  return (
    <div className="space-y-6 animate-blurred-fade-in">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-950 sm:text-3xl">{module.label}</h1>
          <p className="mt-1 max-w-2xl text-sm text-navy-500">{module.description}</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-navy-700 ring-1 ring-navy-100">
          <Icon name="database" className="h-3.5 w-3.5 text-navy-400" />
          Registro servido por el backend (test.respaldos)
        </span>
      </header>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={descargarPdf}
          disabled={descargandoPdf}
          className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-navy-700 ring-1 ring-navy-100 transition-colors hover:bg-navy-50 disabled:opacity-50"
        >
          <Icon name="file-text" className="h-3.5 w-3.5 text-navy-400" />
          {descargandoPdf ? 'Generando PDF…' : 'Descargar reporte PDF'}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
          <Icon name="alert-triangle" className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* --- KPIs del histórico de respaldos --- */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi titulo="Registros mostrados" valor={String(resumen.total)} icono="database" />
        <Kpi titulo="Respaldo más reciente" valor={resumen.ultimo ? relativo(resumen.ultimo.respaldado_en) : 'Sin registros'} icono="clock" aclaracion={resumen.ultimo?.nombre} />
        <Kpi titulo="Exitosos" valor={String(resumen.exitosos)} icono="check-circle" tono="positivo" />
        <Kpi titulo="Fallidos" valor={String(resumen.fallidos)} icono="alert-triangle" tono={resumen.fallidos > 0 ? 'alerta' : 'neutro'} />
      </div>

      {/* --- Búsqueda + tabla --- */}
      <section className="rounded-2xl bg-white shadow-sm ring-1 ring-navy-100">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-100 px-5 py-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-navy-500">
            Historial de respaldos
          </h2>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              aplicarBusqueda()
            }}
          >
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o descripción"
              className="w-64 rounded-lg border border-navy-200 px-3 py-1.5 text-sm text-navy-900 placeholder:text-navy-300 focus:border-pineapple-400 focus:outline-none focus:ring-2 focus:ring-pineapple-200"
              aria-label="Buscar respaldos"
            />
            <button
              type="submit"
              className="rounded-lg bg-navy-950 px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
            >
              Buscar
            </button>
          </form>
        </header>

        <div className="p-2">
          {cargando ? (
            <div className="flex w-full items-center justify-center gap-3 py-14 text-sm font-medium text-navy-400">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
              Cargando respaldos…
            </div>
          ) : respaldos.length === 0 ? (
            <p className="py-14 text-center text-sm text-navy-500">
              {busquedaAplicada ? 'No hay respaldos que coincidan con la búsqueda.' : 'Aún no hay respaldos registrados.'}
            </p>
          ) : (
            <ul className="divide-y divide-navy-50">
              {respaldos.map((respaldo) => (
                <li key={respaldo.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3.5 transition-colors hover:bg-navy-50/50">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-400 ring-1 ring-navy-100">
                    <Icon name="database" className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-navy-900">{respaldo.nombre}</p>
                    <p className="truncate text-xs text-navy-500">{respaldo.descripcion ?? 'Sin descripción'}</p>
                  </div>
                  <span className="text-xs text-navy-500">
                    {fechaCompleta(respaldo.respaldado_en)} · {relativo(respaldo.respaldado_en)}
                  </span>
                  <span className="min-w-16 text-right text-xs font-medium tabular-nums text-navy-700">
                    {tamano(respaldo.tamano_bytes)}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${ESTADO[respaldo.estado].clase}`}>
                    {ESTADO[respaldo.estado].label}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <p className="text-xs text-navy-400">
        El respaldo del sistema se ejecuta por el ciclo del servidor; la interfaz consulta
        fechas y estados (R01 de database/sql/03_respaldos.sql).
      </p>
    </div>
  )
}

function Kpi({ titulo, valor, icono, aclaracion, tono = 'neutro' }: {
  titulo: string
  valor: string
  icono: IconName
  aclaracion?: string
  tono?: 'neutro' | 'positivo' | 'alerta'
}) {
  const banda =
    tono === 'positivo'
      ? 'text-emerald-600 bg-emerald-50 ring-emerald-200'
      : tono === 'alerta'
        ? 'text-red-600 bg-red-50 ring-red-200'
        : 'text-navy-500 bg-navy-50 ring-navy-200'
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy-100">
      <div className="flex items-center gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ring-1 ${banda}`}>
          <Icon name={icono} className="h-4 w-4" />
        </span>
        <p className="text-xs font-bold uppercase tracking-widest text-navy-500">{titulo}</p>
      </div>
      <p className="mt-3 text-xl font-bold text-navy-950">{valor}</p>
      {aclaracion && <p className="mt-0.5 truncate text-xs text-navy-400">{aclaracion}</p>}
    </div>
  )
}
