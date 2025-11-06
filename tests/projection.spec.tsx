import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { CombinedTable } from '@/components/CombinedTable'
import { OPTIONS } from '@/data/options'
import { useInputs } from '@/store/useInputs'
import { useEffect } from 'react'

const Provider = ({ children }: { children: React.ReactNode }) => {
  const s = useInputs()
  useEffect(() => {
    s.setAll({
      initialUSD: 0,
      periods: [{ years: 10, monthly: 1000 }],
      capRate: 0.1
    })
  }, [])
  return <div>{children}</div>
}

describe('projection', () => {
  it('renders first 5 rows without crash', () => {
    const { container } = render(
      <Provider>
        <CombinedTable rows={OPTIONS.slice(0, 5)} />
      </Provider>
    )
    expect(container).toBeTruthy()
  })
})

