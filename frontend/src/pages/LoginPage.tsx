import { useEffect, useState, type FormEvent } from 'react'
import useLoginForm, { validateEmail } from '../hooks/useLoginForm'
import useSound from '../hooks/useSound'
import { useAuth } from '../context/AuthContext'
import TextField from '../components/login/TextField'
import PasswordToggle from '../components/login/PasswordToggle'
import SubmitButton from '../components/login/SubmitButton'
import StatusMessage from '../components/login/StatusMessage'
import DemoCredentialsHint from '../components/login/DemoCredentialsHint'
import SoundToggle from '../components/login/SoundToggle'
import BrandPanel from '../components/login/BrandPanel'
import { solicitarRecuperacion, restablecerContrasena } from '../services/authApi'
import { ApiError } from '../services/http'
import type { LoginFormErrors } from '../types/login'
import loadSpinnerUrl from '../assets/loadingspinner.png'
import logoNewUrl from '../assets/logo.new.png'

const HOME_ROUTE = '#/'
const LOGIN_ROUTE = '#/login'
const LANDING_ROUTE = '#/landing'

export type LoginPageMode = 'login' | 'recover'

/** Página de acceso — identidad corporativa BAP SRL. */
export default function LoginPage({ mode = 'login' }: { mode?: LoginPageMode }) {
  const { user } = useAuth()
  const { enabled, play, toggle } = useSound()
  const form = useLoginForm(play)

  useEffect(() => {
    if (form.status !== 'success') return
    const timer = window.setTimeout(() => {
      window.location.hash = HOME_ROUTE
    }, 1800)
    return () => window.clearTimeout(timer)
  }, [form.status])

  return (
    <div className="grid min-h-screen bg-neutral-100 font-sans text-navy-950 antialiased lg:grid-cols-[1fr_1.05fr]">
      <BrandPanel />

      <main className="relative flex flex-col items-center justify-center px-4 py-10 sm:px-8">
        <SoundToggle enabled={enabled} onToggle={toggle} />

        <a href={HOME_ROUTE} className="mb-8 flex animate-fade-in-down items-center gap-3 lg:hidden">
          <img src={logoNewUrl} alt="BAP SRL" className="h-8 w-auto object-contain" />
        </a>

        <section className="w-full max-w-md animate-blurred-fade-in">
          <div className="relative rounded-2xl bg-white p-8 shadow-xl shadow-navy-900/5 ring-1 ring-navy-100/80 sm:p-10">
            {mode === 'login' ? (
              <LoginView {...form} status={form.status} userName={user?.name} />
            ) : (
              <RecoverView />
            )}
          </div>

          <p className="mt-6 animate-fade-in text-center text-xs text-navy-400">
            © {new Date().getFullYear()} BAP SRL · Sistema contable VisualGas
          </p>
        </section>
      </main>
    </div>
  )
}

function buildErrorMessage(errors: LoginFormErrors, mensajeServidor?: string): string {
  if (mensajeServidor) return mensajeServidor
  const firstError = errors.email ?? errors.password
  return firstError ?? 'Credenciales incorrectas. Verifica tu correo y contraseña.'
}

type FormApi = ReturnType<typeof useLoginForm>

function LoginView({
  values,
  errors,
  status,
  showPassword,
  submitAttempt,
  mensajeServidor,
  desafioTotp,
  verificando2fa,
  updateField,
  handleBlur,
  handleSubmit,
  toggleShowPassword,
  updateRememberMe,
  verificarDesafio2FA,
  cancelarTotp,
  userName,
}: FormApi & { userName?: string }) {
  return (
    <>
      {status === 'totp' && desafioTotp ? (
        <TotpView
          expiracionMinutos={desafioTotp.expiracion_minutos}
          verificando={verificando2fa}
          mensajeError={mensajeServidor}
          onConfirmar={verificarDesafio2FA}
          onCancelar={cancelarTotp}
        />
      ) : (
        <>
          <header className="mb-8">
            <h1 className="animate-fade-in-up text-2xl font-bold tracking-tight text-navy-900" style={{ animationDelay: '150ms' }}>
              Accede a tu sistema
            </h1>
            <p className="mt-2 animate-fade-in-up text-sm leading-relaxed text-navy-600" style={{ animationDelay: '250ms' }}>
              Ingresa tus credenciales para administrar la contabilidad de tu empresa con VisualGas.
            </p>
          </header>

          <div key={submitAttempt} className={submitAttempt > 0 ? 'animate-shake' : undefined}>
            <form onSubmit={handleSubmit} className="space-y-5" aria-busy={status === 'loading'}>
              <TextField
                type="email"
                label="Correo electrónico"
                placeholder="tucorreo@empresa.com"
                autoComplete="email"
                value={values.email}
                onChange={updateField('email')}
                onBlur={handleBlur('email')}
                error={errors.email}
              />

              <TextField
                type={showPassword ? 'text' : 'password'}
                label="Contraseña"
                placeholder="••••••••"
                autoComplete="current-password"
                value={values.password}
                onChange={updateField('password')}
                onBlur={handleBlur('password')}
                error={errors.password}
                trailing={<PasswordToggle show={showPassword} onToggle={toggleShowPassword} />}
              />

              <div className="flex items-center justify-between gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-navy-700">
                  <input
                    type="checkbox"
                    checked={values.rememberMe}
                    onChange={(event) => updateRememberMe(event.target.checked)}
                    className="h-4 w-4 cursor-pointer accent-pineapple-500"
                  />
                  Recordar sesión
                </label>
                <a
                  href="#/recuperar-contrasena"
                  className="text-sm font-medium text-navy-500 transition-colors duration-300 hover:text-pineapple-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pineapple-500"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <SubmitButton loading={status === 'loading'} />
              </div>
            </form>
          </div>

          {status !== 'success' && (
            <footer className="mt-8 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
              <DemoCredentialsHint />
              <a
                href={LANDING_ROUTE}
                className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-navy-400 transition-colors duration-300 hover:text-navy-700"
              >
                <span aria-hidden="true">←</span> Sitio web corporativo
              </a>
            </footer>
          )}

          {status !== 'idle' && status !== 'success' && (
            <div className="mt-6" aria-live="polite">
              {status === 'error' && (
                <StatusMessage status="error">{buildErrorMessage(errors, mensajeServidor)}</StatusMessage>
              )}
              {status === 'loading' && (
                <p role="status" className="flex animate-fade-in items-center justify-center gap-2 text-center text-sm text-navy-500">
                  <img src={loadSpinnerUrl} alt="" aria-hidden="true" className="h-4 w-4 animate-spin" />
                  Verificando tus credenciales…
                </p>
              )}
            </div>
          )}

          {status === 'success' && (
            <div className="mt-6">
              <StatusMessage status="success">
                Acceso correcto. Bienvenido, <strong>{userName}</strong>. Redirigiendo…
              </StatusMessage>
            </div>
          )}
        </>
      )}
    </>
  )
}

/** Paso 2FA: código del autenticador (TOTP) o código de respaldo. */
function TotpView({
  expiracionMinutos,
  verificando,
  mensajeError,
  onConfirmar,
  onCancelar,
}: {
  expiracionMinutos: number
  verificando: boolean
  mensajeError?: string
  onConfirmar: (codigo: string) => void
  onCancelar: () => void
}) {
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState<string | undefined>()

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const limpio = codigo.trim().replace(/\s+/g, '')
    if (!limpio) {
      setError('Ingresa el código de tu autenticador.')
      return
    }
    setError(undefined)
    onConfirmar(limpio)
  }

  return (
    <>
      <header className="mb-8">
        <h1 className="animate-fade-in-up text-2xl font-bold tracking-tight text-navy-900" style={{ animationDelay: '150ms' }}>
          Verificación en dos pasos
        </h1>
        <p className="mt-2 animate-fade-in-up text-sm leading-relaxed text-navy-600" style={{ animationDelay: '250ms' }}>
          Ingresa el código de tu autenticador (o un código de respaldo). El desafío vence en{' '}
          <strong>{expiracionMinutos} min</strong>.
        </p>
      </header>

      <div className="animate-fade-in-up">
        <form onSubmit={onSubmit} className="space-y-5" aria-busy={verificando}>
          <TextField
            type="text"
            label="Código de verificación"
            placeholder="123456"
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={12}
            value={codigo}
            onChange={(event) => {
              setCodigo(event.target.value)
              if (error) setError(undefined)
            }}
            error={error}
          />

          <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <SubmitButton loading={verificando} />
          </div>
        </form>
      </div>

      <div className="mt-6" aria-live="polite">
        {mensajeError && <StatusMessage status="error">{mensajeError}</StatusMessage>}
      </div>

      <button
        type="button"
        onClick={onCancelar}
        className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-navy-400 transition-colors duration-300 hover:text-navy-700"
      >
        <span aria-hidden="true">←</span> Volver a iniciar sesión
      </button>
    </>
  )
}

/** Solicitar recuperación o restablecer con token del correo (2 pasos). */
function RecoverView() {
  const { token, correo: correoUrl } = leerParametrosRecuperacion()
  return token ? <RestablecerForm token={token} correoInicial={correoUrl} /> : <SolicitarForm />
}

function leerParametrosRecuperacion(): { token?: string; correo?: string } {
  const hash = window.location.hash
  const queryIndex = hash.indexOf('?')
  if (queryIndex === -1) return {}
  const params = new URLSearchParams(hash.slice(queryIndex + 1))
  return { token: params.get('token') ?? undefined, correo: params.get('correo') ?? undefined }
}

function SolicitarForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [serverError, setServerError] = useState<string | undefined>()

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError)
      return
    }
    setError(undefined)
    setSending(true)
    setServerError(undefined)
    try {
      await solicitarRecuperacion(email.trim().toLowerCase())
      setSent(true)
    } catch (exception) {
      setServerError(exception instanceof ApiError ? exception.message : 'No se pudo enviar la solicitud.')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <header className="mb-8">
        <h1 className="animate-fade-in-up text-2xl font-bold tracking-tight text-navy-900" style={{ animationDelay: '150ms' }}>
          Recupera tu acceso
        </h1>
        <p className="mt-2 animate-fade-in-up text-sm leading-relaxed text-navy-600" style={{ animationDelay: '250ms' }}>
          Ingresa el correo asociado a tu cuenta y te enviaremos instrucciones y un enlace para restablecer la contraseña.
        </p>
      </header>

      {sent ? (
        <div className="space-y-6">
          <StatusMessage status="success">
            Si existe una cuenta con <strong>{email}</strong>, recibirás un correo con el enlace y
            las instrucciones de recuperación (vencimiento: 15 minutos).
          </StatusMessage>
          <a
            href={LOGIN_ROUTE}
            className="flex items-center justify-center gap-2 rounded-xl border border-navy-200 bg-white px-5 py-2.5 text-sm font-semibold text-navy-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-navy-300 hover:bg-navy-50"
          >
            <span aria-hidden="true">←</span> Volver a iniciar sesión
          </a>
        </div>
      ) : (
        <>
          <form onSubmit={onSubmit} className="space-y-5">
            <TextField
              type="email"
              label="Correo electrónico"
              placeholder="tucorreo@empresa.com"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                if (error) setError(undefined)
              }}
              error={error}
            />
            <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-xl bg-navy-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-navy-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-navy-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pineapple-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? 'Enviando…' : 'Enviar instrucciones'}
              </button>
            </div>
          </form>

          {serverError && (
            <div className="mt-6" aria-live="polite">
              <StatusMessage status="error">{serverError}</StatusMessage>
            </div>
          )}

          <a href={LOGIN_ROUTE} className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-navy-400 transition-colors duration-300 hover:text-navy-700">
            <span aria-hidden="true">←</span> Volver a iniciar sesión
          </a>
        </>
      )}
    </>
  )
}

function RestablecerForm({ token, correoInicial }: { token: string; correoInicial?: string }) {
  const [correo, setCorreo] = useState(correoInicial ?? '')
  const [respuesta, setRespuesta] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [estado, setEstado] = useState<'solicitud' | 'listo'>('solicitud')
  const [enviando, setEnviando] = useState(false)
  const [serverError, setServerError] = useState<string | undefined>()

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nuevosErrores: Record<string, string | undefined> = {}

    const emailError = validateEmail(correo)
    if (emailError) nuevosErrores.correo = emailError
    if (!respuesta.trim()) nuevosErrores.respuesta = 'Ingresa tu respuesta secreta.'
    if (contrasena.length < 8) {
      nuevosErrores.contrasena = 'La contraseña debe tener al menos 8 caracteres.'
    } else if (contrasena !== confirmacion) {
      nuevosErrores.confirmacion = 'Las contraseñas no coinciden.'
    }

    setErrors(nuevosErrores)
    if (Object.keys(nuevosErrores).some((key) => nuevosErrores[key])) return

    setEnviando(true)
    setServerError(undefined)
    try {
      await restablecerContrasena({
        correo: correo.trim().toLowerCase(),
        token,
        respuesta_secreta: respuesta.trim(),
        contrasena,
        contrasena_confirmation: confirmacion,
      })
      setEstado('listo')
    } catch (exception) {
      setServerError(exception instanceof ApiError ? exception.message : 'No se pudo restablecer la contraseña.')
    } finally {
      setEnviando(false)
    }
  }

  if (estado === 'listo') {
    return (
      <div className="space-y-6">
        <StatusMessage status="success">
          Contraseña actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
        </StatusMessage>
        <a
          href={LOGIN_ROUTE}
          className="flex items-center justify-center gap-2 rounded-xl border border-navy-200 bg-white px-5 py-2.5 text-sm font-semibold text-navy-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-navy-300 hover:bg-navy-50"
        >
          <span aria-hidden="true">←</span> Ir a iniciar sesión
        </a>
      </div>
    )
  }

  return (
    <>
      <header className="mb-8">
        <h1 className="animate-fade-in-up text-2xl font-bold tracking-tight text-navy-900" style={{ animationDelay: '150ms' }}>
          Restablece tu contraseña
        </h1>
        <p className="mt-2 animate-fade-in-up text-sm leading-relaxed text-navy-600" style={{ animationDelay: '250ms' }}>
          Ingresa tu correo, tu respuesta secreta y una nueva contraseña para recuperar el acceso.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-5">
        <TextField
          type="email"
          label="Correo electrónico"
          placeholder="tucorreo@empresa.com"
          autoComplete="email"
          value={correo}
          onChange={(event) => {
            setCorreo(event.target.value)
            if (errors.correo) setErrors((current) => ({ ...current, correo: undefined }))
          }}
          error={errors.correo}
        />

        <TextField
          type="text"
          label="Respuesta secreta"
          placeholder="Tu respuesta secreta"
          autoComplete="off"
          value={respuesta}
          onChange={(event) => {
            setRespuesta(event.target.value)
            if (errors.respuesta) setErrors((current) => ({ ...current, respuesta: undefined }))
          }}
          error={errors.respuesta}
        />

        <TextField
          type="password"
          label="Nueva contraseña"
          placeholder="••••••••"
          autoComplete="new-password"
          value={contrasena}
          onChange={(event) => {
            setContrasena(event.target.value)
            if (errors.contrasena) setErrors((current) => ({ ...current, contrasena: undefined }))
          }}
          error={errors.contrasena}
        />

        <TextField
          type="password"
          label="Confirmar contraseña"
          placeholder="••••••••"
          autoComplete="new-password"
          value={confirmacion}
          onChange={(event) => {
            setConfirmacion(event.target.value)
            if (errors.confirmacion) setErrors((current) => ({ ...current, confirmacion: undefined }))
          }}
          error={errors.confirmacion}
        />

        <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-xl bg-navy-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-navy-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-navy-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pineapple-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enviando ? 'Restableciendo…' : 'Restablecer contraseña'}
          </button>
        </div>
      </form>

      {serverError && (
        <div className="mt-6" aria-live="polite">
          <StatusMessage status="error">{serverError}</StatusMessage>
        </div>
      )}

      <a href={LOGIN_ROUTE} className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-navy-400 transition-colors duration-300 hover:text-navy-700">
        <span aria-hidden="true">←</span> Volver a iniciar sesión
      </a>
    </>
  )
}
