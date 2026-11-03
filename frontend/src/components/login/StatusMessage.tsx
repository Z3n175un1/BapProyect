import type { ReactNode } from 'react'

type StatusMessageProps = {
  status: 'error' | 'success'
  children: ReactNode
}

/** Banda de retroalimentación (credenciales incorrectas / acceso exitoso). */
export default function StatusMessage({ status, children }: StatusMessageProps) {
  const styles =
    status === 'error'
      ? 'border-red-200 bg-red-50 text-red-700 animate-shake'
      : 'border-emerald-200 bg-emerald-50 text-emerald-800 animate-jelly'
  const icon =
    status === 'error' ? (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </>
    ) : (
      <>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </>
    )

  return (
    <div
      role={status === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${styles}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 h-4 w-4 shrink-0"
        aria-hidden="true"
      >
        {icon}
      </svg>
      <div>{children}</div>
    </div>
  )
}
