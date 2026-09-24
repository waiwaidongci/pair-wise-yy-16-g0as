/**
 * 真实浏览器走查脚本（Playwright）。
 * 覆盖 task.md「验证要求」中的交互式约束：
 *   A 首页 / B 作品集筛选 / C 筛选后灯箱仅在子集内循环 + 组内序号
 *   D 系列长页 / E 移动端单列与灯箱底部说明 / F 联系表单校验与感谢画面
 *   另：字体仅来自本地 /fonts/*.woff2，无 Google CDN 请求。
 *
 * 用法（在仓库根目录）：
 *   node e2e-verify.mjs
 */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const BASE = 'http://127.0.0.1:5173'
const OUT = new URL('./verify-shots/', import.meta.url).pathname

await mkdir(OUT, { recursive: true })

let passed = 0
let failed = 0
function check(name, cond, detail = '') {
  if (cond) {
    passed++
    console.log(`  ✓ ${name}`)
  } else {
    failed++
    console.error(`  ✘ ${name} ${detail}`)
  }
}

const browser = await chromium.launch({
  // 沙箱中无法下载浏览器时，可用环境变量指向已缓存的 Chromium
  executablePath:
    process.env.CHROMIUM_PATH ||
    '/home/node/.cache/ms-playwright/chromium_headless_shell-1228/chrome-linux/headless_shell',
})

/* ---------------- 桌面端 ---------------- */
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await ctx.newPage()
const requested = []
page.on('request', (r) => requested.push(r.url()))
const consoleErrors = []
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()))
page.on('pageerror', (e) => consoleErrors.push(String(e)))

// A. 首页
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
check('首页渲染摄影师姓名', await page.locator('h1').first().textContent())
await page.screenshot({ path: `${OUT}a-home.png`, fullPage: true })

// 首页精选卡片点击 → 同一个灯箱
await page.locator('.series-card').first().click()
await page.locator('.lightbox[role="dialog"]').waitFor()
check('首页精选打开共享灯箱', true)
await page.getByRole('button', { name: '关闭' }).click()
await page.locator('.lightbox').waitFor({ state: 'detached' })

// B. /work 筛选
await page.goto(`${BASE}/work`, { waitUntil: 'networkidle' })
check('全部照片共 14 张', (await page.locator('.photo-button').count()) === 14)
await page.getByRole('button', { name: '牧野' }).click()
check('牧野筛选后为 4 张', (await page.locator('.photo-button').count()) === 4)
check(
  '筛选项 aria-pressed=true',
  (await page.getByRole('button', { name: '牧野' }).getAttribute('aria-pressed')) ===
    'true',
)

// 约束1：进入系列长页再返回，筛选保留
await page.getByRole('link', { name: /高原牧歌/ }).first().click()
await page.waitForURL(/highland-pastoral/)
check('系列页标题', (await page.locator('.story-title').textContent()).includes('高原牧歌'))
await page.screenshot({ path: `${OUT}d-series.png`, fullPage: true })
await page.goBack()
await page.waitForURL(/\/work$/)
check(
  '返回后仍停留在牧野组（按钮高亮）',
  (await page.getByRole('button', { name: '牧野' }).getAttribute('aria-pressed')) ===
    'true',
)
check('返回后仍为 4 张', (await page.locator('.photo-button').count()) === 4)

// 约束2：灯箱导航限定在牧野子集，序号正确
await page.locator('.photo-button').first().click()
await page.locator('.lightbox').waitFor()
let counter = await page.locator('.lightbox-info .eyebrow').textContent()
check('灯箱序号为 1 / 4', /1\s*\/\s*4/.test(counter), counter)
await page.screenshot({ path: `${OUT}c-lightbox-pastoral.png` })

const titles = []
for (let i = 0; i < 4; i++) {
  titles.push((await page.locator('.lightbox-info h2').textContent()).trim())
  await page.getByRole('button', { name: '下一张' }).click()
}
const backAtStart =
  (await page.locator('.lightbox-info h2').textContent()).trim() === titles[0]
check('连点 4 次下一张回到首张（不越出牧野组）', backAtStart)
check('遍历的 4 张互不相同', new Set(titles).size === 4, titles.join('|'))
counter = await page.locator('.lightbox-info .eyebrow').textContent()
check('回到首张后序号仍为 1 / 4', /1\s*\/\s*4/.test(counter), counter)
await page.getByRole('button', { name: '关闭' }).click()

// 约束3：CLS —— 图片延迟 900ms 时容器已按比例撑开
await page.route('**/*.jpg', async (route) => {
  await new Promise((r) => setTimeout(r, 900))
  await route.continue()
})
await page.goto(`${BASE}/work`, { waitUntil: 'domcontentloaded' })
await page.getByRole('button', { name: '肖像' }).click()
const box = await page.locator('.photo-button .ratio-box').first().boundingBox()
const expected = 4067 / 6000
check(
  '加载前容器宽高比与图片真实比例一致',
  Math.abs(box.width / box.height - expected) < 0.01,
  `got ${box.width / box.height} expected ${expected}`,
)
await page.unroute('**/*.jpg')

// 约束4：系列页顺序与数据 order 一致
await page.goto(`${BASE}/work/highland-pastoral`, { waitUntil: 'networkidle' })
const storyTitles = await page.locator('.story article h2').allTextContents()
check(
  '系列长页 4 个段落标题来自 photos.json 且按 order 排列',
  JSON.stringify(storyTitles) ===
    JSON.stringify(['独牛与木屋', '坡地牛群', '雪山下的歇息', '新疆牧场']),
  storyTitles.join('|'),
)

// 关于页
await page.goto(`${BASE}/about`, { waitUntil: 'networkidle' })
check('关于页时间线 4 条', (await page.locator('.timeline li').count()) === 4)
await page.screenshot({ path: `${OUT}about.png`, fullPage: true })

// 约束7：联系表单
await page.goto(`${BASE}/contact`, { waitUntil: 'networkidle' })
const submit = page.getByRole('button', { name: '发送消息' })
check('空表单提交按钮禁用', (await submit.isDisabled()) === true)
await page.getByLabel('邮箱').fill('bad')
await page.getByLabel('邮箱').blur()
check('邮箱错误就地提示', await page.getByText('请输入有效的邮箱地址').isVisible())
check('邮箱非法时仍禁用提交', (await submit.isDisabled()) === true)
await page.getByLabel('姓名').fill('访客')
await page.getByLabel('邮箱').fill('hello@example.com')
await page.getByLabel('留言').fill('想了解一项完整的摄影合作计划，谢谢。')
check('全部合法后可提交', (await submit.isEnabled()) === true)
await submit.click()
await page.getByText('谢谢你的来信').waitFor()
check('提交后出现感谢画面', true)
await page.screenshot({ path: `${OUT}f-contact-success.png` })

// 约束6：无外部字体请求
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
const externalFonts = requested.filter((u) =>
  /fonts\.googleapis\.com|fonts\.gstatic\.com/.test(u),
)
check('无 Google Fonts / gstatic 请求', externalFonts.length === 0)
const localFonts = new Set(
  requested.filter((u) => u.includes('/fonts/') && u.endsWith('.woff2')),
)
check('本地 woff2 被加载（>=2 个文件）', localFonts.size >= 2, [...localFonts].join('|'))
check('控制台无 error', consoleErrors.length === 0, consoleErrors.join(' | '))

await ctx.close()

/* ---------------- 移动端（390px） ---------------- */
const mob = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
})
const mp = await mob.newPage()
await mp.goto(`${BASE}/work`, { waitUntil: 'networkidle' })
check('移动端汉堡菜单可见', await mp.locator('.menu').isVisible())
const r1 = await mp.locator('.photo-button').first().boundingBox()
const r2 = await mp.locator('.photo-button').nth(1).boundingBox()
check('移动端单列（第二张在第一张下方）', r2.y > r1.y + r1.height - 2)
await mp.screenshot({ path: `${OUT}e-mobile-work.png`, fullPage: true })

// 灯箱说明移到图片下方（底部信息条）
await mp.locator('.photo-button').first().click()
await mp.locator('.lightbox').waitFor()
await mp.waitForTimeout(500) // 等灯箱淡入动画结束
const img = await mp.locator('.lightbox-image').boundingBox()
const info = await mp.locator('.lightbox-info').boundingBox()
check('移动端灯箱说明位于图片下方', info.y >= img.y + img.height - 2)
await mp.screenshot({ path: `${OUT}e-mobile-lightbox.png` })
await mob.close()

await browser.close()

console.log(`\n${passed} 通过，${failed} 失败`)
process.exit(failed ? 1 : 0)
