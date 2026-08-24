import { useEffect, useRef } from 'react'
import { BASELINE, CELL, XLINE } from './glyphs'
import { PEN } from './fontBuilder'
import type { Point, Stroke } from './types'

type Props = {
  char: string
  strokes: Stroke[]
  onAddStroke: (stroke: Stroke) => void
  onClear: () => void
}

export function DrawCell({ char, strokes, onAddStroke, onClear }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const currentRef = useRef<Point[] | null>(null)

  useEffect(() => {
    redraw()
  })

  function ctx2d() {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    if (canvas.width !== CELL * dpr) {
      canvas.width = CELL * dpr
      canvas.height = CELL * dpr
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    return ctx
  }

  function redraw() {
    const ctx = ctx2d()
    ctx.clearRect(0, 0, CELL, CELL)
    ctx.lineWidth = 1
    ctx.strokeStyle = '#ccd6e4'
    ctx.setLineDash([4, 4])
    guide(ctx, XLINE * CELL)
    ctx.setLineDash([])
    ctx.strokeStyle = '#9db0c5'
    guide(ctx, BASELINE * CELL)
    ctx.lineWidth = PEN
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#16181d'
    for (const s of strokes) paint(ctx, s)
    if (currentRef.current) paint(ctx, currentRef.current)
  }

  function guide(ctx: CanvasRenderingContext2D, y: number) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(CELL, y)
    ctx.stroke()
  }

  function paint(ctx: CanvasRenderingContext2D, s: Point[]) {
    if (!s.length) return
    ctx.beginPath()
    ctx.moveTo(s[0].x, s[0].y)
    if (s.length === 1) ctx.lineTo(s[0].x + 0.01, s[0].y)
    for (let i = 1; i < s.length; i++) ctx.lineTo(s[i].x, s[i].y)
    ctx.stroke()
  }

  function pos(e: React.PointerEvent): Point {
    const r = canvasRef.current!.getBoundingClientRect()
    return {
      x: (e.clientX - r.left) * (CELL / r.width),
      y: (e.clientY - r.top) * (CELL / r.height),
    }
  }

  function onDown(e: React.PointerEvent) {
    e.preventDefault()
    try {
      canvasRef.current!.setPointerCapture(e.pointerId)
    } catch {
      // Synthetic events (tests) have no active pointer to capture.
    }
    currentRef.current = [pos(e)]
    redraw()
  }

  function onMove(e: React.PointerEvent) {
    const current = currentRef.current
    if (!current) return
    const p = pos(e)
    const last = current[current.length - 1]
    if (Math.hypot(p.x - last.x, p.y - last.y) < 1.2) return
    current.push(p)
    redraw()
  }

  function onUp() {
    const done = currentRef.current
    if (!done) return
    currentRef.current = null
    onAddStroke(done)
  }

  return (
    <div className="cell">
      <div className="cell-head">
        <span className="cell-char">{char}</span>
        {strokes.length > 0 && (
          <button className="cell-clear" title="Löschen" onClick={onClear}>
            ×
          </button>
        )}
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', aspectRatio: '1 / 1', touchAction: 'none', display: 'block' }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      />
    </div>
  )
}
