import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Modal, Alert, ActivityIndicator,
} from 'react-native'
import { LineChart } from 'react-native-gifted-charts'
import { useWeightLogs, useBodyMeasurements } from '../../../src/hooks/useProgress'

type Tab = 'vaha' | 'miry'

export default function ProgressScreen() {
  const [tab, setTab] = useState<Tab>('vaha')

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progress</Text>
      <View style={styles.tabs}>
        {(['vaha', 'miry'] as Tab[]).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'vaha' ? '⚖️ Váha' : '📏 Míry'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'vaha' && <WeightTab />}
      {tab === 'miry' && <MeasurementsTab />}
    </View>
  )
}

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
            <Text style={styles.logDate}>{new Date(log.date).toLocaleDateString('cs-CZ')}{log.note ? `  •  ${log.note}` : ''}</Text>
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

function MeasurementsTab() {
  const { measurements, loading, addMeasurement, deleteMeasurement } = useBodyMeasurements()
  const [modalVisible, setModalVisible] = useState(false)
  const [saving, setSaving] = useState(false)
  const [vals, setVals] = useState({ chest_cm: '', waist_cm: '', hips_cm: '', arm_cm: '', thigh_cm: '', neck_cm: '', note: '' })

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 12 },
  tabs: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  tab: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  tabActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  tabText: { fontSize: 13, color: '#555' },
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
