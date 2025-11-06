"use client"
import { ColumnDef, flexRender } from '@tanstack/react-table'
import { useDataTable } from '@/lib/table'
import { OptionRow } from '@/types'
import { TableToolbar } from './TableToolbar'
import { exportCsv } from '@/lib/csv'
import { useInputs } from '@/store/useInputs'
import { estAnnualIncomeUSD, forecastCapitalUSD } from '@/lib/math'
import { RiskBadge } from './RiskBadge'
import { ComplexityBadge } from './ComplexityBadge'
import { LiquidityBadge } from './LiquidityBadge'
import { useMemo, useState, useEffect } from 'react'

type Row = OptionRow & { ПрогнозКапіталу: number; РічнийДохід: number; ФактичнийПрибуток: number; РеальнийДохід: number }

const RISK_ORDER: Record<OptionRow['risk'], number> = {
  'Дуже низький': 1,
  'Низький': 2,
  'Середній': 3,
  'Високий': 4,
  'Дуже високий': 5
}

const LIQUIDITY_ORDER: Record<OptionRow['liquidity'], number> = {
  'Низька': 1,
  'Середня': 2,
  'Висока': 3
}

const COMPLEXITY_ORDER: Record<OptionRow['complexity'], number> = {
  'Дуже низька': 1,
  'Низька': 2,
  'Середня': 3,
  'Висока': 4,
  'Дуже висока': 5
}

export const CombinedTable = ({ rows }: { rows: OptionRow[] }) => {
  const inputs = useInputs()
  const [incomePeriod, setIncomePeriod] = useState<'month' | 'year'>('year')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = window.localStorage.getItem('ws.incomePeriod') as 'month' | 'year' | null
    if (saved) {
      setIncomePeriod(saved)
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      window.localStorage.setItem('ws.incomePeriod', incomePeriod)
    }
  }, [incomePeriod, mounted])
  const computed: Row[] = useMemo(
    () =>
      rows.map((r) => {
        const прогнозКапіталу = forecastCapitalUSD(r.roiAnnual, inputs)
        const річнийДохід = estAnnualIncomeUSD(r.roiAnnual, inputs)
        // Обчислюємо загальну кількість років та вкладений капітал з усіх активних періодів
        const activePeriods = inputs.periods.filter((p) => p.monthly > 0 && p.years > 0)
        const totalYears = activePeriods.reduce((sum, p) => sum + p.years, 0)
        const вкладенийКапітал =
          inputs.initialUSD + activePeriods.reduce((sum, p) => sum + p.monthly * p.years * 12, 0)
        const фактичнийПрибуток = прогнозКапіталу - вкладенийКапітал
        const реальнийДохід = totalYears > 0 ? фактичнийПрибуток / totalYears : 0
        return {
          ...r,
          ПрогнозКапіталу: прогнозКапіталу,
          РічнийДохід: річнийДохід,
          ФактичнийПрибуток: фактичнийПрибуток,
          РеальнийДохід: реальнийДохід
        }
      }),
    [rows, inputs.initialUSD, inputs.periods, inputs.capRate]
  )

  const columns: ColumnDef<Row>[] = useMemo(
    () => [
      { header: 'ID', accessorKey: 'id' },
      { header: 'Категорія', accessorKey: 'category' },
      { header: 'Підкатегорія', accessorKey: 'subcategory' },
      { header: 'Назва', accessorKey: 'name' },
      { header: 'Мін. вхід', accessorKey: 'minEntryUSD' },
      { header: 'ROI (річний)', accessorKey: 'roiAnnual' },
      {
        header: 'Ризик',
        accessorKey: 'risk',
        cell: ({ getValue }) => <RiskBadge value={getValue() as any} />,
        sortingFn: (rowA, rowB) => {
          const a = RISK_ORDER[rowA.original.risk]
          const b = RISK_ORDER[rowB.original.risk]
          return a - b
        }
      },
      {
        header: 'Ліквідність',
        accessorKey: 'liquidity',
        cell: ({ getValue }) => <LiquidityBadge value={getValue() as any} />,
        sortingFn: (rowA, rowB) => {
          const a = LIQUIDITY_ORDER[rowA.original.liquidity]
          const b = LIQUIDITY_ORDER[rowB.original.liquidity]
          return a - b
        }
      },
      {
        header: 'Складність',
        accessorKey: 'complexity',
        cell: ({ getValue }) => <ComplexityBadge value={getValue() as any} />,
        sortingFn: (rowA, rowB) => {
          const a = COMPLEXITY_ORDER[rowA.original.complexity]
          const b = COMPLEXITY_ORDER[rowB.original.complexity]
          return a - b
        }
      },
      { header: 'Прогноз капіталу', accessorKey: 'ПрогнозКапіталу', cell: ({ getValue }) => Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(getValue<number>()) },
      {
        header: incomePeriod === 'year' ? 'Пасивний дохід / рік' : 'Пасивний дохід / місяць',
        accessorKey: 'РічнийДохід',
        cell: ({ getValue }) => {
          const value = getValue<number>()
          const displayValue = incomePeriod === 'year' ? value : value / 12
          return Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(displayValue)
        }
      },
      { header: 'Фактичний прибуток', accessorKey: 'ФактичнийПрибуток', cell: ({ getValue }) => Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(getValue<number>()) },
      {
        header: incomePeriod === 'year' ? 'Середній дохід / рік' : 'Середній дохід / місяць',
        accessorKey: 'РеальнийДохід',
        cell: ({ getValue }) => {
          const value = getValue<number>()
          const displayValue = incomePeriod === 'year' ? value : value / 12
          return Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(displayValue)
        }
      },
      { header: 'Пояснення', accessorKey: 'notes' }
    ],
    [incomePeriod]
  )

  const { table } = useDataTable(computed, columns, 'combined')

  const categories = useMemo(() => Array.from(new Set(rows.map((r) => r.category))).map((v) => ({ label: v, value: v })), [rows])
  const subcategories = useMemo(() => Array.from(new Set(rows.map((r) => r.subcategory))).map((v) => ({ label: v, value: v })), [rows])
  const risks = useMemo(() => Array.from(new Set(rows.map((r) => r.risk))).map((v) => ({ label: v, value: v })), [rows])
  const liquidities = useMemo(() => Array.from(new Set(rows.map((r) => r.liquidity))).map((v) => ({ label: v, value: v })), [rows])
  const complexities = useMemo(() => Array.from(new Set(rows.map((r) => r.complexity))).map((v) => ({ label: v, value: v })), [rows])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-2">
        <div className="flex sm:flex-row flex-col sm:items-center gap-2 sm:gap-3">
          <TableToolbar
            table={table}
            searchPlaceholder="Пошук за назвою/примітками"
            quickFilters={[
              { columnId: 'category', options: categories, placeholder: 'Категорія' },
              { columnId: 'subcategory', options: subcategories, placeholder: 'Підкатегорія' },
              { columnId: 'risk', options: risks, placeholder: 'Ризик' },
              { columnId: 'liquidity', options: liquidities, placeholder: 'Ліквідність' },
              { columnId: 'complexity', options: complexities, placeholder: 'Складність' }
            ]}
          />
          <div className="flex items-center gap-2 sm:pl-3 sm:border-neutral-200 dark:sm:border-neutral-700 sm:border-l">
            <span className="text-slate-600 dark:text-slate-400 text-xs">Дохід:</span>
            <button
              onClick={() => setIncomePeriod('month')}
              className={`px-2 py-1 text-xs font-medium rounded-md ${
                incomePeriod === 'month'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-neutral-100 text-slate-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-slate-300 dark:hover:bg-neutral-700'
              }`}
              suppressHydrationWarning
            >
              Місяць
            </button>
            <button
              onClick={() => setIncomePeriod('year')}
              className={`px-2 py-1 text-xs font-medium rounded-md ${
                incomePeriod === 'year'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-neutral-100 text-slate-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-slate-300 dark:hover:bg-neutral-700'
              }`}
              suppressHydrationWarning
            >
              Рік
            </button>
          </div>
        </div>
        <button className="self-start sm:self-auto bg-neutral-100 hover:bg-neutral-200/70 dark:bg-neutral-800 dark:hover:bg-neutral-700 shadow-sm px-3 py-2 rounded-md ring-1 ring-neutral-200 dark:ring-neutral-700 ring-inset font-medium text-slate-700 dark:text-slate-200 text-xs" onClick={() => exportCsv(table.getRowModel().rows.map((r) => r.original), 'combined.csv')}>
          CSV
        </button>
      </div>
      {!mounted ? (
        <div className="overflow-x-auto">
          <div className="flex justify-center items-center min-h-[400px] text-slate-500 dark:text-slate-400">
            Завантаження...
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-900/60 text-slate-600 dark:text-slate-300">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => {
                    const sortDir = h.column.getIsSorted()
                    return (
                      <th key={h.id} className="px-3 py-2 font-medium text-left">
                        <span
                          onClick={h.column.getToggleSortingHandler()}
                          className={`inline-flex items-center gap-1 cursor-pointer select-none hover:text-slate-900 dark:hover:text-slate-100 ${
                            sortDir ? 'text-blue-600 dark:text-blue-400' : ''
                          }`}
                        >
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {sortDir === 'asc' && <span className="text-xs">↑</span>}
                          {sortDir === 'desc' && <span className="text-xs">↓</span>}
                          {!sortDir && <span className="text-neutral-400 text-xs">⇅</span>}
                        </span>
                      </th>
                    )
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((r, idx) => (
                <tr key={r.id} className={`${idx % 2 === 0 ? 'bg-white dark:bg-neutral-900' : 'bg-neutral-50 dark:bg-neutral-900/60'} hover:bg-neutral-100 dark:hover:bg-neutral-800`}>
                  {r.getVisibleCells().map((c) => (
                    <td key={c.id} className="px-3 py-2">
                      {flexRender(c.column.columnDef.cell, c.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}


