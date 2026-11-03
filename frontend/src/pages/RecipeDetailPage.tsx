import { useParams, Link } from 'react-router-dom'
import recipesData from '@/data/recipes.json'
import type { Recipe } from '@/types'

const recipes: Recipe[] = recipesData as Recipe[]

const difficultyColors: Record<Recipe['difficulty'], string> = {
  'Fácil': 'bg-green-100 text-green-700',
  'Media': 'bg-yellow-100 text-yellow-700',
  'Difícil': 'bg-red-100 text-red-700',
}

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const recipe = recipes.find(r => r.id === Number(id))

  if (!recipe) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Receta no encontrada</h2>
        <Link to="/recetas" className="text-red-600 hover:underline font-medium">Volver a recetas</Link>
      </div>
    )
  }

  return (
    <section className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/recetas" className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 mb-8 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a recetas
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-orange-500 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">{recipe.category}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColors[recipe.difficulty]} bg-white/90`}>
                {recipe.difficulty}
              </span>
            </div>
            <h1 className="text-4xl font-extrabold mb-3">{recipe.name}</h1>
            <p className="text-white/90 text-lg">{recipe.description}</p>
            <div className="flex items-center gap-6 mt-6 text-sm">
              <span className="flex items-center gap-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {recipe.time}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {recipe.servings} porciones
              </span>
              <span className="flex items-center gap-1 text-yellow-300 font-bold">
                {recipe.rating}★
              </span>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Ingredientes
                </h2>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-2 h-2 bg-red-400 rounded-full mt-1.5 shrink-0" />
                      <span>
                        <span className="font-medium text-gray-900">{ing.amount}</span>{' '}
                        <span className="text-gray-600">{ing.name}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="md:col-span-2">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Preparación
                </h2>
                <ol className="space-y-4">
                  {recipe.steps.map((step) => (
                    <li key={step.step} className="flex gap-4">
                      <div className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                        {step.step}
                      </div>
                      <p className="text-gray-700 leading-relaxed pt-1">{step.instruction}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
