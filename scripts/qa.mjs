import { chromium } from 'playwright-core'
import fs from 'node:fs/promises'

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:5174'
const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const orderURL = 'https://burgertone.orderingclub.com/en/burgertone?menu=61439df1967db3aeae03277e_2'
const sizes = [
  ['desktop', { width: 1440, height: 900 }],
  ['tablet', { width: 768, height: 1024 }],
  ['mobile', { width: 390, height: 844 }],
]

await fs.mkdir('qa-artifacts', { recursive: true })
const browser = await chromium.launch({ headless: true, executablePath })
const results = []

for (const [name, viewport] of sizes) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 })
  const page = await context.newPage()
  const errors = []
  page.on('console', (message) => message.type() === 'error' && errors.push(`console: ${message.text()}`))
  page.on('pageerror', (error) => errors.push(`page: ${error.message}`))
  page.on('requestfailed', (request) => {
    const expectedMediaSeekAbort = request.failure()?.errorText === 'net::ERR_ABORTED' && (request.resourceType() === 'media' || request.url().startsWith('blob:') || request.url().includes('.mp4'))
    if (!expectedMediaSeekAbort && !request.url().includes('fonts.googleapis.com') && !request.url().includes('fonts.gstatic.com')) errors.push(`request: ${request.url()} (${request.failure()?.errorText})`)
  })

  await page.goto(baseURL, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(500)

  const hrefs = await page.locator('a[href^="#"]').evaluateAll((links) => links.map((link) => link.getAttribute('href')))
  const missingAnchors = await page.evaluate((anchors) => anchors.filter((href) => href !== '#' && !document.querySelector(href)), hrefs)
  const orderHrefs = await page.locator('a[data-order-link]').evaluateAll((links) => links.map((link) => ({ href: link.href, target: link.target, rel: link.rel })))
  const badOrders = orderHrefs.filter((link) => link.href !== orderURL || link.target !== '_blank' || !link.rel.includes('noopener') || !link.rel.includes('noreferrer'))

  const documentHeight = await page.evaluate(() => document.documentElement.scrollHeight)
  let maxOverflow = 0
  for (let step = 0; step <= 12; step += 1) {
    const y = Math.floor((documentHeight - viewport.height) * (step / 12))
    await page.evaluate((nextY) => window.scrollTo(0, nextY), y)
    await page.waitForTimeout(15)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    maxOverflow = Math.max(maxOverflow, overflow)
  }

  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(120)
  if (name !== 'desktop') {
    await page.locator('.nav__toggle').click()
    await page.waitForTimeout(100)
    const expanded = await page.locator('.nav__toggle').getAttribute('aria-expanded')
    const firstLinkVisible = await page.locator('#mobile-menu > a').first().isVisible()
    if (expanded !== 'true' || !firstLinkVisible) errors.push('mobile menu did not open accessibly')
    await page.keyboard.press('Escape')
  }

  if (name !== 'desktop') await page.locator('.nav__toggle').click()
  await page.locator('#mobile-menu a[href="#menu"]').click()
  await page.waitForTimeout(2400)
  const menuAnchor = await page.locator('#menu').evaluate((element) => ({
    top: Math.round(element.getBoundingClientRect().top),
    title: element.querySelector('#full-menu-title')?.textContent?.trim(),
  }))
  if (menuAnchor.top < 55 || menuAnchor.top > 100 || menuAnchor.title !== 'The full setlist.') errors.push(`Menu anchor landed incorrectly: ${JSON.stringify(menuAnchor)}`)

  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(120)
  await page.screenshot({ path: `qa-artifacts/${name}-hero.png`, fullPage: false })
  await page.keyboard.press('Tab')
  const focused = await page.evaluate(() => document.activeElement?.className || document.activeElement?.tagName)
  results.push({ name, viewport, missingAnchors, orderLinks: orderHrefs.length, badOrders, maxOverflow, menuAnchor, focused, errors })
  await fs.writeFile('qa-artifacts/results.json', JSON.stringify({ baseURL, results }, null, 2))
  await context.close()
}

const reducedContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
const reducedPage = await reducedContext.newPage()
const reducedErrors = []
reducedPage.on('pageerror', (error) => reducedErrors.push(error.message))
await reducedPage.goto(baseURL, { waitUntil: 'domcontentloaded' })
await reducedPage.waitForTimeout(500)
await reducedPage.locator('#menu').scrollIntoViewIfNeeded()
const reducedMenuVisible = await reducedPage.locator('#menu').isVisible()
await reducedPage.screenshot({ path: 'qa-artifacts/reduced-motion-menu.png', fullPage: false })
await reducedContext.close()
await browser.close()

const report = { baseURL, results, reducedMotion: { menuVisible: reducedMenuVisible, errors: reducedErrors } }
await fs.writeFile('qa-artifacts/results.json', JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))

if (results.some((result) => result.errors.length || result.missingAnchors.length || result.badOrders.length || result.maxOverflow > 1) || reducedErrors.length || !reducedMenuVisible) process.exitCode = 1
