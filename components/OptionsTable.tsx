"use client"
import { ColumnDef, flexRender } from '@tanstack/react-table'
import { useDataTable } from '@/lib/table'
import { OptionRow } from '@/types'
import { TableToolbar } from './TableToolbar'
import { exportCsv } from '@/lib/csv'
import { RiskBadge } from './RiskBadge'
import { useMemo } from 'react'

export const OptionsTable = ({ rows }: { rows: OptionRow[] }) => {
  const columns: ColumnDef<OptionRow>[] = useMemo(
    () => [
      { header: 'ID', accessorKey: 'id' },
      { header: 'Категорія', accessorKey: 'category' },
      { header: 'Підкатегорія', accessorKey: 'subcategory' },
      { header: 'Назва', accessorKey: 'name' },
      { header: 'Мін. вхід (USD)', accessorKey: 'minEntryUSD' },
      { header: 'ROI (річний)', accessorKey: 'roiAnnual' },
      { header: 'Ризик', accessorKey: 'risk', cell: ({ getValue }) => <RiskBadge value={getValue() as any} /> },
      { header: 'Ліквідність', accessorKey: 'liquidity' },
      { header: 'Примітки', accessorKey: 'notes' }
    ],
    []
  )

  const { table } = useDataTable(rows, columns, 'options')

  const categories = useMemo(() => Array.from(new Set(rows.map((r) => r.category))).map((v) => ({ label: v, value: v })), [rows])
  const subcategories = useMemo(() => Array.from(new Set(rows.map((r) => r.subcategory))).map((v) => ({ label: v, value: v })), [rows])
  const risks = useMemo(() => Array.from(new Set(rows.map((r) => r.risk))).map((v) => ({ label: v, value: v })), [rows])
  const liquidities = useMemo(() => Array.from(new Set(rows.map((r) => r.liquidity))).map((v) => ({ label: v, value: v })), [rows])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <TableToolbar
          table={table}
          searchPlaceholder="Пошук за назвою/примітками"
          quickFilters={[
            { columnId: 'category', options: categories, placeholder: 'Категорія' },
            { columnId: 'subcategory', options: subcategories, placeholder: 'Підкатегорія' },
            { columnId: 'risk', options: risks, placeholder: 'Ризик' },
            { columnId: 'liquidity', options: liquidities, placeholder: 'Ліквідність' }
          ]}
        />
        <button className="rounded-md bg-neutral-100 px-3 py-2 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-neutral-200 hover:bg-neutral-200/70 dark:bg-neutral-800 dark:text-slate-200 dark:ring-neutral-700 dark:hover:bg-neutral-700" onClick={() => exportCsv(table.getRowModel().rows.map((r) => r.original), 'options.csv')}>
          CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50 text-slate-600 dark:bg-neutral-900/60 dark:text-slate-300">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th key={h.id} className="px-3 py-2 text-left font-medium cursor-pointer">
                    <span onClick={h.column.getToggleSortingHandler()} className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((r) => (
              <tr key={r.id} className="odd:bg-white even:bg-neutral-50 hover:bg-neutral-50/80 dark:odd:bg-neutral-900 dark:even:bg-neutral-900/60 dark:hover:bg-neutral-800/80">
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
    </div>
  )
}

