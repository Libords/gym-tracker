import { useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, TextInput, Modal, ActivityIndicator, SectionList,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useWorkouts } from '../../../src/hooks/useWorkouts'
import type { Workout } from '../../../src/types/workout'

function groupByDate(workouts: Workout[]): { title: string; data: Workout[] }[] {
  const groups: Record<string, Workout[]> = {}
  for (const w of workouts) {
    const date = new Date(w.started_at)
    const key = date.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    if (!groups[key]) groups[key] = []
    groups[key].push(w)
  }
  return Object.entries(groups).map(([title, data]) => ({ title, data }))
}

function duration(w: Workout): string {
  if (!w.finished_at) return 'probíhá'
  const min = Math.round((new Date(w.finished_at).getTime() - new Date(w.started_at).getTime()) / 60000)
  return `${min} min`
}

function WorkoutCard({ workout, onDelete }: { workout: Workout; onDelete: () => void }) {
  const router = useRouter()
  return (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/(app)/workouts/${workout.id}`)}>
      <View style={styles.cardRow}>
        <Text style={styles.cardTitle}>{workout.name}</Text>
        <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.deleteBtn}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.cardMeta}>
        {new Date(workout.started_at).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
        {'  •  '}{duration(workout)}
        {!workout.finished_at ? '  🟢' : ''}
      </Text>
    </TouchableOpacity>
  )
}

export default function WorkoutsScreen() {
  const { workouts, loading, createWorkout, deleteWorkout } = useWorkouts()
  const router = useRouter()
  const [modalVisible, setModalVisible] = useState(false)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)

  const sections = groupByDate(workouts)

  const handleCreate = async () => {
    if (!name.trim()) return
    setCreating(true)
    const workout = await createWorkout(name.trim())
    setCreating(false)
    setModalVisible(false)
    setName('')
    if (workout) router.push(`/(app)/workouts/${workout.id}`)
  }

  const handleDelete = (id: string) => {
    Alert.alert('Smazat trénink?', 'Tato akce je nevratná.', [
      { text: 'Zrušit', style: 'cancel' },
      { text: 'Smazat', style: 'destructive', onPress: () => deleteWorkout(id) },
    ])
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Tréninky</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.tplBtn} onPress={() => router.push('/(app)/workouts/history')}>
            <Text style={styles.tplBtnText}>Historie</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tplBtn} onPress={() => router.push('/(app)/workouts/templates')}>
            <Text style={styles.tplBtnText}>Šablony</Text>
          </TouchableOpacity>
        </View>
      </View>

      {sections.length === 0 ? (
        <Text style={styles.empty}>Zatím žádné tréninky. Začni svůj první!</Text>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={w => w.id}
          renderItem={({ item }) => (
            <WorkoutCard workout={item} onDelete={() => handleDelete(item.id)} />
          )}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+ Nový trénink</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Nový trénink</Text>
            <TextInput
              style={styles.input}
              placeholder="Název tréninku (např. Horní tělo)"
              value={name}
              onChangeText={setName}
              autoFocus
            />
            <View style={styles.modalRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text>Zrušit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleCreate} disabled={creating}>
                {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>Začít</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 26, fontWeight: 'bold' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  tplBtn: { borderWidth: 1, borderColor: '#2563eb', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  tplBtnText: { color: '#2563eb', fontWeight: '600', fontSize: 13 },
  sectionHeader: { fontSize: 13, fontWeight: '600', color: '#888', textTransform: 'uppercase', marginTop: 16, marginBottom: 6 },
  card: { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 14, marginBottom: 8 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '600', flex: 1 },
  cardMeta: { color: '#888', marginTop: 4, fontSize: 13 },
  deleteBtn: { color: '#ccc', fontSize: 15 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 80, fontSize: 15 },
  fab: { position: 'absolute', bottom: 24, left: 16, right: 16, backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center' },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 32 },
  modal: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 16 },
  modalRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  confirmBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#2563eb', alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '600' },
})
