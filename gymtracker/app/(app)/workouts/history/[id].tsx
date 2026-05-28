import { useEffect, useMemo, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { supabase } from '../../../../src/lib/supabase'
import { useUnitPreference } from '../../../../src/hooks/useUnitPreference'
import { formatWeight } from '../../../../src/lib/units'
import { estimate1RM } from '../../../../src/lib/oneRepMax'
import type { Exercise, Workout, WorkoutSet } from '../../../../src/types/workout'

type SetWithExercise = WorkoutSet & { exercise?: Exercise }

type ExerciseGroup = {
  exercise_id: string
  exercise_name: string
  sets: SetWithExercise[]
  max_weight_kg: number | null
  total_volume_kg: number
  best_1rm: number | null
}

function groupByExercise(sets: SetWithExercise[]): ExerciseGroup[] {
  const map = new Map<string, ExerciseGroup>()
  for (const s of sets) {
    const name = s.exercise?.name ?? '?'
    const oneRm = estimate1RM(s.weight_kg, s.reps)
    const existing = map.get(s.exercise_id)
    if (existing) {
      existing.sets.push(s)
      if (s.weight_kg != null) {
        existing.max_weight_kg = Math.max(existing.max_weight_kg ?? 0, s.weight_kg)
      }
      if (s.reps != null && s.weight_kg != null) {
        existing.total_volume_kg += s.reps * s.weight_kg
      }
      if (oneRm != null) {
        existing.best_1rm = Math.max(existing.best_1rm ?? 0, oneRm)
      }
    } else {
      map.set(s.exercise_id, {
        exercise_id: s.exercise_id,
        exercise_name: name,
        sets: [s],
        max_weight_kg: s.weight_kg ?? null,
        total_volume_kg: (s.reps != null && s.weight_kg != null) ? s.reps * s.weight_kg : 0,
        best_1rm: oneRm,
      })
    }
  }
  return Array.from(map.values())
}

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { unit } = useUnitPreference()
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [sets, setSets] = useState<SetWithExercise[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [{ data: w }, { data: s }] = await Promise.all([
        supabase.from('workouts').select('*').eq('id', id).single(),
        supabase
          .from('workout_sets')
          .select('*, exercise:exercises(id, name, muscle_group, body_part, equipment, target, category, secondary_muscles, instructions, is_custom, created_by)')
          .eq('workout_id', id)
          .order('set_number'),
      ])
      if (cancelled) return
      setWorkout(w as Workout | null)
      setSets((s as SetWithExercise[] | null) ?? [])
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [id])

  const groups = useMemo(() => groupByExercise(sets), [sets])
  const stats = useMemo(() => {
    let total = 0
    for (const s of sets) {
      if (s.reps != null && s.weight_kg != null) total += s.reps * s.weight_kg
    }
    const duration = workout?.finished_at
      ? Math.round((new Date(workout.finished_at).getTime() - new Date(workout.started_at).getTime()) / 60000)
      : null
    return { total_volume_kg: total, duration_min: duration }
  }, [sets, workout])

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>
  if (!workout) return <View style={styles.center}><Text>Trénink nenalezen.</Text></View>

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Zpět</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{workout.name}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.summary}>
          <Text style={styles.summaryDate}>
            {new Date(workout.started_at).toLocaleString('cs-CZ', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </Text>
          <View style={styles.summaryRow}>
            <SummaryStat label="Objem" value={formatWeight(stats.total_volume_kg, unit, { decimals: 0 })} />
            <SummaryStat label="Cviků" value={String(groups.length)} />
            <SummaryStat label="Sérií" value={String(sets.length)} />
            <SummaryStat label="Trvání" value={stats.duration_min != null ? `${stats.duration_min} min` : '—'} />
          </View>
        </View>

        {groups.map(g => (
          <View key={g.exercise_id} style={styles.exerciseGroup}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{g.exercise_name}</Text>
              <Text style={styles.exerciseMeta}>
                Max {formatWeight(g.max_weight_kg, unit)}{'  •  '}
                Objem {formatWeight(g.total_volume_kg, unit, { decimals: 0 })}
                {g.best_1rm != null ? `  •  1RM ${formatWeight(g.best_1rm, unit)}` : ''}
              </Text>
            </View>
            {g.sets.map((s, idx) => {
              const oneRm = estimate1RM(s.weight_kg, s.reps)
              return (
                <View key={s.id} style={styles.setRow}>
                  <Text style={styles.setNumber}>{idx + 1}.</Text>
                  <Text style={styles.setText}>
                    {s.reps != null ? `${s.reps} opak.` : '—'}
                    {s.weight_kg != null ? `  •  ${formatWeight(s.weight_kg, unit)}` : ''}
                  </Text>
                  {oneRm != null && (
                    <Text style={styles.set1rm}>1RM {formatWeight(oneRm, unit)}</Text>
                  )}
                </View>
              )
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 24, gap: 12 },
  back: { color: '#2563eb', fontSize: 15, width: 60 },
  title: { flex: 1, fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  summary: { paddingHorizontal: 16, paddingBottom: 12 },
  summaryDate: { color: '#666', fontSize: 13, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, backgroundColor: '#f8f9fa', borderRadius: 10, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 2, textTransform: 'uppercase' },
  exerciseGroup: { marginTop: 16, paddingHorizontal: 16 },
  exerciseHeader: { borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 6, marginBottom: 6 },
  exerciseName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  exerciseMeta: { color: '#888', fontSize: 12, marginTop: 2 },
  setRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 12 },
  setNumber: { color: '#888', fontSize: 14, width: 24 },
  setText: { color: '#1a1a1a', fontSize: 14, flex: 1 },
  set1rm: { color: '#64748b', fontSize: 12, fontWeight: '600' },
})
