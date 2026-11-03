import logoNewUrl from '../../assets/logo.new.png'

const highlights = [
  'Control financiero en tiempo real',
  'Accesos por rol con permisos granulares',
  'Reportes en PDF y XLS listos para compartir',
]

/** Panel corporativo (azul marino) de la vista de acceso. */
export default function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-navy-950 lg:flex lg:flex-col lg:justify-between">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />
        <div className="absolute -left-24 top-24 h-80 w-80 animate-float-slow rounded-full bg-navy-600/40 blur-3xl" />
        <div
          className="absolute -right-16 bottom-16 h-96 w-96 animate-float-slow rounded-full bg-pineapple-500/10 blur-3xl"
          style={{ animationDelay: '2.5s' }}
        />
      </div>

      <div className="relative animate-slide-in-left p-10 xl:p-12">
        <span className="inline-flex animate-blurred-fade-in rounded-xl bg-white/95 px-3.5 py-2.5 shadow-lg shadow-black/30">
          <img src={logoNewUrl} alt="BAP SRL" className="h-9 w-auto object-contain" />
        </span>
      </div>

      <div className="relative max-w-md p-10 xl:p-12">
        <p className="animate-fade-in-up text-sm font-semibold uppercase tracking-widest text-pineapple-400">
          Sistema contable VisualGas
        </p>
        <h2
          className="mt-4 animate-fade-in-up text-4xl font-bold leading-tight tracking-tight text-white"
          style={{ animationDelay: '120ms' }}
        >
          La contabilidad de tu empresa,
          <span className="text-pineapple-300"> bajo control</span>
        </h2>
        <p
          className="mt-5 animate-fade-in-up leading-relaxed text-navy-100/80"
          style={{ animationDelay: '240ms' }}
        >
          Comprobantes, almacenes, ingresos y egresos centralizados en una
          plataforma segura, pensada para pequeñas y medianas empresas.
        </p>

        <ul className="mt-8 space-y-3">
          {highlights.map((item, index) => (
            <li
              key={item}
              className="flex animate-fade-in-up items-center gap-3 text-sm text-navy-100"
              style={{ animationDelay: `${360 + index * 120}ms` }}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pineapple-500/15 ring-1 ring-pineapple-400/40">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3 w-3 text-pineapple-300"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative p-10 text-xs text-navy-200/60 xl:p-12">
        © {new Date().getFullYear()} BAP SRL · Todos los derechos reservados.
      </p>
    </aside>
  )
}
