import { useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, TextInput, Modal, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useWorkoutTemplates } from '../../../../src/hooks/useWorkoutTemplates'
import { useWorkouts } from '../../../../src/hooks/useWorkouts'
import { TemplateCard } from '../../../../src/components/workouts/TemplateCard'

export default function TemplatesScreen() {
  const router = useRouter()
  const { templates, loading, createTemplate, startFromTemplate } = useWorkoutTemplates()
  const { workouts, finishWorkout, deleteWorkout } = useWorkouts()
  const [modalVisible, setModalVisible] = useState(false)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [starting, setStarting] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) return
    setCreating(true)
    const tpl = await createTemplate(name.trim())
    setCreating(false)
    setModalVisible(false)
    setName('')
    if (tpl) router.push(`/(app)/workouts/templates/${tpl.id}`)
  }

  const doStart = async (templateId: string) => {
    setStarting(true)
    const res = await startFromTemplate(templateId)
    setStarting(false)
    if (!res) {
      Alert.alert('Chyba', 'Nepodařilo se vytvořit trénink z šablony.')
      return
    }
    if (res.missingExerciseCount > 0) {
      const n = res.missingExerciseCount
      Alert.alert(
        'Některé cviky byly přeskočeny',
        `${n} ${n === 1 ? 'cvik byl odstraněn' : 'cviků bylo odstraněno'}, protože už neexistují.`,
      )
    }
    router.replace(`/(app)/workouts/${res.workout.id}`)
  }

  const handleStart = (templateId: string) => {
    const active = workouts.find(w => w.finished_at == null)
    if (!active) {
      doStart(templateId)
      return
    }
    Alert.alert(
      'Máš rozpracovaný trénink',
      `"${active.name}" zatím neukončen.`,
      [
        {
          text: 'Pokračovat v rozpracovaném',
          onPress: () => router.push(`/(app)/workouts/${active.id}`),
        },
        {
          text: 'Zahodit a začít nový',
          style: 'destructive',
          onPress: async () => {
            await deleteWorkout(active.id)
            doStart(templateId)
          },
        },
        { text: 'Zrušit', style: 'cancel' },
      ],
    )
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Zpět</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Šablony</Text>
        <View style={{ width: 60 }} />
      </View>

      {starting && (
        <View style={styles.overlay}><ActivityIndicator size="large" color="#fff" /></View>
      )}

      {templates.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>Zatím žádné šablony.</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.emptyBtnText}>+ Vytvořit šablonu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={templates}
          keyExtractor={t => t.id}
          renderItem={({ item }) => (
            <TemplateCard
              template={item}
              onPress={() => router.push(`/(app)/workouts/templates/${item.id}`)}
              onStart={() => handleStart(item.id)}
            />
          )}
          contentContainerStyle={{ paddingVertical: 12, paddingBottom: 100 }}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+ Nová šablona</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Nová šablona</Text>
            <TextInput
              style={styles.input}
              placeholder="Název (např. Push day)"
              value={name}
              onChangeText={setName}
              autoFocus
              maxLength={80}
            />
            <View style={styles.modalRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setModalVisible(false); setName('') }}>
                <Text>Zrušit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleCreate} disabled={creating}>
                {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>Vytvořit</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 24, gap: 12 },
  back: { color: '#2563eb', fontSize: 15, width: 60 },
  title: { flex: 1, fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  empty: { color: '#888', fontSize: 15, marginBottom: 20 },
  emptyBtn: { backgroundColor: '#2563eb', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  emptyBtnText: { color: '#fff', fontWeight: '600' },
  fab: { position: 'absolute', bottom: 24, left: 16, right: 16, backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center' },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 32 },
  modal: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 16 },
  modalRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  confirmBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#2563eb', alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '600' },
})
