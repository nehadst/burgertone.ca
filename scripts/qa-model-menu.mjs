import { chromium } from 'playwright-core'
import sharp from 'sharp'
import fs from 'node:fs/promises'

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:5175'
const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const outputDirectory = 'qa-artifacts/models'

await fs.mkdir(outputDirectory, { recursive: true })
const browser = await chromium.launch({ headless: true, executablePath })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 })
const errors = []

page.on('console', (message) => message.type() === 'error' && errors.push(`console: ${message.text()}`))
page.on('pageerror', (error) => errors.push(`page: ${error.message}`))
await page.route(/\.mp4(?:\?|$)/, (route) => route.abort())

await page.goto(baseURL, { waitUntil: 'domcontentloaded' })
await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto' })
await page.locator('#interactive-model').scrollIntoViewIfNeeded()
await page.waitForFunction(() => customElements.get('model-viewer'))

const buttons = page.locator('.model-tracks button')
const modelCount = await buttons.count()
const models = []

for (let index = 0; index < modelCount; index += 1) {
  const button = buttons.nth(index)
  const name = (await button.locator('strong').innerText()).trim()
  await button.click()
  await page.locator('#interactive-model').scrollIntoViewIfNeeded()
  await page.waitForFunction((expectedName) => {
    const viewer = document.querySelector('model-viewer')
    return viewer?.loaded && viewer.alt.includes(expectedName)
  }, name, { timeout: 30_000 })
  await page.waitForTimeout(180)

  const state = await page.locator('model-viewer').evaluate((viewer) => ({
    alt: viewer.alt,
    loaded: viewer.loaded,
    visible: viewer.modelIsVisible,
    src: viewer.getAttribute('src'),
    orbit: viewer.getCameraOrbit?.(),
  }))
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const path = `${outputDirectory}/${String(index + 1).padStart(2, '0')}-${slug}.png`
  await page.locator('#interactive-model').screenshot({ path })
  models.push({ name, path, ...state })
}

await buttons.first().click()
await page.locator('#interactive-model').scrollIntoViewIfNeeded()
await page.waitForFunction(() => document.querySelector('model-viewer')?.loaded)
const stage = await page.locator('#interactive-model').boundingBox()
const beforeDrag = await page.locator('model-viewer').evaluate((viewer) => viewer.getCameraOrbit().theta)
await page.mouse.move(stage.x + stage.width * .5, stage.y + stage.height * .5)
await page.mouse.down()
await page.mouse.move(stage.x + stage.width * .72, stage.y + stage.height * .5, { steps: 12 })
await page.mouse.up()
await page.waitForTimeout(100)
const afterDrag = await page.locator('model-viewer').evaluate((viewer) => viewer.getCameraOrbit().theta)

const thumbWidth = 320
const thumbHeight = 230
const columns = 4
const rows = Math.ceil(models.length / columns)
const composites = []
for (let index = 0; index < models.length; index += 1) {
  const image = await sharp(models[index].path).resize(thumbWidth, thumbHeight, { fit: 'cover' }).png().toBuffer()
  composites.push({ input: image, left: (index % columns) * thumbWidth, top: Math.floor(index / columns) * thumbHeight })
}
await sharp({ create: { width: columns * thumbWidth, height: rows * thumbHeight, channels: 4, background: '#0b0a09' } })
  .composite(composites)
  .png()
  .toFile(`${outputDirectory}/contact-sheet.png`)

const report = {
  baseURL,
  modelCount,
  models,
  drag: { before: beforeDrag, after: afterDrag, changed: Math.abs(afterDrag - beforeDrag) > .05 },
  errors,
}
await fs.writeFile(`${outputDirectory}/report.json`, JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))

await browser.close()
if (modelCount !== 14 || models.some((model) => !model.loaded || !model.visible) || !report.drag.changed || errors.length) process.exitCode = 1
