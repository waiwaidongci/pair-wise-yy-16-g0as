import { Link } from 'react-router-dom'
import { categories, photosOfFilter, getSeries } from '../data/photos'
import { useFilter } from '../state/FilterContext'
import PhotoButton from '../components/PhotoButton'

export default function WorkPage() {
  const { filter, setFilter } = useFilter()
  const visible = photosOfFilter(filter)

  return (
    <div className="container section">
      <header className="page-head">
        <p className="eyebrow">Portfolio</p>
        <h1 className="page-title">作品集</h1>
        <p className="page-lede">
          十四个被留下来的瞬间，分别属于肖像、风光与牧野三组长期拍摄。
        </p>
      </header>

      <div className="filters" role="group" aria-label="按题材筛选照片">
        <FilterButton
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          label="全部"
        />
        {categories.map((c) => (
          <FilterButton
            key={c.id}
            active={filter === c.id}
            onClick={() => setFilter(c.id)}
            label={c.label}
          />
        ))}
      </div>

      <p className="filter-count" aria-live="polite">
        共 {visible.length} 张
      </p>

      <div className="photo-masonry">
        {visible.map((photo, i) => (
          <PhotoButton key={photo.id} photo={photo} photos={visible} index={i} />
        ))}
      </div>

      {filter !== 'all' && visible.length > 0 && (
        <div className="series-cta">
          <Link className="button button-outline" to={`/work/${visible[0].seriesId}`}>
            阅读系列《{getSeries(visible[0].seriesId)?.title}》
          </Link>
        </div>
      )}
    </div>
  )
}

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      className={`filter-chip ${active ? 'is-active' : ''}`}
      aria-pressed={active}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
