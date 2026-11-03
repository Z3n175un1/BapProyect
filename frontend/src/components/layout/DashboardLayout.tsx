import { useState, type ReactNode } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const STORAGE_KEY = 'dashboard:sidebar-collapsed'

type DashboardLayoutProps = {
  activeSlug: string
  children: ReactNode
}

/** Layout general del dashboard: sidebar + topbar + área de contenido. */
export default function DashboardLayout({ activeSlug, children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState<boolean>(
    () => window.localStorage.getItem(STORAGE_KEY) === 'true',
  )
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleCollapse = () => {
    setCollapsed(current => {
      const next = !current
      window.localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }

  return (
    <div className="min-h-screen bg-neutral-100 font-sans text-navy-950 antialiased">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        activeSlug={activeSlug}
        onToggleCollapse={toggleCollapse}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className={`flex min-h-screen min-w-0 flex-col transition-[padding] duration-300 ease-in-out ${
          collapsed ? 'lg:pl-[76px]' : 'lg:pl-64'
        }`}
      >
        <Topbar onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>

        <footer className="px-4 pb-6 text-center text-xs text-navy-400 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} BAP SRL · Panel VisualGas </footer>
      </div>
    </div>
  )
}
