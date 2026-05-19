import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { EQUIPMENT_CHIPS, EQUIPMENT_CHIP_LABEL_CS } from '../../lib/equipmentMapping'
import type { EquipmentChip } from '../../types/workout'

type Props = {
  selected: EquipmentChip[]
  onToggle: (chip: EquipmentChip) => void
}

export function EquipmentChips({ selected, onToggle }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
      {EQUIPMENT_CHIPS.map(chip => {
        const active = selected.includes(chip)
        return (
          <TouchableOpacity
            key={chip}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onToggle(chip)}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {EQUIPMENT_CHIP_LABEL_CS[chip]}
            </Text>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  row: { marginBottom: 8 },
  chip: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  chipActive: { backgroundColor: '#10b981', borderColor: '#10b981' },
  chipText: { fontSize: 13, color: '#555' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
})
