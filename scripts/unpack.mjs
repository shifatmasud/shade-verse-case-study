// Builds the case study into dist/: copies site/ as is, and decodes media-src/**/*.b64 back to binary
// (the repo is written through a text-only door, so video, images and the font live here as base64 text).
// Zero dependencies. Cloudflare Pages: build command `node scripts/unpack.mjs`, output directory `dist`.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, statSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'

const out = 'dist'
rmSync(out, { recursive: true, force: true })
const walk = (d) => readdirSync(d).flatMap((f) => statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)])

let copied = 0, decoded = 0
for (const f of walk('site')) {
  const to = join(out, relative('site', f)); mkdirSync(dirname(to), { recursive: true }); copyFileSync(f, to); copied++
}
for (const f of walk('media-src')) {
  if (!f.endsWith('.b64')) continue
  const to = join(out, relative('media-src', f).slice(0, -4)); mkdirSync(dirname(to), { recursive: true })
  writeFileSync(to, Buffer.from(readFileSync(f, 'utf8').replace(/\s+/g, ''), 'base64')); decoded++
}
console.log(`[unpack] ${copied} text file(s) copied, ${decoded} binary file(s) decoded -> ${out}/`)
