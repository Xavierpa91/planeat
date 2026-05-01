// Supabase Edge Function: send-whatsapp-reminder
// Invoked hourly by pg_cron. Checks whatsapp_config for users who need a reminder now.
// Two modes: "daily" (today's missing ingredients) and "weekly" (full shopping list for the week).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// CallMeBot API
async function sendWhatsApp(phone: string, apiKey: string, message: string): Promise<boolean> {
  const encoded = encodeURIComponent(message)
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encoded}&apikey=${apiKey}`
  try {
    const res = await fetch(url)
    return res.ok
  } catch {
    console.error(`Failed to send WhatsApp to ${phone}`)
    return false
  }
}

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

interface WhatsAppConfig {
  user_id: string
  phone: string
  api_key: string
  daily_enabled: boolean
  daily_hour: number
  daily_days: number[]
  weekly_enabled: boolean
  weekly_day: number
  weekly_hour: number
}

async function getMenuForDay(householdId: string, weekStart: string, dayOfWeek: number) {
  // Get the menu for this week
  const { data: menu } = await supabase
    .from('weekly_menus')
    .select('id')
    .eq('household_id', householdId)
    .eq('week_start', weekStart)
    .single()

  if (!menu) return []

  // Get slots for this day with recipes + ingredients
  const { data: slots } = await supabase
    .from('menu_slots')
    .select(`
      meal_type,
      recipe:recipes(name, recipe_ingredients(name)),
      custom_meal
    `)
    .eq('menu_id', menu.id)
    .eq('day_of_week', dayOfWeek)

  return slots ?? []
}

async function getWeekIngredients(householdId: string, weekStart: string) {
  const { data: menu } = await supabase
    .from('weekly_menus')
    .select('id')
    .eq('household_id', householdId)
    .eq('week_start', weekStart)
    .single()

  if (!menu) return []

  const { data: slots } = await supabase
    .from('menu_slots')
    .select(`
      recipe:recipes(name, recipe_ingredients(name))
    `)
    .eq('menu_id', menu.id)

  if (!slots) return []

  const ingredients: string[] = []
  for (const slot of slots) {
    const recipe = slot.recipe as any
    if (recipe?.recipe_ingredients) {
      for (const ing of recipe.recipe_ingredients) {
        ingredients.push(ing.name)
      }
    }
  }

  return [...new Set(ingredients.map(i => i.trim().toLowerCase()))]
    .map(i => i.charAt(0).toUpperCase() + i.slice(1))
    .sort()
}

async function getUserHousehold(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', userId)
    .limit(1)
    .single()
  return data?.household_id ?? null
}

Deno.serve(async (_req) => {
  try {
    const now = new Date()
    const currentHour = now.getUTCHours() // Note: adjust for timezone if needed
    const currentDay = now.getUTCDay()

    // Fetch all whatsapp configs
    const { data: configs, error } = await supabase
      .from('whatsapp_config')
      .select('*')
      .or('daily_enabled.eq.true,weekly_enabled.eq.true')

    if (error) {
      console.error('Error fetching configs:', error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    let sent = 0

    for (const config of (configs as WhatsAppConfig[]) ?? []) {
      if (!config.phone || !config.api_key) continue

      const householdId = await getUserHousehold(config.user_id)
      if (!householdId) continue

      const today = new Date()
      const weekStart = formatDate(getMonday(today))
      const dayOfWeek = (today.getDay() + 6) % 7 // Convert to Mon=0

      // Daily reminder (check day is in daily_days)
      const activeDays = config.daily_days ?? [1, 2, 3, 4, 5]
      if (config.daily_enabled && currentHour === config.daily_hour && activeDays.includes(currentDay)) {
        const slots = await getMenuForDay(householdId, weekStart, dayOfWeek)
        if (slots.length > 0) {
          const lines = ['🍽️ *PlanEat - Menu de hoy*\n']
          for (const slot of slots) {
            const recipe = slot.recipe as any
            const name = recipe?.name ?? slot.custom_meal ?? 'Sin plato'
            const mealLabel = slot.meal_type === 'lunch' ? 'Comida' :
                              slot.meal_type === 'dinner' ? 'Cena' :
                              slot.meal_type === 'breakfast' ? 'Desayuno' : 'Merienda'
            lines.push(`*${mealLabel}:* ${name}`)

            if (recipe?.recipe_ingredients?.length > 0) {
              const ings = recipe.recipe_ingredients.map((i: any) => i.name).join(', ')
              lines.push(`  📋 ${ings}`)
            }
          }
          lines.push('\n🛒 _Revisa tu lista de la compra en PlanEat_')

          await sendWhatsApp(config.phone, config.api_key, lines.join('\n'))
          sent++
        }
      }

      // Weekly reminder (e.g., Monday morning)
      if (config.weekly_enabled && currentDay === config.weekly_day && currentHour === config.weekly_hour) {
        const ingredients = await getWeekIngredients(householdId, weekStart)
        if (ingredients.length > 0) {
          const lines = ['🛒 *PlanEat - Lista de la compra semanal*\n']
          for (const item of ingredients) {
            lines.push(`☐ ${item}`)
          }
          lines.push(`\n📊 Total: ${ingredients.length} productos`)

          await sendWhatsApp(config.phone, config.api_key, lines.join('\n'))
          sent++
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, sent }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Edge function error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
