import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export type Profile = {
  id: string
  full_name: string | null
  age: number | null
  height_cm: number | null
  target_weight_kg: number | null
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
        setProfile(data)
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
