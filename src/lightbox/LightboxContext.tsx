import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Photo } from '../data/photos'

interface LightboxState {
  photos: Photo[]
  index: number
}

interface LightboxContextValue {
  state: LightboxState | null
  open: (photos: Photo[], index: number) => void
  close: () => void
  next: () => void
  prev: () => void
}

const LightboxContext = createContext<LightboxContextValue | null>(null)

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LightboxState | null>(null)

  const open = useCallback((photos: Photo[], index: number) => {
    if (photos.length === 0) return
    setState({ photos, index: Math.min(Math.max(index, 0), photos.length - 1) })
  }, [])

  const close = useCallback(() => setState(null), [])

  // 导航严格限定在打开时传入的照片集合内（即当前筛选结果/当前系列），到边界循环
  const next = useCallback(() => {
    setState((cur) =>
      cur ? { ...cur, index: (cur.index + 1) % cur.photos.length } : cur,
    )
  }, [])

  const prev = useCallback(() => {
    setState((cur) =>
      cur
        ? { ...cur, index: (cur.index - 1 + cur.photos.length) % cur.photos.length }
        : cur,
    )
  }, [])

  const value = useMemo(
    () => ({ state, open, close, next, prev }),
    [state, open, close, next, prev],
  )

  return (
    <LightboxContext.Provider value={value}>{children}</LightboxContext.Provider>
  )
}

export function useLightbox(): LightboxContextValue {
  const ctx = useContext(LightboxContext)
  if (!ctx) throw new Error('useLightbox 必须在 <LightboxProvider> 内使用')
  return ctx
}
