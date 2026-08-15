import { chromium } from 'playwright-core'

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:5174'
const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const scrollUnits = 3.2 + 2.2 + 1.9
const cases = [
  ['desktop', { viewport: { width: 1440, height: 900 } }],
  ['mobile', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true }],
]

const browser = await chromium.launch({ headless: true, executablePath })
const reports = []
let passed = true

for (const [name, options] of cases) {
  const page = await browser.newPage(options)
  const errors = []

  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()))
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto(baseURL, { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto' })
  if (options.hasTouch) await page.touchscreen.tap(2, 180)
  await page.waitForFunction(() => document.querySelector('.cinema video')?.readyState >= 2, null, { timeout: 20_000 })

  const scrollDistance = options.viewport.height * scrollUnits

  async function jumpTo(y) {
    await page.evaluate((nextY) => window.scrollTo(0, nextY), y)
    await page.waitForFunction(() => {
      const videos = [...document.querySelectorAll('.cinema video')]
      const active = videos.find((video) => Number.parseFloat(getComputedStyle(video).opacity) > .5)
      return active?.readyState >= 2 && !active.seeking
    }, null, { timeout: 20_000 })
    await page.waitForTimeout(80)
    return page.evaluate(() => {
      const videos = [...document.querySelectorAll('.cinema video')]
      const activeIndex = videos.findIndex((video) => Number.parseFloat(getComputedStyle(video).opacity) > .5)
      const active = videos[activeIndex]
      return {
        activeIndex,
        currentTime: active?.currentTime,
        duration: active?.duration,
        paused: active?.paused,
        scrollY: window.scrollY,
        cinemaTop: document.querySelector('.cinema').getBoundingClientRect().top,
        progressTransform: getComputedStyle(document.querySelector('.cinema__timeline i')).transform,
      }
    })
  }

  await jumpTo(scrollDistance * .08)
  const fastJump = await jumpTo(scrollDistance * .82)
  const stoppedSamples = []
  for (const delay of [100, 300, 700]) {
    await page.waitForTimeout(delay)
    stoppedSamples.push(await page.locator('.cinema video').nth(fastJump.activeIndex).evaluate((video) => video.currentTime))
  }

  const afterSection = await jumpTo(scrollDistance + options.viewport.height)
  const reverseJump = await jumpTo(scrollDistance * .12)

  const maxStoppedDrift = Math.max(...stoppedSamples.map((time) => Math.abs(time - fastJump.currentTime)))
  const report = { name, fastJump, stoppedSamples, maxStoppedDrift, afterSection, reverseJump, errors }
  reports.push(report)
  passed &&= (
    fastJump.activeIndex === 2
    && fastJump.paused
    && maxStoppedDrift < .03
    && afterSection.activeIndex === 2
    && afterSection.currentTime > afterSection.duration - .15
    && afterSection.progressTransform.includes('1, 0, 0, 1')
    && reverseJump.activeIndex === 0
    && errors.length === 0
  )
  await page.close()
}

console.log(JSON.stringify(reports, null, 2))
await browser.close()
if (!passed) process.exitCode = 1
