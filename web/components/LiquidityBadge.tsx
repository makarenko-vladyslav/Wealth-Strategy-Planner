import { OptionRow } from '@/types'

const MAP: Record<OptionRow['liquidity'], { t: string; b: string }> = {
  Висока: { t: 'text-green-600', b: 'bg-neutral-100 dark:bg-neutral-800' },
  Середня: { t: 'text-yellow-600', b: 'bg-neutral-100 dark:bg-neutral-800' },
  Низька: { t: 'text-red-600', b: 'bg-neutral-100 dark:bg-neutral-800' }
}

export const LiquidityBadge = ({ value }: { value: OptionRow['liquidity'] }) => {
  const c = MAP[value]
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${c.b} ${c.t}`}>{value}</span>
}

