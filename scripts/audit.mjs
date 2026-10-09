/**
 * Static integrity audit.
 *
 *   1. every `lucide-react` named import is a real export
 *   2. every relative import resolves to a file that exists
 *   3. every nav target / <Link to> has a matching <Route path>
 *   4. every route in App.jsx is reachable from the sidebar
 *
 *   node scripts/audit.mjs
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC = join(ROOT, 'src');

let errors = 0;
const fail = (msg) => {
  errors += 1;
  console.log(`  FAIL  ${msg}`);
};

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (['.js', '.jsx'].includes(extname(name))) out.push(p);
  }
  return out;
}

const files = walk(SRC);
const read = (f) => readFileSync(f, 'utf8');
const rel = (f) => f.slice(ROOT.length);

/* ------------------------------------------------------- 1. lucide exports --- */
console.log('1. lucide-react named imports');
const lucideSrc = join(
  ROOT,
  'node_modules',
  '.pnpm',
  'lucide-react@0.469.0_react@18.3.1',
  'node_modules',
  'lucide-react',
  'dist',
  'esm',
  'lucide-react.js',
);
const lucideExports = new Set();
if (existsSync(lucideSrc)) {
  const body = read(lucideSrc);
  for (const m of body.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of m[1].split(',')) {
      const name = part.trim().split(/\s+as\s+/).pop().trim();
      if (name) lucideExports.add(name);
    }
  }
} else {
  console.log('  (lucide bundle not found — skipping)');
}

let iconCount = 0;
for (const f of files) {
  for (const m of read(f).matchAll(/import\s*\{([^}]*)\}\s*from\s*'lucide-react'/g)) {
    for (const part of m[1].split(',')) {
      const name = part.trim().split(/\s+as\s+/).pop().trim();
      if (!name) continue;
      iconCount += 1;
      if (lucideExports.size && !lucideExports.has(name)) {
        fail(`${rel(f)}: '${name}' is not exported by lucide-react@0.469.0`);
      }
    }
  }
}
if (!errors) console.log(`   ok  ${iconCount} icon imports all resolve`);

/* -------------------------------------------------------- 2. import paths --- */
console.log('2. relative import resolution');
for (const f of files) {
  for (const m of read(f).matchAll(/from\s+'(\.[^']+)'/g)) {
    const target = resolve(dirname(f), m[1]);
    if (!existsSync(target)) fail(`${rel(f)}: cannot resolve '${m[1]}'`);
  }
}
if (!errors) console.log('   ok  all relative imports resolve');

/* ------------------------------------------------------------- 3. routes --- */
console.log('3. route + navigation coverage');
const app = read(join(SRC, 'App.jsx'));
const routePaths = new Set([...app.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]));

const sidebar = read(join(SRC, 'components', 'Sidebar.jsx'));
const navPaths = new Set([...sidebar.matchAll(/to:\s*'([^']+)'/g)].map((m) => m[1]));

for (const p of navPaths) {
  if (!routePaths.has(p)) fail(`sidebar links to '${p}' but no <Route path="${p}"> exists`);
}
for (const p of routePaths) {
  if (p.includes(':') || p === '*' || p === '/') continue;
  if (!navPaths.has(p)) fail(`<Route path="${p}"> is not reachable from the sidebar`);
}

const appNavPaths = new Set([...app.matchAll(/path="([^"]+)"/g)].map((m) => m[1]));
for (const p of navPaths) {
  if (!appNavPaths.has(p)) fail(`sidebar target '${p}' is not referenced in App.jsx`);
}
if (!errors) {
  console.log(`   ok  ${navPaths.size} nav items <-> ${routePaths.size} routes`);
  console.log(`      ${[...navPaths].join(', ')}`);
}

/* ------------------------------------------- 4. Button / component usage --- */
console.log('4. page -> component imports');
for (const f of files) {
  for (const m of read(f).matchAll(/from\s+'\.\.\/components\/([A-Za-z0-9]+)\.jsx'/g)) {
    if (!existsSync(join(SRC, 'components', `${m[1]}.jsx`))) {
      fail(`${rel(f)}: '../components/${m[1]}.jsx' does not exist`);
    }
  }
}
if (!errors) console.log('   ok  all component imports exist');

console.log(errors === 0 ? '\nAudit clean.' : `\n${errors} problem(s) found.`);
process.exit(errors === 0 ? 0 : 1);
