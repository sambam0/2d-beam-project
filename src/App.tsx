import { useBeamStore } from './store/useBeamStore';
import ModeSwitcher from './components/ModeSwitcher';
import SharedLoadingInputs from './components/SharedLoadingInputs';
import AnalyzeMode from './components/analyze/AnalyzeMode';
import CompareMode from './components/compare/CompareMode';
import SolveMode from './components/solve/SolveMode';


function App() {
  const currentMode = useBeamStore((s) => s.currentMode);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-[#020617]/90 backdrop-blur border-b border-white/5 px-6 py-3 flex items-center gap-6">
        <div className="flex flex-col">
          <h1 className="text-base font-bold text-white leading-tight">2D Beam View</h1>
          <span className="text-xs text-slate-500">Swedish Lumber · EC5</span>
        </div>
        <div className="flex-1" />
        <ModeSwitcher />
      </header>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 border-r border-white/5 bg-[#0A1120] p-5 flex flex-col gap-6 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
          <SharedLoadingInputs />
        </aside>

        {/* Main content */}
        <main className={`flex-1 min-w-0 ${currentMode === 'Analyze' ? 'overflow-hidden flex flex-col p-0' : 'p-6 overflow-y-auto'}`}>
          {currentMode === 'Analyze' && <AnalyzeMode />}
          {currentMode === 'Compare' && <CompareMode />}
          {currentMode === 'Solve' && <SolveMode />}
        </main>
      </div>
    </div>
  );
}

export default App;
