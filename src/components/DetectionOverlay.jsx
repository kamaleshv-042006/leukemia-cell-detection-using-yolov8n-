import { memo } from 'react';
import { getClass } from '../data/classes.js';
import { cn } from '../lib/utils.js';

/**
 * Draws normalised (0..1) bounding boxes over the image stage.
 * `detections` are expected to already be filtered by confidence threshold.
 */
function DetectionOverlay({
  detections = [],
  showBoxes = true,
  showLabels = true,
  className,
  labelPlacement = 'inside-top',
  compactLabels = false,
}) {
  if (!showBoxes || !detections.length) return null;

  return (
    <div className={cn('pointer-events-none absolute inset-0', className)} aria-hidden="true">
      {detections.map((d) => {
        const cls = getClass(d.classId);
        return (
          <div
            key={d.id}
            data-box={d.id}
            data-class={d.classId}
            data-confidence={d.confidence.toFixed(3)}
            className="absolute animate-fade-in"
            style={{
              left: `${d.x * 100}%`,
              top: `${d.y * 100}%`,
              width: `${d.w * 100}%`,
              height: `${d.h * 100}%`,
            }}
          >
            {/* corner brackets give a clinical "tracking" feel without noise */}
            <span
              className="absolute inset-0 border"
              style={{ borderColor: `${cls.color}CC`, boxShadow: `0 0 0 1px rgba(0,0,0,0.45)` }}
            />
            <span
              className="absolute -left-px -top-px h-[26%] w-[26%] border-l-2 border-t-2"
              style={{ borderColor: cls.color }}
            />
            <span
              className="absolute -bottom-px -right-px h-[26%] w-[26%] border-b-2 border-r-2"
              style={{ borderColor: cls.color }}
            />

            {showLabels && (
              <div
                className={cn(
                  'absolute whitespace-nowrap',
                  compactLabels ? 'text-[9px]' : 'text-[10px]',
                  // inside-top is nudged off the corner bracket so the two never overlap
                  labelPlacement === 'inside-top' ? 'left-1.5 top-1.5' : '-top-[18px] -left-px',
                )}
              >
                <span
                  className="inline-flex items-center gap-1 rounded-[2px] px-1.5 py-[2px] font-medium leading-none text-[#07090B] shadow-sm"
                  style={{ backgroundColor: cls.color }}
                >
                  <span className="font-semibold">{cls.label}</span>
                  <span className="tnum opacity-80">{d.confidence.toFixed(2)}</span>
                </span>
              </div>
            )}

            <span className="absolute -right-[3px] -top-[3px] h-[6px] w-[6px] rounded-full" style={{ backgroundColor: cls.color }} />
          </div>
        );
      })}
    </div>
  );
}

export default memo(DetectionOverlay);
export { DetectionOverlay };
