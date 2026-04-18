import { useState, useMemo } from 'react';
import { Play, CheckCircle, XCircle, ChevronRight, Target, RefreshCw } from 'lucide-react';
import { useBeamStore } from '../../store/useBeamStore';
import { calculateBeam, STANDARD_LUMBER_SIZES, WOOD_CLASSES } from '../../utils/physics';

export default function SolveMode() {
  const {
    span, liveLoad, deadLoad, tributaryWidth, safetyFactor, deflectionLimitDivider,
    targetURBending, setTargetURBending,
    targetURShear, setTargetURShear,
    plankA, // used for default wood class
    setCurrentMode, setPlankA,
  } = useBeamStore();

  const [selectedGrade, setSelectedGrade] = useState(plankA.woodClass || 'C24');
  const [hasSolved, setHasSolved] = useState(false);
  
  // Sort lumber visually by area
  const sortedLumber = useMemo(() => {
    return [...STANDARD_LUMBER_SIZES].sort((a, b) => (a.b * a.h) - (b.b * b.h));
  }, []);

  const [results, setResults] = useState<any[]>([]);
  const [winner, setWinner] = useState<any>(null);

  const handleSolve = () => {
    const newResults = sortedLumber.map((size) => {
      const plank = { b: size.b, h: size.h, woodClass: selectedGrade };
      const res = calculateBeam(
        { span, liveLoad, tributaryWidth, deadLoad, safetyFactor },
        plank,
        deflectionLimitDivider
      );

      // Custom pass logic using user-defined max UR targets
      const customPass = 
        res.UR_bending <= targetURBending && 
        res.UR_shear <= targetURShear && 
        res.UR_deflection <= 1.0;

      return {
        size,
        plank,
        res,
        customPass,
        area: size.b * size.h
      };
    });

    setResults(newResults);
    const optimal = newResults.find(r => r.customPass);
    setWinner(optimal || null);
    setHasSolved(true);
  };

  const applyToAnalyze = (plank: any) => {
    setPlankA(plank);
    setCurrentMode('Analyze');
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      
      {/* ── Criteria Panel ── */}
      <div className="bg-[#0F172A] rounded-2xl border border-white/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target className="text-[#22C55E]" size={18} />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Optimization Criteria</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* UR Bending Target */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Max UR Bending</label>
            <div className="flex items-center gap-3">
              <input 
                type="range" 
                min="0.5" max="1.0" step="0.05"
                value={targetURBending}
                onChange={(e) => setTargetURBending(parseFloat(e.target.value))}
                className="beam-slider flex-1"
                style={{ background: `linear-gradient(to right, #16a34a ${((targetURBending - 0.5) / 0.5) * 100}%, rgba(255,255,255,0.08) ${((targetURBending - 0.5) / 0.5) * 100}%)` }}
              />
              <span className="text-sm font-bold text-white tabular-nums w-12">{targetURBending.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-slate-500">Limits Bending Stress utilisation</p>
          </div>

          {/* UR Shear Target */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Max UR Shear</label>
            <div className="flex items-center gap-3">
              <input 
                type="range" 
                min="0.5" max="1.0" step="0.05"
                value={targetURShear}
                onChange={(e) => setTargetURShear(parseFloat(e.target.value))}
                className="beam-slider flex-1"
                style={{ background: `linear-gradient(to right, #16a34a ${((targetURShear - 0.5) / 0.5) * 100}%, rgba(255,255,255,0.08) ${((targetURShear - 0.5) / 0.5) * 100}%)` }}
              />
              <span className="text-sm font-bold text-white tabular-nums w-12">{targetURShear.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-slate-500">Limits Shear Stress utilisation</p>
          </div>

          {/* Wood Class */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Timber Grade</label>
            <div className="relative">
              <select 
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full bg-[#020617] border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-[#22C55E]/50 appearance-none"
              >
                {Object.keys(WOOD_CLASSES).map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronRight size={14} className="rotate-90" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500">Grade to assume for all candidates</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={handleSolve}
            className="flex items-center gap-2 bg-[#22C55E] hover:bg-[#16a34a] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:-translate-y-0.5"
          >
            {hasSolved ? <RefreshCw size={16} /> : <Play size={16} />}
            {hasSolved ? 'Recalculate' : 'Run Solver'}
          </button>
        </div>
      </div>

      {/* ── Results Area ── */}
      {hasSolved && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Winner Card */}
          {winner ? (
            <div className="relative overflow-hidden bg-gradient-to-br from-[#22C55E]/10 to-[#0F172A] border border-[#22C55E]/30 rounded-2xl p-6 shadow-[0_8px_32px_rgba(34,197,94,0.1)]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#22C55E]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-[#22C55E]/20 flex items-center justify-center border border-[#22C55E]/30 shrink-0 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                    <CheckCircle className="text-[#22C55E]" size={32} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#22C55E] uppercase tracking-wider mb-1">Optimal Section Found</h3>
                    <div className="flex items-end gap-3 text-white">
                      <span className="text-3xl font-black tracking-tight">{winner.size.b} × {winner.size.h}</span>
                      <span className="text-sm text-slate-400 mb-1.5 font-medium">{selectedGrade}</span>
                    </div>
                  </div>
                </div>

                <div className="flex grid-cols-3 gap-6 bg-[#020617]/50 p-4 rounded-xl border border-white/5 rtl">
                  <div className="flex flex-col gap-1 items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Bending</span>
                    <span className={`text-sm font-bold ${winner.res.UR_bending > targetURBending ? 'text-red-400' : 'text-[#22C55E]'}`}>
                      {(winner.res.UR_bending * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-px h-full bg-white/10" />
                  <div className="flex flex-col gap-1 items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Shear</span>
                    <span className={`text-sm font-bold ${winner.res.UR_shear > targetURShear ? 'text-red-400' : 'text-[#22C55E]'}`}>
                      {(winner.res.UR_shear * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-px h-full bg-white/10" />
                  <div className="flex flex-col gap-1 items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Deflection</span>
                    <span className={`text-sm font-bold ${winner.res.UR_deflection > 1.0 ? 'text-red-400' : 'text-[#22C55E]'}`}>
                      {(winner.res.UR_deflection * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => applyToAnalyze(winner.plank)}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shrink-0"
                >
                  Apply to Analyze
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30 shrink-0">
                <XCircle className="text-red-500" size={24} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-1">No Passing Section</h3>
                <p className="text-sm text-red-200/70">None of the standard lumber sizes meet the criteria under these loads. Consider decreasing span, loads, or target utilisation limits, or specify a custom engineered section.</p>
              </div>
            </div>
          )}

          {/* Candidates Table */}
          <div className="bg-[#0F172A] rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 bg-[#020617]/50">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Candidate Evaluation</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#020617]/30 text-xs text-slate-400 uppercase tracking-widest">
                    <th className="px-5 py-3 font-semibold">Section (mm)</th>
                    <th className="px-5 py-3 font-semibold text-right">Area (cm²)</th>
                    <th className="px-5 py-3 font-semibold text-right">UR Bending</th>
                    <th className="px-5 py-3 font-semibold text-right">UR Shear</th>
                    <th className="px-5 py-3 font-semibold text-right">Deflection</th>
                    <th className="px-5 py-3 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {results.map((r, i) => (
                    <tr 
                      key={i} 
                      className={`transition-colors hover:bg-white/[0.02] ${r === winner ? 'bg-[#22C55E]/5 font-medium' : ''}`}
                    >
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className="text-white">{r.size.b} × {r.size.h}</span>
                        {r === winner && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-[#22C55E]/20 text-[#22C55E] uppercase font-bold tracking-wider">Optimal</span>}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap text-right text-slate-400">
                        {(r.area / 1e2).toFixed(1)}
                      </td>
                      <td className={`px-5 py-3 whitespace-nowrap text-right ${r.res.UR_bending > targetURBending ? 'text-red-400' : 'text-slate-300'}`}>
                        {(r.res.UR_bending * 100).toFixed(1)}%
                      </td>
                      <td className={`px-5 py-3 whitespace-nowrap text-right ${r.res.UR_shear > targetURShear ? 'text-red-400' : 'text-slate-300'}`}>
                        {(r.res.UR_shear * 100).toFixed(1)}%
                      </td>
                      <td className={`px-5 py-3 whitespace-nowrap text-right ${r.res.UR_deflection > 1.0 ? 'text-red-400' : 'text-slate-300'}`}>
                        {(r.res.UR_deflection * 100).toFixed(1)}%
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap text-center">
                        {r.customPass ? (
                          <div className="inline-flex items-center gap-1.5 text-[#22C55E] bg-[#22C55E]/10 px-2 py-1 rounded-lg text-xs font-bold">
                            <CheckCircle size={12} />
                            PASS
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-red-400 bg-red-400/10 px-2 py-1 rounded-lg text-xs font-bold">
                            <XCircle size={12} />
                            FAIL
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
