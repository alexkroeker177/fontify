declare global {
  interface Window {
    goatcounter?: { count: (opts: { path: string; title?: string; event: boolean }) => void }
  }
}

// Anonymous product events (no cookies, no user identifiers). Silently a no-op
// when analytics is not configured or the script hasn't loaded.
export function trackEvent(name: string) {
  try {
    window.goatcounter?.count({ path: name, event: true })
  } catch {
    // Analytics must never break the app.
  }
}
