export default function ContactPage() {
  return (
    <section className="py-16 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Contáctanos</h2>
        <p className="text-gray-600 mb-12">¿Tienes preguntas? Escríbenos y te responderemos lo antes posible.</p>
        <form className="space-y-4 text-left">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              id="name"
              type="text"
              placeholder="Tu nombre"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Tu email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
            <textarea
              id="message"
              placeholder="Tu mensaje"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none resize-none"
            />
          </div>
          <button
            type="button"
            className="w-full px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
          >
            Enviar mensaje
          </button>
        </form>
      </div>
    </section>
  )
}
