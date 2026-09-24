import type { CSSProperties, ReactNode } from 'react'

interface RatioBoxProps {
  width: number
  height: number
  className?: string
  children: ReactNode
}

/**
 * 按真实图片尺寸预留宽高比的容器：
 * 图片未加载时布局已按最终比例撑开，避免加载完成后产生布局抖动 (CLS)。
 */
export default function RatioBox({
  width,
  height,
  className = '',
  children,
}: RatioBoxProps) {
  const style: CSSProperties = { aspectRatio: `${width} / ${height}` }
  return (
    <div className={`ratio-box ${className}`.trim()} style={style}>
      {children}
    </div>
  )
}
