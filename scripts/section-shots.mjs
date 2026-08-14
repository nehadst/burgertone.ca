import { chromium } from 'playwright-core'
import fs from 'node:fs/promises'

await fs.mkdir('qa-artifacts/sections', { recursive: true })
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
for (const [name, viewport, selectors] of [
  ['desktop', { width: 1440, height: 900 }, ['.assembly', '.flavour', '.products', '#menu', '.duet', '#story', '#location']],
  ['mobile', { width: 390, height: 844 }, ['.assembly', '.products', '#menu', '.duet', '#story', '#location']],
]) {
  const page = await browser.newPage({ viewport })
  await page.goto('http://127.0.0.1:5174', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(500)
  for (const selector of selectors) {
    await page.locator(selector).scrollIntoViewIfNeeded()
    await page.waitForTimeout(220)
    await page.screenshot({ path: `qa-artifacts/sections/${name}-${selector.replace(/[^a-z]+/gi, '')}.png` })
  }
  await page.close()
}
await browser.close()
