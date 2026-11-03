export default function MenuPage() {
  const items = [
    { id: 1, name: 'Pizza Margherita', description: 'Salsa de tomate, mozzarella fresca y albahaca', price: 12.99 },
    { id: 2, name: 'Sushi Roll', description: 'Pescado fresco y vegetales con arroz y alga', price: 15.99 },
    { id: 3, name: 'Burger Classic', description: 'Hamburguesa con carne de res, queso, lechuga y salsa especial', price: 9.99 },
    { id: 4, name: 'Pasta Carbonara', description: 'Pasta crema con huevo, queso, panceta y pimienta', price: 14.99 },
    { id: 5, name: 'Ensalada César', description: 'Lechuga romana, pollo a la parrilla, crutones y aderezo César', price: 8.99 },
    { id: 6, name: 'Tacos Al Pastor', description: 'Tortillas con cerdo adobado, piña y cebolla', price: 7.99 },
  ]

  return (
    <section className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Menú de la Casa</h2>
        <p className="text-gray-500 text-center mb-12">Los mejores platillos preparados con ingredientes frescos</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <p className="text-2xl font-bold text-red-600">Bs{item.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
