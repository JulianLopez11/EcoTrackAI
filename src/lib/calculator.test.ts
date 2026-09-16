import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateCarbonFootprint } from './calculator'
import type { ExtractedActivity } from '../types'

const activity = (overrides: Partial<ExtractedActivity>): ExtractedActivity => ({ electricity_kwh: null, vehicles: null, distance_km: null, gasoline_liters: null, diesel_liters: null, waste_kg: null, additional_activities: [], confidence: 0.9, ...overrides })
test('calculates electricity, fuel and waste with simplified factors', () => { const result = calculateCarbonFootprint(activity({ electricity_kwh: 200, gasoline_liters: 40, waste_kg: 100 })); assert.deepEqual(result.breakdown, { electricity: 84, transport: 92.4, waste: 45 }); assert.equal(result.total_co2e_kg, 221.4); assert.equal(result.main_source, 'transport') })
test('does not double count distance when direct fuel exists', () => { const result = calculateCarbonFootprint(activity({ gasoline_liters: 40, distance_km: 300 })); assert.equal(result.breakdown.transport, 92.4) })
test('uses distance when fuel is not given', () => { const result = calculateCarbonFootprint(activity({ distance_km: 300 })); assert.equal(result.breakdown.transport, 75); assert.equal(result.percentages.transport, 100) })
