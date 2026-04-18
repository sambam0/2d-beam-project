import { useState } from 'react';
import { motion } from 'framer-motion';
import type { BeamResult } from '../../utils/physics';

type DiagramTab = 'deflection' | 'moment' | 'shear';

interface Props {
  result: BeamResult;
}

const TAB_LABELS: Record<DiagramTab, string> = {
  deflection: 'Sag shape',
  moment: 'Bending diagram',
  shear: 'Shear diagram',
};

function polylinePath(
  points: { x: number; y: number }[],
  W: number,
  H: number,
  padX: number,
  padY: number,
  yMin: number,
  yRange: number,
  xMin: number,
  xRange: number,
  invertY: boolean = false
): string {
  if (!points.length) return '';
  const plotW = W - padX * 2;
  const plotH = H - padY * 2;
  const safeYRange = yRange || 1;
  const safeXRange = xRange || 1;

  return points
    .map((p) => {
      const sx = padX + ((p.x - xMin) / safeXRange) * plotW;
      const rawY = ((p.y - yMin) / safeYRange) * plotH;
      const sy = invertY ? padY + rawY : padY + (plotH - rawY);
      return `${sx},${sy}`;
    })
    .join(' ');
}

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

function pathDClosed(
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
  const baseline = invertY ? padY : padY + plotH;
  const curve = points.map((p) => {
    const sx = padX + ((p.x - xMin) / safeXRange) * plotW;
    const rawY = ((p.y - yMin) / safeYRange) * plotH;
    const sy = invertY ? padY + rawY : padY + (plotH - rawY);
    return `L ${sx} ${sy}`;
  }).join(' ');
  return `M ${padX} ${baseline} ${curve} L ${W - padX} ${baseline} Z`;
}


function BeamIcon() {
  return (
    <svg width="100%" height="28" viewBox="0 0 300 28">
      {/* Ground hatching left */}
      {[0, 6, 12, 18].map((i) => (
        <line key={`hl${i}`} x1={12 - i} y1={20 + i} x2={12} y2={20} stroke="#475569" strokeWidth="1" />
      ))}
      <rect x="6" y="18" width="12" height="3" fill="#475569" rx="1" />
      {/* Ground hatching right */}
      {[0, 6, 12, 18].map((i) => (
        <line key={`hr${i}`} x1={288 + i} y1={20 + i} x2={288} y2={20} stroke="#475569" strokeWidth="1" />
      ))}
      <rect x="282" y="18" width="12" height="3" fill="#475569" rx="1" />
      {/* Beam */}
      <rect x="12" y="13" width="276" height="7" fill="#334155" rx="2" />
      {/* UDL arrows */}
      {[30, 60, 90, 120, 150, 180, 210, 240, 270].map((x) => (
        <g key={x}>
          <line x1={x} y1={2} x2={x} y2={12} stroke="#22C55E" strokeWidth="1.5" />
          <polygon points={`${x},12 ${x - 3},7 ${x + 3},7`} fill="#22C55E" />
        </g>
      ))}
      <line x1="18" y1="3" x2="282" y2="3" stroke="#22C55E" strokeWidth="1" />
    </svg>
  );
}

interface DiagramSVGProps {
  points: { x: number; y: number }[];
  color: string;
  fillColor?: string;
  label: string;
  unit: string;
  maxVal: number;
  invertY?: boolean;
}

function DiagramSVG({ points, color, fillColor, label, unit, maxVal, invertY }: DiagramSVGProps) {

  // Height increased from 180 to 260 to give vertical breathing room
  const W = 600;
  const H = 260;
  const padX = 48;
  const padY = 24;

  const ys = points.map((p) => p.y);
  const zs = points.every(p => p.y === 0);
  const yMin = zs ? 0 : Math.min(...ys);
  const yMax = zs ? 1 : Math.max(...ys);
  const yRange = yMax - yMin;

  const xs = points.map((p) => p.x);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const xRange = xMax - xMin;

  const plotW = W - padX * 2;
  const plotH = H - padY * 2;

  const curvePath = pathD(points, W, H, padX, padY, yMin, yRange, xMin, xRange, invertY);
  const fillPath  = pathDClosed(points, W, H, padX, padY, yMin, yRange, xMin, xRange, invertY);

  const baseline = invertY ? padY : padY + plotH;

  // Labels
  const numLabels = 5;
  const yLabels = Array.from({ length: numLabels + 1 }, (_, i) => {
    const frac = i / numLabels;
    const val = yMin + frac * yRange;
    const sy = invertY ? padY + frac * plotH : padY + plotH - frac * plotH;
    return { val, sy };
  });

  const xLabels = [0, 0.25, 0.5, 0.75, 1].map((frac) => ({
    val: (xMin + frac * xRange).toFixed(1),
    sx: padX + frac * plotW,
  }));

  return (
    <div className="flex flex-col gap-1 w-full h-full">
      <span className="text-xs text-slate-500 uppercase tracking-widest font-medium px-1 shrink-0">
        {label}
      </span>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full flex-1 min-h-0 drop-shadow-md"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {yLabels.map(({ sy }, i) => (
          <line
            key={`g${i}`}
            x1={padX}
            y1={sy}
            x2={W - padX}
            y2={sy}
            stroke="#1E293B"
            strokeWidth="1"
            strokeDasharray="2,4"
          />
        ))}

        {/* Y-axis labels */}
        {yLabels.map(({ val, sy }, i) => (
          <text
            key={`y${i}`}
            x={padX - 8}
            y={sy + 4}
            textAnchor="end"
            fontSize="10"
            fill="#64748B"
          >
            {Math.abs(val) < 0.001 ? '0' : val.toFixed(2)}
          </text>
        ))}

        {/* X-axis labels */}
        {xLabels.map(({ val, sx }, i) => (
          <text
            key={`x${i}`}
            x={sx}
            y={H - 4}
            textAnchor="middle"
            fontSize="10"
            fill="#64748B"
          >
            {val}m
          </text>
        ))}

        {/* Baseline */}
        <line
          x1={padX}
          y1={baseline}
          x2={W - padX}
          y2={baseline}
          stroke="#475569"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Fill area */}
        {fillColor && (
          <motion.path
            key={maxVal}
            d={fillPath}
            fill={fillColor}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Curve */}
        <motion.path
          key={maxVal}
          d={curvePath}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        />

        {/* Peak label positioned away from baseline appropriately */}
        <text
          x={W - padX - 4}
          y={invertY ? padY + plotH + 12 : padY - 6}
          textAnchor="end"
          fontSize="11"
          fill={color}
          fontWeight="600"
        >
          max {maxVal.toFixed(2)} {unit}
        </text>
      </svg>
    </div>
  );
}

export default function DiagramViewer({ result }: Props) {
  const [tab, setTab] = useState<DiagramTab>('deflection');

  const diagrams: Record<DiagramTab, React.ReactNode> = {
    deflection: (
      <DiagramSVG
        points={result.shapePoints}
        color="#22C55E"
        fillColor="#22C55E"
        label="How much the beam sags (mm)"
        unit="mm"
        maxVal={result.maxDeflection}
        invertY={true}
      />
    ),
    moment: (
      <DiagramSVG
        points={result.momentPoints}
        color="#60A5FA"
        fillColor="#60A5FA"
        label="Bending stress along beam (kNm)"
        unit="kNm"
        maxVal={result.maxBendingMoment}
      />
    ),
    shear: (
      <DiagramSVG
        points={result.shearPoints}
        color="#F472B6"
        fillColor="#F472B6"
        label="Shear stress along beam (kN)"
        unit="kN"
        maxVal={result.maxShearForce}
      />
    ),
  };

  return (
    <div className="bg-[#0F172A] rounded-2xl border border-white/5 p-4 flex flex-col gap-4 h-full min-h-0">
      {/* Beam schematic */}
      <div className="px-2 shrink-0">
        <BeamIcon />
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-[#020617] p-1 rounded-lg w-fit shrink-0">
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

      {/* Diagram — fills remaining height */}
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex-1 min-h-0 flex flex-col"
      >
        {diagrams[tab]}
      </motion.div>
    </div>
  );
}
