/**
 * Validates the numeric values used with Tailwind's spacing / size utilities,
 * so a value like `h-4.5` (which does not exist unless the project config
 * adds it) is caught instead of silently rendering at the wrong size.
 *
 * The project's own `theme.extend.spacing` keys are unioned in from
 * `tailwind.config.js`, so extending the scale is enough to make a value legal.
 *
 *   node scripts/check-scale.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Tailwind v3 default spacing / max-width scale. */
const DEFAULT_SPACING = [
  '0', 'px', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '5', '6', '7', '8', '9', '10', '11', '12',
  '14', '16', '20', '24', '28', '32', '36', '40', '44', '48', '52', '56', '60', '64', '72', '80', '96',
];

const SPACING = new Set(DEFAULT_SPACING);

/** Union in project-specific spacing keys so the checker never reports a
 *  false positive for a value the config legitimately extends. */
try {
  const configUrl = new URL('../tailwind.config.js', import.meta.url);
  const { default: config } = await import(configUrl.href);
  const extra = config?.theme?.extend?.spacing;
  if (extra && typeof extra === 'object') {
    for (const key of Object.keys(extra)) SPACING.add(key);
    console.log(`project spacing extensions: ${Object.keys(extra).join(', ') || 'none'}`);
  }
} catch (err) {
  console.log(`could not read tailwind.config.js (${err.message}); using default scale only`);
}

const SRC = fileURLToPath(new URL('../src/', import.meta.url));

/** Utilities whose numeric argument must exist in SPACING. */
const SPACING_UTILS = [
  'p', 'px', 'py', 'pt', 'pr', 'pb', 'pl', 'ps', 'pe',
  'm', 'mx', 'my', 'mt', 'mr', 'mb', 'ml', 'ms', 'me',
  'w', 'h', 'size', 'min-w', 'min-h', 'max-w', 'max-h',
  'gap', 'gap-x', 'gap-y', 'space-x', 'space-y',
  'top', 'right', 'bottom', 'left', 'inset', 'inset-x', 'inset-y',
  'translate-x', 'translate-y', 'basis', 'leading', 'indent', 'scroll-m',
  'rounded', 'rounded-t', 'rounded-b', 'rounded-l', 'rounded-r', 'border-spacing', 'stroke',
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (['.js', '.jsx'].includes(extname(name))) out.push(p);
  }
  return out;
}

const bad = new Map();
const seen = new Set();

for (const file of walk(SRC)) {
  const rel = file.slice(SRC.length);
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(/'([^'\n]*)'|"([^"\n]*)"/g)) {
    for (const token of (m[1] ?? m[2]).split(/\s+/)) {
      if (!token) continue;
      if (!new RegExp(`^-?(${SPACING_UTILS.join('|')})-(\\d+(?:\\.\\d+)?)$`).test(token)) continue;
      seen.add(token);
      const value = token.split('-').pop();
      if (!SPACING.has(value)) {
        if (!bad.has(token)) bad.set(token, new Set());
        bad.get(token).add(rel);
      }
    }
  }
}

console.log(`spacing-utility tokens checked: ${seen.size}`);
if (bad.size === 0) {
  console.log('All numeric spacing values resolve in the effective Tailwind scale.');
} else {
  for (const [token, files] of [...bad].sort()) {
    console.log(`  INVALID  ${token}  [${[...files].join(', ')}]`);
  }
  process.exitCode = 1;
}
