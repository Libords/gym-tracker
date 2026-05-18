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

export function calcMacros(food: FoodItem, amount_g: number): DailyMacros {
  const ratio = amount_g / 100
  return {
    calories: Math.round((food.calories_per_100g ?? 0) * ratio),
    protein: Math.round((food.protein_per_100g ?? 0) * ratio * 10) / 10,
    carbs: Math.round((food.carbs_per_100g ?? 0) * ratio * 10) / 10,
    fat: Math.round((food.fat_per_100g ?? 0) * ratio * 10) / 10,
  }
}
