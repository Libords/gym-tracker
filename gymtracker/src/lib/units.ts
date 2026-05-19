import type { Unit } from '../types/workout'

export const LB_PER_KG = 2.20462

export const kgToLb = (kg: number): number => kg * LB_PER_KG
export const lbToKg = (lb: number): number => lb / LB_PER_KG

const round1 = (n: number): number => Math.round(n * 10) / 10

export type FormatWeightOpts = {
  decimals?: number
  suffix?: boolean
}

export function formatWeight(
  kg: number | null,
  unit: Unit,
  opts: FormatWeightOpts = {},
): string {
  if (kg == null) return '—'
  const decimals = opts.decimals ?? 1
  const value = unit === 'lb' ? kgToLb(kg) : kg
  const rounded = decimals === 1 ? round1(value) : Number(value.toFixed(decimals))
  const text = decimals === 0 ? String(Math.round(value)) : rounded.toFixed(decimals).replace(/\.0$/, '')
  return opts.suffix === false ? text : `${text} ${unit}`
}

export function displayWeight(kg: number | null, unit: Unit): number | null {
  if (kg == null) return null
  return round1(unit === 'lb' ? kgToLb(kg) : kg)
}

export function storageWeight(display: number | null, unit: Unit): number | null {
  if (display == null) return null
  return unit === 'lb' ? lbToKg(display) : display
}
