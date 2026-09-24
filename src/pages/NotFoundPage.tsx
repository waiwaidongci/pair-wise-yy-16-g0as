import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="container section not-found">
      <p className="eyebrow">404</p>
      <h1 className="page-title">这里没有照片</h1>
      <p className="page-lede">你要找的页面不存在，或已被收进了暗房。</p>
      <Link className="button button-gold" to="/work">
        返回作品集
      </Link>
    </div>
  )
}
