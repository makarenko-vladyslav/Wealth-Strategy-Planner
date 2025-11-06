export type OptionRow = {
  id: number
  category: string
  subcategory: string
  name: string
  minEntryUSD: number
  roiAnnual: number
  risk: 'Дуже високий' | 'Високий' | 'Середній' | 'Низький' | 'Дуже низький'
  liquidity: 'Висока' | 'Середня' | 'Низька'
  complexity: 'Дуже висока' | 'Висока' | 'Середня' | 'Низька' | 'Дуже низька'
  notes?: string
  incomeType: 'Пасивний'
  muAnnual?: number
  sigmaAnnual?: number
}

export type Period = {
  years: number
  monthly: number
}

export type Inputs = {
  initialUSD: number
  periods: Period[]
  capRate: number
  inflationRate: number
  incomeTaxRate: number
  discountRate: number
  roiCap: number
  monteCarloEnabled: boolean
}

