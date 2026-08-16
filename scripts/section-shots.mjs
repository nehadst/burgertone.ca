import { chromium } from 'playwright-core'
import fs from 'node:fs/promises'

await fs.mkdir('qa-artifacts/sections', { recursive: true })
const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4180'
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
for (const [name, viewport, sections] of [
  ['desktop', { width: 1440, height: 900 }, [
    ['tracks-head', '.menu-experience__head'],
    ['model-console', '.menu-console'],
    ['family-meal', '.family-feature'],
    ['full-menu', '#menu'],
    ['story', '#story'],
    ['locations', '#location'],
  ]],
  ['mobile', { width: 390, height: 844 }, [
    ['tracks-head', '.menu-experience__head'],
    ['model-console', '.menu-console'],
    ['family-meal', '.family-feature'],
    ['full-menu', '#menu'],
    ['story', '#story'],
    ['locations', '#location'],
  ]],
]) {
  const page = await browser.newPage({ viewport })
  await page.route(/\.mp4(?:\?|$)/, (route) => route.abort())
  await page.goto(baseURL, { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto' })
  await page.waitForTimeout(500)
  for (const [shotName, selector] of sections) {
    await page.locator(selector).scrollIntoViewIfNeeded()
    if (selector === '.menu-console') await page.waitForFunction(() => document.querySelector('model-viewer')?.loaded, null, { timeout: 30_000 })
    await page.waitForTimeout(350)
    await page.screenshot({ path: `qa-artifacts/sections/${name}-${shotName}.png` })
  }
  await page.close()
}
await browser.close()
