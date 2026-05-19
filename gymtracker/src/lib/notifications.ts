import * as Notifications from 'expo-notifications'

export const REST_DONE_NOTIFICATION = {
  title: 'Konec pauzy',
  body: 'Pokračuj v tréninku',
} as const

export type PermissionStatus = 'granted' | 'denied' | 'undetermined'

function mapStatus(s: Notifications.PermissionStatus): PermissionStatus {
  if (s === 'granted') return 'granted'
  if (s === 'denied') return 'denied'
  return 'undetermined'
}

export function setupNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  })
}

export async function getPermissionStatus(): Promise<PermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync()
  return mapStatus(status)
}

export async function requestPermissions(): Promise<PermissionStatus> {
  const { status } = await Notifications.requestPermissionsAsync()
  return mapStatus(status)
}

export async function scheduleRestDoneNotification(afterSeconds: number): Promise<string | null> {
  const status = await getPermissionStatus()
  if (status !== 'granted') return null
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: REST_DONE_NOTIFICATION.title,
        body: REST_DONE_NOTIFICATION.body,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(1, Math.floor(afterSeconds)),
      },
    })
    return id
  } catch {
    return null
  }
}

export async function cancelScheduledNotification(id: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(id)
  } catch {
    // ignore — already fired or not found
  }
}
