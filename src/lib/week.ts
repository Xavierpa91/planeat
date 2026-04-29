/**
 * Get the Monday of the current week (or a given date's week)
 */
export function getMonday(date: Date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay()
  // Sunday = 0, so we need to go back 6 days. Monday = 1, go back 0.
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Format date as YYYY-MM-DD for Supabase
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Get Monday of next/previous week relative to a given Monday
 */
export function shiftWeek(monday: Date, direction: 1 | -1): Date {
  const d = new Date(monday)
  d.setDate(d.getDate() + direction * 7)
  return d
}

/**
 * Format week range for display: "21 - 27 Abr 2026"
 */
export function formatWeekRange(monday: Date): string {
  const sunday = new Date(monday)
  sunday.setDate(sunday.getDate() + 6)

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

  const startDay = monday.getDate()
  const endDay = sunday.getDate()
  const month = monthNames[sunday.getMonth()]
  const year = sunday.getFullYear()

  return `${startDay} - ${endDay} ${month} ${year}`
}
