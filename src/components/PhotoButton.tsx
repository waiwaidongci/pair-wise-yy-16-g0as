import type { ReactNode } from 'react'
import type { Photo } from '../data/photos'
import { categoryLabel } from '../data/photos'
import { useLightbox } from '../lightbox/LightboxContext'
import RatioBox from './RatioBox'

interface PhotoButtonProps {
  photo: Photo
  photos: Photo[]
  index?: number
  /** 系列页叙事段落中使用的变体（不渲染悬浮 meta） */
  variant?: 'grid' | 'plain'
  className?: string
  /** 自定义内部内容（默认渲染按真实比例占位的图片） */
  children?: ReactNode
}

/**
 * 全站唯一的照片入口：/work 网格、首页精选、系列详情页都使用它，
 * 打开的是同一个全局 Lightbox；传入的 photos 决定灯箱内导航范围。
 */
export default function PhotoButton({
  photo,
  photos,
  index,
  variant = 'grid',
  className = '',
  children,
}: PhotoButtonProps) {
  const { open } = useLightbox()
  const openIndex = index ?? photos.findIndex((p) => p.id === photo.id)

  return (
    <button
      type="button"
      className={`photo-button photo-button--${variant} ${className}`.trim()}
      onClick={() => open(photos, openIndex)}
      aria-label={`查看照片：${photo.title}`}
    >
      {children ?? (
        <RatioBox width={photo.width} height={photo.height}>
          <img src={`/${photo.file}`} alt={photo.altText} loading="lazy" />
        </RatioBox>
      )}
      {variant === 'grid' && (
        <span className="photo-meta">
          <strong>{photo.title}</strong>
          <span className="photo-meta-category">{categoryLabel(photo.category)}</span>
        </span>
      )}
    </button>
  )
}
