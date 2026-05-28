import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Workout, Exercise, WorkoutSet } from '../types/workout'

export function useWorkouts() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  const fetchWorkouts = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
    setWorkouts(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchWorkouts() }, [fetchWorkouts])

  const createWorkout = async (name: string): Promise<Workout | null> => {
    if (!user) return null
    const { data, error } = await supabase
      .from('workouts')
      .insert({ user_id: user.id, name })
      .select()
      .single()
    if (!error && data) { setWorkouts(prev => [data, ...prev]); return data }
    return null
  }

  const finishWorkout = async (id: string): Promise<void> => {
    const finished_at = new Date().toISOString()
    await supabase.from('workouts').update({ finished_at }).eq('id', id)
    setWorkouts(prev => prev.map(w => w.id === id ? { ...w, finished_at } : w))
  }

  const deleteWorkout = async (id: string): Promise<void> => {
    await supabase.from('workouts').delete().eq('id', id)
    setWorkouts(prev => prev.filter(w => w.id !== id))
  }

  return { workouts, loading, createWorkout, finishWorkout, deleteWorkout, refetch: fetchWorkouts }
}

export function useExercises() {
  const { user } = useAuth()
  const [exercises, setExercises] = useState<Exercise[]>([])

  const fetchExercises = useCallback(async () => {
    const { data } = await supabase.from('exercises').select('*').order('name')
    setExercises(data ?? [])
  }, [])

  useEffect(() => { fetchExercises() }, [fetchExercises])

  const createExercise = async (input: {
    name: string
    body_part: string
    equipment: string
    target?: string | null
  }): Promise<{ exercise: Exercise | null; error: Error | null }> => {
    if (!user) return { exercise: null, error: new Error('Nepřihlášen') }
    const { data, error } = await supabase
      .from('exercises')
      .insert({
        name: input.name.trim(),
        body_part: input.body_part,
        equipment: input.equipment,
        muscle_group: input.target ?? null,
        target: input.target ?? null,
        is_custom: true,
        created_by: user.id,
      })
      .select()
      .single()
    if (error) {
      console.error('[useExercises] createExercise error:', error)
      return { exercise: null, error }
    }
    if (data) setExercises(prev => [...prev, data as Exercise].sort((a, b) => a.name.localeCompare(b.name)))
    return { exercise: (data as Exercise) ?? null, error: null }
  }

  return { exercises, createExercise, refetch: fetchExercises }
}

export function useWorkoutSets(workoutId: string) {
  const [sets, setSets] = useState<WorkoutSet[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSets = useCallback(async () => {
    const { data } = await supabase
      .from('workout_sets')
      .select('*, exercise:exercises(id, name, muscle_group, target, equipment, body_part)')
      .eq('workout_id', workoutId)
      .order('set_number')
    setSets(data ?? [])
    setLoading(false)
  }, [workoutId])

  useEffect(() => { fetchSets() }, [fetchSets])

  const addSet = async (set: Omit<WorkoutSet, 'id' | 'workout_id'>): Promise<void> => {
    const { data } = await supabase
      .from('workout_sets')
      .insert({ ...set, workout_id: workoutId })
      .select('*, exercise:exercises(id, name, muscle_group)')
      .single()
    if (data) setSets(prev => [...prev, data])
  }

  const removeSet = async (id: string): Promise<void> => {
    await supabase.from('workout_sets').delete().eq('id', id)
    setSets(prev => prev.filter(s => s.id !== id))
  }

  return { sets, loading, addSet, removeSet }
}
