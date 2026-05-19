// Shared TS types referenced by other contract files.
// V runtime appce odpovídají typům v gymtracker/src/types/workout.ts a hooks/useProfile.ts.

export type Exercise = {
  id: string
  name: string
  muscle_group: string | null
  body_part: string | null
  equipment: string | null
  category: string | null
  target: string | null
}

export type WorkoutSet = {
  id: string
  workout_id: string
  exercise_id: string
  set_number: number
  reps: number | null
  weight_kg: number | null
  rest_seconds: number | null
}

export type Workout = {
  id: string
  user_id: string
  name: string
  notes: string | null
  started_at: string
  finished_at: string | null
  created_at: string
  template_id: string | null  // NEW v Sprint I
}

export type Unit = 'kg' | 'lb'

export type ProfilePrefsExtension = {
  default_rest_seconds: number
  preferred_unit: Unit
}
