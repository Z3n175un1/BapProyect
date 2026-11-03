const DEMO_CREDENTIALS = [
  { email: 'admin@bapsrl.com', password: 'admin123' },
  { email: 'usuario@bapsrl.com', password: 'usuario123' },
]

/**
 * Credenciales de prueba exclusivas de la fase de desarrollo.
 * No constituyen un mecanismo de seguridad real.
 */
export default function DemoCredentialsHint() {
  return (
    <div className="rounded-xl border border-dashed border-navy-200 bg-navy-50/60 px-4 py-3 text-xs text-navy-600">
      <p className="font-semibold uppercase tracking-wider text-navy-500">
        Acceso de prueba (solo desarrollo)
      </p>
      <ul className="mt-2 space-y-1 font-mono">
        {DEMO_CREDENTIALS.map((cred) => (
          <li key={cred.email}>
            {cred.email} · {cred.password}
          </li>
        ))}
      </ul>
    </div>
  )
}
