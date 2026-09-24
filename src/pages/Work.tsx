import { categories, categoryLabel } from "../data/photos";
import { useLightbox } from "../context/LightboxContext";
import { useWorkFilter } from "../context/WorkFilterContext";
import { PhotoImage } from "../components/PhotoImage";

export function Work() {
  const { category, setCategory, filteredPhotos } = useWorkFilter();
  const lightbox = useLightbox();

  const filters = [{ id: "all", label: "全部" }, ...categories];

  return (
    <>
      <div className="section-heading">
        <h2>作品集</h2>
      </div>

      <div className="filter-bar" role="group" aria-label="按分类筛选">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`filter-pill${category === f.id ? " active" : ""}`}
            aria-pressed={category === f.id}
            onClick={() => setCategory(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="masonry">
        {filteredPhotos.map((photo, i) => (
          <div className="masonry-item" key={photo.id}>
            <button
              type="button"
              className="photo-card"
              onClick={() => lightbox.open(filteredPhotos, i)}
              aria-label={`查看照片：${photo.title}`}
            >
              <PhotoImage photo={photo} />
              <div className="photo-card-meta">
                <h3>{photo.title}</h3>
                <span>{categoryLabel(photo.category)}</span>
              </div>
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
