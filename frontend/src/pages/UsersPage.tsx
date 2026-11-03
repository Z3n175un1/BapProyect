import { useState } from 'react'

interface UserRow {
  id: number
  name: string
  email: string
  role: 'admin' | 'usuario'
  orders: number
}

const initialUsers: UserRow[] = [
  { id: 1, name: 'Admin FoodApp', email: 'admin@foodapp.com', role: 'admin', orders: 120 },
  { id: 2, name: 'María García', email: 'maria@foodapp.com', role: 'usuario', orders: 34 },
  { id: 3, name: 'Test User', email: 'test@foodapp.com', role: 'usuario', orders: 15 },
]

const roleColors: Record<UserRow['role'], string> = {
  admin: 'bg-purple-100 text-purple-700',
  usuario: 'bg-blue-100 text-blue-700',
}

export default function UsersPage() {
  const [users] = useState<UserRow[]>(initialUsers)

  return (
    <section className="py-16 bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Usuarios</h2>
        <p className="text-gray-500 text-center mb-12">Gestión de usuarios de la plataforma</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider text-right">Pedidos</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 font-medium text-gray-900">{u.name}</td>
                  <td className="py-4 px-4 text-gray-600">{u.email}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${roleColors[u.role]}`}>
                      {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-gray-900">{u.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
