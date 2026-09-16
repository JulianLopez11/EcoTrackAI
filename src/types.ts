export type Source = 'electricity' | 'transport' | 'waste' | 'other'
export interface AdditionalActivity { name: string; value: number | null; unit: string | null }
export interface ExtractedActivity { electricity_kwh: number | null; vehicles: number | null; distance_km: number | null; gasoline_liters: number | null; diesel_liters: number | null; waste_kg: number | null; additional_activities: AdditionalActivity[]; confidence: number }
export interface EmissionItem { source: Source; label: string; kgCO2e: number }
export interface Analysis { id: string; createdAt: string; input: string; extracted: ExtractedActivity; emissions: EmissionItem[]; total: number; primary: EmissionItem; recommendations: string[]; notice?: string }
export interface CarbonFootprintResult { total_co2e_kg: number; breakdown: Record<'electricity' | 'transport' | 'waste', number>; percentages: Record<'electricity' | 'transport' | 'waste', number>; main_source: 'electricity' | 'transport' | 'waste' | null }
export interface AnalysisResponse { data: ExtractedActivity; mode: 'mock' | 'real'; fallbackNotice?: string }
