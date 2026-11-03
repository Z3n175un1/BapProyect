import { useState, useRef, useEffect, useCallback } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isAdmin = user?.role === 'admin'

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setIsMenuOpen(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [handleClickOutside])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `font-medium transition-colors ${isActive ? 'text-red-600' : 'text-gray-700 hover:text-red-600'}`

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 font-medium transition-colors ${isActive ? 'text-red-600 bg-red-50' : 'text-gray-700 hover:bg-red-50 hover:text-red-600'}`

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a3 3 0 003 3h5a3 3 0 003-3v-5m-14 4v-5a3 3 0 013-3h10a3 3 0 013 3v5m14-4a4 4 0 01-4 4H8m6-4h.01M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900">CookerCat</span>
        </NavLink>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {isAdmin ? (
            <>
              <NavLink to="/recibos" className={linkClass}>Recibos</NavLink>
              <NavLink to="/formularios" className={linkClass}>Formularios</NavLink>
              <NavLink to="/admin" className={linkClass}>Admin</NavLink>
              <NavLink to="/admin/crear" className={linkClass}>Crear</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/" end className={linkClass}>Inicio</NavLink>
              <NavLink to="/recetas" className={linkClass}>Recetas</NavLink>
              <NavLink to="/menu" className={linkClass}>Menú</NavLink>
              <NavLink to="/contacto" className={linkClass}>Contacto</NavLink>
            </>
          )}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Mobile */}
        <div className="relative md:hidden" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
              {isAdmin ? (
                <>
                  <NavLink to="/recibos" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Recibos</NavLink>
                  <NavLink to="/formularios" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Formularios</NavLink>
                  <NavLink to="/admin" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Admin</NavLink>
                  <NavLink to="/admin/crear" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Crear platillo</NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/" end className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Inicio</NavLink>
                  <NavLink to="/recetas" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Recetas</NavLink>
                  <NavLink to="/menu" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Menú</NavLink>
                  <NavLink to="/contacto" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Contacto</NavLink>
                </>
              )}
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={() => { setIsMenuOpen(false); handleLogout() }}
                  className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 font-medium transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
