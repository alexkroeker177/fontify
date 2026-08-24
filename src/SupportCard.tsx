import { KOFI_URL } from './config'

export function SupportCard({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Your font is downloading</h3>
        <p>
          Fontify is open source and free forever. If it made you smile, you can fuel the next
          feature:
        </p>
        {KOFI_URL && (
          <a className="primary kofi" href={KOFI_URL} target="_blank" rel="noreferrer">
            ☕ Support on Ko-fi
          </a>
        )}
        <button className="ghost" onClick={onClose}>
          Maybe later
        </button>
      </div>
    </div>
  )
}
