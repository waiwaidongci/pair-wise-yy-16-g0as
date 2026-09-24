import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useLightbox } from './LightboxContext'
import { categoryLabel } from '../data/photos'

export default function Lightbox() {
  const { state, close, next, prev } = useLightbox()

  useEffect(() => {
    if (!state) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    document.addEventListener('keydown', onKey)
    document.body.classList.add('lightbox-open')
    // 底层站点对辅助技术隐藏（CSS 中同步 visibility:hidden 防止穿透绘制）
    const shell = document.querySelector('.site-shell')
    shell?.setAttribute('aria-hidden', 'true')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('lightbox-open')
      shell?.removeAttribute('aria-hidden')
    }
  }, [state, close, next, prev])

  if (!state) return null

  const { photos, index } = state
  const photo = photos[index]

  return createPortal(
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`照片查看器：${photo.title}`}
      onClick={close}
    >
      <button
        type="button"
        className="lightbox-close icon-button"
        aria-label="关闭"
        onClick={close}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 5l14 14M19 5L5 19" />
        </svg>
      </button>

      {photos.length > 1 && (
        <button
          type="button"
          className="lightbox-nav lightbox-prev icon-button"
          aria-label="上一张"
          onClick={(e) => {
            e.stopPropagation()
            prev()
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
      )}
      {photos.length > 1 && (
        <button
          type="button"
          className="lightbox-nav lightbox-next icon-button"
          aria-label="下一张"
          onClick={(e) => {
            e.stopPropagation()
            next()
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      <div className="lightbox-stage" onClick={(e) => e.stopPropagation()}>
        <div
          className="lightbox-frame"
          style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
        >
          <img
            key={photo.id}
            className="lightbox-image"
            src={`/${photo.file}`}
            alt={photo.altText}
          />
        </div>
        <div className="lightbox-info">
          <p className="eyebrow">
            {categoryLabel(photo.category)} · {index + 1} / {photos.length}
          </p>
          <h2>{photo.title}</h2>
          <p className="lightbox-caption">{photo.caption}</p>
        </div>
      </div>
    </div>,
    document.body,
  )
}
