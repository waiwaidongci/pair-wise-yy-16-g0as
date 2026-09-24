import { useEffect } from "react";
import { categoryLabel, photoSrc, type Photo } from "../data/photos";

interface LightboxProps {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * 全局共享灯箱（非路由组件，挂在应用根部，任何页面都可打开）。
 * 浏览范围完全由打开方传入的 photos 列表决定：
 * /work 传入当前筛选结果，系列页传入该系列照片，
 * 因此左右切换永远不会越出当前上下文。
 */
export function Lightbox({ photos, index, onClose, onPrev, onNext }: LightboxProps) {
  const photo = photos[index];
  const total = photos.length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  if (!photo) return null;

  return (
    <div
      className="lightbox-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`照片查看器：${photo.title}`}
      onClick={onClose}
    >
      <button type="button" className="lightbox-btn lightbox-close" aria-label="关闭" onClick={onClose}>
        ×
      </button>
      <button
        type="button"
        className="lightbox-btn lightbox-prev"
        aria-label="上一张"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
      >
        ‹
      </button>
      <button
        type="button"
        className="lightbox-btn lightbox-next"
        aria-label="下一张"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
      >
        ›
      </button>

      <div className="lightbox-stage" onClick={(e) => e.stopPropagation()}>
        <figure className="lightbox-figure">
          <img
            key={photo.id}
            src={photoSrc(photo)}
            alt={photo.altText}
            width={photo.width}
            height={photo.height}
          />
        </figure>
        <div className="lightbox-caption">
          <h3>{photo.title}</h3>
          <div className="lightbox-cat">{categoryLabel(photo.category)}</div>
          <p>{photo.caption}</p>
        </div>
        <div className="lightbox-counter" aria-live="polite">
          {index + 1} / {total}
        </div>
      </div>
    </div>
  );
}
