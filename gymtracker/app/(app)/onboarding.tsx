import { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useProfile } from '../../src/hooks/useProfile'
import { useWeightLogs } from '../../src/hooks/useProgress'
import {
  calcBMR, calcTDEE, calcSuggestedMacros, calcBMI, bmiCategory, inferGoal,
  PROTEIN_PER_KG, FAT_PCT,
  JOB_ACTIVITY_LABELS, TRAINING_TYPE_LABELS,
} from '../../src/lib/bmr'
import type { JobActivity, TrainingType, Gender, Goal } from '../../src/lib/bmr'

const STEPS = 5
const DURATION_OPTIONS = [
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 },
  { label: '90+ min', value: 90 },
]

export default function OnboardingScreen() {
  const router = useRouter()
  const { updateProfile } = useProfile()
  const { addLog: addWeightLog } = useWeightLogs()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  // Step 1: gender
  const [gender, setGender] = useState<Gender | null>(null)

  // Step 2: basic stats
  const [fullName, setFullName] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [targetWeight, setTargetWeight] = useState('')

  // Step 3: job activity
  const [jobActivity, setJobActivity] = useState<JobActivity | null>(null)

  // Step 4: training
  const [trainingDays, setTrainingDays] = useState(3)
  const [trainingDuration, setTrainingDuration] = useState(60)
  const [trainingTypes, setTrainingTypes] = useState<TrainingType[]>(['strength'])

  // Derived calculations (shown in step 5)
  const getCalcs = () => {
    const w = parseFloat(weight)
    const h = parseFloat(height)
    const by = parseInt(birthYear)
    if (!gender || !w || !h || !by || !jobActivity) return null
    const bmr = calcBMR(w, h, by, gender)
    const tdee = calcTDEE({
      bmr, jobActivity, trainingDaysPerWeek: trainingDays,
      trainingAvgDurationMin: trainingDuration,
      trainingTypes, weight_kg: w,
    })
    const tw = parseFloat(targetWeight)
    const goal = inferGoal(w, isNaN(tw) ? null : tw)
    const macros = calcSuggestedMacros(tdee, w, goal)
    const bmi = calcBMI(w, h)
    const bmiCat = bmiCategory(bmi)
    return { bmr, tdee, macros, bmi, bmiCat, goal }
  }

  const [calorieGoalOverride, setCalorieGoalOverride] = useState<string | null>(null)

  const finalCalorieGoal = () => {
    const c = getCalcs()
    if (!c) return 2000
    return calorieGoalOverride ? parseInt(calorieGoalOverride) : c.tdee
  }

  const canProceed = () => {
    if (step === 1) return gender !== null
    if (step === 2) return fullName.trim() !== '' && birthYear !== '' && height !== '' && weight !== ''
    if (step === 3) return jobActivity !== null
    if (step === 4) return true
    return true
  }

  const handleFinish = async () => {
    setSaving(true)
    const w = parseFloat(weight)
    const calGoal = finalCalorieGoal()
    const c = getCalcs()
    const macros = c ? calcSuggestedMacros(calGoal, w, c.goal) : { protein_g: 140, carbs_g: 200, fat_g: 60 }

    const { error } = await updateProfile({
      full_name: fullName.trim() || null,
      gender: gender!,
      birth_year: parseInt(birthYear),
      height_cm: parseFloat(height),
      current_weight_kg: w,
      target_weight_kg: targetWeight ? parseFloat(targetWeight) : null,
      job_activity: jobActivity!,
      training_days_per_week: trainingDays,
      training_avg_duration_min: trainingDuration,
      training_types: trainingTypes,
      calorie_goal: calGoal,
      protein_goal_g: macros.protein_g,
      carbs_goal_g: macros.carbs_g,
      fat_goal_g: macros.fat_g,
      onboarding_done: true,
    })

    if (error) {
      setSaving(false)
      Alert.alert('Nepodařilo se uložit profil', error.message ?? 'Zkus to znovu nebo zkontroluj připojení.')
      return
    }

    // Save initial weight log
    if (w) {
      await addWeightLog(w, new Date().toISOString().split('T')[0])
    }

    setSaving(false)
    router.replace('/(app)')
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Step indicator */}
        <View style={styles.stepRow}>
          {Array.from({ length: STEPS }, (_, i) => (
            <View key={i} style={[styles.stepDot, i + 1 <= step && styles.stepDotActive]} />
          ))}
        </View>

        {step === 1 && <Step1Gender gender={gender} setGender={setGender} />}
        {step === 2 && (
          <Step2Stats
            fullName={fullName} setFullName={setFullName}
            birthYear={birthYear} setBirthYear={setBirthYear}
            height={height} setHeight={setHeight}
            weight={weight} setWeight={setWeight}
            targetWeight={targetWeight} setTargetWeight={setTargetWeight}
          />
        )}
        {step === 3 && <Step3Job jobActivity={jobActivity} setJobActivity={setJobActivity} />}
        {step === 4 && (
          <Step4Training
            trainingDays={trainingDays} setTrainingDays={setTrainingDays}
            trainingDuration={trainingDuration} setTrainingDuration={setTrainingDuration}
            trainingTypes={trainingTypes} setTrainingTypes={setTrainingTypes}
          />
        )}
        {step === 5 && (
          <Step5Metabolism
            calcs={getCalcs()}
            weight={parseFloat(weight)}
            calorieGoalOverride={calorieGoalOverride}
            setCalorieGoalOverride={setCalorieGoalOverride}
          />
        )}

        {/* Navigation buttons */}
        <View style={styles.navRow}>
          {step > 1 && (
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(s => s - 1)}>
              <Text style={styles.backBtnText}>← Zpět</Text>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }} />
          {step < STEPS ? (
            <TouchableOpacity
              style={[styles.nextBtn, !canProceed() && styles.nextBtnDisabled]}
              onPress={() => setStep(s => s + 1)}
              disabled={!canProceed()}
            >
              <Text style={styles.nextBtnText}>Pokračovat →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.finishBtn} onPress={handleFinish} disabled={saving}>
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.finishBtnText}>Začít používat aplikaci 🚀</Text>
              }
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

// ─── Step 1: Gender ───────────────────────────────────────────────────────────

function Step1Gender({ gender, setGender }: { gender: Gender | null; setGender: (g: Gender) => void }) {
  return (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>Kdo jsi?</Text>
      <Text style={styles.stepSubtitle}>Pohlaví ovlivní výpočet BMR a dostupné funkce aplikace.</Text>
      <View style={styles.genderRow}>
        {([['female', '👩', 'Žena'], ['male', '👨', 'Muž']] as [Gender, string, string][]).map(([g, emoji, label]) => (
          <TouchableOpacity
            key={g}
            style={[styles.genderCard, gender === g && styles.genderCardActive]}
            onPress={() => setGender(g)}
          >
            <Text style={styles.genderEmoji}>{emoji}</Text>
            <Text style={[styles.genderLabel, gender === g && styles.genderLabelActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

// ─── Step 2: Basic stats ──────────────────────────────────────────────────────

function Step2Stats(p: {
  fullName: string; setFullName: (v: string) => void
  birthYear: string; setBirthYear: (v: string) => void
  height: string; setHeight: (v: string) => void
  weight: string; setWeight: (v: string) => void
  targetWeight: string; setTargetWeight: (v: string) => void
}) {
  const w = parseFloat(p.weight)
  const h = parseFloat(p.height)
  const bmi = w && h ? calcBMI(w, h) : null
  const bmiCat = bmi ? bmiCategory(bmi) : null

  return (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>Základní údaje</Text>
      <Text style={styles.stepSubtitle}>Potřebujeme tyto informace pro výpočet tvého metabolismu.</Text>

      <Text style={styles.inputLabel}>Jméno</Text>
      <TextInput style={styles.input} value={p.fullName} onChangeText={p.setFullName} placeholder="Tvoje jméno" />

      <Text style={styles.inputLabel}>Rok narození</Text>
      <TextInput style={styles.input} value={p.birthYear} onChangeText={p.setBirthYear} keyboardType="numeric" placeholder="Např. 1995" />

      <View style={styles.twoCol}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.inputLabel}>Výška (cm)</Text>
          <TextInput style={styles.input} value={p.height} onChangeText={p.setHeight} keyboardType="decimal-pad" placeholder="170" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.inputLabel}>Aktuální váha (kg)</Text>
          <TextInput style={styles.input} value={p.weight} onChangeText={p.setWeight} keyboardType="decimal-pad" placeholder="70" />
        </View>
      </View>

      {bmi && bmiCat && (
        <>
          <View style={[styles.bmiChip, { backgroundColor: bmiCat.color + '20', borderColor: bmiCat.color }]}>
            <Text style={[styles.bmiText, { color: bmiCat.color }]}>
              BMI: {bmi} — {bmiCat.label}
            </Text>
          </View>
          <Text style={styles.bmiDisclaimer}>
            ⓘ BMI nezohledňuje složení těla — svalová hmota váží víc než tuk, takže silově trénující lidé často vyjdou jako „nadváha", aniž by měli problém. Bere to jen jako orientační populační číslo. Lepší signál o tvém těle dávají tělesné míry (pas, boky), trend hmotnosti a jak se cítíš ve výkonu. Vše najdeš v záložce Progress.
          </Text>
        </>
      )}

      <Text style={styles.inputLabel}>Cílová váha (kg) — volitelné</Text>
      <TextInput style={styles.input} value={p.targetWeight} onChangeText={p.setTargetWeight} keyboardType="decimal-pad" placeholder="65" />
    </View>
  )
}

// ─── Step 3: Job activity ─────────────────────────────────────────────────────

function Step3Job({ jobActivity, setJobActivity }: { jobActivity: JobActivity | null; setJobActivity: (j: JobActivity) => void }) {
  return (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>Aktivita v práci</Text>
      <Text style={styles.stepSubtitle}>Jak vypadá tvůj průměrný pracovní den? Ovlivní to výpočet denního výdeje energie.</Text>
      {(Object.keys(JOB_ACTIVITY_LABELS) as JobActivity[]).map(key => {
        const { emoji, label, desc } = JOB_ACTIVITY_LABELS[key]
        const active = jobActivity === key
        return (
          <TouchableOpacity
            key={key}
            style={[styles.optionCard, active && styles.optionCardActive]}
            onPress={() => setJobActivity(key)}
          >
            <Text style={styles.optionEmoji}>{emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{label}</Text>
              <Text style={styles.optionDesc}>{desc}</Text>
            </View>
            <View style={[styles.radio, active && styles.radioActive]} />
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

// ─── Step 4: Training ─────────────────────────────────────────────────────────

function Step4Training(p: {
  trainingDays: number; setTrainingDays: (v: number) => void
  trainingDuration: number; setTrainingDuration: (v: number) => void
  trainingTypes: TrainingType[]; setTrainingTypes: (v: TrainingType[]) => void
}) {
  const toggleType = (t: TrainingType) => {
    p.setTrainingTypes(
      p.trainingTypes.includes(t)
        ? p.trainingTypes.filter(x => x !== t)
        : [...p.trainingTypes, t]
    )
  }

  return (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>Trénink</Text>
      <Text style={styles.stepSubtitle}>Jak vypadají tvoje tréninky? Dopočteme energetický výdej ze sportu.</Text>

      <Text style={styles.inputLabel}>Kolik dní v týdnu trénuješ?</Text>
      <View style={styles.stepperRow}>
        <TouchableOpacity style={styles.stepperBtn} onPress={() => p.setTrainingDays(Math.max(0, p.trainingDays - 1))}>
          <Text style={styles.stepperBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.stepperValue}>{p.trainingDays}</Text>
        <TouchableOpacity style={styles.stepperBtn} onPress={() => p.setTrainingDays(Math.min(7, p.trainingDays + 1))}>
          <Text style={styles.stepperBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.inputLabel}>Průměrná délka tréninku</Text>
      <View style={styles.chipRow}>
        {DURATION_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.chip, p.trainingDuration === opt.value && styles.chipActive]}
            onPress={() => p.setTrainingDuration(opt.value)}
          >
            <Text style={[styles.chipText, p.trainingDuration === opt.value && styles.chipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.inputLabel}>Typ tréninku (vyber vše co platí)</Text>
      <View style={styles.chipRow}>
        {(Object.keys(TRAINING_TYPE_LABELS) as TrainingType[]).map(key => {
          const { emoji, label } = TRAINING_TYPE_LABELS[key]
          const active = p.trainingTypes.includes(key)
          return (
            <TouchableOpacity
              key={key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => toggleType(key)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{emoji} {label}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

// ─── Step 5: Metabolism summary ───────────────────────────────────────────────

const GOAL_LABEL: Record<Goal, string> = {
  cut: 'Hubnutí',
  maintenance: 'Udržování',
  bulk: 'Nabírání',
}

function Step5Metabolism(p: {
  calcs: { bmr: number; tdee: number; macros: { protein_g: number; carbs_g: number; fat_g: number }; bmi: number; bmiCat: { label: string; color: string }; goal: Goal } | null
  weight: number
  calorieGoalOverride: string | null
  setCalorieGoalOverride: (v: string | null) => void
}) {
  const { calcs, calorieGoalOverride, setCalorieGoalOverride } = p
  if (!calcs) {
    return (
      <View style={styles.step}>
        <Text style={styles.stepTitle}>Chybí údaje</Text>
        <Text style={styles.stepSubtitle}>Vrať se zpět a vyplň výšku, váhu a rok narození.</Text>
      </View>
    )
  }

  const displayGoal = calorieGoalOverride ?? String(calcs.tdee)
  const goalNum = parseInt(displayGoal) || calcs.tdee
  const macros = calcSuggestedMacros(goalNum, p.weight, calcs.goal)
  const proteinPerKg = PROTEIN_PER_KG[calcs.goal]
  const fatPct = Math.round(FAT_PCT[calcs.goal] * 100)
  const belowBMR = goalNum < calcs.bmr

  return (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>Tvůj metabolismus</Text>
      <Text style={styles.stepSubtitle}>Výpočet je orientační. Cílový příjem můžeš kdykoliv upravit v profilu.</Text>

      <View style={styles.metaCard}>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaNum}>{calcs.bmr}</Text>
            <Text style={styles.metaLabel}>BMR{'\n'}(klidový výdej)</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Text style={[styles.metaNum, { color: '#2563eb' }]}>{calcs.tdee}</Text>
            <Text style={styles.metaLabel}>TDEE{'\n'}(průměrný denní výdej)</Text>
          </View>
        </View>
        <Text style={styles.metaNote}>
          BMR = základní výdej v klidu (Mifflin-St Jeor).{'\n'}
          TDEE = průměrný celkový výdej včetně aktivity a tréninků. Hodnotí se na vícedenní bázi, ne den po dni — jednotlivé dny můžou být nad i pod.
        </Text>
      </View>

      <View style={styles.goalChipRow}>
        <Text style={styles.goalChipLabel}>Cíl podle váhy:</Text>
        <View style={styles.goalChip}>
          <Text style={styles.goalChipText}>{GOAL_LABEL[calcs.goal]}</Text>
        </View>
      </View>

      <Text style={styles.inputLabel}>Denní kalorický cíl (kcal)</Text>
      <TextInput
        style={[styles.input, styles.calorieInput]}
        value={displayGoal}
        onChangeText={v => setCalorieGoalOverride(v)}
        keyboardType="numeric"
      />
      <Text style={styles.calorieHint}>
        Hubnutí → −200 až −500 kcal pod TDEE. Nedoporučuje se klesat pod BMR ({calcs.bmr} kcal).{'\n'}
        Nabírání hmotnosti (vyšší číslo na váze) → mírný surplus +100 až +300 kcal nad TDEE je obvykle potřeba.{'\n'}
        Nabírání svalu → surplus podmínkou není. Sval roste i v maintenance, často i v mírném deficitu (recomp) — zvlášť u začátečníků, návratu po pauze, nebo při vyšším procentu tuku. Surplus dává jen rychlejší tempo a lepší poměr svalu k tuku.
      </Text>
      {belowBMR && (
        <View style={styles.warnCard}>
          <Text style={styles.warnText}>
            ⚠️ Cíl ({goalNum} kcal) je pod tvým BMR ({calcs.bmr} kcal). Dlouhodobě nedoporučeno — riziko ztráty svalové hmoty, hormonálních problémů a metabolické adaptace.
          </Text>
        </View>
      )}

      <Text style={[styles.inputLabel, { marginTop: 16 }]}>Navrhované makro rozdělení</Text>
      <View style={styles.macroCards}>
        <MacroResult label="Bílkoviny" value={macros.protein_g} color="#3b82f6" hint={`${proteinPerKg} g/kg`} />
        <MacroResult label="Sacharidy" value={macros.carbs_g} color="#f59e0b" hint="zbytek" />
        <MacroResult label="Tuky" value={macros.fat_g} color="#ef4444" hint={`${fatPct} % kcal`} />
      </View>

      <View style={styles.sourceCard}>
        <Text style={styles.sourceTitle}>Odkud čísla pocházejí</Text>
        <Text style={styles.sourceText}>
          • <Text style={styles.sourceBold}>Bílkoviny {proteinPerKg} g/kg</Text> — v rámci doporučení ISSN (1,6–2,2 g/kg pro aktivně cvičící). Vyšší na cutu pro udržení svaloviny, nižší na bulku, aby zbylo na sacharidy.{'\n'}
          • <Text style={styles.sourceBold}>Tuky {fatPct} % kcal</Text> — obecné doporučení (~20–35 % dle WHO/AMDR), {fatPct} % bereme jako rozumný střed, který pokrývá minimum pro hormonální zdraví (Helms et al.). Pokud ti vyhovuje jiný styl (lowcarb, keto, lowfat), uprav si to v profilu.{'\n'}
          • <Text style={styles.sourceBold}>Sacharidy zbytek</Text> — dopočítané jako zbytek kalorického cíle po bílkovinách a tucích. Pro většinu lidí hlavní zdroj energie; konkrétní množství závisí na úrovni aktivity a osobních preferencích.
        </Text>
      </View>

      <View style={styles.disclaimerCard}>
        <Text style={styles.disclaimerText}>
          Hodnoty vycházejí z aktuálních vědeckých poznatků (Mifflin-St Jeor pro BMR, doporučení ISSN pro bílkoviny). Věda se vyvíjí — za pár let mohou být doporučení jiná. Toto jsou orientační hodnoty, ne závazné instrukce. Vše můžeš v profilu doupravit.
        </Text>
      </View>
    </View>
  )
}

function MacroResult({ label, value, color, hint }: { label: string; value: number; color: string; hint: string }) {
  return (
    <View style={[styles.macroCard, { borderTopColor: color }]}>
      <Text style={[styles.macroCardNum, { color }]}>{value}g</Text>
      <Text style={styles.macroCardLabel}>{label}</Text>
      <Text style={styles.macroCardHint}>{hint}</Text>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 24 },
  stepRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', paddingTop: 40, marginBottom: 32 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#e2e8f0' },
  stepDotActive: { backgroundColor: '#2563eb', width: 24 },
  step: { marginBottom: 24 },
  stepTitle: { fontSize: 26, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 },
  stepSubtitle: { fontSize: 14, color: '#888', lineHeight: 20, marginBottom: 24 },

  genderRow: { flexDirection: 'row', gap: 16 },
  genderCard: {
    flex: 1, alignItems: 'center', padding: 24, borderRadius: 16,
    borderWidth: 2, borderColor: '#e2e8f0', backgroundColor: '#f8f9fa',
  },
  genderCardActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  genderEmoji: { fontSize: 48, marginBottom: 10 },
  genderLabel: { fontSize: 18, fontWeight: '600', color: '#555' },
  genderLabelActive: { color: '#2563eb' },

  inputLabel: { fontSize: 13, color: '#666', marginBottom: 6, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 14, fontSize: 16, marginBottom: 14, backgroundColor: '#fafafa' },
  twoCol: { flexDirection: 'row' },
  bmiChip: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 6, alignItems: 'center' },
  bmiText: { fontSize: 14, fontWeight: '600' },
  bmiDisclaimer: { fontSize: 11, color: '#64748b', lineHeight: 16, marginBottom: 14, paddingHorizontal: 2 },

  optionCard: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12,
    borderWidth: 2, borderColor: '#e2e8f0', backgroundColor: '#fafafa', marginBottom: 10,
  },
  optionCardActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  optionEmoji: { fontSize: 28, marginRight: 14 },
  optionLabel: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 2 },
  optionLabelActive: { color: '#2563eb' },
  optionDesc: { fontSize: 12, color: '#888' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#ddd' },
  radioActive: { borderColor: '#2563eb', backgroundColor: '#2563eb' },

  stepperRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  stepperBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f0f4ff', alignItems: 'center', justifyContent: 'center' },
  stepperBtnText: { fontSize: 24, color: '#2563eb', fontWeight: '300', lineHeight: 28 },
  stepperValue: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a', marginHorizontal: 24, minWidth: 60, textAlign: 'center' },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#e2e8f0', backgroundColor: '#fafafa' },
  chipActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  chipText: { fontSize: 13, color: '#555', fontWeight: '500' },
  chipTextActive: { color: '#2563eb', fontWeight: '700' },

  metaCard: { backgroundColor: '#f0f4ff', borderRadius: 16, padding: 20, marginBottom: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaItem: { flex: 1, alignItems: 'center' },
  metaNum: { fontSize: 32, fontWeight: 'bold', color: '#1a1a1a' },
  metaLabel: { fontSize: 11, color: '#888', textAlign: 'center', marginTop: 4, lineHeight: 16 },
  metaDivider: { width: 1, height: 60, backgroundColor: '#c7d7f0', marginHorizontal: 16 },
  metaNote: { fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 14, lineHeight: 16 },
  calorieInput: { fontSize: 24, fontWeight: 'bold', color: '#2563eb', textAlign: 'center', backgroundColor: '#eff6ff', borderColor: '#2563eb' },
  calorieHint: { color: '#888', fontSize: 12, textAlign: 'center', lineHeight: 18, marginBottom: 8 },
  macroCards: { flexDirection: 'row', gap: 8 },
  macroCard: { flex: 1, backgroundColor: '#f8f9fa', borderRadius: 12, padding: 12, alignItems: 'center', borderTopWidth: 3 },
  macroCardNum: { fontSize: 22, fontWeight: 'bold' },
  macroCardLabel: { fontSize: 12, color: '#555', marginTop: 2 },
  macroCardHint: { fontSize: 10, color: '#aaa', marginTop: 2 },

  goalChipRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8 },
  goalChipLabel: { fontSize: 13, color: '#666', fontWeight: '500' },
  goalChip: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 14, backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#2563eb' },
  goalChipText: { fontSize: 13, color: '#2563eb', fontWeight: '700' },
  warnCard: { backgroundColor: '#fef3c7', borderColor: '#f59e0b', borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 8 },
  warnText: { fontSize: 12, color: '#92400e', lineHeight: 18 },
  sourceCard: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 14, marginTop: 14, borderLeftWidth: 3, borderLeftColor: '#64748b' },
  sourceTitle: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 6 },
  sourceText: { fontSize: 12, color: '#475569', lineHeight: 18 },
  sourceBold: { fontWeight: '700', color: '#1e293b' },
  disclaimerCard: { backgroundColor: '#f1f5f9', borderRadius: 10, padding: 12, marginTop: 12 },
  disclaimerText: { fontSize: 11, color: '#64748b', lineHeight: 16, fontStyle: 'italic' },
  navRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingBottom: 24 },
  backBtn: { padding: 14 },
  backBtnText: { color: '#888', fontSize: 15 },
  nextBtn: { backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 28 },
  nextBtnDisabled: { backgroundColor: '#94a3b8' },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  finishBtn: { backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20 },
  finishBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
