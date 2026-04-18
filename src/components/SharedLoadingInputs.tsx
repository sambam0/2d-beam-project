import { useBeamStore } from '../store/useBeamStore';
import { Ruler, Weight, Layers, Sofa, Leaf, Package } from 'lucide-react';
import React from 'react';

// ── Balcony top-down diagram ──────────────────────────────────────────────────
function BalconyDiagram() {
  return (
    <svg width="100%" viewBox="0 0 196 70" className="w-full">
      {/* Wall strip */}
      <rect x="0" y="0" width="11" height="70" fill="#1E293B" rx="1" />
      {/* Wall hatching */}
      {[8, 16, 24, 32, 40, 48, 56, 64, 72].map((y) => (
        <line key={y} x1="0" y1={y} x2="11" y2={y - 9} stroke="#334155" strokeWidth="0.75" />
      ))}

      {/* Decking planks running perpendicular to beams */}
      {[22, 34, 46, 58, 70, 82, 94, 106, 118, 130].map((x) => (
        <line key={x} x1={x} y1="20" x2={x} y2="50" stroke="rgba(51,65,85,0.55)" strokeWidth="1" />
      ))}

      {/* Beam 1 */}
      <rect x="11" y="18" width="130" height="9" fill="rgba(34,197,94,0.13)" stroke="#22C55E" strokeWidth="1.25" rx="1.5" />
      {/* Beam 2 */}
      <rect x="11" y="43" width="130" height="9" fill="rgba(34,197,94,0.13)" stroke="#22C55E" strokeWidth="1.25" rx="1.5" />

      {/* Beam length arrow (above beam 1) */}
      <line x1="11" y1="12" x2="141" y2="12" stroke="#475569" strokeWidth="0.75" />
      <line x1="11" y1="9"  x2="11"  y2="15" stroke="#475569" strokeWidth="0.75" />
      <line x1="141" y1="9" x2="141" y2="15" stroke="#475569" strokeWidth="0.75" />
      <text x="76" y="9" textAnchor="middle" fill="#64748B" fontSize="7.5" fontFamily="sans-serif">Beam Length</text>

      {/* Spacing arrow (right of beams) */}
      <line x1="154" y1="22" x2="154" y2="47" stroke="#475569" strokeWidth="0.75" />
      <line x1="151" y1="22" x2="157" y2="22" stroke="#475569" strokeWidth="0.75" />
      <line x1="151" y1="47" x2="157" y2="47" stroke="#475569" strokeWidth="0.75" />
      <text x="159" y="37" textAnchor="start" dominantBaseline="middle" fill="#64748B" fontSize="7.5" fontFamily="sans-serif">Spacing</text>

      {/* WALL label rotated */}
      <text
        x="5.5" y="35"
        textAnchor="middle" dominantBaseline="middle"
        fill="#475569" fontSize="6.5" fontFamily="sans-serif"
        transform="rotate(-90,5.5,35)"
      >
        WALL
      </text>
    </svg>
  );
}

// ── Reusable 3-option picker ──────────────────────────────────────────────────
interface PickerOption { label: string; value: number; sub: string }

function ThreePicker({ options, current, onChange }: {
  options: [PickerOption, PickerOption, PickerOption];
  current: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {options.map(({ label, value, sub }) => {
        const active = current === value;
        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg border text-center transition-all duration-200 cursor-pointer ${
              active
                ? 'bg-[#22C55E]/12 border-[#22C55E]/70 text-[#22C55E] shadow-[0_0_12px_rgba(34,197,94,0.15)]'
                : 'bg-[#020617] border-white/8 text-slate-400 hover:border-white/20 hover:text-slate-200 hover:bg-white/4'
            }`}
          >
            <span className="text-xs font-semibold leading-tight">{label}</span>
            <span className={`text-[9px] leading-tight ${active ? 'text-[#22C55E]/60' : 'text-slate-600'}`}>{sub}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Numeric field with description + filled slider ────────────────────────────
interface FieldProps {
  label: string;
  description: string;
  unit?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  icon?: React.ReactNode;
  onChange: (v: number) => void;
}

function NumField({ label, description, unit, value, min, max, step = 0.1, icon, onChange }: FieldProps) {
  const fillPct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <div className="group flex flex-col gap-2 bg-[#0F172A] p-3 border border-white/5 rounded-xl transition-all duration-200 hover:border-white/10">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <label className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold leading-tight">
            {icon && (
              <span className="text-slate-600 group-hover:text-[#22C55E]/70 transition-colors duration-200 shrink-0">
                {icon}
              </span>
            )}
            {label}
          </label>
          <span className="text-[10px] text-slate-500 leading-tight">{description}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#020617] rounded-lg px-2.5 py-1 border border-white/10 focus-within:border-[#22C55E]/50 focus-within:ring-1 focus-within:ring-[#22C55E]/20 transition-all duration-200 shrink-0">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className="w-14 bg-transparent border-none text-right text-sm font-medium text-white focus:outline-none tabular-nums"
          />
          {unit && <span className="text-[11px] text-slate-500 select-none">{unit}</span>}
        </div>
      </div>

      <div className="flex flex-col gap-1 pt-0.5">
        <div className="relative flex items-center h-5">
          <div className="absolute left-0 right-0 h-1.5 rounded-full overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-white/8 rounded-full" />
            <div
              className="absolute left-0 inset-y-0 rounded-full transition-[width] duration-75"
              style={{ width: `${fillPct}%`, background: 'linear-gradient(to right, #16a34a, #22C55E)' }}
            />
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className="beam-slider relative w-full z-10"
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-600 select-none tabular-nums font-medium px-0.5">
          <span>{min}{unit ? ` ${unit}` : ''}</span>
          <span>{max}{unit ? ` ${unit}` : ''}</span>
        </div>
      </div>
    </div>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-0.5 pt-2">
      {children}
    </h3>
  );
}

// ── Balcony use-case presets ──────────────────────────────────────────────────
interface PresetConfig {
  label: string;
  Icon: React.ElementType;
  liveLoad: number;
  deadLoad: number;
  sub: string;
}

const PRESETS: PresetConfig[] = [
  { label: 'Seating',  Icon: Sofa,    liveLoad: 2.5, deadLoad: 0.8, sub: 'chairs & people' },
  { label: 'Planters', Icon: Leaf,    liveLoad: 3.0, deadLoad: 1.5, sub: 'pots & furniture' },
  { label: 'Heavy',    Icon: Package, liveLoad: 5.0, deadLoad: 2.0, sub: 'stone & spa' },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function SharedLoadingInputs() {
  const {
    span, setSpan,
    liveLoad, setLiveLoad,
    tributaryWidth, setTributaryWidth,
    deadLoad, setDeadLoad,
    safetyFactor, setSafetyFactor,
    deflectionLimitDivider, setDeflectionLimitDivider,
  } = useBeamStore();

  const activePreset = PRESETS.find(
    (p) => p.liveLoad === liveLoad && p.deadLoad === deadLoad
  ) ?? null;

  return (
    <div className="flex flex-col gap-1">

      {/* ── Balcony type ── */}
      <SectionLabel>Balcony Type</SectionLabel>
      <div className="grid grid-cols-3 gap-1.5 mt-1">
        {PRESETS.map(({ label, Icon, liveLoad: ll, deadLoad: dl, sub }) => {
          const active = activePreset?.label === label;
          return (
            <button
              key={label}
              onClick={() => { setLiveLoad(ll); setDeadLoad(dl); }}
              className={`flex flex-col items-center gap-1 py-3 px-1 rounded-xl border transition-all duration-200 cursor-pointer ${
                active
                  ? 'bg-[#22C55E]/12 border-[#22C55E]/70 text-[#22C55E] shadow-[0_0_14px_rgba(34,197,94,0.15)]'
                  : 'bg-[#0F172A] border-white/8 text-slate-400 hover:border-white/20 hover:text-slate-200'
              }`}
            >
              <Icon size={16} />
              <span className="text-[11px] font-semibold leading-tight">{label}</span>
              <span className={`text-[9px] text-center leading-tight ${active ? 'text-[#22C55E]/60' : 'text-slate-600'}`}>
                {sub}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Geometry ── */}
      <SectionLabel>Geometry</SectionLabel>
      <div className="bg-[#0F172A] rounded-xl px-3 pt-3 pb-2 border border-white/5 mt-1">
        <BalconyDiagram />
      </div>
      <NumField
        label="Beam Length"
        description="how far the balcony extends"
        unit="m"
        value={span}
        min={0.5} max={8} step={0.1}
        icon={<Ruler size={13} />}
        onChange={setSpan}
      />
      <NumField
        label="Beam Spacing"
        description="distance between joists"
        unit="m"
        value={tributaryWidth}
        min={0.1} max={2} step={0.05}
        icon={<Ruler size={13} />}
        onChange={setTributaryWidth}
      />

      {/* ── Loads ── */}
      <SectionLabel>Loads</SectionLabel>
      <NumField
        label="People & Furniture"
        description="occupants, chairs, pots, tables"
        unit="kN/m²"
        value={liveLoad}
        min={0} max={10} step={0.25}
        icon={<Weight size={13} />}
        onChange={setLiveLoad}
      />
      <NumField
        label="Decking & Structure"
        description="boards, framing, railing weight"
        unit="kN/m²"
        value={deadLoad}
        min={0} max={5} step={0.1}
        icon={<Layers size={13} />}
        onChange={setDeadLoad}
      />

      {/* ── Design settings ── */}
      <SectionLabel>Design Settings</SectionLabel>
      <div className="flex flex-col gap-1.5 bg-[#0F172A] p-3 rounded-xl border border-white/5 mt-1">
        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">
          Safety Level
        </span>
        <ThreePicker
          options={[
            { label: 'Standard', value: 1.0, sub: 'code min' },
            { label: 'Cautious', value: 1.2, sub: 'extra margin' },
            { label: 'Strict',   value: 1.5, sub: 'max safety' },
          ]}
          current={safetyFactor}
          onChange={setSafetyFactor}
        />
      </div>
      <div className="flex flex-col gap-1.5 bg-[#0F172A] p-3 rounded-xl border border-white/5">
        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">
          Allowed Sag
        </span>
        <ThreePicker
          options={[
            { label: 'Flexible', value: 200, sub: 'slight bounce' },
            { label: 'Normal',   value: 300, sub: 'everyday' },
            { label: 'Rigid',    value: 500, sub: 'no sag' },
          ]}
          current={deflectionLimitDivider}
          onChange={setDeflectionLimitDivider}
        />
      </div>

    </div>
  );
}
