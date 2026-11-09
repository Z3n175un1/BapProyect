import { API_BASE_URL } from '../../services/http'

/**
 * Aviso informativo del entorno de integración (FASE C).
 * Ya no lista credenciales: la autenticación es real contra la API.
 */
export default function DemoCredentialsHint() {
  return (
    <div className="rounded-xl border border-dashed border-navy-200 bg-navy-50/60 px-4 py-3 text-xs text-navy-600">
      <p className="font-semibold uppercase tracking-wider text-navy-500">
        Entorno de integración
      </p>
      <p className="mt-1.5 leading-relaxed">
        La autenticación se validará contra la API de VisualGas
        (<span className="font-mono break-all">{API_BASE_URL}</span>). Si recibes
        un aviso de conexión, verifica que el backend esté en ejecución.
      </p>
    </div>
  )
}
