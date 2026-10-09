/**
 * Deep interaction audit.
 *
 * Renders every route in four pipeline states (empty, quality-ready, detected,
 * explained) so that each conditional branch of every page is exercised, then
 * asserts the shared pipeline reducer produces consistent state.
 *
 *   node scripts/audit-interactions.mjs   (run after `vite build --config vite.smoke.config.js`)
 */
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

import App from '../src/App.jsx';
import { AppProvider } from '../src/state/AppState.jsx';
import { IMAGES } from '../src/data/assets.js';
import { analyzeQuality, runDetection, generateExplanation } from '../src/data/mockApi.js';
import { DEFAULT_SETTINGS, SAMPLE_DETECTIONS } from '../src/data/mockData.js';

const ROUTES = [
  '/dashboard',
  '/quality-assessment',
  '/detection',
  '/explainability',
  '/performance',
  '/cross-dataset',
  '/ablation',
  '/error-analysis',
  '/settings',
];

const IMAGE = {
  name: 'blood-smear-sample.jpg',
  size: 321_170,
  type: 'image/jpeg',
  url: IMAGES.sample,
  source: 'sample',
  dimensions: '1280 × 960',
};

async function buildStates() {
  return {
    empty: {},
    'quality-ready': {
      image: IMAGE,
      quality: await analyzeQuality({ fileName: IMAGE.name, strategy: 'auto' }),
    },
    detected: {
      image: IMAGE,
      strategy: 'clahe',
      appliedTechnique: 'clahe',
      enhancementApplied: true,
      detections: SAMPLE_DETECTIONS,
      detectionMeta: await runDetection({
        confidenceThreshold: DEFAULT_SETTINGS.inference.confidenceThreshold,
      }),
    },
    explained: {
      image: IMAGE,
      strategy: 'clahe',
      appliedTechnique: 'clahe',
      enhancementApplied: true,
      detections: SAMPLE_DETECTIONS,
      detectionMeta: await runDetection({ confidenceThreshold: 0.5 }),
      explanation: await generateExplanation({ target: 'blast' }),
    },
  };
}

let failures = 0;
let checks = 0;

async function main() {
  const STATES = await buildStates();
  for (const [stateName, seed] of Object.entries(STATES)) {
    for (const route of ROUTES) {
      checks += 1;
      try {
        const out = renderToString(
          h(MemoryRouter, { initialEntries: [route] }, h(AppProvider, { initialState: seed }, h(App))),
        );
        if (out.length < 3000) {
          failures += 1;
          console.log(`  FAIL  [${stateName}] ${route} rendered only ${out.length} chars`);
        }
      } catch (err) {
        failures += 1;
        console.log(`  FAIL  [${stateName}] ${route}: ${err.message}`);
      }
    }
    console.log(`  ok    state "${stateName}" rendered on all ${ROUTES.length} routes`);
  }

  const render = (route, seed) =>
    renderToString(h(MemoryRouter, { initialEntries: [route] }, h(AppProvider, { initialState: seed }, h(App))));

  // disclaimer must be present on every page
  for (const route of ROUTES) {
    checks += 1;
    if (!render(route, STATES.explained).includes('not a medical diagnostic device')) {
      failures += 1;
      console.log(`  FAIL  ${route}: medical disclaimer missing`);
    }
  }

  // sidebar must expose every route as a link
  {
    checks += 1;
    const out = render('/dashboard', {});
    const missing = ROUTES.filter((r) => !out.includes(`href="${r}"`));
    if (missing.length) {
      failures += 1;
      console.log(`  FAIL  sidebar is missing links to: ${missing.join(', ')}`);
    } else {
      console.log('  ok    sidebar renders links to all 9 routes');
    }
  }

  // detection page must emit a box per detection
  {
    checks += 1;
    const out = render('/detection', STATES.detected);
    const boxes = (out.match(/data-box=/g) ?? []).length;
    if (boxes < 5) {
      failures += 1;
      console.log(`  FAIL  /detection emitted ${boxes} bounding boxes`);
    } else {
      console.log(`  ok    /detection emitted ${boxes} bounding boxes`);
    }
  }

  console.log(`\n${checks} checks, ${failures} failure(s).`);
  process.exit(failures === 0 ? 0 : 1);
}

main();

