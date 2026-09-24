import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CategoryId } from '../data/photos'

export type Filter = CategoryId | 'all'

interface FilterContextValue {
  filter: Filter
  setFilter: (f: Filter) => void
}

const FilterContext = createContext<FilterContextValue | null>(null)

// 放在路由之外的全局状态：从 /work 进入系列页再返回时，筛选条件不会随页面卸载而重置
export function FilterProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<Filter>('all')
  const value = useMemo(() => ({ filter, setFilter }), [filter])
  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
}

export function useFilter(): FilterContextValue {
  const ctx = useContext(FilterContext)
  if (!ctx) throw new Error('useFilter 必须在 <FilterProvider> 内使用')
  return ctx
}
