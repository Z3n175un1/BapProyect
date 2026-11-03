import { useState } from 'react'

interface Stats {
  sales: number
  orders: number
  rating: number
  growth: number
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats>(() => ({
    sales: 1245,
    orders: 47,
    rating: 4.8,
    growth: 12,
  }))

  const handleAddOrder = () => {
    setStats(prev => ({
      ...prev,
      orders: prev.orders + 1,
      sales: prev.sales + Math.floor(Math.random() * 50 + 20),
    }))
  }

  return (
    <section className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Panel de Administración</h2>
        <p className="text-gray-500 mb-8">Gestiona tu restaurante desde aquí</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <p className="text-gray-500 text-sm mb-2">Total Ventas</p>
            <p className="text-2xl font-bold text-blue-600">Bs{stats.sales}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-6">
            <p className="text-gray-500 text-sm mb-2">Pedidos Hoy</p>
            <p className="text-2xl font-bold text-green-600">{stats.orders}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-6">
            <p className="text-gray-500 text-sm mb-2">Calificación</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.rating}★</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-6">
            <p className="text-gray-500 text-sm mb-2">Crecimiento</p>
            <p className="text-2xl font-bold text-purple-600">{stats.growth}%</p>
          </div>
        </div>

        <button
          onClick={handleAddOrder}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Simular Pedido
        </button>
      </div>
    </section>
  )
}
