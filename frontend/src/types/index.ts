import type { UserRole } from './dashboard'

export interface User {
  id: number
  name: string
  email: string
  password: string
  role: UserRole
  position: string
  department: string
  memberSince: string
}

export interface AuthState {
  user: Omit<User, 'password'> | null
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RecipeIngredient {
  amount: string
  name: string
}

export interface RecipeStep {
  step: number
  instruction: string
}

export interface Recipe {
  id: number
  name: string
  category: string
  time: string
  difficulty: 'Fácil' | 'Media' | 'Difícil'
  servings: number
  rating: number
  description: string
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
}

export interface FoodItemData {
  id: number
  name: string
  description: string
  price: number
  category: string
}

export interface Receipt {
  id: number
  date: string
  items: string[]
  total: number
  status: 'pagado' | 'pendiente' | 'cancelado'
}

export interface Stats {
  sales: number
  orders: number
  rating: number
  growth: number
}

export interface FormField {
  label: string
  name: string
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select'
  placeholder?: string
  required?: boolean
  options?: string[]
}
