import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { FoodItem, Meal, MealItem, MealType, DailyMacros } from '../types/nutrition'
import { calcMacros } from '../types/nutrition'

// Vyhledávání potravin v Open Food Facts API
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
        is_custom: false,
        created_by: null,
      }))
  } catch {
    return []
  }
}

// Vyhledání potraviny podle čárového kódu
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
      is_custom: false,
      created_by: null,
    }
  } catch {
    return null
  }
}

// Cache potraviny do Supabase (pro offline použití)
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
    // Najdi nebo vytvoř meal pro daný typ
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

    // Ulož potravinu do cache pokud má barcode
    let foodId = foodItem.id
    if (!foodItem.is_custom && foodItem.barcode) {
      try { foodId = await cacheFoodItem(foodItem) } catch { return }
    }

    const { data: item } = await supabase
      .from('meal_items')
      .insert({ meal_id: meal!.id, food_item_id: foodId, amount_g })
      .select('*, food_item:food_items(*)')
      .single()

    if (item) await fetchMeals()
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

  return { meals, loading, addMealItem, removeMealItem, dailyMacros, refetch: fetchMeals }
}
