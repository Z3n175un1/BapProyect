import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

const WHATSAPP_URL = "https://wa.me/59179888444";
const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=100057361731802";
const ASSETS = "https://bapweb.netlify.app/assets";

const navLinks = [
  { id: "inicio", label: "Inicio" },
  { id: "empresa", label: "Empresa" },
  { id: "servicios", label: "Servicios" },
  { id: "reconocimientos", label: "Reconocimientos" },
  { id: "clientes", label: "Clientes" },
  { id: "contacto", label: "Contacto" },
];

function scrollToSection(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 74;
  window.scrollTo({ top, behavior: "smooth" });
}

const beneficios = [
  {
    titulo: "Control financiero en tiempo real",
    desc: "Accede a información clara y actualizada para tomar decisiones seguras en todo momento.",
  },
  {
    titulo: "Menos errores, más eficiencia",
    desc: "Automatiza procesos clave y reduce errores contables que afectan la operación de tu empresa.",
  },
  {
    titulo: "Información lista para decidir",
    desc: "Obtén reportes claros y comprensibles que respaldan decisiones rápidas y estratégicas.",
  },
];

/* Servicio principal: VisualGas (Tabla 3 del proyecto) */
const funcionesVisualGas = [
  { titulo: "Ingresos, egresos y mora", desc: "Registro y control de operaciones contables con reglas de validación." },
  { titulo: "Comprobantes", desc: "Creación y consulta de comprobantes vinculados a cada actividad." },
  { titulo: "Control de almacenes", desc: "Administración del stock con permisos y trazabilidad de movimientos." },
  { titulo: "Reportes en PDF y XLS", desc: "Documentos listos para compartir a partir de la información registrada." },
  { titulo: "Accesos por rol", desc: "Cada usuario accede solo a las funciones y datos autorizados para su perfil." },
  { titulo: "Asistente virtual", desc: "Consultas en lenguaje natural sobre tu información contable disponible." },
];

const certificaciones = [
  {
    titulo: "Certificación ISO 9001:2008",
    desc: "Fuimos la primera empresa desarrolladora de software en Bolivia en obtener esta certificación. Contamos con amplia cobertura internacional y un equipo con 8 años de experiencia en recuperación de activos informáticos y proyectos tecnológicos.",
  },
  {
    titulo: "Proceso de Selección WORLDCOB",
    desc: "Nuestro compromiso con la excelencia empresarial fue evaluado en liderazgo, sistemas de gestión, calidad, innovación, responsabilidad social y logros. Esto nos llevó a la Excelencia Empresarial.",
  },
  {
    titulo: "The Bizz Awards 2009",
    desc: "Reconocimiento al liderazgo empresarial, calidad, innovación y responsabilidad social.",
    imagen: `${ASSETS}/bizz_award.png`,
  },
];

const clientes = [
  "PricewaterhouseCoopers", "Ernst & Young", "KPMG", "DXN Bolivia S.R.L.",
  "Huawei Technologies S.A.", "Samsung Chile Sucursal Bolivia", "Distribuidora Cummins",
  "Seguro Delegado Soboce", "Mediterranean Shipping Company", "Fundempresa", "Xcapital S.R.L",
  "GP Exploracion y Produccion SRL", "CMA CGM Bolivia S.R.L", "TMF GROUP - Bolivia",
  "Cámara Nacional de despachantes de aduana", "Swisslog Bolivia S.R.L",
  "Empresa Contstructora Tauro S.R.L.", "Teleféricos Doppelmayr Bolivia S.A.",
  "Cia Consultories S.R.L.", "Agencia despachante de Aduana ARG S.A.", "Artes Gráficas Sagitario",
  "Industria Gráfica Hermenca S.A.", "Duhan S.R.L.", "Toborochi Suites", "Club Alemán Deutscher Verein",
  "Fundación Cinemateca Boliviana", "Contreras Hermanos S.A.", "Grupo Peralta Sanchez",
  "Agencia Despachante de Aduana Catedral S.R.L.", "Reik Reinsurance Broker S.A.", "Fundación Jisunu",
  "File Armacenaje y Archivos Digitales - File Ardisa", "Improlab S.R.L.", "Instituto de educación Bancaria",
  "Sudamericana Corredores y Asesores de Seguros", "MEDI - MARK", "CORPORACIÓN DE NEGOCIOS MULTIPLE S.R.L.",
  "INTELLIGENT NETWORKING S.R.L.", "Agencia Despachante de Aduana Vilaseca S.R.L.", "ZTE BOLIVIA S.R.L.",
  "UNIVERSAL BROKERS S.A.", "INTERNATIONAL BUSINESS TRADE (BOLIVIA) LIMITADA", "Propuesta de Solución Informática",
  "BAP S.R.L.", "TECNICOS PROSERTEC S.R.L.", "AGROPECUARIA CHIA CORP BOLIVIA S.A.", "CLUB BOLIVAR",
  "TERRA AZUL SRL", "VIACOLOR LTDA.", "CAMARA REGIONAL DE DESPACHANTES DE ADUANA SANTA CRUZ",
  "AGENCIA DEPACHANTE DE ADUANA TAMENGO S.R.L.", "ABYA YALA TELEVISIÓN", "CAPTURA CONSULTING S.R.L.",
  "SICHUAN HONGHUA EQUIPOS DE PETROLEO S.A. SUCURSAL BOLIVIA",
  "ESTRATEGICA S.R.L. CORREDORES Y ASESORES DE SEGUROS Y RIESGOS", "GRILL RESTAURANT LA CABRERA S.A.",
  "ERICSSON DE BOLIVIA TELECOMUNICACIONES S.A.", "AGENCIA DESPACHANTE DE ADUANA ZONACOMEX",
  "DESPACHANTES PROFESIONALES DE ADUANA EVOLUTION S.R.L.", "GRAÑA Y MONTERO S.A.",
  "GASODUCTO VIRTUAL SENER INDOX BOLIVIA S.R.L.", "AGENCIA DESPACHANTE DE ADUANA ALLPERALTA S.R.L.",
  "FUNDACIÓN CUERPO DE CRISTO", "SAINT ANDREWS SCHOOL", "CORPORACIÓN DE COMERCIO EXTERIOR Y ADMINISTRACIÓN S.A.",
  "COMTECNO – SOLUCIONES INTEGRALES", "I.S. Energía S.R.L.", "INDATTA LTDA.", "ANATINA TOYS",
  "ESMICAL S.A. (Grupo SOBOCE)", "PAPELCRIS S.R.L.", "SPIECAPAG S.A. SUCURSAL BOLIVIA", "JOBS S.R.L.",
  "AEC FIDES BROKERS LTDA.", "INDUMOTORA BOLIVIA LTDA", "NOKIA SOLUTIONS AND NETWORKS BOLIVIA S.A.",
];

const CLIENTES_INICIALES = 24;

/* ------------------------------------------------------------------ */
/* Hooks y utilidades                                                  */
/* ------------------------------------------------------------------ */

function useInView(threshold = 0.15): [RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

/** Anima su contenido al entrar en pantalla. */
function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const [ref, visible] = useInView();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

type SectionTitleProps = {
  eyebrow: string;
  title: string;
  children?: ReactNode;
};

function SectionTitle({ eyebrow, title, children }: SectionTitleProps) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">{title}</h2>
      {children && <p className="mt-4 text-slate-400">{children}</p>}
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* Secciones                                                           */
/* ------------------------------------------------------------------ */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen
          ? "border-b border-white/10 bg-slate-950/85 shadow-lg shadow-black/20 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <button
          type="button"
          onClick={() => scrollToSection("inicio")}
          className="flex items-center gap-3"
        >
          <img
            src={`${ASSETS}/logo.jpg`}
            alt="BAP SRL"
            className="h-10 w-auto rounded-md transition-transform duration-300 hover:scale-105"
          />
        </button>

        <ul className="hidden items-center gap-7 lg:flex">
          {navLinks.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => scrollToSection(l.id)}
                className="relative text-sm text-slate-300 transition-colors hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-emerald-400 after:transition-all after:duration-300 hover:after:w-full"
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <span className="hidden lg:inline-block">
            <a
              href="#/"
              className="text-sm font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
            >
              Iniciar sesión
            </a>
          </span>
          <button
            type="button"
            onClick={() => scrollToSection("contacto")}
            className="hidden rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-300 sm:inline-block"
          >
            Solicitar demostración
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Abrir menú"
            className="rounded-md p-2 text-white lg:hidden"
          >
            <span className="block h-0.5 w-6 bg-current transition-all" />
            <span className="mt-1.5 block h-0.5 w-6 bg-current transition-all" />
            <span className="mt-1.5 block h-0.5 w-6 bg-current transition-all" />
          </button>
        </div>
      </nav>

      <div
        className={`overflow-hidden transition-all duration-300 lg:hidden ${
          menuOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <ul className="space-y-1 px-6 pb-4">
          {navLinks.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  scrollToSection(l.id);
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-slate-300 hover:bg-white/5 hover:text-white"
              >
                {l.label}
              </button>
            </li>
          ))}
          <li>
            <a
              href="#/"
              className="block rounded-lg px-3 py-2 text-sm font-semibold text-emerald-400 hover:bg-white/5 hover:text-emerald-300"
            >
              Iniciar sesión
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-screen items-center overflow-hidden bg-slate-950 pt-28"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-20 h-96 w-96 animate-float rounded-full bg-emerald-500/20 blur-3xl" />
        <div
          className="absolute -right-24 bottom-10 h-96 w-96 animate-float rounded-full bg-cyan-500/20 blur-3xl"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">
        <div>
          <h1
            className="animate-fade-in-up text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "100ms" }}
          >
            Control total de tu contabilidad,{" "}
            <span className="animate-gradient-x bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-300 bg-[length:200%_200%] bg-clip-text text-transparent">
              sin complicaciones
            </span>
          </h1>

          <p
            className="mt-6 max-w-xl animate-fade-in-up text-lg leading-relaxed text-slate-400"
            style={{ animationDelay: "250ms" }}
          >
            Un sistema contable moderno, seguro y fácil de usar, diseñado para pequeñas y
            medianas empresas que necesitan eficiencia, control y tranquilidad en su gestión
            financiera.
          </p>

          <div
            className="mt-10 flex animate-fade-in-up flex-wrap gap-4"
            style={{ animationDelay: "400ms" }}
          >
            <button
              type="button"
              onClick={() => scrollToSection("contacto")}
              className="rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-7 py-3 font-semibold text-slate-950 shadow-xl shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-emerald-400/40"
            >
              Solicitar demostración
            </button>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/15 px-7 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:border-white/40 hover:bg-white/5"
            >
              Hablar con un asesor
            </a>
          </div>
        </div>

        <div className="relative animate-fade-in-up" style={{ animationDelay: "500ms" }}>
          <div className="absolute inset-0 -z-0 rounded-3xl bg-gradient-to-tr from-emerald-500/30 to-cyan-500/20 blur-2xl" />
          <img
            src={`${ASSETS}/shake.png`}
            alt="Sistema contable BAP SRL"
            className="relative mx-auto w-full max-w-lg animate-float drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}

function Empresa() {
  return (
    <section id="empresa" className="bg-slate-950 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
              BAP SRL
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              Tecnología contable pensada para tu negocio
            </h2>
            <p className="mt-6 leading-relaxed text-slate-400">
              Somos una empresa dedicada al desarrollo de soluciones tecnológicas
              empresariales, especializada en sistemas contables modernos, confiables y
              escalables.
            </p>
            <p className="mt-4 leading-relaxed text-slate-400">
              Nuestro objetivo es mejorar la gestión financiera de las empresas mediante
              herramientas digitales claras, eficientes y seguras.
            </p>
          </Reveal>

          <div className="space-y-4">
            {beneficios.map((b, i) => (
              <Reveal key={b.titulo} delay={i * 120}>
                <div className="group flex gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:translate-x-2 hover:border-emerald-400/40">
                  <span className="text-3xl font-bold text-white/10 transition-colors duration-300 group-hover:text-emerald-400/50">
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{b.titulo}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">{b.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Servicios() {
  return (
    <section id="servicios" className="bg-slate-900/50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTitle eyebrow="Nuestro servicio principal" title="Sistema contable VisualGas">
          Una plataforma que centraliza tu información contable, con mejor rendimiento,
          mantenimiento sencillo y una base lista para crecer.
        </SectionTitle>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {funcionesVisualGas.map((f, i) => (
            <Reveal key={f.titulo} delay={(i % 3) * 100}>
              <article className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-xl hover:shadow-cyan-500/10">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-400/0 blur-2xl transition-all duration-500 group-hover:bg-cyan-400/20" />
                <div className="relative mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 font-semibold text-cyan-300 ring-1 ring-cyan-400/20 transition-transform duration-300 group-hover:scale-110">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="relative text-lg font-semibold text-white">{f.titulo}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-slate-400">{f.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Reconocimientos() {
  return (
    <section id="reconocimientos" className="bg-slate-950 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTitle
          eyebrow="Trayectoria"
          title="Reconocimientos y certificaciones"
        >
          Nuestra trayectoria y compromiso con la excelencia han sido reconocidos por diversas
          instituciones y premios internacionales.
        </SectionTitle>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {certificaciones.map((c, i) => (
            <Reveal key={c.titulo} delay={i * 120}>
              <div className="group flex h-full flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-8 transition-all duration-500 hover:-translate-y-2 hover:border-emerald-400/40">
                {c.imagen && (
                  <img
                    src={c.imagen}
                    alt={c.titulo}
                    className="mb-6 h-32 w-full rounded-lg object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <h3 className="text-xl font-semibold text-white">{c.titulo}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">{c.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Clientes() {
  const [expandido, setExpandido] = useState(false);
  const visibles = expandido ? clientes : clientes.slice(0, CLIENTES_INICIALES);

  return (
    <section id="clientes" className="bg-slate-900/50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTitle
          eyebrow="Clientes"
          title="Empresas que confían en nuestras soluciones"
        >
          Más de 80 empresas líderes confían en nuestras soluciones contables.
        </SectionTitle>

        <ul className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibles.map((nombre, i) => (
            <li
              key={nombre}
              style={{ animationDelay: `${(i % CLIENTES_INICIALES) * 40}ms` }}
              className="animate-fade-in-up rounded-xl border border-white/10 bg-slate-950 px-5 py-4 text-sm font-medium text-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400/40 hover:text-white"
            >
              {nombre}
            </li>
          ))}
        </ul>

        {clientes.length > CLIENTES_INICIALES && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setExpandido((e) => !e)}
              className="rounded-full border border-white/15 px-7 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400/50 hover:text-emerald-300"
            >
              {expandido ? "Ver menos" : `Ver más empresas (${clientes.length - CLIENTES_INICIALES})`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function Contacto() {
  return (
    <section id="contacto" className="bg-slate-950 px-6 py-24">
      <Reveal className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 bg-[length:200%_200%] p-12 text-center shadow-2xl shadow-emerald-500/20 animate-gradient-x sm:p-16">
        <h2 className="text-3xl font-bold text-slate-950 sm:text-4xl">
          ¿Deseas implementar nuestro sistema contable?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-slate-900/80">
          Contáctanos y recibe asesoría personalizada para tu empresa.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-slate-950 px-8 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/40"
          >
            Contactar por WhatsApp
          </a>
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border-2 border-slate-950/70 px-8 py-3 font-semibold text-slate-950 transition-all duration-300 hover:-translate-y-1 hover:bg-slate-950 hover:text-white"
          >
            Facebook
          </a>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-500 md:flex-row">
        <img src={`${ASSETS}/logo.jpg`} alt="BAP SRL" className="h-8 w-auto rounded opacity-80" />
        <p>© {new Date().getFullYear()} BAP SRL. Todos los derechos reservados.</p>
        <a
          href={FACEBOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-emerald-300"
        >
          Facebook
        </a>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

export default function HomePageBAP() {
  return (
    <div className="min-h-screen scroll-smooth bg-slate-950 font-sans antialiased">
      <Navbar />
      <main>
        <Hero />
        <Empresa />
        <Servicios />
        <Reconocimientos />
        <Clientes />
        <Contacto />
      </main>
      <Footer />
    </div>
  );
}