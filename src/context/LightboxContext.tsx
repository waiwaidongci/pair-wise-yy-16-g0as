import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Photo } from "../data/photos";

/**
 * 全局共享灯箱状态。
 *
 * 任何页面打开灯箱时，都必须把「当前上下文里允许浏览的照片列表」
 * （例如 /work 当前筛选结果、或某个系列的照片集合）连同起始下标一起传入。
 * 灯箱内部只在这份列表里循环切换，从而保证：
 *  - /work 筛选「牧野」后打开灯箱，左右切换只会在 4 张牧野照片间循环；
 *  - 位置指示显示的是「组内序号 / 组内总数」（如 3 / 4），而不是全部 14 张。
 */
interface LightboxState {
  photos: Photo[];
  index: number;
}

interface LightboxContextValue {
  state: LightboxState | null;
  open: (photos: Photo[], index: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
}

const LightboxContext = createContext<LightboxContextValue | null>(null);

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LightboxState | null>(null);

  const open = useCallback((photos: Photo[], index: number) => {
    if (photos.length === 0) return;
    setState({ photos, index: Math.min(Math.max(index, 0), photos.length - 1) });
  }, []);

  const close = useCallback(() => setState(null), []);

  const step = useCallback((delta: number) => {
    setState((s) => {
      if (!s || s.photos.length === 0) return s;
      const len = s.photos.length;
      return { ...s, index: (s.index + delta + len) % len };
    });
  }, []);

  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => step(-1), [step]);

  const value = useMemo(
    () => ({ state, open, close, next, prev }),
    [state, open, close, next, prev]
  );

  return <LightboxContext.Provider value={value}>{children}</LightboxContext.Provider>;
}

export function useLightbox(): LightboxContextValue {
  const ctx = useContext(LightboxContext);
  if (!ctx) throw new Error("useLightbox 必须在 LightboxProvider 内使用");
  return ctx;
}
