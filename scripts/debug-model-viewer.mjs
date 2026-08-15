import { chromium } from 'playwright-core'

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4180'
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })

page.on('console', (message) => console.log(`browser:${message.type()}: ${message.text()}`))
page.on('pageerror', (error) => console.log(`pageerror: ${error.message}`))
page.on('response', (response) => response.url().includes('.glb') && console.log(`glb:${response.status()}: ${response.url()}`))
page.on('requestfailed', (request) => request.url().includes('.glb') && console.log(`glb-failed: ${request.failure()?.errorText}`))
await page.route(/\.mp4(?:\?|$)/, (route) => route.abort())

await page.goto(baseURL, { waitUntil: 'domcontentloaded' })
await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto' })
await page.locator('#interactive-model').scrollIntoViewIfNeeded()

for (let index = 0; index < 12; index += 1) {
  await page.waitForTimeout(750)
  const state = await page.evaluate(() => {
    const viewer = document.querySelector('model-viewer')
    return {
      registered: Boolean(customElements.get('model-viewer')),
      exists: Boolean(viewer),
      src: viewer?.getAttribute('src'),
      loaded: viewer?.loaded,
      visible: viewer?.modelIsVisible,
      progress: document.querySelector('.model-stage__loader small')?.textContent,
      error: document.querySelector('.model-stage__error')?.textContent,
      top: document.querySelector('#interactive-model')?.getBoundingClientRect().top,
    }
  })
  console.log(`${index}: ${JSON.stringify(state)}`)
  if (state.loaded || state.error) break
}

await page.screenshot({ path: 'qa-artifacts/model-debug.png' })
await browser.close()
