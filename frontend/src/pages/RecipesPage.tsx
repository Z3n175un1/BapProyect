import { Link } from 'react-router-dom'
import recipesData from '@/data/recipes.json'
import type { Recipe } from '@/types'

const recipes: Recipe[] = recipesData as Recipe[]

const difficultyColors: Record<Recipe['difficulty'], string> = {
  'Fácil': 'bg-green-100 text-green-700',
  'Media': 'bg-yellow-100 text-yellow-700',
  'Difícil': 'bg-red-100 text-red-700',
}

export default function RecipesPage() {
  return (
    <section className="py-16 bg-white" id="recipes">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Recetas</h2>
        <p className="text-gray-500 text-center mb-12">Explora nuestras recetas con instrucciones detalladas</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <Link
              to={`/recetas/${recipe.id}`}
              key={recipe.id}
              className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                  {recipe.category}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${difficultyColors[recipe.difficulty]}`}>
                  {recipe.difficulty}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{recipe.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{recipe.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{recipe.time}</span>
                <span>{recipe.servings} porciones</span>
                <span className="text-yellow-500 font-bold">{recipe.rating}★</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
