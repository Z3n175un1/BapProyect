import { useState } from 'react'

const foodOptions = [
  'Pizza Margherita',
  'Sushi Roll',
  'Tacos al Pastor',
  'Pasta Carbonara',
  'Ceviche de Camarón',
  'Paella Valenciana',
  'Burger Classic',
  'Ensalada César',
]

interface ShippingForm {
  nombre: string
  telefono: string
  direccion: string
  razonSocial: string
  preferencias: string
  comida: string
}

interface ShippingModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ShippingModal({ isOpen, onClose }: ShippingModalProps) {
  const [form, setForm] = useState<ShippingForm>({
    nombre: '', telefono: '', direccion: '', razonSocial: '', preferencias: '', comida: '',
  })
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const handleChange = (field: keyof ShippingForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setForm({ nombre: '', telefono: '', direccion: '', razonSocial: '', preferencias: '', comida: '' })
      onClose()
    }, 2000)
  }

  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all"

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-xl font-bold text-gray-900">Dirección de Envío</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">¡Pedido confirmado!</h4>
            <p className="text-gray-500">Tu pedido está en camino.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={form.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Tu nombre"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono <span className="text-red-500">*</span></label>
              <input
                type="tel"
                required
                value={form.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                placeholder="Tu número de teléfono"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={form.direccion}
                onChange={(e) => handleChange('direccion', e.target.value)}
                placeholder="Calle, número, colonia, CP"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social</label>
              <input
                type="text"
                value={form.razonSocial}
                onChange={(e) => handleChange('razonSocial', e.target.value)}
                placeholder="Nombre de empresa (opcional)"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comida <span className="text-red-500">*</span></label>
              <select
                required
                value={form.comida}
                onChange={(e) => handleChange('comida', e.target.value)}
                className={inputClass}
              >
                <option value="">Selecciona tu platillo...</option>
                {foodOptions.map(food => (
                  <option key={food} value={food}>{food}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferencias</label>
              <textarea
                rows={3}
                value={form.preferencias}
                onChange={(e) => handleChange('preferencias', e.target.value)}
                placeholder="Ej: Sin cebolla, poco picante, extras..."
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirmar pedido
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
