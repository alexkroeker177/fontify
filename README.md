# Fontify

Turn your handwriting into a real, installable font — in the browser, open source, free forever.

**Try it live: [fontify.xyz](https://fontify.xyz)**

![Fontify in action](media/fontify-showcase.gif)

Everything runs client-side: no server, no account, no upload of your handwriting anywhere.

## How it works

1. Draw each character in its cell (mouse, trackpad, stylus or touch).
2. Watch the live preview update as you go.
3. Download your font as an `.otf` file and install it.

Your work is saved locally in your browser - nothing you draw ever leaves your device.

Under the hood: strokes are rasterized to a high-resolution canvas, vectorized with [imagetracerjs](https://github.com/jankovicsandras/imagetracerjs), and assembled into an OpenType font with [opentype.js](https://github.com/opentypejs/opentype.js).

## Character sets

Latin, German (umlauts & ß), Polish, Greek, Russian (Cyrillic), and Japanese Kana
(Hiragana + Katakana) - toggle them via the chips below the preview. Scripts that need
OpenType shaping to look right (Arabic joining, Thai mark positioning, Korean syllable
composition, CJK ideographs) are on the roadmap, not faked.

## Configuration

Copy `.env.example` to `.env`. All values are optional: Ko-fi link, GitHub link, and a
[GoatCounter](https://www.goatcounter.com/) site code for cookie-free analytics.

## Development

```bash
bun install
bun run dev
```

## Roadmap

- Printable template sheet → photo/scan upload → automatic glyph segmentation
- Adjustable pen width, glyph variants, kerning pairs
- Arabic (positional forms + joining via GSUB), Thai (mark positioning via GPOS), Korean (Hangul syllable composition)

## License

MIT
