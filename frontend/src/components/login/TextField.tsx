import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  label: string
  error?: string
  trailing?: ReactNode
}

/** Campo de texto reutilizable con estados focus, error y validación accesibles. */
export default function TextField({ label, error, trailing, ...inputProps }: TextFieldProps) {
  const generatedId = useId()
  const inputId = inputProps.id ?? generatedId
  const errorId = `${inputId}-error`

  return (
    <div className="group">
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-sm font-medium text-navy-900"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...inputProps}
          className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-navy-950 shadow-sm outline-none transition-all duration-300 placeholder:text-navy-300 ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : 'border-navy-100 focus:border-pineapple-500 focus:ring-2 focus:ring-pineapple-200'
          } ${trailing ? 'pr-11' : ''}`}
        />
        {trailing && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            {trailing}
          </div>
        )}
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 animate-fade-in text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
