import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { WeightInput } from './WeightInput'
import type { TemplateExercise } from '../../types/workout'

type Props = {
  item: TemplateExercise
  isFirst: boolean
  isLast: boolean
  onChange: (patch: Partial<Pick<TemplateExercise, 'target_sets' | 'target_reps' | 'target_weight_kg'>>) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onLongPressDrag?: () => void
}

export function TemplateExerciseRow({
  item,
  isFirst,
  isLast,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  onLongPressDrag,
}: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.dragCol}>
        <TouchableOpacity
          disabled={isFirst}
          onPress={onMoveUp}
          onLongPress={onLongPressDrag}
          style={[styles.arrowBtn, isFirst && styles.arrowBtnDisabled]}
        >
          <Text style={[styles.arrowText, isFirst && styles.arrowTextDisabled]}>▲</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={isLast}
          onPress={onMoveDown}
          onLongPress={onLongPressDrag}
          style={[styles.arrowBtn, isLast && styles.arrowBtnDisabled]}
        >
          <Text style={[styles.arrowText, isLast && styles.arrowTextDisabled]}>▼</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={1}>{item.exercise?.name ?? '?'}</Text>
        <View style={styles.inputRow}>
          <View style={styles.field}>
            <Text style={styles.label}>Série</Text>
            <TextInput
              style={styles.input}
              value={String(item.target_sets)}
              onChangeText={t => onChange({ target_sets: clampInt(t, 1, 99, item.target_sets) })}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Opak.</Text>
            <TextInput
              style={styles.input}
              value={String(item.target_reps)}
              onChangeText={t => onChange({ target_reps: clampInt(t, 1, 999, item.target_reps) })}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.field, { flex: 1.4 }]}>
            <Text style={styles.label}>Váha</Text>
            <WeightInput
              value_kg={item.target_weight_kg}
              onChangeKg={kg => onChange({ target_weight_kg: kg })}
              showSuffix
              inputStyle={styles.input}
            />
          </View>
        </View>
      </View>

      <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
        <Text style={styles.removeText}>✕</Text>
      </TouchableOpacity>
    </View>
  )
}

function clampInt(text: string, min: number, max: number, fallback: number): number {
  const n = parseInt(text, 10)
  if (Number.isNaN(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 8,
  },
  dragCol: { justifyContent: 'center', alignItems: 'center', gap: 2 },
  arrowBtn: { width: 28, height: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 4, backgroundColor: '#f0f4ff' },
  arrowBtnDisabled: { backgroundColor: '#fafafa' },
  arrowText: { fontSize: 12, color: '#2563eb' },
  arrowTextDisabled: { color: '#ccc' },
  name: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  inputRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  field: { flex: 1 },
  label: { fontSize: 11, color: '#888', marginBottom: 2 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, fontSize: 14 },
  removeBtn: { padding: 8 },
  removeText: { color: '#bbb', fontSize: 18 },
})
