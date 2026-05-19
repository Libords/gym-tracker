import { useCallback, useState } from 'react'
import { mapEquipmentToChip } from '../lib/equipmentMapping'
import type { EquipmentChip } from '../types/workout'

export type ExerciseFilters = {
  bodyPart: string         // 'Vše' or specific body_part value
  search: string
  equipmentChips: EquipmentChip[]
}

const INITIAL: ExerciseFilters = {
  bodyPart: 'Vše',
  search: '',
  equipmentChips: [],
}

export function useExerciseFilters() {
  const [filters, setFilters] = useState<ExerciseFilters>(INITIAL)

  const setBodyPart = useCallback((next: string) => {
    setFilters(prev => ({ ...prev, bodyPart: next }))
  }, [])

  const setSearch = useCallback((next: string) => {
    setFilters(prev => ({ ...prev, search: next }))
  }, [])

  const toggleEquipmentChip = useCallback((chip: EquipmentChip) => {
    setFilters(prev => {
      const has = prev.equipmentChips.includes(chip)
      return {
        ...prev,
        equipmentChips: has
          ? prev.equipmentChips.filter(c => c !== chip)
          : [...prev.equipmentChips, chip],
      }
    })
  }, [])

  const clearEquipmentChips = useCallback(() => {
    setFilters(prev => ({ ...prev, equipmentChips: [] }))
  }, [])

  const reset = useCallback(() => setFilters(INITIAL), [])

  const applyFilters = useCallback(
    <T extends { name?: string; equipment: string | null; body_part: string | null }>(
      exercises: T[],
    ): T[] => {
      const { bodyPart, search, equipmentChips } = filters
      const q = search.trim().toLowerCase()
      return exercises.filter(e => {
        if (bodyPart !== 'Vše' && e.body_part !== bodyPart) return false
        if (q && !(e.name ?? '').toLowerCase().includes(q)) return false
        if (equipmentChips.length > 0) {
          const chip = mapEquipmentToChip(e.equipment)
          if (!equipmentChips.includes(chip)) return false
        }
        return true
      })
    },
    [filters],
  )

  return {
    filters,
    setBodyPart,
    setSearch,
    toggleEquipmentChip,
    clearEquipmentChips,
    reset,
    applyFilters,
  }
}
