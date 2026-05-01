import { useState, useEffect } from 'react'
import { Home, UserPlus, Mail, Bell, MessageCircle, ExternalLink, Globe, Save, Pencil, Check, Plus, LogOut } from 'lucide-react'
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
  households?: Household[]
  activeHouseholdId?: string
  onSwitchHousehold?: (id: string) => void
  onLeaveHousehold?: (id: string) => void
}

import type { Household } from '../types'

export function HouseholdPage({ userId, onHouseholdCreated, households: passedHouseholds, activeHouseholdId, onSwitchHousehold, onLeaveHousehold }: HouseholdPageProps) {
  const { household, loading, createHousehold, inviteMember, renameHousehold, joinByCode } = useHousehold(userId)
  const [householdName, setHouseholdName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteSent, setInviteSent] = useState(false)
  const [creating, setCreating] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [newHouseholdName, setNewHouseholdName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [joinError, setJoinError] = useState('')
  const [joining, setJoining] = useState(false)

  // i18n
  const { t, locale, setLocale } = useI18n()

  // WhatsApp config
  const [waPhone, setWaPhone] = useState('')
  const [waApiKey, setWaApiKey] = useState('')
  const [waDailyEnabled, setWaDailyEnabled] = useState(false)
  const [waDailyHour, setWaDailyHour] = useState(9)
  const [waDailyDays, setWaDailyDays] = useState<number[]>([1, 2, 3, 4, 5]) // Mon-Fri
  const [waWeeklyEnabled, setWaWeeklyEnabled] = useState(false)
  const [waWeeklyDay, setWaWeeklyDay] = useState(1)
  const [waWeeklyHour, setWaWeeklyHour] = useState(8)
  const [waSaving, setWaSaving] = useState(false)
  const [waSaved, setWaSaved] = useState(false)
  const [waTesting, setWaTesting] = useState(false)
  const [waTestResult, setWaTestResult] = useState<string | null>(null)

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
          setWaDailyDays(data.daily_days ?? [1, 2, 3, 4, 5])
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
      p_daily_days: waDailyDays,
      p_weekly_enabled: waWeeklyEnabled,
      p_weekly_day: waWeeklyDay,
      p_weekly_hour: waWeeklyHour,
    })
    setWaSaving(false)
    setWaSaved(true)
    setTimeout(() => setWaSaved(false), 2000)
  }

  const testWhatsApp = async () => {
    if (!waPhone || !waApiKey) return
    setWaTesting(true)
    setWaTestResult(null)
    try {
      const msg = encodeURIComponent('✅ PlanEat - Test OK!\nTu conexion con WhatsApp funciona correctamente.')
      const url = `https://api.callmebot.com/whatsapp.php?phone=${waPhone}&text=${msg}&apikey=${waApiKey}`
      // CallMeBot doesn't support CORS, so we use no-cors mode.
      // The message is sent even though we can't read the response.
      await fetch(url, { mode: 'no-cors' })
      setWaTestResult(locale === 'es' ? 'Mensaje enviado! Revisa tu WhatsApp.' : 'Message sent! Check your WhatsApp.')
    } catch {
      // Even on network error, the message may have been sent
      setWaTestResult(locale === 'es' ? 'Mensaje enviado! Revisa tu WhatsApp.' : 'Message sent! Check your WhatsApp.')
    }
    setWaTesting(false)
    setTimeout(() => setWaTestResult(null), 5000)
  }

  const toggleDailyDay = (day: number) => {
    setWaDailyDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    )
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

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCode.trim()) return
    setJoining(true)
    setJoinError('')
    try {
      await joinByCode(joinCode.trim())
      onHouseholdCreated()
    } catch {
      setJoinError(locale === 'es' ? 'Codigo no valido' : 'Invalid code')
    }
    setJoining(false)
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

        {/* Create new household */}
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

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-line" />
          <span className="text-xs text-muted-2 font-semibold">{locale === 'es' ? 'O UNETE A UNO' : 'OR JOIN ONE'}</span>
          <div className="flex-1 h-px bg-line" />
        </div>

        {/* Join by code */}
        <form onSubmit={handleJoinByCode} className="space-y-3">
          <input
            type="text"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            placeholder={locale === 'es' ? 'Codigo de invitacion (ej: A1B2C3)' : 'Invite code (e.g. A1B2C3)'}
            className="w-full px-4 py-3 border border-line rounded-xl text-sm text-center font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-accent"
            maxLength={6}
          />
          {joinError && <p className="text-xs text-danger text-center">{joinError}</p>}
          <button
            type="submit"
            disabled={!joinCode.trim() || joining}
            className="w-full px-4 py-3 border-2 border-accent text-accent-strong rounded-full text-sm font-semibold disabled:opacity-40 hover:bg-accent-soft transition-colors pressable"
          >
            {joining ? '...' : (locale === 'es' ? 'Unirme con codigo' : 'Join with code')}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        {isRenaming ? (
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-accent-strong shrink-0" />
            <input
              type="text"
              value={newHouseholdName}
              onChange={e => setNewHouseholdName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && newHouseholdName.trim()) {
                  renameHousehold(newHouseholdName.trim())
                  setIsRenaming(false)
                }
              }}
              className="flex-1 text-lg font-extrabold text-ink border-b-2 border-accent bg-transparent focus:outline-none font-[family-name:var(--font-display)]"
              autoFocus
            />
            <button
              onClick={() => {
                if (newHouseholdName.trim()) {
                  renameHousehold(newHouseholdName.trim())
                  setIsRenaming(false)
                }
              }}
              className="text-accent-strong hover:text-accent transition-colors p-1"
            >
              <Check className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-ink tracking-[-0.02em] flex items-center gap-2 font-[family-name:var(--font-display)]">
              <Home className="w-5 h-5 text-accent-strong" />
              {household.name}
            </h2>
            <button
              onClick={() => { setNewHouseholdName(household.name); setIsRenaming(true) }}
              className="text-muted-2 hover:text-accent transition-colors p-1"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {/* Invite code */}
        {household.invite_code && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted">{locale === 'es' ? 'Codigo de invitacion:' : 'Invite code:'}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(household.invite_code!)
              }}
              className="font-mono text-sm font-bold text-accent-strong bg-accent-soft px-2.5 py-0.5 rounded-lg tracking-widest pressable hover:bg-accent/20 transition-colors"
              title={locale === 'es' ? 'Copiar codigo' : 'Copy code'}
            >
              {household.invite_code}
            </button>
          </div>
        )}
      </div>

      {/* Multi-household switcher */}
      {passedHouseholds && (
        <div className="bg-surface rounded-2xl border border-line p-4 space-y-3 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold text-ink flex items-center gap-2">
            <Home className="w-4 h-4 text-accent" />
            {locale === 'es' ? 'Mis hogares' : 'My households'}
          </h3>
          <div className="space-y-2">
            {passedHouseholds.map(hh => (
              <div
                key={hh.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                  hh.id === activeHouseholdId
                    ? 'border-accent bg-accent-soft'
                    : 'border-line hover:bg-bg'
                }`}
              >
                <button
                  onClick={() => onSwitchHousehold?.(hh.id)}
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  <Home className={`w-4 h-4 ${hh.id === activeHouseholdId ? 'text-accent-strong' : 'text-muted-2'}`} />
                  <span className={`text-sm font-semibold ${hh.id === activeHouseholdId ? 'text-accent-strong' : 'text-ink'}`}>
                    {hh.name}
                  </span>
                  {hh.id === activeHouseholdId && (
                    <span className="text-[10px] font-semibold text-accent bg-accent-soft px-1.5 py-0.5 rounded-full">
                      {locale === 'es' ? 'Activo' : 'Active'}
                    </span>
                  )}
                </button>
                {hh.id !== activeHouseholdId && onLeaveHousehold && (
                  <button
                    onClick={() => {
                      if (confirm(locale === 'es' ? `Salir de "${hh.name}"?` : `Leave "${hh.name}"?`)) {
                        onLeaveHousehold(hh.id)
                      }
                    }}
                    className="text-muted-2 hover:text-danger transition-colors p-1"
                    title={locale === 'es' ? 'Salir del hogar' : 'Leave household'}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              const name = prompt(locale === 'es' ? 'Nombre del nuevo hogar:' : 'New household name:')
              if (name?.trim()) {
                createHousehold(name.trim()).then(() => onHouseholdCreated())
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-line rounded-xl text-sm text-muted hover:text-accent hover:border-accent/30 transition-colors pressable"
          >
            <Plus className="w-4 h-4" />
            {locale === 'es' ? 'Crear otro hogar' : 'Create another household'}
          </button>
        </div>
      )}

      {/* Invite member */}
      <div className="bg-surface rounded-2xl border border-line p-4 space-y-4 shadow-[var(--shadow-card)]">
        <h3 className="font-semibold text-ink flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-accent" />
          {t('household.inviteMember')}
        </h3>

        {/* Email invite */}
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

        <p className="text-xs text-muted">
          {locale === 'es'
            ? 'Introduce el email de Google del invitado. Cuando inicie sesion en PlanEat, se unira a tu hogar automaticamente.'
            : 'Enter the guest\'s Google email. When they sign in to PlanEat, they\'ll automatically join your household.'}
        </p>

        {/* WhatsApp invite — always visible */}
        <div className="border-t border-line-2 pt-3">
          <p className="text-xs text-muted mb-2">
            {locale === 'es'
              ? 'O envia el enlace de tu hogar por WhatsApp:'
              : 'Or send your household link via WhatsApp:'}
          </p>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              locale === 'es'
                ? `Te invito a unirte a mi hogar "${household.name}" en PlanEat! Planifica menus semanales y listas de la compra juntos.\n\nEntra aqui: https://xavierpa91.github.io/planeat/\nCodigo de invitacion: ${household.invite_code ?? ''}`
                : `I'm inviting you to join my household "${household.name}" on PlanEat! Plan weekly menus and shopping lists together.\n\nJoin here: https://xavierpa91.github.io/planeat/\nInvite code: ${household.invite_code ?? ''}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-full text-sm font-semibold hover:bg-green-700 transition-colors pressable"
          >
            <MessageCircle className="w-4 h-4" />
            {locale === 'es' ? 'Invitar por WhatsApp' : 'Invite via WhatsApp'}
          </a>
        </div>
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
            <div className="space-y-3">
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
              <div>
                <label className="text-xs text-muted block mb-1.5">{locale === 'es' ? 'Dias activos' : 'Active days'}</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 0].map(day => {
                    const labels = locale === 'es' ? ['D', 'L', 'M', 'X', 'J', 'V', 'S'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S']
                    const isActive = waDailyDays.includes(day)
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDailyDay(day)}
                        className={`w-9 h-9 rounded-lg text-xs font-bold transition-colors pressable ${
                          isActive ? 'bg-green-500 text-white' : 'bg-surface-2 text-muted border border-line'
                        }`}
                      >
                        {labels[day]}
                      </button>
                    )
                  })}
                </div>
              </div>
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

        {/* Save & Test buttons */}
        <div className="flex gap-2">
          <button
            onClick={saveWhatsAppConfig}
            disabled={!waPhone || !waApiKey || waSaving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-full text-sm font-semibold disabled:opacity-40 hover:bg-green-700 transition-colors pressable"
          >
            <Save className="w-4 h-4" />
            {waSaved ? (locale === 'es' ? 'Guardado!' : 'Saved!') : waSaving ? (locale === 'es' ? 'Guardando...' : 'Saving...') : (locale === 'es' ? 'Guardar' : 'Save')}
          </button>
          <button
            onClick={testWhatsApp}
            disabled={!waPhone || !waApiKey || waTesting}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-green-600 text-green-600 rounded-full text-sm font-semibold disabled:opacity-40 hover:bg-green-50 transition-colors pressable"
          >
            {waTesting ? '...' : 'Test'}
          </button>
        </div>
        {waTestResult && (
          <p className={`text-xs font-semibold text-center ${waTestResult.includes('Error') ? 'text-danger' : 'text-green-600'}`}>
            {waTestResult}
          </p>
        )}

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

    </div>
  )
}
