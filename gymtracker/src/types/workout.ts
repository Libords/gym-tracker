export type Exercise = {
  id: string
  name: string
  muscle_group: string | null
  body_part: string | null
  equipment: string | null
  category: string | null
  target: string | null
  secondary_muscles: string[] | null
  instructions: string[] | null
  image_url: string | null
  is_custom: boolean
  created_by: string | null
}

export type WorkoutSet = {
  id: string
  workout_id: string
  exercise_id: string
  set_number: number
  reps: number | null
  weight_kg: number | null
  rest_seconds: number | null
  exercise?: Exercise
}

export type Workout = {
  id: string
  user_id: string
  name: string
  notes: string | null
  started_at: string
  finished_at: string | null
  created_at: string
  template_id: string | null
  workout_sets?: WorkoutSet[]
}

export type Unit = 'kg' | 'lb'

export type WorkoutTemplate = {
  id: string
  user_id: string
  name: string
  created_at: string
  updated_at: string
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
  exercise?: Exercise
}

export type EquipmentChip =
  | 'dumbbell'
  | 'barbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'kettlebell'
  | 'bands'
  | 'other'
