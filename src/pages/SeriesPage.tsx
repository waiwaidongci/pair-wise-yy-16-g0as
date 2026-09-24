import { Link, useParams } from 'react-router-dom'
import { getSeries, photosOfSeries, categoryLabel } from '../data/photos'
import PhotoButton from '../components/PhotoButton'
import RatioBox from '../components/RatioBox'
import NotFoundPage from './NotFoundPage'

export default function SeriesPage() {
  const { seriesId = '' } = useParams()
  const series = getSeries(seriesId)

  if (!series) return <NotFoundPage />

  const photos = photosOfSeries(series.id)
  const cover = photos[0]

  return (
    <div className="story">
      {/* 整屏封面：本身也是照片入口，点击在当前系列范围内打开灯箱 */}
      <section className="story-hero">
        <PhotoButton
          photo={cover}
          photos={photos}
          index={0}
          variant="plain"
          className="story-hero-button"
        >
          <RatioBox width={cover.width} height={cover.height}>
            <img src={`/${cover.file}`} alt={cover.altText} />
          </RatioBox>
        </PhotoButton>
        <div className="story-hero-overlay" aria-hidden="true" />
        <div className="container story-hero-content">
          <p className="eyebrow">{categoryLabel(series.category)} 系列</p>
          <h1 className="story-title">《{series.title}》</h1>
          <p className="story-summary">{series.summary}</p>
        </div>
      </section>

      <div className="container story-body">
        <nav className="breadcrumbs" aria-label="面包屑导航">
          <Link to="/work">作品集</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{series.title}</span>
        </nav>

        {photos.map((photo, i) => (
          <article key={photo.id} className="story-block">
            {i === 0 ? (
              /* 封面图已在上方整屏展示：首篇只保留文字，避免重复出图 */
              <div className="story-row story-row--text-first">
                <div className="story-text">
                  <span className="story-index">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h2>{photo.title}</h2>
                  <p>{photo.caption}</p>
                </div>
              </div>
            ) : (
              <div className={`story-row ${i % 2 === 0 ? 'story-row--reverse' : ''}`}>
                <div className="story-media">
                  <PhotoButton
                    photo={photo}
                    photos={photos}
                    index={i}
                    variant="plain"
                  />
                </div>
                <div className="story-text">
                  <span className="story-index">{String(i + 1).padStart(2, '0')}</span>
                  <h2>{photo.title}</h2>
                  <p>{photo.caption}</p>
                </div>
              </div>
            )}

            {i === Math.floor(photos.length / 2) && (
              <blockquote className="pull-quote">
                <p>{series.summary}</p>
                <cite>—— 系列自述</cite>
              </blockquote>
            )}
          </article>
        ))}

        <div className="story-footer">
          <span className="gold-rule" aria-hidden="true" />
          <Link className="button button-outline" to="/work">
            返回作品集
          </Link>
        </div>
      </div>
    </div>
  )
}
