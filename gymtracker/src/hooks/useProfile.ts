import { useEffect, useState } from 'react'
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

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setProfile(data ?? {
          id: user.id,
          full_name: null,
          age: null,
          gender: null,
          birth_year: null,
          height_cm: null,
          current_weight_kg: null,
          target_weight_kg: null,
          job_activity: null,
          training_days_per_week: null,
          training_avg_duration_min: null,
          training_types: null,
          calorie_goal: null,
          protein_goal_g: null,
          carbs_goal_g: null,
          fat_goal_g: null,
          has_partner_cycle: false,
          cycle_tracking_enabled: false,
          onboarding_done: false,
          default_rest_seconds: 90,
          preferred_unit: 'kg',
        })
        setLoading(false)
      })
  }, [user])

  const updateProfile = async (updates: Partial<Omit<Profile, 'id'>>) => {
    if (!user) return { error: new Error('Nepřihlášen') }
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...updates })
    if (!error) setProfile(prev => prev ? { ...prev, ...updates } : null)
    return { error }
  }

  return { profile, loading, updateProfile }
}
