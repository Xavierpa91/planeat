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

    // Use DB function to create household + add member in one transaction
    // This avoids RLS issues where SELECT policy requires membership
    const { data: newId, error } = await supabase
      .rpc('create_household', { household_name: name })

    if (error) throw error

    const hh: Household = { id: newId, name, created_at: new Date().toISOString() }
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

  const renameHousehold = async (newName: string) => {
    if (!household) throw new Error('No household')
    const { error } = await supabase
      .from('households')
      .update({ name: newName })
      .eq('id', household.id)
    if (error) throw error
    setHousehold({ ...household, name: newName })
  }

  return { household, loading, createHousehold, inviteMember, renameHousehold, refetch: fetchHousehold }
}
