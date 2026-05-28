import { useEffect, useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, ActivityIndicator, Alert,
} from 'react-native'
import { BODY_PARTS, BODY_PART_LABELS } from '../../lib/bodyParts'
import { EQUIPMENT_CHIPS, EQUIPMENT_CHIP_LABEL_CS } from '../../lib/equipmentMapping'
import type { Exercise, EquipmentChip } from '../../types/workout'

// Body parts a user can pick (exclude the 'Vše'/all sentinel and 'other' catch-all)
const SELECTABLE_BODY_PARTS = BODY_PARTS.filter(bp => bp !== 'Vše' && bp !== 'other')

type CreateInput = { name: string; body_part: string; equipment: string; target?: string | null }

type Props = {
  visible: boolean
  initialName?: string
  onClose: () => void
  onSubmit: (input: CreateInput) => Promise<{ exercise: Exercise | null; error: Error | null }>
  onCreated: (exercise: Exercise) => void
}

export function CreateExerciseModal({ visible, initialName, onClose, onSubmit, onCreated }: Props) {
  const [name, setName] = useState('')
  const [bodyPart, setBodyPart] = useState<string | null>(null)
  const [equipment, setEquipment] = useState<EquipmentChip | null>(null)
  const [saving, setSaving] = useState(false)

  // Reset form each time the modal opens (prefill name from the search box if given)
  useEffect(() => {
    if (visible) {
      setName(initialName?.trim() ?? '')
      setBodyPart(null)
      setEquipment(null)
      setSaving(false)
    }
  }, [visible, initialName])

  const canSave = name.trim() !== '' && bodyPart !== null && equipment !== null

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    const { exercise, error } = await onSubmit({
      name,
      body_part: bodyPart!,
      equipment: equipment!,
    })
    setSaving(false)
    if (error || !exercise) {
      Alert.alert('Nepodařilo se uložit cvik', error?.message ?? 'Zkus to znovu.')
      return
    }
    onCreated(exercise)
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Nový vlastní cvik</Text>

          <ScrollView style={{ maxHeight: 440 }}>
            <Text style={styles.label}>Název</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Např. Tlak na hrudník na stroji"
            />

            <Text style={styles.label}>Svalová partie</Text>
            <View style={styles.chipRow}>
              {SELECTABLE_BODY_PARTS.map(bp => (
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
            </View>

            <Text style={styles.label}>Vybavení</Text>
            <View style={styles.chipRow}>
              {EQUIPMENT_CHIPS.map(chip => (
                <TouchableOpacity
                  key={chip}
                  style={[styles.chip, equipment === chip && styles.chipActive]}
                  onPress={() => setEquipment(chip)}
                >
                  <Text style={[styles.chipText, equipment === chip && styles.chipTextActive]}>
                    {EQUIPMENT_CHIP_LABEL_CS[chip]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.row}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={saving}>
              <Text>Zrušit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, !canSave && styles.confirmBtnDisabled]}
              onPress={handleSave}
              disabled={!canSave || saving}
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>Vytvořit</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  modal: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  label: { fontSize: 13, color: '#666', fontWeight: '500', marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: '#fafafa' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#e2e8f0', backgroundColor: '#fafafa' },
  chipActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  chipText: { fontSize: 13, color: '#555', fontWeight: '500' },
  chipTextActive: { color: '#2563eb', fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 18 },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 10, backgroundColor: '#f1f5f9' },
  confirmBtn: { paddingVertical: 12, paddingHorizontal: 22, borderRadius: 10, backgroundColor: '#2563eb' },
  confirmBtnDisabled: { backgroundColor: '#94a3b8' },
  confirmText: { color: '#fff', fontWeight: '700' },
})
