import rawData from '../photos.json'

export type CategoryId = 'portrait' | 'landscape' | 'pastoral'

export interface Photo {
  id: string
  category: CategoryId
  seriesId: string
  file: string
  title: string
  altText: string
  caption: string
  width: number
  height: number
  order: number
}

export interface Series {
  id: string
  title: string
  category: CategoryId
  summary: string
  photoIds: string[]
}

export interface Category {
  id: CategoryId
  label: string
}

export interface PhotoData {
  categories: Category[]
  series: Series[]
  photos: Photo[]
}

export const photoData = rawData as PhotoData

export const allPhotos: Photo[] = photoData.photos

const photoById = new Map(allPhotos.map((p) => [p.id, p]))

export const categories: Category[] = photoData.categories

export const seriesList: Series[] = photoData.series

export function getSeries(seriesId: string): Series | undefined {
  return seriesList.find((s) => s.id === seriesId)
}

export function categoryLabel(categoryId: string): string {
  return categories.find((c) => c.id === categoryId)?.label ?? categoryId
}

/** 某系列的照片，按 JSON 中的 order 升序排列 —— 系列页与首页精选共用此派生结果。 */
export function photosOfSeries(seriesId: string): Photo[] {
  const series = getSeries(seriesId)
  if (!series) return []
  return series.photoIds
    .map((id) => photoById.get(id))
    .filter((p): p is Photo => Boolean(p))
    .sort((a, b) => a.order - b.order)
}

/** /work 的筛选结果；'all' 时按系列顺序、系列内 order 排列。 */
export function photosOfFilter(filter: CategoryId | 'all'): Photo[] {
  if (filter === 'all') {
    return seriesList.flatMap((s) => photosOfSeries(s.id))
  }
  return seriesList
    .filter((s) => s.category === filter)
    .flatMap((s) => photosOfSeries(s.id))
}
