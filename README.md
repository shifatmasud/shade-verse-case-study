# Shade Verse — Case Study

How I built Shade Verse, a 3D web-swinging game that runs in the browser on a budget phone.
Swing physics, combat, a hybrid reflection/refraction lake, and two real devices as the budget.

Read it: https://shade-verse-case-study.vercel.app

Play the game: https://shade-verse-preview.vercel.app/

## Build

No dependencies. Node 18+.

```
node scripts/unpack.mjs
```

Writes the site to `dist/`. Text lives in `site/`. Images and the font live in `media-src/` as base64 and are decoded at build.

Vercel: build command `node scripts/unpack.mjs`, output directory `dist` (set in `vercel.json`).

## Credits

Game design, direction and words: Shifat Masud.
Built with Zero.
3D models by Polyfork, textures from Poly Haven (CC0).

To everyone in my life: you inspired this.
