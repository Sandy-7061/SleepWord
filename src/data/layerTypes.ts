export interface LayerTypeDetail {
  title: [string, string]; // [English, Hindi]
  tagline: [string, string];
  materialTech: {
    composition: string;
    density: string;
    cellStructure: string;
    breathability: string;
    durability: string;
  };
  benefits: {
    title: string;
    desc: string;
    idealFor: string;
    pressureScore: number; // 0-100
  };
  employeePitch: {
    hook: string;
    explanation: string;
    demonstrationAction: string;
    objectionHandling: string;
  };
  color: string;
  defaultThicknessCm: number;
}

export const LAYER_TYPES: Record<string, LayerTypeDetail> = {
  fab: {
    title: ["Quilted Fabric Cover", "क्विल्टेड फैब्रिक कवर"],
    tagline: ["The luxurious touch surface with hypoallergenic breathability and plush micro-cushioning.", "सर्वोच्च संपर्क सतह: मुलायम, हवादार और एंटी-एलर्जिक क्विल्टिंग जो तुरंत मखमली आराम देती है।"],
    materialTech: {
      composition: "High GSM knitted organic European jacquard fabric with infused soft batting & anti-microbial Silver-Ion coating",
      density: "380 GSM (Grams per Square Meter)",
      cellStructure: "Micro-vented 3D weave matrix",
      breathability: "98% Air Permeable - Prevents humidity & body heat retention",
      durability: "Tested for 50,000 abrasion rubs without pilling"
    },
    benefits: {
      title: "First Touch Comfort & Skin Health",
      desc: "Instantly relaxes facial and body skin upon contact, wicks away nighttime sweat, and keeps dust mites and allergens completely outside the mattress core.",
      idealFor: "All sleepers, especially allergy sufferers, sensitive skin, and hot sleepers.",
      pressureScore: 85
    },
    employeePitch: {
      hook: "Show the customer the quilt pattern and let them touch the fabric with their fingertips.",
      explanation: "Sir/Ma'am, feel this European knitted fabric. Unlike ordinary polyester covers that trap heat and sweat, our high-GSM fabric breathes with 3D ventilation. It stays 2 degrees cooler throughout the night.",
      demonstrationAction: "Gently press palm against cover to show initial bounce and micro-tufting.",
      objectionHandling: "If customer asks: 'Will this fabric pill or tear?' Explain: 'It is certified 380 GSM heavy knitted with double-spun fibers, tested for over 10 years of friction resistance.'"
    },
    color: "#e8eaed",
    defaultThicknessCm: 3
  },
  soft: {
    title: ["Super Soft Comfort Foam", "सुपर सॉफ्ट फोम"],
    tagline: ["Responsive micro-cushioning that instantly melts away shoulder and hip pressure points.", "हल्की और संवेदनशील कुशनिंग जो शरीर के संपर्क में आते ही भारी दबाव को खत्म करती है।"],
    materialTech: {
      composition: "Low ILD open-cell polyether cushioning foam engineered for immediate contouring",
      density: "32 kg/m³ pure virgin polymer",
      cellStructure: "Ultra-open pneumatic cell matrix",
      breathability: "High airflow velocity through cell walls",
      durability: "Retains 94% height under 100,000 cyclic compression cycles"
    },
    benefits: {
      title: "Zero Surface Resistance",
      desc: "Eliminates the 'hard board' sensation. Lets protruding shoulder blades and hip bones sink gently into the bed without hitting a stiff barrier.",
      idealFor: "Side sleepers, women with pronounced hip-to-waist curves, and light-sleepers.",
      pressureScore: 92
    },
    employeePitch: {
      hook: "Contrast the harsh feeling of standard firm beds with our soft transition layer.",
      explanation: "Notice how your shoulders protrude 4 to 6 centimeters when sleeping on your side. Without this Super Soft layer, your shoulder joint bears up to 88 mmHg pressure, cutting off blood flow. This foam cradles that curve.",
      demonstrationAction: "Select Sleep Test mode on tablet and point to the Shoulder pressure point dropping to green (30 mmHg).",
      objectionHandling: "If customer says: 'I don't want a soft sagging bed' Explain: 'This soft foam is only in the top 3 cm comfort envelope; directly beneath it is our high-density orthopedic core so your spine stays 100% straight.'"
    },
    color: "#6c5ce7",
    defaultThicknessCm: 3
  },
  hr: {
    title: ["High Resilience (HR) Foam", "हाई रेज़िलिएंस (HR) फोम"],
    tagline: ["Dynamic active-rebound orthopedic transition layer that lifts and balances the spine.", "सक्रिय रीबाउंड ऑर्थोपेडिक परत जो शरीर को धँसने नहीं देती और तुरंत सहारा देती है।"],
    materialTech: {
      composition: "High Resilience MDI-based polyurethane with exceptional elasticity modulus",
      density: "40 to 45 kg/m³ High Density Virgin Foam",
      cellStructure: "Multi-diameter random micro-cells for variable-load resistance",
      breathability: "Naturally ventilated cell interconnects",
      durability: "Zero sagging guarantee with 10+ years sag-resistant certification"
    },
    benefits: {
      title: "Active Spine Push-Back",
      desc: "Unlike dead memory foam that leaves you stuck in a crater, HR foam actively pushes back proportional to your body weight, making tossing and turning effortless.",
      idealFor: "Back sleepers, active individuals, and anyone prone to lower back stiffness.",
      pressureScore: 90
    },
    employeePitch: {
      hook: "Demonstrate responsiveness by pressing a fist deep into the layer.",
      explanation: "This is HR foam—High Resilience. As soon as you shift your sleeping position, it springs back in 0.2 seconds. It fills the lumbar hollow in your lower back so your back muscles can fully shut off and rest.",
      demonstrationAction: "Toggle between 'This Mattress' and 'Typical Mattress' to show lumbar gap on typical beds.",
      objectionHandling: "If customer asks: 'How is this different from local foam?' Explain: 'Local foam is 18-24 density filled with chalk powders that disintegrate in 1-2 years. Ours is 40+ density pure polymer.'"
    },
    color: "#e17055",
    defaultThicknessCm: 5
  },
  reb: {
    title: ["High-Density Rebonded Foam", "रीबॉन्डेड ऑर्थोपेडिक फोम"],
    tagline: ["Ultra-dense compressed orthopedic core that delivers permanent structural alignment.", "अत्यधिक संपीड़ित ऑर्थो कोर जो रीढ़ को सीधा रखता है और गद्दे को दशकों तक झुकने नहीं देता।"],
    materialTech: {
      composition: "High-pressure thermal vulcanized shredded polyether foam bonded with eco-safe polyurethane cross-linkers",
      density: "85 to 90 kg/m³ Super High Density",
      cellStructure: "Multi-density interlocked composite matrix",
      breathability: "Controlled macro-porous stability",
      durability: "Indestructible foundation resisting heavy weights up to 180kg per person"
    },
    benefits: {
      title: "Heavy Orthopedic Spine Locking",
      desc: "Acts as the rigid structural foundation of the mattress. Keeps heavier body parts (pelvis and lower abdomen) from dipping down into an unnatural hammock curve.",
      idealFor: "Doctor-recommended orthopedic support, back pain patients, and heavier sleepers.",
      pressureScore: 88
    },
    employeePitch: {
      hook: "Show the multi-colored cut-away view in Cross-Section mode.",
      explanation: "Here is the engine of the mattress: 90-density rebonded foam. This is why doctors prescribe our orthopedic beds. It provides an unyielding planar baseline so your vertebrae remain in a neutral line all night.",
      demonstrationAction: "Switch to Cross-Section cutaway view and move the slice slider to reveal the interlocked core.",
      objectionHandling: "If customer says: 'Is rebonded foam too hard?' Explain: 'On its own, yes. But here we crown it with HR foam and high GSM quilting, giving you orthopedic alignment with hotel-grade comfort.'"
    },
    color: "#00b894",
    defaultThicknessCm: 6
  },
  lat: {
    title: ["100% Natural Latex", "प्राकृतिक पिनहोल लेटेक्स"],
    tagline: ["Sustainably harvested Hevea milk with pinhole continuous airflow and natural elasticity.", "रबर के पेड़ों से प्राप्त शुद्ध प्राकृतिक लेटेक्स: सांस लेने वाले पिनहोल्स और प्राकृतिक उछाल।"],
    materialTech: {
      composition: "100% Natural Dunlop/Talalay processed latex tree sap with zero synthetic filler chemicals",
      density: "75 to 80 kg/m³ Natural Elastomer",
      cellStructure: "Engineered vertical pinhole aeration grid (thousands of air channels)",
      breathability: "Supreme 360-degree continuous air circulation",
      durability: "Naturally bio-resistant to bacteria, fungi, and dust mites; 15+ years lifespan"
    },
    benefits: {
      title: "Organic Floating Sensation & Hypoallergenic Sleep",
      desc: "Offers buoyant resistance—like floating on water. You never sink uncomfortably deep. Dust mites and bed bugs cannot biologically live in natural latex.",
      idealFor: "Asthma sufferers, luxury seekers, eco-conscious families, and hot sleepers.",
      pressureScore: 96
    },
    employeePitch: {
      hook: "Focus on nature, purity, and cool buoyancy.",
      explanation: "This is harvested directly from organic rubber trees. Look at these precision pinholes—every time you shift at night, cool air is pumped through the mattress like an internal fan. Zero heat, zero chemicals.",
      demonstrationAction: "Zoom in on the Natural Latex layer to show the pinhole pattern.",
      objectionHandling: "If customer says: 'Latex mattresses are expensive.' Explain: 'A natural latex mattress lasts over 15 years without losing 1 millimeter of loft. Per day of healthy sleep, it costs less than a cup of tea.'"
    },
    color: "#f5e6ca",
    defaultThicknessCm: 4
  },
  mem: {
    title: ["Impression Memory Foam", "मेमोरी (इंप्रेशन) फोम"],
    tagline: ["Visco-elastic thermo-responsive material that distributes weight across every square millimeter.", "शरीर के तापमान से ढलने वाली विस्को-इलास्टिक फोम जो हर सूक्ष्म वक्र को संभालती है।"],
    materialTech: {
      composition: "Open-cell Visco-Elastic thermosensitive polyurethane",
      density: "55 kg/m³ Premium High Density",
      cellStructure: "Slow-recovery spherical open cells",
      breathability: "Engineered cell-vented matrix",
      durability: "Maintains contour recovery profile across extreme temperatures"
    },
    benefits: {
      title: "Zero-Gravity Pressure Eradication",
      desc: "Absorbs body kinetic energy. Replaces concentrated pressure peaks at hip joints and shoulder blades with an even bath of support.",
      idealFor: "Chronic joint pain, arthritis, sciatica, and side sleepers.",
      pressureScore: 95
    },
    employeePitch: {
      hook: "Mention NASA development history for aerospace cushioning.",
      explanation: "Originally developed to cushion astronauts during rocket launch G-forces, this memory foam melts slightly under your natural body warmth. It hugs every curve of your waist, leaving zero gap underneath.",
      demonstrationAction: "Show Sleep Test Back-Sleeper mode and highlight how the Lower Back gap is 100% supported.",
      objectionHandling: "If customer says: 'Doesn't memory foam get hot?' Explain: 'We formulate our memory layer with open breathable cells combined with airflow European fabrics to eliminate heat trapping.'"
    },
    color: "#74b9ff",
    defaultThicknessCm: 4
  },
  gel: {
    title: ["Hydro-Cool Gel Memory Foam", "कूल जेल मेमोरी फोम"],
    tagline: ["Thermal phase-change gel beads infused into memory matrix to draw heat away from the body.", "तापमान नियंत्रित करने वाले जेल बीड्स जो रात भर शरीर की गर्मी सोखकर ठंडक बनाए रखते हैं।"],
    materialTech: {
      composition: "Visco-elastic memory foam infused with liquid gel polymer micro-capsules",
      density: "60 kg/m³ Heavy Gel Composite",
      cellStructure: "Phase-Change thermal transfer cell array",
      breathability: "Actively conducts body thermal energy downward away from surface",
      durability: "Gel beads are molecularly cross-linked and will never leak or migrate"
    },
    benefits: {
      title: "Active Temperature Regulation",
      desc: "Regulates skin micro-climate to the ideal 18°C–21°C sleep environment, reducing night awakenings caused by overheating and sweating.",
      idealFor: "People who wake up hot, tropical climates, and men with higher basal metabolic rates.",
      pressureScore: 94
    },
    employeePitch: {
      hook: "Toggle the 'Heat on Bed' button in Sleep Test view.",
      explanation: "Look at the heat map on screen: red means sweat and toss-and-turn hot spots. Our Cool Gel layer acts as an electronic-free thermal sink, keeping the sleeping surface constantly refreshed.",
      demonstrationAction: "Click Heat on Bed toggle in the 3D Sleep Test view to demonstrate the thermal distribution.",
      objectionHandling: "If customer says: 'Is it cold to touch?' Explain: 'It does not feel like an ice pack—it intelligently maintains neutral thermal equilibrium so you sleep deep all 8 hours.'"
    },
    color: "#0984e3",
    defaultThicknessCm: 4
  },
  zone: {
    title: ["5-Zone Ergonomic Posture Layer", "5-ज़ोन ऑर्थोपेडिक परत"],
    tagline: ["Anatomically mapped variable firmness zones calibrated for head, shoulders, lumbar, hips, and knees.", "शरीर के 5 मुख्य हिस्सों के लिए अलग-अलग कठोरता ताकि रीढ़ हमेशा सीधी और तनाव-मुक्त रहे।"],
    materialTech: {
      composition: "Multi-hardness CNC contoured orthopedic profile with variable compression channels",
      density: "42 kg/m³ Precision Engineered Foam",
      cellStructure: "5 distinct zone densities along horizontal bed axis",
      breathability: "Cross-flow ventilation tunnels connecting lateral zones",
      durability: "Retains zoned stiffness profile over 12 years of continuous dual-occupancy"
    },
    benefits: {
      title: "Spine Posture Auto-Correction",
      desc: "Gives softer reception to broad shoulders and heavy hips while providing extra rigid resistance under the hollow lumbar curve, guaranteeing a 180° straight spine.",
      idealFor: "Spinal posture correction, disc herniation, tall individuals, and posture-conscious buyers.",
      pressureScore: 97
    },
    employeePitch: {
      hook: "Show the multi-zone surface in Layer view.",
      explanation: "Your body is not a flat rectangular board. Your hips weigh 44% of your total weight, while your waist needs upward push. Our 5-Zone mattress gives 5 distinct firmness levels engineered for your exact human anatomy.",
      demonstrationAction: "Rotate 3D model to top view and show the 5 transverse zone stripes.",
      objectionHandling: "If customer says: 'What if I sleep upside down?' Explain: 'The 5 zones are mirror-symmetric; Zone 1 (Head) and Zone 5 (Feet) match, and Zone 2 (Shoulders) and Zone 4 (Calves) match perfectly.'"
    },
    color: "#273c75",
    defaultThicknessCm: 3
  },
  spr: {
    title: ["2X Firm Pocket Spring Coils", "पॉकेट स्प्रिंग कोर"],
    tagline: ["Independently sealed carbon steel barrel coils for pinpoint 3D articulation and zero motion transfer.", "अलग-अलग कपड़े में बंद स्टील स्प्रिंग्स: पार्टनर की हलचल का कोई असर नहीं और शरीर के हर मोड़ पर सटीक सहारा।"],
    materialTech: {
      composition: "Oil-tempered high-tensile carbon spring steel encased in non-woven ultrasonic sealed sonic pockets",
      density: "Up to 1,200 individual coils per King mattress with perimeter foam encasement",
      cellStructure: "Independent barrel-shaped individual spring columns",
      breathability: "100% Hollow coil interior provides maximum air convection of any mattress tech",
      durability: "Drop-tested with 150 kg roller 100,000 times without coil breakage"
    },
    benefits: {
      title: "Zero Partner Disturbance & Dynamic Response",
      desc: "When one person turns over or gets out of bed, the other side of the mattress stays completely still. Deep barrel springs also keep interior temperatures cool.",
      idealFor: "Couples, restless sleepers, partners with different body weights, and spring lovers.",
      pressureScore: 93
    },
    employeePitch: {
      hook: "Explain the 'Glass of Wine' test.",
      explanation: "Each of these hundreds of coils sits in its own private fabric pocket. When I push one spring down, the spring 1 inch away doesn't even flinch. Your partner can toss, turn, or get up at 2 AM, and you won't feel a ripple.",
      demonstrationAction: "Show Spring view in 3D to reveal individual pocketed springs and metallic coils.",
      objectionHandling: "If customer says: 'Will springs squeak or poke me after 2 years?' Explain: 'Traditional Bonnell springs are tied with wires that rub and squeak. Our springs are encased in silent acoustic fabric and isolated by 5cm of top foam.'"
    },
    color: "#dfe6e9",
    defaultThicknessCm: 14
  },
  felt: {
    title: ["Premium Felt Layer", "प्रीमियम फेल्ट पैड"],
    tagline: ["High-density acoustic and mechanical buffer that protects comfort foam from spring friction.", "अत्यधिक घना सुरक्षात्मक फेल्ट पैड जो स्प्रिंग्स के प्रभाव को ऊपर नहीं आने देता और मजबूती बढ़ाता है।"],
    materialTech: {
      composition: "Thermally bonded high-density organic wool and cotton fiber matrix with needle-punch density",
      density: "900 GSM Heavy-Duty Felted Sheet",
      cellStructure: "Interlaced compressed multi-fiber web",
      breathability: "Natural micro-porous acoustic absorption",
      durability: "Immune to friction tear and coil puncture over 15+ years"
    },
    benefits: {
      title: "Enhances Durability & Spring Insulation",
      desc: "Distributes coil load evenly across the foundation and stops springs from wearing out top comfort layers.",
      idealFor: "Hybrid and pocket spring beds requiring long-lasting architectural support.",
      pressureScore: 89
    },
    employeePitch: {
      hook: "Show the customer the insulating felt layer between the coils and comfort foam.",
      explanation: "This 900 GSM felt shield prevents individual pocket springs from poking or creating friction against the soft foam above. It doubles the life of your mattress.",
      demonstrationAction: "Point to the insulation layer in the exploded view.",
      objectionHandling: "If customer asks about sagging: 'This compressed felt pad maintains flat coil alignment forever.'"
    },
    color: "#6b7280",
    defaultThicknessCm: 1.5
  },
  conv: {
    title: ["Convoluted Air-Ventilation Foam", "कन्वोल्यूटेड एयर फोम"],
    tagline: ["Egg-crate sculpted peak-and-valley surface providing micro-massaging support and air currents.", "अंडा-क्रेट डिज़ाइन वाली फोम जो हवा के रास्ते बनाती है और शरीर को हल्की मसाज जैसा अहसास देती है।"],
    materialTech: {
      composition: "Sculpted CNC convoluted open-cell comfort foam with progressive wave geometry",
      density: "35 kg/m³ High Grade Polyurethane",
      cellStructure: "Ridge-and-valley 3D surface profile",
      breathability: "Lateral air channeling across the entire sleeping surface",
      durability: "Retains 90% peak height under sustained 10-year load"
    },
    benefits: {
      title: "Continuous Air Flushing & Spot Tension Relief",
      desc: "Every breath and micro-movement gently compresses the peaks, forcing air through the valleys to flush out humidity while eliminating static pressure hot spots.",
      idealFor: "Hot humid climates, bedridden recovery, and people who sweat heavily at night.",
      pressureScore: 89
    },
    employeePitch: {
      hook: "Show the rippled cross-section in Cutaway view.",
      explanation: "Look at this wave profile. These valleys create natural air chimneys. When you lie down, you aren't sealing off airflow; the mattress continuously exhales warm humid air and inhales fresh room air.",
      demonstrationAction: "Switch to Cutaway view and zoom in on the wave ridges.",
      objectionHandling: "If customer says: 'Will the ridges feel bumpy?' Explain: 'No, they are under the quilted cover; they feel like a uniform cloud that gently adapts to your muscles.'"
    },
    color: "#b2bec3",
    defaultThicknessCm: 3
  },
  cnc: {
    title: ["Orthofit CNC Precision Cut Foam", "CNC प्रिसिजन कट फोम"],
    tagline: ["Micro-grooved multi-axis grid cells that compress independently in all three dimensions.", "कंप्यूटर नियंत्रित ग्रिड कट्स जो 3D में अलग-अलग दबकर शरीर का भार 100% बराबर बाँटते हैं।"],
    materialTech: {
      composition: "Computerized Numerical Control routed high-density orthopedic virgin foam",
      density: "45 kg/m³ Virgin Polyurethane",
      cellStructure: "Orthogonal multi-pitch flex cubes",
      breathability: "Deep orthogonal air duct system along XY plane",
      durability: "Exceptional resistance to localized fatigue"
    },
    benefits: {
      title: "3D Articulated Weight Distribution",
      desc: "Cubes act like individual mini-shock absorbers. They pivot and compress in exact proportion to the angle and weight of the body lying on top.",
      idealFor: "Scoliosis sufferers, athletes requiring muscle decompression, and premium orthopedic seekers.",
      pressureScore: 95
    },
    employeePitch: {
      hook: "Highlight precision German CNC engineering technology.",
      explanation: "Instead of a simple flat block of foam, our robotic CNC blade cuts a chess-board grid of pressure relief channels. This lets the foam flex three-dimensionally under your hip and shoulder blades.",
      demonstrationAction: "Select CNC mattress and explore the CNC layer in isolated Layer view.",
      objectionHandling: "If customer says: 'Why not just buy regular foam?' Explain: 'Flat foam creates surface tension that pushes back like a balloon. CNC cuts break surface tension completely for weightless sleep.'"
    },
    color: "#fd79a8",
    defaultThicknessCm: 3
  },
  cold: {
    title: ["Cold-Cure High Durability Foam", "कोल्ड क्योर मोल्डेड फोम"],
    tagline: ["Automotive luxury-grade cold-molded foam offering lifetime resilience without sagging.", "ऑटोमोबाइल लग्जरी ग्रेड मोल्डेड फोम जो बिना किसी डिफॉर्मेशन के दशकों तक चलती है।"],
    materialTech: {
      composition: "Individually molded cold-cure high elasticity polyurethane core",
      density: "50 kg/m³ Cold-Molded Polymer",
      cellStructure: "Closed-skin surface with high-elasticity core micro-cells",
      breathability: "Controlled microporous breathing",
      durability: "The longest lasting foam technology in the industry; 20+ year lifespan"
    },
    benefits: {
      title: "Permanent Loft & Unmatched Durability",
      desc: "Molded under cold conditions to preserve polymer chains, preventing cellular fatigue and permanent body indentations.",
      idealFor: "Heavyweight sleepers, hotel suites, and buyers wanting a once-in-a-lifetime bed.",
      pressureScore: 92
    },
    employeePitch: {
      hook: "Compare with high-end luxury vehicle seat technology.",
      explanation: "This same cold-cure foam is used in Mercedes-Benz and BMW luxury seating. It is molded at low temperature so the polymer chains never weaken. Even after 10 years, it will have zero body indentation.",
      demonstrationAction: "Highlight the 10-year warranty badge on screen.",
      objectionHandling: "If customer says: 'Why is it denser?' Explain: 'Density equals lifespan. Cheap mattresses use air and fillers; we use pure polymer density.'"
    },
    color: "#00cec9",
    defaultThicknessCm: 5
  },
  prof: {
    title: ["Profile Wave Sheet Foam", "प्रोफाइल वेव शीट फोम"],
    tagline: ["Textured wave contouring that enhances surface compliance and air exchange.", "तरंगदार सतह जो मांसपेशियों पर दबाव कम करती है और हवा का बहाव बढ़ाती है।"],
    materialTech: {
      composition: "Mechanically profiled medium-density comfort foam",
      density: "28 to 32 kg/m³ Virgin Foam",
      cellStructure: "Serrated wave profile",
      breathability: "High lateral convective airflow",
      durability: "Reliable 7-year performance"
    },
    benefits: {
      title: "Cost-Effective Micro-Cushioning",
      desc: "Provides progressive softness at an accessible price point, preventing numbness in fingers and toes during sleep.",
      idealFor: "Value-conscious buyers, guest bedrooms, and teenagers.",
      pressureScore: 86
    },
    employeePitch: {
      hook: "Showcase smart engineering at affordable pricing.",
      explanation: "Even in our economical Raftaar series, we don't cut corners. This Profile sheet gives you ergonomic comfort and air channels that typical market mattresses only offer at triple the price.",
      demonstrationAction: "Show Raftaar model layers in Layer view.",
      objectionHandling: "If customer says: 'Is this an entry-level mattress?' Explain: 'It is budget-friendly, but medically far superior to standard coir or cotton beds.'"
    },
    color: "#55efc4",
    defaultThicknessCm: 3
  },
  pu: {
    title: ["Virgin P.U Cushioning Foam", "प्योर पी.यू फोम"],
    tagline: ["Clean, resilient everyday cushioning free from recycled impurities.", "स्वच्छ, शुद्ध और टिकाऊ पी.यू फोम जो रोज़ाना संतुलित आराम देती है।"],
    materialTech: {
      composition: "Virgin polyol-isocyanate flexible polyurethane foam",
      density: "28 kg/m³ Virgin Grade",
      cellStructure: "Uniform open cell",
      breathability: "Standard porous ventilation",
      durability: "5 to 7 year lifespan without crumbling"
    },
    benefits: {
      title: "Pure Everyday Cushioning",
      desc: "Offers dependable, clean comfort free from hazardous chemical scrap or dust powders.",
      idealFor: "Daily guest beds, budget-friendly bedrooms, and dormitories.",
      pressureScore: 82
    },
    employeePitch: {
      hook: "Emphasize 100% virgin polymer purity over road-side foam.",
      explanation: "Many cheap mattresses use toxic recycled shoe and car scrap foam. SleepWorld uses 100% pure virgin polyols, certified non-toxic and odor-free.",
      demonstrationAction: "Point to the pure color uniformity in the 3D model.",
      objectionHandling: "If customer compares with local market prices: 'Cheap beds release VOC gases you breathe in for 8 hours every night. Our virgin foam is lab-certified skin safe.'"
    },
    color: "#fab1a0",
    defaultThicknessCm: 4
  },
  sup: {
    title: ["High Resilience Posture Support Foam", "सपोर्ट फोम"],
    tagline: ["Deep firm foundation core that stops spinal sagging and maintains structural baseline.", "मजबूत और उछालदार परत जो रीढ़ को धँसने से रोकती है और लंबे समय तक सीधा सहारा देती है।"],
    materialTech: {
      composition: "High-density transition polyurethane with high load-bearing capacity",
      density: "35 to 40 kg/m³ Support Density",
      cellStructure: "Reinforced thick-wall micro cells",
      breathability: "Good natural air permeability",
      durability: "Maintains load profile over 10 years"
    },
    benefits: {
      title: "Spinal Neutrality & Anti-Sag Guarantee",
      desc: "Provides firm pushback beneath the soft comfort layers so your spine remains properly aligned whether sleeping on your back or side.",
      idealFor: "All sleeping profiles seeking balanced comfort with solid spinal support.",
      pressureScore: 88
    },
    employeePitch: {
      hook: "Explain the 'Sandwich' construction concept.",
      explanation: "Think of this layer as the sturdy foundation of a building. The top layers provide luxury comfort, but this Support Foam ensures your heavier pelvic bones never sag into an awkward posture.",
      demonstrationAction: "Highlight the transition between comfort foam and support foam in the layer stack.",
      objectionHandling: "If customer asks about firmness: 'It balances firmness with elasticity—firm enough for your spine, but with enough give to prevent aches.'"
    },
    color: "#0984e3",
    defaultThicknessCm: 5
  },
  ctr: {
    title: ["Ergo-Contour Support Divider", "कंटूर सपोर्ट परत"],
    tagline: ["Even transition platform that equalizes pressure between soft comfort layers and firm core.", "आराम वाली फोम और कठोर बेस के बीच बराबर सहारे का वैज्ञानिक आधार।"],
    materialTech: {
      composition: "Dense semi-flexible polyurethane transition pad",
      density: "32 kg/m³ Balanced Density",
      cellStructure: "Damped cellular compression profile",
      breathability: "Standard cellular airflow",
      durability: "High fatigue resistance"
    },
    benefits: {
      title: "Smooth Pressure Gradation",
      desc: "Prevents the jarring sensation of sinking through a soft top layer and suddenly slamming into a rock-hard core.",
      idealFor: "Multi-sleeper beds with different comfort expectations.",
      pressureScore: 87
    },
    employeePitch: {
      hook: "Explain why single-layer mattresses always cause pain.",
      explanation: "When a mattress has only a soft layer over a hard layer, you feel the sudden bottoming out. Our Ergo-Contour layer provides a smooth gradient of support so your joints feel weightless.",
      demonstrationAction: "Show the multi-layer explosion on the tablet.",
      objectionHandling: "If customer asks: 'Why so many layers?' Explain: 'Just like luxury running shoes have multiple midsole densities for shock absorption, your mattress needs engineered gradation for 8 hours of restorative sleep.'"
    },
    color: "#b2bec3",
    defaultThicknessCm: 2
  },
  base: {
    title: ["High-GSM Anti-Slip Foundation Fabric", "बेस फैब्रिक"],
    tagline: ["Tough structural base with anti-skid friction grip and internal moisture barrier.", "मजबूत सुरक्षात्मक बेस फैब्रिक जो गद्दे को बेड फ्रेम पर फिसलने नहीं देता और सीलन से बचाता है।"],
    materialTech: {
      composition: "Heavyweight woven jacquard fabric with rubberized silicone micro-dots for traction",
      density: "260 GSM Heavy Duty Weave",
      cellStructure: "Interlocked cross-weave with dust protection membrane",
      breathability: "Vented bottom air-permeable canvas",
      durability: "High puncture and tear resistance against rough wooden slats"
    },
    benefits: {
      title: "Mattress Stability & Core Protection",
      desc: "Locks the mattress securely onto the bed base without sliding during sleep, while shielding the interior foam cores from rough wooden bed boards and moisture.",
      idealFor: "All bed foundations (wooden slats, box springs, flat platform beds).",
      pressureScore: 90
    },
    employeePitch: {
      hook: "Show the bottom layer in Blueprint mode.",
      explanation: "Notice the heavy anti-slip foundation fabric. When you get in and out of bed, this non-skid base keeps your mattress firmly in place without bunching or shifting, while sealing out dust.",
      demonstrationAction: "Rotate the 3D model to inspect the bottom foundation.",
      objectionHandling: "If customer asks about foundation suitability: 'It works flawlessly on all bed frames: storage beds, hydraulic beds, wooden slats, or flat platforms.'"
    },
    color: "#2d3436",
    defaultThicknessCm: 1
  }
};

