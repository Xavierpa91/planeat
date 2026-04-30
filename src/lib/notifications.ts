const NOTIFICATION_KEY = 'planeat-notifications'
const LAST_NOTIFIED_KEY = 'planeat-last-notified'

export interface NotificationPrefs {
  enabled: boolean
  day: number  // 0=Domingo, 1=Lunes, ..., 6=Sabado
  hour: number // 0-23
}

const DEFAULTS: NotificationPrefs = { enabled: false, day: 0, hour: 18 }

export function getNotificationPrefs(): NotificationPrefs {
  const stored = localStorage.getItem(NOTIFICATION_KEY)
  if (stored) {
    try { return JSON.parse(stored) } catch { /* fall through */ }
  }
  return DEFAULTS
}

export function setNotificationPrefs(prefs: NotificationPrefs) {
  localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(prefs))
}

export async function requestPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function checkAndNotify() {
  const prefs = getNotificationPrefs()
  if (!prefs.enabled) return
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const now = new Date()
  const lastNotified = localStorage.getItem(LAST_NOTIFIED_KEY)
  const today = now.toISOString().split('T')[0]

  if (lastNotified === today) return

  if (now.getDay() === prefs.day && now.getHours() >= prefs.hour) {
    new Notification('PlanEat', {
      body: 'Es hora de planificar el menu de la semana!',
      icon: '/planeat/icons/icon-192.png',
      tag: 'weekly-reminder',
    })
    localStorage.setItem(LAST_NOTIFIED_KEY, today)
  }
}

export function startNotificationScheduler() {
  checkAndNotify()
  setInterval(checkAndNotify, 60 * 60 * 1000) // Check every hour
}
