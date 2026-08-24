import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Cookie-free analytics (GoatCounter) - only active when a site code is configured.
const goatcounter = import.meta.env.VITE_GOATCOUNTER_CODE
if (goatcounter) {
  const script = document.createElement('script')
  script.async = true
  script.src = 'https://gc.zgo.at/count.js'
  script.dataset.goatcounter = `https://${goatcounter}.goatcounter.com/count`
  document.head.appendChild(script)
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
