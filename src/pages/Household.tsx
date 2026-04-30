import { useState, useEffect } from 'react'
import { Home, UserPlus, Mail, Bell, MessageCircle, ExternalLink } from 'lucide-react'
import { useHousehold } from '../hooks/useHousehold'
import {
  getNotificationPrefs,
  setNotificationPrefs,
  requestPermission,
  type NotificationPrefs,
} from '../lib/notifications'

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado']

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

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(getNotificationPrefs)
  const [permissionDenied, setPermissionDenied] = useState(false)

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'denied') {
      setPermissionDenied(true)
    }
  }, [])

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

  const toggleNotifications = async () => {
    if (!notifPrefs.enabled) {
      const granted = await requestPermission()
      if (!granted) {
        setPermissionDenied(true)
        return
      }
      setPermissionDenied(false)
    }
    const updated = { ...notifPrefs, enabled: !notifPrefs.enabled }
    setNotifPrefs(updated)
    setNotificationPrefs(updated)
  }

  const updateNotifDay = (day: number) => {
    const updated = { ...notifPrefs, day }
    setNotifPrefs(updated)
    setNotificationPrefs(updated)
  }

  const updateNotifHour = (hour: number) => {
    const updated = { ...notifPrefs, hour }
    setNotifPrefs(updated)
    setNotificationPrefs(updated)
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

      {/* Invite member */}
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

      {/* Notifications */}
      <div className="bg-surface rounded-2xl border border-line p-4 space-y-4">
        <h3 className="font-semibold text-ink flex items-center gap-2">
          <Bell className="w-4 h-4 text-accent" />
          Notificaciones
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink">Recordatorio semanal</span>
          <button
            onClick={toggleNotifications}
            className={`w-12 h-7 rounded-full transition-colors relative ${
              notifPrefs.enabled ? 'bg-accent' : 'bg-muted-2'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${
                notifPrefs.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {permissionDenied && (
          <p className="text-xs text-danger">
            Notificaciones bloqueadas. Activalas en los ajustes de tu navegador.
          </p>
        )}

        {notifPrefs.enabled && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-3">
              <label className="text-sm text-muted w-12 shrink-0">Dia</label>
              <select
                value={notifPrefs.day}
                onChange={e => updateNotifDay(Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-surface"
              >
                {DAY_NAMES.map((name, i) => (
                  <option key={i} value={i}>{name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-muted w-12 shrink-0">Hora</label>
              <select
                value={notifPrefs.hour}
                onChange={e => updateNotifHour(Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-surface"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-muted">
              Recibiras una notificacion para planificar el menu de la semana.
            </p>
          </div>
        )}
      </div>

      {/* WhatsApp */}
      <div className="bg-surface rounded-2xl border border-line p-4 space-y-4">
        <h3 className="font-semibold text-ink flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-green-600" />
          WhatsApp
        </h3>
        <p className="text-sm text-muted">
          Recibe un recordatorio semanal por WhatsApp con el enlace al menu. Usa CallMeBot (gratuito).
        </p>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-ink">Como configurarlo:</p>
          <ol className="text-xs text-muted space-y-1.5 list-decimal list-inside">
            <li>Envia <span className="font-mono text-ink bg-bg px-1 rounded">I allow callmebot to send me messages</span> al <span className="font-semibold text-ink">+34 644 52 74 88</span> en WhatsApp</li>
            <li>Recibiras tu API key personal</li>
            <li>Configuralo en los secrets del repositorio de GitHub</li>
          </ol>
        </div>
        <a
          href="https://www.callmebot.com/blog/free-api-whatsapp-messages/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-accent font-semibold hover:text-accent-strong transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Mas info sobre CallMeBot
        </a>
      </div>
    </div>
  )
}
