/**
 * Runs whichever SSR entry `vite.smoke.config.js` just emitted into `.smoke/`.
 *
 * `vite build --config vite.smoke.config.js` names its output after the entry
 * (smoke-routes.js, audit-interactions.js, ...), so the runner has to discover
 * it rather than assume a fixed filename. Set SMOKE_ENTRY to pick the entry:
 *
 *   node scripts/run-smoke.mjs
 *   SMOKE_ENTRY=scripts/audit-interactions.jsx node scripts/run-smoke.mjs
 */
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const OUT_DIR = fileURLToPath(new URL('../.smoke/', import.meta.url));

function buildEntry() {
  const candidates = readdirSync(OUT_DIR)
    .filter((f) => f.endsWith('.js'))
    .map((f) => join(OUT_DIR, f))
    .filter((p) => statSync(p).isFile());

  if (candidates.length === 0) {
    throw new Error(
      `No SSR bundle found in ${OUT_DIR}. Run "vite build --config vite.smoke.config.js" first.`,
    );
  }
  // `emptyOutDir` guarantees a single entry, but sort for a deterministic
  // error message if that ever changes.
  candidates.sort();
  return candidates[0];
}

const entry = buildEntry();
console.log(`smoke entry: ${entry}`);

await import(pathToFileURL(entry).href);
