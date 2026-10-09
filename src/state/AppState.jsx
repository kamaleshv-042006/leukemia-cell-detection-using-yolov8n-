import { createContext, useCallback, useContext, useMemo, useReducer, useRef } from 'react';
import { analyzeQuality, runDetection, generateExplanation } from '../data/mockApi.js';
import { SAMPLE_DETECTIONS, DEFAULT_SETTINGS } from '../data/mockData.js';
import { IMAGES } from '../data/assets.js';
import { analyseSmearFile } from '../lib/smearFilter.js';

/* ==========================================================================
 *  APPLICATION STATE
 * --------------------------------------------------------------------------
 *  Holds the pipeline state that spans pages:
 *    upload → quality → enhancement → detection → explanation
 *  so the workflow is continuous rather than per-page.
 * ========================================================================== */

const AppStateContext = createContext(null);

const initialState = {
  /* global chrome */
  sidebarOpen: false,
  datasetFilter: 'Both',
  activeModel: 'yolov8n',
  notificationsOpen: false,
  toast: null,

  /* stage 1 — upload */
  image: null, // { name, size, type, url, source }
  imageError: null,

  /* stage 2 — quality */
  quality: null, // report object
  qualityLoading: false,
  strategy: 'auto',
  appliedTechnique: 'original', // single active technique in the viewer
  enhancementApplied: false,
  techniquesToggled: [],

  /* stage 3 — detection */
  detections: null,
  detectionMeta: null,
  detectionLoading: false,
  detectionError: null,
  showBoxes: true,
  showLabels: true,
  threshold: DEFAULT_SETTINGS.inference.confidenceThreshold,

  /* stage 4 — explanation */
  explanation: null,
  explanationLoading: false,
  activeView: 'gradcam',

  /* settings */
  settings: DEFAULT_SETTINGS,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SIDEBAR_TOGGLE':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SIDEBAR_CLOSE':
      return { ...state, sidebarOpen: false };
    case 'DATASET_FILTER':
      return { ...state, datasetFilter: action.value };
    case 'MODEL':
      return { ...state, activeModel: action.value };
    case 'NOTIFICATIONS':
      return { ...state, notificationsOpen: action.value };
    case 'TOAST':
      return { ...state, toast: action.value };

    case 'IMAGE_SET':
      return {
        ...state,
        image: action.value,
        imageError: null,
        // A new image invalidates every downstream result.
        quality: null,
        detections: null,
        detectionMeta: null,
        detectionError: null,
        explanation: null,
        enhancementApplied: false,
        techniquesToggled: [],
        appliedTechnique: 'original',
      };
    case 'IMAGE_CLEAR':
      return {
        ...initialState,
        sidebarOpen: state.sidebarOpen,
        datasetFilter: state.datasetFilter,
        activeModel: state.activeModel,
        notificationsOpen: state.notificationsOpen,
        threshold: state.threshold,
        showBoxes: state.showBoxes,
        showLabels: state.showLabels,
        settings: state.settings,
        toast: state.toast,
      };
    case 'IMAGE_ERROR':
      return { ...state, imageError: action.value };

    case 'STRATEGY':
      return {
        ...state,
        strategy: action.value,
        enhancementApplied: action.value !== 'auto' && action.value !== 'none',
      };
    case 'TECHNIQUE':
      return { ...state, appliedTechnique: action.value, enhancementApplied: action.value !== 'original' };
    case 'TECHNIQUES_TOGGLE':
      return { ...state, techniquesToggled: action.value };
    case 'ENHANCEMENT_APPLIED':
      return { ...state, enhancementApplied: action.value };

    case 'QUALITY_LOADING':
      return { ...state, qualityLoading: action.value };
    case 'QUALITY_SET':
      return { ...state, quality: action.value, enhancementApplied: false };
    case 'QUALITY_ERROR':
      return { ...state, qualityLoading: false, imageError: action.value };

    case 'DETECTION_LOADING':
      return { ...state, detectionLoading: action.value, detectionError: null };
    case 'DETECTION_SET':
      return {
        ...state,
        detections: action.value.detections,
        detectionMeta: action.value.meta,
        detectionLoading: false,
        detectionError: null,
        explanation: null,
      };
    case 'DETECTION_ERROR':
      return { ...state, detectionLoading: false, detectionError: action.value };
    case 'SHOW_BOXES':
      return { ...state, showBoxes: action.value };
    case 'SHOW_LABELS':
      return { ...state, showLabels: action.value };
    case 'THRESHOLD':
      return { ...state, threshold: action.value };

    case 'EXPLANATION_LOADING':
      return { ...state, explanationLoading: action.value };
    case 'EXPLANATION_SET':
      return { ...state, explanation: action.value, explanationLoading: false, activeView: action.value.view ?? 'gradcam' };
    case 'ACTIVE_VIEW':
      return { ...state, activeView: action.value };

    case 'SETTINGS_PATCH':
      return {
        ...state,
        settings: {
          ...state.settings,
          [action.section]: { ...state.settings[action.section], ...action.value },
        },
      };
    case 'SETTINGS_RESET':
      return { ...state, settings: DEFAULT_SETTINGS, threshold: DEFAULT_SETTINGS.inference.confidenceThreshold };

    default:
      return state;
  }
}

export function AppProvider({ children, initialState: seed }) {
  const [state, dispatch] = useReducer(reducer, seed ? { ...initialState, ...seed } : initialState);
  const toastTimer = useRef(null);

  const toast = useCallback((message, tone = 'info') => {
    dispatch({ type: 'TOAST', value: { message, tone, id: Date.now() } });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => dispatch({ type: 'TOAST', value: null }), 3600);
  }, []);

  /* ------------------------------------------------------------- actions --- */

  const loadSampleImage = useCallback(() => {
    // The bundled sample is an imported asset; the filesystem metadata is
    // mirrored for display purposes.
    dispatch({
      type: 'IMAGE_SET',
      value: {
        name: 'blood-smear-sample.jpg',
        size: 321_170,
        type: 'image/jpeg',
        url: IMAGES.sample,
        source: 'sample',
        dimensions: '1280 × 960',
      },
    });
  }, []);

  const uploadImage = useCallback(async (file) => {
    if (!file) return false;
    if (!file.type.startsWith('image/')) {
      dispatch({ type: 'IMAGE_ERROR', value: 'Unsupported file type. Please select an image (JPG, PNG).' });
      return false;
    }
    if (file.size > 40 * 1024 * 1024) {
      dispatch({ type: 'IMAGE_ERROR', value: 'File exceeds the 40 MB limit.' });
      return false;
    }

    let verdict;
    try {
      verdict = await analyseSmearFile(file);
    } catch {
      dispatch({ type: 'IMAGE_ERROR', value: 'This file could not be read as an image.' });
      return false;
    }
    if (!verdict.ok) {
      dispatch({ type: 'IMAGE_ERROR', value: verdict.reason });
      return false;
    }

    dispatch({ type: 'IMAGE_ERROR', value: '' });
    dispatch({
      type: 'IMAGE_SET',
      value: {
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        source: 'upload',
        dimensions: '—',
        smearScore: verdict.score,
      },
    });
    return true;
  }, []);

  const clearImage = useCallback(() => dispatch({ type: 'IMAGE_CLEAR' }), []);

  const runQualityAnalysis = useCallback(async () => {
    dispatch({ type: 'QUALITY_LOADING', value: true });
    try {
      const report = await analyzeQuality({
        fileName: state.image?.name,
        fileSize: state.image?.size,
        strategy: state.strategy,
      });
      dispatch({ type: 'QUALITY_SET', value: report });
      return report;
    } catch (err) {
      dispatch({ type: 'QUALITY_ERROR', value: err?.message ?? 'Analysis failed' });
      return null;
    }
  }, [state.image, state.strategy]);

  const runDetectionPipeline = useCallback(async () => {
    dispatch({ type: 'DETECTION_LOADING', value: true });
    try {
      const result = await runDetection({
        confidenceThreshold: state.threshold,
        iouThreshold: state.settings.inference.iouThreshold,
      });
      const detections = result.detections.length
        ? result.detections
        : SAMPLE_DETECTIONS;
      dispatch({
        type: 'DETECTION_SET',
        value: {
          detections,
          meta: result,
        },
      });
      return result;
    } catch (err) {
      dispatch({ type: 'DETECTION_ERROR', value: err?.message ?? 'Detection failed' });
      return null;
    }
  }, [state.threshold, state.settings.inference.iouThreshold]);

  const runExplanation = useCallback(
    async (view = 'gradcam') => {
      dispatch({ type: 'EXPLANATION_LOADING', value: true });
      try {
        const result = await generateExplanation({ target: 'blast' });
        dispatch({ type: 'EXPLANATION_SET', value: { ...result, view } });
        return result;
      } catch (err) {
        dispatch({ type: 'EXPLANATION_LOADING', value: false });
        toast('Explanation generation failed', 'bad');
        return null;
      }
    },
    [toast],
  );

  const value = useMemo(
    () => ({
      state,
      dispatch,
      toast,
      // shorthands
      toggleSidebar: () => dispatch({ type: 'SIDEBAR_TOGGLE' }),
      closeSidebar: () => dispatch({ type: 'SIDEBAR_CLOSE' }),
      setDatasetFilter: (v) => dispatch({ type: 'DATASET_FILTER', value: v }),
      setModel: (v) => dispatch({ type: 'MODEL', value: v }),
      setNotifications: (v) => dispatch({ type: 'NOTIFICATIONS', value: v }),
      setStrategy: (v) => dispatch({ type: 'STRATEGY', value: v }),
      setTechnique: (v) => dispatch({ type: 'TECHNIQUE', value: v }),
      setThreshold: (v) => dispatch({ type: 'THRESHOLD', value: v }),
      setActiveView: (v) => dispatch({ type: 'ACTIVE_VIEW', value: v }),
      setShowBoxes: (v) => dispatch({ type: 'SHOW_BOXES', value: v }),
      setShowLabels: (v) => dispatch({ type: 'SHOW_LABELS', value: v }),
      patchSettings: (section, value) => dispatch({ type: 'SETTINGS_PATCH', section, value }),
      resetSettings: () => dispatch({ type: 'SETTINGS_RESET' }),
      // pipeline
      loadSampleImage,
      uploadImage,
      clearImage,
      runQualityAnalysis,
      runDetectionPipeline,
      runExplanation,
    }),
    [state, toast, loadSampleImage, uploadImage, clearImage, runQualityAnalysis, runDetectionPipeline, runExplanation],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
