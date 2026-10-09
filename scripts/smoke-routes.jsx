import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

import App from '../src/App.jsx';
import { AppProvider } from '../src/state/AppState.jsx';

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

let failures = 0;
for (const route of ROUTES) {
  try {
    const html = renderToString(
      h(MemoryRouter, { initialEntries: [route] }, h(AppProvider, null, h(App))),
    );
    const len = html.length;
    if (len < 2000) {
      console.log(`WARN  ${route} rendered only ${len} chars`);
      failures += 1;
    } else {
      console.log(`ok    ${route}  (${len} chars)`);
    }
  } catch (err) {
    failures += 1;
    console.log(`FAIL  ${route}: ${err.message}`);
  }
}

console.log(failures === 0 ? '\nAll routes rendered.' : `\n${failures} route(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
