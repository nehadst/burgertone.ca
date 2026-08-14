import { chromium } from 'playwright-core'

const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
for (const viewport of [{ width: 768, height: 1024 }, { width: 390, height: 844 }]) {
  const page = await browser.newPage({ viewport })
  await page.goto('http://127.0.0.1:5174', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(300)
  const layout = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    offenders: [...document.querySelectorAll('body *')].map((element) => {
      const rect = element.getBoundingClientRect()
      return { selector: `${element.tagName.toLowerCase()}.${element.className}`, left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width), scrollWidth: element.scrollWidth, clientWidth: element.clientWidth }
    }).filter((item) => item.right > document.documentElement.clientWidth + 2 || item.left < -2 || item.scrollWidth > item.clientWidth + 2).slice(0, 30),
  }))
  await page.locator('.nav__toggle').click()
  const menu = await page.evaluate(() => ({
    expanded: document.querySelector('.nav__toggle').getAttribute('aria-expanded'),
    menuClass: document.querySelector('#mobile-menu').className,
    menuStyle: getComputedStyle(document.querySelector('#mobile-menu')).cssText,
    firstDisplay: getComputedStyle(document.querySelector('#mobile-menu > a')).display,
    firstVisible: Boolean(document.querySelector('#mobile-menu > a').offsetWidth || document.querySelector('#mobile-menu > a').offsetHeight),
  }))
  console.log(JSON.stringify({ layout, menu }, null, 2))
  await page.close()
}
await browser.close()
