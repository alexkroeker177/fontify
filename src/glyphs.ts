// Logical drawing-cell coordinate system: CELL x CELL units, y grows downward.
export const CELL = 160
// Guide lines as fractions of the cell height (from the top edge).
export const BASELINE = 0.72
export const XLINE = 0.44

export const GROUPS: { label: string; chars: string[] }[] = [
  { label: 'Uppercase', chars: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ'] },
  { label: 'Lowercase', chars: [...'abcdefghijklmnopqrstuvwxyzäöüß'] },
  { label: 'Digits', chars: [...'0123456789'] },
  { label: 'Punctuation', chars: [...`.,:;!?-'"()&@€`] },
]
