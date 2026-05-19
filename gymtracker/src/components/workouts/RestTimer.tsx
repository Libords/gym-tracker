import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import type { RestTimerState } from '../../hooks/useRestTimer'

type Props = {
  state: RestTimerState
  onExtend: (deltaSec: number) => void
  onPause: () => void
  onResume: () => void
  onSkip: () => void
}

function fmt(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function RestTimer({ state, onExtend, onPause, onResume, onSkip }: Props) {
  if (state.status === 'idle' || state.status === 'done') return null

  const isPaused = state.status === 'paused'
  const remaining = state.remainingSec
  const totalSec = state.durationSec
  const pct = totalSec > 0 ? Math.max(0, Math.min(100, (remaining / totalSec) * 100)) : 0

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{isPaused ? 'Pauza' : 'Odpočinek'}</Text>
          <Text style={styles.countdown}>{fmt(remaining)}</Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${pct}%` }]} />
          </View>
        </View>
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.btn} onPress={() => onExtend(15)} disabled={isPaused}>
          <Text style={styles.btnText}>+15 s</Text>
        </TouchableOpacity>
        {isPaused ? (
          <TouchableOpacity style={styles.btn} onPress={onResume}>
            <Text style={styles.btnText}>Pokračovat</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.btn} onPress={onPause}>
            <Text style={styles.btnText}>Pauza</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.btn, styles.btnSkip]} onPress={onSkip}>
          <Text style={[styles.btnText, styles.btnSkipText]}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 14,
    padding: 16,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  label: { color: '#94a3b8', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  countdown: { color: '#fff', fontSize: 40, fontWeight: '700', marginTop: 2, fontVariant: ['tabular-nums'] },
  barBg: { height: 4, backgroundColor: '#334155', borderRadius: 2, marginTop: 8, overflow: 'hidden' },
  barFill: { height: 4, backgroundColor: '#22c55e', borderRadius: 2 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  btn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#334155', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
  btnSkip: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#475569' },
  btnSkipText: { color: '#cbd5e1' },
})
