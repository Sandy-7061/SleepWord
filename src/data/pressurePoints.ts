export interface PressurePointData {
  id: string;
  name: string;
  nameHi: string;
  x: number;
  z: number;
  isMirrored?: boolean;
  // [pressure_mmHg, radius, depth_m]
  sleepWorld: [number, number, number];
  typical: [number, number, number];
  tipEn: string;
  tipHi: string;
}

export interface PressureProfile {
  alignmentScores: [number, number]; // [SleepWorld %, Typical %]
  points: PressurePointData[];
}

export const PRESSURE_DATA: Record<'back' | 'side', PressureProfile> = {
  back: {
    alignmentScores: [94, 61],
    points: [
      {
        id: "head",
        name: "Cervical / Head",
        nameHi: "गर्दन और सिर",
        x: 0,
        z: -7.6,
        sleepWorld: [24, 1.5, 0.08],
        typical: [38, 1.1, 0.05],
        tipEn: "Soft top quilted cover plus responsive cushioning keeps the cervical spine relaxed in its natural C-curve.",
        tipHi: "मुलायम क्विल्टेड कवर और कुशनिंग गर्दन की हड्डियों को प्राकृतिक सी-कर्व में रखकर तनावमुक्त रखती है।"
      },
      {
        id: "shoulders",
        name: "Shoulder Blades",
        nameHi: "कंधे (शोल्डर ब्लेड)",
        x: 1.7,
        z: -4.8,
        isMirrored: true,
        sleepWorld: [29, 1.8, 0.14],
        typical: [58, 1.2, 0.05],
        tipEn: "Broad upper shoulders press heavily. Our comfort foam lets them sink smoothly, dissipating pressure across the back instead of causing joint ache.",
        tipHi: "चौड़े कंधे बिस्तर पर सबसे ज़्यादा दबाव डालते हैं। हमारी कम्फर्ट फोम उन्हें धँसने देती है जिससे दबाव पूरी पीठ पर बराबर फैल जाता है।"
      },
      {
        id: "midback",
        name: "Thoracic Spine",
        nameHi: "मध्य पीठ",
        x: 0,
        z: -3.0,
        sleepWorld: [25, 2.0, 0.10],
        typical: [42, 1.4, 0.07],
        tipEn: "Even ergonomic support keeps the middle spine relaxed without allowing muscles to tighten overnight.",
        tipHi: "बराबर सहारा रीढ़ की हड्डियों को सीधा रखता है और रात भर मांसपेशियों में अकड़न नहीं आने देता।"
      },
      {
        id: "lumbar",
        name: "Lumbar Curve (Lower Back)",
        nameHi: "कमर (लंबर कर्व)",
        x: 0,
        z: -1.4,
        sleepWorld: [22, 2.0, 0.10],
        typical: [12, 1.2, 0.02],
        tipEn: "On a typical stiff mattress there is a dead hollow air gap here—leaving your lumbar spine unsupported and forcing back muscles to clench all night. SleepWorld fills this gap completely.",
        tipHi: "साधारण गद्दे पर कमर के नीचे खाली हवा की जगह छूट जाती है, जिससे कमर को सहारा नहीं मिलता और रीढ़ लटकती रहती है। स्लीपवर्ल्ड इस खाली जगह को पूरी तरह भर देता है।"
      },
      {
        id: "hips",
        name: "Pelvis & Hips",
        nameHi: "कूल्हे और पेल्विस",
        x: 0,
        z: -0.2,
        sleepWorld: [33, 2.2, 0.17],
        typical: [78, 1.4, 0.30],
        tipEn: "The heaviest 44% of human body weight rests here. A typical bed either sags (causing hammock spine curvature) or pushes back like a rock (causing numbness). Our layered core keeps hips level.",
        tipHi: "शरीर का सबसे भारी हिस्सा। आम गद्दे पर या तो यह खतरनाक तरीके से धँस जाता है या फिर पत्थर की तरह चुभता है। हमारी लेयर्स कूल्हों को संतुलित ऊंचाई पर रखती हैं।"
      },
      {
        id: "calves",
        name: "Calves & Knees",
        nameHi: "पिंडलियाँ और घुटने",
        x: 0.7,
        z: 5.0,
        isMirrored: true,
        sleepWorld: [18, 1.4, 0.07],
        typical: [30, 1.0, 0.05],
        tipEn: "Low load area where micro-circulation and gentle cushioning prevent calf cramps.",
        tipHi: "हल्के भार वाला क्षेत्र जहाँ आरामदायक कुशनिंग पैरों में रक्त संचार बनाए रखती है।"
      },
      {
        id: "heels",
        name: "Heels & Ankles",
        nameHi: "एड़ियाँ और टखने",
        x: 0.6,
        z: 7.4,
        isMirrored: true,
        sleepWorld: [24, 1.0, 0.08],
        typical: [52, 0.8, 0.05],
        tipEn: "Very small bone contact area creates dangerous pressure spikes on ordinary beds. Our plush layers cushion bony heel points comfortably.",
        tipHi: "हड्डी वाला छोटा हिस्सा होने के कारण यहाँ साधारण बिस्तर पर दर्द होता है। हमारी सतह एड़ियों को कोमल सहारा देती है।"
      }
    ]
  },
  side: {
    alignmentScores: [91, 57],
    points: [
      {
        id: "head-side",
        name: "Ear & Cranial Point",
        nameHi: "कान और सिर",
        x: 0,
        z: -7.6,
        sleepWorld: [25, 1.3, 0.09],
        typical: [44, 1.0, 0.05],
        tipEn: "Side sleeping places high focal pressure on ear cartilage. Balanced cushioning provides gentle cradling.",
        tipHi: "करवट में कान पर दबाव पड़ता है। हमारी कुशनिंग कान और सिर को कोमलता से थामती है।"
      },
      {
        id: "shoulder-side",
        name: "Acromion (Shoulder Joint)",
        nameHi: "कंधा (मुख्य जोड़)",
        x: 0,
        z: -4.9,
        sleepWorld: [31, 1.9, 0.20],
        typical: [89, 1.2, 0.07],
        tipEn: "The #1 pain point for 70% of side sleepers! The shoulder must sink 3 to 5 cm into the bed. If not, it compresses the brachial nerve plexus and cuts off blood flow, causing 'dead arm' morning numbness.",
        tipHi: "करवट सोने वालों का सबसे बड़ा दर्द बिंदु! कंधे को 3 से 5 सेमी धँसना ही चाहिए। अगर ऐसा न हो तो नसों पर भयानक दबाव पड़ता है और हाथ सुन्न हो जाता है।"
      },
      {
        id: "waist-side",
        name: "Waist & Flank",
        nameHi: "कमर का झुकाव",
        x: 0,
        z: -2.3,
        sleepWorld: [16, 2.0, 0.06],
        typical: [10, 1.3, 0.02],
        tipEn: "The lateral waist hollow must receive buoyant upward push, or the spine will sag sideways into a scoliosis-like curve.",
        tipHi: "कमर के खाली हिस्से को ऊपर की तरफ सहारा मिलना ज़रूरी है, वरना रीढ़ की हड्डी टेढ़ी होकर लटक जाती है।"
      },
      {
        id: "hip-side",
        name: "Greater Trochanter (Hip Joint)",
        nameHi: "कूल्हे का मुख्य जोड़",
        x: 0,
        z: -0.3,
        sleepWorld: [34, 2.2, 0.20],
        typical: [93, 1.4, 0.08],
        tipEn: "The widest anatomical point in side posture. Our comfort layers spread this massive lateral load smoothly, preventing hip bursitis while keeping the pelvic axis perpendicular to bed.",
        tipHi: "करवट की मुद्रा में शरीर का सबसे चौड़ा और संवेदनशील हिस्सा। हमारी लेयर्स इस भार को फैला देती हैं जिससे हिप जॉइंट पर दर्द नहीं होता।"
      },
      {
        id: "knee-side",
        name: "Medial Knee Contact",
        nameHi: "घुटनों का संपर्क",
        x: 0,
        z: 3.0,
        sleepWorld: [21, 1.2, 0.08],
        typical: [48, 0.9, 0.04],
        tipEn: "Bony kneecaps touch with concentrated pressure. Gentle surface compliance prevents joint friction.",
        tipHi: "हड्डीदार घुटनों के संपर्क पर कोमल आराम जिससे घुटने के जोड़ों में खिंचाव नहीं आता।"
      },
      {
        id: "ankle-side",
        name: "Lateral Malleolus (Ankle Bone)",
        nameHi: "टखने की हड्डी",
        x: 0,
        z: 6.8,
        sleepWorld: [19, 1.0, 0.07],
        typical: [40, 0.8, 0.04],
        tipEn: "Protects sensitive ankle bone protrusions from hard floor-like bed pressure.",
        tipHi: "टखने की संवेदनशील हड्डी को सख्त चुभन से बचाकर विश्राम देता है।"
      }
    ]
  }
};

