import { useState, type FormEvent } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Icon, { type IconName } from '../components/ui/Icon'
import { useAuth } from '../context/AuthContext'
import { HOME_ROUTE } from '../utils/routes'
import { initialsOf, roleLabel } from '../utils/format'
import { activar2FA, actualizarPerfil, cambiarContrasena, preparar2FA, type Setup2FA } from '../services/authApi'
import { ApiError } from '../services/http'

/**
 * Página dedicada de configuración de la cuenta (FASE F).
 *
 * Aquí vive TODO lo personal del usuario (antes estaba comprimido en el
 * panel "Mi cuenta · Ficha del usuario" del inicio, retirado de allí):
 *   - Ficha: avatar, nombre y correo editables, empresa(s) y rol.
 *   - Seguridad: cambio de contraseña con revocación del resto de sesiones.
 *   - 2FA: preparación (secreto/URI) y activación del segundo factor; las
 *     cuentas nuevas llegan con TOTP pendiente y contraseña temporal.
 */
export default function UsuarioConfiguracion() {
  const { user, token, refrescarSesion } = useAuth()

  const [editandoNombre, setEditandoNombre] = useState(false)
  const [nombreBorrador, setNombreBorrador] = useState('')
  const [guardandoNombre, setGuardandoNombre] = useState(false)
  const [errorNombre, setErrorNombre] = useState<string | undefined>()
  const [mensajeNombre, setMensajeNombre] = useState<string | undefined>()

  const [editandoCorreo, setEditandoCorreo] = useState(false)
  const [correoBorrador, setCorreoBorrador] = useState('')
  const [guardandoCorreo, setGuardandoCorreo] = useState(false)
  const [errorCorreo, setErrorCorreo] = useState<string | undefined>()
  const [mensajeCorreo, setMensajeCorreo] = useState<string | undefined>()

  const [claveActual, setClaveActual] = useState('')
  const [claveNueva, setClaveNueva] = useState('')
  const [claveRepetir, setClaveRepetir] = useState('')
  const [guardandoClave, setGuardandoClave] = useState(false)
  const [mensajeClave, setMensajeClave] = useState<string | undefined>()
  const [errorClave, setErrorClave] = useState<string | undefined>()

  /* Estado del setup 2FA de esta instancia de página. */
  const [setup2FA, setSetup2FA] = useState<Setup2FA | null>(null)
  const [codigo2FA, setCodigo2FA] = useState('')
  const [trabajando2FA, setTrabajando2FA] = useState(false)
  const [error2FA, setError2FA] = useState<string | undefined>()
  const [mensaje2FA, setMensaje2FA] = useState<string | undefined>()

  if (!user) return null

  const iniciando: boolean = user.requiereCambioContrasena === true || user.totpPendiente === true

  const iniciarEdicionNombre = () => {
    setNombreBorrador(user.name)
    setErrorNombre(undefined)
    setMensajeNombre(undefined)
    setEditandoNombre(true)
  }

  const guardarNombre = async (evento: FormEvent) => {
    evento.preventDefault()
    if (!token) return
    const nombre = nombreBorrador.trim()
    if (!nombre) {
      setErrorNombre('El nombre no puede quedar vacío.')
      return
    }
    setGuardandoNombre(true)
    setErrorNombre(undefined)
    try {
      await actualizarPerfil(token, { nombre_completo: nombre })
      setEditandoNombre(false)
      setMensajeNombre('Nombre actualizado correctamente.')
      await refrescarSesion()
    } catch (error) {
      setErrorNombre(error instanceof ApiError ? error.message : 'No se pudo actualizar el nombre.')
    } finally {
      setGuardandoNombre(false)
    }
  }

  const iniciarEdicionCorreo = () => {
    setCorreoBorrador(user.email)
    setErrorCorreo(undefined)
    setMensajeCorreo(undefined)
    setEditandoCorreo(true)
  }

  const guardarCorreo = async () => {
    if (!token) return
    const correo = correoBorrador.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setErrorCorreo('Ingresa un correo válido.')
      return
    }
    setGuardandoCorreo(true)
    setErrorCorreo(undefined)
    try {
      await actualizarPerfil(token, { correo })
      setEditandoCorreo(false)
      setMensajeCorreo('Correo actualizado correctamente.')
      await refrescarSesion()
    } catch (error) {
      setErrorCorreo(error instanceof ApiError ? error.message : 'No se pudo actualizar el correo.')
    } finally {
      setGuardandoCorreo(false)
    }
  }

  /* ---------------------------------------------------------------- */
  /* Segundo factor (TOTP)                                            */
  /* ---------------------------------------------------------------- */

  const traerSetup2FA = async () => {
    if (!token) return
    setTrabajando2FA(true)
    setError2FA(undefined)
    try {
      setSetup2FA(await preparar2FA(token))
    } catch (error) {
      setError2FA(error instanceof ApiError ? error.message : 'No se pudo iniciar el 2FA.')
    } finally {
      setTrabajando2FA(false)
    }
  }

  const confirmar2FA = async () => {
    if (!token) return
    const codigo = codigo2FA.replace(/\s+/g, '')
    if (!/^\d{6}$/.test(codigo)) {
      setError2FA('El código tiene 6 dígitos numéricos.')
      return
    }
    setTrabajando2FA(true)
    setError2FA(undefined)
    try {
      setMensaje2FA(await activar2FA(token, codigo))
      setSetup2FA(null)
      setCodigo2FA('')
      await refrescarSesion()
    } catch (error) {
      setError2FA(error instanceof ApiError ? error.message : 'No se pudo activar el 2FA.')
    } finally {
      setTrabajando2FA(false)
    }
  }

  const cambiarClave = async (evento: FormEvent) => {
    evento.preventDefault()
    if (!token) return
    setErrorClave(undefined)
    if (claveNueva.length < 8) {
      setErrorClave('La nueva contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (claveNueva !== claveRepetir) {
      setErrorClave('Las contraseñas nuevas no coinciden.')
      return
    }
    setGuardandoClave(true)
    setMensajeClave(undefined)
    try {
      const mensaje = await cambiarContrasena(token, claveActual, claveNueva)
      setMensajeClave(mensaje)
      setClaveActual('')
      setClaveNueva('')
      setClaveRepetir('')
    } catch (error) {
      setErrorClave(error instanceof ApiError ? error.message : 'No se pudo cambiar la contraseña.')
    } finally {
      setGuardandoClave(false)
    }
  }

  return (
    <DashboardLayout activeSlug="">
      <div className="space-y-6 animate-blurred-fade-in">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-navy-950 sm:text-3xl">
              Configuración de cuenta
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-navy-500">
              Personaliza tu nombre visible y administra la seguridad de tu cuenta. Los
              cambios se aplican en el servidor, no sólo en esta pantalla.
            </p>
          </div>
          <a
            href={HOME_ROUTE}
            className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-navy-700 ring-1 ring-navy-100 transition-colors hover:bg-navy-50"
          >
            <Icon name="arrow-right" className="h-3.5 w-3.5 rotate-180 text-navy-400" />
            Volver al inicio
          </a>
        </header>

        {iniciando && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-medium text-amber-800" role="alert">
            <Icon name="shield" className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <p>
              Tu cuenta aún no está completamente configurada. Completa a continuación el
              cambio de contraseña temporal y la activación del segundo factor (2FA) para
              poder usar el resto del sistema.
            </p>
          </div>
        )}

        {mensajeNombre && <AvisoCorrecto>{mensajeNombre}</AvisoCorrecto>}
        {mensajeCorreo && <AvisoCorrecto>{mensajeCorreo}</AvisoCorrecto>}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* ---------------------------------------------------------- */}
          {/* Ficha del usuario (antes: panel "Mi cuenta" del inicio)      */}
          {/* ---------------------------------------------------------- */}
          <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy-100">
            <header className="relative bg-navy-950 px-6 pb-6 pt-6">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.06]"
                aria-hidden="true"
                style={{
                  backgroundImage:
                    'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                  backgroundSize: '36px 36px',
                }}
              />
              <div className="relative">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-pineapple-300">
                  Mi cuenta · Ficha del usuario
                </p>
                <h2 className="mt-1 text-base font-bold text-white">Datos del perfil</h2>
              </div>
            </header>

            <div className="px-6 pb-6 pt-0">
              <div className="-mt-10 flex items-end justify-between">
                <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-pineapple-400 text-2xl font-bold text-navy-950 shadow-lg ring-4 ring-white">
                  {initialsOf(user.name)}
                </span>
                <span className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-200">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                  Cuenta activa
                </span>
              </div>

              <div className="mt-4">
                {editandoNombre ? (
                  <form onSubmit={guardarNombre} className="flex items-center gap-2">
                    <input
                      value={nombreBorrador}
                      onChange={(e) => setNombreBorrador(e.target.value)}
                      maxLength={160}
                      autoFocus
                      className="min-w-0 flex-1 rounded-lg border border-navy-200 px-3 py-2 text-sm font-semibold text-navy-900 focus:border-pineapple-400 focus:outline-none focus:ring-2 focus:ring-pineapple-200"
                      aria-label="Nuevo nombre visible"
                    />
                    <button
                      type="submit"
                      disabled={guardandoNombre}
                      className="rounded-lg bg-pineapple-400 px-3 py-2 text-xs font-bold text-navy-950 transition hover:bg-pineapple-500 disabled:opacity-50"
                    >
                      {guardandoNombre ? 'Guardando…' : 'Guardar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditandoNombre(false)}
                      className="rounded-lg px-2 py-2 text-xs font-semibold text-navy-500 transition hover:text-navy-800"
                    >
                      Cancelar
                    </button>
                  </form>
                ) : (
                  <div className="group flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-bold text-navy-950">{user.name}</h3>
                      <p className="text-sm text-navy-500">{roleLabel(user.role)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={iniciarEdicionNombre}
                      title="Editar nombre visible"
                      className="mt-1 shrink-0 rounded-md p-1.5 text-navy-300 transition group-hover:bg-navy-50 group-hover:text-navy-600 hover:text-navy-600"
                    >
                      <Icon name="settings" className="h-4 w-4" />
                      <span className="sr-only">Editar nombre</span>
                    </button>
                  </div>
                )}
                {editandoNombre && errorNombre && (
                  <p className="mt-1 text-xs font-medium text-red-600" role="alert">{errorNombre}</p>
                )}
              </div>

              <dl className="mt-5 space-y-3.5 border-t border-navy-50 pt-5 text-sm">
                <div>
                  <Fila icono="mail" etiqueta="Correo electrónico" valor={user.email} />
                  <div className="mt-2 pl-11">
                    {editandoCorreo ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="email"
                          value={correoBorrador}
                          onChange={(e) => setCorreoBorrador(e.target.value)}
                          maxLength={120}
                          autoFocus
                          className="min-w-0 flex-1 rounded-lg border border-navy-200 px-3 py-1.5 text-sm focus:border-pineapple-400 focus:outline-none focus:ring-2 focus:ring-pineapple-200"
                          aria-label="Nuevo correo electrónico"
                        />
                        <button
                          type="button"
                          onClick={guardarCorreo}
                          disabled={guardandoCorreo}
                          className="rounded-lg bg-pineapple-400 px-3 py-1.5 text-xs font-bold text-navy-950 transition hover:bg-pineapple-500 disabled:opacity-50"
                        >
                          {guardandoCorreo ? 'Guardando…' : 'Guardar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setEditandoCorreo(false); setErrorCorreo(undefined) }}
                          className="rounded-lg px-2 py-1.5 text-xs font-semibold text-navy-500 transition hover:text-navy-800"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={iniciarEdicionCorreo}
                        className="text-xs font-semibold text-pineapple-600 transition hover:text-pineapple-700"
                      >
                        Cambiar correo
                      </button>
                    )}
                    {errorCorreo && (
                      <p className="mt-1 text-xs font-medium text-red-600" role="alert">{errorCorreo}</p>
                    )}
                  </div>
                </div>
                <Fila
                  icono="briefcase"
                  etiqueta="Empresas"
                  valor={user.empresas.map((e) => e.razon_social).join(', ') || 'Sin empresa asignada'}
                />
                <Fila icono="shield" etiqueta="Rol del sistema" valor={roleLabel(user.role)} />
                <Fila
                  icono="id-card"
                  etiqueta="ID de usuario"
                  valor={`#${String(user.id).padStart(4, '0')}`}
                />
              </dl>
            </div>
          </section>

          {/* ---------------------------------------------------------- */}
          {/* Seguridad: cambio de contraseña                              */}
          {/* ---------------------------------------------------------- */}
          <section className="rounded-2xl bg-white shadow-sm ring-1 ring-navy-100">
            <header className="flex items-center gap-3 border-b border-navy-100 px-6 py-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-950 text-pineapple-300">
                <Icon name="lock" className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-bold text-navy-950">Seguridad</h2>
                <p className="text-xs text-navy-500">Cambio de contraseña y sesiones</p>
              </div>
            </header>

            <form onSubmit={cambiarClave} className="space-y-3 px-6 py-5">
              <Campo
                tipo="password"
                etiqueta="Contraseña actual"
                valor={claveActual}
                onChange={setClaveActual}
                completado="current-password"
                requerido
              />
              <Campo
                tipo="password"
                etiqueta="Nueva contraseña (mín. 8 caracteres)"
                valor={claveNueva}
                onChange={setClaveNueva}
                completado="new-password"
                requerido
                minimo={8}
              />
              <Campo
                tipo="password"
                etiqueta="Repetir nueva contraseña"
                valor={claveRepetir}
                onChange={setClaveRepetir}
                completado="new-password"
                requerido
                minimo={8}
              />

              <button
                type="submit"
                disabled={guardandoClave}
                className="w-full rounded-lg bg-navy-950 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:opacity-50"
              >
                {guardandoClave ? 'Actualizando…' : 'Actualizar contraseña'}
              </button>

              {errorClave && (
                <p className="text-xs font-medium text-red-600" role="alert">{errorClave}</p>
              )}
              {mensajeClave && (
                <div className="rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200" role="status">
                  {mensajeClave} Se cerraron las demás sesiones abiertas en otros equipos;
                  la sesión actual se mantiene.
                </div>
              )}

              <p className="text-[11px] leading-relaxed text-navy-400">
                Por seguridad, la contraseña se guarda como hash bcrypt en el servidor
                (nunca en texto plano) y cada cambio de clave revoca los tokens de las
                demás sesiones activas de tu cuenta.
              </p>
            </form>
          </section>

          {/* ---------------------------------------------------------- */}
          {/* 2FA: preparación y activación (obligatorio en cuentas nuevas) */}
          {/* ---------------------------------------------------------- */}
          <section className="rounded-2xl bg-white shadow-sm ring-1 ring-navy-100">
            <header className="flex items-center gap-3 border-b border-navy-100 px-6 py-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-950 text-pineapple-300">
                <Icon name="key" className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-navy-950">Verificación en dos pasos</h2>
                <p className="text-xs text-navy-500">
                  {user.totpConfigurado
                    ? 'Código TOTP de 6 dígitos al iniciar sesión'
                    : 'Segundo factor obligatorio para cuentas nuevas'}
                </p>
              </div>
              <span
                className={`ml-auto rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${
                  user.totpConfigurado
                    ? 'bg-emerald-50 text-emerald-600 ring-emerald-200'
                    : 'bg-amber-50 text-amber-700 ring-amber-300'
                }`}
              >
                {user.totpConfigurado ? 'ACTIVO' : 'PENDIENTE'}
              </span>
            </header>

            <div className="px-6 py-5 text-sm">
              {user.totpConfigurado ? (
                <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
                  <Icon name="check-circle" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <p className="text-xs font-medium text-emerald-700">
                    Tu cuenta ya pide un código TOTP en cada inicio de sesión. Guarda tus
                    códigos de respaldo en un lugar seguro.
                  </p>
                </div>
              ) : setup2FA === null ? (
                <div className="space-y-3">
                  <p className="text-xs leading-relaxed text-navy-500">
                    Escanea un QR (o copia el secreto) en tu app autenticadora — por ejemplo
                    Google Authenticator — y confirma con el código de 6 dígitos. Sin este
                    paso la cuenta queda bloqueada en la configuración.
                  </p>
                  <button
                    type="button"
                    onClick={traerSetup2FA}
                    disabled={trabajando2FA}
                    className="rounded-lg bg-pineapple-400 px-4 py-2 text-xs font-bold text-navy-950 transition hover:bg-pineapple-500 disabled:opacity-50"
                  >
                    {trabajando2FA ? 'Preparando…' : 'Comenzar configuración del 2FA'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-xl bg-navy-50 p-3 ring-1 ring-navy-100">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-navy-400">Secreto (manual)</p>
                    <p className="mt-1 break-all font-mono text-xs text-navy-800" aria-label="Secreto TOTP en Base32">{setup2FA.secreto}</p>
                  </div>
                  <p className="text-[11px] text-navy-400">URI otpauth (para apps avanzadas):</p>
                  <p className="break-all font-mono text-[10px] leading-relaxed text-navy-600" aria-label="URI otpauth">{setup2FA.otpauth_uri}</p>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-navy-600">Código de la app (6 dígitos)</span>
                    <input
                      value={codigo2FA}
                      onChange={(e) => setCodigo2FA(e.target.value)}
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      autoFocus
                      className="max-w-[9rem] rounded-lg border border-navy-200 px-3 py-2 text-center font-mono text-lg tracking-[0.3em] focus:border-pineapple-400 focus:outline-none focus:ring-2 focus:ring-pineapple-200"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={confirmar2FA}
                    disabled={trabajando2FA}
                    className="rounded-lg bg-navy-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-navy-800 disabled:opacity-50"
                  >
                    {trabajando2FA ? 'Verificando…' : 'Confirmar y activar 2FA'}
                  </button>
                </div>
              )}

              {error2FA && (
                <p className="mt-3 text-xs font-medium text-red-600" role="alert">{error2FA}</p>
              )}
              {mensaje2FA && (
                <div className="mt-3" role="status">
                  <AvisoCorrecto>{mensaje2FA}</AvisoCorrecto>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}

/* ---------------------------------------------------------------------- */
/* Piezas locales de la página                                            */
/* ---------------------------------------------------------------------- */

function Fila({ icono, etiqueta, valor }: { icono: IconName; etiqueta: string; valor: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-300 ring-1 ring-navy-100">
        <Icon name={icono} className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] font-bold uppercase tracking-widest text-navy-400">{etiqueta}</dt>
        <dd className="truncate font-medium text-navy-800">{valor}</dd>
      </div>
    </div>
  )
}

function Campo({ tipo, etiqueta, valor, onChange, completado, requerido, minimo }: {
  tipo: string
  etiqueta: string
  valor: string
  onChange: (v: string) => void
  completado: string
  requerido?: boolean
  minimo?: number
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-navy-600">{etiqueta}</span>
      <input
        type={tipo}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={completado}
        required={requerido}
        minLength={minimo}
        className="w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm focus:border-pineapple-400 focus:outline-none focus:ring-2 focus:ring-pineapple-200"
      />
    </label>
  )
}

function AvisoCorrecto({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700" role="status">
      <Icon name="check-circle" className="h-5 w-5 shrink-0" />
      <p>{children}</p>
    </div>
  )
}
