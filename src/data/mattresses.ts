export interface MattressModelData {
  id: string;
  name: string;
  warranty: number;
  firmness: number; // 0: Soft, 1: Med. Soft, 2: Medium, 3: Med. Firm, 4: Firm
  coverPattern: [string, string, string]; // [primaryColor, secondaryColor, patternType: "hex"|"dia"|"leaf"|"str"|"dot"|"cir"|"plain"]
  wallColor: string;
  description: string;
  layers: [string, string][]; // [typeKey, detailedLabel]
}

export const MATTRESS_MODELS: MattressModelData[] = [
  {
    id: "luxe-hybrid",
    name: "Luxe Hybrid 3D",
    warranty: 15,
    firmness: 2,
    coverPattern: ["#f5f5f7", "#3b82f6", "hex"],
    wallColor: "#1e293b",
    description: "Our flagship multi-tier hybrid mattress: plush cloud quilted pillow-top, breathable perforated comfort foam, cooling gel infusion, dynamic pocket springs, and reinforced foundation.",
    layers: [
      ["fab", "Quilted Fabric Cover - Soft, breathable and skin-friendly fabric."],
      ["soft", "Super Soft Comfort Foam - Adds a plush and cozy feel."],
      ["gel", "Cooling Gel Foam Layer - Keeps you cool even on warm nights."],
      ["hr", "High Resilience (HR) Foam - Provides excellent support and bounce."],
      ["felt", "Premium Felt Layer - Enhances durability and stability."],
      ["spr", "Pocket Spring Core - Individual springs for targeted support."],
      ["base", "Anti-Slip Fabric Base - Keeps the mattress firmly in place."]
    ]
  },
  {
    id: "sleep-sense",
    name: "Sleep Sense",
    warranty: 12,
    firmness: 1,
    coverPattern: ["#b4b7bb", "#8c9096", "hex"],
    wallColor: "#1f2d52",
    description: "Heavy memory quilted European-style pillow top for luxurious softness, with rebonded and pure foam layers for support and stability.",
    layers: [
      ["fab", "Luxurious high GSM European soft textured memory quilted knitted fabric"],
      ["soft", "Responsive super soft higher resilience foam"],
      ["hr", "High density HR comfort foam"],
      ["reb", "Orthopedic high-density rebonded core foam"],
      ["base", "High GSM knitted quilted non-skid base fabric"]
    ]
  },
  {
    id: "natural-latex",
    name: "Natural Latex",
    warranty: 10,
    firmness: 2,
    coverPattern: ["#f3f1ea", "#8eb36a", "leaf"],
    wallColor: "#2f7d3a",
    description: "Crafted from 100% natural rubber tree sap and wrapped in soothing Aloe Vera fabric. Purity, resilience, pinhole breathing, and zero chemical odor.",
    layers: [
      ["fab", "High GSM heavy quilted knitted Aloe Vera & organic bamboo fabric"],
      ["lat", "100% Natural pinhole airflow massage latex block"],
      ["sup", "High density resilient HR transition foam"],
      ["reb", "High compression bonded posture foam"],
      ["base", "Heavy-duty anti-slip knitted bottom layer"]
    ]
  },
  {
    id: "impression-luxury",
    name: "Impression Luxury",
    warranty: 8,
    firmness: 1,
    coverPattern: ["#d9d2c2", "#8d8470", "dia"],
    wallColor: "#d6cfc0",
    description: "Plush thermo-sensitive memory foam comfort with orthopedic spinal support. Soft on the surface, strong at the core.",
    layers: [
      ["fab", "Belgian viscose knitted fabric with blend cushioning"],
      ["mem", "Impression NASA-grade memory foam"],
      ["hr", "VPF high resilience comfort layer"],
      ["reb", "Spine-lock rebonded foam base"],
      ["base", "High GSM knitted quilted fabric"]
    ]
  },
  {
    id: "five-zone",
    name: "Five Zone",
    warranty: 12,
    firmness: 3,
    coverPattern: ["#26406e", "#d3b24a", "str"],
    wallColor: "#e0a92a",
    description: "Each zone is scientifically crafted for targeted support, keeping head, shoulders, lumbar, hips, and calves ergonomically balanced.",
    layers: [
      ["fab", "Premium European quilted knitted fabric"],
      ["zone", "5-Zone orthopedic contoured spine-correct layer"],
      ["hr", "High density HR load balancing foam"],
      ["reb", "Ultra-dense rebonded spine core"],
      ["hr", "High density HR buffer foam"],
      ["base", "High GSM quilted barrier fabric"]
    ]
  },
  {
    id: "jumping-jack",
    name: "Jumping Jack",
    warranty: 5,
    firmness: 1,
    coverPattern: ["#b9bfc9", "#7e89a0", "cir"],
    wallColor: "#1b2438",
    description: "Individually wrapped pocket springs for customised body contouring, zero partner motion transfer, and cool continuous airflow.",
    layers: [
      ["fab", "Premium European double-knit jacquard fabric"],
      ["soft", "Responsive super soft higher resilience foam"],
      ["hr", "High density HR spring-insulation foam"],
      ["spr", "2X Firm tempered carbon pocket spring coils (encased)"],
      ["base", "High GSM heavy quilted foundation fabric"]
    ]
  },
  {
    id: "fittest-ultra",
    name: "Fittest Ultra",
    warranty: 25,
    firmness: 3,
    coverPattern: ["#8f959d", "#2b3038", "hex"],
    wallColor: "#3a3f48",
    description: "Contour aerospace foam technology adapts to heavy muscular body profiles, with 25 years warranty and high airflow channels.",
    layers: [
      ["fab", "SleepWorld high GSM airflow quilted knit"],
      ["soft", "Responsive super soft contour foam"],
      ["conv", "Convoluted egg-crate air circulation system"],
      ["sup", "Aerospace high resilience posture support foam"],
      ["base", "Heavy reinforced quilted border fabric"]
    ]
  },
  {
    id: "carnival",
    name: "Carnival",
    warranty: 10,
    firmness: 2,
    coverPattern: ["#6c6a67", "#35322f", "dia"],
    wallColor: "#4b4a46",
    description: "Multi-layer comfort cushioning with dual-stage pressure dispersion to prevent morning shoulder stiffness and hip joint pressure.",
    layers: [
      ["fab", "High GSM textured quilted comfort fabric"],
      ["ctr", "Ergo-contour progressive transition layer"],
      ["mem", "Impression contour memory foam"],
      ["hr", "High resilience orthocore foam"],
      ["base", "High GSM knitted quilted fabric"]
    ]
  },
  {
    id: "ortho-active",
    name: "Ortho Active",
    warranty: 7,
    firmness: 3,
    coverPattern: ["#3b3f63", "#9aa0c8", "dot"],
    wallColor: "#e9e6ef",
    description: "Firm, balanced support recommended for spine posture realignment, disc relief, and active lifestyles.",
    layers: [
      ["fab", "Premium European anti-dust-mite knit"],
      ["soft", "Super soft reflex foam topper"],
      ["hr", "Higher resilience orthopedic transition sheet"],
      ["reb", "Medical grade high density rebonded foam"],
      ["base", "Knitted quilted protective fabric"]
    ]
  },
  {
    id: "cnc",
    name: "CNC",
    warranty: 10,
    firmness: 1,
    coverPattern: ["#cfc9bd", "#b8ad96", "plain"],
    wallColor: "#c9b48a",
    description: "Computer Numerical Control (CNC) custom-routed grid blocks flex in 3D under individual pressure points for weightless floating feel.",
    layers: [
      ["fab", "Zenith breathable pure cotton-blend fabric"],
      ["ctr", "Ergo contour pressure divider"],
      ["cnc", "Orthofit multi-directional CNC precision cut foam"],
      ["cold", "Cold-cure high durability molded foam"],
      ["base", "Heavily quilted satin structural fabric"]
    ]
  },
  {
    id: "spinetech",
    name: "Spinetech",
    warranty: 4,
    firmness: 3,
    coverPattern: ["#b01f2e", "#e3a2a8", "dot"],
    wallColor: "#c8a85a",
    description: "Firm orthopedic mattress specifically developed for chronic lower backache and lumbar curvature support.",
    layers: [
      ["fab", "Heavily quilted satin fabric with anti-microbial treatment"],
      ["hr", "High resilience bounce comfort layer"],
      ["reb", "Ultra-stiff high density rebonded orthopedic core"],
      ["base", "Quilted satin fabric"]
    ]
  },
  {
    id: "bond-edge",
    name: "Bond Edge",
    warranty: 5,
    firmness: 4,
    coverPattern: ["#555a60", "#2e3236", "dia"],
    wallColor: "#dcdce4",
    description: "Extra-firm solid stability mattress. Ideal for elderly individuals and those prescribed extra-hard flat spine stabilization.",
    layers: [
      ["fab", "Heavily quilted knitted fabric"],
      ["reb", "Extra heavy 90D high density rebonded foundation"],
      ["base", "Knitted anti-slip base fabric"]
    ]
  },
  {
    id: "zippo-sleep",
    name: "Zippo Sleep",
    warranty: 3,
    firmness: 2,
    coverPattern: ["#9b9ea3", "#7b7e83", "plain"],
    wallColor: "#5a3a22",
    description: "Pure virgin foam mattress for everyday guest-room or children's comfort, breathable, light, and durable.",
    layers: [
      ["fab", "Triple antimicrobial knitted soft fabric"],
      ["sup", "High resilience pure comfort foam block"],
      ["base", "Tough woven fabric foundation"]
    ]
  },
  {
    id: "raftaar",
    name: "Raftaar",
    warranty: 5,
    firmness: 3,
    coverPattern: ["#7a7d82", "#4a4d52", "dot"],
    wallColor: "#2d4f66",
    description: "Economical high-durability mattress combining surface profiling with resilient bonded base for value-conscious households.",
    layers: [
      ["fab", "Antimicrobial quilted knitted cover"],
      ["pu", "Virgin P.U comfort foam"],
      ["prof", "Profile sheet with air wave massage ridges"],
      ["reb", "High density rebonded foam base"],
      ["base", "Knitted quilted protective fabric"]
    ]
  },
  {
    id: "springflex",
    name: "SpringFlex",
    warranty: 11,
    firmness: 1,
    coverPattern: ["#6a6d70", "#d3b24a", "str"],
    wallColor: "#d1ba84",
    description: "The ultimate hybrid mattress: Natural tree-sap latex paired over zoned pocket springs gives bouncy responsiveness and deep pressure relief.",
    layers: [
      ["fab", "Belgian viscose knitted fabric with silk-touch finish"],
      ["lat", "Natural pinhole breathing latex comfort layer"],
      ["zone", "Five-zone orthopedic pressure transition pad"],
      ["spr", "2X Firm individually wrapped pocket springs"],
      ["hr", "High density bottom foundation HR foam"],
      ["base", "High GSM knitted quilted fabric"]
    ]
  },
  {
    id: "latex-air",
    name: "Latex Air",
    warranty: 10,
    firmness: 1,
    coverPattern: ["#f3f1ea", "#7fa0c8", "leaf"],
    wallColor: "#27406e",
    description: "Refreshing zero-sweat luxury: Natural latex paired with micro-bead cool gel memory foam that dissipates body temperature all night.",
    layers: [
      ["fab", "High GSM heavy quilted knitted Aloe Vera & bamboo fabric"],
      ["lat", "Natural pinhole ventilation latex sheet"],
      ["gel", "Hydro-cool infusion memory gel foam"],
      ["sup", "High density HR support layer"],
      ["base", "High GSM knitted quilted base"]
    ]
  }
];

