export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-xl font-bold mb-4">CookerCat</h4>
            <p className="text-gray-400 text-sm">
              La mejor aplicación de comida a domicilio.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-bold mb-4">Enlaces</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Menú</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Nosotros</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contacto</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-bold mb-4">Redes Sociales</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Facebook</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-bold mb-4">Soporte</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Ayuda</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm">
            2026 CookerCat. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
