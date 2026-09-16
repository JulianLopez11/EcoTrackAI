import express from 'express'
import { validateExtraction } from '../src/lib/schema.js'

const app = express(); app.use(express.json({ limit: '16kb' }))
const port = Number(process.env.PORT ?? 8787)
const schema = { type: 'object', additionalProperties: false, required: ['electricity_kwh', 'vehicles', 'distance_km', 'gasoline_liters', 'diesel_liters', 'waste_kg', 'additional_activities', 'confidence'], properties: { electricity_kwh: { type: ['number', 'null'] }, vehicles: { type: ['number', 'null'] }, distance_km: { type: ['number', 'null'] }, gasoline_liters: { type: ['number', 'null'] }, diesel_liters: { type: ['number', 'null'] }, waste_kg: { type: ['number', 'null'] }, additional_activities: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['name', 'value', 'unit'], properties: { name: { type: 'string' }, value: { type: ['number', 'null'] }, unit: { type: ['string', 'null'] } } } }, confidence: { type: 'number' } } }

app.post('/api/analyze', async (request, response) => {
  const text = request.body?.text
  if (typeof text !== 'string' || text.trim().length < 3) return response.status(400).json({ error: 'Describe una actividad para poder analizarla.' })
  if (process.env.AI_MODE !== 'real' || !process.env.OPENAI_API_KEY) return response.status(503).json({ error: 'El modo de IA real no está configurado.' })
  try {
    const apiResponse = await fetch(`${process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1'}/chat/completions`, { method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: process.env.OPENAI_MODEL ?? 'gpt-4.1-mini', temperature: 0, response_format: { type: 'json_schema', json_schema: { name: 'ecotrack_extraction', strict: true, schema } }, messages: [{ role: 'system', content: 'Extrae datos de emisiones de un texto de negocio en español. Devuelve solo JSON según el esquema. Usa null cuando un dato no esté explícito. No inventes cantidades.' }, { role: 'user', content: text }] }) })
    if (!apiResponse.ok) throw new Error(`Provider returned ${apiResponse.status}`)
    const payload = await apiResponse.json() as { choices?: Array<{ message?: { content?: string } }> }; const content = payload.choices?.[0]?.message?.content
    const data = content ? validateExtraction(JSON.parse(content)) : null
    if (!data) throw new Error('Invalid structured response')
    return response.json(data)
  } catch (error) { console.error('AI analysis failed:', error instanceof Error ? error.message : 'unknown error'); return response.status(502).json({ error: 'La IA no pudo analizar el texto en este momento.' }) }
})

app.listen(port, () => console.log(`EcoTrack AI server listening on http://localhost:${port}`))
