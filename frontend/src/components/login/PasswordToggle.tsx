type PasswordToggleProps = {
  show: boolean
  onToggle: () => void
}

/** Muestra u oculta la contraseña con control accesible por teclado. */
export default function PasswordToggle({ show, onToggle }: PasswordToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      aria-pressed={show}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-navy-400 transition-all duration-300 hover:bg-navy-50 hover:text-navy-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pineapple-500"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M2.06 13.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0" />
        <circle cx="12" cy="12" r="3" />
        {show && <line x1="3" y1="3" x2="21" y2="21" />}
      </svg>
    </button>
  )
}
