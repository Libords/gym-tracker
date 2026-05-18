import { View, Text, StyleSheet } from 'react-native'
import { DailyMicros, MICRO_LABELS, RDV } from '../types/nutrition'

type Props = {
  micros: DailyMicros
  /** If true, show only nutrients with value > 0 */
  compact?: boolean
}

export function MicronutrientsCard({ micros, compact = false }: Props) {
  const vitamins = MICRO_LABELS.filter(m => m.group === 'vitamins')
  const minerals = MICRO_LABELS.filter(m => m.group === 'minerals')

  const renderRow = (m: typeof MICRO_LABELS[number]) => {
    const value = micros[m.key]
    const rdv = RDV[m.key]
    const pct = Math.min(value / rdv, 1)
    if (compact && value === 0) return null
    const pctDisplay = Math.round(pct * 100)
    const color = pct >= 1 ? '#16a34a' : pct >= 0.5 ? '#2563eb' : pct >= 0.2 ? '#f59e0b' : '#e2e8f0'

    return (
      <View key={m.key} style={styles.row}>
        <View style={styles.labelCol}>
          <Text style={styles.label}>{m.label}</Text>
        </View>
        <View style={styles.barCol}>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${pct * 100}%` as any, backgroundColor: color }]} />
          </View>
        </View>
        <View style={styles.valueCol}>
          <Text style={styles.value}>{value > 0 ? `${value} ${m.unit}` : '–'}</Text>
          <Text style={[styles.pct, { color: pctDisplay > 0 ? color : '#bbb' }]}>
            {pctDisplay > 0 ? `${pctDisplay}%` : ''}
          </Text>
        </View>
      </View>
    )
  }

  const hasAnyVitamin = vitamins.some(m => micros[m.key] > 0)
  const hasAnyMineral = minerals.some(m => micros[m.key] > 0)

  if (compact && !hasAnyVitamin && !hasAnyMineral) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Mikronutrienty nejsou dostupné pro tuto potravinu.</Text>
      </View>
    )
  }

  return (
    <View>
      {hasAnyVitamin && (
        <View style={styles.group}>
          <Text style={styles.groupTitle}>Vitaminy</Text>
          {vitamins.map(renderRow)}
        </View>
      )}
      {hasAnyMineral && (
        <View style={styles.group}>
          <Text style={styles.groupTitle}>Minerály</Text>
          {minerals.map(renderRow)}
        </View>
      )}
      {!hasAnyVitamin && !hasAnyMineral && !compact && (
        <Text style={styles.emptyText}>Zadejte potraviny pro zobrazení mikronutrientů.</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  group: { marginBottom: 8 },
  groupTitle: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  labelCol: { width: 100 },
  label: { fontSize: 12, color: '#444' },
  barCol: { flex: 1, marginHorizontal: 6 },
  barBg: { height: 5, backgroundColor: '#e2e8f0', borderRadius: 3 },
  barFill: { height: 5, borderRadius: 3 },
  valueCol: { width: 70, alignItems: 'flex-end' },
  value: { fontSize: 10, color: '#666' },
  pct: { fontSize: 11, fontWeight: '700' },
  empty: { paddingVertical: 8 },
  emptyText: { color: '#aaa', fontSize: 12, textAlign: 'center' },
})
