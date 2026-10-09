/**
 * Frontend-only export helpers.
 *
 * Everything is generated in the browser via Blob URLs — there is no backend
 * involved. Swap these for authenticated `fetch` calls when the Python/YOLOv8
 * service is connected.
 */

const MIME = {
  csv: 'text/csv;charset=utf-8;',
  json: 'application/json;charset=utf-8;',
};

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // revoke on the next tick so Safari has time to start the download
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const escapeCell = (value) => {
  if (value === null || value === undefined) return '';
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/**
 * Download rows as CSV.
 * @param {Array<object>} rows
 * @param {Array<{key:string,label:string}>|Array<string>} columns
 */
export function downloadCSV(rows, columns, filename = 'export.csv') {
  if (!rows?.length) return false;
  const cols = (columns?.length ? columns : Object.keys(rows[0])).map((c) =>
    typeof c === 'string' ? { key: c, label: c } : c,
  );
  const head = cols.map((c) => escapeCell(c.label ?? c.key)).join(',');
  const body = rows
    .map((row) => cols.map((c) => escapeCell(row[c.key])).join(','))
    .join('\r\n');
  const csv = `${head}\r\n${body}\r\n`;
  triggerDownload(new Blob([csv], { type: MIME.csv }), filename);
  return true;
}

/** Download any JSON-serialisable payload. */
export function downloadJSON(data, filename = 'export.json') {
  triggerDownload(
    new Blob([JSON.stringify(data, null, 2)], { type: MIME.json }),
    filename,
  );
  return true;
}

/** Trigger a plain-text (e.g. report) download. */
export function downloadText(text, filename = 'report.txt', type = 'text/plain') {
  triggerDownload(new Blob([text], { type: `${type};charset=utf-8;` }), filename);
  return true;
}

export function timestampSlug(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(
    d.getHours(),
  )}${p(d.getMinutes())}${p(d.getSeconds())}`;
}
