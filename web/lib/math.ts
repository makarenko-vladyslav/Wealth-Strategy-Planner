import { Inputs } from '@/types'

export const forecastCapitalUSD = (roiAnnual: number, inputs: Inputs): number => {
  const rm = Math.pow(1 + roiAnnual, 1 / 12) - 1
  let capital = inputs.initialUSD

  // Фільтруємо активні періоди (де monthly > 0 і years > 0)
  const activePeriods = inputs.periods.filter((p) => p.monthly > 0 && p.years > 0)

  if (activePeriods.length === 0) {
    return capital
  }

  if (rm === 0) {
    // Лінійний розрахунок без відсотків
    for (const period of activePeriods) {
      capital += period.monthly * period.years * 12
    }
    return capital
  }

  // Розрахунок з відсотками для кожного періоду
  for (const period of activePeriods) {
    const n = period.years * 12
    const growth = Math.pow(1 + rm, n)
    // Капітал росте під ROI, плюс щомісячні внески
    capital = capital * growth + period.monthly * ((growth - 1) / rm)
  }

  return capital
}

export const estAnnualIncomeUSD = (roiAnnual: number, inputs: Inputs): number =>
  forecastCapitalUSD(roiAnnual, inputs) * Math.min(roiAnnual, inputs.capRate)

