import type { PlankConfig } from '../../store/useBeamStore';
import { WOOD_CLASSES } from '../../utils/physics';
import { Maximize2, ArrowUpDown, TreePine } from 'lucide-react';

interface Props {
  plank: PlankConfig;
  setPlank: (patch: Partial<PlankConfig>) => void;
}

/** Proportional cross-section diagram with neutral-axis dashed line */
function CrossSection({ b, h }: { b: number; h: number }) {
  const W = 52, H = 40, pad = 5;
  const scale = Math.min((W - pad * 2) / b, (H - pad * 2) / h);
  const rw = Math.round(b * scale);
  const rh = Math.round(h * scale);
  const rx = (W - rw) / 2;
  const ry = (H - rh) / 2;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="shrink-0">
      <rect
        x={rx} y={ry} width={rw} height={rh}
        fill="rgba(34,197,94,0.1)" stroke="#22C55E" strokeWidth="1.5" rx="1"
      />
      <line
        x1={rx - 3} y1={ry + rh / 2}
        x2={rx + rw + 3} y2={ry + rh / 2}
        stroke="rgba(34,197,94,0.4)" strokeWidth="0.75" strokeDasharray="2,1.5"
      />
    </svg>
  );
}

const SELECTED_BTN = [
  'bg-[#22C55E]/12 border-[#22C55E]/70 text-[#22C55E]',
  'shadow-[0_0_18px_rgba(34,197,94,0.18),inset_0_0_14px_rgba(34,197,94,0.06)]',
].join(' ');

const IDLE_BTN =
  'bg-[#020617] border-white/8 text-slate-400 hover:border-white/20 hover:text-slate-200 hover:bg-white/4';

const GRADE_LABELS: Record<string, { short: string; recommended?: boolean }> = {
  C14:   { short: 'Budget grade' },
  C18:   { short: 'General use' },
  C24:   { short: 'Most common', recommended: true },
  C30:   { short: 'High strength' },
  GL28c: { short: 'Glulam' },
};

export default function SectionInputs({ plank, setPlank }: Props) {
  const WIDTHS  = [45, 70, 95];
  const HEIGHTS = [95, 120, 145, 170, 195, 220];

  return (
    <div className="flex flex-col gap-3">

      {/* ── Width selector ── */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider shrink-0 w-12 flex items-center gap-1">
          <Maximize2 size={11} className="text-slate-600" />
          Width
        </span>
        <div className="flex gap-1.5 flex-1">
          {WIDTHS.map((w) => {
            const active = plank.b === w;
            return (
              <button
                key={w}
                onClick={() => setPlank({ b: w })}
                className={`flex-1 relative py-1 rounded-md text-xs font-semibold border transition-all duration-200 cursor-pointer overflow-hidden ${
                  active ? SELECTED_BTN : IDLE_BTN
                }`}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#22C55E] rounded-b-full shadow-[0_0_8px_rgba(34,197,94,0.9)]" />
                )}
                {w}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Depth selector ── */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider shrink-0 w-12 flex items-center gap-1">
          <ArrowUpDown size={11} className="text-slate-600" />
          Depth
        </span>
        <div className="flex gap-1.5 flex-1 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden">
          {HEIGHTS.map((h) => {
            const active = plank.h === h;
            return (
              <button
                key={h}
                onClick={() => setPlank({ h })}
                className={`shrink-0 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all duration-200 cursor-pointer overflow-hidden relative ${
                  active ? SELECTED_BTN : IDLE_BTN
                }`}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#22C55E] rounded-b-full shadow-[0_0_8px_rgba(34,197,94,0.9)]" />
                )}
                {h}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Timber grade selector ── */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider shrink-0 w-12 flex items-center gap-1">
          <TreePine size={11} className="text-slate-600" />
          Grade
        </span>
        <div className="flex gap-1.5 flex-wrap flex-1">
          {Object.keys(WOOD_CLASSES).map((cls) => {
            const active = plank.woodClass === cls;
            const meta = GRADE_LABELS[cls] ?? { short: cls };
            return (
              <button
                key={cls}
                onClick={() => setPlank({ woodClass: cls })}
                title={meta.short}
                className={`relative px-2.5 py-1 rounded-md text-xs font-semibold border transition-all duration-200 cursor-pointer overflow-hidden ${
                  active ? SELECTED_BTN : IDLE_BTN
                }`}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#22C55E] rounded-b-full shadow-[0_0_8px_rgba(34,197,94,0.9)]" />
                )}
                {cls}
                {!active && meta.recommended && (
                  <span className="ml-0.5 text-[#22C55E]/60 text-[8px]">★</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Beam cross-section summary ── */}
      <div className="bg-[#020617] rounded-xl p-2 border border-white/8">
        <div className="flex gap-2 items-center">
          <CrossSection b={plank.b} h={plank.h} />
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider">Selected beam</span>
            <span className="text-sm font-bold text-white tabular-nums">{plank.b} × {plank.h} mm</span>
            <span className="text-[10px] text-slate-400">{GRADE_LABELS[plank.woodClass]?.short ?? plank.woodClass}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
