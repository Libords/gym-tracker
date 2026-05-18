import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useDailyMeals } from '../../../src/hooks/useNutrition'
import { MEAL_LABELS, MealType, calcMacros } from '../../../src/types/nutrition'
import { MicronutrientsCard } from '../../../src/components/MicronutrientsCard'

type Tab = 'makra' | 'mikro'

function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(value / max, 1)
  return (
    <View style={styles.macroItem}>
      <View style={styles.macroLabelRow}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroValue}>{Math.round(value)} g</Text>
      </View>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${pct * 100}%` as any, backgroundColor: color }]} />
      </View>
    </View>
  )
}

export default function NutritionScreen() {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [tab, setTab] = useState<Tab>('makra')
  const { meals, loading, removeMealItem, dailyMacros, dailyMicros } = useDailyMeals(date)

  const mealTypes: MealType[] = ['snidane', 'obed', 'vecere', 'svacina']

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <Text style={styles.title}>Jídelníček</Text>
      <Text style={styles.dateLabel}>{new Date(date).toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['makra', 'mikro'] as Tab[]).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'makra' ? '⚡ Makronutrienty' : '🔬 Mikronutrienty'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'makra' ? (
        <>
          {/* Daily macro summary */}
          <View style={styles.summaryCard}>
            <View style={styles.calorieRow}>
              <Text style={styles.calorieValue}>{Math.round(dailyMacros.calories)}</Text>
              <Text style={styles.calorieUnit}>kcal</Text>
            </View>
            <MacroBar label="Bílkoviny" value={dailyMacros.protein} max={150} color="#3b82f6" />
            <MacroBar label="Sacharidy" value={dailyMacros.carbs} max={300} color="#f59e0b" />
            <MacroBar label="Tuky" value={dailyMacros.fat} max={80} color="#ef4444" />
          </View>

          {/* Meals */}
          {mealTypes.map(mealType => {
            const meal = meals.find(m => m.meal_type === mealType)
            const items = meal?.items ?? []
            const mealCalories = items.reduce((sum, item) => {
              if (!item.food_item) return sum
              return sum + calcMacros(item.food_item, item.amount_g).calories
            }, 0)

            return (
              <View key={mealType} style={styles.mealSection}>
                <View style={styles.mealHeader}>
                  <Text style={styles.mealTitle}>{MEAL_LABELS[mealType]}</Text>
                  {mealCalories > 0 && <Text style={styles.mealCalories}>{Math.round(mealCalories)} kcal</Text>}
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => router.push(`/(app)/nutrition/add-food?mealType=${mealType}&date=${date}`)}
                  >
                    <Text style={styles.addBtnText}>+ Přidat</Text>
                  </TouchableOpacity>
                </View>

                {items.map(item => {
                  if (!item.food_item) return null
                  const macros = calcMacros(item.food_item, item.amount_g)
                  return (
                    <View key={item.id} style={styles.foodRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.foodName}>{item.food_item.name}</Text>
                        <Text style={styles.foodMeta}>
                          {item.amount_g} g  •  {macros.calories} kcal  •  B: {macros.protein}g  S: {macros.carbs}g  T: {macros.fat}g
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => removeMealItem(item.id)}>
                        <Text style={styles.deleteBtn}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  )
                })}

                {items.length === 0 && (
                  <Text style={styles.emptyMeal}>Prázdné</Text>
                )}
              </View>
            )
          })}
        </>
      ) : (
        <View style={styles.microCard}>
          <Text style={styles.microNote}>% doporučené denní dávky (DDD) za dnešní den</Text>
          <MicronutrientsCard micros={dailyMicros} />
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 2 },
  dateLabel: { color: '#888', fontSize: 14, marginBottom: 12 },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tab: { flex: 1, padding: 9, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  tabActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  tabText: { fontSize: 12, color: '#555' },
  tabTextActive: { color: '#fff', fontWeight: '600' },
  summaryCard: { backgroundColor: '#f0f4ff', borderRadius: 16, padding: 16, marginBottom: 20 },
  calorieRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
  calorieValue: { fontSize: 42, fontWeight: 'bold', color: '#2563eb' },
  calorieUnit: { fontSize: 16, color: '#888', marginLeft: 6 },
  macroItem: { marginBottom: 8 },
  macroLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  macroLabel: { fontSize: 13, color: '#555' },
  macroValue: { fontSize: 13, fontWeight: '600', color: '#333' },
  barBg: { height: 6, backgroundColor: '#e2e8f0', borderRadius: 3 },
  barFill: { height: 6, borderRadius: 3 },
  mealSection: { marginBottom: 16 },
  mealHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  mealTitle: { fontSize: 16, fontWeight: '700', flex: 1 },
  mealCalories: { color: '#888', fontSize: 13, marginRight: 8 },
  addBtn: { backgroundColor: '#2563eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  foodRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  foodName: { fontSize: 14, fontWeight: '500' },
  foodMeta: { color: '#888', fontSize: 12, marginTop: 2 },
  deleteBtn: { color: '#ccc', fontSize: 15, padding: 4 },
  emptyMeal: { color: '#bbb', fontSize: 13, fontStyle: 'italic', paddingVertical: 4 },
  microCard: { backgroundColor: '#f8f9fa', borderRadius: 16, padding: 16 },
  microNote: { color: '#888', fontSize: 12, marginBottom: 12, textAlign: 'center' },
})
