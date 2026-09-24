import { Link } from "react-router-dom";
import { allSeries, categoryLabel, getPhoto, photosOfSeries } from "../data/photos";
import { PhotoImage } from "../components/PhotoImage";

export function Home() {
  // Hero 使用系列首图作为背景，三个系列入口卡片取自同一份数据源
  const heroPhoto = getPhoto("landscape-01") ?? photosOfSeries("wilderness")[0];

  return (
    <>
      <section className="hero" aria-label="摄影师简介">
        <div className="hero-media photo-frame">
          <img
            src={`/${heroPhoto.file}`}
            alt={heroPhoto.altText}
            width={heroPhoto.width}
            height={heroPhoto.height}
            loading="eager"
          />
        </div>
        <div className="hero-copy">
          <p className="eyebrow">独立摄影师</p>
          <h1>林澜</h1>
          <p>
            拍摄黑白人像特写，也记录高原地区的自然风光与牧场生活。
            镜头追随光线落在皮肤与山脊上的方式——在凝视与旷野之间，寻找安静的叙事。
          </p>
        </div>
      </section>

      <hr className="gold-rule" />

      <section aria-label="精选系列">
        <div className="section-heading">
          <h2>精选系列</h2>
        </div>
        <div className="series-cards">
          {allSeries.map((series) => {
            const cover = getPhoto(series.photoIds[0]);
            if (!cover) return null;
            return (
              <Link key={series.id} to={`/work/${series.id}`} className="series-card">
                <PhotoImage photo={cover} ratio="4 / 3" />
                <div className="series-card-body">
                  <div className="series-card-category">{categoryLabel(series.category)}</div>
                  <h3>{series.title}</h3>
                  <p>{series.summary}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
