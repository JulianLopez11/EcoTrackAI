import assert from 'node:assert/strict'
import test from 'node:test'
import { analyzeLocally } from './analyzer'

test('extracts common local business measurements', () => {
  const data = analyzeLocally('Usamos 200 kWh, 5 camionetas, recorrimos 300 km, compramos 40 litros de gasolina y generamos 100 kg de residuos.')
  assert.equal(data.electricity_kwh, 200); assert.equal(data.vehicles, 5); assert.equal(data.distance_km, 300); assert.equal(data.gasoline_liters, 40); assert.equal(data.diesel_liters, null); assert.equal(data.waste_kg, 100)
})
test('recognizes written quantities and diesel separately', () => { const data = analyzeLocally('Dos vehículos usaron 25 litros de diésel.'); assert.equal(data.vehicles, 2); assert.equal(data.diesel_liters, 25); assert.equal(data.gasoline_liters, null) })
