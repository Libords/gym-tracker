import { useEffect, useMemo, useState } from 'react'
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet,
  Alert, Modal, ScrollView, ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useWorkoutTemplates } from '../../../../src/hooks/useWorkoutTemplates'
import { useExercises } from '../../../../src/hooks/useWorkouts'
import { CreateExerciseModal } from '../../../../src/components/workouts/CreateExerciseModal'
import { useExerciseFilters } from '../../../../src/hooks/useExerciseFilters'
import { TemplateExerciseRow } from '../../../../src/components/workouts/TemplateExerciseRow'
import { EquipmentChips } from '../../../../src/components/workouts/EquipmentChips'
import { ExerciseThumbnail } from '../../../../src/components/workouts/ExerciseThumbnail'
import { BODY_PARTS, BODY_PART_LABELS } from '../../../../src/lib/bodyParts'
import type { Exercise, TemplateExercise } from '../../../../src/types/workout'

export default function TemplateEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const {
    templates, loading,
    renameTemplate, deleteTemplate,
    addExerciseToTemplate, updateTemplateExercise,
    removeTemplateExercise, reorderTemplateExercises,
  } = useWorkoutTemplates()
  const { exercises, createExercise } = useExercises()

  const template = templates.find(t => t.id === id)
  const [name, setName] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const {
    filters, setBodyPart, setSearch, toggleEquipmentChip, applyFilters, reset: resetFilters,
  } = useExerciseFilters()
  const search = filters.search
  const bodyPart = filters.bodyPart

  useEffect(() => {
    if (template) setName(template.name)
  }, [template?.id])

  // Auto-save name (debounced)
  useEffect(() => {
    if (!template) return
    if (name === template.name) return
    const t = setTimeout(() => {
      if (name.trim() && name.trim() !== template.name) {
        renameTemplate(template.id, name.trim())
      }
    }, 600)
    return () => clearTimeout(t)
  }, [name])

  const items: TemplateExercise[] = useMemo(
    () => template?.template_exercises ?? [],
    [template?.template_exercises],
  )

  const filteredExercises = useMemo(
    () => applyFilters(exercises),
    [exercises, applyFilters],
  )

  const handleAddExercise = async (ex: Exercise) => {
    if (!template) return
    await addExerciseToTemplate(template.id, ex.id, { sets: 3, reps: 10, weight_kg: null })
    setPickerOpen(false)
    resetFilters()
  }

  const handleMove = (idx: number, dir: -1 | 1) => {
    if (!template) return
    const target = idx + dir
    if (target < 0 || target >= items.length) return
    const ids = items.map(i => i.id)
    ;[ids[idx], ids[target]] = [ids[target], ids[idx]]
    reorderTemplateExercises(template.id, ids)
  }

  const handleDeleteTemplate = () => {
    if (!template) return
    Alert.alert(
      'Smazat šablonu?',
      `"${template.name}" bude smazaná. Historické workouty zůstanou.`,
      [
        { text: 'Zrušit', style: 'cancel' },
        {
          text: 'Smazat',
          style: 'destructive',
          onPress: async () => {
            await deleteTemplate(template.id)
            router.back()
          },
        },
      ],
    )
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>
  if (!template) return <View style={styles.center}><Text>Šablona nenalezena.</Text></View>

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Zpět</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Editor šablony</Text>
        <TouchableOpacity onPress={handleDeleteTemplate}>
          <Text style={styles.delete}>Smazat</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.nameInput}
        value={name}
        onChangeText={setName}
        placeholder="Název šablony"
        maxLength={80}
      />

      <FlatList
        data={items}
        keyExtractor={i => i.id}
        renderItem={({ item, index }) => (
          <TemplateExerciseRow
            item={item}
            isFirst={index === 0}
            isLast={index === items.length - 1}
            onChange={patch => updateTemplateExercise(item.id, patch)}
            onRemove={() => removeTemplateExercise(item.id)}
            onMoveUp={() => handleMove(index, -1)}
            onMoveDown={() => handleMove(index, 1)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Zatím žádný cvik. Klepni na „Přidat cvik".</Text>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setPickerOpen(true)}>
        <Text style={styles.fabText}>+ Přidat cvik</Text>
      </TouchableOpacity>

      <Modal visible={pickerOpen} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Vyber cvik</Text>
            <TextInput
              style={styles.input}
              placeholder="Hledat cvik..."
              value={search}
              onChangeText={setSearch}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {BODY_PARTS.map(bp => (
                <TouchableOpacity
                  key={bp}
                  style={[styles.chip, bodyPart === bp && styles.chipActive]}
                  onPress={() => setBodyPart(bp)}
                >
                  <Text style={[styles.chipText, bodyPart === bp && styles.chipTextActive]}>
                    {BODY_PART_LABELS[bp]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <EquipmentChips
              selected={filters.equipmentChips}
              onToggle={toggleEquipmentChip}
            />
            <View style={styles.resultRow}>
              <Text style={styles.resultCount}>{filteredExercises.length} cviků</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(true)}>
                <Text style={styles.createLink}>+ Vlastní cvik</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 320 }}>
              {filteredExercises.map(e => (
                <TouchableOpacity key={e.id} style={styles.exerciseItem} onPress={() => handleAddExercise(e)}>
                  <ExerciseThumbnail uri={e.image_url} name={e.name} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.exerciseItemText}>{e.name}</Text>
                      {e.is_custom && <Text style={styles.customBadge}>vlastní</Text>}
                    </View>
                    {(e.target || e.equipment) && (
                      <Text style={styles.exerciseMeta}>
                        {e.target}{e.target && e.equipment ? '  •  ' : ''}{e.equipment}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setPickerOpen(false); resetFilters() }}>
              <Text>Zavřít</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Nested inside the picker modal so it can present over it (iOS stacked-modal fix) */}
        <CreateExerciseModal
          visible={createModalVisible}
          initialName={search}
          onClose={() => setCreateModalVisible(false)}
          onSubmit={createExercise}
          onCreated={(ex) => handleAddExercise(ex)}
        />
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 24, gap: 12 },
  back: { color: '#2563eb', fontSize: 15 },
  title: { flex: 1, fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  delete: { color: '#ef4444', fontSize: 14 },
  nameInput: { fontSize: 20, fontWeight: '700', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', marginBottom: 8 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 15 },
  fab: { position: 'absolute', bottom: 24, left: 16, right: 16, backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center' },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '85%' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 10 },
  filterRow: { marginBottom: 8 },
  chip: { borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  chipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipText: { fontSize: 13, color: '#555' },
  chipTextActive: { color: '#fff' },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  resultCount: { color: '#999', fontSize: 12 },
  createLink: { color: '#2563eb', fontSize: 13, fontWeight: '700' },
  customBadge: { fontSize: 10, color: '#2563eb', backgroundColor: '#eff6ff', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1, overflow: 'hidden', fontWeight: '700' },
  exerciseItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  exerciseItemText: { fontSize: 15, fontWeight: '500' },
  exerciseMeta: { color: '#888', fontSize: 12, marginTop: 1 },
  cancelBtn: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', marginTop: 12 },
})
