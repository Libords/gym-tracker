import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { CycleLog, CycleInfo } from '../types/cycle'
import { calcCycleInfo } from '../types/cycle'

function deriveCycleInfo(logs: CycleLog[]): CycleInfo | null {
  if (logs.length === 0) return null
  return calcCycleInfo(logs[0].period_start, logs[0].cycle_length, logs[0].period_length)
}

export function useCycleLogs(mode: 'personal' | 'partner' = 'personal') {
  const { user } = useAuth()
  const [logs, setLogs] = useState<CycleLog[]>([])
  const [loading, setLoading] = useState(true)
  const isPartner = mode === 'partner'

  const fetchLogs = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('cycle_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_partner', isPartner)
      .order('period_start', { ascending: false })
    setLogs(data ?? [])
    setLoading(false)
  }, [user, isPartner])

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
      .insert({
        user_id: user.id,
        period_start,
        cycle_length,
        period_length,
        notes: notes ?? null,
        is_partner: isPartner,
      })
      .select()
      .single()
    if (data) setLogs(prev => [data, ...prev].sort((a, b) => b.period_start.localeCompare(a.period_start)))
  }

  const deleteLog = async (id: string) => {
    await supabase.from('cycle_logs').delete().eq('id', id)
    setLogs(prev => prev.filter(l => l.id !== id))
  }

  const cycleInfo: CycleInfo | null = deriveCycleInfo(logs)
  const latestCycleLength = logs[0]?.cycle_length ?? 28
  const latestPeriodLength = logs[0]?.period_length ?? 5

  return { logs, loading, addLog, deleteLog, cycleInfo, latestCycleLength, latestPeriodLength }
}
