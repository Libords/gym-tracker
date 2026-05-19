// Contract: Rest Timer (US2)
// Feature: 001-workout-ux-polish
// Implementace v gymtracker/src/hooks/useRestTimer.ts + lib/notifications.ts + lib/restTimerStorage.ts.

// ---------- Persistovaný stav ----------

export type PersistedRestTimer = {
  workoutId: string
  startedAt: string  // ISO timestamp (Date.now() -> new Date().toISOString())
  durationSec: number
  scheduledNotificationId: string | null  // null pokud OS notifikace zakázané
}

// ---------- Runtime stav ----------

export type RestTimerState =
  | { status: 'idle' }
  | { status: 'running'; startedAt: number; durationSec: number; remainingSec: number; scheduledNotificationId: string | null }
  | { status: 'paused'; remainingSec: number; scheduledNotificationId: string | null }
  | { status: 'done' }  // efemérní stav 1 tick, automaticky přechází na 'idle'

// ---------- Notifikace text (locked v clarification) ----------

export const REST_DONE_NOTIFICATION = {
  title: 'Konec pauzy',
  body: 'Pokračuj v tréninku',
} as const

// ---------- Hook signatura ----------

export type UseRestTimer = {
  state: RestTimerState
  // Default délka (z profilu uživatele, fallback 90)
  defaultDurationSec: number

  start: (workoutId: string, durationSec?: number) => Promise<void>
  extend: (deltaSec: number) => Promise<void>  // typicky +15
  pause: () => Promise<void>
  resume: () => Promise<void>
  skip: () => Promise<void>  // smaže storage + cancel notification + state -> idle
  reset: () => Promise<void> // re-start na původní durationSec

  // Permission handshake (volá se při prvním start)
  ensureNotificationPermission: () => Promise<'granted' | 'denied' | 'undetermined'>
}

// ---------- Storage API (lib/restTimerStorage.ts) ----------

export type RestTimerStorage = {
  load: () => Promise<PersistedRestTimer | null>
  save: (state: PersistedRestTimer) => Promise<void>
  clear: () => Promise<void>
}

// ---------- Notifications API (lib/notifications.ts) ----------

export type NotificationsAPI = {
  setupNotificationHandler: () => void  // volá se v root layoutu

  scheduleRestDoneNotification: (afterSeconds: number) => Promise<string | null>
  // null pokud permission denied; jinak vrací notification id pro cancel

  cancelScheduledNotification: (id: string) => Promise<void>

  getPermissionStatus: () => Promise<'granted' | 'denied' | 'undetermined'>
  requestPermissions: () => Promise<'granted' | 'denied' | 'undetermined'>
}
