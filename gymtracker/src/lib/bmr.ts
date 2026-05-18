// ─── Types ────────────────────────────────────────────────────────────────────

export type JobActivity = 'sedentary' | 'light' | 'moderate' | 'active'
export type TrainingType = 'strength' | 'cardio' | 'stretching' | 'swimming' | 'cycling'
export type Gender = 'female' | 'male'

export const JOB_ACTIVITY_LABELS: Record<JobActivity, { label: string; desc: string; emoji: string }> = {
  sedentary: { emoji: '🖥️', label: 'Převážně sedím', desc: 'Kancelář, home office, řidič' },
  light:     { emoji: '🚶', label: 'Trochu se pohybuji', desc: 'Učitel, prodejce, mírná chůze' },
  moderate:  { emoji: '👟', label: 'Hodně na nohou', desc: 'Zdravotnice, číšník, prodavač' },
  active:    { emoji: '💪', label: 'Fyzicky náročné', desc: 'Stavebnictví, zemědělství, sport' },
}

export const TRAINING_TYPE_LABELS: Record<TrainingType, { label: string; emoji: string }> = {
  strength:   { emoji: '🏋️', label: 'Silový trénink' },
  cardio:     { emoji: '🏃', label: 'Kardio' },
  stretching: { emoji: '🧘', label: 'Protahování / jóga' },
  swimming:   { emoji: '🏊', label: 'Plavání' },
  cycling:    { emoji: '🚴', label: 'Cyklistika' },
}

// ─── BMR (Mifflin-St Jeor) ────────────────────────────────────────────────────

/**
 * Mifflin-St Jeor formula — most accurate for general population
 * Men:   BMR = 10·W + 6.25·H − 5·A + 5
 * Women: BMR = 10·W + 6.25·H − 5·A − 161
 */
export function calcBMR(
  weight_kg: number,
  height_cm: number,
  birthYear: number,
  gender: Gender
): number {
  const age = Math.max(1, new Date().getFullYear() - birthYear)
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age
  return Math.round(gender === 'male' ? base + 5 : base - 161)
}

// ─── TDEE ─────────────────────────────────────────────────────────────────────

// Job NEAT (Non-Exercise Activity Thermogenesis) multipliers
const JOB_MULTIPLIER: Record<JobActivity, number> = {
  sedentary: 1.20,
  light:     1.30,
  moderate:  1.42,
  active:    1.55,
}

// Average kcal burned per minute per training type (calibrated for 70 kg person)
const CAL_PER_MIN_70KG: Record<TrainingType, number> = {
  strength:   7,
  cardio:     10,
  stretching: 4,
  swimming:   9,
  cycling:    8,
}

export function calcTDEE(params: {
  bmr: number
  jobActivity: JobActivity
  trainingDaysPerWeek: number
  trainingAvgDurationMin: number
  trainingTypes: TrainingType[]
  weight_kg: number
}): number {
  const {
    bmr, jobActivity, trainingDaysPerWeek,
    trainingAvgDurationMin, trainingTypes, weight_kg,
  } = params

  // Base from job NEAT
  const baseTDEE = bmr * (JOB_MULTIPLIER[jobActivity] ?? 1.2)

  // Training calories per day
  const avgCalPerMin70 = trainingTypes.length === 0
    ? 7
    : trainingTypes.reduce((s, t) => s + (CAL_PER_MIN_70KG[t] ?? 7), 0) / trainingTypes.length

  // Scale by actual body weight
  const avgCalPerMin = avgCalPerMin70 * (weight_kg / 70)
  const calPerDay = (avgCalPerMin * trainingAvgDurationMin * trainingDaysPerWeek) / 7

  return Math.round(baseTDEE + calPerDay)
}

// ─── Macro split ──────────────────────────────────────────────────────────────

/**
 * Recommended macros for active gym users:
 *   Protein:  1.8 g / kg body weight (supports muscle growth & retention)
 *   Fat:      25 % of calorie goal
 *   Carbs:    remainder
 */
export function calcSuggestedMacros(calorieGoal: number, weight_kg: number) {
  const protein_g = Math.round(weight_kg * 1.8)
  const fat_g = Math.round((calorieGoal * 0.25) / 9)
  const carbs_g = Math.max(0, Math.round((calorieGoal - protein_g * 4 - fat_g * 9) / 4))
  return { protein_g, fat_g, carbs_g }
}

// ─── BMI ─────────────────────────────────────────────────────────────────────

export function calcBMI(weight_kg: number, height_cm: number): number {
  return Math.round((weight_kg / Math.pow(height_cm / 100, 2)) * 10) / 10
}

export function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Podváha', color: '#3b82f6' }
  if (bmi < 25)   return { label: 'Normální', color: '#22c55e' }
  if (bmi < 30)   return { label: 'Nadváha', color: '#f59e0b' }
  return           { label: 'Obezita', color: '#ef4444' }
}
