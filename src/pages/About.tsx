import { getPhoto } from "../data/photos";
import { PhotoImage } from "../components/PhotoImage";

const TIMELINE = [
  { year: "2014", text: "开始以黑白胶片拍摄人像特写，形成近距离凝视的个人风格。" },
  { year: "2017", text: "首次深入高原无人区，开始长期风光项目《无人之境》。" },
  { year: "2020", text: "在高原牧场驻留数月，记录游牧日常，完成《高原牧歌》主体拍摄。" },
  { year: "2023", text: "三组作品合并为个人长期项目「凝视与旷野」，持续拍摄中。" },
];

export function About() {
  const portrait = getPhoto("portrait-01");

  return (
    <div className="about-grid">
      <div className="about-portrait">
        {portrait && <PhotoImage photo={portrait} loading="eager" />}
      </div>
      <div className="about-bio">
        <p className="eyebrow">关于</p>
        <h1>林澜</h1>
        <p>
          独立摄影师，工作围绕两条线索展开：一是黑白人像特写，关注镜头前眼神与皮肤纹理中
          的坦露与防备；二是高原地区的自然风光与牧场生活记录，长时间驻留，等待光线与季节
          自己开口。
        </p>
        <p>
          她相信缓慢的观看。无论是在影棚里靠近一张脸，还是在海拔四千米的草甸上等一场雾散，
          拍摄对她来说都是同一件事——在对象放松警惕之前，先让自己安静下来。
        </p>

        <ul className="timeline">
          {TIMELINE.map((item) => (
            <li key={item.year}>
              <span className="timeline-year">{item.year}</span>
              {item.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
