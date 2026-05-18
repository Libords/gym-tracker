import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Modal, Alert, ActivityIndicator,
} from 'react-native'
import { LineChart } from 'react-native-gifted-charts'
import { useWeightLogs, useBodyMeasurements } from '../../../src/hooks/useProgress'
import { useCycleLogs } from '../../../src/hooks/useCycle'
import { useProfile } from '../../../src/hooks/useProfile'
import type { CycleInfo, CyclePhase } from '../../../src/types/cycle'
import { PHASE_DATA, PARTNER_PERSPECTIVE, buildCycleTimeline } from '../../../src/types/cycle'

type Tab = 'vaha' | 'miry' | 'cyklus'

const TAB_LABELS: Record<Tab, string> = {
  vaha: '⚖️ Váha',
  miry: '📏 Míry',
  cyklus: '🌙 Cyklus',
}

export default function ProgressScreen() {
  const [tab, setTab] = useState<Tab>('vaha')
  const { profile } = useProfile()
  const isMale = profile?.gender === 'male'
  const hasPartnerCycle = profile?.has_partner_cycle === true

  // Tab label for cycle: women = Cyklus, men with partner = Partnerka
  const cycleTabLabel = isMale ? '💑 Partnerka' : '🌙 Cyklus'
  // Show cycle tab for women always, for men only if has_partner_cycle
  const showCycleTab = !isMale || hasPartnerCycle

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progress</Text>
      <View style={styles.tabs}>
        {(['vaha', 'miry', ...(showCycleTab ? ['cyklus'] : [])] as Tab[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'cyklus' ? cycleTabLabel : TAB_LABELS[t]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'vaha' && <WeightTab />}
      {tab === 'miry' && <MeasurementsTab />}
      {tab === 'cyklus' && <CycleTab partnerMode={isMale} />}
    </View>
  )
}

// ─── Weight tab ───────────────────────────────────────────────────────────────

function WeightTab() {
  const { logs, loading, addLog, deleteLog } = useWeightLogs()
  const [modalVisible, setModalVisible] = useState(false)
  const [weight, setWeight] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const chartData = [...logs].reverse().slice(-30).map(l => ({
    value: Number(l.weight_kg),
    label: l.date.slice(5),
  }))

  const handleAdd = async () => {
    if (!weight) return
    setSaving(true)
    await addLog(parseFloat(weight), new Date().toISOString().split('T')[0], note)
    setSaving(false)
    setModalVisible(false)
    setWeight('')
    setNote('')
  }

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
      {chartData.length >= 2 && (
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            height={180}
            width={320}
            color="#2563eb"
            thickness={2}
            hideDataPoints={chartData.length > 15}
            curved
            yAxisTextStyle={{ color: '#888', fontSize: 11 }}
            xAxisLabelTextStyle={{ color: '#888', fontSize: 10 }}
            noOfSections={4}
            rulesColor="#f0f0f0"
          />
        </View>
      )}

      {logs.length === 0 && <Text style={styles.empty}>Zatím žádné záznamy váhy.</Text>}

      {logs.map(log => (
        <View key={log.id} style={styles.logRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.logValue}>{log.weight_kg} kg</Text>
            <Text style={styles.logDate}>
              {new Date(log.date).toLocaleDateString('cs-CZ')}
              {log.note ? `  •  ${log.note}` : ''}
            </Text>
          </View>
          <TouchableOpacity onPress={() => Alert.alert('Smazat?', '', [
            { text: 'Zrušit', style: 'cancel' },
            { text: 'Smazat', style: 'destructive', onPress: () => deleteLog(log.id) },
          ])}>
            <Text style={styles.deleteBtn}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+ Zadat váhu</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Nový záznam váhy</Text>
            <TextInput style={styles.input} placeholder="Váha (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" autoFocus />
            <TextInput style={styles.input} placeholder="Poznámka (volitelně)" value={note} onChangeText={setNote} />
            <View style={styles.modalRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}><Text>Zrušit</Text></TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleAdd} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>Uložit</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

// ─── Measurements tab ─────────────────────────────────────────────────────────

function MeasurementsTab() {
  const { measurements, loading, addMeasurement, deleteMeasurement } = useBodyMeasurements()
  const [modalVisible, setModalVisible] = useState(false)
  const [saving, setSaving] = useState(false)
  const [vals, setVals] = useState({
    chest_cm: '', waist_cm: '', hips_cm: '', arm_cm: '', thigh_cm: '', neck_cm: '', note: '',
  })

  const fields: { key: keyof typeof vals; label: string }[] = [
    { key: 'chest_cm', label: 'Hrudník (cm)' },
    { key: 'waist_cm', label: 'Pas (cm)' },
    { key: 'hips_cm', label: 'Boky (cm)' },
    { key: 'arm_cm', label: 'Paže (cm)' },
    { key: 'thigh_cm', label: 'Stehno (cm)' },
    { key: 'neck_cm', label: 'Krk (cm)' },
    { key: 'note', label: 'Poznámka' },
  ]

  const handleAdd = async () => {
    setSaving(true)
    await addMeasurement({
      date: new Date().toISOString().split('T')[0],
      chest_cm: vals.chest_cm ? parseFloat(vals.chest_cm) : null,
      waist_cm: vals.waist_cm ? parseFloat(vals.waist_cm) : null,
      hips_cm: vals.hips_cm ? parseFloat(vals.hips_cm) : null,
      arm_cm: vals.arm_cm ? parseFloat(vals.arm_cm) : null,
      thigh_cm: vals.thigh_cm ? parseFloat(vals.thigh_cm) : null,
      neck_cm: vals.neck_cm ? parseFloat(vals.neck_cm) : null,
      note: vals.note || null,
    })
    setSaving(false)
    setModalVisible(false)
    setVals({ chest_cm: '', waist_cm: '', hips_cm: '', arm_cm: '', thigh_cm: '', neck_cm: '', note: '' })
  }

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
      {measurements.length === 0 && <Text style={styles.empty}>Zatím žádné záznamy měr.</Text>}
      {measurements.map(m => (
        <View key={m.id} style={styles.measureCard}>
          <View style={styles.logRow}>
            <Text style={styles.logDate}>{new Date(m.date).toLocaleDateString('cs-CZ')}</Text>
            <TouchableOpacity onPress={() => deleteMeasurement(m.id)}>
              <Text style={styles.deleteBtn}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.measureGrid}>
            {m.chest_cm && <Text style={styles.measureItem}>Hrudník: {m.chest_cm} cm</Text>}
            {m.waist_cm && <Text style={styles.measureItem}>Pas: {m.waist_cm} cm</Text>}
            {m.hips_cm && <Text style={styles.measureItem}>Boky: {m.hips_cm} cm</Text>}
            {m.arm_cm && <Text style={styles.measureItem}>Paže: {m.arm_cm} cm</Text>}
            {m.thigh_cm && <Text style={styles.measureItem}>Stehno: {m.thigh_cm} cm</Text>}
            {m.neck_cm && <Text style={styles.measureItem}>Krk: {m.neck_cm} cm</Text>}
          </View>
          {m.note && <Text style={styles.logDate}>{m.note}</Text>}
        </View>
      ))}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+ Zadat míry</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <ScrollView>
            <View style={[styles.modal, { marginTop: 60 }]}>
              <Text style={styles.modalTitle}>Tělesné míry</Text>
              {fields.map(f => (
                <TextInput
                  key={f.key}
                  style={styles.input}
                  placeholder={f.label}
                  value={vals[f.key]}
                  onChangeText={v => setVals(prev => ({ ...prev, [f.key]: v }))}
                  keyboardType={f.key === 'note' ? 'default' : 'decimal-pad'}
                />
              ))}
              <View style={styles.modalRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}><Text>Zrušit</Text></TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={handleAdd} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>Uložit</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  )
}

// ─── Cycle tab ────────────────────────────────────────────────────────────────

function CycleTab({ partnerMode = false }: { partnerMode?: boolean }) {
  const { logs, loading, addLog, deleteLog, cycleInfo, latestCycleLength, latestPeriodLength } = useCycleLogs(partnerMode ? 'partner' : 'personal')
  const [modalVisible, setModalVisible] = useState(false)
  const [saving, setSaving] = useState(false)
  const [periodDate, setPeriodDate] = useState(new Date().toISOString().split('T')[0])
  const [cycleLen, setCycleLen] = useState(String(latestCycleLength))
  const [periodLen, setPeriodLen] = useState(String(latestPeriodLength))
  const [logNote, setLogNote] = useState('')
  const [section, setSection] = useState<'training' | 'nutrition'>('training')

  const handleAdd = async () => {
    setSaving(true)
    await addLog(periodDate, parseInt(cycleLen) || 28, parseInt(periodLen) || 5, logNote || undefined)
    setSaving(false)
    setModalVisible(false)
    setLogNote('')
  }

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
      {!cycleInfo ? (
        // ── Onboarding ──
        <View style={cycleStyles.onboarding}>
          <Text style={cycleStyles.onboardingEmoji}>{partnerMode ? '💑' : '🌙'}</Text>
          <Text style={cycleStyles.onboardingTitle}>{partnerMode ? 'Cyklus partnerky' : 'Sledování cyklu'}</Text>
          <Text style={cycleStyles.onboardingText}>
            {partnerMode
              ? 'Zadej první den poslední menstruace partnerky. Aplikace ti poradí, jak ji nejlépe podpořit v každé fázi.'
              : 'Zadej první den poslední menstruace a aplikace ti bude doporučovat tréninky a výživu přizpůsobené tvé aktuální fázi cyklu.'
            }
          </Text>
          <TouchableOpacity style={cycleStyles.onboardingBtn} onPress={() => setModalVisible(true)}>
            <Text style={cycleStyles.onboardingBtnText}>
              {partnerMode ? 'Zadat cyklus partnerky' : 'Zadat první menstruaci'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <PhaseHeader info={cycleInfo} />
          <CycleTimeline logs={logs} info={cycleInfo} />

          {/* Section switcher */}
          <View style={cycleStyles.sectionTabs}>
            <TouchableOpacity
              style={[cycleStyles.sectionTab, section === 'training' && cycleStyles.sectionTabActive]}
              onPress={() => setSection('training')}
            >
              <Text style={[cycleStyles.sectionTabText, section === 'training' && cycleStyles.sectionTabTextActive]}>
                {partnerMode ? '🤝 Jak pomoci' : '💪 Trénink'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[cycleStyles.sectionTab, section === 'nutrition' && cycleStyles.sectionTabActive]}
              onPress={() => setSection('nutrition')}
            >
              <Text style={[cycleStyles.sectionTabText, section === 'nutrition' && cycleStyles.sectionTabTextActive]}>
                {partnerMode ? '🥗 Výživa partnerky' : '🥗 Výživa'}
              </Text>
            </TouchableOpacity>
          </View>

          {partnerMode
            ? section === 'training'
              ? <PartnerSupportSection info={cycleInfo} />
              : <NutritionSection info={cycleInfo} />
            : section === 'training'
              ? <TrainingSection info={cycleInfo} />
              : <NutritionSection info={cycleInfo} />
          }

          {/* Log history */}
          <Text style={cycleStyles.sectionTitle}>Historie cyklů</Text>
          {logs.map(log => (
            <View key={log.id} style={cycleStyles.historyRow}>
              <View style={{ flex: 1 }}>
                <Text style={cycleStyles.historyDate}>
                  {new Date(log.period_start).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
                <Text style={cycleStyles.historyMeta}>
                  Délka cyklu: {log.cycle_length} dní  •  Menstruace: {log.period_length} dní
                </Text>
              </View>
              <TouchableOpacity onPress={() => Alert.alert('Smazat záznam?', '', [
                { text: 'Zrušit', style: 'cancel' },
                { text: 'Smazat', style: 'destructive', onPress: () => deleteLog(log.id) },
              ])}>
                <Text style={styles.deleteBtn}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}

      {/* FAB */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: '#8b5cf6' }]} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+ Zadat menstruaci</Text>
      </TouchableOpacity>

      {/* Add modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Nová menstruace</Text>

            <Text style={cycleStyles.inputLabel}>První den menstruace</Text>
            <TextInput
              style={styles.input}
              value={periodDate}
              onChangeText={setPeriodDate}
              placeholder="RRRR-MM-DD"
            />

            <View style={cycleStyles.twoCol}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <Text style={cycleStyles.inputLabel}>Délka cyklu (dny)</Text>
                <TextInput style={styles.input} value={cycleLen} onChangeText={setCycleLen} keyboardType="number-pad" />
              </View>
              <View style={{ flex: 1, marginLeft: 6 }}>
                <Text style={cycleStyles.inputLabel}>Délka menstruace (dny)</Text>
                <TextInput style={styles.input} value={periodLen} onChangeText={setPeriodLen} keyboardType="number-pad" />
              </View>
            </View>

            <TextInput style={styles.input} placeholder="Poznámka (volitelně)" value={logNote} onChangeText={setLogNote} />

            <View style={styles.modalRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text>Zrušit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: '#8b5cf6' }]} onPress={handleAdd} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>Uložit</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

// ─── Phase header ─────────────────────────────────────────────────────────────

function PhaseHeader({ info }: { info: CycleInfo }) {
  const pd = PHASE_DATA[info.phase]
  const progressPct = info.dayInCycle / info.cycleLength

  return (
    <View style={[cycleStyles.phaseCard, { backgroundColor: pd.colorLight, borderColor: pd.color }]}>
      <View style={cycleStyles.phaseRow}>
        <Text style={cycleStyles.phaseEmoji}>{pd.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[cycleStyles.phaseName, { color: pd.color }]}>{pd.name}</Text>
          <Text style={cycleStyles.phaseDay}>Den {info.dayInCycle} z {info.cycleLength}</Text>
        </View>
        <View style={cycleStyles.countdownBox}>
          <Text style={[cycleStyles.countdownNum, { color: pd.color }]}>{info.daysUntilNextPeriod}</Text>
          <Text style={cycleStyles.countdownLabel}>dní do{'\n'}menstruace</Text>
        </View>
      </View>

      {/* Cycle progress bar */}
      <View style={cycleStyles.progressBg}>
        <View style={[cycleStyles.progressFill, { width: `${progressPct * 100}%` as any, backgroundColor: pd.color }]} />
      </View>

      {/* Energy + intensity */}
      <View style={cycleStyles.energyRow}>
        <EnergyDots label="Energie" value={pd.energyLevel} color={pd.color} />
        <EnergyDots label="Intenzita tréninku" value={pd.trainingIntensity} color={pd.color} />
      </View>

      {info.isLutealLate && (
        <View style={cycleStyles.pmsBadge}>
          <Text style={cycleStyles.pmsBadgeText}>⚡ PMS okno — posledních 7 dní cyklu</Text>
        </View>
      )}

      {info.daysUntilOvulation !== null && info.daysUntilOvulation <= 3 && (
        <View style={[cycleStyles.pmsBadge, { backgroundColor: '#fffbeb' }]}>
          <Text style={[cycleStyles.pmsBadgeText, { color: '#92400e' }]}>
            ⭐ Ovulace za {info.daysUntilOvulation === 0 ? 'méně než den' : `${info.daysUntilOvulation} dní`}
          </Text>
        </View>
      )}

      <Text style={cycleStyles.wellbeingTip}>{pd.wellbeingTip}</Text>
    </View>
  )
}

function EnergyDots({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={cycleStyles.energyItem}>
      <Text style={cycleStyles.energyLabel}>{label}</Text>
      <View style={cycleStyles.dots}>
        {[1, 2, 3, 4, 5].map(i => (
          <View key={i} style={[cycleStyles.dot, i <= value ? { backgroundColor: color } : {}]} />
        ))}
      </View>
    </View>
  )
}

// ─── Cycle timeline ───────────────────────────────────────────────────────────

function CycleTimeline({ logs, info }: { logs: { period_start: string; cycle_length: number; period_length: number }[]; info: CycleInfo }) {
  if (logs.length === 0) return null
  const first = logs[logs.length - 1]
  const timeline = buildCycleTimeline(logs[0].period_start, info.cycleLength, info.periodLength, 35)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const COLORS: Record<CyclePhase, string> = {
    menstrual: '#ef4444',
    follicular: '#22c55e',
    ovulation: '#f59e0b',
    luteal: '#8b5cf6',
  }

  return (
    <View style={cycleStyles.timelineContainer}>
      <Text style={cycleStyles.sectionTitle}>Nadcházejících 35 dní</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', paddingVertical: 4 }}>
          {timeline.map((item, i) => {
            const isToday = item.date.getTime() === today.getTime()
            return (
              <View key={i} style={cycleStyles.timelineDay}>
                <View style={[
                  cycleStyles.timelineDot,
                  { backgroundColor: COLORS[item.phase] },
                  isToday && cycleStyles.timelineDotToday,
                ]} />
                <Text style={[cycleStyles.timelineDayNum, isToday && { color: COLORS[item.phase], fontWeight: '700' }]}>
                  {item.date.getDate()}
                </Text>
                {item.date.getDay() === 1 && (
                  <Text style={cycleStyles.timelineMonth}>
                    {item.date.toLocaleDateString('cs-CZ', { month: 'short' })}
                  </Text>
                )}
              </View>
            )
          })}
        </View>
      </ScrollView>
      {/* Legend */}
      <View style={cycleStyles.legend}>
        {(['menstrual', 'follicular', 'ovulation', 'luteal'] as CyclePhase[]).map(p => (
          <View key={p} style={cycleStyles.legendItem}>
            <View style={[cycleStyles.legendDot, { backgroundColor: COLORS[p] }]} />
            <Text style={cycleStyles.legendText}>{PHASE_DATA[p].name}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

// ─── Training section ─────────────────────────────────────────────────────────

function TrainingSection({ info }: { info: CycleInfo }) {
  const pd = PHASE_DATA[info.phase]

  return (
    <View style={cycleStyles.section}>
      <Text style={cycleStyles.sectionTitle}>💪 Doporučení tréninku</Text>

      <View style={[cycleStyles.tipCard, { borderLeftColor: pd.color }]}>
        <Text style={cycleStyles.tipText}>{pd.trainingTip}</Text>
      </View>

      {pd.trainingWarning && (
        <View style={[cycleStyles.tipCard, { borderLeftColor: '#f59e0b', backgroundColor: '#fffbeb' }]}>
          <Text style={[cycleStyles.tipText, { color: '#92400e' }]}>{pd.trainingWarning}</Text>
        </View>
      )}

      <Text style={cycleStyles.subTitle}>Doporučené aktivity</Text>
      {pd.workouts.map((w, i) => (
        <View key={i} style={cycleStyles.workoutRow}>
          <View style={[cycleStyles.workoutDot, { backgroundColor: pd.color }]} />
          <Text style={cycleStyles.workoutText}>{w}</Text>
        </View>
      ))}
    </View>
  )
}

// ─── Nutrition section ────────────────────────────────────────────────────────

function NutritionSection({ info }: { info: CycleInfo }) {
  const pd = PHASE_DATA[info.phase]

  return (
    <View style={cycleStyles.section}>
      <Text style={cycleStyles.sectionTitle}>🥗 Výživová doporučení</Text>

      <View style={[cycleStyles.tipCard, { borderLeftColor: pd.color }]}>
        <Text style={cycleStyles.tipText}>{pd.nutritionTip}</Text>
      </View>

      <Text style={cycleStyles.subTitle}>Zaměř se na</Text>
      <View style={cycleStyles.focusRow}>
        {pd.nutritionFocus.map((f, i) => (
          <View key={i} style={[cycleStyles.focusBadge, { backgroundColor: pd.colorLight, borderColor: pd.color }]}>
            <Text style={[cycleStyles.focusBadgeText, { color: pd.color }]}>{f}</Text>
          </View>
        ))}
      </View>

      <Text style={cycleStyles.subTitle}>✅ Více jez</Text>
      {pd.eatMore.map((item, i) => (
        <View key={i} style={cycleStyles.foodRow}>
          <Text style={cycleStyles.foodEmoji}>{item.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={cycleStyles.foodName}>{item.food}</Text>
            <Text style={cycleStyles.foodReason}>{item.reason}</Text>
          </View>
        </View>
      ))}

      <Text style={[cycleStyles.subTitle, { marginTop: 12 }]}>❌ Omez nebo vyřaď</Text>
      {pd.eatLess.map((item, i) => (
        <View key={i} style={[cycleStyles.foodRow, { opacity: 0.8 }]}>
          <Text style={cycleStyles.foodEmoji}>{item.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={cycleStyles.foodName}>{item.food}</Text>
            <Text style={cycleStyles.foodReason}>{item.reason}</Text>
          </View>
        </View>
      ))}

      <Text style={cycleStyles.subTitle}>Očekávané příznaky</Text>
      <View style={cycleStyles.symptomsRow}>
        {pd.expectedSymptoms.map((s, i) => (
          <View key={i} style={cycleStyles.symptomBadge}>
            <Text style={cycleStyles.symptomText}>{s}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

// ─── Partner support section ──────────────────────────────────────────────────

function PartnerSupportSection({ info }: { info: CycleInfo }) {
  const pd = PHASE_DATA[info.phase]
  const pp = PARTNER_PERSPECTIVE[info.phase]

  return (
    <View style={cycleStyles.section}>
      <Text style={cycleStyles.sectionTitle}>🤝 Jak podpořit partnerku</Text>

      <View style={[cycleStyles.tipCard, { borderLeftColor: pd.color }]}>
        <Text style={cycleStyles.tipText}>{pp.moodNote}</Text>
      </View>

      <Text style={cycleStyles.subTitle}>✅ Co teď pomáhá</Text>
      {pp.supportTips.map((tip, i) => (
        <View key={i} style={cycleStyles.workoutRow}>
          <View style={[cycleStyles.workoutDot, { backgroundColor: pd.color }]} />
          <Text style={cycleStyles.workoutText}>{tip}</Text>
        </View>
      ))}

      <Text style={[cycleStyles.subTitle, { marginTop: 12 }]}>🏃 Aktivity pro dva</Text>
      {pp.togetherActivities.map((a, i) => (
        <View key={i} style={cycleStyles.workoutRow}>
          <View style={[cycleStyles.workoutDot, { backgroundColor: '#22c55e' }]} />
          <Text style={cycleStyles.workoutText}>{a}</Text>
        </View>
      ))}

      <View style={[cycleStyles.tipCard, { borderLeftColor: '#f59e0b', backgroundColor: '#fffbeb', marginTop: 12 }]}>
        <Text style={[cycleStyles.tipText, { color: '#92400e' }]}>⚠️ {pp.avoid}</Text>
      </View>

      <Text style={[cycleStyles.subTitle, { marginTop: 12 }]}>Ona teď může prožívat</Text>
      <View style={cycleStyles.symptomsRow}>
        {pd.expectedSymptoms.map((s, i) => (
          <View key={i} style={cycleStyles.symptomBadge}>
            <Text style={cycleStyles.symptomText}>{s}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 12 },
  tabs: { flexDirection: 'row', marginBottom: 16, gap: 6 },
  tab: { flex: 1, paddingVertical: 9, paddingHorizontal: 4, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  tabActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  tabText: { fontSize: 11, color: '#555', textAlign: 'center' },
  tabTextActive: { color: '#fff', fontWeight: '600' },
  chartContainer: { alignItems: 'center', marginBottom: 16, backgroundColor: '#f8f9fa', borderRadius: 12, padding: 12 },
  logRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  logValue: { fontSize: 18, fontWeight: '700', color: '#2563eb' },
  logDate: { color: '#888', fontSize: 13, marginTop: 2 },
  deleteBtn: { color: '#ccc', fontSize: 15, padding: 4 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 15 },
  measureCard: { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 14, marginBottom: 10 },
  measureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  measureItem: { fontSize: 13, color: '#444', backgroundColor: '#e2e8f0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  fab: { position: 'absolute', bottom: 24, left: 0, right: 0, marginHorizontal: 16, backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center' },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  modal: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 10 },
  modalRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  confirmBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#2563eb', alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '600' },
})

const cycleStyles = StyleSheet.create({
  onboarding: { alignItems: 'center', paddingTop: 40, paddingBottom: 120 },
  onboardingEmoji: { fontSize: 64, marginBottom: 16 },
  onboardingTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#1a1a1a' },
  onboardingText: { color: '#666', fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: 8, marginBottom: 28 },
  onboardingBtn: { backgroundColor: '#8b5cf6', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32 },
  onboardingBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  phaseCard: { borderRadius: 16, borderWidth: 2, padding: 16, marginBottom: 16 },
  phaseRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  phaseEmoji: { fontSize: 36, marginRight: 12 },
  phaseName: { fontSize: 20, fontWeight: 'bold' },
  phaseDay: { color: '#888', fontSize: 13, marginTop: 2 },
  countdownBox: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 10, padding: 8 },
  countdownNum: { fontSize: 28, fontWeight: 'bold' },
  countdownLabel: { fontSize: 10, color: '#666', textAlign: 'center' },

  progressBg: { height: 8, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 4, marginBottom: 12 },
  progressFill: { height: 8, borderRadius: 4 },

  energyRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  energyItem: { flex: 1 },
  energyLabel: { fontSize: 11, color: '#888', marginBottom: 3 },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#e2e8f0' },

  pmsBadge: { backgroundColor: '#f3e8ff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 8 },
  pmsBadgeText: { color: '#6d28d9', fontSize: 12, fontWeight: '600' },
  wellbeingTip: { color: '#555', fontSize: 12, lineHeight: 18, marginTop: 4, fontStyle: 'italic' },

  timelineContainer: { marginBottom: 16 },
  timelineDay: { alignItems: 'center', width: 28, marginRight: 2 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 3 },
  timelineDotToday: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#1a1a1a' },
  timelineDayNum: { fontSize: 9, color: '#888' },
  timelineMonth: { fontSize: 8, color: '#bbb', marginTop: 1 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: '#666' },

  sectionTabs: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  sectionTab: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  sectionTabActive: { backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' },
  sectionTabText: { fontSize: 13, color: '#555' },
  sectionTabTextActive: { color: '#fff', fontWeight: '600' },

  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 10 },
  subTitle: { fontSize: 13, fontWeight: '600', color: '#555', marginTop: 10, marginBottom: 6 },

  tipCard: { borderLeftWidth: 3, backgroundColor: '#f8f9fa', borderRadius: 8, padding: 12, marginBottom: 10 },
  tipText: { color: '#444', fontSize: 13, lineHeight: 20 },

  workoutRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  workoutDot: { width: 6, height: 6, borderRadius: 3, marginRight: 10 },
  workoutText: { fontSize: 14, color: '#333' },

  focusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  focusBadge: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  focusBadgeText: { fontSize: 12, fontWeight: '600' },

  foodRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  foodEmoji: { fontSize: 20, marginRight: 10, marginTop: 1 },
  foodName: { fontSize: 14, fontWeight: '500', color: '#222' },
  foodReason: { fontSize: 12, color: '#888', marginTop: 1 },

  symptomsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  symptomBadge: { backgroundColor: '#f1f5f9', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4 },
  symptomText: { fontSize: 12, color: '#555' },

  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  historyDate: { fontSize: 14, fontWeight: '500', color: '#333' },
  historyMeta: { fontSize: 12, color: '#888', marginTop: 2 },

  twoCol: { flexDirection: 'row' },
  inputLabel: { fontSize: 12, color: '#666', marginBottom: 4, marginTop: 4 },
})
