import type { Stroke } from './types'

const KEY = 'fontify-v1'

// Strokes are stored as flat [x0, y0, x1, y1, ...] arrays, coordinates rounded
// to 0.5 cell units - keeps hundreds of glyphs well under localStorage limits.
type Saved = { sets: string[]; glyphs: Record<string, number[][]> }

export function saveState(sets: string[], map: Record<string, Stroke[]>): void {
  try {
    const glyphs: Record<string, number[][]> = {}
    for (const [ch, strokes] of Object.entries(map)) {
      if (!strokes.length) continue
      glyphs[ch] = strokes.map(s => s.flatMap(p => [Math.round(p.x * 2) / 2, Math.round(p.y * 2) / 2]))
    }
    localStorage.setItem(KEY, JSON.stringify({ sets, glyphs } satisfies Saved))
  } catch {
    // Storage full or unavailable - drawing continues, just without persistence.
  }
}

export function loadState(): { sets: string[]; map: Record<string, Stroke[]> } | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as Saved
    const map: Record<string, Stroke[]> = {}
    for (const [ch, flats] of Object.entries(data.glyphs ?? {})) {
      map[ch] = flats.map(flat => {
        const stroke: Stroke = []
        for (let i = 0; i + 1 < flat.length; i += 2) stroke.push({ x: flat[i], y: flat[i + 1] })
        return stroke
      })
    }
    const sets = data.sets?.length ? [...data.sets] : ['latin']
    // Saves predating the German split kept umlauts inside "latin" - keep those
    // drawings visible by enabling the new set they now live in.
    if (!sets.includes('german') && [...'ÄÖÜäöüß'].some(ch => map[ch]?.length)) {
      sets.push('german')
    }
    return { sets, map }
  } catch {
    return null
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Nothing to do - a failed clear only matters if storage exists.
  }
}
