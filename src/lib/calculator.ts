import { EMISSION_FACTORS as F } from './factors'
import type { CarbonFootprintResult, EmissionItem, ExtractedActivity } from '../types'

const round = (value: number) => Math.round(value * 10) / 10

export function calculateCarbonFootprint(data: ExtractedActivity): CarbonFootprintResult {
  const electricity = (data.electricity_kwh ?? 0) * F.electricity_kg_per_kwh
  const directFuel = (data.gasoline_liters ?? 0) * F.gasoline_kg_per_liter + (data.diesel_liters ?? 0) * F.diesel_kg_per_liter
  // Liters are more specific than distance, so distance is only estimated when fuel is absent.
  const distanceEstimate = directFuel > 0 ? 0 : (data.distance_km ?? 0) * F.vehicle_distance_kg_per_km
  const transport = directFuel || distanceEstimate
  const waste = (data.waste_kg ?? 0) * F.waste_kg_per_kg
  const breakdown = { electricity: round(electricity), transport: round(transport), waste: round(waste) }
  const total = round(electricity + transport + waste)
  const percentages = { electricity: total ? round(breakdown.electricity / total * 100) : 0, transport: total ? round(breakdown.transport / total * 100) : 0, waste: total ? round(breakdown.waste / total * 100) : 0 }
  const sources = Object.entries(breakdown) as ['electricity' | 'transport' | 'waste', number][]
  const main = total ? sources.reduce((highest, source) => source[1] > highest[1] ? source : highest)[0] : null
  return { total_co2e_kg: total, breakdown, percentages, main_source: main }
}

export function emissionItemsFromFootprint(result: CarbonFootprintResult): EmissionItem[] {
  const items: EmissionItem[] = [{ source: 'electricity', label: 'Electricidad', kgCO2e: result.breakdown.electricity }, { source: 'transport', label: 'Transporte', kgCO2e: result.breakdown.transport }, { source: 'waste', label: 'Residuos', kgCO2e: result.breakdown.waste }]
  return items.filter(item => item.kgCO2e > 0)
}

export function getRecommendations(data: ExtractedActivity, primary: EmissionItem) {
  const ideas: string[] = []
  if (primary.source === 'electricity' || data.electricity_kwh) ideas.push('Cambia la iluminación por LED y revisa los equipos que quedan encendidos fuera de horario.', 'Evalúa contratar energía de fuentes renovables cuando sea posible.')
  if (primary.source === 'transport' || data.distance_km || data.gasoline_liters || data.diesel_liters) ideas.push('Optimiza las rutas de entrega para recorrer menos kilómetros.', 'Consolida pedidos cercanos para reducir viajes con poca carga.')
  if (primary.source === 'waste' || data.waste_kg) ideas.push('Separa los residuos y mide qué materiales puedes reducir o reutilizar.')
  ideas.push('Registra tus actividades cada mes para identificar mejoras reales.')
  return ideas.slice(0, 4)
}
