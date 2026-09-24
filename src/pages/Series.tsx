import { Link, useParams } from "react-router-dom";
import { categoryLabel, getSeries, photosOfSeries } from "../data/photos";
import { useLightbox } from "../context/LightboxContext";
import { PhotoImage } from "../components/PhotoImage";

/**
 * 系列详情页：叙事式长图文排版。
 * 全部内容（标题、摘要、照片、说明文字、顺序）都来自 photos.json 中
 * 对应 seriesId 的数据，与 /work 共用同一份数据模型，没有第二份硬编码清单。
 */
export function Series() {
  const { seriesId } = useParams<{ seriesId: string }>();
  const lightbox = useLightbox();

  const series = seriesId ? getSeries(seriesId) : undefined;
  if (!series) {
    return (
      <>
        <div className="section-heading">
          <h2>未找到该系列</h2>
        </div>
        <p>
          <Link className="series-back" to="/work">
            ← 返回作品集
          </Link>
        </p>
      </>
    );
  }

  const photos = photosOfSeries(series.id);
  const cover = photos[0];
  // 引言（系列摘要）插在图文块中间位置
  const quoteAfter = Math.floor(photos.length / 2);

  return (
    <>
      <section className="series-hero" aria-label={`系列：${series.title}`}>
        <div className="photo-frame">
          <img
            src={`/${cover.file}`}
            alt={cover.altText}
            width={cover.width}
            height={cover.height}
            loading="eager"
          />
        </div>
        <div className="series-hero-title">
          <span>{categoryLabel(series.category)}系列</span>
          <h1>{series.title}</h1>
        </div>
      </section>

      <div className="series-narrative">
        {photos.map((photo, i) => (
          <div key={photo.id}>
            {i === quoteAfter && <blockquote className="pull-quote">“{series.summary}”</blockquote>}
            <div className={`series-block${i % 2 === 1 ? " flip" : ""}`}>
              <div
                className="series-block-media"
                onClick={() => lightbox.open(photos, i)}
                role="button"
                tabIndex={0}
                aria-label={`查看照片：${photo.title}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    lightbox.open(photos, i);
                  }
                }}
              >
                <PhotoImage photo={photo} />
              </div>
              <div className="series-block-text">
                <div className="photo-order">
                  {String(photo.order).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
                </div>
                <h2 className="photo-title">{photo.title}</h2>
                <p>{photo.caption}</p>
              </div>
            </div>
          </div>
        ))}

        <Link className="series-back" to="/work">
          ← 返回作品集
        </Link>
      </div>
    </>
  );
}
