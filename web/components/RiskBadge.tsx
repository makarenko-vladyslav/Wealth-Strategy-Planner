import { OptionRow } from '@/types'

const MAP: Record<OptionRow['risk'], { t: string; b: string }> = {
  'Дуже високий': { t: 'text-red-600', b: 'bg-neutral-100 dark:bg-neutral-800' },
  Високий: { t: 'text-orange-600', b: 'bg-neutral-100 dark:bg-neutral-800' },
  Середній: { t: 'text-yellow-600', b: 'bg-neutral-100 dark:bg-neutral-800' },
  Низький: { t: 'text-blue-600', b: 'bg-neutral-100 dark:bg-neutral-800' },
  'Дуже низький': { t: 'text-green-600', b: 'bg-neutral-100 dark:bg-neutral-800' }
}

export const RiskBadge = ({ value }: { value: OptionRow['risk'] }) => {
  const c = MAP[value]
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${c.b} ${c.t}`}>{value}</span>
}

