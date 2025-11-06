import { ColumnDef, ColumnFiltersState, SortingState, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import { useEffect, useMemo } from 'react'
import { useTableState } from '@/store/useTableState'

export const useDataTable = <T extends object>(
  data: T[],
  columns: ColumnDef<T, any>[],
  stateKey: string
) => {
  const { getStateFor, setGlobalFilter, setColumnFilters, setSorting } = useTableState()
  const external = getStateFor(stateKey)
  const applyUpdater = <T,>(u: T | ((prev: T) => T), prev: T): T => (typeof u === 'function' ? (u as (p: T) => T)(prev) : (u as T))

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter: external.globalFilter,
      columnFilters: external.columnFilters as ColumnFiltersState,
      sorting: external.sorting as SortingState
    },
    onGlobalFilterChange: (v) => setGlobalFilter(stateKey, String(applyUpdater(v as any, external.globalFilter) ?? '')),
    onColumnFiltersChange: (v) => setColumnFilters(stateKey, applyUpdater(v as any, external.columnFilters as ColumnFiltersState)),
    onSortingChange: (v) => setSorting(stateKey, applyUpdater(v as any, external.sorting as SortingState)),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: 'auto'
  })
  useEffect(() => {
    try {
      table.setPageSize(Math.max(50, data.length))
    } catch {}
  }, [table, data.length])

  return useMemo(() => ({ table }), [table])
}

