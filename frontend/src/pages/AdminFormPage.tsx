import { useState } from 'react'
import type { FormField } from '@/types'

const defaultFields: FormField[] = [
  { label: 'Nombre del platillo', name: 'dishName', type: 'text', placeholder: 'Ej: Pizza Margherita', required: true },
  { label: 'Descripción', name: 'description', type: 'textarea', placeholder: 'Breve descripción del platillo', required: true },
  { label: 'Precio ($)', name: 'price', type: 'number', placeholder: '0.00', required: true },
  { label: 'Categoría', name: 'category', type: 'select', required: true, options: ['Italiana', 'Japonesa', 'Mexicana', 'Peruana', 'Española', 'Americana'] },
  { label: 'Tiempo de preparación', name: 'prepTime', type: 'text', placeholder: 'Ej: 30 min' },
]

export default function AdminFormPage() {
  const [fields] = useState<FormField[]>(defaultFields)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  const renderField = (field: FormField) => {
    const baseClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all"

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            name={field.name}
            placeholder={field.placeholder}
            required={field.required}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            rows={3}
            className={`${baseClass} resize-none`}
          />
        )
      case 'select':
        return (
          <select
            name={field.name}
            required={field.required}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={baseClass}
          >
            <option value="">Seleccionar...</option>
            {field.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )
      default:
        return (
          <input
            type={field.type}
            name={field.name}
            placeholder={field.placeholder}
            required={field.required}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={baseClass}
          />
        )
    }
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Crear Platillo</h2>
          <p className="text-gray-500 mt-2">Agrega un nuevo platillo al menú</p>
        </div>

        {submitted && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm font-medium mb-6 text-center">
            ¡Platillo creado exitosamente!
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-5">
          {fields.map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderField(field)}
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
            >
              Crear platillo
            </button>
            <button
              type="button"
              onClick={() => setFormData({})}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
