// Estimated one-rep max (Epley formula): 1RM = w × (1 + reps/30).
// Returns null for sets without both weight and reps (e.g. bodyweight/reps-only).
export function estimate1RM(weight_kg: number | null, reps: number | null): number | null {
  if (!weight_kg || !reps || weight_kg <= 0 || reps <= 0) return null
  return Math.round(weight_kg * (1 + reps / 30))
}
