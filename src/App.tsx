import { useEffect, useMemo, useRef, useState } from 'react'
import { GROUPS } from './glyphs'
import { DrawCell } from './DrawCell'
import { buildFont } from './fontBuilder'
import type { Stroke } from './types'

const PREVIEW_FAMILY = 'FontifyPreview'

export default function App() {
  const [fontName, setFontName] = useState('Meine Handschrift')
  const [sample, setSample] = useState('Hallo! Das ist meine Handschrift.')
  const [strokesMap, setStrokesMap] = useState<Record<string, Stroke[]>>({})
  const [previewReady, setPreviewReady] = useState(false)
  const faceRef = useRef<FontFace | null>(null)

  const drawn = useMemo(
    () => Object.values(strokesMap).filter(s => s.length > 0).length,
    [strokesMap],
  )
  const total = useMemo(() => GROUPS.reduce((n, g) => n + g.chars.length, 0), [])

  useEffect(() => {
    const timer = setTimeout(() => {
      const font = buildFont(PREVIEW_FAMILY, strokesMap)
      if (!font) {
        setPreviewReady(false)
        return
      }
      const face = new FontFace(PREVIEW_FAMILY, font.toArrayBuffer())
      face
        .load()
        .then(loaded => {
          if (faceRef.current) document.fonts.delete(faceRef.current)
          faceRef.current = loaded
          document.fonts.add(loaded)
          setPreviewReady(true)
        })
        .catch(err => console.error('Vorschau-Font konnte nicht geladen werden:', err))
    }, 350)
    return () => clearTimeout(timer)
  }, [strokesMap])

  function addStroke(ch: string, stroke: Stroke) {
    setStrokesMap(m => ({ ...m, [ch]: [...(m[ch] ?? []), stroke] }))
  }

  function clearChar(ch: string) {
    setStrokesMap(m => ({ ...m, [ch]: [] }))
  }

  function download() {
    const font = buildFont(fontName, strokesMap)
    if (!font) return
    const blob = new Blob([font.toArrayBuffer()], { type: 'font/otf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(fontName.trim() || 'Fontify').replace(/\s+/g, '-')}.otf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="row">
          <span className="logo">Fontify</span>
          <input
            className="name-input"
            value={fontName}
            onChange={e => setFontName(e.target.value)}
            placeholder="Name deiner Schrift"
          />
          <span className="counter">
            {drawn} / {total} Zeichen
          </span>
          <button className="primary" onClick={download} disabled={drawn === 0}>
            Font herunterladen (.otf)
          </button>
        </div>
        <input
          className="sample-input"
          value={sample}
          onChange={e => setSample(e.target.value)}
          placeholder="Beispieltext"
        />
        <div
          className="preview"
          style={{ fontFamily: previewReady ? `'${PREVIEW_FAMILY}'` : undefined }}
        >
          {sample}
        </div>
      </header>

      {GROUPS.map(group => (
        <section key={group.label}>
          <h2>{group.label}</h2>
          <div className="grid">
            {group.chars.map(ch => (
              <DrawCell
                key={ch}
                char={ch}
                strokes={strokesMap[ch] ?? []}
                onAddStroke={s => addStroke(ch, s)}
                onClear={() => clearChar(ch)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
