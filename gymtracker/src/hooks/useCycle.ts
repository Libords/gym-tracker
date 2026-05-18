import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { CycleLog, CycleInfo } from '../types/cycle'
import { calcCycleInfo } from '../types/cycle'

export function useCycleLogs() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<CycleLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('cycle_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('period_start', { ascending: false })
    setLogs(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const addLog = async (
    period_start: string,
    cycle_length: number,
    period_length: number,
    notes?: string
  ) => {
    if (!user) return
    const { data } = await supabase
      .from('cycle_logs')
      .insert({ user_id: user.id, period_start, cycle_length, period_length, notes: notes ?? null })
      .select()
      .single()
    if (data) setLogs(prev => [data, ...prev].sort((a, b) => b.period_start.localeCompare(a.period_start)))
  }

  const deleteLog = async (id: string) => {
    await supabase.from('cycle_logs').delete().eq('id', id)
    setLogs(prev => prev.filter(l => l.id !== id))
  }

  // Derive current cycle info from the most recent log
  const cycleInfo: CycleInfo | null =
    logs.length > 0
      ? calcCycleInfo(logs[0].period_start, logs[0].cycle_length, logs[0].period_length)
      : null

  // Latest cycle settings (for default values in form)
  const latestCycleLength = logs[0]?.cycle_length ?? 28
  const latestPeriodLength = logs[0]?.period_length ?? 5

  return {
    logs,
    loading,
    addLog,
    deleteLog,
    cycleInfo,
    latestCycleLength,
    latestPeriodLength,
  }
}
