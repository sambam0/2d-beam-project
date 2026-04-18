import { useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import { useBeamStore } from '../../store/useBeamStore';
import { calculateBeam } from '../../utils/physics';
import SectionInputs from './SectionInputs';
import SummaryDashboard from './SummaryDashboard';
import DiagramViewer from './DiagramViewer';
import ShowWorkPanel from './ShowWorkPanel';

export default function AnalyzeMode() {
  const {
    span, liveLoad, deadLoad, tributaryWidth, safetyFactor, deflectionLimitDivider,
    plankA, setPlankA,
    setShowWorkPanelVisible, showWorkPanelVisible,
  } = useBeamStore();

  const result = useMemo(() =>
    calculateBeam(
      { span, liveLoad, tributaryWidth, deadLoad, safetyFactor },
      plankA,
      deflectionLimitDivider
    ),
    [span, liveLoad, tributaryWidth, deadLoad, safetyFactor, plankA, deflectionLimitDivider]
  );

  return (
    <>
      <div className="flex flex-col h-full min-h-0 gap-3 p-5">

        {/* TOP STRIP — beam selector + results side by side */}
        <div className="flex gap-4 shrink-0">
          {/* Beam size selector */}
          <div className="bg-[#0F172A] rounded-2xl border border-white/5 p-3 w-[260px] shrink-0">
            <SectionInputs plank={plankA} setPlank={setPlankA} />
          </div>

          {/* Results tiles + Show Work */}
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            <SummaryDashboard result={result} deflectionLimitDivider={deflectionLimitDivider} />
            <button
              onClick={() => setShowWorkPanelVisible(!showWorkPanelVisible)}
              className="flex items-center gap-2 self-start px-4 py-2 bg-[#0F172A] border border-white/10 rounded-xl text-sm text-slate-400 hover:text-white hover:border-white/20 transition-all cursor-pointer"
            >
              <BookOpen size={14} />
              Show Work
            </button>
          </div>
        </div>

        {/* DIAGRAM — fills remaining height */}
        <div className="flex-1 min-h-0">
          <DiagramViewer result={result} />
        </div>

      </div>

      <ShowWorkPanel
        result={result}
        plank={plankA}
        visible={showWorkPanelVisible}
        onClose={() => setShowWorkPanelVisible(false)}
      />
    </>
  );
}
