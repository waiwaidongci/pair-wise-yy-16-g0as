import { Link } from 'react-router-dom'
import { seriesList, photosOfSeries, categoryLabel } from '../data/photos'
import PhotoButton from '../components/PhotoButton'

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-image" aria-hidden="true" />
        <div className="hero-overlay" />
        <div className="container hero-content">
          <p className="eyebrow">Independent Photographer</p>
          <h1 className="hero-title">林晚</h1>
          <p className="hero-lede">
            独立摄影师，长期记录高原地带的人与荒野。
            <br />
            镜头里只有两类对象：坦露在光线下的面孔，与无人打扰的山脊和牧场。
          </p>
          <Link className="button button-gold" to="/work">
            查看全部作品
          </Link>
        </div>
      </section>

      <section className="container section">
        <header className="section-head">
          <h2 className="section-title">精选系列</h2>
          <span className="gold-rule" aria-hidden="true" />
          <p className="section-sub">三个正在进行中的长期拍摄计划</p>
        </header>

        <div className="series-grid">
          {seriesList.map((series) => {
            const cover = photosOfSeries(series.id)[0]
            return (
              <article key={series.id} className="series-card-wrap">
                <PhotoButton
                  photo={cover}
                  photos={photosOfSeries(series.id)}
                  index={0}
                  className="series-card"
                />
                <div className="series-card-body">
                  <p className="eyebrow">{categoryLabel(series.category)}</p>
                  <h3>{series.title}</h3>
                  <p>{series.summary}</p>
                  <Link className="text-link" to={`/work/${series.id}`}>
                    进入系列
                    <svg viewBox="0 0 24 24" aria-hidden="true" width="14" height="14">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </>
  )
}
