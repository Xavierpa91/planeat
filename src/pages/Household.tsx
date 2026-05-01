import { useState, useEffect } from 'react'
import { Home, UserPlus, Mail, Bell, MessageCircle, ExternalLink, Globe, Moon, Save } from 'lucide-react'
import { useHousehold } from '../hooks/useHousehold'
import { supabase } from '../lib/supabase'
import { useI18n } from '../lib/i18n'
import {
  getNotificationPrefs,
  setNotificationPrefs,
  requestPermission,
  type NotificationPrefs,
} from '../lib/notifications'

const DAY_KEYS = ['day.sun', 'day.mon', 'day.tue', 'day.wed', 'day.thu', 'day.fri', 'day.sat']

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

  // i18n
  const { t, locale, setLocale } = useI18n()

  // Dark mode
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('planeat-theme') === 'dark')

  // WhatsApp config
  const [waPhone, setWaPhone] = useState('')
  const [waApiKey, setWaApiKey] = useState('')
  const [waDailyEnabled, setWaDailyEnabled] = useState(false)
  const [waDailyHour, setWaDailyHour] = useState(9)
  const [waWeeklyEnabled, setWaWeeklyEnabled] = useState(false)
  const [waWeeklyDay, setWaWeeklyDay] = useState(1)
  const [waWeeklyHour, setWaWeeklyHour] = useState(8)
  const [waSaving, setWaSaving] = useState(false)
  const [waSaved, setWaSaved] = useState(false)

  // Load WhatsApp config from Supabase
  useEffect(() => {
    if (!userId) return
    supabase
      .from('whatsapp_config')
      .select('*')
      .eq('user_id', userId)
      .single()
      .then(({ data }) => {
        if (data) {
          setWaPhone(data.phone ?? '')
          setWaApiKey(data.api_key ?? '')
          setWaDailyEnabled(data.daily_enabled ?? false)
          setWaDailyHour(data.daily_hour ?? 9)
          setWaWeeklyEnabled(data.weekly_enabled ?? false)
          setWaWeeklyDay(data.weekly_day ?? 1)
          setWaWeeklyHour(data.weekly_hour ?? 8)
        }
      })
  }, [userId])

  const saveWhatsAppConfig = async () => {
    setWaSaving(true)
    await supabase.rpc('upsert_whatsapp_config', {
      p_phone: waPhone,
      p_api_key: waApiKey,
      p_daily_enabled: waDailyEnabled,
      p_daily_hour: waDailyHour,
      p_weekly_enabled: waWeeklyEnabled,
      p_weekly_day: waWeeklyDay,
      p_weekly_hour: waWeeklyHour,
    })
    setWaSaving(false)
    setWaSaved(true)
    setTimeout(() => setWaSaved(false), 2000)
  }

  const toggleDarkMode = () => {
    const next = !darkMode
    setDarkMode(next)
    if (next) {
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('planeat-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('planeat-theme', 'light')
    }
  }

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
          <h2 className="text-lg font-extrabold text-ink tracking-[-0.02em]">{t('household.createTitle')}</h2>
          <p className="text-sm text-muted mt-1">
            {t('household.createDesc')}
          </p>
        </div>
        <form onSubmit={handleCreate} className="space-y-3">
          <input
            type="text"
            value={householdName}
            onChange={e => setHouseholdName(e.target.value)}
            placeholder={t('household.namePlaceholder')}
            className="w-full px-4 py-3 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            autoFocus
          />
          <button
            type="submit"
            disabled={!householdName.trim() || creating}
            className="w-full px-4 py-3 bg-accent text-white rounded-full text-sm font-semibold disabled:opacity-40 hover:bg-accent-strong transition-colors pressable"
          >
            {creating ? t('household.creating') : t('household.create')}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-extrabold text-ink tracking-[-0.02em] flex items-center gap-2 font-[family-name:var(--font-display)]">
          <Home className="w-5 h-5 text-accent-strong" />
          {household.name}
        </h2>
      </div>

      {/* Invite member */}
      <div className="bg-surface rounded-2xl border border-line p-4 space-y-4 shadow-[var(--shadow-card)]">
        <h3 className="font-semibold text-ink flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-accent" />
          {t('household.inviteMember')}
        </h3>
        <form onSubmit={handleInvite} className="flex gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder={t('household.emailPlaceholder')}
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
          <p className="text-xs text-accent-strong">{t('household.inviteSent')}</p>
        )}
      </div>

      {/* Notifications */}
      <div className="bg-surface rounded-2xl border border-line p-4 space-y-4 shadow-[var(--shadow-card)]">
        <h3 className="font-semibold text-ink flex items-center gap-2">
          <Bell className="w-4 h-4 text-accent" />
          {t('household.notifications')}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink">{t('household.weeklyReminder')}</span>
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
            {t('household.notifBlocked')}
          </p>
        )}

        {notifPrefs.enabled && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-3">
              <label className="text-sm text-muted w-12 shrink-0">{t('household.notifDay')}</label>
              <select
                value={notifPrefs.day}
                onChange={e => updateNotifDay(Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-surface"
              >
                {DAY_KEYS.map((key, i) => (
                  <option key={i} value={i}>{t(key)}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-muted w-12 shrink-0">{t('household.notifHour')}</label>
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
              {t('household.notifDesc')}
            </p>
          </div>
        )}
      </div>

      {/* WhatsApp */}
      <div className="bg-surface rounded-2xl border border-line p-4 space-y-4 shadow-[var(--shadow-card)]">
        <h3 className="font-semibold text-ink flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-green-600" />
          {t('household.whatsapp')}
        </h3>
        <p className="text-sm text-muted">
          {t('household.whatsappDesc')}
        </p>

        {/* Setup instructions */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-ink">{t('household.whatsappSetup')}</p>
          <ol className="text-xs text-muted space-y-1.5 list-decimal list-inside">
            <li>{t('household.whatsappStep1')} <span className="font-mono text-ink bg-bg px-1 rounded">{t('household.whatsappStep1Msg')}</span> {t('household.whatsappStep1To')}</li>
            <li>{t('household.whatsappStep2')}</li>
          </ol>
        </div>

        {/* Phone & API key */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-ink block mb-1">{locale === 'es' ? 'Telefono (con prefijo)' : 'Phone (with prefix)'}</label>
            <input
              type="tel"
              value={waPhone}
              onChange={e => setWaPhone(e.target.value)}
              placeholder="+34612345678"
              className="w-full px-3 py-2 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-surface-2 focus:bg-surface"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink block mb-1">API Key</label>
            <input
              type="text"
              value={waApiKey}
              onChange={e => setWaApiKey(e.target.value)}
              placeholder="123456"
              className="w-full px-3 py-2 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-surface-2 focus:bg-surface"
            />
          </div>
        </div>

        {/* Daily reminder toggle */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-ink">{locale === 'es' ? 'Recordatorio diario' : 'Daily reminder'}</span>
              <p className="text-xs text-muted">{locale === 'es' ? 'Menu del dia + ingredientes' : "Today's menu + ingredients"}</p>
            </div>
            <button
              onClick={() => setWaDailyEnabled(!waDailyEnabled)}
              className={`w-12 h-7 rounded-full transition-colors relative ${waDailyEnabled ? 'bg-green-500' : 'bg-muted-2'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${waDailyEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          {waDailyEnabled && (
            <div className="flex items-center gap-3">
              <label className="text-sm text-muted w-12 shrink-0">{t('household.notifHour')}</label>
              <select
                value={waDailyHour}
                onChange={e => setWaDailyHour(Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-surface"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Weekly reminder toggle */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-ink">{locale === 'es' ? 'Recordatorio semanal' : 'Weekly reminder'}</span>
              <p className="text-xs text-muted">{locale === 'es' ? 'Lista de la compra completa' : 'Full shopping list'}</p>
            </div>
            <button
              onClick={() => setWaWeeklyEnabled(!waWeeklyEnabled)}
              className={`w-12 h-7 rounded-full transition-colors relative ${waWeeklyEnabled ? 'bg-green-500' : 'bg-muted-2'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${waWeeklyEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          {waWeeklyEnabled && (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <label className="text-sm text-muted w-12 shrink-0">{t('household.notifDay')}</label>
                <select
                  value={waWeeklyDay}
                  onChange={e => setWaWeeklyDay(Number(e.target.value))}
                  className="flex-1 px-3 py-2 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-surface"
                >
                  {DAY_KEYS.map((key, i) => (
                    <option key={i} value={i}>{t(key)}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-muted w-12 shrink-0">{t('household.notifHour')}</label>
                <select
                  value={waWeeklyHour}
                  onChange={e => setWaWeeklyHour(Number(e.target.value))}
                  className="flex-1 px-3 py-2 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-surface"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={saveWhatsAppConfig}
          disabled={!waPhone || !waApiKey || waSaving}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-full text-sm font-semibold disabled:opacity-40 hover:bg-green-700 transition-colors pressable"
        >
          <Save className="w-4 h-4" />
          {waSaved ? (locale === 'es' ? 'Guardado!' : 'Saved!') : waSaving ? (locale === 'es' ? 'Guardando...' : 'Saving...') : (locale === 'es' ? 'Guardar configuracion' : 'Save configuration')}
        </button>

        <a
          href="https://www.callmebot.com/blog/free-api-whatsapp-messages/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-accent font-semibold hover:text-accent-strong transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          {t('household.whatsappMore')}
        </a>
      </div>

      {/* Language */}
      <div className="bg-surface rounded-2xl border border-line p-4 space-y-4 shadow-[var(--shadow-card)]">
        <h3 className="font-semibold text-ink flex items-center gap-2">
          <Globe className="w-4 h-4 text-accent" />
          {t('household.language')}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setLocale('es')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-colors pressable ${
              locale === 'es' ? 'bg-accent text-white' : 'bg-bg text-muted border border-line'
            }`}
          >
            🇪🇸 Espanol
          </button>
          <button
            onClick={() => setLocale('en')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-colors pressable ${
              locale === 'en' ? 'bg-accent text-white' : 'bg-bg text-muted border border-line'
            }`}
          >
            🇬🇧 English
          </button>
        </div>
      </div>

      {/* Appearance / Dark mode */}
      <div className="bg-surface rounded-2xl border border-line p-4 space-y-4 shadow-[var(--shadow-card)]">
        <h3 className="font-semibold text-ink flex items-center gap-2">
          <Moon className="w-4 h-4 text-accent" />
          {t('household.appearance')}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink">{t('household.darkMode')}</span>
          <button
            onClick={toggleDarkMode}
            className={`w-12 h-7 rounded-full transition-colors relative ${
              darkMode ? 'bg-accent' : 'bg-muted-2'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
