/**
 * Cell taxonomy used by the detector and the explainability layer.
 * Colours are deliberately desaturated so the UI reads as clinical rather than
 * playful — colour is only ever used to carry class / status meaning.
 */
export const CELL_CLASSES = [
  { id: 'blast', label: 'Blast', short: 'BL', color: '#E1555A', malignant: true },
  { id: 'lymphoblast', label: 'Lymphoblast', short: 'LB', color: '#E07A4A', malignant: true },
  { id: 'myeloblast', label: 'Myeloblast', short: 'MB', color: '#8B7BE8', malignant: true },
  { id: 'promyelocyte', label: 'Promyelocyte', short: 'PM', color: '#E0A33A', malignant: true },
  { id: 'myelocyte', label: 'Myelocyte', short: 'MC', color: '#2BB6C4', malignant: false },
  { id: 'neutrophil', label: 'Neutrophil', short: 'NE', color: '#2D7FF9', malignant: false },
  { id: 'lymphocyte', label: 'Lymphocyte', short: 'LY', color: '#4C9A6E', malignant: false },
];

const BY_ID = Object.fromEntries(CELL_CLASSES.map((c) => [c.id, c]));

/** Safe lookup — unknown ids resolve to a neutral fallback. */
export const getClass = (id) =>
  BY_ID[id] ?? { id, label: id, short: '??', color: '#68757F', malignant: false };

export const getClassColor = (id) => getClass(id).color;
export const isMalignant = (id) => Boolean(getClass(id).malignant);

/** Human grouping used by the detection summary. */
export const groupLabel = (malignant) => (malignant ? 'Leukemia Cell' : 'Normal Cell');
