import { Inputs, OptionRow } from '@/types'

export type CalculationResult = {
  forecastCapitalUSD: number
  realCapitalUSD: number
  npv: number
  annualIncomeUSD: number
  actualProfitUSD: number
  averageIncomeUSD: number
  p10?: number
  p50?: number
  p90?: number
  totalInvestedUSD: number
  totalValueUSD: number
}

const roiEffective = (roiAnnual: number, roiCap: number): number => Math.min(roiAnnual, roiCap)

const randomNormal = (): number => {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

const monteCarloSimulation = (
  initialCapital: number,
  periods: Inputs['periods'],
  muAnnual: number,
  sigmaAnnual: number,
  inputs: Inputs,
  simulations: number = 1000
): { p10: number; p50: number; p90: number } => {
  const results: number[] = []
  const muMonthly = muAnnual / 12
  const sigmaMonthly = sigmaAnnual / Math.sqrt(12)

  for (let sim = 0; sim < simulations; sim++) {
    let capital = initialCapital
    let totalMonths = 0

    for (const period of periods.filter((p) => p.monthly > 0 && p.years > 0)) {
      const months = period.years * 12
      for (let m = 0; m < months; m++) {
        const logReturn = muMonthly + sigmaMonthly * randomNormal()
        capital = capital * Math.exp(logReturn) + period.monthly
        totalMonths++
      }
    }

    results.push(capital)
  }

  results.sort((a, b) => a - b)
  return {
    p10: results[Math.floor(results.length * 0.1)],
    p50: results[Math.floor(results.length * 0.5)],
    p90: results[Math.floor(results.length * 0.9)]
  }
}

export const calculatePassive = (row: OptionRow, inputs: Inputs): CalculationResult => {
  const roiEff = roiEffective(row.roiAnnual, inputs.roiCap)
  const rm = Math.pow(1 + roiEff, 1 / 12) - 1
  let capital = inputs.initialUSD

  const activePeriods = inputs.periods.filter((p) => p.monthly > 0 && p.years > 0)

  if (activePeriods.length === 0) {
    capital = inputs.initialUSD
  } else if (rm === 0) {
    for (const period of activePeriods) {
      capital += period.monthly * period.years * 12
    }
  } else {
    for (const period of activePeriods) {
      const n = period.years * 12
      const growth = Math.pow(1 + rm, n)
      capital = capital * growth + period.monthly * ((growth - 1) / rm)
    }
  }

  let forecastCapital = capital
  let p10: number | undefined
  let p50: number | undefined
  let p90: number | undefined

  if (inputs.monteCarloEnabled && row.muAnnual !== undefined && row.sigmaAnnual !== undefined) {
    const mc = monteCarloSimulation(inputs.initialUSD, inputs.periods, row.muAnnual, row.sigmaAnnual, inputs)
    p10 = mc.p10
    p50 = mc.p50
    p90 = mc.p90
    forecastCapital = mc.p50
  }

  const totalYears = activePeriods.reduce((sum, p) => sum + p.years, 0)
  const investedCapital = inputs.initialUSD + activePeriods.reduce((sum, p) => sum + p.monthly * p.years * 12, 0)
  const actualProfit = forecastCapital - investedCapital
  const annualIncome = forecastCapital * Math.min(roiEff, inputs.capRate) * (1 - inputs.incomeTaxRate)
  const averageIncome = totalYears > 0 ? actualProfit / totalYears : 0

  const realCapital = forecastCapital / Math.pow(1 + inputs.inflationRate, totalYears)
  const npv = calculateNPV(forecastCapital, inputs.discountRate, totalYears)

  return {
    forecastCapitalUSD: forecastCapital,
    realCapitalUSD: realCapital,
    npv,
    annualIncomeUSD: annualIncome,
    actualProfitUSD: actualProfit,
    averageIncomeUSD: averageIncome,
    p10,
    p50,
    p90,
    totalInvestedUSD: investedCapital,
    totalValueUSD: forecastCapital
  }
}

const calculateNPV = (futureValue: number, discountRate: number, years: number): number => {
  if (years === 0) return futureValue
  return futureValue / Math.pow(1 + discountRate, years)
}

export const calculate = (row: OptionRow, inputs: Inputs): CalculationResult => {
  return calculatePassive(row, inputs)
}

