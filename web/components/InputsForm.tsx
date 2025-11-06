"use client"
import { useInputs } from '@/store/useInputs'
import { Period } from '@/types'
import { useEffect, useRef, useState, useMemo } from 'react'

export const InputsForm = () => {
  const setAll = useInputs((s) => s.setAll)
  const resetStore = useInputs((s) => s.reset)
  const storeInputs = useInputs()
  const storeInitialUSD = useInputs((s) => s.initialUSD)
  const storeCapRate = useInputs((s) => s.capRate)
  const storePeriods = useInputs((s) => s.periods)

  const [mounted, setMounted] = useState(false)
  const [initialUSD, setInitialUSD] = useState(() => storeInitialUSD)
  const [capRate, setCapRate] = useState(() => storeCapRate)
  const [periods, setPeriods] = useState<Period[]>(() => storePeriods)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isUserChangeRef = useRef(false)
  
  // Локальні стани для відображення значень в інпутах (можуть бути порожніми під час введення)
  const [initialUSDDisplay, setInitialUSDDisplay] = useState(() => storeInitialUSD === 0 ? '' : String(storeInitialUSD))
  const [capRateDisplay, setCapRateDisplay] = useState(() => storeCapRate === 0 ? '' : String(storeCapRate))

  // Порівнюємо periods за значеннями, а не за посиланням
  const storePeriodsString = useMemo(() => JSON.stringify(storePeriods), [storePeriods])
  const prevStorePeriodsRef = useRef<string>(storePeriodsString)

  useEffect(() => {
    setMounted(true)
    // Синхронізуємо з store при монтуванні
    setInitialUSD(storeInitialUSD)
    setCapRate(storeCapRate)
    setPeriods(storePeriods)
    setInitialUSDDisplay(storeInitialUSD === 0 ? '' : String(storeInitialUSD))
    setCapRateDisplay(storeCapRate === 0 ? '' : String(storeCapRate))
    prevStorePeriodsRef.current = storePeriodsString
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Синхронізуємо з store тільки після монтування і якщо зміна не від користувача
  useEffect(() => {
    if (!mounted) return
    if (!isUserChangeRef.current && storeInitialUSD !== initialUSD) {
      setInitialUSD(storeInitialUSD)
      setInitialUSDDisplay(storeInitialUSD === 0 ? '' : String(storeInitialUSD))
    }
  }, [mounted, storeInitialUSD, initialUSD])

  useEffect(() => {
    if (!mounted) return
    if (!isUserChangeRef.current && storeCapRate !== capRate) {
      setCapRate(storeCapRate)
      setCapRateDisplay(storeCapRate === 0 ? '' : String(storeCapRate))
    }
  }, [mounted, storeCapRate, capRate])

  useEffect(() => {
    if (!mounted) return
    if (!isUserChangeRef.current && storePeriodsString !== prevStorePeriodsRef.current) {
      const localString = JSON.stringify(periods)
      if (storePeriodsString !== localString) {
        prevStorePeriodsRef.current = storePeriodsString
        setPeriods(storePeriods)
      }
    }
  }, [mounted, storePeriodsString, storePeriods, periods])

  const periodsStringForEffect = useMemo(() => JSON.stringify(periods), [periods])
  
  useEffect(() => {
    if (!mounted) return
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    // Прапорець вже встановлений в функціях addPeriod, removePeriod, updatePeriod або onChange
    const newPeriods = periods.map((p) => ({ years: Number(p.years ?? 0), monthly: Number(p.monthly ?? 0) }))
    const newPeriodsString = JSON.stringify(newPeriods)
    // Оновлюємо prevStorePeriodsRef синхронно перед викликом setAll
    prevStorePeriodsRef.current = newPeriodsString
    timeoutRef.current = setTimeout(() => {
      setAll({
        ...storeInputs,
        initialUSD: Number(initialUSD ?? 0),
        periods: newPeriods,
        capRate: Number(capRate ?? 0)
      })
      // Скидаємо прапорець після виклику setAll, даємо час для оновлення store
      setTimeout(() => {
        isUserChangeRef.current = false
      }, 200)
    }, 300)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [mounted, initialUSD, capRate, periodsStringForEffect, periods, setAll, storeInputs])

  const addPeriod = () => {
    isUserChangeRef.current = true
    setPeriods([...periods, { years: 0, monthly: 0 }])
  }

  const removePeriod = (index: number) => {
    if (periods.length > 1) {
      isUserChangeRef.current = true
      setPeriods(periods.filter((_, i) => i !== index))
    }
  }

  const updatePeriod = (index: number, field: 'years' | 'monthly', value: number) => {
    isUserChangeRef.current = true
    setPeriods(periods.map((p, i) => (i === index ? { ...p, [field]: value } : p)))
  }

  const reset = () => {
    isUserChangeRef.current = false
    resetStore()
    setTimeout(() => {
      setInitialUSD(0)
      setCapRate(0.1)
      setPeriods([{ years: 10, monthly: 2000 }])
      setInitialUSDDisplay('')
      setCapRateDisplay('0.1')
    }, 100)
  }

  return (
    <>
      {!mounted ? (
        <div className="gap-3 grid grid-cols-1 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-slate-600 dark:text-slate-400 text-xs">Початковий капітал</label>
            <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md h-9 animate-pulse" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-slate-600 dark:text-slate-400 text-xs">Лімітна річна ставка для доходу</label>
            <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md h-9 animate-pulse" />
          </div>
          <div className="col-span-1 md:col-span-2">
            <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md h-32 animate-pulse" />
          </div>
        </div>
      ) : (
        <form onSubmit={(e) => e.preventDefault()} className="gap-3 grid grid-cols-1 md:grid-cols-2">
      <div className="flex flex-col gap-1">
        <label className="text-slate-600 dark:text-slate-400 text-xs">Початковий капітал</label>
        <input
          type="number"
          step="1"
          min="0"
          value={initialUSDDisplay}
          placeholder="0"
          onBlur={(e) => {
            const val = Number(e.target.value)
            if (isNaN(val) || val < 0 || e.target.value === '') {
              isUserChangeRef.current = true
              setInitialUSD(0)
              setInitialUSDDisplay('')
            } else {
              setInitialUSDDisplay(String(val))
            }
          }}
          onChange={(e) => {
            isUserChangeRef.current = true
            setInitialUSDDisplay(e.target.value)
            const val = e.target.value === '' ? 0 : Number(e.target.value)
            if (!isNaN(val)) {
              setInitialUSD(Math.max(val, 0))
            }
          }}
          className="bg-white dark:bg-neutral-900 shadow-sm px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-none ring-1 ring-transparent focus:ring-neutral-300 dark:focus:ring-neutral-700 ring-inset text-slate-800 dark:text-slate-200 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-slate-600 dark:text-slate-400 text-xs">Лімітна річна ставка для доходу</label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="1"
          value={capRateDisplay}
          placeholder="0"
          onBlur={(e) => {
            const val = Number(e.target.value)
            if (isNaN(val) || val < 0 || e.target.value === '') {
              isUserChangeRef.current = true
              setCapRate(0)
              setCapRateDisplay('')
            } else {
              setCapRateDisplay(String(val))
            }
          }}
          onChange={(e) => {
            isUserChangeRef.current = true
            setCapRateDisplay(e.target.value)
            const val = e.target.value === '' ? 0 : Number(e.target.value)
            if (!isNaN(val)) {
              setCapRate(Math.min(Math.max(val, 0), 1))
            }
          }}
          className="bg-white dark:bg-neutral-900 shadow-sm px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-none ring-1 ring-transparent focus:ring-neutral-300 dark:focus:ring-neutral-700 ring-inset text-slate-800 dark:text-slate-200 text-sm"
        />
      </div>
      <div className="col-span-1 md:col-span-2">
        <div className="flex justify-between items-center mb-2">
          <div className="font-medium text-slate-700 dark:text-slate-300 text-xs">Періоди інвестування</div>
          <button
            type="button"
            onClick={addPeriod}
            className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 px-2 py-1 rounded-md font-medium text-blue-700 dark:text-blue-300 text-xs"
          >
            + Додати період
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {periods.map((period, index) => (
            <div key={index} className="bg-neutral-50 dark:bg-neutral-900/50 p-3 border border-neutral-200 dark:border-neutral-700 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium text-slate-700 dark:text-slate-300 text-xs">Період {index + 1}</div>
                {periods.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePeriod(index)}
                    className="bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 px-2 py-1 rounded-md font-medium text-red-700 dark:text-red-300 text-xs"
                  >
                    Видалити
                  </button>
                )}
              </div>
              <div className="gap-3 grid grid-cols-1 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-600 dark:text-slate-400 text-xs">Роки (0–20)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="20"
                    value={period.years === 0 ? '' : period.years}
                    placeholder="0"
                    onBlur={(e) => {
                      const val = Number(e.target.value)
                      if (isNaN(val) || val < 0 || e.target.value === '') {
                        isUserChangeRef.current = true
                        updatePeriod(index, 'years', 0)
                      }
                    }}
                    onChange={(e) => {
                      isUserChangeRef.current = true
                      const val = e.target.value === '' ? 0 : Number(e.target.value)
                      if (!isNaN(val)) {
                        updatePeriod(index, 'years', Math.min(Math.max(val, 0), 20))
                      }
                    }}
                    className="bg-white dark:bg-neutral-900 shadow-sm px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-none ring-1 ring-transparent focus:ring-neutral-300 dark:focus:ring-neutral-700 ring-inset text-slate-800 dark:text-slate-200 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-600 dark:text-slate-400 text-xs">Щомісячна сума</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={period.monthly === 0 ? '' : period.monthly}
                    placeholder="0"
                    onBlur={(e) => {
                      const val = Number(e.target.value)
                      if (isNaN(val) || val < 0 || e.target.value === '') {
                        isUserChangeRef.current = true
                        updatePeriod(index, 'monthly', 0)
                      }
                    }}
                    onChange={(e) => {
                      isUserChangeRef.current = true
                      const val = e.target.value === '' ? 0 : Number(e.target.value)
                      if (!isNaN(val)) {
                        updatePeriod(index, 'monthly', Math.max(val, 0))
                      }
                    }}
                    className="bg-white dark:bg-neutral-900 shadow-sm px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-none ring-1 ring-transparent focus:ring-neutral-300 dark:focus:ring-neutral-700 ring-inset text-slate-800 dark:text-slate-200 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="col-span-1 md:col-span-2">
        <button
          type="button"
          onClick={reset}
          className="bg-neutral-100 hover:bg-neutral-200/70 dark:bg-neutral-800 dark:hover:bg-neutral-700 shadow-sm px-3 py-2 rounded-md ring-1 ring-neutral-200 dark:ring-neutral-700 ring-inset w-full font-medium text-slate-700 dark:text-slate-200 text-xs"
        >
          Скинути
        </button>
      </div>
    </form>
      )}
    </>
  )
}
