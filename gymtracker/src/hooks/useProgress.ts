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

export type ProgressPhoto = {
  id: string
  user_id: string
  storage_path: string
  date: string
  note: string | null
  url?: string
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

export function useProgressPhotos() {
  const { user } = useAuth()
  const [photos, setPhotos] = useState<ProgressPhoto[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('progress_photos')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    const withUrls = await Promise.all((data ?? []).map(async p => {
      const { data: urlData } = supabase.storage
        .from('progress-photos')
        .getPublicUrl(p.storage_path)
      return { ...p, url: urlData.publicUrl }
    }))
    setPhotos(withUrls)
    setLoading(false)
  }, [user])

  useEffect(() => { fetch() }, [fetch])

  const refetch = fetch

  const addPhoto = async (uri: string, date: string, note?: string) => {
    if (!user) return
    const ext = uri.split('.').pop() ?? 'jpg'
    const path = `${user.id}/${Date.now()}.${ext}`
    const response = await globalThis.fetch(uri)
    const blob = await response.blob()
    const { error } = await supabase.storage.from('progress-photos').upload(path, blob)
    if (error) throw error
    await supabase.from('progress_photos').insert({ user_id: user.id, storage_path: path, date, note: note ?? null })
    await refetch()
  }

  const deletePhoto = async (photo: ProgressPhoto) => {
    await supabase.storage.from('progress-photos').remove([photo.storage_path])
    await supabase.from('progress_photos').delete().eq('id', photo.id)
    setPhotos(prev => prev.filter(p => p.id !== photo.id))
  }

  return { photos, loading, addPhoto, deletePhoto }
}
