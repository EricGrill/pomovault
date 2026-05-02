# Development

## Plugin

```bash
npm install
npm test
npm run build
```

The plugin release files are `main.js`, `manifest.json`, and `styles.css`.

## Website

```bash
npm --prefix site install
npm --prefix site run build
npm --prefix site run preview
```

The website is a static Vite/React/Tailwind app built to `site/dist` and deployed to GitHub Pages.

## Verification

```bash
npm run verify
git diff --check
```

Use a dedicated Obsidian test vault for manual plugin validation. Do not develop against a primary personal vault.
