import { useCallback } from 'react'
import { useProfile } from './useProfile'
import type { Unit } from '../types/workout'

export function useUnitPreference() {
  const { profile, updateProfile } = useProfile()
  const unit: Unit = profile?.preferred_unit ?? 'kg'

  const setUnit = useCallback(
    async (next: Unit) => {
      await updateProfile({ preferred_unit: next })
    },
    [updateProfile],
  )

  return { unit, setUnit }
}
