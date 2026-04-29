import { NavLink, Outlet } from 'react-router-dom'
import { CalendarDays, ChefHat, ShoppingCart, LogOut, Users } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export function Layout() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-svh bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-green-600 flex items-center gap-2">
          <ChefHat className="w-6 h-6" />
          PlanEat
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 hidden sm:inline">
            {user?.email}
          </span>
          <button
            onClick={signOut}
            className="text-slate-400 hover:text-slate-600 transition-colors"
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

      {/* Bottom nav (mobile-first) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around py-2 z-50">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-3 py-1 text-xs transition-colors ${
              isActive ? 'text-green-600' : 'text-slate-400'
            }`
          }
        >
          <CalendarDays className="w-5 h-5" />
          Menu
        </NavLink>
        <NavLink
          to="/recipes"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-3 py-1 text-xs transition-colors ${
              isActive ? 'text-green-600' : 'text-slate-400'
            }`
          }
        >
          <ChefHat className="w-5 h-5" />
          Recetas
        </NavLink>
        <NavLink
          to="/shopping"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-3 py-1 text-xs transition-colors ${
              isActive ? 'text-green-600' : 'text-slate-400'
            }`
          }
        >
          <ShoppingCart className="w-5 h-5" />
          Compra
        </NavLink>
        <NavLink
          to="/household"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-3 py-1 text-xs transition-colors ${
              isActive ? 'text-green-600' : 'text-slate-400'
            }`
          }
        >
          <Users className="w-5 h-5" />
          Hogar
        </NavLink>
      </nav>
    </div>
  )
}
