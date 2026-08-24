# Fontify

Turn your handwriting into a real, installable font — in the browser, open source, free forever.

Inspired by [Calligraphr](https://www.calligraphr.com/), minus the paywall. Everything runs client-side: no server, no account, no upload of your handwriting anywhere.

## How it works

1. Draw each character in its cell (mouse, trackpad, stylus or touch).
2. Watch the live preview update as you go.
3. Download your font as an `.otf` file and install it.

Under the hood: strokes are rasterized to a high-resolution canvas, vectorized with [imagetracerjs](https://github.com/jankovicsandras/imagetracerjs), and assembled into an OpenType font with [opentype.js](https://github.com/opentypejs/opentype.js).

## Development

```bash
bun install
bun run dev
```

## Roadmap

- Printable template sheet → photo/scan upload → automatic glyph segmentation (the classic Calligraphr flow)
- Adjustable pen width, glyph variants, kerning pairs
- More character sets

## License

MIT
