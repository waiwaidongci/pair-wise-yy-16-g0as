import { defineConfig } from '@playwright/test'
import base from './playwright.config'

// 本地走查用：被测应用就是仓库根目录（提交包结构中根目录即 starter）
export default defineConfig({
  ...base,
  webServer: {
    ...(base as any).webServer,
    cwd: '..',
  },
})
