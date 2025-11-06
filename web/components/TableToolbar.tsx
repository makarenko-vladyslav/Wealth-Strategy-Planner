import { Table } from '@tanstack/react-table'

type Opt = { label: string; value: string }

export const TableToolbar = <T,>({
  table,
  searchPlaceholder,
  quickFilters
}: {
  table: Table<T>
  searchPlaceholder: string
  quickFilters: { columnId: string; options: Opt[]; placeholder: string }[]
}) => {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <input
        value={(table.getState() as any).globalFilter ?? ''}
        onChange={(e) => table.setGlobalFilter(e.target.value)}
        placeholder={searchPlaceholder}
        className="w-full sm:w-64 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm ring-1 ring-inset ring-transparent focus:outline-none focus:ring-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-200 dark:focus:ring-neutral-700"
      />
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((q) => (
          <select
            key={q.columnId}
            className="rounded-md border border-neutral-200 bg-white px-2 py-2 text-sm text-slate-800 shadow-sm ring-1 ring-inset ring-transparent focus:outline-none focus:ring-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-200 dark:focus:ring-neutral-700"
            value={(table.getColumn(q.columnId)?.getFilterValue() as string) ?? (q.options.find((o) => o.value === 'all') ? 'all' : '')}
            onChange={(e) => {
              const value = e.target.value
              if (value === '') {
                table.getColumn(q.columnId)?.setFilterValue(undefined)
              } else {
                table.getColumn(q.columnId)?.setFilterValue(value === 'all' ? undefined : value)
              }
            }}
          >
            <option value="">{q.placeholder}</option>
            {q.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ))}
        <button
          className="rounded-md bg-neutral-100 px-3 py-2 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-neutral-200 hover:bg-neutral-200/70 dark:bg-neutral-800 dark:text-slate-200 dark:ring-neutral-700 dark:hover:bg-neutral-700"
          onClick={() => {
            table.resetColumnFilters()
            table.setGlobalFilter('')
            table.resetSorting()
          }}
        >
          Скинути
        </button>
      </div>
    </div>
  )
}

