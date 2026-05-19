import type { EquipmentChip } from '../types/workout'

export const EQUIPMENT_CHIP_LABEL_CS: Record<EquipmentChip, string> = {
  dumbbell: 'Činka',
  barbell: 'Osa',
  cable: 'Kabel',
  machine: 'Stroj',
  bodyweight: 'Vlastní váha',
  kettlebell: 'Kettlebell',
  bands: 'Bands',
  other: 'Žádné/Other',
}

export const EQUIPMENT_CHIPS: EquipmentChip[] = [
  'dumbbell',
  'barbell',
  'cable',
  'machine',
  'bodyweight',
  'kettlebell',
  'bands',
  'other',
]

const RAW_TO_CHIP: Record<string, EquipmentChip> = {
  'dumbbell': 'dumbbell',
  'dumbbells': 'dumbbell',
  'barbell': 'barbell',
  'e-z curl bar': 'barbell',
  'ez curl bar': 'barbell',
  'cable': 'cable',
  'cables': 'cable',
  'machine': 'machine',
  'leverage machine': 'machine',
  'smith machine': 'machine',
  'body only': 'bodyweight',
  'bodyweight': 'bodyweight',
  'body weight': 'bodyweight',
  'kettlebell': 'kettlebell',
  'kettlebells': 'kettlebell',
  'bands': 'bands',
  'resistance band': 'bands',
  'exercise ball': 'other',
  'medicine ball': 'other',
  'foam roll': 'other',
  'other': 'other',
}

export function mapEquipmentToChip(raw: string | null | undefined): EquipmentChip {
  if (!raw) return 'other'
  const key = raw.trim().toLowerCase()
  return RAW_TO_CHIP[key] ?? 'other'
}
