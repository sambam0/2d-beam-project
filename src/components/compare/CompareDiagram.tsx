import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { BeamResult } from '../../utils/physics';

interface Props {
  resultA: BeamResult;
  resultB: BeamResult;
}

type DiagramTab = 'deflection' | 'moment' | 'shear';

const TAB_LABELS: Record<DiagramTab, string> = {
  deflection: 'Deflected Shape',
  moment:     'Bending Moment',
  shear:      'Shear Force',
};

const CURVE_SPRING = {
  type: 'spring' as const,
  stiffness: 280,
  damping: 28,
  mass: 0.6,
};

const COLOR_A = '#22C55E';
const COLOR_B = '#60A5FA';

// ── Shared SVG path helper (same as DiagramViewer) ────────────────────────────
function pathD(
  points: { x: number; y: number }[],
  W: number, H: number, padX: number, padY: number,
  yMin: number, yRange: number, xMin: number, xRange: number,
  invertY = false
): string {
  if (!points.length) return '';
  const plotW = W - padX * 2;
  const plotH = H - padY * 2;
  const safeYRange = yRange || 1;
  const safeXRange = xRange || 1;
  return points.map((p, i) => {
    const sx = padX + ((p.x - xMin) / safeXRange) * plotW;
    const rawY = ((p.y - yMin) / safeYRange) * plotH;
    const sy = invertY ? padY + rawY : padY + (plotH - rawY);
    return `${i === 0 ? 'M' : 'L'} ${sx} ${sy}`;
  }).join(' ');
}

// ── Overlaid two-curve SVG ────────────────────────────────────────────────────
interface CompareSVGProps {
  pointsA: { x: number; y: number }[];
  pointsB: { x: number; y: number }[];
  label: string;
  unit: string;
  maxValA: number;
  maxValB: number;
  invertY?: boolean;
}

function CompareSVG({ pointsA, pointsB, label, unit, maxValA, maxValB, invertY }: CompareSVGProps) {
  const isFirstRender = useRef(true);
  useEffect(() => { isFirstRender.current = false; }, []);

  const W = 600, H = 260, padX = 48, padY = 24;
  const plotW = W - padX * 2;
  const plotH = H - padY * 2;

  // Combined Y scale so both curves share the same axis
  const allYs = [...pointsA.map(p => p.y), ...pointsB.map(p => p.y)];
  const allZero = allYs.every(y => y === 0);
  const yMin = allZero ? 0 : Math.min(...allYs);
  const yMax = allZero ? 1 : Math.max(...allYs);
  const yRange = yMax - yMin || 1;

  const xs = pointsA.map(p => p.x);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const xRange = xMax - xMin || 1;

  const curveA = pathD(pointsA, W, H, padX, padY, yMin, yRange, xMin, xRange, invertY);
  const curveB = pathD(pointsB, W, H, padX, padY, yMin, yRange, xMin, xRange, invertY);

  const baseline = invertY ? padY : padY + plotH;

  const yLabels = Array.from({ length: 6 }, (_, i) => {
    const frac = i / 5;
    const val = yMin + frac * yRange;
    const sy = invertY ? padY + frac * plotH : padY + plotH - frac * plotH;
    return { val, sy };
  });

  const xLabels = [0, 0.25, 0.5, 0.75, 1].map(frac => ({
    val: (xMin + frac * xRange).toFixed(1),
    sx: padX + frac * plotW,
  }));

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Label row + legend */}
      <div className="flex items-center justify-between px-1 flex-wrap gap-2">
        <span className="text-xs text-slate-500 uppercase tracking-widest font-medium">
          {label}
        </span>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <svg width="22" height="8" className="shrink-0">
              <line x1="0" y1="4" x2="22" y2="4" stroke={COLOR_A} strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <span className="text-[11px] text-slate-400">
              A — {maxValA.toFixed(2)} {unit}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="22" height="8" className="shrink-0">
              <line x1="0" y1="4" x2="22" y2="4" stroke={COLOR_B} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5,3" />
            </svg>
            <span className="text-[11px] text-slate-400">
              B — {maxValB.toFixed(2)} {unit}
            </span>
          </div>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto drop-shadow-md"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {yLabels.map(({ sy }, i) => (
          <line key={i} x1={padX} y1={sy} x2={W - padX} y2={sy}
            stroke="#1E293B" strokeWidth="1" strokeDasharray="2,4" />
        ))}

        {/* Y-axis labels */}
        {yLabels.map(({ val, sy }, i) => (
          <text key={i} x={padX - 8} y={sy + 4} textAnchor="end" fontSize="10" fill="#64748B">
            {Math.abs(val) < 0.001 ? '0' : val.toFixed(2)}
          </text>
        ))}

        {/* X-axis labels */}
        {xLabels.map(({ val, sx }, i) => (
          <text key={i} x={sx} y={H - 4} textAnchor="middle" fontSize="10" fill="#64748B">
            {val}m
          </text>
        ))}

        {/* Baseline */}
        <line x1={padX} y1={baseline} x2={W - padX} y2={baseline}
          stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />

        {/* Curve B — dashed, drawn first so A overlays it */}
        <motion.path
          d={curveB}
          fill="none"
          stroke={COLOR_B}
          strokeWidth={2}
          strokeDasharray="8,5"
          strokeLinejoin="round"
          strokeLinecap="round"
          animate={{ d: curveB }}
          transition={isFirstRender.current ? { duration: 0 } : CURVE_SPRING}
        />

        {/* Curve A — solid, on top */}
        <motion.path
          d={curveA}
          fill="none"
          stroke={COLOR_A}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          animate={{ d: curveA }}
          transition={isFirstRender.current ? { duration: 0 } : CURVE_SPRING}
        />
      </svg>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function CompareDiagram({ resultA, resultB }: Props) {
  const [tab, setTab] = useState<DiagramTab>('deflection');

  const diagrams: Record<DiagramTab, React.ReactNode> = {
    deflection: (
      <CompareSVG
        pointsA={resultA.shapePoints}
        pointsB={resultB.shapePoints}
        label="Deflection (mm)"
        unit="mm"
        maxValA={resultA.maxDeflection}
        maxValB={resultB.maxDeflection}
        invertY={true}
      />
    ),
    moment: (
      <CompareSVG
        pointsA={resultA.momentPoints}
        pointsB={resultB.momentPoints}
        label="Bending Moment (kNm)"
        unit="kNm"
        maxValA={resultA.maxBendingMoment}
        maxValB={resultB.maxBendingMoment}
      />
    ),
    shear: (
      <CompareSVG
        pointsA={resultA.shearPoints}
        pointsB={resultB.shearPoints}
        label="Shear Force (kN)"
        unit="kN"
        maxValA={resultA.maxShearForce}
        maxValB={resultB.maxShearForce}
      />
    ),
  };

  return (
    <div className="bg-[#0F172A] rounded-2xl border border-white/5 p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Overlay Diagrams
        </h3>
        {/* Tab switcher */}
        <div className="flex gap-1 bg-[#020617] p-1 rounded-lg">
          {(Object.keys(TAB_LABELS) as DiagramTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                tab === t
                  ? 'bg-[#1E293B] text-white shadow-sm ring-1 ring-white/10'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {diagrams[tab]}
      </motion.div>
    </div>
  );
}
