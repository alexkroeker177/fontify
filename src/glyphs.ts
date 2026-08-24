// Logical drawing-cell coordinate system: CELL x CELL units, y grows downward.
export const CELL = 160
// Guide lines as fractions of the cell height (from the top edge).
export const BASELINE = 0.72
export const XLINE = 0.44

export const GROUPS: { label: string; chars: string[] }[] = [
  { label: 'Großbuchstaben', chars: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ'] },
  { label: 'Kleinbuchstaben', chars: [...'abcdefghijklmnopqrstuvwxyzäöüß'] },
  { label: 'Ziffern', chars: [...'0123456789'] },
  { label: 'Zeichen', chars: [...`.,:;!?-'"()&@€`] },
]
