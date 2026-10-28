import { chromium } from 'playwright-core'
import fs from 'node:fs/promises'

await fs.mkdir('qa-artifacts/sections', { recursive: true })
const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4180'
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
const sections = [
  ['hero', '/', '#home'],
  ['locations', '/', '#location'],
  ['full-menu', '/menu', '#menu'],
  ['story', '/about', '#story'],
  ['feedback', '/feedback', '.feedback'],
]
for (const [name, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const page = await browser.newPage({ viewport })
  let current = null
  for (const [shotName, path, selector] of sections) {
    if (path !== current) {
      await page.goto(baseURL + path, { waitUntil: 'domcontentloaded' })
      await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto' })
      await page.waitForTimeout(500)
      current = path
    }
    await page.locator(selector).scrollIntoViewIfNeeded()
    await page.waitForTimeout(350)
    await page.screenshot({ path: `qa-artifacts/sections/${name}-${shotName}.png` })
  }
  await page.close()
}
await browser.close()
