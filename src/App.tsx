import { useEffect, useRef, useState } from 'react'
import { CHARSETS } from './glyphs'
import { DrawCell } from './DrawCell'
import { Logo } from './Logo'
import { buildFont } from './fontBuilder'
import { SupportCard } from './SupportCard'
import { GITHUB_URL, KOFI_URL } from './config'
import { clearState, loadState, saveState } from './persistence'
import type { Stroke } from './types'

const PREVIEW_FAMILY = 'FontifyPreview'
const saved = loadState()

export default function App() {
  const [fontName, setFontName] = useState('My Handwriting')
  const [sample, setSample] = useState('Hello! This is my handwriting.')
  const [strokesMap, setStrokesMap] = useState<Record<string, Stroke[]>>(() => saved?.map ?? {})
  const [enabledSets, setEnabledSets] = useState<string[]>(() => saved?.sets ?? ['latin'])
  const [previewReady, setPreviewReady] = useState(false)
  const [showSupport, setShowSupport] = useState(false)
  const faceRef = useRef<FontFace | null>(null)

  const activeSets = CHARSETS.filter(cs => enabledSets.includes(cs.id))
  const activeChars = activeSets.flatMap(cs => cs.groups.flatMap(g => g.chars))
  const drawn = activeChars.filter(ch => (strokesMap[ch] ?? []).length > 0).length

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
        .catch(err => console.error('Failed to load preview font:', err))
    }, 350)
    return () => clearTimeout(timer)
  }, [strokesMap])

  useEffect(() => {
    const timer = setTimeout(() => saveState(enabledSets, strokesMap), 500)
    return () => clearTimeout(timer)
  }, [strokesMap, enabledSets])

  function addStroke(ch: string, stroke: Stroke) {
    setStrokesMap(m => ({ ...m, [ch]: [...(m[ch] ?? []), stroke] }))
  }

  function clearChar(ch: string) {
    setStrokesMap(m => ({ ...m, [ch]: [] }))
  }

  function toggleSet(id: string) {
    setEnabledSets(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]))
  }

  function resetAll() {
    if (!confirm('Delete all your drawn characters?')) return
    setStrokesMap({})
    clearState()
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
    setShowSupport(true)
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="row">
          <Logo />
          <input
            className="name-input"
            value={fontName}
            onChange={e => setFontName(e.target.value)}
            placeholder="Your font name"
          />
          <span className="counter">
            {drawn} / {activeChars.length} characters
          </span>
          <button className="primary" onClick={download} disabled={drawn === 0}>
            Download font (.otf)
          </button>
        </div>
        <input
          className="sample-input"
          value={sample}
          onChange={e => setSample(e.target.value)}
          placeholder="Sample text"
        />
        <div
          className="preview"
          style={{ fontFamily: previewReady ? `'${PREVIEW_FAMILY}'` : undefined }}
        >
          {sample}
        </div>
      </header>

      <div className="charsets">
        {CHARSETS.map(cs => {
          const chars = cs.groups.flatMap(g => g.chars)
          const done = chars.filter(ch => (strokesMap[ch] ?? []).length > 0).length
          const active = enabledSets.includes(cs.id)
          return (
            <button
              key={cs.id}
              className={active ? 'chip active' : 'chip'}
              onClick={() => toggleSet(cs.id)}
            >
              {cs.label}
              <span className="chip-count">
                {done}/{chars.length}
              </span>
            </button>
          )
        })}
      </div>

      {activeSets.map(cs => (
        <section key={cs.id}>
          <h2>{cs.label}</h2>
          {cs.groups.map(group => (
            <div key={group.label}>
              <h3>{group.label}</h3>
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
            </div>
          ))}
        </section>
      ))}

      <footer className="footer">
        <span>Fontify · open source, free forever</span>
        <nav>
          {GITHUB_URL && (
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">
              GitHub
            </a>
          )}
          {KOFI_URL && (
            <a href={KOFI_URL} target="_blank" rel="noreferrer">
              Support on Ko-fi
            </a>
          )}
          <a href={`${import.meta.env.BASE_URL}impressum.html`}>Impressum</a>
          <a href={`${import.meta.env.BASE_URL}privacy.html`}>Privacy</a>
          <button className="linklike" onClick={resetAll}>
            Start over
          </button>
        </nav>
      </footer>

      {showSupport && <SupportCard onClose={() => setShowSupport(false)} />}
    </div>
  )
}
