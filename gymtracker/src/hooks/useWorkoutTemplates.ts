import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type {
  Workout,
  WorkoutTemplate,
  TemplateExercise,
} from '../types/workout'

export type StartFromTemplateResult = {
  workout: Workout
  missingExerciseCount: number
}

export type TemplateExerciseTarget = {
  sets: number
  reps: number
  weight_kg: number | null
}

export function useWorkoutTemplates() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('workout_templates')
      .select('*, template_exercises(*, exercise:exercises(id, name, muscle_group, body_part, equipment, target, category, secondary_muscles, instructions, is_custom, created_by))')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
    if (data) {
      const sorted = data.map(t => ({
        ...t,
        template_exercises: (t.template_exercises ?? []).slice().sort(
          (a: TemplateExercise, b: TemplateExercise) => a.order_index - b.order_index,
        ),
      }))
      setTemplates(sorted as WorkoutTemplate[])
    }
    setLoading(false)
  }, [user])

  useEffect(() => { refetch() }, [refetch])

  const createTemplate = async (name: string): Promise<WorkoutTemplate | null> => {
    if (!user) return null
    const { data, error } = await supabase
      .from('workout_templates')
      .insert({ user_id: user.id, name })
      .select('*')
      .single()
    if (error || !data) return null
    const withExercises = { ...data, template_exercises: [] } as WorkoutTemplate
    setTemplates(prev => [withExercises, ...prev])
    return withExercises
  }

  const renameTemplate = async (id: string, name: string): Promise<void> => {
    const { error } = await supabase
      .from('workout_templates')
      .update({ name })
      .eq('id', id)
    if (!error) {
      setTemplates(prev => prev.map(t => t.id === id ? { ...t, name } : t))
    }
  }

  const deleteTemplate = async (id: string): Promise<void> => {
    const { error } = await supabase.from('workout_templates').delete().eq('id', id)
    if (!error) setTemplates(prev => prev.filter(t => t.id !== id))
  }

  const nextOrderIndex = (templateId: string): number => {
    const t = templates.find(x => x.id === templateId)
    const items = t?.template_exercises ?? []
    return items.length === 0 ? 0 : Math.max(...items.map(i => i.order_index)) + 1
  }

  const addExerciseToTemplate = async (
    templateId: string,
    exerciseId: string,
    target: TemplateExerciseTarget,
  ): Promise<TemplateExercise | null> => {
    const order_index = nextOrderIndex(templateId)
    const { data, error } = await supabase
      .from('template_exercises')
      .insert({
        template_id: templateId,
        exercise_id: exerciseId,
        order_index,
        target_sets: target.sets,
        target_reps: target.reps,
        target_weight_kg: target.weight_kg,
      })
      .select('*, exercise:exercises(*)')
      .single()
    if (error || !data) return null
    setTemplates(prev => prev.map(t =>
      t.id === templateId
        ? { ...t, template_exercises: [...(t.template_exercises ?? []), data as TemplateExercise] }
        : t,
    ))
    return data as TemplateExercise
  }

  const updateTemplateExercise = async (
    id: string,
    patch: Partial<Pick<TemplateExercise, 'target_sets' | 'target_reps' | 'target_weight_kg'>>,
  ): Promise<void> => {
    const { error } = await supabase
      .from('template_exercises')
      .update(patch)
      .eq('id', id)
    if (!error) {
      setTemplates(prev => prev.map(t => ({
        ...t,
        template_exercises: (t.template_exercises ?? []).map(te =>
          te.id === id ? { ...te, ...patch } : te,
        ),
      })))
    }
  }

  const removeTemplateExercise = async (id: string): Promise<void> => {
    const { error } = await supabase.from('template_exercises').delete().eq('id', id)
    if (!error) {
      setTemplates(prev => prev.map(t => ({
        ...t,
        template_exercises: (t.template_exercises ?? []).filter(te => te.id !== id),
      })))
    }
  }

  const reorderTemplateExercises = async (
    templateId: string,
    orderedIds: string[],
  ): Promise<void> => {
    // Optimistic update
    setTemplates(prev => prev.map(t => {
      if (t.id !== templateId) return t
      const byId = new Map((t.template_exercises ?? []).map(te => [te.id, te]))
      const next = orderedIds
        .map((id, idx) => {
          const te = byId.get(id)
          return te ? { ...te, order_index: idx } : null
        })
        .filter((te): te is TemplateExercise => te !== null)
      return { ...t, template_exercises: next }
    }))
    // Two-step write to avoid UNIQUE(template_id, order_index) clash.
    // CHECK constraint enforces order_index >= 0, so use a large temporary offset.
    const OFFSET = 10_000
    await Promise.all(
      orderedIds.map((id, idx) =>
        supabase.from('template_exercises').update({ order_index: OFFSET + idx }).eq('id', id),
      ),
    )
    await Promise.all(
      orderedIds.map((id, idx) =>
        supabase.from('template_exercises').update({ order_index: idx }).eq('id', id),
      ),
    )
  }

  const startFromTemplate = async (
    templateId: string,
  ): Promise<StartFromTemplateResult | null> => {
    if (!user) return null
    const { data: templateRows } = await supabase
      .from('workout_templates')
      .select('id, name, template_exercises(id, exercise_id, order_index, target_sets, target_reps, target_weight_kg, exercise:exercises(id))')
      .eq('id', templateId)
      .single()
    if (!templateRows) return null

    const items = (templateRows.template_exercises ?? [])
      .slice()
      .sort((a: any, b: any) => a.order_index - b.order_index)
    const valid = items.filter((it: any) => it.exercise != null)
    const missingExerciseCount = items.length - valid.length

    const { data: workoutData, error: workoutErr } = await supabase
      .from('workouts')
      .insert({
        user_id: user.id,
        name: templateRows.name,
        template_id: templateId,
      })
      .select('*')
      .single()
    if (workoutErr || !workoutData) return null

    const setsToInsert: Array<{
      workout_id: string
      exercise_id: string
      set_number: number
      reps: number | null
      weight_kg: number | null
      rest_seconds: number | null
    }> = []
    valid.forEach((te: any) => {
      for (let i = 0; i < te.target_sets; i++) {
        setsToInsert.push({
          workout_id: workoutData.id,
          exercise_id: te.exercise_id,
          set_number: i + 1,
          reps: te.target_reps,
          weight_kg: te.target_weight_kg,
          rest_seconds: null,
        })
      }
    })
    if (setsToInsert.length > 0) {
      await supabase.from('workout_sets').insert(setsToInsert)
    }

    return { workout: workoutData as Workout, missingExerciseCount }
  }

  return {
    templates,
    loading,
    refetch,
    createTemplate,
    renameTemplate,
    deleteTemplate,
    addExerciseToTemplate,
    updateTemplateExercise,
    removeTemplateExercise,
    reorderTemplateExercises,
    startFromTemplate,
  }
}
