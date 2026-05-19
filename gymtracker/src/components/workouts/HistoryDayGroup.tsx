import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useUnitPreference } from '../../hooks/useUnitPreference'
import { formatWeight } from '../../lib/units'
import type { HistoryDay, WorkoutWithStats } from '../../hooks/useWorkoutHistory'

type Props = {
  day: HistoryDay
  onPressWorkout: (id: string) => void
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })
}

function WorkoutRow({ w, onPress }: { w: WorkoutWithStats; onPress: () => void }) {
  const { unit } = useUnitPreference()
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardRow}>
        <Text style={styles.cardTitle} numberOfLines={1}>{w.name}</Text>
        <Text style={styles.cardTime}>{timeLabel(w.started_at)}</Text>
      </View>
      <Text style={styles.cardMeta}>
        {w.exercise_count} {w.exercise_count === 1 ? 'cvik' : w.exercise_count >= 2 && w.exercise_count <= 4 ? 'cviky' : 'cviků'}
        {'  •  '}{w.set_count} sérií
        {'  •  '}{formatWeight(w.total_volume_kg, unit, { decimals: 0 })}
        {w.duration_min != null ? `  •  ${w.duration_min} min` : ''}
      </Text>
    </TouchableOpacity>
  )
}

export function HistoryDayGroup({ day, onPressWorkout }: Props) {
  return (
    <View style={styles.group}>
      <Text style={styles.header}>{day.label}</Text>
      {day.workouts.map(w => (
        <WorkoutRow key={w.id} w={w} onPress={() => onPressWorkout(w.id)} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  group: { marginBottom: 12 },
  header: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
  },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
  cardTime: { color: '#888', fontSize: 13 },
  cardMeta: { color: '#666', marginTop: 4, fontSize: 13 },
})
