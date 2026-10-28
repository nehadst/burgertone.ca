// Runs after the client and SSR builds: writes one pre-rendered HTML file per page (dist/menu.html, ...)
// with its own title, description and canonical URL, plus a Cloudflare _redirects file for the old Wix URLs.
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const dist = path.resolve('dist')
const ssrDir = path.resolve('dist-ssr')
const { render, PAGES, OLD_PATHS, SITE_URL } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href)
const template = await fs.readFile(path.join(dist, 'index.html'), 'utf8')
const attr = (value) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

const swap = (html, pattern, value) => {
  if (!pattern.test(html)) throw new Error(`prerender: ${pattern} not found in index.html`)
  return html.replace(pattern, (_, start) => start + value)
}

for (const [id, page] of Object.entries(PAGES)) {
  const url = SITE_URL + page.path
  let html = template.replace(/<title>[^<]*<\/title>/, `<title>${attr(page.title)}</title>`)
  html = swap(html, /(<meta name="description" content=")[^"]*/, attr(page.description))
  html = swap(html, /(<meta property="og:title" content=")[^"]*/, attr(page.title))
  html = swap(html, /(<meta property="og:description" content=")[^"]*/, attr(page.description))
  html = swap(html, /(<meta property="og:url" content=")[^"]*/, url)
  html = swap(html, /(<link rel="canonical" href=")[^"]*/, url)
  // The hero poster is only on the home page.
  if (id !== 'home') html = html.replace(/\s*<link rel="preload" as="image"[^>]*>/, '')
  if (id === 'notFound') html = html.replace(/<link rel="canonical"[^>]*>/, '<meta name="robots" content="noindex" />')
  html = html.replace('<div id="root"><!--app-html--></div>', `<div id="root" data-page="${id}">${render(id)}</div>`)
  // Cloudflare serves menu.html at /menu (and redirects /menu.html there), matching the canonical URLs.
  await fs.writeFile(path.join(dist, page.path === '/' ? 'index.html' : `${page.path}.html`), html)
  console.log(`prerendered ${page.path}`)
}

// Old Wix pages that no longer exist: permanent (301) redirects to the home page, applied by Cloudflare.
await fs.writeFile(path.join(dist, '_redirects'), OLD_PATHS.map((oldPath) => `${oldPath} / 301`).join('\n') + '\n')
console.log(`_redirects: ${OLD_PATHS.join(', ')} -> /`)

await fs.rm(ssrDir, { recursive: true, force: true })
