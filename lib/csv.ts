import Papa from 'papaparse'
import { saveAs } from 'file-saver'

export const exportCsv = <T extends object>(rows: T[], filename: string): void => {
  const csv = Papa.unparse(rows, { header: true })
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`)
}

