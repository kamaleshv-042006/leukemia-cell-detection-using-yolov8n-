import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const outDir = fileURLToPath(new URL('./.smoke', import.meta.url));
const root = fileURLToPath(new URL('./src', import.meta.url));

/**
 * SSR build used by the smoke / interaction audits.
 *
 *   vite build --config vite.smoke.config.js
 *   vite build --config vite.smoke.config.js --ssr ../scripts/audit-interactions.jsx
 *
 * The default entry renders all routes; the audits override it with vite's own
 * `--ssr` flag (relative to `root`, which is `src/`). SMOKE_ENTRY is honoured
 * for ad-hoc runs. `scripts/run-smoke.mjs` discovers whichever entry was built.
 */
const entry = process.env.SMOKE_ENTRY || './scripts/smoke-routes.jsx';

export default defineConfig({
  root,
  plugins: [react()],
  build: {
    ssr: fileURLToPath(new URL(entry, import.meta.url)),
    outDir,
    emptyOutDir: true,
    minify: false,
  },
});
