import { useState, useMemo } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, Modal, Alert, ActivityIndicator, ScrollView,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useWorkoutSets, useExercises, useWorkouts } from '../../../src/hooks/useWorkouts'
import type { Exercise } from '../../../src/types/workout'

const BODY_PARTS = ['Vše', 'chest', 'back', 'upper legs', 'lower legs', 'upper arms', 'lower arms', 'shoulders', 'waist', 'cardio']
const BODY_PART_LABELS: Record<string, string> = {
  'Vše': 'Vše', 'chest': 'Hrudník', 'back': 'Záda',
  'upper legs': 'Stehna', 'lower legs': 'Lýtka', 'upper arms': 'Paže',
  'lower arms': 'Předloktí', 'shoulders': 'Ramena', 'waist': 'Břicho', 'cardio': 'Kardio',
}

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { sets, loading, addSet, removeSet } = useWorkoutSets(id)
  const { exercises } = useExercises()
  const { workouts, finishWorkout } = useWorkouts()
  const workout = workouts.find(w => w.id === id)

  const [addModalVisible, setAddModalVisible] = useState(false)
  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [bodyPart, setBodyPart] = useState('Vše')

  const filteredExercises = useMemo(() =>
    exercises.filter(e => {
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase())
      const matchBodyPart = bodyPart === 'Vše' || e.body_part === bodyPart
      return matchSearch && matchBodyPart
    }),
    [exercises, search, bodyPart]
  )

  const handleAddSet = async () => {
    if (!selectedExercise) return
    setSaving(true)
    await addSet({
      exercise_id: selectedExercise.id,
      set_number: sets.length + 1,
      reps: reps ? parseInt(reps) : null,
      weight_kg: weight ? parseFloat(weight) : null,
      rest_seconds: null,
      exercise: selectedExercise,
    })
    setSaving(false)
    setAddModalVisible(false)
    setSelectedExercise(null)
    setReps('')
    setWeight('')
  }

  const handleFinish = () => {
    Alert.alert('Ukončit trénink?', 'Trénink bude uložen.', [
      { text: 'Zrušit', style: 'cancel' },
      { text: 'Ukončit', onPress: async () => { await finishWorkout(id); router.back() } },
    ])
  }

  const resetModal = () => {
    setAddModalVisible(false)
    setSelectedExercise(null)
    setSearch('')
    setBodyPart('Vše')
    setReps('')
    setWeight('')
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>

  const isFinished = !!workout?.finished_at

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Zpět</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{workout?.name ?? 'Trénink'}</Text>
        {!isFinished && (
          <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
            <Text style={styles.finishText}>Ukončit</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={sets}
        keyExtractor={s => s.id}
        renderItem={({ item }) => (
          <View style={styles.setRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.exerciseName}>{item.exercise?.name}</Text>
              <Text style={styles.setMeta}>
                {item.reps != null ? `${item.reps} opak.` : '—'}
                {item.weight_kg != null ? `  •  ${item.weight_kg} kg` : ''}
                {item.exercise?.target ? `  •  ${item.exercise.target}` : ''}
              </Text>
            </View>
            {!isFinished && (
              <TouchableOpacity onPress={() => removeSet(item.id)}>
                <Text style={styles.deleteBtn}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Žádné série. Přidej první cvičení.</Text>}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {!isFinished && (
        <TouchableOpacity style={styles.fab} onPress={() => setAddModalVisible(true)}>
          <Text style={styles.fabText}>+ Přidat sérii</Text>
        </TouchableOpacity>
      )}

      {/* Modal výběru cviku */}
      <Modal visible={addModalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            {!selectedExercise ? (
              <>
                <Text style={styles.modalTitle}>Vyber cvik</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Hledat cvik..."
                  value={search}
                  onChangeText={setSearch}
                />

                {/* Filtry podle části těla */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                  {BODY_PARTS.map(bp => (
                    <TouchableOpacity
                      key={bp}
                      style={[styles.filterChip, bodyPart === bp && styles.filterChipActive]}
                      onPress={() => setBodyPart(bp)}
                    >
                      <Text style={[styles.filterChipText, bodyPart === bp && styles.filterChipTextActive]}>
                        {BODY_PART_LABELS[bp]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.resultCount}>{filteredExercises.length} cviků</Text>

                <ScrollView style={{ maxHeight: 300 }}>
                  {filteredExercises.map(e => (
                    <TouchableOpacity key={e.id} style={styles.exerciseItem} onPress={() => setSelectedExercise(e)}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.exerciseItemText}>{e.name}</Text>
                        {(e.target || e.equipment) && (
                          <Text style={styles.exerciseMeta}>
                            {e.target}{e.target && e.equipment ? '  •  ' : ''}{e.equipment}
                          </Text>
                        )}
                      </View>
                      <TouchableOpacity onPress={() => setDetailExercise(e)} style={styles.infoBtn}>
                        <Text style={styles.infoBtnText}>ℹ</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity style={[styles.cancelBtn, { marginTop: 12 }]} onPress={resetModal}>
                  <Text>Zrušit</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Přidat sérii</Text>
                <Text style={styles.selectedExercise}>📌 {selectedExercise.name}</Text>
                {selectedExercise.target && (
                  <Text style={styles.exerciseMeta}>Cíl: {selectedExercise.target}  •  {selectedExercise.equipment}</Text>
                )}
                <TextInput style={[styles.input, { marginTop: 12 }]} placeholder="Opakování" value={reps} onChangeText={setReps} keyboardType="numeric" />
                <TextInput style={styles.input} placeholder="Váha (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" />
                <TouchableOpacity style={styles.backLink} onPress={() => setSelectedExercise(null)}>
                  <Text style={styles.backLinkText}>← Změnit cvik</Text>
                </TouchableOpacity>
                <View style={styles.modalRow}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={resetModal}>
                    <Text>Zrušit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmBtn} onPress={handleAddSet} disabled={saving}>
                    {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>Přidat</Text>}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Detail cviku */}
      <Modal visible={!!detailExercise} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{detailExercise?.name}</Text>
            {detailExercise?.target && <Text style={styles.detailMeta}>🎯 {detailExercise.target}</Text>}
            {detailExercise?.equipment && <Text style={styles.detailMeta}>🏋️ {detailExercise.equipment}</Text>}
            {detailExercise?.secondary_muscles && detailExercise.secondary_muscles.length > 0 && (
              <Text style={styles.detailMeta}>⚡ {detailExercise.secondary_muscles.join(', ')}</Text>
            )}
            {detailExercise?.instructions && detailExercise.instructions.length > 0 && (
              <>
                <Text style={[styles.detailMeta, { fontWeight: '600', marginTop: 8 }]}>Provedení:</Text>
                <ScrollView style={{ maxHeight: 200 }}>
                  {detailExercise.instructions.map((step, i) => (
                    <Text key={i} style={styles.instructionStep}>{i + 1}. {step}</Text>
                  ))}
                </ScrollView>
              </>
            )}
            <TouchableOpacity style={[styles.confirmBtn, { marginTop: 16 }]} onPress={() => setDetailExercise(null)}>
              <Text style={styles.confirmText}>Zavřít</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 24, gap: 12 },
  back: { color: '#2563eb', fontSize: 15 },
  title: { flex: 1, fontSize: 20, fontWeight: 'bold' },
  finishBtn: { backgroundColor: '#22c55e', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  finishText: { color: '#fff', fontWeight: '600' },
  setRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderColor: '#f0f0f0', marginHorizontal: 16 },
  exerciseName: { fontSize: 15, fontWeight: '600' },
  setMeta: { color: '#888', fontSize: 13, marginTop: 2 },
  deleteBtn: { color: '#aaa', fontSize: 16, padding: 4 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 15 },
  fab: { position: 'absolute', bottom: 24, left: 16, right: 16, backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center' },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '85%' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 10 },
  filterRow: { marginBottom: 8 },
  filterChip: { borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  filterChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  filterChipText: { fontSize: 13, color: '#555' },
  filterChipTextActive: { color: '#fff' },
  resultCount: { color: '#999', fontSize: 12, marginBottom: 6 },
  exerciseItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  exerciseItemText: { fontSize: 15, fontWeight: '500' },
  exerciseMeta: { color: '#888', fontSize: 12, marginTop: 1 },
  infoBtn: { padding: 8 },
  infoBtnText: { fontSize: 16, color: '#2563eb' },
  selectedExercise: { fontSize: 16, fontWeight: '600', color: '#2563eb', marginBottom: 4 },
  backLink: { marginBottom: 12 },
  backLinkText: { color: '#888', fontSize: 13 },
  modalRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  confirmBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#2563eb', alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  detailMeta: { color: '#555', fontSize: 14, marginBottom: 4 },
  instructionStep: { color: '#444', fontSize: 13, marginBottom: 6, lineHeight: 20 },
})
