import { useState } from 'react'
import { Home, UserPlus, Mail } from 'lucide-react'
import { useHousehold } from '../hooks/useHousehold'

interface HouseholdPageProps {
  userId: string
  onHouseholdCreated: () => void
}

export function HouseholdPage({ userId, onHouseholdCreated }: HouseholdPageProps) {
  const { household, loading, createHousehold, inviteMember } = useHousehold(userId)
  const [householdName, setHouseholdName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteSent, setInviteSent] = useState(false)
  const [creating, setCreating] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!householdName.trim()) return
    setCreating(true)
    await createHousehold(householdName.trim())
    setCreating(false)
    onHouseholdCreated()
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    await inviteMember(inviteEmail.trim())
    setInviteSent(true)
    setInviteEmail('')
    setTimeout(() => setInviteSent(false), 3000)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!household) {
    return (
      <div className="max-w-sm mx-auto space-y-6 pt-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">Crea tu hogar</h2>
          <p className="text-sm text-slate-500 mt-1">
            Un hogar es donde compartes menus y recetas
          </p>
        </div>
        <form onSubmit={handleCreate} className="space-y-3">
          <input
            type="text"
            value={householdName}
            onChange={e => setHouseholdName(e.target.value)}
            placeholder="Nombre del hogar (ej: Casa)"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={!householdName.trim() || creating}
            className="w-full px-4 py-3 bg-green-500 text-white rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-green-600 transition-colors"
          >
            {creating ? 'Creando...' : 'Crear hogar'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Home className="w-5 h-5 text-green-600" />
          {household.name}
        </h2>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
        <h3 className="font-medium text-slate-700 flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Invitar miembro
        </h3>
        <form onSubmit={handleInvite} className="flex gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="email@ejemplo.com"
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            disabled={!inviteEmail.trim()}
            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-green-600 transition-colors"
          >
            <Mail className="w-4 h-4" />
          </button>
        </form>
        {inviteSent && (
          <p className="text-xs text-green-600">Invitacion enviada</p>
        )}
      </div>
    </div>
  )
}
