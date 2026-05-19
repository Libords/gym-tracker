// Contract: Equipment Filter / Mapping (US4)
// Feature: 001-workout-ux-polish
// Implementace v gymtracker/src/lib/equipmentMapping.ts + components/EquipmentChips.tsx + hooks/useExerciseFilters.ts.

// ---------- Canonical chip enum (FR-040) ----------

export type EquipmentChip =
  | 'dumbbell'
  | 'barbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'kettlebell'
  | 'bands'
  | 'other'

// ---------- České UI labely (FR-050) ----------

export const EQUIPMENT_CHIP_LABEL_CS: Record<EquipmentChip, string> = {
  dumbbell:   'Činka',
  barbell:    'Osa',
  cable:      'Kabel',
  machine:    'Stroj',
  bodyweight: 'Vlastní váha',
  kettlebell: 'Kettlebell',
  bands:      'Bands',
  other:      'Žádné/Other',
}

// ---------- Mapping API (FR-044) ----------

// Lookup tabulka raw exercises.equipment hodnot → canonical chip.
// Rozšiřitelná bez UI změn; nemapované hodnoty → 'other'.
export type EquipmentMapping = Record<string, EquipmentChip>

export type EquipmentMappingAPI = {
  mapping: EquipmentMapping
  mapEquipmentToChip: (raw: string | null | undefined) => EquipmentChip
}

// ---------- Filter hook (US4) ----------

export type ExerciseFilters = {
  bodyParts: string[]       // existing filter
  equipmentChips: EquipmentChip[]  // NEW — multi-select, AND s bodyParts
}

export type UseExerciseFilters = {
  filters: ExerciseFilters
  setBodyParts: (next: string[]) => void
  toggleEquipmentChip: (chip: EquipmentChip) => void
  clearEquipmentChips: () => void
  applyFilters: (exercises: Array<{ equipment: string | null; body_part: string | null }>) => typeof exercises
}
