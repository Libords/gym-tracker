import { useEffect } from 'react'
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useAuth } from '../../src/context/AuthContext'
import { useProfile } from '../../src/hooks/useProfile'
import { useWorkouts } from '../../src/hooks/useWorkouts'
import { useDailyMeals } from '../../src/hooks/useNutrition'
import { useWeightLogs } from '../../src/hooks/useProgress'
import { useCycleLogs } from '../../src/hooks/useCycle'
import { PHASE_DATA } from '../../src/types/cycle'

const DAYS_CS = ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota']
const MONTHS_CS = ['ledna', 'února', 'března', 'dubna', 'května', 'června',
  'července', 'srpna', 'září', 'října', 'listopadu', 'prosince']

function greeting(name: string | null): string {
  const h = new Date().getHours()
  const base = h < 12 ? 'Dobré ráno' : h < 18 ? 'Dobré odpoledne' : 'Dobrý večer'
  return name ? `${base}, ${name.split(' ')[0]}! 👋` : `${base}! 👋`
}

function formatDuration(started: string, finished: string | null): string {
  if (!finished) return 'Probíhá'
  const mins = Math.round((new Date(finished).getTime() - new Date(started).getTime()) / 60000)
  if (mins < 60) return `${mins} min`
  return `${Math.floor(mins / 60)}h ${mins % 60}min`
}

export default function Dashboard() {
  const router = useRouter()
  const { signOut } = useAuth()
  const { profile, loading: pLoading } = useProfile()
  const { workouts, loading: wLoading } = useWorkouts()
  const today = new Date().toISOString().split('T')[0]
  const { dailyMacros, loading: nLoading } = useDailyMeals(today)
  const { logs: weightLogs, loading: wgLoading } = useWeightLogs()
  // Cycle chip is shown only for women who opted into tracking (men no longer track partner cycle locally)
  const showCycle = profile?.gender === 'female' && profile?.cycle_tracking_enabled === true
  const { cycleInfo } = useCycleLogs('personal')

  // Redirect to onboarding if profile is missing or onboarding not done
  useEffect(() => {
    if (pLoading) return
    if (!profile || !profile.onboarding_done) {
      router.replace('/(app)/onboarding')
    }
  }, [pLoading, profile])

  const now = new Date()
  const dateStr = `${DAYS_CS[now.getDay()]}, ${now.getDate()}. ${MONTHS_CS[now.getMonth()]} ${now.getFullYear()}`

  const recentWorkouts = workouts.slice(0, 3)
  const lastWeight = weightLogs[0] ?? null
  const prevWeight = weightLogs[1] ?? null
  const weightDiff = lastWeight && prevWeight
    ? (Number(lastWeight.weight_kg) - Number(prevWeight.weight_kg))
    : null

  const calorieGoal = profile?.calorie_goal ?? 2000
  const caloriePct = Math.min(dailyMacros.calories / calorieGoal, 1)

  // Show blank screen while loading or while redirecting to onboarding (avoids flash)
  if (pLoading || !profile || !profile.onboarding_done) {
    return <View style={{ flex: 1, backgroundColor: '#fff' }} />
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }}>
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting(profile?.full_name ?? null)}</Text>
          <Text style={styles.dateStr}>{dateStr}</Text>
        </View>
        <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
          <Text style={styles.signOutText}>Odhlásit</Text>
        </TouchableOpacity>
      </View>

      {/* Cycle phase chip — only when tracking is opted in */}
      {showCycle && cycleInfo && (() => {
        const pd = PHASE_DATA[cycleInfo.phase]
        return (
          <TouchableOpacity
            style={[styles.cycleChip, { backgroundColor: pd.colorLight, borderColor: pd.color }]}
            onPress={() => router.push('/(app)/progress')}
          >
            <Text style={[styles.cycleChipText, { color: pd.color }]}>
              {pd.emoji} {pd.name} — den {cycleInfo.dayInCycle}  •  {pd.trainingLabel}  •  {cycleInfo.daysUntilNextPeriod} dní do menstruace
            </Text>
          </TouchableOpacity>
        )
      })()}

      {/* Nutrition card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🍽️ Dnešní příjem</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/nutrition')}>
            <Text style={styles.cardLink}>Zobrazit →</Text>
          </TouchableOpacity>
        </View>

        {nLoading ? <ActivityIndicator /> : (
          <>
            <View style={styles.calorieRow}>
              <Text style={styles.calorieNum}>{Math.round(dailyMacros.calories)}</Text>
              <Text style={styles.calorieUnit}>kcal</Text>
              <Text style={styles.calorieGoal}> / {calorieGoal.toLocaleString('cs-CZ')}</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, {
                width: `${caloriePct * 100}%` as any,
                backgroundColor: caloriePct > 1 ? '#ef4444' : '#2563eb',
              }]} />
            </View>
            <View style={styles.macroRow}>
              <MacroChip label="Bílkoviny" value={dailyMacros.protein} unit="g" color="#3b82f6" />
              <MacroChip label="Sacharidy" value={dailyMacros.carbs} unit="g" color="#f59e0b" />
              <MacroChip label="Tuky" value={dailyMacros.fat} unit="g" color="#ef4444" />
            </View>
          </>
        )}

        <TouchableOpacity
          style={styles.quickBtn}
          onPress={() => router.push('/(app)/nutrition')}
        >
          <Text style={styles.quickBtnText}>+ Přidat jídlo</Text>
        </TouchableOpacity>
      </View>

      {/* Weight card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>⚖️ Aktuální váha</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/progress')}>
            <Text style={styles.cardLink}>Zobrazit →</Text>
          </TouchableOpacity>
        </View>

        {wgLoading ? <ActivityIndicator /> : lastWeight ? (
          <View style={styles.weightRow}>
            <Text style={styles.weightNum}>{lastWeight.weight_kg}</Text>
            <Text style={styles.weightUnit}>kg</Text>
            {weightDiff !== null && (
              <View style={[styles.weightDiff, {
                backgroundColor: weightDiff < 0 ? '#f0fdf4' : weightDiff > 0 ? '#fef2f2' : '#f8f9fa',
              }]}>
                <Text style={[styles.weightDiffText, {
                  color: weightDiff < 0 ? '#16a34a' : weightDiff > 0 ? '#dc2626' : '#888',
                }]}>
                  {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)} kg
                </Text>
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.emptyText}>Zatím žádný záznam váhy</Text>
        )}
        {lastWeight && (
          <Text style={styles.weightDate}>
            Naposledy: {new Date(lastWeight.date).toLocaleDateString('cs-CZ')}
          </Text>
        )}
      </View>

      {/* Recent workouts */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>💪 Poslední tréninky</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/workouts')}>
            <Text style={styles.cardLink}>Zobrazit vše →</Text>
          </TouchableOpacity>
        </View>

        {wLoading ? <ActivityIndicator /> : recentWorkouts.length === 0 ? (
          <Text style={styles.emptyText}>Zatím žádné tréninky</Text>
        ) : (
          recentWorkouts.map(w => (
            <TouchableOpacity
              key={w.id}
              style={styles.workoutRow}
              onPress={() => router.push(`/(app)/workouts/${w.id}`)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.workoutName}>{w.name}</Text>
                <Text style={styles.workoutMeta}>
                  {new Date(w.started_at).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long' })}
                  {w.finished_at && `  •  ${formatDuration(w.started_at, w.finished_at)}`}
                </Text>
              </View>
              <Text style={styles.workoutArrow}>›</Text>
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity
          style={[styles.quickBtn, { backgroundColor: '#f0fdf4', borderColor: '#22c55e' }]}
          onPress={() => router.push('/(app)/workouts')}
        >
          <Text style={[styles.quickBtnText, { color: '#16a34a' }]}>+ Zahájit trénink</Text>
        </TouchableOpacity>
      </View>

      {/* Tips card based on cycle phase */}
      {cycleInfo && (() => {
        const pd = PHASE_DATA[cycleInfo.phase]
        return (
          <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: pd.color }]}>
            <Text style={[styles.cardTitle, { color: pd.color, marginBottom: 6 }]}>
              {pd.emoji} Dnešní doporučení
            </Text>
            <Text style={styles.tipText}>💪 {pd.trainingTip}</Text>
            <Text style={[styles.tipText, { marginTop: 8 }]}>🥗 {pd.nutritionTip}</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/progress')}>
              <Text style={[styles.cardLink, { marginTop: 8 }]}>Zobrazit detailní doporučení →</Text>
            </TouchableOpacity>
          </View>
        )
      })()}
    </ScrollView>
    </SafeAreaView>
  )
}

function MacroChip({ label, value, unit, color }: {
  label: string; value: number; unit: string; color: string
}) {
  return (
    <View style={styles.macroChip}>
      <View style={[styles.macroChipDot, { backgroundColor: color }]} />
      <Text style={styles.macroChipLabel}>{label}</Text>
      <Text style={[styles.macroChipValue, { color }]}>{Math.round(value)}{unit}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 16 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 14 },
  greeting: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a' },
  dateStr: { fontSize: 13, color: '#888', marginTop: 2 },
  signOutBtn: { backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  signOutText: { color: '#64748b', fontSize: 12, fontWeight: '600' },

  cycleChip: { marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderRadius: 10, padding: 10 },
  cycleChipText: { fontSize: 12, fontWeight: '600', textAlign: 'center' },

  card: { marginHorizontal: 16, marginBottom: 14, backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  cardLink: { fontSize: 12, color: '#2563eb', fontWeight: '600' },

  calorieRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  calorieNum: { fontSize: 36, fontWeight: 'bold', color: '#2563eb' },
  calorieUnit: { fontSize: 14, color: '#888', marginLeft: 4 },
  calorieGoal: { fontSize: 13, color: '#bbb' },
  progressBg: { height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, marginBottom: 12 },
  progressFill: { height: 6, borderRadius: 3 },
  macroRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  macroChip: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 8, padding: 6, gap: 4 },
  macroChipDot: { width: 6, height: 6, borderRadius: 3 },
  macroChipLabel: { fontSize: 10, color: '#888', flex: 1 },
  macroChipValue: { fontSize: 11, fontWeight: '700' },

  quickBtn: { borderWidth: 1, borderColor: '#2563eb', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  quickBtnText: { color: '#2563eb', fontWeight: '700', fontSize: 14 },

  weightRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 4 },
  weightNum: { fontSize: 36, fontWeight: 'bold', color: '#1a1a1a' },
  weightUnit: { fontSize: 14, color: '#888' },
  weightDiff: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  weightDiffText: { fontSize: 13, fontWeight: '700' },
  weightDate: { color: '#aaa', fontSize: 12, marginTop: 2 },

  workoutRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  workoutName: { fontSize: 14, fontWeight: '600', color: '#222' },
  workoutMeta: { fontSize: 12, color: '#888', marginTop: 2 },
  workoutArrow: { fontSize: 20, color: '#ccc', marginLeft: 8 },

  emptyText: { color: '#bbb', fontSize: 13, textAlign: 'center', paddingVertical: 8 },
  tipText: { fontSize: 13, color: '#555', lineHeight: 19 },
})
