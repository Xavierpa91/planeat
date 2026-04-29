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
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!household) {
    return (
      <div className="max-w-sm mx-auto space-y-6 pt-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-accent-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-accent-strong" />
          </div>
          <h2 className="text-lg font-extrabold text-ink tracking-[-0.02em]">Crea tu hogar</h2>
          <p className="text-sm text-muted mt-1">
            Un hogar es donde compartes menus y recetas
          </p>
        </div>
        <form onSubmit={handleCreate} className="space-y-3">
          <input
            type="text"
            value={householdName}
            onChange={e => setHouseholdName(e.target.value)}
            placeholder="Nombre del hogar (ej: Casa)"
            className="w-full px-4 py-3 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            autoFocus
          />
          <button
            type="submit"
            disabled={!householdName.trim() || creating}
            className="w-full px-4 py-3 bg-accent text-white rounded-full text-sm font-semibold disabled:opacity-40 hover:bg-accent-strong transition-colors pressable"
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
        <h2 className="text-lg font-extrabold text-ink tracking-[-0.02em] flex items-center gap-2">
          <Home className="w-5 h-5 text-accent-strong" />
          {household.name}
        </h2>
      </div>

      <div className="bg-surface rounded-2xl border border-line p-4 space-y-4">
        <h3 className="font-semibold text-ink flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-accent" />
          Invitar miembro
        </h3>
        <form onSubmit={handleInvite} className="flex gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="email@ejemplo.com"
            className="flex-1 px-3 py-2 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            disabled={!inviteEmail.trim()}
            className="px-4 py-2 bg-accent text-white rounded-full text-sm font-semibold disabled:opacity-40 hover:bg-accent-strong transition-colors pressable"
          >
            <Mail className="w-4 h-4" />
          </button>
        </form>
        {inviteSent && (
          <p className="text-xs text-accent-strong">Invitacion enviada</p>
        )}
      </div>
    </div>
  )
}
