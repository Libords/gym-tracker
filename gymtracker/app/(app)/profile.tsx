import { useEffect, useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView, Switch,
} from 'react-native'
import { useProfile } from '../../src/hooks/useProfile'
import { useAuth } from '../../src/context/AuthContext'
import {
  calcBMR, calcTDEE, calcSuggestedMacros,
  JOB_ACTIVITY_LABELS, TRAINING_TYPE_LABELS,
} from '../../src/lib/bmr'
import type { JobActivity, TrainingType, Gender } from '../../src/lib/bmr'
import type { Unit } from '../../src/types/workout'

export default function ProfileScreen() {
  const { profile, loading, updateProfile } = useProfile()
  const { signOut } = useAuth()

  const [fullName, setFullName] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [targetWeight, setTargetWeight] = useState('')
  const [gender, setGender] = useState<Gender | null>(null)
  const [jobActivity, setJobActivity] = useState<JobActivity | null>(null)
  const [trainingDays, setTrainingDays] = useState(3)
  const [trainingDuration, setTrainingDuration] = useState(60)
  const [trainingTypes, setTrainingTypes] = useState<TrainingType[]>([])
  const [calorieGoal, setCalorieGoal] = useState('')
  const [proteinGoal, setProteinGoal] = useState('')
  const [carbsGoal, setCarbsGoal] = useState('')
  const [fatGoal, setFatGoal] = useState('')
  const [hasPartnerCycle, setHasPartnerCycle] = useState(false)
  const [defaultRestSeconds, setDefaultRestSeconds] = useState('90')
  const [preferredUnit, setPreferredUnit] = useState<Unit>('kg')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!profile) return
    setFullName(profile.full_name ?? '')
    setBirthYear(profile.birth_year?.toString() ?? '')
    setHeight(profile.height_cm?.toString() ?? '')
    setWeight(profile.current_weight_kg?.toString() ?? '')
    setTargetWeight(profile.target_weight_kg?.toString() ?? '')
    setGender(profile.gender ?? null)
    setJobActivity(profile.job_activity ?? null)
    setTrainingDays(profile.training_days_per_week ?? 3)
    setTrainingDuration(profile.training_avg_duration_min ?? 60)
    setTrainingTypes((profile.training_types ?? []) as TrainingType[])
    setCalorieGoal(profile.calorie_goal?.toString() ?? '')
    setProteinGoal(profile.protein_goal_g?.toString() ?? '')
    setCarbsGoal(profile.carbs_goal_g?.toString() ?? '')
    setFatGoal(profile.fat_goal_g?.toString() ?? '')
    setHasPartnerCycle(profile.has_partner_cycle ?? false)
    setDefaultRestSeconds(String(profile.default_rest_seconds ?? 90))
    setPreferredUnit(profile.preferred_unit ?? 'kg')
  }, [profile])

  const toggleType = (t: TrainingType) => {
    setTrainingTypes(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    )
  }

  const recalcTDEE = () => {
    const w = parseFloat(weight)
    const h = parseFloat(height)
    const by = parseInt(birthYear)
    if (!gender || !w || !h || !by || !jobActivity) return
    const bmr = calcBMR(w, h, by, gender)
    const tdee = calcTDEE({ bmr, jobActivity, trainingDaysPerWeek: trainingDays, trainingAvgDurationMin: trainingDuration, trainingTypes, weight_kg: w })
    const macros = calcSuggestedMacros(tdee, w)
    setCalorieGoal(String(tdee))
    setProteinGoal(String(macros.protein_g))
    setCarbsGoal(String(macros.carbs_g))
    setFatGoal(String(macros.fat_g))
    Alert.alert('Přepočítáno', `BMR: ${bmr} kcal\nTDEE: ${tdee} kcal`)
  }

  const handleSave = async () => {
    setSaving(true)
    const { error } = await updateProfile({
      full_name: fullName || null,
      gender: gender ?? undefined,
      birth_year: birthYear ? parseInt(birthYear) : null,
      height_cm: height ? parseFloat(height) : null,
      current_weight_kg: weight ? parseFloat(weight) : null,
      target_weight_kg: targetWeight ? parseFloat(targetWeight) : null,
      job_activity: jobActivity ?? undefined,
      training_days_per_week: trainingDays,
      training_avg_duration_min: trainingDuration,
      training_types: trainingTypes,
      calorie_goal: calorieGoal ? parseInt(calorieGoal) : null,
      protein_goal_g: proteinGoal ? parseInt(proteinGoal) : null,
      carbs_goal_g: carbsGoal ? parseInt(carbsGoal) : null,
      fat_goal_g: fatGoal ? parseInt(fatGoal) : null,
      has_partner_cycle: hasPartnerCycle,
      default_rest_seconds: clampRest(defaultRestSeconds),
      preferred_unit: preferredUnit,
    })
    setSaving(false)
    if (error) Alert.alert('Chyba', error.message)
    else Alert.alert('Uloženo ✓')
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Můj profil</Text>

      {/* Basic */}
      <SectionHeader title="Osobní údaje" />
      <Label text="Jméno" />
      <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Tvoje jméno" />

      <Label text="Pohlaví" />
      <View style={styles.row}>
        {(['female', 'male'] as Gender[]).map(g => (
          <TouchableOpacity key={g} style={[styles.chip, gender === g && styles.chipActive]} onPress={() => setGender(g)}>
            <Text style={[styles.chipText, gender === g && styles.chipTextActive]}>
              {g === 'female' ? '👩 Žena' : '👨 Muž'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.twoCol}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Label text="Rok narození" />
          <TextInput style={styles.input} value={birthYear} onChangeText={setBirthYear} keyboardType="numeric" placeholder="1995" />
        </View>
        <View style={{ flex: 1 }}>
          <Label text="Výška (cm)" />
          <TextInput style={styles.input} value={height} onChangeText={setHeight} keyboardType="decimal-pad" placeholder="170" />
        </View>
      </View>

      <View style={styles.twoCol}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Label text="Aktuální váha (kg)" />
          <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="70" />
        </View>
        <View style={{ flex: 1 }}>
          <Label text="Cílová váha (kg)" />
          <TextInput style={styles.input} value={targetWeight} onChangeText={setTargetWeight} keyboardType="decimal-pad" placeholder="65" />
        </View>
      </View>

      {/* Job activity */}
      <SectionHeader title="Aktivita v práci" />
      {(Object.keys(JOB_ACTIVITY_LABELS) as JobActivity[]).map(key => {
        const { emoji, label, desc } = JOB_ACTIVITY_LABELS[key]
        const active = jobActivity === key
        return (
          <TouchableOpacity key={key} style={[styles.optionCard, active && styles.optionCardActive]} onPress={() => setJobActivity(key)}>
            <Text style={styles.optionEmoji}>{emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.optionLabel, active && { color: '#2563eb' }]}>{label}</Text>
              <Text style={styles.optionDesc}>{desc}</Text>
            </View>
            <View style={[styles.radio, active && styles.radioActive]} />
          </TouchableOpacity>
        )
      })}

      {/* Training */}
      <SectionHeader title="Trénink" />
      <Label text="Počet tréninků týdně" />
      <View style={styles.stepperRow}>
        <TouchableOpacity style={styles.stepperBtn} onPress={() => setTrainingDays(d => Math.max(0, d - 1))}>
          <Text style={styles.stepperBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.stepperValue}>{trainingDays}×</Text>
        <TouchableOpacity style={styles.stepperBtn} onPress={() => setTrainingDays(d => Math.min(7, d + 1))}>
          <Text style={styles.stepperBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <Label text="Průměrná délka tréninku" />
      <View style={styles.row}>
        {[30, 45, 60, 90].map(v => (
          <TouchableOpacity key={v} style={[styles.chip, trainingDuration === v && styles.chipActive]} onPress={() => setTrainingDuration(v)}>
            <Text style={[styles.chipText, trainingDuration === v && styles.chipTextActive]}>{v} min</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Label text="Typ tréninku" />
      <View style={styles.row}>
        {(Object.keys(TRAINING_TYPE_LABELS) as TrainingType[]).map(key => {
          const { emoji, label } = TRAINING_TYPE_LABELS[key]
          const active = trainingTypes.includes(key)
          return (
            <TouchableOpacity key={key} style={[styles.chip, active && styles.chipActive]} onPress={() => toggleType(key)}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{emoji} {label}</Text>
            </TouchableOpacity>
          )
        })}
      </View>

      <TouchableOpacity style={styles.recalcBtn} onPress={recalcTDEE}>
        <Text style={styles.recalcBtnText}>🔄 Přepočítat BMR / TDEE</Text>
      </TouchableOpacity>

      {/* Goals */}
      <SectionHeader title="Kalorický a makro cíl" />
      <Label text="Denní kalorický cíl (kcal)" />
      <TextInput style={[styles.input, { color: '#2563eb', fontWeight: '700', fontSize: 18, textAlign: 'center' }]} value={calorieGoal} onChangeText={setCalorieGoal} keyboardType="numeric" />

      <View style={styles.twoCol}>
        <View style={{ flex: 1, marginRight: 6 }}>
          <Label text="Bílkoviny (g)" />
          <TextInput style={styles.input} value={proteinGoal} onChangeText={setProteinGoal} keyboardType="numeric" />
        </View>
        <View style={{ flex: 1, marginHorizontal: 6 }}>
          <Label text="Sacharidy (g)" />
          <TextInput style={styles.input} value={carbsGoal} onChangeText={setCarbsGoal} keyboardType="numeric" />
        </View>
        <View style={{ flex: 1, marginLeft: 6 }}>
          <Label text="Tuky (g)" />
          <TextInput style={styles.input} value={fatGoal} onChangeText={setFatGoal} keyboardType="numeric" />
        </View>
      </View>

      {/* Workout settings (Sprint I) */}
      <SectionHeader title="Nastavení tréninku" />
      <Label text="Jednotka váhy" />
      <View style={styles.row}>
        {(['kg', 'lb'] as Unit[]).map(u => (
          <TouchableOpacity key={u} style={[styles.chip, preferredUnit === u && styles.chipActive]} onPress={() => setPreferredUnit(u)}>
            <Text style={[styles.chipText, preferredUnit === u && styles.chipTextActive]}>{u.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Label text="Výchozí délka pauzy (s)" />
      <TextInput
        style={styles.input}
        value={defaultRestSeconds}
        onChangeText={setDefaultRestSeconds}
        keyboardType="numeric"
        placeholder="90"
      />

      {/* Partner cycle — only for men */}
      {gender === 'male' && (
        <>
          <SectionHeader title="Cyklus partnerky" />
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Sledovat cyklus partnerky</Text>
              <Text style={styles.switchDesc}>Zobrazí záložku v Progress pro sledování a tipy jak partnerku podpořit v každé fázi.</Text>
            </View>
            <Switch value={hasPartnerCycle} onValueChange={setHasPartnerCycle} trackColor={{ true: '#2563eb' }} />
          </View>
        </>
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Uložit profil</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
        <Text style={styles.signOutText}>Odhlásit se</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>
}

function clampRest(text: string): number {
  const n = parseInt(text, 10)
  if (Number.isNaN(n)) return 90
  return Math.min(600, Math.max(5, n))
}
function Label({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 20, backgroundColor: '#fff', paddingBottom: 80 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 16 },
  sectionHeader: { fontSize: 15, fontWeight: '700', color: '#2563eb', marginTop: 20, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 4 },
  label: { fontSize: 13, color: '#666', marginBottom: 5, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 15, backgroundColor: '#fafafa' },
  twoCol: { flexDirection: 'row' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#e2e8f0', backgroundColor: '#fafafa' },
  chipActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  chipText: { fontSize: 13, color: '#555', fontWeight: '500' },
  chipTextActive: { color: '#2563eb', fontWeight: '700' },
  optionCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#e2e8f0', backgroundColor: '#fafafa', marginBottom: 8 },
  optionCardActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  optionEmoji: { fontSize: 24, marginRight: 12 },
  optionLabel: { fontSize: 14, fontWeight: '600', color: '#333' },
  optionDesc: { fontSize: 12, color: '#888', marginTop: 1 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#ddd' },
  radioActive: { borderColor: '#2563eb', backgroundColor: '#2563eb' },
  stepperRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  stepperBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0f4ff', alignItems: 'center', justifyContent: 'center' },
  stepperBtnText: { fontSize: 22, color: '#2563eb', fontWeight: '300' },
  stepperValue: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginHorizontal: 20, minWidth: 50, textAlign: 'center' },
  recalcBtn: { borderWidth: 1, borderColor: '#2563eb', borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 16 },
  recalcBtnText: { color: '#2563eb', fontWeight: '600' },
  switchRow: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#f8f9fa', borderRadius: 12, marginBottom: 12 },
  switchLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 3 },
  switchDesc: { fontSize: 12, color: '#888', lineHeight: 17 },
  saveBtn: { backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16, marginBottom: 10 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  signOutBtn: { padding: 14, alignItems: 'center', marginBottom: 20 },
  signOutText: { color: '#94a3b8', fontSize: 14 },
})
