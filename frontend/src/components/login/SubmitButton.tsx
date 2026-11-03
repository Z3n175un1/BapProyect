import loadSpinnerUrl from '../../assets/loadingspinner.png'

type SubmitButtonProps = {
  loading: boolean
}

/** Botón principal de inicio de sesión (amarillo piña, acento corporativo). */
export default function SubmitButton({ loading }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-navy-950 shadow-lg shadow-pineapple-500/25 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-800 ${
        loading
          ? 'cursor-wait bg-pineapple-300'
          : 'bg-pineapple-500 hover:-translate-y-0.5 hover:bg-pineapple-400 hover:shadow-xl hover:shadow-pineapple-500/30 active:translate-y-0'
      }`}
    >
      {loading && (
        <img
          src={loadSpinnerUrl}
          alt=""
          aria-hidden="true"
          className="h-5 w-5 animate-spin"
        />
      )}
      {loading ? 'Verificando credenciales…' : 'Iniciar sesión'}
    </button>
  )
}
