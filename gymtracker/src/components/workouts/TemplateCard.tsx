import { TouchableOpacity, View, Text, StyleSheet } from 'react-native'
import type { WorkoutTemplate } from '../../types/workout'

type Props = {
  template: WorkoutTemplate
  onPress: () => void
  onStart: () => void
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' })
}

export function TemplateCard({ template, onPress, onStart }: Props) {
  const count = template.template_exercises?.length ?? 0
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={1}>{template.name}</Text>
        <Text style={styles.meta}>
          {count} {count === 1 ? 'cvik' : count >= 2 && count <= 4 ? 'cviky' : 'cviků'}
          {'  •  '}
          aktualizováno {formatDate(template.updated_at)}
        </Text>
      </View>
      <TouchableOpacity style={styles.startBtn} onPress={onStart}>
        <Text style={styles.startText}>Spustit</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginHorizontal: 16,
    marginBottom: 10,
    gap: 12,
  },
  name: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  meta: { fontSize: 12, color: '#888', marginTop: 3 },
  startBtn: { backgroundColor: '#2563eb', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  startText: { color: '#fff', fontWeight: '600' },
})
