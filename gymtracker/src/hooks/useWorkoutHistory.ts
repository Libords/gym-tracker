import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Workout, WorkoutSet } from '../types/workout'

const PAGE_SIZE = 30

export type WorkoutWithStats = Workout & {
  total_volume_kg: number
  set_count: number
  exercise_count: number
  duration_min: number | null
}

export type HistoryDay = {
  date: string         // YYYY-MM-DD in local TZ
  label: string        // localized weekday + date
  workouts: WorkoutWithStats[]
}

function aggregate(workout: Workout & { workout_sets?: WorkoutSet[] }): WorkoutWithStats {
  const sets = workout.workout_sets ?? []
  let total_volume_kg = 0
  const exerciseIds = new Set<string>()
  for (const s of sets) {
    if (s.reps != null && s.weight_kg != null) {
      total_volume_kg += s.reps * s.weight_kg
    }
    exerciseIds.add(s.exercise_id)
  }
  const duration_min = workout.finished_at
    ? Math.round((new Date(workout.finished_at).getTime() - new Date(workout.started_at).getTime()) / 60000)
    : null
  return {
    ...workout,
    total_volume_kg,
    set_count: sets.length,
    exercise_count: exerciseIds.size,
    duration_min,
  }
}

function localDateKey(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function dayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('cs-CZ', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function groupByDay(workouts: WorkoutWithStats[]): HistoryDay[] {
  const map = new Map<string, HistoryDay>()
  for (const w of workouts) {
    const key = localDateKey(w.started_at)
    const existing = map.get(key)
    if (existing) {
      existing.workouts.push(w)
    } else {
      map.set(key, { date: key, label: dayLabel(w.started_at), workouts: [w] })
    }
  }
  // Map preserves insertion order; workouts come pre-sorted DESC, so map keys are DESC by date.
  return Array.from(map.values())
}

export function useWorkoutHistory() {
  const { user } = useAuth()
  const [days, setDays] = useState<HistoryDay[]>([])
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const fetchPage = useCallback(async (currentOffset: number, append: boolean) => {
    if (!user) return
    const { data, error } = await supabase
      .from('workouts')
      .select('*, workout_sets(id, workout_id, exercise_id, set_number, reps, weight_kg, rest_seconds)')
      .eq('user_id', user.id)
      .not('finished_at', 'is', null)
      .order('started_at', { ascending: false })
      .range(currentOffset, currentOffset + PAGE_SIZE - 1)
    if (error || !data) {
      setLoading(false)
      setLoadingMore(false)
      return
    }
    const aggregated = (data as Array<Workout & { workout_sets?: WorkoutSet[] }>).map(aggregate)
    const newDays = groupByDay(aggregated)
    if (append) {
      setDays(prev => {
        const merged: HistoryDay[] = [...prev]
        for (const d of newDays) {
          const idx = merged.findIndex(x => x.date === d.date)
          if (idx >= 0) {
            merged[idx] = { ...merged[idx], workouts: [...merged[idx].workouts, ...d.workouts] }
          } else {
            merged.push(d)
          }
        }
        return merged
      })
    } else {
      setDays(newDays)
    }
    setHasMore(data.length === PAGE_SIZE)
    setOffset(currentOffset + data.length)
    setLoading(false)
    setLoadingMore(false)
  }, [user])

  useEffect(() => {
    if (!user) return
    setLoading(true)
    setOffset(0)
    setDays([])
    setHasMore(true)
    fetchPage(0, false)
  }, [user, fetchPage])

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return
    setLoadingMore(true)
    fetchPage(offset, true)
  }, [loading, loadingMore, hasMore, offset, fetchPage])

  const refetch = useCallback(() => {
    setLoading(true)
    setOffset(0)
    setDays([])
    setHasMore(true)
    fetchPage(0, false)
  }, [fetchPage])

  return { days, loading, loadingMore, hasMore, loadMore, refetch }
}
