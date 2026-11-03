import { useState } from 'react'

type FormTab = 'receta' | 'comida'

export default function FormsPage() {
  const [activeTab, setActiveTab] = useState<FormTab>('receta')
  const [submitted, setSubmitted] = useState(false)

  const [recipeData, setRecipeData] = useState({
    name: '', category: '', time: '', difficulty: 'Fácil', servings: '',
    description: '', ingredients: '', steps: '',
  })

  const [foodData, setFoodData] = useState({
    name: '', description: '', price: '', category: '',
  })

  const handleRecipeChange = (field: string, value: string) => {
    setRecipeData(prev => ({ ...prev, [field]: value }))
  }

  const handleFoodChange = (field: string, value: string) => {
    setFoodData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  const handleClear = () => {
    if (activeTab === 'receta') {
      setRecipeData({ name: '', category: '', time: '', difficulty: 'Fácil', servings: '', description: '', ingredients: '', steps: '' })
    } else {
      setFoodData({ name: '', description: '', price: '', category: '' })
    }
  }

  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all"

  return (
    <section className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">Formularios</h2>
        <p className="text-gray-500 text-center mb-10">Crea recetas o añade comida al menú</p>

        {submitted && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm font-medium mb-6 text-center">
            {activeTab === 'receta' ? '¡Receta creada exitosamente!' : '¡Comida añadida exitosamente!'}
          </div>
        )}

        {/* Toggle slider */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-200 rounded-full p-1 flex">
            <button
              onClick={() => { setActiveTab('receta'); handleClear() }}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeTab === 'receta'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Crear Receta
            </button>
            <button
              onClick={() => { setActiveTab('comida'); handleClear() }}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeTab === 'comida'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Añadir Comida
            </button>
          </div>
        </div>

        {/* Forms */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {activeTab === 'receta' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Nueva Receta</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la receta <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={recipeData.name}
                  onChange={(e) => handleRecipeChange('name', e.target.value)}
                  placeholder="Ej: Pizza Margherita"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={recipeData.category}
                    onChange={(e) => handleRecipeChange('category', e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Italiana">Italiana</option>
                    <option value="Japonesa">Japonesa</option>
                    <option value="Mexicana">Mexicana</option>
                    <option value="Peruana">Peruana</option>
                    <option value="Española">Española</option>
                    <option value="Americana">Americana</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dificultad</label>
                  <select
                    value={recipeData.difficulty}
                    onChange={(e) => handleRecipeChange('difficulty', e.target.value)}
                    className={inputClass}
                  >
                    <option value="Fácil">Fácil</option>
                    <option value="Media">Media</option>
                    <option value="Difícil">Difícil</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo de preparación <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={recipeData.time}
                    onChange={(e) => handleRecipeChange('time', e.target.value)}
                    placeholder="Ej: 30 min"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Porciones <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={recipeData.servings}
                    onChange={(e) => handleRecipeChange('servings', e.target.value)}
                    placeholder="4"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={2}
                  value={recipeData.description}
                  onChange={(e) => handleRecipeChange('description', e.target.value)}
                  placeholder="Breve descripción de la receta"
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ingredientes <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={4}
                  value={recipeData.ingredients}
                  onChange={(e) => handleRecipeChange('ingredients', e.target.value)}
                  placeholder="Un ingrediente por línea, ej:&#10;500g Harina de trigo&#10;320ml Agua tibia&#10;7g Levadura seca"
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pasos de preparación <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={5}
                  value={recipeData.steps}
                  onChange={(e) => handleRecipeChange('steps', e.target.value)}
                  placeholder="Un paso por línea, ej:&#10;1. Mezclar la harina con la levadura&#10;2. Agregar el agua y amasar 10 minutos&#10;3. Dejar reposar 1 hora"
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors">
                  Crear receta
                </button>
                <button type="button" onClick={handleClear} className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                  Limpiar
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Añadir Comida al Menú</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del platillo <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={foodData.name}
                  onChange={(e) => handleFoodChange('name', e.target.value)}
                  placeholder="Ej: Hamburguesa Clásica"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={2}
                  value={foodData.description}
                  onChange={(e) => handleFoodChange('description', e.target.value)}
                  placeholder="Breve descripción del platillo"
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={foodData.price}
                    onChange={(e) => handleFoodChange('price', e.target.value)}
                    placeholder="0.00"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={foodData.category}
                    onChange={(e) => handleFoodChange('category', e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Italiana">Italiana</option>
                    <option value="Japonesa">Japonesa</option>
                    <option value="Mexicana">Mexicana</option>
                    <option value="Peruana">Peruana</option>
                    <option value="Española">Española</option>
                    <option value="Americana">Americana</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors">
                  Añadir comida
                </button>
                <button type="button" onClick={handleClear} className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                  Limpiar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
