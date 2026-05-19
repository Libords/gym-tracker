import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = '@gymtracker/restTimer'

export type PersistedRestTimer = {
  workoutId: string
  startedAt: string
  durationSec: number
  scheduledNotificationId: string | null
}

export async function load(): Promise<PersistedRestTimer | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedRestTimer
    if (
      typeof parsed?.workoutId === 'string' &&
      typeof parsed?.startedAt === 'string' &&
      typeof parsed?.durationSec === 'number'
    ) return parsed
    return null
  } catch {
    return null
  }
}

export async function save(state: PersistedRestTimer): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(state))
}

export async function clear(): Promise<void> {
  await AsyncStorage.removeItem(KEY)
}
