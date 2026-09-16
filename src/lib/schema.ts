import type { AdditionalActivity, ExtractedActivity } from '../types'

const nullableNumber = (value: unknown): number | null | undefined => value === null ? null : typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined

export function validateExtraction(value: unknown): ExtractedActivity | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as Record<string, unknown>; const fields = ['electricity_kwh', 'vehicles', 'distance_km', 'gasoline_liters', 'diesel_liters', 'waste_kg'] as const
  const parsed = fields.map(field => nullableNumber(record[field]))
  if (parsed.some(field => field === undefined) || typeof record.confidence !== 'number' || !Number.isFinite(record.confidence) || record.confidence < 0 || record.confidence > 1) return null
  if (!Array.isArray(record.additional_activities) || !record.additional_activities.every(isAdditionalActivity)) return null
  return { electricity_kwh: parsed[0]!, vehicles: parsed[1]!, distance_km: parsed[2]!, gasoline_liters: parsed[3]!, diesel_liters: parsed[4]!, waste_kg: parsed[5]!, additional_activities: record.additional_activities, confidence: record.confidence }
}
function isAdditionalActivity(value: unknown): value is AdditionalActivity { if (!value || typeof value !== 'object' || Array.isArray(value)) return false; const item = value as Record<string, unknown>; const quantity = nullableNumber(item.value); return typeof item.name === 'string' && quantity !== undefined && (typeof item.unit === 'string' || item.unit === null) }
