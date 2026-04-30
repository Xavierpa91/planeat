import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useHousehold } from './hooks/useHousehold'
import { I18nProvider } from './lib/i18n'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { MenuPage } from './pages/Menu'
import { RecipesPage } from './pages/Recipes'
import { ShoppingPage } from './pages/Shopping'
import { HouseholdPage } from './pages/Household'

function AuthenticatedApp() {
  const { user } = useAuth()
  const { household, loading, refetch } = useHousehold(user?.id)

  if (loading) {
    return (
      <div className="min-h-svh bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!household) {
    return <HouseholdPage userId={user!.id} onHouseholdCreated={refetch} />
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<MenuPage householdId={household.id} />} />
        <Route path="/recipes" element={<RecipesPage householdId={household.id} />} />
        <Route path="/shopping" element={<ShoppingPage householdId={household.id} />} />
        <Route path="/household" element={<HouseholdPage userId={user!.id} onHouseholdCreated={refetch} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-svh bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <I18nProvider>
      <HashRouter>
        <Routes>
          <Route path="*" element={user ? <AuthenticatedApp /> : <Login />} />
        </Routes>
      </HashRouter>
    </I18nProvider>
  )
}

export default App
