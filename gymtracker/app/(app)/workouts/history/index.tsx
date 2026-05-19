import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useWorkoutHistory } from '../../../../src/hooks/useWorkoutHistory'
import { HistoryDayGroup } from '../../../../src/components/workouts/HistoryDayGroup'

export default function HistoryScreen() {
  const router = useRouter()
  const { days, loading, loadingMore, hasMore, loadMore } = useWorkoutHistory()

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Zpět</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Historie</Text>
        <View style={{ width: 60 }} />
      </View>

      {days.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Zatím žádné dokončené tréninky.</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.replace('/(app)/workouts')}>
            <Text style={styles.emptyBtnText}>Začít první trénink</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={days}
          keyExtractor={d => d.date}
          renderItem={({ item }) => (
            <HistoryDayGroup
              day={item}
              onPressWorkout={(id) => router.push(`/(app)/workouts/history/${id}`)}
            />
          )}
          onEndReached={hasMore ? loadMore : undefined}
          onEndReachedThreshold={0.5}
          initialNumToRender={15}
          windowSize={5}
          removeClippedSubviews
          ListFooterComponent={loadingMore ? (
            <View style={{ paddingVertical: 16 }}><ActivityIndicator /></View>
          ) : null}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 24, gap: 12 },
  back: { color: '#2563eb', fontSize: 15, width: 60 },
  title: { flex: 1, fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { color: '#888', fontSize: 15, marginBottom: 20 },
  emptyBtn: { backgroundColor: '#2563eb', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  emptyBtnText: { color: '#fff', fontWeight: '600' },
})
