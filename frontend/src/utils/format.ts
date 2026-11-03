const formatter = new Intl.NumberFormat('es-BO', { maximumFractionDigits: 0 })

export function formatNumber(value: number): string {
  return formatter.format(value)
}

export function formatCurrency(value: number): string {
  return `${formatter.format(value)} Bs`
}

export function formatCompactCurrency(value: number): string {
  return `${formatter.format(Math.round(value / 1000))} mil Bs`
}

export function formatDelta(delta: number): string {
  return `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`
}

export function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export function roleLabel(role: 'admin' | 'contador'): string {
  return role === 'admin' ? 'Administrador' : 'Contador'
}
