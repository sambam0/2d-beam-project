import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { PlankConfig } from '../../store/useBeamStore';
import { useBeamStore } from '../../store/useBeamStore';
import type { BeamResult } from '../../utils/physics';
import { WOOD_CLASSES } from '../../utils/physics';

interface Props {
  result: BeamResult;
  plank: PlankConfig;
  visible: boolean;
  onClose: () => void;
}

interface StepProps {
  step: number;
  title: string;
  lines: React.ReactNode[];
  highlight?: React.ReactNode;
}

function L({ children }: { children: string }) {
  return <Latex>{children}</Latex>;
}

function Step({ step, title, lines, highlight }: StepProps) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center justify-center text-xs font-bold text-[#22C55E]">
        {step}
      </div>
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{title}</div>
        {lines.map((line, i) => (
          <div key={i} className="text-xs text-slate-400 leading-relaxed [&_.katex]:text-slate-300">{line}</div>
        ))}
        {highlight && (
          <div className="mt-1 text-xs font-bold text-[#22C55E] bg-[#22C55E]/5 border border-[#22C55E]/20 rounded-lg px-3 py-1.5 [&_.katex]:text-[#22C55E]">
            {highlight}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShowWorkPanel({ result, plank, visible, onClose }: Props) {
  const { span, liveLoad, deadLoad, tributaryWidth, safetyFactor, deflectionLimitDivider } = useBeamStore();

  const wood = WOOD_CLASSES[plank.woodClass] || WOOD_CLASSES['C24'];
  const k_mod = 0.8;
  const gamma_m = 1.3;
  const f_m_d = (wood.f_m_k * k_mod) / gamma_m;
  const f_v_d = (wood.f_v_k * k_mod) / gamma_m;
  const gamma_G = 1.2 * safetyFactor;
  const gamma_Q = 1.5 * safetyFactor;
  const w_uls = (gamma_G * deadLoad + gamma_Q * liveLoad) * tributaryWidth;
  const w_sls = (deadLoad + liveLoad) * tributaryWidth;
  const I = (plank.b * Math.pow(plank.h, 3)) / 12;
  const W_el = (plank.b * Math.pow(plank.h, 2)) / 6;
  const A = plank.b * plank.h;
  const sigma_md = result.maxBendingMoment * 1e6 / W_el;
  const tau_d = 1.5 * result.maxShearForce * 1e3 / A;

  const steps: StepProps[] = [
    {
      step: 1,
      title: 'Section Properties',
      lines: [
        <L>{`$b = ${plank.b}\\text{ mm},\\quad h = ${plank.h}\\text{ mm}$`}</L>,
        <L>{`$A = b \\times h = ${A.toFixed(0)}\\text{ mm}^2$`}</L>,
        <L>{`$I = \\dfrac{bh^3}{12} = ${(I / 1e4).toFixed(0)}\\text{ cm}^4$`}</L>,
        <L>{`$W_{el} = \\dfrac{bh^2}{6} = ${(W_el / 1e3).toFixed(0)}\\text{ cm}^3$`}</L>,
      ],
    },
    {
      step: 2,
      title: 'Material Design Values',
      lines: [
        <L>{`$\\text{Wood class: }\\textbf{${plank.woodClass}}$`}</L>,
        <L>{`$f_{m,k} = ${wood.f_m_k}\\text{ MPa},\\quad f_{v,k} = ${wood.f_v_k}\\text{ MPa}$`}</L>,
        <L>{`$k_{mod} = ${k_mod},\\quad \\gamma_M = ${gamma_m}$`}</L>,
        <L>{`$f_{m,d} = \\dfrac{f_{m,k} \\cdot k_{mod}}{\\gamma_M} = ${f_m_d.toFixed(2)}\\text{ MPa}$`}</L>,
        <L>{`$f_{v,d} = \\dfrac{f_{v,k} \\cdot k_{mod}}{\\gamma_M} = ${f_v_d.toFixed(2)}\\text{ MPa}$`}</L>,
      ],
    },
    {
      step: 3,
      title: 'Design Load (ULS)',
      lines: [
        <L>{`$q_G = ${deadLoad}\\text{ kN/m}^2,\\quad q_Q = ${liveLoad}\\text{ kN/m}^2,\\quad b_{trib} = ${tributaryWidth}\\text{ m}$`}</L>,
        <L>{`$\\gamma_G = ${gamma_G.toFixed(2)},\\quad \\gamma_Q = ${gamma_Q.toFixed(2)}$`}</L>,
        <L>{`$w_{ULS} = (\\gamma_G G + \\gamma_Q Q)\\, b_{trib}$`}</L>,
        <L>{`$\\phantom{w_{ULS}} = (${gamma_G.toFixed(2)} \\times ${deadLoad} + ${gamma_Q.toFixed(2)} \\times ${liveLoad}) \\times ${tributaryWidth}$`}</L>,
      ],
      highlight: <L>{`$w_{ULS} = ${w_uls.toFixed(3)}\\text{ kN/m}$`}</L>,
    },
    {
      step: 4,
      title: 'Internal Forces',
      lines: [
        <L>{`$M_{max} = \\dfrac{wL^2}{8} = \\dfrac{${w_uls.toFixed(3)} \\times ${span}^2}{8}$`}</L>,
        <L>{`$V_{max} = \\dfrac{wL}{2} = \\dfrac{${w_uls.toFixed(3)} \\times ${span}}{2}$`}</L>,
      ],
      highlight: <L>{`$M = ${result.maxBendingMoment.toFixed(3)}\\text{ kNm} \\quad V = ${result.maxShearForce.toFixed(3)}\\text{ kN}$`}</L>,
    },
    {
      step: 5,
      title: 'Bending Check',
      lines: [
        <L>{`$\\sigma_{m,d} = \\dfrac{M}{W_{el}} = \\dfrac{${result.maxBendingMoment.toFixed(3)} \\times 10^6}{${W_el.toFixed(0)}} = ${sigma_md.toFixed(2)}\\text{ MPa}$`}</L>,
        <L>{`$UR_{bending} = \\dfrac{\\sigma_{m,d}}{f_{m,d}} = \\dfrac{${sigma_md.toFixed(2)}}{${f_m_d.toFixed(2)}}$`}</L>,
      ],
      highlight: <L>{`$UR = ${(result.UR_bending * 100).toFixed(1)}\\%\\quad ${result.UR_bending <= 1.0 ? '\\checkmark\\text{ PASS}' : '\\times\\text{ FAIL}'}$`}</L>,
    },
    {
      step: 6,
      title: 'Shear Check',
      lines: [
        <L>{`$\\tau_d = \\dfrac{1.5\\, V}{A} = \\dfrac{1.5 \\times ${(result.maxShearForce * 1e3).toFixed(0)}}{${A.toFixed(0)}} = ${tau_d.toFixed(2)}\\text{ MPa}$`}</L>,
        <L>{`$UR_{shear} = \\dfrac{\\tau_d}{f_{v,d}} = \\dfrac{${tau_d.toFixed(2)}}{${f_v_d.toFixed(2)}}$`}</L>,
      ],
      highlight: <L>{`$UR = ${(result.UR_shear * 100).toFixed(1)}\\%\\quad ${result.UR_shear <= 1.0 ? '\\checkmark\\text{ PASS}' : '\\times\\text{ FAIL}'}$`}</L>,
    },
    {
      step: 7,
      title: 'Deflection Check (SLS)',
      lines: [
        <L>{`$w_{SLS} = ${w_sls.toFixed(3)}\\text{ kN/m}$`}</L>,
        <L>{`$\\delta = \\dfrac{5\\,wL^4}{384\\,EI} = \\dfrac{5 \\times ${w_sls.toFixed(3)} \\times ${(span * 1000).toFixed(0)}^4}{384 \\times ${wood.E_0_mean} \\times ${I.toFixed(0)}}$`}</L>,
        <L>{`$\\delta_{allow} = \\dfrac{L}{${deflectionLimitDivider}} = ${result.allowableDeflection.toFixed(1)}\\text{ mm}$`}</L>,
      ],
      highlight: <L>{`$\\delta = ${result.maxDeflection.toFixed(2)}\\text{ mm}\\quad UR = ${(result.UR_deflection * 100).toFixed(1)}\\%\\quad ${result.UR_deflection <= 1.0 ? '\\checkmark\\text{ PASS}' : '\\times\\text{ FAIL}'}$`}</L>,
    },
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          className="fixed right-0 top-0 h-full w-[480px] max-w-full bg-[#0A1120] border-l border-white/5 z-50 flex flex-col shadow-2xl"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div>
              <h2 className="text-sm font-semibold text-white">Show Work</h2>
              <p className="text-xs text-slate-500">Full derivation · EC5</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-6">
            {steps.map((s) => (
              <Step key={s.step} {...s} />
            ))}
          </div>

          <div className={`px-5 py-3 border-t border-white/5 text-center text-xs font-semibold rounded-none ${result.pass ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
            {result.pass ? '✓ Section PASSES all checks' : '✗ Section FAILS — see ratios above'}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
