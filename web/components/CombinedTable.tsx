"use client"
import { ColumnDef, flexRender } from '@tanstack/react-table'
import { useDataTable } from '@/lib/table'
import { OptionRow } from '@/types'
import { exportCsv } from '@/lib/csv'
import { useInputs } from '@/store/useInputs'
import { calculate, CalculationResult } from '@/lib/calculations'
import { RiskBadge } from './RiskBadge'
import { ComplexityBadge } from './ComplexityBadge'
import { LiquidityBadge } from './LiquidityBadge'
import { useMemo, useState, useEffect, Fragment } from 'react'

type Row = OptionRow & CalculationResult & {
  ВсьогоВкладено: number
  ОчікуванаСума: number
  ЗаробленоПонадВкладене: number
  ЗУрахуваннямІнфляції: number
  СередняПрибутковість: number
  ОчікуванийПрибуток: number
}

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

const LIQUIDITY_LABELS: Record<OptionRow['liquidity'], string> = {
  'Висока': 'Швидко',
  'Середня': 'Помірно',
  'Низька': 'Довго'
}

export const CombinedTable = ({ rows }: { rows: OptionRow[] }) => {
  const inputs = useInputs()
  const [mounted, setMounted] = useState(false)
  const [incomePeriod, setIncomePeriod] = useState<'month' | 'year'>('year')

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

  const totalYears = useMemo(() => {
    return inputs.periods.filter((p) => p.monthly > 0 && p.years > 0).reduce((sum, p) => sum + p.years, 0)
  }, [inputs.periods])

  const computed: Row[] = useMemo(
    () =>
      rows.map((r) => {
        const result = calculate(r, inputs)
        const totalInvested = result.totalInvestedUSD
        const forecastCapital = result.forecastCapitalUSD
        const actualProfit = result.actualProfitUSD
        const realCapital = result.realCapitalUSD
        const annualIncome = result.annualIncomeUSD
        
        const cagr = totalYears > 0 && totalInvested > 0
          ? (Math.pow(forecastCapital / totalInvested, 1 / totalYears) - 1) * 100
          : 0

        return {
          ...r,
          ...result,
          ВсьогоВкладено: totalInvested,
          ОчікуванаСума: forecastCapital,
          ЗаробленоПонадВкладене: actualProfit,
          ЗУрахуваннямІнфляції: realCapital,
          СередняПрибутковість: cagr,
          ОчікуванийПрибуток: annualIncome
        }
      }),
    [rows, inputs, totalYears]
  )


  const columns: ColumnDef<Row>[] = useMemo(
    () => [
      {
        header: '№',
        accessorKey: 'id',
        cell: ({ getValue }) => <div className="text-right">{getValue<number>()}</div>
      },
      { header: 'Назва', accessorKey: 'name' },
      {
        header: 'Мін. вхід',
        accessorKey: 'minEntryUSD',
        cell: ({ getValue }) => (
          <div className="text-right">
            {Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(getValue<number>())}
          </div>
        )
      },
      {
        header: 'ROI %',
        accessorKey: 'roiAnnual',
        cell: ({ getValue }) => (
          <div className="text-right">
            {(getValue<number>() * 100).toFixed(1)}%
          </div>
        )
      },
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
        header: 'Продаж',
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
      {
        header: 'Вкладено',
        accessorKey: 'ВсьогоВкладено',
        cell: ({ getValue }) => (
          <div className="text-right">
            {Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(getValue<number>())}
          </div>
        )
      },
      {
        header: `Через ${totalYears} ${totalYears === 1 ? 'рік' : totalYears < 5 ? 'роки' : 'років'}`,
        accessorKey: 'ОчікуванаСума',
        cell: ({ getValue, row }) => {
          const value = getValue<number>()
          const p10 = row.original.p10
          const p90 = row.original.p90
          if (p10 !== undefined && p90 !== undefined) {
            return (
              <div className="flex flex-col text-right">
                <span>{Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)}</span>
                <span className="text-slate-500 dark:text-slate-400 text-xs">{Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p10)} - {Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p90)}</span>
              </div>
            )
          }
          return (
            <div className="text-right">
              {Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)}
            </div>
          )
        }
      },
      {
        header: 'З інфляцією',
        accessorKey: 'ЗУрахуваннямІнфляції',
        cell: ({ getValue }) => (
          <div className="text-right">
            {Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(getValue<number>())}
          </div>
        )
      },
      {
        header: 'Прибутковість сер.',
        accessorKey: 'СередняПрибутковість',
        cell: ({ getValue }) => {
          const value = getValue<number>()
          return (
            <div className="text-right">
              {isNaN(value) || !isFinite(value) ? '—' : `${value.toFixed(1)}%`}
            </div>
          )
        }
      },
      {
        header: incomePeriod === 'year' ? 'Прибуток / рік' : 'Прибуток / місяць',
        accessorKey: 'ОчікуванийПрибуток',
        cell: ({ getValue }) => {
          const value = getValue<number>()
          const displayValue = incomePeriod === 'year' ? value : value / 12
          return (
            <div className="text-right">
              {Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(displayValue)}
            </div>
          )
        }
      },
      {
        header: 'Дохід',
        accessorKey: 'ЗаробленоПонадВкладене',
        cell: ({ getValue }) => {
          const value = getValue<number>()
          const isPositive = value >= 0
          return (
            <div className={`text-right font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)}
            </div>
          )
        }
      },
      { header: 'Пояснення', accessorKey: 'notes' }
    ],
    [incomePeriod, totalYears]
  )

  const { table } = useDataTable(computed, columns, 'combined')

  const risks = useMemo(() => Array.from(new Set(rows.map((r) => r.risk))).map((v) => ({ label: v, value: v })), [rows])
  const liquidities = useMemo(() => Array.from(new Set(rows.map((r) => r.liquidity))).map((v) => ({ label: v, value: v })), [rows])
  const complexities = useMemo(() => Array.from(new Set(rows.map((r) => r.complexity))).map((v) => ({ label: v, value: v })), [rows])

  const handleExportCsv = () => {
    const rowsToExport = table.getRowModel().rows.map((r) => {
      const row = r.original
      const incomeValue = incomePeriod === 'year' ? row.ОчікуванийПрибуток : row.ОчікуванийПрибуток / 12
      const yearsLabel = totalYears === 1 ? 'рік' : totalYears < 5 ? 'роки' : 'років'
      const incomeLabel = incomePeriod === 'year' ? 'Очікуваний прибуток / рік (USD)' : 'Очікуваний прибуток / місяць (USD)'
      return {
        '№': row.id,
        'Назва': row.name,
        'Мін. вхід (USD)': row.minEntryUSD,
        'ROI %': (row.roiAnnual * 100).toFixed(1),
        'Ризик': row.risk,
        'Продаж': LIQUIDITY_LABELS[row.liquidity],
        'Складність': row.complexity,
        'Всього вкладено (USD)': row.ВсьогоВкладено,
        [`Через ${totalYears} ${yearsLabel} (USD)`]: row.ОчікуванаСума,
        'З інфляцією (USD)': row.ЗУрахуваннямІнфляції,
        'Середня прибутковість (%)': isNaN(row.СередняПрибутковість) || !isFinite(row.СередняПрибутковість) ? '—' : row.СередняПрибутковість.toFixed(1),
        [incomePeriod === 'year' ? 'Прибуток / рік (USD)' : 'Прибуток / місяць (USD)']: incomeValue,
        'Зароблено понад вкладене (USD)': row.ЗаробленоПонадВкладене,
        'Пояснення': row.notes
      }
    })
    exportCsv(rowsToExport, 'combined.csv')
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-2">
        <input
          value={(table.getState() as any).globalFilter ?? ''}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          placeholder="Пошук за назвою/примітками"
          className="bg-white dark:bg-neutral-900 shadow-sm px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-none ring-1 ring-transparent focus:ring-neutral-300 dark:focus:ring-neutral-700 ring-inset w-full sm:w-64 text-slate-800 dark:text-slate-200 text-sm"
        />
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 dark:text-slate-400 text-xs">Показувати прибуток за:</span>
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
          <button
            className="bg-neutral-100 hover:bg-neutral-200/70 dark:bg-neutral-800 dark:hover:bg-neutral-700 shadow-sm px-3 py-2 rounded-md ring-1 ring-neutral-200 dark:ring-neutral-700 ring-inset font-medium text-slate-700 dark:text-slate-200 text-xs"
            onClick={() => {
              table.resetColumnFilters()
              table.setGlobalFilter('')
              table.resetSorting()
            }}
          >
            Скинути
          </button>
          <button
            className="bg-neutral-100 hover:bg-neutral-200/70 dark:bg-neutral-800 dark:hover:bg-neutral-700 shadow-sm px-3 py-2 rounded-md ring-1 ring-neutral-200 dark:ring-neutral-700 ring-inset font-medium text-slate-700 dark:text-slate-200 text-xs"
            onClick={handleExportCsv}
          >
            CSV
          </button>
        </div>
      </div>
      {!mounted ? (
        <div className="overflow-x-auto">
          <div className="flex justify-center items-center min-h-[400px] text-slate-500 dark:text-slate-400">
            Завантаження...
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-900/60 text-slate-600 dark:text-slate-300">
                {table.getHeaderGroups().map((hg) => (
                  <Fragment key={hg.id}>
                    <tr className="border-neutral-200 dark:border-neutral-700 border-b">
                      {hg.headers.map((h) => {
                        const columnId = h.column.id
                        const filterConfig = [
                          { columnId: 'risk', options: risks, placeholder: 'Ризик' },
                          { columnId: 'liquidity', options: liquidities, placeholder: 'Ліквідність' },
                          { columnId: 'complexity', options: complexities, placeholder: 'Складність' }
                        ].find((f) => f.columnId === columnId)

                        return (
                          <th key={`filter-${h.id}`} className="px-3 py-2 whitespace-nowrap">
                            {filterConfig ? (
                              <select
                                className="bg-white dark:bg-neutral-900 shadow-sm px-2 py-1 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-none ring-1 ring-transparent focus:ring-neutral-300 dark:focus:ring-neutral-700 ring-inset w-full min-w-[120px] text-slate-800 dark:text-slate-200 text-xs"
                                value={(table.getColumn(filterConfig.columnId)?.getFilterValue() as string) ?? ''}
                                onChange={(e) => {
                                  const value = e.target.value
                                  if (value === '') {
                                    table.getColumn(filterConfig.columnId)?.setFilterValue(undefined)
                                  } else {
                                    table.getColumn(filterConfig.columnId)?.setFilterValue(value)
                                  }
                                }}
                              >
                                <option value="">{filterConfig.placeholder}</option>
                                {filterConfig.options.map((o) => (
                                  <option key={o.value} value={o.value}>
                                    {o.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div className="h-7" />
                            )}
                          </th>
                        )
                      })}
                    </tr>
                    <tr>
                      {hg.headers.map((h) => {
                        const sortDir = h.column.getIsSorted()
                        const isNumeric = ['id', 'minEntryUSD', 'roiAnnual', 'ВсьогоВкладено', 'ОчікуванаСума', 'ЗУрахуваннямІнфляції', 'СередняПрибутковість', 'ОчікуванийПрибуток', 'ЗаробленоПонадВкладене'].includes(h.column.id)
                        return (
                          <th key={h.id} className={`px-3 py-2 font-medium ${isNumeric ? 'text-right' : 'text-left'} whitespace-nowrap`}>
                            <span
                              onClick={h.column.getToggleSortingHandler()}
                              className={`inline-flex items-center gap-1 cursor-pointer select-none hover:text-slate-900 dark:hover:text-slate-100 ${
                                sortDir ? 'text-blue-600 dark:text-blue-400' : ''
                              }`}
                            >
                              <span>{flexRender(h.column.columnDef.header, h.getContext())}</span>
                              {sortDir === 'asc' && <span className="flex-shrink-0 text-xs">↑</span>}
                              {sortDir === 'desc' && <span className="flex-shrink-0 text-xs">↓</span>}
                              {!sortDir && <span className="flex-shrink-0 text-neutral-400 text-xs">⇅</span>}
                            </span>
                          </th>
                        )
                      })}
                    </tr>
                  </Fragment>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((r, idx) => (
                  <tr key={r.id} className={`${idx % 2 === 0 ? 'bg-white dark:bg-neutral-900' : 'bg-neutral-50 dark:bg-neutral-900/60'} hover:bg-neutral-100 dark:hover:bg-neutral-800`}>
                    {r.getVisibleCells().map((c) => (
                      <td key={c.id} className="px-3 py-2 whitespace-nowrap">
                        {flexRender(c.column.columnDef.cell, c.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
