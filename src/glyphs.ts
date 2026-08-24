// Logical drawing-cell coordinate system: CELL x CELL units, y grows downward.
export const CELL = 160
// Guide lines as fractions of the cell height (from the top edge).
export const BASELINE = 0.72
export const XLINE = 0.44

export type CharGroup = { label: string; chars: string[] }
export type Charset = { id: string; label: string; groups: CharGroup[] }

// Scripts needing OpenType shaping (Arabic joining, Thai mark positioning,
// Hangul syllable composition, CJK ideographs) are deliberately absent - a
// plain per-character cmap font would render them visibly broken.
export const CHARSETS: Charset[] = [
  {
    id: 'latin',
    label: 'Latin',
    groups: [
      { label: 'Uppercase', chars: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ'] },
      { label: 'Lowercase', chars: [...'abcdefghijklmnopqrstuvwxyzäöüß'] },
      { label: 'Digits', chars: [...'0123456789'] },
      { label: 'Punctuation', chars: [...`.,:;!?-'"()&@€`] },
    ],
  },
  {
    id: 'polish',
    label: 'Polish',
    groups: [
      { label: 'Uppercase', chars: [...'ĄĆĘŁŃÓŚŹŻ'] },
      { label: 'Lowercase', chars: [...'ąćęłńóśźż'] },
    ],
  },
  {
    id: 'greek',
    label: 'Greek',
    groups: [
      { label: 'Uppercase', chars: [...'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ'] },
      { label: 'Lowercase', chars: [...'αβγδεζηθικλμνξοπρσςτυφχψω'] },
    ],
  },
  {
    id: 'cyrillic',
    label: 'Russian',
    groups: [
      { label: 'Uppercase', chars: [...'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'] },
      { label: 'Lowercase', chars: [...'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'] },
    ],
  },
  {
    id: 'kana',
    label: 'Japanese Kana',
    groups: [
      { label: 'Hiragana', chars: [...'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'] },
      { label: 'Hiragana (voiced & small)', chars: [...'がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽぁぃぅぇぉっゃゅょ'] },
      { label: 'Katakana', chars: [...'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'] },
      { label: 'Katakana (voiced & small)', chars: [...'ガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポヴァィゥェォッャュョ'] },
      { label: 'Punctuation', chars: [...'。、「」・ー'] },
    ],
  },
]
