type SoundToggleProps = {
  enabled: boolean
  onToggle: () => void
}

/**Control discreto de audio: nunca autoplay, siempre tras interacción del usuario. */
export default function SoundToggle({ enabled, onToggle }: SoundToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={enabled}
      aria-label={enabled ? 'Desactivar sonido del login' : 'Activar sonido del login'}
      title={enabled ? 'Sonido activado' : 'Sonido desactivado'}
      className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-navy-300 transition-all duration-300 hover:bg-navy-50 hover:text-navy-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pineapple-500"
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
        {enabled ? (
          <>
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </>
        ) : (
          <>
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </>
        )}
      </svg>
    </button>
  )
}
