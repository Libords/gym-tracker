import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export type WeightLog = {
  id: string
  user_id: string
  weight_kg: number
  date: string
  note: string | null
}

export type BodyMeasurement = {
  id: string
  user_id: string
  date: string
  chest_cm: number | null
  waist_cm: number | null
  hips_cm: number | null
  arm_cm: number | null
  thigh_cm: number | null
  neck_cm: number | null
  note: string | null
}

export function useWeightLogs() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<WeightLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
    setLogs(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetch() }, [fetch])

  const addLog = async (weight_kg: number, date: string, note?: string) => {
    if (!user) return
    const { data } = await supabase
      .from('weight_logs')
      .insert({ user_id: user.id, weight_kg, date, note: note ?? null })
      .select().single()
    if (data) setLogs(prev => [data, ...prev].sort((a, b) => b.date.localeCompare(a.date)))
  }

  const deleteLog = async (id: string) => {
    await supabase.from('weight_logs').delete().eq('id', id)
    setLogs(prev => prev.filter(l => l.id !== id))
  }

  return { logs, loading, addLog, deleteLog }
}

export function useBodyMeasurements() {
  const { user } = useAuth()
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('body_measurements')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
    setMeasurements(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetch() }, [fetch])

  const addMeasurement = async (values: Omit<BodyMeasurement, 'id' | 'user_id'>) => {
    if (!user) return
    const { data } = await supabase
      .from('body_measurements')
      .insert({ user_id: user.id, ...values })
      .select().single()
    if (data) setMeasurements(prev => [data, ...prev])
  }

  const deleteMeasurement = async (id: string) => {
    await supabase.from('body_measurements').delete().eq('id', id)
    setMeasurements(prev => prev.filter(m => m.id !== id))
  }

  return { measurements, loading, addMeasurement, deleteMeasurement }
}
