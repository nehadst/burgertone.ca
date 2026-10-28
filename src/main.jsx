import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { PAGES } from './data'
import './styles.css'

const root = document.getElementById('root')
// Built pages say which page they are; the dev server serves index.html for every path, so fall back to the URL.
const path = window.location.pathname.replace(/\/+$/, '') || '/'
const page = root.dataset.page || Object.keys(PAGES).find((id) => PAGES[id].path === path) || 'home'
const app = (
  <React.StrictMode>
    <App page={page} />
  </React.StrictMode>
)

if (root.firstElementChild) ReactDOM.hydrateRoot(root, app)
else ReactDOM.createRoot(root).render(app)
