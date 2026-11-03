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

function buildErrorMessage(errors: LoginFormErrors): string {
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
  updateField,
  handleBlur,
  handleSubmit,
  toggleShowPassword,
  updateRememberMe,
  userName,
}: FormApi & { userName?: string }) {
  return (
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
          {status === 'error' && <StatusMessage status="error">{buildErrorMessage(errors)}</StatusMessage>}
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
  )
}

function RecoverView() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [sent, setSent] = useState(false)

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError)
      return
    }
    setError(undefined)
    setSent(true)
  }

  return (
    <>
      <header className="mb-8">
        <h1 className="animate-fade-in-up text-2xl font-bold tracking-tight text-navy-900" style={{ animationDelay: '150ms' }}>
          Recupera tu acceso
        </h1>
        <p className="mt-2 animate-fade-in-up text-sm leading-relaxed text-navy-600" style={{ animationDelay: '250ms' }}>
          Ingresa el correo asociado a tu cuenta y te enviaremos instrucciones para restablecer la contraseña.
        </p>
      </header>

      {sent ? (
        <div className="space-y-6">
          <StatusMessage status="success">
            Si existe una cuenta con <strong>{email}</strong>, recibirás un correo con las
            instrucciones de recuperación.
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
                className="w-full rounded-xl bg-navy-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-navy-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-navy-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pineapple-500"
              >
                Enviar instrucciones
              </button>
            </div>
          </form>

          <a href={LOGIN_ROUTE} className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-navy-400 transition-colors duration-300 hover:text-navy-700">
            <span aria-hidden="true">←</span> Volver a iniciar sesión
          </a>
        </>
      )}
    </>
  )
}
