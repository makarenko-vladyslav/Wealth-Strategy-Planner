import { create } from 'zustand'
import { Inputs, Period } from '@/types'
import { safeLocalStorage } from '@/lib/storage'

type InputsState = Inputs & { setAll: (v: Inputs) => void; reset: () => void }

const DEFAULTS: Inputs = {
  initialUSD: 0,
  periods: [
    { years: 10, monthly: 2000 }
  ],
  capRate: 0.1,
  inflationRate: 0.05,
  incomeTaxRate: 0.15,
  discountRate: 0.08,
  roiCap: 0.25,
  monteCarloEnabled: false
}

const migrateOldData = (data: any): Inputs => {
  if (data.periods && Array.isArray(data.periods)) {
    return {
      ...DEFAULTS,
      ...data,
      inflationRate: data.inflationRate ?? DEFAULTS.inflationRate,
      incomeTaxRate: data.incomeTaxRate ?? DEFAULTS.incomeTaxRate,
      discountRate: data.discountRate ?? DEFAULTS.discountRate,
      roiCap: data.roiCap ?? DEFAULTS.roiCap,
      monteCarloEnabled: data.monteCarloEnabled ?? DEFAULTS.monteCarloEnabled
    }
  }
  const periods: Period[] = []
  if (data.years1 !== undefined && data.monthly1 !== undefined) {
    periods.push({ years: data.years1 || 0, monthly: data.monthly1 || 0 })
  }
  if (data.years2 !== undefined && data.monthly2 !== undefined) {
    periods.push({ years: data.years2 || 0, monthly: data.monthly2 || 0 })
  }
  return {
    ...DEFAULTS,
    initialUSD: data.initialUSD ?? 0,
    periods: periods.length > 0 ? periods : DEFAULTS.periods,
    capRate: data.capRate ?? 0.1
  }
}

const isEqual = (a: Inputs, b: Inputs): boolean => {
  if (a.initialUSD !== b.initialUSD || a.capRate !== b.capRate) return false
  if (a.inflationRate !== b.inflationRate || a.incomeTaxRate !== b.incomeTaxRate) return false
  if (a.discountRate !== b.discountRate || a.roiCap !== b.roiCap) return false
  if (a.monteCarloEnabled !== b.monteCarloEnabled) return false
  if (a.periods.length !== b.periods.length) return false
  return a.periods.every((p, i) => p.years === b.periods[i]?.years && p.monthly === b.periods[i]?.monthly)
}

const getInitialData = (): Inputs => {
  const stored = safeLocalStorage.get<any>('ws.inputs', null)
  if (!stored) return DEFAULTS
  return migrateOldData(stored)
}

export const useInputs = create<InputsState>((set, get) => ({
  ...getInitialData(),
  setAll: (v) => {
    const curr = get()
    if (isEqual(curr, v)) return
    safeLocalStorage.set('ws.inputs', v)
    set(v)
  },
  reset: () => {
    if (isEqual(get(), DEFAULTS)) return
    safeLocalStorage.set('ws.inputs', DEFAULTS)
    set(DEFAULTS)
  }
}))

