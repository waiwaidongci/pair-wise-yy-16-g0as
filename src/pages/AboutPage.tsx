import { Link } from 'react-router-dom'

const TIMELINE = [
  {
    year: '2014',
    text: '开始在川西高原为游牧家庭拍摄日常，完成第一组牧场纪实。',
  },
  {
    year: '2017',
    text: '作品《凝视》入选独立摄影展，此后专注于黑白肖像特写的长期拍摄。',
  },
  {
    year: '2020',
    text: '进驻海拔四千米的无人区驻地项目，持续记录山脊、草甸与四季雾气。',
  },
  {
    year: '2024',
    text: '三个系列集结为个人作品集网站，首次完整公开全部影像。',
  },
]

export default function AboutPage() {
  return (
    <div className="container section about-page">
      <div className="about-grid">
        <div className="about-portrait">
          <div className="ratio-box" style={{ aspectRatio: '2 / 3' }}>
            <img src="/photos/portrait/portrait-05.jpg" alt="摄影师林晚的肖像" />
          </div>
        </div>

        <div className="about-content">
          <p className="eyebrow">About</p>
          <h1 className="page-title">关于林晚</h1>
          <p>
            林晚是一名独立摄影师，工作范围在海拔三千米以上的高原与城市影棚之间往返。
            她相信照片是关于距离的练习：拍人时靠得足够近，拍荒野时退得足够远。
          </p>
          <p>
            她拍摄两类截然不同的题材——黑白肖像特写，以及高原地区的自然风光与牧场生活。
            前者收进系列《凝视》，后者延展为《无人之境》与《高原牧歌》。
            三组作品共同回答同一个问题：人在旷野里，与旷野在人心里，各自是什么模样。
          </p>

          <h2 className="timeline-title">经历</h2>
          <ol className="timeline">
            {TIMELINE.map((item) => (
              <li key={item.year}>
                <span className="timeline-dot" aria-hidden="true" />
                <time>{item.year}</time>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>

          <Link className="button button-gold" to="/contact">
            与我联系
          </Link>
        </div>
      </div>
    </div>
  )
}
