// Canonical body-part taxonomy for the exercise filter.
//
// Exercises are imported from free-exercise-db, whose `primaryMuscles[0]`
// (stored as `muscle_group`) is the real muscle. We group those fine-grained
// muscles into coarse body parts for the UI filter. This file is the single
// source of truth shared by the filter UI, the seed script, and the SQL
// migration that backfills `body_part` — keep all three in sync.

export const BODY_PARTS = [
  'Vše',
  'chest',
  'back',
  'shoulders',
  'arms',
  'legs',
  'calves',
  'abs',
  'neck',
  'other',
] as const

export const BODY_PART_LABELS: Record<string, string> = {
  'Vše': 'Vše',
  chest: 'Hrudník',
  back: 'Záda',
  shoulders: 'Ramena',
  arms: 'Paže',
  legs: 'Nohy',
  calves: 'Lýtka',
  abs: 'Břicho',
  neck: 'Krk',
  other: 'Ostatní',
}

// free-exercise-db primaryMuscles → coarse body part
const MUSCLE_TO_BODY_PART: Record<string, string> = {
  chest: 'chest',
  lats: 'back',
  'middle back': 'back',
  'lower back': 'back',
  traps: 'back',
  shoulders: 'shoulders',
  biceps: 'arms',
  triceps: 'arms',
  forearms: 'arms',
  quadriceps: 'legs',
  hamstrings: 'legs',
  glutes: 'legs',
  abductors: 'legs',
  adductors: 'legs',
  calves: 'calves',
  abdominals: 'abs',
  neck: 'neck',
}

export function muscleToBodyPart(muscle: string | null | undefined): string {
  if (!muscle) return 'other'
  return MUSCLE_TO_BODY_PART[muscle] ?? 'other'
}
