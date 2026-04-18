import { useMemo, useState } from 'react';
import { BookOpen, Trophy, AlertTriangle } from 'lucide-react';
import { useBeamStore } from '../../store/useBeamStore';
import type { PlankConfig } from '../../store/useBeamStore';
import { calculateBeam } from '../../utils/physics';
import type { BeamResult } from '../../utils/physics';
import SectionInputs from '../analyze/SectionInputs';
import SummaryDashboard from '../analyze/SummaryDashboard';
import ShowWorkPanel from '../analyze/ShowWorkPanel';
import CompareDiagram from './CompareDiagram';

// ── Per-design column ─────────────────────────────────────────────────────────
interface DesignPanelProps {
  label: string;
  accent: string;
  result: BeamResult;
  plank: PlankConfig;
  setPlank: (patch: Partial<PlankConfig>) => void;
  isWinner: boolean;
  deflectionLimitDivider: number;
  onShowWork: () => void;
}

function DesignPanel({
  label, accent, result, plank, setPlank,
  isWinner, deflectionLimitDivider, onShowWork,
}: DesignPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Column header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: accent }} />
          <h2 className="text-sm font-bold" style={{ color: accent }}>{label}</h2>
        </div>
        {isWinner && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-full px-2.5 py-0.5">
            <Trophy size={11} />
            Better choice
          </span>
        )}
      </div>

      {/* Section selector */}
      <div className="bg-[#0F172A] rounded-2xl border border-white/5 p-4">
        <SectionInputs plank={plank} setPlank={setPlank} />
      </div>

      {/* Result tiles */}
      <SummaryDashboard result={result} deflectionLimitDivider={deflectionLimitDivider} />

      {/* Show Work */}
      <button
        onClick={onShowWork}
        className="flex items-center gap-2 self-start px-4 py-2 bg-[#0F172A] border border-white/10 rounded-xl text-sm text-slate-400 hover:text-white hover:border-white/20 transition-all cursor-pointer"
      >
        <BookOpen size={14} />
        Show Work
      </button>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function CompareMode() {
  const {
    span, liveLoad, deadLoad, tributaryWidth, safetyFactor, deflectionLimitDivider,
    plankA, setPlankA,
    plankB, setPlankB,
  } = useBeamStore();

  const [workOpen, setWorkOpen] = useState<'A' | 'B' | null>(null);

  const resultA = useMemo(() =>
    calculateBeam({ span, liveLoad, tributaryWidth, deadLoad, safetyFactor }, plankA, deflectionLimitDivider),
    [span, liveLoad, tributaryWidth, deadLoad, safetyFactor, plankA, deflectionLimitDivider]
  );

  const resultB = useMemo(() =>
    calculateBeam({ span, liveLoad, tributaryWidth, deadLoad, safetyFactor }, plankB, deflectionLimitDivider),
    [span, liveLoad, tributaryWidth, deadLoad, safetyFactor, plankB, deflectionLimitDivider]
  );

  // Winner = higher governing margin; prefer A on tie; 'none' if both fail
  const marginA = 1 - Math.max(resultA.UR_bending, resultA.UR_shear, resultA.UR_deflection);
  const marginB = 1 - Math.max(resultB.UR_bending, resultB.UR_shear, resultB.UR_deflection);
  const winner: 'A' | 'B' | 'none' =
    !resultA.pass && !resultB.pass ? 'none'
    : !resultB.pass                ? 'A'
    : !resultA.pass                ? 'B'
    : marginA >= marginB           ? 'A' : 'B';

  return (
    <>
      <div className="flex flex-col gap-5">
        {/* Neither-passes warning */}
        {winner === 'none' && (
          <div className="flex items-center gap-2.5 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl px-4 py-3 text-xs text-[#F59E0B] font-medium">
            <AlertTriangle size={14} className="shrink-0" />
            Neither design passes all checks — try increasing depth or selecting a stronger timber grade
          </div>
        )}

        {/* Two-column panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <DesignPanel
            label="Design A"
            accent="#22C55E"
            result={resultA}
            plank={plankA}
            setPlank={setPlankA}
            isWinner={winner === 'A'}
            deflectionLimitDivider={deflectionLimitDivider}
            onShowWork={() => setWorkOpen('A')}
          />
          <DesignPanel
            label="Design B"
            accent="#60A5FA"
            result={resultB}
            plank={plankB}
            setPlank={setPlankB}
            isWinner={winner === 'B'}
            deflectionLimitDivider={deflectionLimitDivider}
            onShowWork={() => setWorkOpen('B')}
          />
        </div>

        {/* Overlay diagram — full width */}
        <CompareDiagram resultA={resultA} resultB={resultB} />
      </div>

      {/* Show Work panels — one open at a time */}
      <ShowWorkPanel
        result={resultA}
        plank={plankA}
        visible={workOpen === 'A'}
        onClose={() => setWorkOpen(null)}
      />
      <ShowWorkPanel
        result={resultB}
        plank={plankB}
        visible={workOpen === 'B'}
        onClose={() => setWorkOpen(null)}
      />
    </>
  );
}
