import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Household } from '../types'

export function useHousehold(userId: string | undefined) {
  const [households, setHouseholds] = useState<Household[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  const household = households[activeIndex] ?? null

  const fetchHouseholds = useCallback(async () => {
    if (!userId) return
    setLoading(true)

    // 1. Try to auto-accept any pending invites first
    try {
      await supabase.rpc('accept_pending_invites')
    } catch {
      // RPC may not exist yet, ignore
    }

    // 2. Fetch all household memberships
    const { data: memberships } = await supabase
      .from('household_members')
      .select('household_id')
      .eq('user_id', userId)

    if (memberships && memberships.length > 0) {
      const ids = memberships.map(m => m.household_id)
      const { data: hhs } = await supabase
        .from('households')
        .select('*')
        .in('id', ids)
        .order('created_at', { ascending: true })

      if (hhs && hhs.length > 0) {
        setHouseholds(hhs)
        // Restore saved active household
        const savedId = localStorage.getItem('planeat-active-household')
        if (savedId) {
          const idx = hhs.findIndex(h => h.id === savedId)
          if (idx >= 0) setActiveIndex(idx)
        }
      }
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchHouseholds()
  }, [fetchHouseholds])

  const switchHousehold = (id: string) => {
    const idx = households.findIndex(h => h.id === id)
    if (idx >= 0) {
      setActiveIndex(idx)
      localStorage.setItem('planeat-active-household', id)
    }
  }

  const createHousehold = async (name: string) => {
    if (!userId) return

    const { data: newId, error } = await supabase
      .rpc('create_household', { household_name: name })

    if (error) throw error

    const hh: Household = { id: newId, name, created_at: new Date().toISOString() }
    setHouseholds(prev => [...prev, hh])
    setActiveIndex(households.length) // Switch to the new one
    localStorage.setItem('planeat-active-household', newId)
    return hh
  }

  const inviteMember = async (email: string) => {
    if (!household) throw new Error('No household')

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
    setHouseholds(prev => prev.map(h => h.id === household.id ? { ...h, name: newName } : h))
  }

  const joinByCode = async (code: string) => {
    const { data, error } = await supabase.rpc('join_household_by_code', { p_code: code })
    if (error) throw error
    // Refetch to get the updated household list
    await fetchHouseholds()
    return data as string
  }

  const leaveHousehold = async (householdId: string) => {
    if (!userId) return
    await supabase
      .from('household_members')
      .delete()
      .eq('household_id', householdId)
      .eq('user_id', userId)

    setHouseholds(prev => prev.filter(h => h.id !== householdId))
    setActiveIndex(0)
    localStorage.removeItem('planeat-active-household')
  }

  return {
    household,
    households,
    loading,
    createHousehold,
    inviteMember,
    renameHousehold,
    joinByCode,
    switchHousehold,
    leaveHousehold,
    refetch: fetchHouseholds,
  }
}
