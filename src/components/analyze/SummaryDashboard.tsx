import { motion } from 'framer-motion';
import type { BeamResult } from '../../utils/physics';

interface TileProps {
  label: string;
  value: string;
  sub: string;
  ur: number;
  index: number;
}

function urColor(ur: number) {
  if (ur <= 0.7) return '#22C55E';
  if (ur <= 0.9) return '#F59E0B';
  return '#EF4444';
}

function URBar({ ur }: { ur: number }) {
  const color = urColor(ur);
  const pct = Math.min(ur, 1.2) / 1.2 * 100;
  return (
    <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  );
}

function Tile({ label, value, sub, ur, index }: TileProps) {
  const color = urColor(ur);
  const pass = ur <= 1.0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      className="bg-[#0F172A] rounded-xl p-3 border border-white/5 flex flex-col gap-1"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">{label}</span>
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
          style={{
            backgroundColor: `${color}18`,
            color,
          }}
        >
          {pass ? 'PASS' : 'FAIL'}
        </span>
      </div>
      <div className="text-lg font-bold text-white mt-0.5">{value}</div>
      <div className="text-[10px] text-slate-400 leading-snug">{sub}</div>
      <URBar ur={ur} />
    </motion.div>
  );
}

interface Props {
  result: BeamResult;
  deflectionLimitDivider: number;
}

function deflectionRef(mm: number): string {
  if (mm < 1)  return 'Barely visible';
  if (mm < 2)  return `~${mm.toFixed(1)} mm — a coin's thickness`;
  if (mm < 8)  return `~${mm.toFixed(1)} mm — less than a pencil width`;
  if (mm < 20) return `${mm.toFixed(1)} mm — noticeable sag`;
  return `${mm.toFixed(1)} mm — significant sag`;
}

export default function SummaryDashboard({ result, deflectionLimitDivider: _deflectionLimitDivider }: Props) {
  const margin = 1 - Math.max(result.UR_bending, result.UR_shear, result.UR_deflection);

  const tiles = [
    {
      label: 'Breaking strength',
      value: `${(result.UR_bending * 100).toFixed(0)}% used`,
      sub: result.UR_bending <= 1.0
        ? `Won't snap under load`
        : `Beam would break — try a bigger size`,
      ur: result.UR_bending,
    },
    {
      label: 'Splitting strength',
      value: `${(result.UR_shear * 100).toFixed(0)}% used`,
      sub: result.UR_shear <= 1.0
        ? `Won't split at the supports`
        : `Risk of splitting near the ends`,
      ur: result.UR_shear,
    },
    {
      label: 'Sag under load',
      value: `${result.maxDeflection.toFixed(1)} mm`,
      sub: result.UR_deflection <= 1.0
        ? deflectionRef(result.maxDeflection)
        : `Sag exceeds safe limit`,
      ur: result.UR_deflection,
    },
    {
      label: 'Overall safety',
      value: margin >= 0
        ? `${(margin * 100).toFixed(0)}% headroom`
        : `${(Math.abs(margin) * 100).toFixed(0)}% over limit`,
      sub: margin >= 0.25
        ? 'Good margin — this beam is well-sized'
        : margin >= 0
        ? 'Passing, but close to the limit'
        : 'This beam is too small for these loads',
      ur: 1 - margin,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {tiles.map((t, i) => (
        <Tile key={t.label} {...t} index={i} />
      ))}
    </div>
  );
}
