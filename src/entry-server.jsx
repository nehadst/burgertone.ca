/* eslint-disable react-refresh/only-export-components -- build-time entry, not a hot-reloaded module */
// Build-time renderer used by scripts/prerender.mjs to write each page's HTML.
import { renderToString } from 'react-dom/server'
import App from './App'

export { OLD_PATHS, PAGES, SITE_URL } from './data'

export const render = (page) => renderToString(<App page={page} />)
