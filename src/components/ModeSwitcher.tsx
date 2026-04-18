import { motion } from 'framer-motion';
import { useBeamStore, type Mode } from '../store/useBeamStore';
import { Activity, ArrowLeftRight, Wrench } from 'lucide-react';
import React from 'react';

const MODE_CONFIG: Array<{ mode: Mode; Icon: React.ElementType }> = [
  { mode: 'Analyze', Icon: Activity },
  { mode: 'Compare', Icon: ArrowLeftRight },
  { mode: 'Solve',   Icon: Wrench },
];

export default function ModeSwitcher() {
  const currentMode   = useBeamStore((s) => s.currentMode);
  const setCurrentMode = useBeamStore((s) => s.setCurrentMode);

  return (
    <div className="flex bg-[#0F172A] p-1 rounded-xl w-fit border border-white/8 relative">
      {MODE_CONFIG.map(({ mode, Icon }) => {
        const active = currentMode === mode;
        return (
          <button
            key={mode}
            onClick={() => setCurrentMode(mode)}
            className={`flex items-center gap-2 relative px-4 py-2 rounded-lg text-sm font-semibold z-10 cursor-pointer transition-colors duration-150 ${
              active
                ? 'text-[#020617]'
                : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            {active && (
              <motion.div
                layoutId="mode-pill"
                className="absolute inset-0 rounded-lg bg-[#22C55E]"
                style={{
                  zIndex: -1,
                  boxShadow: '0 0 14px rgba(34,197,94,0.45), 0 0 4px rgba(34,197,94,0.3)',
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              />
            )}
            {/* Icon inherits text color (currentColor) from the button */}
            <Icon size={15} />
            {mode}
          </button>
        );
      })}
    </div>
  );
}
