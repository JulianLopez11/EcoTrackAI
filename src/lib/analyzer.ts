import type { AnalysisResponse, ExtractedActivity } from '../types'
import { validateExtraction } from './schema'

const wordNumbers: Record<string, number> = { un: 1, una: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10 }
const parseQuantity = (raw: string) => wordNumbers[raw.toLowerCase()] ?? Number(raw.replace(',', '.'))
const findQuantity = (text: string, patterns: RegExp[]) => { for (const pattern of patterns) { const match = text.match(pattern); if (match?.[1]) { const value = parseQuantity(match[1]); if (Number.isFinite(value)) return value } } return null }
const amount = '(\\d+(?:[.,]\\d+)?|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)'

export function analyzeLocally(input: string): ExtractedActivity {
  const electricity = findQuantity(input, [new RegExp(`${amount}\\s*kwh\\b`, 'i')])
  const vehicles = findQuantity(input, [new RegExp(`${amount}\\s*(?:camionetas?|veh[ií]culos?|carros?|furgones?)`, 'i')])
  const distance = findQuantity(input, [new RegExp(`${amount}\\s*km\\b`, 'i')])
  const gasoline = findQuantity(input, [new RegExp(`${amount}\\s*(?:litros?|l)\\s*(?:de\\s*)?gasolina`, 'i'), new RegExp(`gasolina[^\\d]{0,20}${amount}\\s*(?:litros?|l)`, 'i')])
  const diesel = findQuantity(input, [new RegExp(`${amount}\\s*(?:litros?|l)\\s*(?:de\\s*)?di[eé]sel`, 'i'), new RegExp(`di[eé]sel[^\\d]{0,20}${amount}\\s*(?:litros?|l)`, 'i')])
  const waste = findQuantity(input, [new RegExp(`${amount}\\s*kg\\s*(?:de\\s*)?(?:residuos?|basura|desechos?)`, 'i'), new RegExp(`(?:residuos?|basura|desechos?)[^\\d]{0,25}${amount}\\s*kg`, 'i')])
  const measurements = [electricity, vehicles, distance, gasoline, diesel, waste].filter(value => value !== null).length
  return { electricity_kwh: electricity, vehicles, distance_km: distance, gasoline_liters: gasoline, diesel_liters: diesel, waste_kg: waste, additional_activities: [], confidence: measurements ? Math.min(0.95, 0.55 + measurements * 0.1) : 0.2 }
}

async function analyzeRemotely(input: string): Promise<ExtractedActivity> {
  const response = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: input }) })
  if (!response.ok) throw new Error('AI_SERVICE_UNAVAILABLE')
  const data = validateExtraction(await response.json())
  if (!data) throw new Error('AI_RESPONSE_INVALID')
  return data
}

export async function analyzeBusinessText(input: string): Promise<AnalysisResponse> {
  const mode = import.meta.env.VITE_AI_MODE === 'real' ? 'real' : 'mock'
  if (mode === 'mock') return { data: analyzeLocally(input), mode }
  try { return { data: await analyzeRemotely(input), mode } } catch { return { data: analyzeLocally(input), mode: 'mock', fallbackNotice: 'No pudimos contactar la IA en este momento. Usamos el análisis local para darte una estimación.' } }
}
