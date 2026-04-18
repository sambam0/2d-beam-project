// Wood material properties based on standard European C-classes.
// Note: simplified for standard C24/C30 properties (in MPa = N/mm2)
export const WOOD_CLASSES: Record<string, { f_m_k: number; f_v_k: number; E_0_mean: number }> = {
  'C14': { f_m_k: 14, f_v_k: 3.0, E_0_mean: 7000 },
  'C18': { f_m_k: 18, f_v_k: 3.4, E_0_mean: 9000 },
  'C24': { f_m_k: 24, f_v_k: 4.0, E_0_mean: 11000 },
  'C30': { f_m_k: 30, f_v_k: 4.0, E_0_mean: 12000 },
  'GL28c': { f_m_k: 28, f_v_k: 3.5, E_0_mean: 12500 }
};

export const STANDARD_LUMBER_SIZES = [
  { b: 45, h: 95 }, { b: 45, h: 120 }, { b: 45, h: 145 }, { b: 45, h: 170 }, { b: 45, h: 195 }, { b: 45, h: 220 },
  { b: 70, h: 95 }, { b: 70, h: 120 }, { b: 70, h: 145 }, { b: 70, h: 170 }, { b: 70, h: 195 }, { b: 70, h: 220 },
  { b: 95, h: 95 }, { b: 95, h: 145 }, { b: 95, h: 195 }, { b: 95, h: 220 }
];

export interface LoadingContext {
  span: number; // m
  liveLoad: number; // kN/m2
  tributaryWidth: number; // m
  deadLoad: number; // kN/m2
  safetyFactor: number;
}

export interface PlankConfig {
  b: number; // mm
  h: number; // mm
  woodClass: string; 
}

export interface BeamResult {
  maxBendingMoment: number; // kNm
  maxShearForce: number; // kN
  maxDeflection: number; // mm
  allowableDeflection: number; // mm (L/300)
  UR_bending: number; // Utilisation ratio
  UR_shear: number; // Utilisation ratio
  UR_deflection: number; // Utilisation ratio
  pass: boolean;
  shapePoints: { x: number; y: number }[]; // Normalised or raw deflection points
  momentPoints: { x: number; y: number }[]; // Bending moment along span
  shearPoints: { x: number; y: number }[]; // Shear force along span
}

export function calculateBeam(context: LoadingContext, plank: PlankConfig, deflectionDivider: number = 300): BeamResult {
  const L = context.span; // meters
  const L_mm = L * 1000;
  const trib = context.tributaryWidth; // meters
  const q_live = context.liveLoad; // kN/m2
  const q_dead = context.deadLoad || 0.5; // kN/m2
  
  // Factored load (Simplified ULS load combination: 1.2G + 1.5Q)
  const gamma_G = 1.2 * context.safetyFactor;
  const gamma_Q = 1.5 * context.safetyFactor;
  
  const w_uls = (gamma_G * q_dead + gamma_Q * q_live) * trib; // kN/m
  const w_sls = (q_dead + q_live) * trib; // kN/m (Unfactored)

  // Max Internal Forces
  const M_max = (w_uls * L * L) / 8; // kNm
  const V_max = (w_uls * L) / 2; // kN

  // Section Properties
  const b = plank.b; // mm
  const h = plank.h; // mm
  const I = (b * Math.pow(h, 3)) / 12; // mm^4
  const W = (b * Math.pow(h, 2)) / 6; // mm^3
  const A = b * h; // mm^2

  // Material Properties
  const wood = WOOD_CLASSES[plank.woodClass] || WOOD_CLASSES['C24'];
  const E = wood.E_0_mean; // N/mm2 = MPa

  // Deflection (SLS) - 5wL^4 / 384EI
  // w in N/mm = kN/m
  const delta_max = (5 * w_sls * Math.pow(L_mm, 4)) / (384 * E * I); // mm

  // Allowable Stresses (simplified method)
  const k_mod = 0.8; // default mod factor
  const gamma_m = 1.3; // partial safety factor for material
  const f_m_d = (wood.f_m_k * k_mod) / gamma_m; // MPa = N/mm2
  const f_v_d = (wood.f_v_k * k_mod) / gamma_m; // MPa = N/mm2

  // Actual Stresses
  // Bending stress = M / W
  const M_Nmm = M_max * 1e6;
  const sigma_m_d = M_Nmm / W; // N/mm2
  
  // Shear stress = 1.5 * V / A
  const V_N = V_max * 1e3;
  const tau_d = (1.5 * V_N) / A; // N/mm2

  // Utilisation Ratios
  const UR_bending = sigma_m_d / f_m_d;
  const UR_shear = tau_d / f_v_d;
  const allowableDeflection = L_mm / deflectionDivider;
  const UR_deflection = delta_max / allowableDeflection;

  // Diagram Generation
  const segments = 50;
  const shapePoints = [];
  const momentPoints = [];
  const shearPoints = [];

  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * L; // x in meters
    const x_mm = x * 1000;
    
    // Deflection curve for UDL: y = (wx / 24EI) * (L^3 - 2Lx^2 + x^3)
    const delta_x = (w_sls * x_mm / (24 * E * I)) * (Math.pow(L_mm, 3) - 2 * L_mm * Math.pow(x_mm, 2) + Math.pow(x_mm, 3));
    shapePoints.push({ x, y: delta_x });

    // Moment curve: M(x) = wx/2 * (L - x)
    const M_x = (w_uls * x / 2) * (L - x);
    momentPoints.push({ x, y: M_x });

    // Shear curve: V(x) = w * (L/2 - x)
    const V_x = w_uls * (L / 2 - x);
    shearPoints.push({ x, y: V_x });
  }

  const pass = UR_bending <= 1.0 && UR_shear <= 1.0 && UR_deflection <= 1.0;

  return {
    maxBendingMoment: M_max,
    maxShearForce: V_max,
    maxDeflection: delta_max,
    allowableDeflection,
    UR_bending,
    UR_shear,
    UR_deflection,
    pass,
    shapePoints,
    momentPoints,
    shearPoints
  };
}
