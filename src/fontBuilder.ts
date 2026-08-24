import { Font, Glyph, Path } from 'opentype.js'
import ImageTracer from 'imagetracerjs'
import { BASELINE, CELL } from './glyphs'
import type { Stroke } from './types'

const UPM = 1000
// Strokes are rasterized at higher resolution before tracing for smoother outlines.
const TRACE = 480
const SCALE = TRACE / CELL
const K = UPM / TRACE
const BEARING = 40
export const PEN = 9

type Seg = { type: 'L' | 'Q'; x1: number; y1: number; x2: number; y2: number; x3?: number; y3?: number }
type Traced = { segments: Seg[]; isholepath: boolean }

// Keyed by stroke-array identity: editing a cell creates a fresh array, so stale
// entries can never be served for changed drawings.
const glyphCache = new WeakMap<Stroke[], Glyph | null>()

export function buildFont(familyName: string, strokesMap: Record<string, Stroke[]>): Font | null {
  const glyphs: Glyph[] = [
    new Glyph({ name: '.notdef', advanceWidth: 520, path: new Path() }),
    new Glyph({ name: 'space', unicode: 32, advanceWidth: 300, path: new Path() }),
  ]
  let drawn = 0
  for (const [ch, strokes] of Object.entries(strokesMap)) {
    if (!strokes.length) continue
    let glyph = glyphCache.get(strokes)
    if (glyph === undefined) {
      glyph = traceGlyph(ch, strokes)
      glyphCache.set(strokes, glyph)
    }
    if (!glyph) continue
    glyphs.push(glyph)
    drawn++
  }
  if (!drawn) return null
  return new Font({
    familyName: familyName.trim() || 'Fontify',
    styleName: 'Regular',
    unitsPerEm: UPM,
    ascender: Math.round(BASELINE * UPM),
    descender: -Math.round((1 - BASELINE) * UPM),
    glyphs,
  })
}

function traceGlyph(ch: string, strokes: Stroke[]): Glyph | null {
  const paths = trace(strokes)
  if (!paths.length) return null

  let minX = Infinity
  let maxX = -Infinity
  for (const p of paths) {
    for (const s of p.segments) {
      for (const [x] of segPoints(s)) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
      }
    }
  }
  if (!isFinite(minX)) return null

  const fx = (x: number) => Math.round((x - minX) * K) + BEARING
  const fy = (y: number) => Math.round((BASELINE * TRACE - y) * K)

  const path = new Path()
  for (const traced of paths) {
    const segs = orient(traced)
    if (!segs.length) continue
    path.moveTo(fx(segs[0].x1), fy(segs[0].y1))
    for (const s of segs) {
      if (s.type === 'L') path.lineTo(fx(s.x2), fy(s.y2))
      else path.quadTo(fx(s.x2), fy(s.y2), fx(s.x3!), fy(s.y3!))
    }
    path.close()
  }

  const cp = ch.codePointAt(0)!
  return new Glyph({
    name: 'uni' + cp.toString(16).toUpperCase().padStart(4, '0'),
    unicode: cp,
    advanceWidth: Math.round((maxX - minX) * K) + 2 * BEARING,
    path,
  })
}

function trace(strokes: Stroke[]): Traced[] {
  const canvas = document.createElement('canvas')
  canvas.width = TRACE
  canvas.height = TRACE
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, TRACE, TRACE)
  ctx.lineWidth = PEN * SCALE
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = '#000'
  for (const s of strokes) {
    if (!s.length) continue
    ctx.beginPath()
    ctx.moveTo(s[0].x * SCALE, s[0].y * SCALE)
    if (s.length === 1) ctx.lineTo(s[0].x * SCALE + 0.01, s[0].y * SCALE)
    for (let i = 1; i < s.length; i++) ctx.lineTo(s[i].x * SCALE, s[i].y * SCALE)
    ctx.stroke()
  }

  const traced = ImageTracer.imagedataToTracedata(ctx.getImageData(0, 0, TRACE, TRACE), {
    pal: [
      { r: 0, g: 0, b: 0, a: 255 },
      { r: 255, g: 255, b: 255, a: 255 },
    ],
    colorsampling: 0,
    numberofcolors: 2,
    mincolorratio: 0,
    ltres: 1,
    qtres: 1,
    pathomit: 8,
    rightangleenhance: false,
    blurradius: 0,
    roundcoords: 2,
  })
  const darkIndex = traced.palette.findIndex(
    (c: { r: number; g: number; b: number }) => c.r + c.g + c.b < 384,
  )
  const layer: Traced[] = traced.layers[darkIndex] ?? []
  return layer.filter(p => p.segments && p.segments.length > 2)
}

function segPoints(s: Seg): [number, number][] {
  const pts: [number, number][] = [
    [s.x1, s.y1],
    [s.x2, s.y2],
  ]
  if (s.type === 'Q') pts.push([s.x3!, s.y3!])
  return pts
}

// The y-flip into font coordinates inverts winding, and nonzero fill needs holes
// wound opposite to outer contours - normalize both explicitly.
function orient(traced: Traced): Seg[] {
  const area = signedArea(traced.segments)
  const needReverse = traced.isholepath ? area < 0 : area > 0
  return needReverse ? reverse(traced.segments) : traced.segments
}

function signedArea(segs: Seg[]): number {
  let a = 0
  for (const s of segs) {
    const [ex, ey] = s.type === 'Q' ? [s.x3!, s.y3!] : [s.x2, s.y2]
    a += s.x1 * ey - ex * s.y1
  }
  return a / 2
}

function reverse(segs: Seg[]): Seg[] {
  return segs
    .slice()
    .reverse()
    .map(s =>
      s.type === 'L'
        ? { type: 'L' as const, x1: s.x2, y1: s.y2, x2: s.x1, y2: s.y1 }
        : { type: 'Q' as const, x1: s.x3!, y1: s.y3!, x2: s.x2, y2: s.y2, x3: s.x1, y3: s.y1 },
    )
}
