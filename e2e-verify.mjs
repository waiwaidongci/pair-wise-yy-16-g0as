/**
 * 浏览器实测脚本：对照 task.md 的 7 条约束逐条在真实 Chromium 中验证。
 * 运行前先启动 dev server（npm run dev -- --port 5173），然后：node e2e-verify.mjs
 */
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:5173";
const SHOTS = "/tmp/shots";
fs.mkdirSync(SHOTS, { recursive: true });

let failures = 0;
function check(name, cond, extra = "") {
  const mark = cond ? "✅" : "❌";
  if (!cond) failures++;
  console.log(`${mark} ${name}${extra ? ` — ${extra}` : ""}`);
}

const browser = await chromium.launch();

// ---------- 网络请求监听（约束 6：无外部字体请求） ----------
const requests = [];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
page.on("request", (r) => requests.push(r.url()));

// ---------- 状态 A：首页 ----------
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
check("A1 首页展示摄影师姓名", await page.locator(".hero-copy h1").isVisible());
check(
  "A2 首页展示三个系列入口",
  (await page.locator(".series-card").count()) === 3 &&
    (await page.locator(".series-card h3").allTextContents()).join("") === "凝视无人之境高原牧歌"
);
const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
check("A3 暗色主题背景", bg === "rgb(10, 10, 10)", bg);
await page.screenshot({ path: `${SHOTS}/a-home.png`, fullPage: true });

// ---------- 状态 B：筛选 ----------
await page.goto(`${BASE}/work`, { waitUntil: "networkidle" });
check("B0 未筛选时展示全部 14 张", (await page.locator(".masonry-item").count()) === 14);
await page.getByRole("button", { name: "牧野", exact: true }).click();
const pastoralImgs = await page.locator(".masonry-item img").evaluateAll((els) =>
  els.map((el) => el.getAttribute("src"))
);
check(
  "B1 筛选牧野后仅 4 张且全部为 pastoral",
  pastoralImgs.length === 4 && pastoralImgs.every((s) => s.includes("/photos/pastoral/")),
  pastoralImgs.join(",")
);
check(
  "B2 牧野筛选控件为选中态",
  await page.locator(".filter-pill.active", { hasText: "牧野" }).isVisible()
);
await page.screenshot({ path: `${SHOTS}/b-work-filtered.png`, fullPage: true });

// ---------- 约束 1：筛选状态跨导航保持 ----------
// 全程使用客户端导航（点击链接），模拟真实用户操作路径
await page.getByRole("link", { name: "首页" }).click(); // 离开 /work
await page.locator(".series-card", { hasText: "高原牧歌" }).click(); // 进入系列页
await page.getByRole("link", { name: "← 返回作品集" }).click(); // 返回 /work
await page.waitForURL(`${BASE}/work`);
const stillPastoral = await page.locator(".masonry-item img").evaluateAll((els) =>
  els.map((el) => el.getAttribute("src"))
);
check(
  "C1 进入系列页再返回，筛选仍保持为牧野（4 张）",
  stillPastoral.length === 4 && stillPastoral.every((s) => s.includes("/photos/pastoral/")) &&
    (await page.locator(".filter-pill.active").textContent()) === "牧野"
);

// ---------- 状态 C / 约束 2：灯箱限定范围导航 ----------
// 当前筛选为牧野，点击第 2 张（pastoral-02）
await page.locator(".masonry-item").nth(1).click();
const lbImg = page.locator(".lightbox-figure img");
const lbCounter = page.locator(".lightbox-counter");
const srcOf = () => lbImg.getAttribute("src");
check(
  "C2 灯箱打开为 pastoral-02 且指示 2 / 4",
  (await srcOf()).includes("pastoral-02") && (await lbCounter.textContent()).trim() === "2 / 4",
  `${await srcOf()} | ${await lbCounter.textContent()}`
);
await page.screenshot({ path: `${SHOTS}/c1-lightbox-before-next.png` });
await page.getByRole("button", { name: "下一张" }).click();
check(
  "C3 下一张 → pastoral-03，指示 3 / 4",
  (await srcOf()).includes("pastoral-03") && (await lbCounter.textContent()).trim() === "3 / 4",
  `${await srcOf()} | ${await lbCounter.textContent()}`
);
await page.screenshot({ path: `${SHOTS}/c2-lightbox-after-next.png` });
await page.getByRole("button", { name: "下一张" }).click(); // → pastoral-04
const s4 = await srcOf();
await page.getByRole("button", { name: "下一张" }).click(); // 循环 → pastoral-01
const s5 = await srcOf();
await page.getByRole("button", { name: "下一张" }).click(); // → pastoral-02
const s6 = await srcOf();
check(
  "C4 连续翻页只在牧野组内循环（04→01→02），不出现其他分类",
  s4.includes("pastoral-04") && s5.includes("pastoral-01") && s6.includes("pastoral-02"),
  [s4, s5, s6].join(" → ")
);
// 灯箱说明文字
const capText = await page.locator(".lightbox-caption").textContent();
check(
  "C5 灯箱显示标题/分类/说明",
  capText.includes("坡地牛群") && capText.includes("牧野") &&
    capText.includes("坡度让每一头牛都站成了不同的姿势。")
);
await page.keyboard.press("Escape");
check("C6 Escape 关闭灯箱", (await page.locator(".lightbox-overlay").count()) === 0);

// 未筛选时灯箱范围为全部 14 张
await page.getByRole("button", { name: "全部", exact: true }).click();
await page.locator(".masonry-item").first().click();
check(
  "C7 全部视图下灯箱指示 1 / 14",
  (await lbCounter.textContent()).trim() === "1 / 14",
  await lbCounter.textContent()
);
await page.keyboard.press("Escape");

// ---------- 约束 3：CLS —— 延迟图片加载，测量布局稳定性 ----------
const clsPage = await ctx.newPage();
await clsPage.addInitScript(() => {
  window.__cls = 0;
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
  }).observe({ type: "layout-shift", buffered: true });
});
await clsPage.route("**/photos/**", async (route) => {
  await new Promise((r) => setTimeout(r, 1200)); // 人为拖慢图片
  await route.continue();
});
await clsPage.goto(`${BASE}/work`);
await clsPage.waitForTimeout(400);
// 图片未加载时占位高度应已正确（以第一张 portrait-01 4067x6000 为例）
const [ph, pw] = await clsPage.locator(".masonry-item .photo-frame").first().evaluate((el) => {
  const r = el.getBoundingClientRect();
  return [r.height, r.width];
});
const ratioOk = Math.abs(ph / pw - 6000 / 4067) < 0.02;
check("D1 图片未加载时占位已按真实宽高比撑开", ratioOk, `${pw.toFixed(0)}x${ph.toFixed(0)} ≈ 4067:6000`);
await clsPage.waitForLoadState("networkidle");
await clsPage.waitForTimeout(300);
const cls = await clsPage.evaluate(() => window.__cls);
check("D2 图片加载完成后 CLS ≈ 0（< 0.05）", cls < 0.05, `CLS=${cls.toFixed(4)}`);
const hasAttrs = await clsPage.locator(".masonry-item img").first().evaluate((el) => ({
  w: el.getAttribute("width"),
  h: el.getAttribute("height"),
}));
check("D3 img 携带 width/height 属性", hasAttrs.w === "4067" && hasAttrs.h === "6000", JSON.stringify(hasAttrs));
await clsPage.close();

// ---------- 状态 D：系列详情页内容来自数据源 ----------
await page.goto(`${BASE}/work/highland-pastoral`, { waitUntil: "networkidle" });
check("E1 系列页标题", (await page.locator(".series-hero-title h1").textContent()) === "高原牧歌");
const quote = page.locator(".pull-quote");
const quoteText = await quote.textContent();
const quoteStyle = await quote.evaluate((el) => {
  const s = getComputedStyle(el);
  return { family: s.fontFamily, style: s.fontStyle };
});
check(
  "E2 摘要为斜体 Playfair 引言",
  quoteText.includes("牧场、牛群与人在高原上的共生关系") &&
    quoteStyle.style === "italic" && quoteStyle.family.includes("Playfair Display"),
  JSON.stringify(quoteStyle)
);
const seriesSrcs = await page.locator(".series-block-media img").evaluateAll((els) =>
  els.map((el) => el.getAttribute("src"))
);
check(
  "E3 4 张照片按 order 顺序出现",
  JSON.stringify(seriesSrcs.map((s) => s.split("/").pop())) ===
    JSON.stringify(["pastoral-01.jpg", "pastoral-02.jpg", "pastoral-03.jpg", "pastoral-04.jpg"]),
  seriesSrcs.join(",")
);
const seriesText = await page.locator(".series-narrative").textContent();
check(
  "E4 每张照片使用真实标题与说明",
  ["独牛与木屋", "坡地牛群", "雪山下的歇息", "新疆牧场", "木屋比牛安静，牛比风安静。", "牛群铺满了整片草原，像撒出去的一把种子。"].every(
    (t) => seriesText.includes(t)
  )
);
await page.screenshot({ path: `${SHOTS}/d-series.png`, fullPage: true });
// 系列页灯箱范围 = 该系列 4 张
await page.locator(".series-block-media").first().click();
check(
  "E5 系列页灯箱指示 1 / 4（范围限定本系列）",
  (await page.locator(".lightbox-counter").textContent()).trim() === "1 / 4"
);
await page.keyboard.press("Escape");

// ---------- 状态 E：移动端 ----------
const mob = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mpage = await mob.newPage();
await mpage.goto(`${BASE}/work`, { waitUntil: "networkidle" });
const cols = await mpage.locator(".masonry").evaluate((el) => getComputedStyle(el).columns);
const itemW = await mpage.locator(".masonry-item").first().evaluate((el) => el.getBoundingClientRect().width);
check("F1 移动端网格为单列", cols === "1" && itemW > 300, `columns=${cols}, itemWidth=${itemW.toFixed(0)}`);
await mpage.screenshot({ path: `${SHOTS}/e-work-mobile.png`, fullPage: true });
await mpage.locator(".masonry-item").first().click();
const capBox = await mpage.locator(".lightbox-caption").boundingBox();
check(
  "F2 移动端灯箱说明为底部信息条",
  capBox && capBox.y > 500 && Math.abs(capBox.width - 390) < 2,
  capBox ? `y=${capBox.y.toFixed(0)} w=${capBox.width.toFixed(0)}` : "无"
);
await mpage.screenshot({ path: `${SHOTS}/e2-lightbox-mobile.png` });
await mob.close();

// ---------- 状态 F：联系表单 ----------
await page.goto(`${BASE}/contact`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: "发送", exact: true }).click();
const errTexts = await page.locator(".field-error").allTextContents();
check(
  "G1 空表单提交后出现行内错误提示",
  errTexts.length === 3 && errTexts.some((t) => t.includes("姓名")) && errTexts.some((t) => t.includes("邮箱")),
  errTexts.join(" | ")
);
check(
  "G2 校验未通过时提交按钮被禁用",
  await page.getByRole("button", { name: "发送", exact: true }).isDisabled()
);
await page.screenshot({ path: `${SHOTS}/f1-contact-errors.png` });
await page.fill("#contact-name", "张三");
await page.fill("#contact-email", "not-an-email");
await page.fill("#contact-message", "你好");
const emailErr = await page.locator(".form-field", { has: page.locator("#contact-email") }).locator(".field-error").textContent();
check("G3 邮箱格式错误有对应提示", emailErr.includes("格式"), emailErr);
await page.fill("#contact-email", "zhangsan@example.com");
check(
  "G4 全部合法后提交按钮恢复可用",
  await page.getByRole("button", { name: "发送", exact: true }).isEnabled()
);
await page.getByRole("button", { name: "发送", exact: true }).click();
await page.waitForSelector(".contact-success");
check(
  "G5 提交成功后显示感谢画面且表单被替换",
  (await page.locator(".contact-success h2").textContent()).includes("感谢") &&
    (await page.locator("form").count()) === 0
);
await page.screenshot({ path: `${SHOTS}/f2-contact-success.png` });

// ---------- 约束 6：字体 ----------
const fontReqs = requests.filter((u) => u.includes("fonts.g"));
const localFonts = requests.filter((u) => u.startsWith(BASE) && u.endsWith(".woff2"));
check("H1 无任何外部字体 CDN 请求", fontReqs.length === 0, fontReqs.join(",") || "无外部请求");
check("H2 本地 woff2 字体被加载", localFonts.length >= 2, localFonts.map((u) => u.split("/").pop()).join(","));
const h1Font = await page.evaluate(
  () => getComputedStyle(document.querySelector("h1, h2, h3")).fontFamily
);
check("H3 标题使用 Playfair Display", h1Font.includes("Playfair Display"), h1Font);

await browser.close();
console.log(failures === 0 ? "\n全部检查通过 ✔" : `\n${failures} 项检查失败 ✗`);
process.exit(failures === 0 ? 0 : 1);
