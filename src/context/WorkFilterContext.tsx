import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { photosInCategory, type Photo } from "../data/photos";

/**
 * /work 的筛选状态放在路由之外的 Context 中：
 * 用户进入 /work/:seriesId 再返回时，筛选条件不会重置为「全部」。
 */
interface WorkFilterContextValue {
  category: string;
  setCategory: (category: string) => void;
  /** 当前筛选结果（灯箱的浏览范围也以它为准）。 */
  filteredPhotos: Photo[];
}

const WorkFilterContext = createContext<WorkFilterContextValue | null>(null);

export function WorkFilterProvider({ children }: { children: ReactNode }) {
  const [category, setCategory] = useState<string>("all");
  const value = useMemo(
    () => ({ category, setCategory, filteredPhotos: photosInCategory(category) }),
    [category]
  );
  return <WorkFilterContext.Provider value={value}>{children}</WorkFilterContext.Provider>;
}

export function useWorkFilter(): WorkFilterContextValue {
  const ctx = useContext(WorkFilterContext);
  if (!ctx) throw new Error("useWorkFilter 必须在 WorkFilterProvider 内使用");
  return ctx;
}
