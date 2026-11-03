import { useState, useRef, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import ShippingModal from '@/components/ShippingModal'

import changeBg from '@/assets/changeBg.png'
import feedback from '@/assets/feedback.png'
import forms from '@/assets/forms.png'
import newPss from '@/assets/newPss.png'
import newrecipe from '@/assets/newrecipe.png'
import userIcon from '@/assets/user.png'
import utilities from '@/assets/utilities.png'
import buttonSound from '@/audio/ButtonSound.mp3'

export default function HomePage() {
  const { user } = useAuth()
  const [showShipping, setShowShipping] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(new Audio(buttonSound))

  const playSound = useCallback(() => {
    audioRef.current.currentTime = 0
    audioRef.current.play()
  }, [])

  const handleOrder = () => {
    playSound()
    setShowShipping(true)
  }

  const features = [
    { img: changeBg, title: 'Personalización', text: 'Cambia el fondo según tu estado de ánimo' },
    { img: feedback, title: 'Feedback', text: 'Comparte tu experiencia con nosotros' },
    { img: forms, title: 'Formularios', text: 'Registra tus datos fácil y rápido' },
    { img: newPss, title: 'Seguridad', text: 'Recupera tu contraseña sin complicaciones' },
  ]

  const extras = [
    { img: newrecipe, title: 'Nuevas recetas', text: 'Descubre platillos nuevos cada semana' },
    { img: userIcon, title: 'Tu perfil', text: 'Gestiona tu cuenta y pedidos' },
    { img: utilities, title: 'Utilidades', text: 'Herramientas que facilitan tu vida' },
  ]

  return (
    <>
      <ShippingModal isOpen={showShipping} onClose={() => setShowShipping(false)} />

      <section className="relative overflow-hidden bg-[#FFF8EC]">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#F4C95D]/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-[#C0392B]/10 blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <span className="inline-block mb-5 text-3xl animate-[wiggle_1.8s_ease-in-out_1]">
            🐾
          </span>

          <h1 className="font-[Fredoka,ui-rounded,system-ui] text-6xl sm:text-7xl font-bold text-[#2B2118] leading-[1.05] mb-6 tracking-tight">
            Cocina con
            <br />
            <span className="text-[#C0392B]">CookerCat</span>
          </h1>

          <p className="text-lg text-[#5B5044] mb-10 max-w-xl mx-auto leading-relaxed">
            Recetas paso a paso, trucos de cocina y comida lista cuando no
            tengas ganas de cocinar. Todo en un solo lugar, para principiantes
            y expertos por igual.
          </p>

          {user && (
            <p className="text-sm text-[#8A7F6E] mb-6">
              Sesión de <span className="font-semibold text-[#2B2118]">{user.name}</span> ({user.role})
            </p>
          )}

          <button
            onClick={handleOrder}
            className="group relative px-9 py-4 bg-[#C0392B] text-white text-lg font-semibold rounded-2xl shadow-[0_6px_0_#8E2A1F] active:shadow-[0_2px_0_#8E2A1F] active:translate-y-1 transition-all"
          >
            Ordenar ahora
          </button>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-[Fredoka,ui-rounded,system-ui] text-3xl font-bold text-[#2B2118] text-center mb-14">
            Lo que encontrarás aquí
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ img, title, text }) => (
              <div key={title} className="rounded-2xl border border-[#F0E6D6] p-7 text-center hover:border-[#F4C95D] hover:bg-[#FFF8EC] transition-colors">
                <img src={img} alt={title} className="w-16 h-16 mx-auto mb-5 object-contain" />
                <h3 className="text-lg font-semibold text-[#2B2118] mb-2">{title}</h3>
                <p className="text-[#7A6F5F] text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#2B2118]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {extras.map(({ img, title, text }) => (
              <div key={title} className="rounded-2xl bg-[#37291D] p-8 text-center">
                <img src={img} alt={title} className="w-16 h-16 mx-auto mb-5 object-contain" />
                <h3 className="text-lg font-semibold text-[#FFF8EC] mb-2">{title}</h3>
                <p className="text-[#C7BBA8] text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-12deg); }
          75% { transform: rotate(12deg); }
        }
      `}</style>
    </>
  )
}
