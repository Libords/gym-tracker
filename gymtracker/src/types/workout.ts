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
  workout_sets?: WorkoutSet[]
}
