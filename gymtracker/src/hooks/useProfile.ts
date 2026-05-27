import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { JobActivity, TrainingType, Gender } from '../lib/bmr'
import type { Unit } from '../types/workout'

export type Profile = {
  id: string
  full_name: string | null
  // Legacy
  age: number | null
  // New fields
  gender: Gender | null
  birth_year: number | null
  height_cm: number | null
  current_weight_kg: number | null
  target_weight_kg: number | null
  job_activity: JobActivity | null
  training_days_per_week: number | null
  training_avg_duration_min: number | null
  training_types: TrainingType[] | null
  calorie_goal: number | null
  protein_goal_g: number | null
  carbs_goal_g: number | null
  fat_goal_g: number | null
  has_partner_cycle: boolean
  cycle_tracking_enabled: boolean
  onboarding_done: boolean
  default_rest_seconds: number
  preferred_unit: Unit
}

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
    if (error) {
      console.error('[useProfile] fetch error:', error)
    }
    setProfile((data as Profile | null) ?? null)
    setLoading(false)
  }, [user])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const updateProfile = async (updates: Partial<Omit<Profile, 'id'>>) => {
    if (!user) return { error: new Error('Nepřihlášen') }
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...updates })
      .select()
      .single()
    if (error) {
      console.error('[useProfile] upsert error:', error)
      return { error }
    }
    if (data) setProfile(data as Profile)
    return { error: null }
  }

  return { profile, loading, updateProfile, refetch: fetchProfile }
}
