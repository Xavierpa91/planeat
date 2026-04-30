import { NavLink, Outlet } from 'react-router-dom'
import { CalendarDays, ChefHat, ShoppingCart, LogOut, Users } from 'lucide-react'

const logoUrl = import.meta.env.BASE_URL + 'icons/logo.png'
import { useAuth } from '../hooks/useAuth'

export function Layout() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-svh bg-bg flex flex-col">
      {/* Header */}
      <header className="bg-surface border-b border-line px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-accent-strong tracking-[-0.02em] flex items-center gap-2">
          <img src={logoUrl} alt="PlanEat" className="w-8 h-8 rounded-lg" />
          PlanEat
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted hidden sm:inline">
            {user?.email}
          </span>
          <button
            onClick={signOut}
            className="text-muted-2 hover:text-ink-2 transition-colors"
            title="Cerrar sesion"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 pb-20 max-w-4xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Bottom nav (material-style with pill active indicator) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-line flex justify-around py-2 z-50">
        {[
          { to: '/', icon: CalendarDays, label: 'Menu' },
          { to: '/recipes', icon: ChefHat, label: 'Recetas' },
          { to: '/shopping', icon: ShoppingCart, label: 'Compra' },
          { to: '/household', icon: Users, label: 'Hogar' },
        ].map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1 text-xs transition-colors ${
                isActive ? 'text-accent-strong' : 'text-muted-2'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex items-center justify-center w-10 h-7 rounded-full transition-colors ${
                    isActive ? 'bg-accent-soft' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <span className={isActive ? 'font-semibold' : ''}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
