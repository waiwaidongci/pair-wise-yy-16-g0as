import rawData from "./photos.json";

export interface Category {
  id: string;
  label: string;
}

export interface Series {
  id: string;
  title: string;
  category: string;
  summary: string;
  photoIds: string[];
}

export interface Photo {
  id: string;
  category: string;
  seriesId: string;
  file: string;
  title: string;
  altText: string;
  caption: string;
  width: number;
  height: number;
  order: number;
}

interface PhotoLibrary {
  categories: Category[];
  series: Series[];
  photos: Photo[];
}

/** 全站唯一的内容数据源，直接来自 mock-data/photos.json（原样拷贝，未做内容改动）。 */
export const library = rawData as PhotoLibrary;

export const categories: Category[] = library.categories;
export const allSeries: Series[] = library.series;
export const allPhotos: Photo[] = library.photos;

const photoById = new Map(allPhotos.map((p) => [p.id, p]));

export function getPhoto(id: string): Photo | undefined {
  return photoById.get(id);
}

export function getSeries(id: string): Series | undefined {
  return allSeries.find((s) => s.id === id);
}

/** 某一系列的照片，按数据中的 order 字段排序。 */
export function photosOfSeries(seriesId: string): Photo[] {
  return allPhotos
    .filter((p) => p.seriesId === seriesId)
    .sort((a, b) => a.order - b.order);
}

/** 按分类筛选；category 为 "all" 时返回全部。 */
export function photosInCategory(category: string): Photo[] {
  if (category === "all") return allPhotos;
  return allPhotos.filter((p) => p.category === category);
}

export function categoryLabel(categoryId: string): string {
  return categories.find((c) => c.id === categoryId)?.label ?? categoryId;
}

/** 照片的静态资源 URL（public/photos/ 下）。 */
export function photoSrc(photo: Photo): string {
  return `/${photo.file}`;
}
