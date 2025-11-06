import { create } from 'zustand'
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table'

type OneTableState = {
  globalFilter: string
  columnFilters: ColumnFiltersState
  sorting: SortingState
}

type TablesState = {
  byKey: Record<string, OneTableState>
  getStateFor: (key: string) => OneTableState
  setGlobalFilter: (key: string, v: string) => void
  setColumnFilters: (key: string, v: ColumnFiltersState) => void
  setSorting: (key: string, v: SortingState) => void
  reset: (key: string) => void
}

const EMPTY: OneTableState = { globalFilter: '', columnFilters: [], sorting: [] }

export const useTableState = create<TablesState>((set, get) => ({
  byKey: {},
  getStateFor: (key) => get().byKey[key] ?? EMPTY,
  setGlobalFilter: (key, v) => set((s) => ({ byKey: { ...s.byKey, [key]: { ...(s.byKey[key] ?? EMPTY), globalFilter: v } } })),
  setColumnFilters: (key, v) => set((s) => ({ byKey: { ...s.byKey, [key]: { ...(s.byKey[key] ?? EMPTY), columnFilters: v } } })),
  setSorting: (key, v) => set((s) => ({ byKey: { ...s.byKey, [key]: { ...(s.byKey[key] ?? EMPTY), sorting: v } } })),
  reset: (key) => set((s) => ({ byKey: { ...s.byKey, [key]: EMPTY } }))
}))


