import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { FoodItem, Meal, MealItem, MealType, DailyMacros, DailyMicros } from '../types/nutrition'
import { calcMacros, calcMicros, EMPTY_MICROS } from '../types/nutrition'

const USDA_KEY = process.env.EXPO_PUBLIC_USDA_API_KEY ?? ''

// USDA nutrient IDs (per 100g values)
const USDA_NUTRIENT_MAP: Record<string, keyof FoodItem> = {
  '320': 'vitamin_a_mcg',   // Vitamin A, RAE
  '401': 'vitamin_c_mg',    // Vitamin C
  '328': 'vitamin_d_mcg',   // Vitamin D (D2+D3)
  '323': 'vitamin_e_mg',    // Vitamin E
  '430': 'vitamin_k_mcg',   // Vitamin K
  '404': 'vitamin_b1_mg',   // Thiamine (B1)
  '405': 'vitamin_b2_mg',   // Riboflavin (B2)
  '406': 'vitamin_b3_mg',   // Niacin (B3)
  '415': 'vitamin_b6_mg',   // Vitamin B6
  '418': 'vitamin_b12_mcg', // Vitamin B12
  '417': 'folate_mcg',      // Folate
  '301': 'calcium_mg',
  '303': 'iron_mg',
  '304': 'magnesium_mg',
  '309': 'zinc_mg',
  '306': 'potassium_mg',
  '307': 'sodium_mg',
  '305': 'phosphorus_mg',
}

// Fetch micronutrients from USDA FoodData Central by food name
export async function fetchUSDAMicronutrients(foodName: string): Promise<Partial<FoodItem>> {
  if (!USDA_KEY) return {}
  try {
    const res = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(foodName)}&pageSize=1&dataType=Foundation,SR%20Legacy&api_key=${USDA_KEY}`
    )
    const data = await res.json()
    const food = data.foods?.[0]
    if (!food) return {}
    const result: Partial<FoodItem> = {}
    for (const n of food.foodNutrients ?? []) {
      const key = USDA_NUTRIENT_MAP[String(n.nutrientId)]
      if (key) (result as any)[key] = n.value ?? null
    }
    return result
  } catch {
    return {}
  }
}

// Search USDA for foods (returns as FoodItem array)
export async function searchUSDA(query: string): Promise<FoodItem[]> {
  if (!USDA_KEY) return []
  try {
    const res = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=15&dataType=Foundation,SR%20Legacy,Branded&api_key=${USDA_KEY}`
    )
    const data = await res.json()
    return (data.foods ?? []).map((f: any): FoodItem => {
      const getNutrient = (id: number) =>
        f.foodNutrients?.find((n: any) => n.nutrientId === id)?.value ?? null
      const result: FoodItem = {
        id: String(f.fdcId),
        name: f.description,
        brand: f.brandOwner ?? null,
        barcode: null,
        calories_per_100g: getNutrient(1008),
        protein_per_100g: getNutrient(1003),
        carbs_per_100g: getNutrient(1005),
        fat_per_100g: getNutrient(1004),
        fiber_per_100g: getNutrient(1079),
        vitamin_a_mcg: getNutrient(320),
        vitamin_c_mg: getNutrient(401),
        vitamin_d_mcg: getNutrient(328),
        vitamin_e_mg: getNutrient(323),
        vitamin_k_mcg: getNutrient(430),
        vitamin_b1_mg: getNutrient(404),
        vitamin_b2_mg: getNutrient(405),
        vitamin_b3_mg: getNutrient(406),
        vitamin_b6_mg: getNutrient(415),
        vitamin_b12_mcg: getNutrient(418),
        folate_mcg: getNutrient(417),
        calcium_mg: getNutrient(301),
        iron_mg: getNutrient(303),
        magnesium_mg: getNutrient(304),
        zinc_mg: getNutrient(309),
        potassium_mg: getNutrient(306),
        sodium_mg: getNutrient(307),
        phosphorus_mg: getNutrient(305),
        is_custom: false,
        created_by: null,
      }
      return result
    })
  } catch {
    return []
  }
}

// Search Open Food Facts
export async function searchOpenFoodFacts(query: string): Promise<FoodItem[]> {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20&fields=id,product_name,brands,code,nutriments`
    const res = await fetch(url)
    const data = await res.json()
    return (data.products ?? [])
      .filter((p: any) => p.product_name)
      .map((p: any): FoodItem => ({
        id: p.code ?? p.id,
        name: p.product_name,
        brand: p.brands ?? null,
        barcode: p.code ?? null,
        calories_per_100g: p.nutriments?.['energy-kcal_100g'] ?? null,
        protein_per_100g: p.nutriments?.proteins_100g ?? null,
        carbs_per_100g: p.nutriments?.carbohydrates_100g ?? null,
        fat_per_100g: p.nutriments?.fat_100g ?? null,
        fiber_per_100g: p.nutriments?.fiber_100g ?? null,
        vitamin_a_mcg: null, vitamin_c_mg: null, vitamin_d_mcg: null, vitamin_e_mg: null,
        vitamin_k_mcg: null, vitamin_b1_mg: null, vitamin_b2_mg: null, vitamin_b3_mg: null,
        vitamin_b6_mg: null, vitamin_b12_mcg: null, folate_mcg: null,
        calcium_mg: null, iron_mg: null, magnesium_mg: null, zinc_mg: null,
        potassium_mg: null, sodium_mg: null, phosphorus_mg: null,
        is_custom: false,
        created_by: null,
      }))
  } catch {
    return []
  }
}

// Fetch by barcode from Open Food Facts
export async function fetchByBarcode(barcode: string): Promise<FoodItem | null> {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
    const data = await res.json()
    if (data.status !== 1 || !data.product) return null
    const p = data.product
    return {
      id: barcode,
      name: p.product_name ?? 'Neznámý produkt',
      brand: p.brands ?? null,
      barcode,
      calories_per_100g: p.nutriments?.['energy-kcal_100g'] ?? null,
      protein_per_100g: p.nutriments?.proteins_100g ?? null,
      carbs_per_100g: p.nutriments?.carbohydrates_100g ?? null,
      fat_per_100g: p.nutriments?.fat_100g ?? null,
      fiber_per_100g: p.nutriments?.fiber_100g ?? null,
      vitamin_a_mcg: null, vitamin_c_mg: null, vitamin_d_mcg: null, vitamin_e_mg: null,
      vitamin_k_mcg: null, vitamin_b1_mg: null, vitamin_b2_mg: null, vitamin_b3_mg: null,
      vitamin_b6_mg: null, vitamin_b12_mcg: null, folate_mcg: null,
      calcium_mg: null, iron_mg: null, magnesium_mg: null, zinc_mg: null,
      potassium_mg: null, sodium_mg: null, phosphorus_mg: null,
      is_custom: false,
      created_by: null,
    }
  } catch {
    return null
  }
}

// Cache food item to Supabase
export async function cacheFoodItem(food: FoodItem): Promise<string> {
  const { data, error } = await supabase
    .from('food_items')
    .upsert({
      name: food.name, brand: food.brand, barcode: food.barcode,
      calories_per_100g: food.calories_per_100g,
      protein_per_100g: food.protein_per_100g,
      carbs_per_100g: food.carbs_per_100g,
      fat_per_100g: food.fat_per_100g,
      fiber_per_100g: food.fiber_per_100g,
      vitamin_a_mcg: food.vitamin_a_mcg,
      vitamin_c_mg: food.vitamin_c_mg,
      vitamin_d_mcg: food.vitamin_d_mcg,
      vitamin_e_mg: food.vitamin_e_mg,
      vitamin_k_mcg: food.vitamin_k_mcg,
      vitamin_b1_mg: food.vitamin_b1_mg,
      vitamin_b2_mg: food.vitamin_b2_mg,
      vitamin_b3_mg: food.vitamin_b3_mg,
      vitamin_b6_mg: food.vitamin_b6_mg,
      vitamin_b12_mcg: food.vitamin_b12_mcg,
      folate_mcg: food.folate_mcg,
      calcium_mg: food.calcium_mg,
      iron_mg: food.iron_mg,
      magnesium_mg: food.magnesium_mg,
      zinc_mg: food.zinc_mg,
      potassium_mg: food.potassium_mg,
      sodium_mg: food.sodium_mg,
      phosphorus_mg: food.phosphorus_mg,
      is_custom: false, created_by: null,
    }, { onConflict: 'barcode' })
    .select('id')
    .single()
  if (error || !data) throw error
  return data.id
}

export function useDailyMeals(date: string) {
  const { user } = useAuth()
  const [meals, setMeals] = useState<(Meal & { items: MealItem[] })[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMeals = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('meals')
      .select('*, items:meal_items(*, food_item:food_items(*))')
      .eq('user_id', user.id)
      .eq('date', date)
      .order('created_at')
    setMeals((data as any) ?? [])
    setLoading(false)
  }, [user, date])

  useEffect(() => { fetchMeals() }, [fetchMeals])

  const addMealItem = async (mealType: MealType, foodItem: FoodItem, amount_g: number) => {
    if (!user) return
    let meal = meals.find(m => m.meal_type === mealType)
    if (!meal) {
      const { data } = await supabase
        .from('meals')
        .insert({ user_id: user.id, date, meal_type: mealType })
        .select()
        .single()
      if (!data) return
      meal = { ...data, items: [] }
    }

    let foodId = foodItem.id
    if (!foodItem.is_custom) {
      // Enrich with USDA micronutrients if not already present
      let enriched = { ...foodItem }
      const hasMicros = foodItem.vitamin_c_mg != null || foodItem.calcium_mg != null
      if (!hasMicros) {
        const micros = await fetchUSDAMicronutrients(foodItem.name)
        enriched = { ...enriched, ...micros }
      }
      if (enriched.barcode) {
        try { foodId = await cacheFoodItem(enriched) } catch { return }
      } else {
        // No barcode — upsert by name+brand
        const { data: existing } = await supabase
          .from('food_items')
          .select('id')
          .eq('name', enriched.name)
          .is('barcode', null)
          .maybeSingle()
        if (existing) {
          foodId = existing.id
        } else {
          const { data: inserted } = await supabase
            .from('food_items')
            .insert({ ...enriched, id: undefined })
            .select('id')
            .single()
          if (inserted) foodId = inserted.id
        }
      }
    }

    await supabase
      .from('meal_items')
      .insert({ meal_id: meal!.id, food_item_id: foodId, amount_g })

    await fetchMeals()
  }

  const removeMealItem = async (itemId: string) => {
    await supabase.from('meal_items').delete().eq('id', itemId)
    await fetchMeals()
  }

  const dailyMacros = meals.reduce<DailyMacros>(
    (acc, meal) => {
      meal.items.forEach(item => {
        if (!item.food_item) return
        const m = calcMacros(item.food_item, item.amount_g)
        acc.calories += m.calories
        acc.protein += m.protein
        acc.carbs += m.carbs
        acc.fat += m.fat
      })
      return acc
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const dailyMicros = meals.reduce<DailyMicros>(
    (acc, meal) => {
      meal.items.forEach(item => {
        if (!item.food_item) return
        const m = calcMicros(item.food_item, item.amount_g)
        for (const k of Object.keys(acc) as (keyof DailyMicros)[]) {
          acc[k] = Math.round((acc[k] + m[k]) * 100) / 100
        }
      })
      return acc
    },
    { ...EMPTY_MICROS }
  )

  return { meals, loading, addMealItem, removeMealItem, dailyMacros, dailyMicros, refetch: fetchMeals }
}
