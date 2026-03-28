export const studyPlanData = {
  Chemistry: {
    icon: "⚗️", color: "#ff6b2b",
    weeks: [
      {
        week: 1, title: "Resonance & Bonding",
        days: [
          { day: 1, topic: "What is Resonance? Conditions & Rules", hours: 10, subtopics: ["Resonance structures concept", "Conditions for resonance", "Rules for drawing resonance structures", "Curved arrow notation", "Formal charges"] },
          { day: 2, topic: "Resonance Energy & Stability", hours: 10, subtopics: ["Resonance energy definition", "Stability order of structures", "Benzene resonance energy (36 kcal/mol)", "Hybridization review", "Resonance in inorganic ions"] },
          { day: 3, topic: "Resonance in Organic Molecules", hours: 10, subtopics: ["Carboxylate, carbonate ions", "Nitro group, nitrate ion", "Phenol, aniline resonance", "Conjugated dienes", "Furan, pyrrole aromaticity"] },
          { day: 4, topic: "Resonance Effect (+M and –M)", hours: 10, subtopics: ["+M effect groups (–OH, –NH2, halogens)", "–M effect groups (–NO2, –CHO, –CN)", "Effect on reactivity and acidity", "Electron donation vs withdrawal", "Direction of electrophilic substitution"] },
          { day: 5, topic: "Inductive Effect & Comparison", hours: 10, subtopics: ["Inductive effect basics", "–I and +I effect groups", "Resonance vs Inductive: which dominates?", "Acid/base strength using both", "ortho/para vs meta direction"] },
          { day: 6, topic: "Hyperconjugation & Carbocations", hours: 10, subtopics: ["Hyperconjugation definition", "Baker-Nathan effect", "Carbocation stability", "Carbanion stability", "Radical stability order"] },
          { day: 7, topic: "Revision + 25 MCQs Resonance", hours: 10, subtopics: ["Full week 1 revision", "25 MCQs on resonance", "Note weak areas", "Make formula/reaction chart", "Past NEET Qs on resonance"] },
        ]
      },
      {
        week: 2, title: "Inorganic – s & p Block",
        days: [
          { day: 8, topic: "s-Block: Group 1 & 2 Overview", hours: 10, subtopics: ["Electronic configurations", "Periodic trends down group", "Anomalous behaviour of Li", "Li–Mg diagonal relationship", "Compounds: NaOH, Na2CO3"] },
          { day: 9, topic: "s-Block: Group 2 – Alkaline Earths", hours: 10, subtopics: ["Be anomalous behaviour", "Be–Al diagonal relationship", "Mg, Ca compounds and uses", "Plaster of Paris, Gypsum", "Bleaching powder"] },
          { day: 10, topic: "p-Block: Group 13 & 14", hours: 10, subtopics: ["Boron – covalent character, Borax", "Boric acid, Diborane structure", "Allotropes of carbon", "CO, CO2, Silicates, Silicones", "Aluminium reactions"] },
          { day: 11, topic: "p-Block: Group 15 – Nitrogen Family", hours: 10, subtopics: ["N2 fixation, Haber process", "Oxides of nitrogen (NO, NO2, N2O5)", "Phosphorus allotropes", "Oxoacids of N and P", "HNO3 (Ostwald process)"] },
          { day: 12, topic: "p-Block: Group 16 – Oxygen Family", hours: 10, subtopics: ["Sulphur allotropes", "Oxoacids of Sulphur", "H2S, SO2, SO3", "H2SO4 (Contact process)", "Ozone structure and uses"] },
          { day: 13, topic: "p-Block: Group 17 & 18", hours: 10, subtopics: ["Halogens: trends, reactivity", "Interhalogen compounds", "HF anomaly (H-bonding)", "Noble gases: properties, uses", "XeF2, XeF4, XeF6 structures"] },
          { day: 14, topic: "Revision + 25 MCQs s/p Block", hours: 10, subtopics: ["All s-block reactions chart", "All p-block important compounds", "Diagonal relationships summary", "Anomalous behaviour table", "25 timed MCQs"] },
        ]
      },
      {
        week: 3, title: "d/f Block + Coordination Chemistry",
        days: [
          { day: 15, topic: "d-Block: Properties & Trends", hours: 10, subtopics: ["Electronic config 3d series", "Variable oxidation states", "Magnetic properties, colour", "Catalytic properties", "Cu, Zn special configs"] },
          { day: 16, topic: "d-Block: KMnO4, K2Cr2O7", hours: 10, subtopics: ["KMnO4 structure & reactions", "K2Cr2O7 reactions in acid", "Colour due to charge transfer", "Extraction of Fe, Cu, Zn", "Important reactions to memorize"] },
          { day: 17, topic: "f-Block: Lanthanides & Actinides", hours: 10, subtopics: ["Lanthanide contraction", "Consequences of lanthanide contraction", "Oxidation states lanthanides (+3)", "Actinides variable oxidation states", "Differences between the two series"] },
          { day: 18, topic: "Coordination: Basics, VBT, IUPAC", hours: 10, subtopics: ["Ligand types (mono, bi, polydentate)", "IUPAC nomenclature rules", "Werner's theory", "VBT hybridization (sp3, dsp2, d2sp3)", "Examples with problems"] },
          { day: 19, topic: "Crystal Field Theory (CFT)", hours: 10, subtopics: ["CFT basics and assumptions", "Octahedral splitting t2g/eg", "CFSE calculations", "High spin vs Low spin", "Color and d–d transition"] },
          { day: 20, topic: "Tetrahedral, Square Planar, Spectrochemical", hours: 10, subtopics: ["Δt = 4/9 Δo relationship", "Square planar splitting diagram", "CFSE for all d-configs", "Spectrochemical series (full)", "Magnetic moment formula μ = √n(n+2)"] },
          { day: 21, topic: "Isomerism + Revision + 25 MCQs", hours: 10, subtopics: ["Structural isomerism types", "Geometric (cis-trans) isomerism", "Optical isomerism in coordination", "EAN rule", "25 timed MCQs"] },
        ]
      },
      {
        week: 4, title: "Physical Chemistry",
        days: [
          { day: 22, topic: "Electrochemistry", hours: 10, subtopics: ["Electrochemical cells (galvanic vs electrolytic)", "EMF = Ecell = E°cell – RT/nF·lnQ (Nernst)", "Faraday's laws of electrolysis", "Kohlrausch's law, Λ∞", "Corrosion and protection"] },
          { day: 23, topic: "Chemical Kinetics", hours: 10, subtopics: ["Rate of reaction and rate law", "Order vs molecularity", "Integrated rate laws (0, 1st, 2nd order)", "Arrhenius equation, Ea", "Half-life problems"] },
          { day: 24, topic: "Solutions & Colligative Properties", hours: 10, subtopics: ["Raoult's law, vapour pressure lowering", "Elevation in BP, depression in FP", "Osmotic pressure (π = CRT)", "Van't Hoff factor i", "Abnormal molecular masses"] },
          { day: 25, topic: "Thermodynamics & Equilibrium", hours: 10, subtopics: ["ΔH, ΔU, ΔG, ΔS relationships", "Gibbs free energy and spontaneity", "Kc, Kp and Kp = Kc(RT)^Δn", "Le Chatelier's principle", "Buffer solutions"] },
          { day: 26, topic: "Surface Chemistry & Solid State", hours: 10, subtopics: ["Adsorption isotherms (Freundlich, Langmuir)", "Catalysis and enzyme catalysis", "Unit cells: BCC, FCC, simple cubic", "Defects in crystals", "Semiconductors"] },
          { day: 27, topic: "Full Chemistry Mock – 100 Questions", hours: 10, subtopics: ["Timed 100 Qs in 80 min", "Error analysis", "Revise all weak topics", "Make formula sheet chemistry", "NEET-pattern marking scheme"] },
          { day: 28, topic: "Chemistry – Final Revision & Strategy", hours: 10, subtopics: ["Summary notes all topics", "High-yield NEET points", "Last revision formulas/reactions", "Prepare for Month 2 revision", "Important charts and tables"] },
        ]
      },
    ]
  },
  Biology: {
    icon: "🧬", color: "#22c55e",
    weeks: [
      {
        week: 1, title: "Cell Biology & Genetics",
        days: [
          { day: 1, topic: "Cell Structure: Prokaryotic vs Eukaryotic", hours: 10, subtopics: ["Prokaryotic features (no membrane-bound organelles)", "Eukaryotic organelles overview", "Nucleus, nucleolus, nuclear envelope", "Endoplasmic reticulum (rough/smooth)", "Ribosomes (70S vs 80S)"] },
          { day: 2, topic: "Mitochondria, Chloroplast, Golgi, Lysosomes", hours: 10, subtopics: ["Mitochondria: double membrane, cristae, ATP", "Chloroplast: grana, stroma lamellae", "Golgi apparatus: cis, medial, trans", "Lysosomes: hydrolytic enzymes, autophagy", "Vacuoles and Peroxisomes"] },
          { day: 3, topic: "Cell Division: Mitosis & Meiosis", hours: 10, subtopics: ["Phases of mitosis (PMAT) in detail", "Cytokinesis in plants vs animals", "Meiosis I and II differences", "Crossing over and recombination", "Significance of meiosis"] },
          { day: 4, topic: "Biomolecules: Carbs, Proteins, Lipids", hours: 10, subtopics: ["Carbohydrates: mono/di/polysaccharides", "Proteins: primary to quaternary structure", "Enzymes: classification, kinetics, inhibition", "Lipids: types and functions", "Nucleotides and nucleic acids structure"] },
          { day: 5, topic: "Mendelian Genetics", hours: 10, subtopics: ["Law of segregation", "Law of independent assortment", "Monohybrid, dihybrid cross ratios", "Incomplete dominance, codominance", "Multiple alleles (ABO blood groups)"] },
          { day: 6, topic: "Molecular Biology: DNA & RNA", hours: 10, subtopics: ["DNA structure (Watson-Crick model)", "Chargaff's rules", "DNA replication (semi-conservative)", "Types of RNA (mRNA, tRNA, rRNA)", "Transcription process"] },
          { day: 7, topic: "Revision + 25 MCQs Cell/Genetics", hours: 10, subtopics: ["Cell biology revision", "Genetics revision", "25 MCQs timed", "Chromosomal disorders summary", "Hardy-Weinberg equilibrium"] },
        ]
      },
      {
        week: 2, title: "Plant Biology",
        days: [
          { day: 8, topic: "Plant Kingdom Classification", hours: 10, subtopics: ["Algae: Chlorophyta, Phaeophyta, Rhodophyta", "Bryophytes: liverworts, mosses", "Pteridophytes: ferns", "Gymnosperms: conifers, cycads", "Angiosperms: monocots vs dicots"] },
          { day: 9, topic: "Morphology of Plants", hours: 10, subtopics: ["Root: types, modifications", "Stem: aerial, underground modifications", "Leaf: simple vs compound, venation", "Inflorescences: types", "Fruit and seed morphology"] },
          { day: 10, topic: "Anatomy of Plants", hours: 10, subtopics: ["Meristematic and permanent tissues", "Xylem and phloem structure", "Dicot vs monocot stem, root, leaf anatomy", "Secondary growth: vascular cambium", "Cork cambium (phellogen)"] },
          { day: 11, topic: "Transport in Plants", hours: 10, subtopics: ["Water potential and osmosis", "Absorption by roots", "Ascent of sap (cohesion-tension)", "Transpiration types and stomatal mechanism", "Translocation in phloem (Munch hypothesis)"] },
          { day: 12, topic: "Mineral Nutrition & Photosynthesis", hours: 10, subtopics: ["Essential macro/micronutrients", "Nitrogen fixation", "Light reactions (PS I, PS II, Z-scheme)", "Dark reactions: Calvin cycle (C3)", "C4 plants and CAM plants"] },
          { day: 13, topic: "Respiration & Plant Growth Hormones", hours: 10, subtopics: ["Glycolysis (EMP pathway)", "Krebs cycle, Electron transport chain", "Fermentation (anaerobic)", "Auxins, Gibberellins, Cytokinins", "ABA, Ethylene – stress and ripening"] },
          { day: 14, topic: "Revision + 25 MCQs Plant Biology", hours: 10, subtopics: ["Plant kingdom summary", "Photosynthesis full revision", "Respiration ATP count", "Plant hormone actions chart", "25 timed MCQs"] },
        ]
      },
      {
        week: 3, title: "Human Physiology",
        days: [
          { day: 15, topic: "Digestion & Absorption", hours: 10, subtopics: ["GI tract anatomy", "Digestion of carbs, proteins, fats", "Enzymes at each stage (saliva, stomach, pancreas)", "Absorption in small intestine", "Disorders: constipation, PEM, jaundice"] },
          { day: 16, topic: "Breathing & Respiration", hours: 10, subtopics: ["Respiratory system anatomy", "Mechanism of breathing (inspiration/expiration)", "Lung volumes (tidal, vital capacity etc.)", "O2 and CO2 transport (Hb, Bohr effect)", "Respiratory disorders"] },
          { day: 17, topic: "Circulation (Heart & Blood)", hours: 10, subtopics: ["Heart anatomy (chambers, valves)", "Cardiac cycle, ECG", "Cardiac output = SV × HR", "Blood pressure regulation", "Blood: RBC, WBC, platelets, plasma"] },
          { day: 18, topic: "Excretion", hours: 10, subtopics: ["Nephron structure in detail", "Filtration, reabsorption, secretion", "Counter-current mechanism", "Role of ADH, aldosterone", "Disorders: renal failure, dialysis"] },
          { day: 19, topic: "Locomotion & Nervous System", hours: 10, subtopics: ["Types of joints and movements", "Sliding filament theory of muscle contraction", "Neuron structure and nerve impulse", "Synapse: types and transmission", "Reflex arc and CNS overview"] },
          { day: 20, topic: "Chemical Coordination (Endocrine)", hours: 10, subtopics: ["Pituitary: anterior/posterior hormones", "Thyroid, Parathyroid hormones", "Adrenal: cortex (cortisol, aldosterone), medulla (adrenaline)", "Pancreas: insulin, glucagon", "Gonads and reproductive hormones"] },
          { day: 21, topic: "Revision + 25 MCQs Human Physiology", hours: 10, subtopics: ["All organ system revision", "Important values (BP, HR, lung volumes)", "Hormone chart", "Enzyme chart", "25 timed MCQs"] },
        ]
      },
      {
        week: 4, title: "Ecology, Biotechnology & Evolution",
        days: [
          { day: 22, topic: "Reproduction in Plants & Animals", hours: 10, subtopics: ["Asexual reproduction types", "Flower structure and pollination", "Fertilization and embryo development in angiosperms", "Human male reproductive system", "Human female reproductive system + menstrual cycle"] },
          { day: 23, topic: "Human Reproduction & Reproductive Health", hours: 10, subtopics: ["Fertilization and implantation", "Fetal development stages", "Parturition and lactation", "Contraception methods", "STDs and infertility treatment (IVF, GIFT)"] },
          { day: 24, topic: "Genetics: Linkage, Mutation, Sex-linked", hours: 10, subtopics: ["Chromosomal theory of inheritance", "Sex determination mechanisms", "Sex-linked disorders (haemophilia, colour blindness)", "Chromosomal disorders (Down's, Turner, Klinefelter)", "Mutation types"] },
          { day: 25, topic: "Evolution", hours: 10, subtopics: ["Origin of life (Miller-Urey, Oparin-Haldane)", "Hardy-Weinberg equilibrium", "Natural selection types", "Adaptive radiation", "Human evolution (Homo sapiens)"] },
          { day: 26, topic: "Ecology: Ecosystem & Biodiversity", hours: 10, subtopics: ["Ecosystem components and energy flow", "Food chains, food webs, ecological pyramids", "Biogeochemical cycles (N, C, P, S)", "Biodiversity types and hotspots", "Threats and conservation (in-situ, ex-situ)"] },
          { day: 27, topic: "Biotechnology", hours: 10, subtopics: ["Recombinant DNA technology basics", "PCR, gel electrophoresis, Southern/Northern blotting", "Gene cloning (vectors, restriction enzymes)", "Transgenic plants and animals (Bt cotton)", "ELISA, monoclonal antibodies, gene therapy"] },
          { day: 28, topic: "Biology Final Revision + 100 MCQ Mock", hours: 10, subtopics: ["Summary all biology topics", "100 question timed mock", "Error analysis", "High-yield NEET biology points", "Diagrams revision (cell, nephron, heart)"] },
        ]
      },
    ]
  },
  Physics: {
    icon: "⚡", color: "#3b82f6",
    weeks: [
      {
        week: 1, title: "Mechanics & Kinematics",
        days: [
          { day: 1, topic: "Units, Dimensions & Vectors", hours: 10, subtopics: ["SI units, dimensional analysis", "Error analysis in experiments", "Scalars and vectors", "Vector addition/subtraction (graphical & analytical)", "Dot product and cross product"] },
          { day: 2, topic: "Kinematics: 1D & 2D", hours: 10, subtopics: ["Equations of motion (suvat)", "Graphs: distance-time, velocity-time", "Relative velocity", "Projectile motion", "Circular motion basics"] },
          { day: 3, topic: "Laws of Motion & Friction", hours: 10, subtopics: ["Newton's three laws in detail", "Free body diagrams", "Static and kinetic friction", "Connected bodies problems", "Pseudo force (non-inertial frames)"] },
          { day: 4, topic: "Work, Energy & Power", hours: 10, subtopics: ["Work-energy theorem", "Conservative vs non-conservative forces", "Potential and kinetic energy", "Power = Work/time = F·v", "Elastic and inelastic collisions"] },
          { day: 5, topic: "Rotational Motion", hours: 10, subtopics: ["Torque and angular momentum", "Moment of inertia (theorems)", "Rolling motion (KE = ½mv² + ½Iω²)", "Conservation of angular momentum", "Rigid body equilibrium"] },
          { day: 6, topic: "Gravitation", hours: 10, subtopics: ["Kepler's laws of planetary motion", "Newton's law of gravitation", "Gravitational potential and field", "Orbital velocity and escape velocity", "Geostationary satellites"] },
          { day: 7, topic: "Revision + 20 MCQs Mechanics", hours: 10, subtopics: ["Kinematics revision", "Laws of motion problems", "Energy conservation problems", "Rotation problems", "Gravitation revision"] },
        ]
      },
      {
        week: 2, title: "Properties of Matter & Thermodynamics",
        days: [
          { day: 8, topic: "Properties of Solids & Liquids", hours: 10, subtopics: ["Elastic moduli (Young's, Bulk, Shear)", "Stress-strain curve", "Surface tension and capillarity", "Viscosity and Stokes' law", "Bernoulli's theorem applications"] },
          { day: 9, topic: "Thermal Properties of Matter", hours: 10, subtopics: ["Temperature scales (C, F, K)", "Thermal expansion (linear, area, volume)", "Specific heat, latent heat", "Heat transfer: conduction, convection, radiation", "Newton's law of cooling"] },
          { day: 10, topic: "Thermodynamics: Laws & Processes", hours: 10, subtopics: ["Zeroth and First Law", "Isothermal, adiabatic, isobaric, isochoric", "Second Law and entropy", "Carnot engine and efficiency", "Refrigerators and heat pumps"] },
          { day: 11, topic: "Kinetic Theory of Gases", hours: 10, subtopics: ["Ideal gas assumptions", "PV = nRT derivation", "RMS, average, most probable speeds", "Degrees of freedom, equipartition", "Mean free path"] },
          { day: 12, topic: "Oscillations & Waves", hours: 10, subtopics: ["SHM: conditions, equations, energy", "Simple pendulum, spring-mass system", "Damped and forced oscillations", "Wave motion (transverse vs longitudinal)", "Speed of wave, superposition principle"] },
          { day: 13, topic: "Sound & Doppler Effect", hours: 10, subtopics: ["Speed of sound, factors affecting", "Intensity and decibels", "Beats and resonance", "Stationary waves (strings, pipes)", "Doppler effect formula applications"] },
          { day: 14, topic: "Revision + 20 MCQs Thermo/Waves", hours: 10, subtopics: ["Thermodynamics problems", "Gas laws numericals", "SHM energy problems", "Wave problems", "Sound Doppler numericals"] },
        ]
      },
      {
        week: 3, title: "Optics & Electrostatics",
        days: [
          { day: 15, topic: "Ray Optics", hours: 10, subtopics: ["Reflection at curved mirrors (mirror formula)", "Refraction, Snell's law", "Total internal reflection, critical angle", "Lenses: thin lens formula, power", "Optical instruments (microscope, telescope)"] },
          { day: 16, topic: "Wave Optics", hours: 10, subtopics: ["Huygens' principle", "Young's double slit experiment", "Fringe width, path difference", "Diffraction: single slit pattern", "Polarization: Malus's law, Brewster's angle"] },
          { day: 17, topic: "Electrostatics I: Fields & Forces", hours: 10, subtopics: ["Coulomb's law", "Electric field (point charge, dipole, continuous)", "Gauss's law applications", "Electric potential and potential energy", "Equipotential surfaces"] },
          { day: 18, topic: "Electrostatics II: Capacitors", hours: 10, subtopics: ["Capacitance of various geometries", "Capacitors in series and parallel", "Energy stored in capacitor", "Dielectric: effect on capacitance", "Van de Graaff generator"] },
          { day: 19, topic: "Current Electricity", hours: 10, subtopics: ["Ohm's law, resistivity", "Kirchhoff's laws (KCL, KVL)", "Wheat stone bridge, potentiometer", "Terminal voltage, internal resistance", "Power and heating effect (Joule)"] },
          { day: 20, topic: "Magnetism & Electromagnetic Induction", hours: 10, subtopics: ["Magnetic force on charge/current", "Biot-Savart law, Ampere's law", "Faraday's law, Lenz's law", "Self and mutual induction", "AC circuits: LCR, resonance"] },
          { day: 21, topic: "Revision + 20 MCQs Optics/EM", hours: 10, subtopics: ["Optics formula problems", "YDSE problems", "Electrostatics problems", "Circuit numericals", "EMI and AC problems"] },
        ]
      },
      {
        week: 4, title: "Modern Physics & Full Revision",
        days: [
          { day: 22, topic: "Dual Nature of Radiation & Matter", hours: 10, subtopics: ["Photoelectric effect (Einstein's equation)", "de Broglie wavelength", "Davisson-Germer experiment", "Heisenberg uncertainty principle", "Particle in a box (concept)"] },
          { day: 23, topic: "Atoms & Nuclei", hours: 10, subtopics: ["Bohr's model of hydrogen atom", "Energy levels and spectral series", "Nucleus: protons, neutrons, binding energy", "Radioactive decay laws", "Nuclear fission and fusion"] },
          { day: 24, topic: "Semiconductor Devices", hours: 10, subtopics: ["p-n junction, diode characteristics", "Rectifiers (half, full wave)", "Transistor as switch and amplifier", "Logic gates (AND, OR, NOT, NAND, NOR)", "Communication systems basics"] },
          { day: 25, topic: "Advanced Problems – All Chapters", hours: 10, subtopics: ["Multi-concept problems", "Previous year NEET 2020–2025 physics", "Dimensional analysis tricks", "Graph-based questions", "Data interpretation questions"] },
          { day: 26, topic: "Full Physics Mock – 100 Questions", hours: 10, subtopics: ["Timed 100 Qs in 80 min", "Error analysis", "Revise weak chapters", "Make formula derivation sheet", "NEET-pattern marking"] },
          { day: 27, topic: "Formula Consolidation & Numericals", hours: 10, subtopics: ["All mechanics formulas", "All EM formulas", "All optics formulas", "All modern physics formulas", "Mixed numericals"] },
          { day: 28, topic: "Physics Final Revision & Strategy", hours: 10, subtopics: ["High-yield NEET physics chapters", "Last revision of key derivations", "Important SI units and values", "Constants to memorize", "Exam-day strategy for physics"] },
        ]
      },
    ]
  }
};