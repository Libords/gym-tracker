import { useState, useEffect } from 'react'
import { TextInput, View, Text, StyleSheet, type StyleProp, type ViewStyle, type TextStyle } from 'react-native'
import { useUnitPreference } from '../../hooks/useUnitPreference'
import { displayWeight, storageWeight } from '../../lib/units'

type Props = {
  value_kg: number | null
  onChangeKg: (kg: number | null) => void
  placeholder?: string
  showSuffix?: boolean
  style?: StyleProp<ViewStyle>
  inputStyle?: StyleProp<TextStyle>
  editable?: boolean
}

export function WeightInput({
  value_kg,
  onChangeKg,
  placeholder = 'Váha',
  showSuffix = true,
  style,
  inputStyle,
  editable = true,
}: Props) {
  const { unit } = useUnitPreference()
  const [text, setText] = useState<string>(() => {
    const d = displayWeight(value_kg, unit)
    return d == null ? '' : String(d)
  })

  useEffect(() => {
    const d = displayWeight(value_kg, unit)
    const next = d == null ? '' : String(d)
    setText(prev => (prev === '' && d == null ? prev : next === prev ? prev : next))
  }, [value_kg, unit])

  const handleChange = (raw: string) => {
    const cleaned = raw.replace(',', '.').replace(/[^0-9.]/g, '')
    setText(cleaned)
    if (cleaned === '' || cleaned === '.') {
      onChangeKg(null)
      return
    }
    const parsed = parseFloat(cleaned)
    if (Number.isNaN(parsed)) {
      onChangeKg(null)
      return
    }
    onChangeKg(storageWeight(parsed, unit))
  }

  return (
    <View style={[styles.row, style]}>
      <TextInput
        style={[styles.input, inputStyle]}
        value={text}
        onChangeText={handleChange}
        placeholder={placeholder}
        keyboardType="decimal-pad"
        editable={editable}
      />
      {showSuffix && <Text style={styles.suffix}>{unit}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 16 },
  suffix: { color: '#888', fontSize: 14, minWidth: 24 },
})
