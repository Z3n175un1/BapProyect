import { useState } from 'react'
import type { Receipt } from '@/types'

const initialReceipts: Receipt[] = [
  { id: 1, date: '2026-08-30', items: ['Pizza Margherita', 'Coca-Cola'], total: 15.99, status: 'pagado' },
  { id: 2, date: '2026-08-31', items: ['Sushi Roll', 'Té verde'], total: 18.50, status: 'pagado' },
  { id: 3, date: '2026-09-01', items: ['Burger Classic', 'Papas fritas', 'Helado'], total: 22.98, status: 'pendiente' },
  { id: 4, date: '2026-09-01', items: ['Pasta Carbonara', 'Ensalada César'], total: 23.98, status: 'cancelado' },
]

const statusColors: Record<Receipt['status'], string> = {
  pagado: 'bg-green-100 text-green-700',
  pendiente: 'bg-yellow-100 text-yellow-700',
  cancelado: 'bg-red-100 text-red-700',
}

export default function ReceiptsPage() {
  const [receipts] = useState<Receipt[]>(initialReceipts)

  return (
    <section className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Mis Recibos</h2>
        <p className="text-gray-500 text-center mb-12">Historial de tus pedidos</p>
        <div className="space-y-4">
          {receipts.map((receipt) => (
            <div
              key={receipt.id}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Recibo #{receipt.id}</p>
                  <p className="text-sm text-gray-400">{receipt.date}</p>
                  <p className="text-gray-700 mt-2">{receipt.items.join(', ')}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">Bs{receipt.total.toFixed(2)}</p>
                  <span className={`inline-block mt-2 px-3 py-1 text-sm font-medium rounded-full ${statusColors[receipt.status]}`}>
                    {receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
