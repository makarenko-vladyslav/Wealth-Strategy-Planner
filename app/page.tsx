"use client"
import { Tab } from '@headlessui/react'
import { useTheme } from '@/store/useTheme'
import { InputsForm } from '@/components/InputsForm'
import { OPTIONS } from '@/data/options'
import { CombinedTable } from '@/components/CombinedTable'
import { useInputs } from '@/store/useInputs'
import { saveAs } from 'file-saver'

export default function Home() {
  const { theme, toggle } = useTheme()
  const inputs = useInputs()

  return (
    <div className="min-h-screen bg-neutral-50 text-slate-800 dark:bg-neutral-950 dark:text-slate-200">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-neutral-800 dark:bg-neutral-950/70">
        <div className="mx-auto flex w-full max-w-none items-center justify-between px-6 py-3">
          <div className="text-base font-semibold tracking-tight">Планувальник стратегії багатства</div>
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-md bg-neutral-100 px-3 py-2 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-neutral-200 hover:bg-neutral-200/70 dark:bg-neutral-900 dark:text-slate-200 dark:ring-neutral-800 dark:hover:bg-neutral-800" onClick={toggle}>
              {theme === 'dark' ? 'Світла тема' : 'Темна тема'}
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-none px-6 py-6">
        <div className="mb-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">Ввідні дані</div>
          <InputsForm />
        </div>
        <main className="flex min-w-0 flex-col gap-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <CombinedTable rows={OPTIONS} />
          </div>
        </main>
      </div>
    </div>
  )
}
