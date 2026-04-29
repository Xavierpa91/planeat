import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Household } from '../types'

export function useHousehold(userId: string | undefined) {
  const [household, setHousehold] = useState<Household | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchHousehold = useCallback(async () => {
    if (!userId) return
    setLoading(true)

    const { data: membership } = await supabase
      .from('household_members')
      .select('household_id')
      .eq('user_id', userId)
      .limit(1)
      .single()

    if (membership) {
      const { data: hh } = await supabase
        .from('households')
        .select('*')
        .eq('id', membership.household_id)
        .single()

      setHousehold(hh)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchHousehold()
  }, [fetchHousehold])

  const createHousehold = async (name: string) => {
    if (!userId) return

    const { data: hh, error } = await supabase
      .from('households')
      .insert({ name })
      .select()
      .single()

    if (error) throw error

    await supabase
      .from('household_members')
      .insert({ household_id: hh.id, user_id: userId, role: 'admin' })

    setHousehold(hh)
    return hh
  }

  const inviteMember = async (email: string) => {
    if (!household) throw new Error('No household')

    // Look up user by email via profiles or just store the invite
    // For MVP: we store the email and check on login
    const { error } = await supabase
      .from('household_invites')
      .insert({ household_id: household.id, email, invited_by: userId })

    if (error) throw error
  }

  return { household, loading, createHousehold, inviteMember, refetch: fetchHousehold }
}
