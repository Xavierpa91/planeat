import { NavLink, Outlet } from 'react-router-dom'
import { CalendarDays, ChefHat, ShoppingCart, LogOut, Users } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useI18n } from '../lib/i18n'

const logoUrl = import.meta.env.BASE_URL + 'icons/logo.png'

export function Layout() {
  const { user, signOut } = useAuth()
  const { t } = useI18n()

  const navItems = [
    { to: '/', icon: CalendarDays, labelKey: 'nav.menu' },
    { to: '/recipes', icon: ChefHat, labelKey: 'nav.recipes' },
    { to: '/shopping', icon: ShoppingCart, labelKey: 'nav.shopping' },
    { to: '/household', icon: Users, labelKey: 'nav.household' },
  ]

  return (
    <div className="min-h-svh bg-bg flex flex-col">
      {/* Header */}
      <header className="bg-surface border-b border-line px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-extrabold tracking-[-0.02em] flex items-center gap-2">
          <img src={logoUrl} alt="PlanEat" className="w-8 h-8 rounded-lg" />
          <span><span className="text-accent-strong">Plan</span><span className="text-ink">Eat</span></span>
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted hidden sm:inline">
            {user?.email}
          </span>
          <button
            onClick={signOut}
            className="text-muted-2 hover:text-ink-2 transition-colors"
            title={t('header.signout')}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 pb-20 max-w-4xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-line flex justify-around py-2 z-50">
        {navItems.map(({ to, icon: Icon, labelKey }) => (
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
                <span className={isActive ? 'font-semibold' : ''}>{t(labelKey)}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
