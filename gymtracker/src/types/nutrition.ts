export type FoodItem = {
  id: string
  name: string
  brand: string | null
  barcode: string | null
  calories_per_100g: number | null
  protein_per_100g: number | null
  carbs_per_100g: number | null
  fat_per_100g: number | null
  fiber_per_100g: number | null
  // Micronutrients (per 100g)
  vitamin_a_mcg: number | null
  vitamin_c_mg: number | null
  vitamin_d_mcg: number | null
  vitamin_e_mg: number | null
  vitamin_k_mcg: number | null
  vitamin_b1_mg: number | null
  vitamin_b2_mg: number | null
  vitamin_b3_mg: number | null
  vitamin_b6_mg: number | null
  vitamin_b12_mcg: number | null
  folate_mcg: number | null
  calcium_mg: number | null
  iron_mg: number | null
  magnesium_mg: number | null
  zinc_mg: number | null
  potassium_mg: number | null
  sodium_mg: number | null
  phosphorus_mg: number | null
  is_custom: boolean
  created_by: string | null
}

export type MealType = 'snidane' | 'obed' | 'vecere' | 'svacina'

export const MEAL_LABELS: Record<MealType, string> = {
  snidane: '🌅 Snídaně',
  obed: '☀️ Oběd',
  vecere: '🌙 Večeře',
  svacina: '🍎 Svačina',
}

export type Meal = {
  id: string
  user_id: string
  date: string
  meal_type: MealType
}

export type MealItem = {
  id: string
  meal_id: string
  food_item_id: string
  amount_g: number
  food_item?: FoodItem
}

export type DailyMacros = {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export type DailyMicros = {
  vitamin_a_mcg: number
  vitamin_c_mg: number
  vitamin_d_mcg: number
  vitamin_e_mg: number
  vitamin_k_mcg: number
  vitamin_b1_mg: number
  vitamin_b2_mg: number
  vitamin_b3_mg: number
  vitamin_b6_mg: number
  vitamin_b12_mcg: number
  folate_mcg: number
  calcium_mg: number
  iron_mg: number
  magnesium_mg: number
  zinc_mg: number
  potassium_mg: number
  sodium_mg: number
  phosphorus_mg: number
}

// Recommended Daily Values (EU reference / WHO average adult)
export const RDV: DailyMicros = {
  vitamin_a_mcg: 800,
  vitamin_c_mg: 80,
  vitamin_d_mcg: 15,
  vitamin_e_mg: 12,
  vitamin_k_mcg: 75,
  vitamin_b1_mg: 1.1,
  vitamin_b2_mg: 1.4,
  vitamin_b3_mg: 16,
  vitamin_b6_mg: 1.4,
  vitamin_b12_mcg: 2.5,
  folate_mcg: 400,
  calcium_mg: 800,
  iron_mg: 14,
  magnesium_mg: 375,
  zinc_mg: 10,
  potassium_mg: 2000,
  sodium_mg: 2000,
  phosphorus_mg: 700,
}

export const MICRO_LABELS: { key: keyof DailyMicros; label: string; unit: string; group: 'vitamins' | 'minerals' }[] = [
  { key: 'vitamin_a_mcg', label: 'Vitamin A', unit: 'mcg', group: 'vitamins' },
  { key: 'vitamin_c_mg', label: 'Vitamin C', unit: 'mg', group: 'vitamins' },
  { key: 'vitamin_d_mcg', label: 'Vitamin D', unit: 'mcg', group: 'vitamins' },
  { key: 'vitamin_e_mg', label: 'Vitamin E', unit: 'mg', group: 'vitamins' },
  { key: 'vitamin_k_mcg', label: 'Vitamin K', unit: 'mcg', group: 'vitamins' },
  { key: 'vitamin_b1_mg', label: 'B1 (Thiamin)', unit: 'mg', group: 'vitamins' },
  { key: 'vitamin_b2_mg', label: 'B2 (Riboflavin)', unit: 'mg', group: 'vitamins' },
  { key: 'vitamin_b3_mg', label: 'B3 (Niacin)', unit: 'mg', group: 'vitamins' },
  { key: 'vitamin_b6_mg', label: 'B6', unit: 'mg', group: 'vitamins' },
  { key: 'vitamin_b12_mcg', label: 'B12', unit: 'mcg', group: 'vitamins' },
  { key: 'folate_mcg', label: 'Folát', unit: 'mcg', group: 'vitamins' },
  { key: 'calcium_mg', label: 'Vápník', unit: 'mg', group: 'minerals' },
  { key: 'iron_mg', label: 'Železo', unit: 'mg', group: 'minerals' },
  { key: 'magnesium_mg', label: 'Hořčík', unit: 'mg', group: 'minerals' },
  { key: 'zinc_mg', label: 'Zinek', unit: 'mg', group: 'minerals' },
  { key: 'potassium_mg', label: 'Draslík', unit: 'mg', group: 'minerals' },
  { key: 'sodium_mg', label: 'Sodík', unit: 'mg', group: 'minerals' },
  { key: 'phosphorus_mg', label: 'Fosfor', unit: 'mg', group: 'minerals' },
]

export function calcMacros(food: FoodItem, amount_g: number): DailyMacros {
  const ratio = amount_g / 100
  return {
    calories: Math.round((food.calories_per_100g ?? 0) * ratio),
    protein: Math.round((food.protein_per_100g ?? 0) * ratio * 10) / 10,
    carbs: Math.round((food.carbs_per_100g ?? 0) * ratio * 10) / 10,
    fat: Math.round((food.fat_per_100g ?? 0) * ratio * 10) / 10,
  }
}

export function calcMicros(food: FoodItem, amount_g: number): DailyMicros {
  const r = amount_g / 100
  const n = (v: number | null) => Math.round((v ?? 0) * r * 100) / 100
  return {
    vitamin_a_mcg: n(food.vitamin_a_mcg),
    vitamin_c_mg: n(food.vitamin_c_mg),
    vitamin_d_mcg: n(food.vitamin_d_mcg),
    vitamin_e_mg: n(food.vitamin_e_mg),
    vitamin_k_mcg: n(food.vitamin_k_mcg),
    vitamin_b1_mg: n(food.vitamin_b1_mg),
    vitamin_b2_mg: n(food.vitamin_b2_mg),
    vitamin_b3_mg: n(food.vitamin_b3_mg),
    vitamin_b6_mg: n(food.vitamin_b6_mg),
    vitamin_b12_mcg: n(food.vitamin_b12_mcg),
    folate_mcg: n(food.folate_mcg),
    calcium_mg: n(food.calcium_mg),
    iron_mg: n(food.iron_mg),
    magnesium_mg: n(food.magnesium_mg),
    zinc_mg: n(food.zinc_mg),
    potassium_mg: n(food.potassium_mg),
    sodium_mg: n(food.sodium_mg),
    phosphorus_mg: n(food.phosphorus_mg),
  }
}

export const EMPTY_MICROS: DailyMicros = {
  vitamin_a_mcg: 0, vitamin_c_mg: 0, vitamin_d_mcg: 0, vitamin_e_mg: 0, vitamin_k_mcg: 0,
  vitamin_b1_mg: 0, vitamin_b2_mg: 0, vitamin_b3_mg: 0, vitamin_b6_mg: 0, vitamin_b12_mcg: 0,
  folate_mcg: 0, calcium_mg: 0, iron_mg: 0, magnesium_mg: 0, zinc_mg: 0,
  potassium_mg: 0, sodium_mg: 0, phosphorus_mg: 0,
}
