import { useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, TextInput, Modal, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useWorkouts } from '../../../src/hooks/useWorkouts'
import type { Workout } from '../../../src/types/workout'

function WorkoutCard({ workout, onDelete }: { workout: Workout; onDelete: () => void }) {
  const router = useRouter()
  const date = new Date(workout.started_at).toLocaleDateString('cs-CZ')
  const duration = workout.finished_at
    ? Math.round((new Date(workout.finished_at).getTime() - new Date(workout.started_at).getTime()) / 60000)
    : null

  return (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/(app)/workouts/${workout.id}`)}>
      <View style={styles.cardRow}>
        <Text style={styles.cardTitle}>{workout.name}</Text>
        <TouchableOpacity onPress={onDelete}>
          <Text style={styles.deleteBtn}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.cardMeta}>{date}{duration != null ? `  •  ${duration} min` : '  •  probíhá'}</Text>
    </TouchableOpacity>
  )
}

export default function WorkoutsScreen() {
  const { workouts, loading, createWorkout, deleteWorkout } = useWorkouts()
  const router = useRouter()
  const [modalVisible, setModalVisible] = useState(false)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)

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
    <View style={styles.container}>
      <Text style={styles.title}>Tréninky</Text>

      <FlatList
        data={workouts}
        keyExtractor={w => w.id}
        renderItem={({ item }) => (
          <WorkoutCard workout={item} onDelete={() => handleDelete(item.id)} />
        )}
        ListEmptyComponent={<Text style={styles.empty}>Zatím žádné tréninky. Začni svůj první!</Text>}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+ Nový trénink</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Nový trénink</Text>
            <TextInput
              style={styles.input}
              placeholder="Název tréninku"
              value={name}
              onChangeText={setName}
              autoFocus
            />
            <View style={styles.modalRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Zrušit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleCreate} disabled={creating}>
                {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>Začít</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 16, marginTop: 8 },
  card: { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 16, marginBottom: 10 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 17, fontWeight: '600' },
  cardMeta: { color: '#888', marginTop: 4, fontSize: 13 },
  deleteBtn: { color: '#aaa', fontSize: 16, padding: 4 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 15 },
  fab: { position: 'absolute', bottom: 24, left: 16, right: 16, backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center' },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 32 },
  modal: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 16 },
  modalRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  cancelText: { fontSize: 15 },
  confirmBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#2563eb', alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '600', fontSize: 15 },
})
