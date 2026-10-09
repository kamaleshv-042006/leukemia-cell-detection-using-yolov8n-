/**
 * ============================================================================
 *  IMAGE SOURCES
 * ============================================================================
 *  Every image used by the UI is imported from `src/assets` so the app never
 *  references a remote URL. To use your own dataset imagery:
 *
 *    1. Drop your files into `src/assets/`
 *    2. Point the entries below at them (keep the names if you prefer, then
 *       the whole UI updates at once)
 *    3. Add a guard so the app still runs if a file is missing:
 *       `ImageViewer` already falls back to a labelled placeholder.
 *
 *  The synthetic placeholders in this folder were produced offline with
 *  `npm run generate:sample` and exist only to make the prototype self-contained.
 * ============================================================================
 */
import sampleImage from '../assets/blood-smear-sample.jpg';
import crowdedImage from '../assets/samples/blood-smear-crowded.jpg';
import lowContrastImage from '../assets/samples/blood-smear-low-contrast.jpg';
import lowQualityImage from '../assets/samples/blood-smear-low-quality.jpg';
import overexposedImage from '../assets/samples/blood-smear-overexposed.jpg';
import stainVariationImage from '../assets/samples/blood-smear-stain-variation.jpg';

export const IMAGES = {
  /** Primary demo field used across Quality, Detection and Explainability. */
  sample: sampleImage,
  crowded: crowdedImage,
  lowContrast: lowContrastImage,
  lowQuality: lowQualityImage,
  overexposed: overexposedImage,
  stainVariation: stainVariationImage,
};

export default IMAGES;
