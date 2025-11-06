import { describe, it, expect } from 'vitest'
import { forecastCapitalUSD, estAnnualIncomeUSD } from '@/lib/math'

describe('math', () => {
  it('forecast roi=0.08, initial=0, one period: years=10, monthly=1000 ≈ 180124.63', () => {
    const v = forecastCapitalUSD(0.08, {
      initialUSD: 0,
      periods: [{ years: 10, monthly: 1000 }],
      capRate: 0.1
    })
    expect(Math.abs(v - 180124.63)).toBeLessThan(0.5)
  })

  it('forecast roi=0 linear when rm=0', () => {
    const v = forecastCapitalUSD(0, {
      initialUSD: 0,
      periods: [{ years: 10, monthly: 1000 }],
      capRate: 0.1
    })
    expect(v).toBe(120000)
  })

  it('forecast with two periods: years1=5, monthly1=3000, years2=15, monthly2=1000', () => {
    const v = forecastCapitalUSD(0.08, {
      initialUSD: 0,
      periods: [
        { years: 5, monthly: 3000 },
        { years: 15, monthly: 1000 }
      ],
      capRate: 0.1
    })
    expect(v).toBeGreaterThan(0)
  })

  it('forecast ignores inactive periods (monthly=0)', () => {
    const v1 = forecastCapitalUSD(0.08, {
      initialUSD: 0,
      periods: [{ years: 10, monthly: 1000 }],
      capRate: 0.1
    })
    const v2 = forecastCapitalUSD(0.08, {
      initialUSD: 0,
      periods: [
        { years: 10, monthly: 1000 },
        { years: 15, monthly: 0 }
      ],
      capRate: 0.1
    })
    expect(v1).toBe(v2)
  })

  it('forecast ignores inactive periods (years=0)', () => {
    const v1 = forecastCapitalUSD(0.08, {
      initialUSD: 0,
      periods: [{ years: 10, monthly: 1000 }],
      capRate: 0.1
    })
    const v2 = forecastCapitalUSD(0.08, {
      initialUSD: 0,
      periods: [
        { years: 10, monthly: 1000 },
        { years: 0, monthly: 1000 }
      ],
      capRate: 0.1
    })
    expect(v1).toBe(v2)
  })

  it('forecast with multiple periods', () => {
    const v = forecastCapitalUSD(0.08, {
      initialUSD: 1000,
      periods: [
        { years: 5, monthly: 1000 },
        { years: 10, monthly: 2000 },
        { years: 5, monthly: 500 }
      ],
      capRate: 0.1
    })
    expect(v).toBeGreaterThan(0)
  })

  it('annual income uses min(roi, capRate)', () => {
    const inputs = {
      initialUSD: 0,
      periods: [{ years: 10, monthly: 1000 }],
      capRate: 0.1
    }
    const v = estAnnualIncomeUSD(0.08, inputs)
    const forecast = forecastCapitalUSD(0.08, inputs)
    expect(v).toBeCloseTo(forecast * 0.08, 10)
  })
})

