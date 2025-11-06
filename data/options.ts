import { OptionRow } from '@/types'

const addDefaults = (row: any): OptionRow => {
  const defaults: Partial<OptionRow> = {
    incomeType: 'Пасивний',
    muAnnual: row.roiAnnual * 0.9,
    sigmaAnnual: row.roiAnnual * 0.3
  }
  
  return { ...defaults, ...row } as OptionRow
}

export const OPTIONS: OptionRow[] = [
  {id:31, category:"Інвестиції", subcategory:"Ринок", name:"ETF (MSCI World/S&P500)", minEntryUSD:1000, roiAnnual:0.08, risk:"Низький", liquidity:"Висока", complexity:"Дуже низька", notes:"Гроші ростуть завдяки відсоткам на відсотки"},
  {id:32, category:"Інвестиції", subcategory:"Ринок", name:"Облігації (IG/treasuries)", minEntryUSD:1000, roiAnnual:0.04, risk:"Дуже низький", liquidity:"Висока", complexity:"Дуже низька", notes:"Найбезпечніший варіант зі стабільним доходом"},
  {id:33, category:"Інвестиції", subcategory:"Альт", name:"REITs (глобальні)", minEntryUSD:2000, roiAnnual:0.07, risk:"Середній", liquidity:"Висока", complexity:"Низька", notes:"Отримуєте частину доходів від нерухомості та зростання вартості"},
  {id:34, category:"Інвестиції", subcategory:"Альт", name:"Золото/срібло (ETF)", minEntryUSD:1000, roiAnnual:0.03, risk:"Низький", liquidity:"Висока", complexity:"Дуже низька", notes:"Захист від знецінення грошей через інфляцію"},
  {id:35, category:"Інвестиції", subcategory:"P2P", name:"P2P-кредитування (диверсиф.)", minEntryUSD:2000, roiAnnual:0.10, risk:"Високий", liquidity:"Середня", complexity:"Низька", notes:"Ризик що платформа може припинити роботу"},
  {id:36, category:"Інвестиції", subcategory:"Крипто", name:"BTC/ETH довгостроково", minEntryUSD:1000, roiAnnual:0.20, risk:"Дуже високий", liquidity:"Висока", complexity:"Середня", notes:"Рекомендується лише 5-10% від загального портфеля"},
  {id:68, category:"Інвестиції", subcategory:"Ринок", name:"Акції дивідендні (dividend stocks)", minEntryUSD:1000, roiAnnual:0.06, risk:"Середній", liquidity:"Висока", complexity:"Низька", notes:"Регулярні виплати дивідендів від компаній"},
  {id:69, category:"Інвестиції", subcategory:"Ринок", name:"Індексні фонди (VTI, VXUS)", minEntryUSD:1000, roiAnnual:0.09, risk:"Низький", liquidity:"Висока", complexity:"Дуже низька", notes:"Вкладення в широкий спектр компаній"},
  {id:70, category:"Інвестиції", subcategory:"Альт", name:"Нерухомість через фонди (REITs UA)", minEntryUSD:5000, roiAnnual:0.11, risk:"Середній", liquidity:"Середня", complexity:"Низька", notes:"Інвестиції в нерухомість без купівлі"},
  {id:71, category:"Інвестиції", subcategory:"Альт", name:"Срібло фізичне", minEntryUSD:2000, roiAnnual:0.04, risk:"Низький", liquidity:"Середня", complexity:"Низька", notes:"Фізичне зберігання металу"},
  {id:72, category:"Інвестиції", subcategory:"P2P", name:"Кредитування через платформи", minEntryUSD:1000, roiAnnual:0.12, risk:"Високий", liquidity:"Низька", complexity:"Низька", notes:"Видаєте позики приватним особам"},
  {id:73, category:"Інвестиції", subcategory:"Крипто", name:"Стейкінг криптовалют", minEntryUSD:2000, roiAnnual:0.08, risk:"Високий", liquidity:"Середня", complexity:"Середня", notes:"Блокуєте криптовалюту та отримуєте відсотки"},
  {id:38, category:"IP", subcategory:"Ліцензування", name:"Дизайн/шаблони/ліцензії", minEntryUSD:500, roiAnnual:0.80, risk:"Високий", liquidity:"Висока", complexity:"Середня", notes:"Після створення продукту він може приносити дохід без вашої участі"},
  {id:39, category:"IP", subcategory:"Паблішинг", name:"Книга/курс (видавництво)", minEntryUSD:1000, roiAnnual:0.50, risk:"Високий", liquidity:"Висока", complexity:"Середня", notes:"Старі книги продовжують продаватися та приносити дохід"},
  {id:76, category:"IP", subcategory:"Ліцензування", name:"Фотобанк (продаж фото)", minEntryUSD:500, roiAnnual:0.60, risk:"Середній", liquidity:"Висока", complexity:"Низька", notes:"Продаж фотографій на стоках"},
  {id:77, category:"IP", subcategory:"Ліцензування", name:"Музика/подкасти (роялті)", minEntryUSD:1000, roiAnnual:0.55, risk:"Високий", liquidity:"Висока", complexity:"Середня", notes:"Доходи від використання вашої музики"},
  {id:78, category:"IP", subcategory:"Паблішинг", name:"Електронна книга (самостійно)", minEntryUSD:500, roiAnnual:0.75, risk:"Високий", liquidity:"Висока", complexity:"Низька", notes:"Продаж через Amazon, власний сайт"}
].map((item, index) => ({ ...addDefaults(item), id: index + 1 }))
