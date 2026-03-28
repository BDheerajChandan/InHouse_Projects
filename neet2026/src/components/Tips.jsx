import "./Tips.css";

const tipData = [
  {
    icon: "🔄", subject: "Chemistry – Resonance", color: "#06b6d4",
    tips: [
      "More resonance structures = greater stability (electron delocalization)",
      "+M groups: –OH, –OR, –NH2, halogens → ortho/para directors",
      "–M groups: –NO2, –CHO, –CN, –COOH → meta directors",
      "Benzene resonance energy = 36 kcal/mol",
      "CO3²⁻ = 3 resonance structures; NO3⁻ = 3; benzene has several",
      "Phenoxide more stable than phenol (resonance of anion)",
      "Bond length in resonance hybrid = intermediate value",
      "Resonance > Inductive when both operate",
    ]
  },
  {
    icon: "⚗️", subject: "Chemistry – Inorganic s/p Block", color: "#ff6b2b",
    tips: [
      "Li–Mg diagonal: both form covalent compounds, react with N2",
      "Be–Al diagonal: both amphoteric, form alum-type compounds",
      "Anomalous N: no d-orbitals (no pentavalency), forms strong H-bonds",
      "Anomalous F: highest EN, no +ve OS, no d-orbitals, smallest halide",
      "KMnO4 colour = charge transfer (Mn7+ has d0, no d–d possible)",
      "XeF4 = square planar; XeF2 = linear; XeF6 = distorted octahedral",
      "Lanthanide contraction → Hf similar in size to Zr (consequences!)",
      "Contact process: 2SO2 + O2 → 2SO3 (V2O5 catalyst)",
    ]
  },
  {
    icon: "🔮", subject: "Chemistry – Coordination/CFT", color: "#a855f7",
    tips: [
      "Octahedral: t2g (–0.4Δo/e) and eg (+0.6Δo/e)",
      "Δt = 4/9 Δo (tetrahedral always smaller)",
      "Strong field → Low spin; Weak field → High spin",
      "μ = √n(n+2) BM (n = unpaired electrons)",
      "d6 low spin CFSE = –2.4Δo (maximum CFSE!)",
      "Spectrochemical: I⁻ < Br⁻ < Cl⁻ < F⁻ < H2O < NH3 < en < CN⁻ < CO",
      "EDTA = hexadentate; en = bidentate; Chelate stability ∝ denticity",
      "EAN rule: total electrons = nearest noble gas number",
    ]
  },
  {
    icon: "🧬", subject: "Biology – Cell & Genetics", color: "#22c55e",
    tips: [
      "Mitochondria = powerhouse (ATP); Ribosome = protein synthesis site",
      "Cell wall: Cellulose (plant), Chitin (fungi), Peptidoglycan (bacteria)",
      "DNA replication = semi-conservative (Meselson & Stahl, 1958)",
      "A=T (2 H-bonds), G≡C (3 H-bonds) — Chargaff's rule",
      "Lac operon = inducible; Trp operon = repressible",
      "Mendel's 3:1 (monohybrid) and 9:3:3:1 (dihybrid) ratios",
      "Central dogma: DNA→RNA→Protein (Crick, 1958)",
      "Hardy-Weinberg: p² + 2pq + q² = 1 (no evolution occurring)",
    ]
  },
  {
    icon: "🌿", subject: "Biology – Plant Physiology", color: "#84cc16",
    tips: [
      "PS I has P700; PS II has P680 — light reactions in thylakoid",
      "Calvin cycle (C3): CO2 + RuBP → 3-PGA (RuBisCO enzyme)",
      "C4 plants: CO2 fixed into OAA via PEP carboxylase (no photorespiration)",
      "Cohesion-tension theory: transpiration pull drives water up xylem",
      "ABA = stress hormone (closes stomata, promotes dormancy)",
      "Ethylene = fruit ripening and leaf/flower senescence",
      "Gibberellins: stem elongation, seed germination, breaking dormancy",
      "Phloem transport: sucrose from source to sink (Munch pressure flow)",
    ]
  },
  {
    icon: "❤️", subject: "Biology – Human Physiology", color: "#ec4899",
    tips: [
      "Cardiac output = Stroke volume × Heart rate (normal ≈ 5 L/min)",
      "SA node = natural pacemaker of heart (70–75 beats/min)",
      "Bohr effect: high CO2 → Hb releases O2 to active tissues",
      "ADH acts on collecting duct → increases water reabsorption",
      "β cells of Langerhans → insulin; α cells → glucagon",
      "Pepsin works at pH 1.5–2 (acidic stomach environment)",
      "Tidal volume ≈ 500 mL (normal breathing); VC ≈ 4.6 L",
      "Bilirubin excess → jaundice; formed from Hb breakdown in liver",
    ]
  },
  {
    icon: "⚡", subject: "Physics – Mechanics & Energy", color: "#3b82f6",
    tips: [
      "KE = ½mv², PE = mgh; conservation: KE + PE = constant",
      "Escape velocity from Earth = 11.2 km/s; orbital velocity = 7.9 km/s",
      "For SHM: at equilibrium, v = max, a = 0; at extreme, v = 0, a = max",
      "Kepler's 3rd: T² ∝ R³ (T = period, R = semi-major axis)",
      "Elastic collision: KE conserved; Inelastic: only momentum conserved",
      "Centripetal a = v²/r; Centripetal F = mv²/r (towards center)",
      "Terminal velocity = 2r²(ρ–σ)g/9η (Stokes' law)",
      "Bernoulli: P + ½ρv² + ρgh = constant (conservation of energy)",
    ]
  },
  {
    icon: "🌡️", subject: "Physics – Thermodynamics", color: "#f59e0b",
    tips: [
      "1st Law: ΔU = Q – W (W done BY system)",
      "Carnot efficiency η = 1 – TL/TH (maximum possible efficiency)",
      "Adiabatic: Q = 0; Isothermal: ΔU = 0; Isochoric: W = 0",
      "Stefan-Boltzmann: P = σAT⁴ (σ = 5.67×10⁻⁸ W/m²K⁴)",
      "Wien's law: λmax × T = 2.898×10⁻³ m·K",
      "Ideal gas: PV = nRT; Kinetic energy = (3/2)kT per molecule",
      "2nd Law: entropy of universe always increases (ΔStotal > 0)",
      "Cp – Cv = R (molar heat capacities for ideal gas)",
    ]
  },
  {
    icon: "💡", subject: "Physics – Optics & Modern Physics", color: "#8b5cf6",
    tips: [
      "n = c/v; Snell's law: n1 sinθ1 = n2 sinθ2",
      "YDSE fringe width β = λD/d (λ=wavelength, D=distance, d=separation)",
      "Photoelectric effect: KE_max = hν – φ (Einstein, Nobel 1921)",
      "de Broglie: λ = h/mv (wave-particle duality for matter)",
      "Bohr: rn = n² × 0.529 Å; En = –13.6/n² eV (hydrogen)",
      "Half-life: t½ = 0.693/λ; N = N0·e^(–λt)",
      "Mass-energy: E = mc² (c = 3×10⁸ m/s)",
      "Fe-56 has maximum binding energy per nucleon (~8.8 MeV)",
    ]
  },
  {
    icon: "🎯", subject: "NEET 2026 Exam Strategy", color: "#ef4444",
    tips: [
      "Biology = 360/720 marks (50%). Prioritize it every single day.",
      "Chemistry = 180 marks. Inorganic has highest NEET weightage.",
      "Physics = 180 marks. Focus on mechanics and modern physics.",
      "Time: 3.2 hours for 180 questions → 64 sec/question average",
      "Attempt order: Biology → Chemistry → Physics (biology is safest)",
      "+4/–1 rule: skip if <50% confident, attempt if >60% sure",
      "Previous 5 years: ~40% questions repeat conceptually. Do all PYQs!",
      "Month 2: Minimum 10 full-length mocks (720 marks each). Analyze all errors.",
    ]
  }
];

export default function Tips() {
  return (
    <div className="tips-page">
      <h2 className="section-title">💡 Quick Reference & NEET Tips</h2>
      <p className="section-sub">High-yield points curated from NEET 2019–2025 analysis. Revise daily!</p>

      <div className="tips-grid">
        {tipData.map(section => (
          <div key={section.subject} className="tip-section" style={{ "--c": section.color }}>
            <div className="tip-section-header">
              <span className="tip-section-icon">{section.icon}</span>
              <h3 className="tip-section-title">{section.subject}</h3>
            </div>
            <div className="tip-list">
              {section.tips.map((tip, i) => (
                <div key={i} className="tip-row">
                  <span className="tip-arrow" style={{ color: section.color }}>→</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* NEET Timeline */}
      <div className="timeline-card">
        <h3 className="timeline-title">📅 2-Month Revision Timeline</h3>
        <div className="timeline">
          {[
            { month: "Month 1", label: "Full Syllabus Coverage", color: "#ff6b2b", desc: "10 hrs/day. Weeks 1–4: Chemistry → Biology → Physics. 100 MCQs per subject." },
            { month: "Week 1–2", label: "Chemistry Focus", color: "#06b6d4", desc: "Resonance, Inorganic (s/p/d/f block), Coordination Chemistry, Physical Chemistry" },
            { month: "Week 3–4", label: "Biology Focus", color: "#22c55e", desc: "Cell biology, Genetics, Plant biology, Human physiology, Ecology, Biotechnology" },
            { month: "Week 5–6", label: "Physics Focus", color: "#3b82f6", desc: "Mechanics, Thermodynamics, Optics, Electrostatics, Modern Physics" },
            { month: "Month 2", label: "Revision & Mock Tests", color: "#a855f7", desc: "10 full-length mocks, chapter-wise revision, PYQs 2019–2025, error analysis" },
          ].map(t => (
            <div key={t.month} className="timeline-item" style={{ "--c": t.color }}>
              <div className="tl-badge" style={{ background: t.color }}>{t.month}</div>
              <div className="tl-content">
                <div className="tl-label">{t.label}</div>
                <div className="tl-desc">{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}