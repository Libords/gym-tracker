import { useCallback, useEffect, useRef, useState } from 'react'
import * as Haptics from 'expo-haptics'
import { useProfile } from './useProfile'
import {
  getPermissionStatus,
  requestPermissions,
  scheduleRestDoneNotification,
  cancelScheduledNotification,
  type PermissionStatus,
} from '../lib/notifications'
import {
  load as loadPersisted,
  save as savePersisted,
  clear as clearPersisted,
  type PersistedRestTimer,
} from '../lib/restTimerStorage'

export type RestTimerState =
  | { status: 'idle' }
  | { status: 'running'; workoutId: string; startedAt: number; durationSec: number; remainingSec: number; scheduledNotificationId: string | null }
  | { status: 'paused'; workoutId: string; durationSec: number; remainingSec: number; scheduledNotificationId: null }
  | { status: 'done' }

const DEFAULT_REST = 90

export function useRestTimer() {
  const { profile } = useProfile()
  const defaultDurationSec = profile?.default_rest_seconds ?? DEFAULT_REST
  const [state, setState] = useState<RestTimerState>({ status: 'idle' })
  const stateRef = useRef<RestTimerState>(state)
  stateRef.current = state
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const doneFiredRef = useRef(false)

  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const triggerDoneFeedback = () => {
    if (doneFiredRef.current) return
    doneFiredRef.current = true
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
  }

  const startInterval = useCallback(() => {
    stopInterval()
    intervalRef.current = setInterval(() => {
      const cur = stateRef.current
      if (cur.status !== 'running') {
        stopInterval()
        return
      }
      const elapsed = Math.floor((Date.now() - cur.startedAt) / 1000)
      const remaining = cur.durationSec - elapsed
      if (remaining <= 0) {
        stopInterval()
        triggerDoneFeedback()
        clearPersisted().catch(() => {})
        setState({ status: 'done' })
        // ephemeral; flip to idle next tick
        setTimeout(() => setState({ status: 'idle' }), 800)
      } else {
        setState({ ...cur, remainingSec: remaining })
      }
    }, 500)
  }, [])

  // Mount: try restore from storage
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const persisted = await loadPersisted()
      if (cancelled || !persisted) return
      const elapsed = (Date.now() - new Date(persisted.startedAt).getTime()) / 1000
      const remaining = persisted.durationSec - elapsed
      if (remaining <= 0) {
        await clearPersisted()
        return
      }
      doneFiredRef.current = false
      setState({
        status: 'running',
        workoutId: persisted.workoutId,
        startedAt: new Date(persisted.startedAt).getTime(),
        durationSec: persisted.durationSec,
        remainingSec: Math.ceil(remaining),
        scheduledNotificationId: persisted.scheduledNotificationId,
      })
      startInterval()
    })()
    return () => { cancelled = true; stopInterval() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const ensureNotificationPermission = useCallback(async (): Promise<PermissionStatus> => {
    let status = await getPermissionStatus()
    if (status === 'undetermined') {
      status = await requestPermissions()
    }
    return status
  }, [])

  const persistRunning = async (workoutId: string, startedAt: number, durationSec: number, notifId: string | null) => {
    const persisted: PersistedRestTimer = {
      workoutId,
      startedAt: new Date(startedAt).toISOString(),
      durationSec,
      scheduledNotificationId: notifId,
    }
    await savePersisted(persisted)
  }

  const start = useCallback(async (workoutId: string, durationSec?: number) => {
    const dur = durationSec ?? defaultDurationSec
    // Cancel any existing scheduled notif
    const prev = stateRef.current
    if ((prev.status === 'running' || prev.status === 'paused') && prev.scheduledNotificationId) {
      await cancelScheduledNotification(prev.scheduledNotificationId)
    }
    await ensureNotificationPermission()
    const notifId = await scheduleRestDoneNotification(dur)
    const startedAt = Date.now()
    doneFiredRef.current = false
    setState({
      status: 'running',
      workoutId,
      startedAt,
      durationSec: dur,
      remainingSec: dur,
      scheduledNotificationId: notifId,
    })
    await persistRunning(workoutId, startedAt, dur, notifId)
    startInterval()
  }, [defaultDurationSec, ensureNotificationPermission, startInterval])

  const extend = useCallback(async (deltaSec: number) => {
    const cur = stateRef.current
    if (cur.status !== 'running') return
    if (cur.scheduledNotificationId) await cancelScheduledNotification(cur.scheduledNotificationId)
    const newDuration = cur.durationSec + deltaSec
    const elapsed = (Date.now() - cur.startedAt) / 1000
    const newRemaining = newDuration - elapsed
    if (newRemaining <= 0) return
    const notifId = await scheduleRestDoneNotification(Math.ceil(newRemaining))
    setState({
      ...cur,
      durationSec: newDuration,
      remainingSec: Math.ceil(newRemaining),
      scheduledNotificationId: notifId,
    })
    await persistRunning(cur.workoutId, cur.startedAt, newDuration, notifId)
  }, [])

  const pause = useCallback(async () => {
    const cur = stateRef.current
    if (cur.status !== 'running') return
    if (cur.scheduledNotificationId) await cancelScheduledNotification(cur.scheduledNotificationId)
    stopInterval()
    setState({
      status: 'paused',
      workoutId: cur.workoutId,
      durationSec: cur.durationSec,
      remainingSec: cur.remainingSec,
      scheduledNotificationId: null,
    })
    await clearPersisted()
  }, [])

  const resume = useCallback(async () => {
    const cur = stateRef.current
    if (cur.status !== 'paused') return
    const dur = cur.remainingSec
    const notifId = await scheduleRestDoneNotification(dur)
    const startedAt = Date.now()
    doneFiredRef.current = false
    setState({
      status: 'running',
      workoutId: cur.workoutId,
      startedAt,
      durationSec: cur.durationSec,
      remainingSec: dur,
      scheduledNotificationId: notifId,
    })
    await persistRunning(cur.workoutId, startedAt, cur.durationSec, notifId)
    startInterval()
  }, [startInterval])

  const skip = useCallback(async () => {
    const cur = stateRef.current
    if ((cur.status === 'running' || cur.status === 'paused') && cur.scheduledNotificationId) {
      await cancelScheduledNotification(cur.scheduledNotificationId)
    }
    stopInterval()
    await clearPersisted()
    setState({ status: 'idle' })
  }, [])

  const reset = useCallback(async () => {
    const cur = stateRef.current
    if (cur.status !== 'running' && cur.status !== 'paused') return
    const workoutId = cur.workoutId
    const duration = cur.durationSec
    if (cur.scheduledNotificationId) await cancelScheduledNotification(cur.scheduledNotificationId)
    await start(workoutId, duration)
  }, [start])

  return {
    state,
    defaultDurationSec,
    start,
    extend,
    pause,
    resume,
    skip,
    reset,
    ensureNotificationPermission,
  }
}
