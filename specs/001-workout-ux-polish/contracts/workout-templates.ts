// Contract: Workout Templates (US1)
// Feature: 001-workout-ux-polish
// Tato signatura definuje TS typy a hook API. Plnohodnotná implementace patří do
// gymtracker/src/types/workout.ts a gymtracker/src/hooks/useWorkoutTemplates.ts.

import type { Exercise, Workout } from './_shared-types'

// ---------- Entity typy ----------

export type WorkoutTemplate = {
  id: string
  user_id: string
  name: string
  created_at: string
  updated_at: string
  // Optional join hint — když fetcher includuje template_exercises
  template_exercises?: TemplateExercise[]
}

export type TemplateExercise = {
  id: string
  template_id: string
  exercise_id: string
  order_index: number
  target_sets: number
  target_reps: number
  target_weight_kg: number | null
  created_at: string
  // Optional join hint
  exercise?: Exercise
}

// ---------- Hook signatura ----------

export type StartFromTemplateResult = {
  workout: Workout
  missingExerciseCount: number  // počet template_exercises rows, u kterých byl smazán exercise
}

export type UseWorkoutTemplates = {
  templates: WorkoutTemplate[]
  loading: boolean
  refetch: () => Promise<void>

  createTemplate: (name: string) => Promise<WorkoutTemplate | null>
  renameTemplate: (id: string, name: string) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>

  addExerciseToTemplate: (templateId: string, exerciseId: string, target: {
    sets: number
    reps: number
    weight_kg: number | null
  }) => Promise<TemplateExercise | null>

  updateTemplateExercise: (
    id: string,
    patch: Partial<Pick<TemplateExercise, 'target_sets' | 'target_reps' | 'target_weight_kg'>>
  ) => Promise<void>

  removeTemplateExercise: (id: string) => Promise<void>

  // Bulk reorder (transakční přepis order_index pro celou šablonu)
  reorderTemplateExercises: (templateId: string, orderedIds: string[]) => Promise<void>

  // Spustit nový workout z šablony — vytvoří workouts + workout_sets s předvyplněnými target hodnotami
  startFromTemplate: (templateId: string) => Promise<StartFromTemplateResult | null>
}
