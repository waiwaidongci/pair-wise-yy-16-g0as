import { photoSrc, type Photo } from "../data/photos";

interface PhotoImageProps {
  photo: Photo;
  className?: string;
  loading?: "lazy" | "eager";
  /** 覆盖占位比例（如封面统一裁切）；缺省使用照片真实宽高比 */
  ratio?: string;
}

/**
 * 按 photos.json 中的真实 width/height 预撑占位：
 * 外层用 aspect-ratio 锁定比例，img 同时携带 width/height 属性，
 * 图片加载完成前布局已经稳定，不会产生 CLS 跳动。
 */
export function PhotoImage({ photo, className, loading = "lazy", ratio }: PhotoImageProps) {
  return (
    <div
      className={`photo-frame${className ? ` ${className}` : ""}`}
      style={{ aspectRatio: ratio ?? `${photo.width} / ${photo.height}` }}
    >
      <img
        src={photoSrc(photo)}
        alt={photo.altText}
        width={photo.width}
        height={photo.height}
        loading={loading}
      />
    </div>
  );
}
