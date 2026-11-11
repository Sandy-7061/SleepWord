import React, { useState, useRef, useEffect } from 'react';
import { useShowroomStore } from '../../store/showroomStore';
import { MATTRESS_MODELS } from '../../data/mattresses';
import { LAYER_TYPES } from '../../data/layerTypes';
import { LayerDeepDive } from '../ui/LayerDeepDive';
import { BodyPressureView } from './BodyPressureView';
import { ModeBar } from '../ui/ModeBar';

// ─── REAL MATERIAL DEFINITIONS ────────────────────────────────────────────────
// Each material has: topFace (looking down), frontFace (cut cross-section), edgeFace (border), sideColor, label
const REAL_MATERIALS: Record<string, {
  topFace: string;       // CSS gradient for top surface
  frontFace: string;     // CSS gradient for cut cross-section face
  edgeFace: string;      // CSS for the narrow border tape edge
  sideColor: string;     // solid color fallback
  realLabel: string;
  description: string;
  accentColor: string;
}> = {
  fab: {
    topFace: `
      repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 14px),
      repeating-linear-gradient(-45deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 14px),
      linear-gradient(180deg, #f0ede6 0%, #e8e4dc 60%, #ddd8ce 100%)
    `,
    frontFace: `
      repeating-linear-gradient(45deg, rgba(200,195,185,0.5) 0px, rgba(200,195,185,0.5) 1px, transparent 1px, transparent 10px),
      repeating-linear-gradient(-45deg, rgba(200,195,185,0.5) 0px, rgba(200,195,185,0.5) 1px, transparent 1px, transparent 10px),
      linear-gradient(90deg, #e8e3da 0%, #f2ede4 50%, #e5e0d7 100%)
    `,
    edgeFace: `linear-gradient(180deg, #d8d0c4, #c8c0b4)`,
    sideColor: '#d4cfc5',
    realLabel: 'Quilted Fabric Cover',
    description: 'European knitted jacquard with diamond quilt stitching',
    accentColor: '#a89880',
  },
  soft: {
    topFace: `
      radial-gradient(ellipse 18px 14px at 15px 10px, rgba(255,255,255,0.15) 0%, transparent 70%),
      radial-gradient(ellipse 12px 10px at 35px 20px, rgba(255,255,255,0.1) 0%, transparent 70%),
      radial-gradient(ellipse 20px 16px at 55px 8px, rgba(255,255,255,0.12) 0%, transparent 70%),
      radial-gradient(ellipse 15px 12px at 10px 28px, rgba(255,255,255,0.1) 0%, transparent 70%),
      linear-gradient(180deg, #e8deb5 0%, #d4c890 50%, #c0b070 100%)
    `,
    frontFace: `
      radial-gradient(circle 3px at 8px 6px, rgba(255,255,255,0.3) 60%, transparent 100%),
      radial-gradient(circle 2px at 16px 4px, rgba(255,255,255,0.2) 60%, transparent 100%),
      radial-gradient(circle 3px at 6px 14px, rgba(255,255,255,0.25) 60%, transparent 100%),
      radial-gradient(circle 2px at 22px 10px, rgba(255,255,255,0.2) 60%, transparent 100%),
      radial-gradient(circle 3px at 12px 20px, rgba(255,255,255,0.3) 60%, transparent 100%),
      linear-gradient(90deg, #c8ba80 0%, #ddd098 50%, #c8ba80 100%)
    `,
    edgeFace: `linear-gradient(180deg, #b8aa70, #a89860)`,
    sideColor: '#c0b278',
    realLabel: 'Super Soft Comfort Foam',
    description: 'Open-cell polyether with ultra-low ILD',
    accentColor: '#d4c890',
  },
  hr: {
    topFace: `
      radial-gradient(ellipse 10px 8px at 12px 8px, rgba(255,255,255,0.2) 0%, transparent 60%),
      radial-gradient(ellipse 8px 6px at 28px 16px, rgba(255,255,255,0.15) 0%, transparent 60%),
      radial-gradient(ellipse 12px 9px at 48px 6px, rgba(255,255,255,0.18) 0%, transparent 60%),
      radial-gradient(ellipse 9px 7px at 8px 22px, rgba(255,255,255,0.12) 0%, transparent 60%),
      linear-gradient(180deg, #f5a623 0%, #e09410 60%, #c07c00 100%)
    `,
    frontFace: `
      radial-gradient(circle 2.5px at 7px 5px, rgba(255,255,255,0.35) 50%, transparent 100%),
      radial-gradient(circle 2px at 15px 3px, rgba(255,255,255,0.25) 50%, transparent 100%),
      radial-gradient(circle 2.5px at 5px 12px, rgba(255,255,255,0.3) 50%, transparent 100%),
      radial-gradient(circle 2px at 20px 9px, rgba(255,255,255,0.2) 50%, transparent 100%),
      radial-gradient(circle 2.5px at 11px 17px, rgba(255,255,255,0.28) 50%, transparent 100%),
      radial-gradient(circle 2px at 25px 14px, rgba(255,255,255,0.22) 50%, transparent 100%),
      linear-gradient(90deg, #d08800 0%, #f0a020 50%, #d08800 100%)
    `,
    edgeFace: `linear-gradient(180deg, #c07800, #a06000)`,
    sideColor: '#d08800',
    realLabel: 'HR Foam',
    description: '40–45 kg/m³ high-resilience orthopedic foam',
    accentColor: '#f5a623',
  },
  reb: {
    // Multi-color compressed chip look - rebonded foam is literally compressed recycled foam chunks
    topFace: `
      radial-gradient(ellipse 22px 10px at 15px 12px, rgba(70,180,120,0.8) 0%, transparent 70%),
      radial-gradient(ellipse 15px 8px at 38px 8px, rgba(50,120,200,0.7) 0%, transparent 70%),
      radial-gradient(ellipse 18px 12px at 55px 15px, rgba(230,160,30,0.7) 0%, transparent 70%),
      radial-gradient(ellipse 12px 7px at 25px 20px, rgba(200,60,60,0.6) 0%, transparent 70%),
      radial-gradient(ellipse 20px 9px at 70px 10px, rgba(80,160,80,0.75) 0%, transparent 70%),
      radial-gradient(ellipse 14px 8px at 8px 22px, rgba(100,80,200,0.6) 0%, transparent 70%),
      radial-gradient(ellipse 16px 10px at 45px 22px, rgba(220,100,50,0.65) 0%, transparent 70%),
      linear-gradient(180deg, #2d8060 0%, #208050 60%, #186040 100%)
    `,
    frontFace: `
      radial-gradient(ellipse 16px 8px at 10px 8px, rgba(70,180,120,0.9) 0%, transparent 70%),
      radial-gradient(ellipse 12px 6px at 28px 5px, rgba(50,120,200,0.8) 0%, transparent 70%),
      radial-gradient(ellipse 14px 7px at 20px 14px, rgba(230,160,30,0.8) 0%, transparent 70%),
      radial-gradient(ellipse 10px 5px at 38px 11px, rgba(200,60,60,0.7) 0%, transparent 70%),
      radial-gradient(ellipse 15px 7px at 8px 18px, rgba(100,180,80,0.8) 0%, transparent 70%),
      radial-gradient(ellipse 11px 6px at 32px 18px, rgba(100,80,200,0.7) 0%, transparent 70%),
      linear-gradient(90deg, #186040 0%, #208055 50%, #186040 100%)
    `,
    edgeFace: `linear-gradient(180deg, #208050, #106030)`,
    sideColor: '#1e7045',
    realLabel: 'Rebonded Orthopedic Foam',
    description: '85–90 kg/m³ thermally bonded multicolor compressed chips',
    accentColor: '#30c080',
  },
  lat: {
    topFace: `
      radial-gradient(circle 4px at 12px 10px, rgba(180,150,80,0.6) 60%, transparent 100%),
      radial-gradient(circle 4px at 28px 8px, rgba(180,150,80,0.5) 60%, transparent 100%),
      radial-gradient(circle 4px at 44px 12px, rgba(180,150,80,0.6) 60%, transparent 100%),
      radial-gradient(circle 4px at 20px 24px, rgba(180,150,80,0.5) 60%, transparent 100%),
      radial-gradient(circle 4px at 36px 22px, rgba(180,150,80,0.55) 60%, transparent 100%),
      radial-gradient(circle 4px at 52px 24px, rgba(180,150,80,0.5) 60%, transparent 100%),
      radial-gradient(circle 4px at 8px 28px, rgba(180,150,80,0.6) 60%, transparent 100%),
      linear-gradient(180deg, #f5e8c0 0%, #e8d8a0 60%, #d8c880 100%)
    `,
    frontFace: `
      radial-gradient(circle 3.5px at 10px 8px, rgba(160,130,60,0.7) 55%, transparent 100%),
      radial-gradient(circle 3.5px at 24px 6px, rgba(160,130,60,0.65) 55%, transparent 100%),
      radial-gradient(circle 3.5px at 38px 10px, rgba(160,130,60,0.7) 55%, transparent 100%),
      radial-gradient(circle 3.5px at 17px 18px, rgba(160,130,60,0.65) 55%, transparent 100%),
      radial-gradient(circle 3.5px at 31px 16px, rgba(160,130,60,0.68) 55%, transparent 100%),
      radial-gradient(circle 3.5px at 5px 18px, rgba(160,130,60,0.6) 55%, transparent 100%),
      linear-gradient(90deg, #d8c880 0%, #f0e0a8 50%, #d8c880 100%)
    `,
    edgeFace: `linear-gradient(180deg, #c8b870, #b0a060)`,
    sideColor: '#d8c888',
    realLabel: 'Natural Latex',
    description: '100% Hevea tree sap, Dunlop/Talalay pinhole grid',
    accentColor: '#e8d898',
  },
  mem: {
    topFace: `
      radial-gradient(ellipse 20px 14px at 20px 12px, rgba(100,140,210,0.4) 0%, transparent 60%),
      radial-gradient(ellipse 16px 10px at 50px 8px, rgba(80,120,200,0.35) 0%, transparent 60%),
      radial-gradient(ellipse 22px 15px at 10px 28px, rgba(90,130,205,0.38) 0%, transparent 60%),
      linear-gradient(180deg, #4a6ea8 0%, #3a5898 60%, #2a4888 100%)
    `,
    frontFace: `
      radial-gradient(ellipse 14px 8px at 12px 7px, rgba(120,160,230,0.5) 0%, transparent 60%),
      radial-gradient(ellipse 10px 6px at 30px 5px, rgba(100,140,220,0.4) 0%, transparent 60%),
      radial-gradient(ellipse 12px 7px at 8px 16px, rgba(110,150,225,0.45) 0%, transparent 60%),
      radial-gradient(ellipse 10px 6px at 24px 14px, rgba(90,130,215,0.4) 0%, transparent 60%),
      linear-gradient(90deg, #2a4888 0%, #3a5898 50%, #2a4888 100%)
    `,
    edgeFace: `linear-gradient(180deg, #3a5898, #2a3878)`,
    sideColor: '#3a5898',
    realLabel: 'Impression Memory Foam',
    description: 'Visco-elastic 55 kg/m³, body-heat responsive',
    accentColor: '#6080c8',
  },
  gel: {
    topFace: `
      radial-gradient(circle 3px at 10px 8px, rgba(140,220,255,0.6) 50%, transparent 100%),
      radial-gradient(circle 2px at 22px 5px, rgba(100,200,255,0.5) 50%, transparent 100%),
      radial-gradient(circle 3px at 34px 10px, rgba(140,220,255,0.55) 50%, transparent 100%),
      radial-gradient(circle 2px at 16px 18px, rgba(100,200,255,0.5) 50%, transparent 100%),
      radial-gradient(circle 3px at 28px 16px, rgba(140,220,255,0.6) 50%, transparent 100%),
      linear-gradient(180deg, #1a78c8 0%, #0a60b0 60%, #0050a0 100%)
    `,
    frontFace: `
      radial-gradient(circle 2.5px at 8px 6px, rgba(140,220,255,0.7) 50%, transparent 100%),
      radial-gradient(circle 2px at 18px 4px, rgba(100,200,255,0.6) 50%, transparent 100%),
      radial-gradient(circle 2.5px at 6px 14px, rgba(140,220,255,0.65) 50%, transparent 100%),
      radial-gradient(circle 2px at 22px 11px, rgba(100,200,255,0.55) 50%, transparent 100%),
      linear-gradient(90deg, #0050a0 0%, #1070c0 50%, #0050a0 100%)
    `,
    edgeFace: `linear-gradient(180deg, #0060b0, #004090)`,
    sideColor: '#0068b8',
    realLabel: 'Cool Gel Memory Foam',
    description: 'Phase-change gel micro-capsules, 60 kg/m³',
    accentColor: '#40a8e8',
  },
  zone: {
    topFace: `
      repeating-linear-gradient(90deg,
        rgba(60,80,180,0.0) 0%, rgba(60,80,180,0.0) 18%,
        rgba(80,120,220,0.5) 18%, rgba(80,120,220,0.5) 20%,
        rgba(40,60,160,0.0) 20%, rgba(40,60,160,0.0) 38%,
        rgba(100,140,240,0.5) 38%, rgba(100,140,240,0.5) 40%,
        rgba(50,70,170,0.0) 40%, rgba(50,70,170,0.0) 58%,
        rgba(80,120,220,0.5) 58%, rgba(80,120,220,0.5) 60%,
        rgba(40,60,160,0.0) 60%, rgba(40,60,160,0.0) 78%,
        rgba(100,140,240,0.5) 78%, rgba(100,140,240,0.5) 80%,
        rgba(50,70,170,0.0) 80%, rgba(50,70,170,0.0) 100%
      ),
      linear-gradient(180deg, #2a3c90 0%, #1a2c80 60%, #0a1c70 100%)
    `,
    frontFace: `
      repeating-linear-gradient(90deg,
        rgba(80,120,230,0.6) 0px, rgba(80,120,230,0.6) 2px,
        rgba(40,60,160,0.0) 2px, rgba(40,60,160,0.0) 24px
      ),
      linear-gradient(90deg, #0a1c70 0%, #2a3c90 50%, #0a1c70 100%)
    `,
    edgeFace: `linear-gradient(180deg, #2a3c90, #0a1c60)`,
    sideColor: '#1a2c80',
    realLabel: '5-Zone Ergonomic Layer',
    description: 'Multi-hardness CNC profiled orthopedic foam',
    accentColor: '#6080e0',
  },
  spr: {
    topFace: `
      repeating-linear-gradient(90deg,
        rgba(180,190,210,0.15) 0px, rgba(180,190,210,0.15) 18px,
        rgba(220,230,245,0.3) 18px, rgba(220,230,245,0.3) 20px,
        rgba(180,190,210,0.15) 20px, rgba(180,190,210,0.15) 38px
      ),
      linear-gradient(180deg, rgba(220,228,240,0.6) 0%, rgba(200,210,230,0.5) 100%)
    `,
    frontFace: `
      repeating-linear-gradient(90deg,
        rgba(160,175,200,0.2) 0px, rgba(160,175,200,0.2) 17px,
        rgba(210,220,240,0.6) 17px, rgba(210,220,240,0.6) 19px,
        rgba(160,175,200,0.2) 19px, rgba(160,175,200,0.2) 36px
      ),
      linear-gradient(90deg, rgba(20,30,50,0.95), rgba(30,45,70,0.9))
    `,
    edgeFace: `linear-gradient(180deg, #8898b0, #6878a0)`,
    sideColor: '#7888a8',
    realLabel: 'Pocket Spring Coils',
    description: 'Oil-tempered carbon steel, individually encased',
    accentColor: '#b0bcd8',
  },
  conv: {
    topFace: `
      repeating-linear-gradient(0deg,
        rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 3px,
        transparent 3px, transparent 10px,
        rgba(255,255,255,0.08) 10px, rgba(255,255,255,0.08) 13px,
        transparent 13px, transparent 20px
      ),
      linear-gradient(180deg, #90a0b0 0%, #7888a0 60%, #607090 100%)
    `,
    frontFace: `
      repeating-linear-gradient(0deg,
        rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 4px,
        rgba(60,80,100,0.6) 4px, rgba(60,80,100,0.6) 10px
      ),
      linear-gradient(90deg, #506070, #708090, #506070)
    `,
    edgeFace: `linear-gradient(180deg, #708090, #506070)`,
    sideColor: '#607080',
    realLabel: 'Convoluted Egg-Crate Foam',
    description: 'Sculpted wave surface, 35 kg/m³, air channeling',
    accentColor: '#90a8c0',
  },
  cnc: {
    topFace: `
      repeating-linear-gradient(90deg,
        rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 1px,
        transparent 1px, transparent 11px
      ),
      repeating-linear-gradient(0deg,
        rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 1px,
        transparent 1px, transparent 11px
      ),
      linear-gradient(180deg, #c0508c 0%, #a03870 60%, #802050 100%)
    `,
    frontFace: `
      repeating-linear-gradient(90deg,
        rgba(255,180,220,0.4) 0px, rgba(255,180,220,0.4) 1px,
        rgba(160,40,80,0.6) 1px, rgba(160,40,80,0.6) 11px
      ),
      repeating-linear-gradient(0deg,
        rgba(255,180,220,0.3) 0px, rgba(255,180,220,0.3) 1px,
        transparent 1px, transparent 11px
      ),
      linear-gradient(90deg, #802050 0%, #a03870 50%, #802050 100%)
    `,
    edgeFace: `linear-gradient(180deg, #a03870, #802050)`,
    sideColor: '#a03870',
    realLabel: 'CNC Precision Cut Foam',
    description: 'Robotically routed 3D grid, 45 kg/m³',
    accentColor: '#d070a8',
  },
  cold: {
    topFace: `
      radial-gradient(ellipse 16px 10px at 15px 10px, rgba(255,255,255,0.12) 0%, transparent 60%),
      radial-gradient(ellipse 12px 8px at 40px 15px, rgba(255,255,255,0.1) 0%, transparent 60%),
      linear-gradient(180deg, #20c8c0 0%, #10a8a0 60%, #008888 100%)
    `,
    frontFace: `
      radial-gradient(ellipse 10px 6px at 10px 7px, rgba(255,255,255,0.18) 0%, transparent 60%),
      radial-gradient(ellipse 8px 5px at 25px 5px, rgba(255,255,255,0.15) 0%, transparent 60%),
      linear-gradient(90deg, #008888 0%, #10a8a0 50%, #008888 100%)
    `,
    edgeFace: `linear-gradient(180deg, #10a8a0, #007878)`,
    sideColor: '#10a8a0',
    realLabel: 'Cold-Cure Molded Foam',
    description: '50 kg/m³ automotive-grade cold polymer',
    accentColor: '#40d8d0',
  },
  prof: {
    topFace: `
      repeating-linear-gradient(0deg,
        rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 4px,
        transparent 4px, transparent 12px
      ),
      linear-gradient(180deg, #60d8a0 0%, #40b880 60%, #209860 100%)
    `,
    frontFace: `
      repeating-linear-gradient(0deg,
        rgba(255,255,255,0.22) 0px, rgba(255,255,255,0.22) 4px,
        rgba(30,120,70,0.7) 4px, rgba(30,120,70,0.7) 12px
      ),
      linear-gradient(90deg, #209860 0%, #40b880 50%, #209860 100%)
    `,
    edgeFace: `linear-gradient(180deg, #40b880, #208060)`,
    sideColor: '#40b880',
    realLabel: 'Profile Wave Sheet',
    description: 'Serrated ridge surface, 28–32 kg/m³',
    accentColor: '#70e0b0',
  },
  pu: {
    topFace: `
      radial-gradient(ellipse 14px 10px at 12px 8px, rgba(255,255,255,0.1) 0%, transparent 60%),
      radial-gradient(ellipse 10px 8px at 35px 15px, rgba(255,255,255,0.08) 0%, transparent 60%),
      linear-gradient(180deg, #f0a080 0%, #d88060 60%, #c06040 100%)
    `,
    frontFace: `
      radial-gradient(ellipse 8px 5px at 10px 7px, rgba(255,255,255,0.15) 0%, transparent 60%),
      linear-gradient(90deg, #c06040 0%, #d88060 50%, #c06040 100%)
    `,
    edgeFace: `linear-gradient(180deg, #d88060, #b06040)`,
    sideColor: '#d08060',
    realLabel: 'Virgin P.U Foam',
    description: 'Pure polyol-isocyanate, 28 kg/m³',
    accentColor: '#f0a080',
  },
  sup: {
    topFace: `
      radial-gradient(ellipse 18px 12px at 15px 12px, rgba(255,255,255,0.12) 0%, transparent 60%),
      linear-gradient(180deg, #2888d8 0%, #1868b8 60%, #0848a0 100%)
    `,
    frontFace: `
      radial-gradient(ellipse 12px 8px at 12px 8px, rgba(255,255,255,0.15) 0%, transparent 60%),
      linear-gradient(90deg, #0848a0 0%, #1868b8 50%, #0848a0 100%)
    `,
    edgeFace: `linear-gradient(180deg, #1868b8, #0848a0)`,
    sideColor: '#1868b8',
    realLabel: 'HR Support Foam',
    description: '35–40 kg/m³, spinal neutrality core',
    accentColor: '#40a0e8',
  },
  ctr: {
    topFace: `
      linear-gradient(180deg, #c0c8d4 0%, #a8b0c0 60%, #9098a8 100%)
    `,
    frontFace: `
      linear-gradient(90deg, #9098a8 0%, #a8b0c0 50%, #9098a8 100%)
    `,
    edgeFace: `linear-gradient(180deg, #a8b0c0, #8898a8)`,
    sideColor: '#a8b0c0',
    realLabel: 'Ergo-Contour Divider',
    description: '32 kg/m³ damped transition pad',
    accentColor: '#c0c8d4',
  },
  base: {
    topFace: `
      repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 6px),
      repeating-linear-gradient(-45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 6px),
      linear-gradient(180deg, #48505a 0%, #30383f 60%, #1e2428 100%)
    `,
    frontFace: `
      repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 5px),
      repeating-linear-gradient(-45deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 5px),
      linear-gradient(90deg, #1e2428 0%, #30383f 50%, #1e2428 100%)
    `,
    edgeFace: `linear-gradient(180deg, #30383f, #1e2428)`,
    sideColor: '#282f35',
    realLabel: 'Anti-Slip Base Fabric',
    description: '260 GSM rubberized jacquard foundation',
    accentColor: '#606870',
  },
};

function getMaterial(key: string) {
  return REAL_MATERIALS[key] || REAL_MATERIALS['ctr'];
}

// ─── SPRING COILS SVG ─────────────────────────────────────────────────────────
const SpringCoilsSVG: React.FC<{ count?: number; height?: number }> = ({ count = 8, height = 60 }) => {
  const spacing = 280 / count;
  return (
    <svg viewBox={`0 0 280 ${height}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="steelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8898b8" />
          <stop offset="40%" stopColor="#c0cce0" />
          <stop offset="70%" stopColor="#d8e4f8" />
          <stop offset="100%" stopColor="#a0b0c8" />
        </linearGradient>
        <linearGradient id="pocketFabric" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(230,235,245,0.9)" />
          <stop offset="100%" stopColor="rgba(200,210,228,0.7)" />
        </linearGradient>
      </defs>
      {Array.from({ length: count }).map((_, i) => {
        const cx = spacing * i + spacing / 2;
        const cr = spacing * 0.36;
        const turns = 5;
        const stepH = (height - 8) / (turns * 2);
        // Coil path
        let d = `M ${cx - cr},${height - 4}`;
        for (let t = 0; t < turns * 2; t++) {
          const y = (height - 4) - stepH * (t + 1);
          const x = t % 2 === 0 ? cx + cr : cx - cr;
          d += ` Q ${cx + (t % 2 === 0 ? cr * 1.4 : -cr * 1.4)},${y + stepH * 0.5} ${x},${y}`;
        }
        return (
          <g key={i}>
            {/* Pocket fabric sleeve */}
            <rect x={cx - cr - 2} y={3} width={cr * 2 + 4} height={height - 6} rx="3"
              fill="url(#pocketFabric)" stroke="rgba(190,200,220,0.5)" strokeWidth="0.5" />
            {/* Ultrasonic seal lines */}
            <line x1={cx - cr - 2} y1={height / 2} x2={cx + cr + 2} y2={height / 2}
              stroke="rgba(160,175,200,0.4)" strokeWidth="0.5" />
            {/* Spring coil */}
            <path d={d} fill="none" stroke="url(#steelGrad)" strokeWidth="2.5" strokeLinecap="round" />
            {/* Top/bottom plates */}
            <ellipse cx={cx} cy={4} rx={cr} ry={1.5} fill="rgba(180,195,215,0.8)" />
            <ellipse cx={cx} cy={height - 4} rx={cr} ry={1.5} fill="rgba(180,195,215,0.8)" />
          </g>
        );
      })}
    </svg>
  );
};

// ─── LAYER SLAB COMPONENT (true 3D CSS box) ───────────────────────────────────
interface LayerSlabProps {
  layerKey: string;
  widthPx: number;
  heightPx: number; // thickness
  depthPx: number;  // depth (front-to-back)
  isSelected: boolean;
  isExploded: boolean;
  explodeGap: number;
  isCutaway: boolean;
  cutPercent: number; // 0-100, what % from left is cut away
  isBlueprint: boolean;
  onClick: () => void;
  language: 'en' | 'hi';
  index: number;
  total: number;
}

const LayerSlab: React.FC<LayerSlabProps> = ({
  layerKey, widthPx, heightPx, depthPx,
  isSelected, isExploded, explodeGap, isCutaway, cutPercent, isBlueprint,
  onClick, language, index, total,
}) => {
  const mat = getMaterial(layerKey);
  const info = LAYER_TYPES[layerKey];
  const isSpring = layerKey === 'spr';
  const isTopFab = layerKey === 'fab';

  const borderRadius = isTopFab
    ? '10px 10px 0 0'
    : index === total - 1 ? '0 0 4px 4px' : '0';

  const opacity = isExploded && !isSelected ? 0.6 : 1;
  const scale = isSelected ? 1.012 : 1;

  return (
    <div
      onClick={onClick}
      className="cursor-pointer relative transition-all duration-500"
      style={{
        width: widthPx,
        height: heightPx,
        opacity,
        transform: `scaleX(${scale})`,
        transformOrigin: 'center center',
        marginBottom: isExploded ? explodeGap : 0,
        transition: 'all 0.45s cubic-bezier(0.34,1.4,0.64,1)',
        position: 'relative',
        isolation: 'isolate',
      }}
    >
      {/* ── TOP FACE ── */}
      <div
        className="absolute inset-0"
        style={{
          background: isBlueprint
            ? 'rgba(8,20,60,0.95)'
            : mat.topFace,
          borderRadius,
          border: isBlueprint ? '1px dashed #3b82f6' : 'none',
          boxShadow: isSelected
            ? `0 0 0 2px #60a5fa, 0 0 20px rgba(96,165,250,0.4), inset 0 1px 0 rgba(255,255,255,0.3)`
            : index === 0
              ? 'inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.2)'
              : 'inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Springs visible on top */}
        {isSpring && !isBlueprint && (
          <div className="absolute inset-0" style={{ background: 'rgba(8,16,30,0.75)' }}>
            <SpringCoilsSVG count={8} height={heightPx} />
          </div>
        )}

        {/* Fabric quilt lines */}
        {isTopFab && !isBlueprint && (
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <defs>
              <pattern id="quiltPat" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M10,2 L18,10 L10,18 L2,10 Z" fill="none" stroke="rgba(160,150,135,0.5)" strokeWidth="0.6" />
                <circle cx="10" cy="10" r="1.5" fill="rgba(160,150,135,0.4)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#quiltPat)" />
          </svg>
        )}

        {/* Latex pinholes */}
        {layerKey === 'lat' && !isBlueprint && (
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <defs>
              <pattern id="latexPat" x="0" y="0" width="16" height="14" patternUnits="userSpaceOnUse">
                <circle cx="8" cy="7" r="3.5" fill="rgba(160,130,60,0.5)" stroke="rgba(140,110,40,0.4)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#latexPat)" />
          </svg>
        )}

        {/* CNC grid */}
        {layerKey === 'cnc' && !isBlueprint && (
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <defs>
              <pattern id="cncPat" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                <rect x="1" y="1" width="10" height="10" fill="none" stroke="rgba(255,200,230,0.3)" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cncPat)" />
          </svg>
        )}

        {/* 5-Zone stripes */}
        {layerKey === 'zone' && !isBlueprint && (
          <div className="absolute inset-0 flex">
            {['HEAD','SHOULDER','LUMBAR','HIP','LEGS'].map((z, zi) => (
              <div key={z} className="flex-1 flex items-center justify-center border-r last:border-r-0 border-blue-400/20"
                style={{
                  background: zi % 2 === 0 ? 'rgba(80,110,200,0.25)' : 'rgba(50,80,170,0.15)',
                }}>
                <span className="text-blue-200/50 text-[6px] font-bold tracking-wider writing-mode-vertical"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                  {z}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Cutaway reveal */}
        {isCutaway && cutPercent > 0 && (
          <div className="absolute top-0 bottom-0 overflow-hidden" style={{
            right: 0,
            width: `${cutPercent}%`,
          }}>
            {/* Cut interior */}
            <div className="absolute inset-0" style={{ background: mat.frontFace }}>
              {isSpring && (
                <div className="absolute inset-0">
                  <SpringCoilsSVG count={4} height={heightPx} />
                </div>
              )}
              {layerKey === 'lat' && (
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <pattern id="latexCut" x="0" y="0" width="14" height="12" patternUnits="userSpaceOnUse">
                      <circle cx="7" cy="6" r="3" fill="rgba(140,110,40,0.6)" stroke="rgba(120,90,20,0.5)" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#latexCut)" />
                </svg>
              )}
              {/* Cut face edge line */}
              <div className="absolute left-0 top-0 bottom-0 w-[2px]"
                style={{ background: `linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.1))` }} />
            </div>
          </div>
        )}

        {/* Blueprint label */}
        {isBlueprint && (
          <div className="absolute inset-0 flex items-center px-3 gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-blue-300 font-mono text-xs font-bold truncate">{mat.realLabel}</div>
              <div className="text-blue-500 font-mono text-[9px]">{info?.defaultThicknessCm}cm · {info?.materialTech?.density}</div>
            </div>
            {info && (
              <div className="text-blue-400 font-mono text-[8px] text-right flex-shrink-0">
                <div className="text-blue-300 font-bold">{info.benefits.pressureScore}/100</div>
                <div className="opacity-60">Score</div>
              </div>
            )}
          </div>
        )}

        {/* Layer name label */}
        {!isBlueprint && heightPx >= 20 && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <span className="text-white/85 text-[10px] font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]
              leading-tight text-right">
              {language === 'hi' && info?.title[1] ? info.title[1] : (info?.title[0] || mat.realLabel)}
            </span>
          </div>
        )}

        {/* Selected highlight */}
        {isSelected && (
          <div className="absolute inset-0 ring-2 ring-inset ring-blue-400/60 rounded-[inherit] pointer-events-none" />
        )}
      </div>

      {/* ── BOTTOM SHADOW SEPARATOR ── */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px]"
        style={{ background: 'rgba(0,0,0,0.5)', zIndex: 2 }} />

      {/* ── TOP HIGHLIGHT ── */}
      <div className="absolute top-0 left-0 right-0 h-[1px]"
        style={{ background: 'rgba(255,255,255,0.18)', zIndex: 2 }} />
    </div>
  );
};

// ─── ISOLATED LAYER 3D VIEWER ─────────────────────────────────────────────────
const IsolatedLayerViewer: React.FC<{
  layerKey: string;
  label: string;
  onClose: () => void;
}> = ({ layerKey, label, onClose }) => {
  const [rotateY, setRotateY] = useState(-25);
  const [rotateX, setRotateX] = useState(15);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; ry: number; rx: number } | null>(null);
  const animRef = useRef<number>(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const angleRef = useRef(-25);

  const mat = getMaterial(layerKey);
  const info = LAYER_TYPES[layerKey];
  const isSpring = layerKey === 'spr';

  // Auto-rotate animation
  useEffect(() => {
    if (!autoRotate) { cancelAnimationFrame(animRef.current); return; }
    const animate = () => {
      angleRef.current -= 0.4;
      setRotateY(angleRef.current);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [autoRotate]);

  const onMouseDown = (e: React.MouseEvent) => {
    setAutoRotate(false);
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ry: rotateY, rx: rotateX };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setRotateY(dragStart.current.ry + dx * 0.6);
    setRotateX(Math.max(-40, Math.min(40, dragStart.current.rx - dy * 0.4)));
  };
  const onMouseUp = () => setIsDragging(false);

  // Touch support
  const onTouchStart = (e: React.TouchEvent) => {
    setAutoRotate(false);
    setIsDragging(true);
    const t = e.touches[0];
    dragStart.current = { x: t.clientX, y: t.clientY, ry: rotateY, rx: rotateX };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !dragStart.current) return;
    const t = e.touches[0];
    const dx = t.clientX - dragStart.current.x;
    const dy = t.clientY - dragStart.current.y;
    setRotateY(dragStart.current.ry + dx * 0.6);
    setRotateX(Math.max(-40, Math.min(40, dragStart.current.rx - dy * 0.4)));
  };

  // 3D slab dimensions
  const W = 260, H = 70, D = 120;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}>
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl border border-slate-700/60
        shadow-2xl overflow-hidden max-w-2xl w-[95vw]"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-3 border-b border-slate-800/60">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-3 h-3 rounded-full" style={{ background: mat.accentColor }} />
              <span className="text-slate-400 text-[11px] uppercase tracking-widest font-mono">Layer Isolated View</span>
            </div>
            <h3 className="text-white font-bold text-lg">{mat.realLabel}</h3>
            <p className="text-slate-400 text-xs mt-0.5">{mat.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setAutoRotate(!autoRotate)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                autoRotate
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}>
              {autoRotate ? '⟳ Auto' : '✋ Manual'}
            </button>
            <button onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700/50">
              ✕
            </button>
          </div>
        </div>

        {/* 3D Spin Viewer */}
        <div
          className="relative flex items-center justify-center overflow-hidden select-none"
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            height: 300,
            background: 'radial-gradient(ellipse at center, rgba(30,50,100,0.4) 0%, transparent 70%)',
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onMouseUp}
        >
          {/* Lighting ring */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(255,255,255,0.03), transparent)' }} />

          {/* Drag hint */}
          {!isDragging && autoRotate && (
            <div className="absolute bottom-3 left-0 right-0 text-center text-slate-500 text-[10px] pointer-events-none">
              Drag to rotate manually
            </div>
          )}

          {/* 3D CSS box */}
          <div style={{
            perspective: '900px',
            perspectiveOrigin: '50% 50%',
          }}>
            <div style={{
              width: W,
              height: H,
              position: 'relative',
              transformStyle: 'preserve-3d',
              transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            }}>
              {/* TOP FACE */}
              <div style={{
                position: 'absolute', width: W, height: D,
                transform: `rotateX(90deg) translateZ(${H / 2}px) translateY(${-D / 2}px)`,
                background: mat.topFace,
                overflow: 'hidden',
                borderRadius: '8px 8px 0 0',
              }}>
                {isSpring && <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,15,30,0.7)' }}><SpringCoilsSVG count={6} height={D} /></div>}
                {layerKey === 'fab' && (
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
                    <defs><pattern id="qt" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M10,1 L19,10 L10,19 L1,10 Z" fill="none" stroke="rgba(160,148,130,0.6)" strokeWidth="0.7" />
                    </pattern></defs>
                    <rect width="100%" height="100%" fill="url(#qt)" />
                  </svg>
                )}
                {layerKey === 'lat' && (
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
                    <defs><pattern id="lt" x="0" y="0" width="18" height="16" patternUnits="userSpaceOnUse">
                      <circle cx="9" cy="8" r="4" fill="rgba(160,130,60,0.5)" stroke="rgba(140,110,40,0.4)" strokeWidth="0.6" />
                    </pattern></defs>
                    <rect width="100%" height="100%" fill="url(#lt)" />
                  </svg>
                )}
                {/* Top highlight */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }} />
              </div>

              {/* FRONT FACE (cut cross-section — most detailed) */}
              <div style={{
                position: 'absolute', width: W, height: H,
                transform: `translateZ(${D / 2}px)`,
                background: mat.frontFace,
                overflow: 'hidden',
                boxShadow: 'inset -8px 0 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
              }}>
                {isSpring && <div style={{ position: 'absolute', inset: 0 }}><SpringCoilsSVG count={8} height={H} /></div>}
                {layerKey === 'lat' && (
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
                    <defs><pattern id="latF" x="0" y="0" width="16" height="14" patternUnits="userSpaceOnUse">
                      <circle cx="8" cy="7" r="3.5" fill="rgba(150,120,50,0.65)" stroke="rgba(130,100,30,0.5)" strokeWidth="0.6" />
                    </pattern></defs>
                    <rect width="100%" height="100%" fill="url(#latF)" />
                  </svg>
                )}
                {layerKey === 'cnc' && (
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
                    <defs><pattern id="cncF" x="0" y="0" width="11" height="11" patternUnits="userSpaceOnUse">
                      <rect x="1" y="1" width="9" height="9" fill="none" stroke="rgba(255,180,220,0.4)" strokeWidth="0.8" />
                    </pattern></defs>
                    <rect width="100%" height="100%" fill="url(#cncF)" />
                  </svg>
                )}
                {layerKey === 'reb' && (
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
                    {[
                      {x:12,y:8,w:28,h:14,c:'rgba(70,180,120,0.9)',a:-12},
                      {x:48,y:5,w:22,h:11,c:'rgba(50,120,200,0.85)',a:8},
                      {x:80,y:10,w:30,h:12,c:'rgba(230,160,30,0.85)',a:-5},
                      {x:120,y:6,w:25,h:13,c:'rgba(200,60,60,0.8)',a:15},
                      {x:155,y:9,w:28,h:11,c:'rgba(80,160,80,0.85)',a:-8},
                      {x:195,y:5,w:22,h:14,c:'rgba(100,80,200,0.8)',a:6},
                      {x:228,y:8,w:24,h:12,c:'rgba(220,100,50,0.85)',a:-10},
                      {x:20,y:30,w:30,h:12,c:'rgba(50,150,220,0.8)',a:10},
                      {x:60,y:28,w:24,h:14,c:'rgba(200,160,30,0.85)',a:-6},
                      {x:98,y:32,w:28,h:11,c:'rgba(80,200,100,0.8)',a:12},
                      {x:140,y:28,w:22,h:13,c:'rgba(220,80,80,0.8)',a:-9},
                      {x:175,y:30,w:30,h:12,c:'rgba(100,120,210,0.8)',a:7},
                      {x:218,y:28,w:26,h:14,c:'rgba(180,120,40,0.85)',a:-11},
                      {x:8,y:50,w:28,h:12,c:'rgba(60,180,120,0.85)',a:8},
                      {x:50,y:48,w:24,h:13,c:'rgba(220,140,30,0.8)',a:-7},
                      {x:88,y:52,w:30,h:11,c:'rgba(100,70,200,0.8)',a:12},
                      {x:130,y:50,w:22,h:14,c:'rgba(200,80,60,0.85)',a:-5},
                      {x:165,y:48,w:28,h:12,c:'rgba(50,160,100,0.8)',a:9},
                      {x:205,y:52,w:26,h:13,c:'rgba(180,120,220,0.75)',a:-8},
                      {x:243,y:50,w:20,h:11,c:'rgba(230,160,40,0.8)',a:6},
                    ].map((chip, ci) => (
                      <rect key={ci} x={chip.x} y={chip.y} width={chip.w} height={chip.h} rx="2"
                        fill={chip.c} transform={`rotate(${chip.a},${chip.x+chip.w/2},${chip.y+chip.h/2})`} />
                    ))}
                  </svg>
                )}
                {layerKey === 'fab' && (
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
                    <defs><pattern id="qF" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M10,1 L19,10 L10,19 L1,10 Z" fill="none" stroke="rgba(180,165,145,0.5)" strokeWidth="0.7" />
                    </pattern></defs>
                    <rect width="100%" height="100%" fill="url(#qF)" />
                  </svg>
                )}
                {/* Top edge highlight on front face */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.15))' }} />
              </div>

              {/* BACK FACE */}
              <div style={{
                position: 'absolute', width: W, height: H,
                transform: `translateZ(${-D / 2}px) rotateY(180deg)`,
                background: mat.edgeFace,
              }} />

              {/* RIGHT FACE (border tape) */}
              <div style={{
                position: 'absolute', width: D, height: H,
                transform: `rotateY(90deg) translateZ(${W / 2}px)`,
                background: mat.edgeFace,
                overflow: 'hidden',
                boxShadow: 'inset -4px 0 12px rgba(0,0,0,0.4)',
              }}>
                {/* Border tape texture */}
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 8px)',
                }} />
              </div>

              {/* LEFT FACE */}
              <div style={{
                position: 'absolute', width: D, height: H,
                transform: `rotateY(-90deg) translateZ(${W / 2}px)`,
                background: mat.edgeFace,
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 8px)',
                }} />
              </div>

              {/* BOTTOM FACE */}
              <div style={{
                position: 'absolute', width: W, height: D,
                transform: `rotateX(-90deg) translateZ(${H / 2}px) translateY(${D / 2}px)`,
                background: mat.edgeFace,
              }} />
            </div>
          </div>
        </div>

        {/* Material specs */}
        <div className="p-4 border-t border-slate-800/60 grid grid-cols-3 gap-3">
          {info && [
            { label: 'Density', value: info.materialTech.density },
            { label: 'Cell Type', value: info.materialTech.cellStructure },
            { label: 'Breathability', value: info.materialTech.breathability.slice(0, 25) + '…' },
          ].map(s => (
            <div key={s.label} className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/50">
              <div className="text-slate-500 text-[9px] uppercase tracking-wider">{s.label}</div>
              <div className="text-slate-200 text-[11px] font-semibold mt-1 leading-snug">{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── BED FRAME ────────────────────────────────────────────────────────────────
const RealBedFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative flex flex-col items-center w-full">
    {/* Headboard */}
    <div className="w-[88%] relative mb-0.5"
      style={{ height: 72, background: 'linear-gradient(180deg,#8B6534 0%,#6B4A20 55%,#4E3010 100%)',
        borderRadius: '16px 16px 4px 4px',
        boxShadow: '0 6px 24px rgba(0,0,0,0.6), inset 0 2px 6px rgba(255,220,160,0.12)' }}>
      {/* Wood grain lines */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        {[8,20,35,50,65,80,92].map(p => (
          <line key={p} x1={`${p}%`} y1="0" x2={`${p+1}%`} y2="100%"
            stroke="rgba(50,20,0,0.25)" strokeWidth="1.5" />
        ))}
        {/* Decorative panel inset */}
        <rect x="10%" y="12%" width="80%" height="76%" rx="8"
          fill="none" stroke="rgba(180,130,60,0.3)" strokeWidth="1.5" />
        <rect x="13%" y="18%" width="74%" height="64%" rx="6"
          fill="none" stroke="rgba(180,130,60,0.2)" strokeWidth="1" />
      </svg>
      {/* Top rail highlight */}
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
        style={{ background: 'linear-gradient(90deg,rgba(255,210,130,0.0),rgba(255,210,130,0.25),rgba(255,210,130,0.0))' }} />
    </div>

    {/* Mattress platform (the actual stack) */}
    <div className="w-[90%] relative z-10">{children}</div>

    {/* Bed base / divan */}
    <div className="w-[92%] relative overflow-hidden"
      style={{ height: 36, marginTop: 1,
        background: 'linear-gradient(180deg,#5A3A18 0%,#3E2508 70%,#2A1600 100%)',
        borderRadius: '0 0 8px 8px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.7)' }}>
      {/* Divan slat lines */}
      {[12,26,42,58,74,88].map(p => (
        <div key={p} className="absolute top-2 bottom-2 rounded-sm"
          style={{ left: `${p}%`, width: '10%', background: 'rgba(90,60,20,0.5)',
            boxShadow: '1px 0 0 rgba(0,0,0,0.3)' }} />
      ))}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg,rgba(255,180,80,0.08),transparent)' }} />
    </div>

    {/* Legs */}
    <div className="flex justify-between" style={{ width: '84%', marginTop: 0 }}>
      {[0,1,2,3].map(i => (
        <div key={i} style={{ width: 20, height: 44,
          background: 'linear-gradient(180deg,#3E2508,#1A0C00)',
          borderRadius: '0 0 5px 5px',
          boxShadow: '0 6px 16px rgba(0,0,0,0.6), 2px 0 4px rgba(0,0,0,0.3)' }} />
      ))}
    </div>

    {/* Floor shadow */}
    <div style={{ width: '80%', height: 10, marginTop: 2,
      background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, transparent 70%)',
      borderRadius: '50%' }} />
  </div>
);

// ─── MAIN MATTRESS VISUALIZER ─────────────────────────────────────────────────
export const MattressVisualizer: React.FC = () => {
  const {
    mode, selectedModelIndex, selectedLayerIndex, setSelectedLayerIndex,
    cutawaySlice, setCutawaySlice, language,
  } = useShowroomStore();

  const [isolatedLayer, setIsolatedLayer] = useState<{ key: string; label: string } | null>(null);
  const currentModel = MATTRESS_MODELS[selectedModelIndex];
  const layers = currentModel.layers;

  const BASE_PX_PER_CM = 16;
  const layerPxHeights = layers.map(([key]) => {
    const info = LAYER_TYPES[key];
    return Math.max(24, (info?.defaultThicknessCm || 3) * BASE_PX_PER_CM);
  });

  const MATTRESS_WIDTH = 480;
  const MATTRESS_DEPTH = 110;

  const isExploded = mode === 'layers';
  const isCutaway = mode === 'cutaway';
  const isBlueprint = mode === 'blueprint';
  const isSleepTest = mode === 'sleeptest';

  const cutPercent = isCutaway ? Math.round(((cutawaySlice + 10) / 20) * 60 + 15) : 0;

  const handleLayerClick = (i: number) => {
    if (selectedLayerIndex === i) {
      setSelectedLayerIndex(-1);
    } else {
      setSelectedLayerIndex(i);
    }
  };

  return (
    <div className="flex w-full h-full overflow-hidden">
      {/* ── CENTER: 3D Mattress View ── */}
      <div className={`relative flex flex-col items-center justify-center transition-all duration-500 overflow-hidden
        ${(selectedLayerIndex >= 0 || isSleepTest) ? 'w-[58%]' : 'w-[65%]'}`}
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 55%, #111f38 0%, #080e1c 60%, #04080f 100%)' }}>

        {/* Subtle spotlight */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(255,255,255,0.025) 0%, transparent 70%)' }} />

        {/* Floor glow */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, transparent, rgba(30,60,120,0.06))' }} />

        {/* Mode label */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <span className="text-slate-500 text-[11px] font-mono uppercase tracking-widest">
            {mode === 'real' ? '◆ Real View' : mode === 'layers' ? '◆ Layer Explode'
              : mode === 'cutaway' ? '◆ Cross-Section' : mode === 'blueprint' ? '◆ Blueprint' : '◆ Sleep Test'}
          </span>
          {isCutaway && (
            <span className="bg-blue-900/50 text-blue-300 text-[10px] px-2 py-0.5 rounded-full border border-blue-700/50">
              {cutPercent}% revealed
            </span>
          )}
        </div>

        {/* Mattress 3D scene */}
        <div className="relative z-10 w-full px-4 flex flex-col items-center justify-center"
          style={{
            perspective: '1100px',
            perspectiveOrigin: '50% 48%',
            marginTop: isExploded ? '-60px' : 0,
            transition: 'margin-top 0.5s',
          }}>
          <div style={{
            transform: 'rotateX(22deg) rotateY(-10deg)',
            transformStyle: 'preserve-3d',
            transformOrigin: 'center center',
          }}>
            {!isSleepTest ? (
              <RealBedFrame>
                {/* Layer stack — built bottom to top (index 0 = top layer, so we reverse render) */}
                <div className="flex flex-col" style={{ gap: 0 }}>
                  {layers.map(([key, label], i) => (
                    <div key={`${selectedModelIndex}-${i}`}
                      style={{
                        marginBottom: isExploded ? 20 : 0,
                        transition: 'margin-bottom 0.45s cubic-bezier(0.34,1.4,0.64,1)',
                        position: 'relative',
                      }}>
                      <LayerSlab
                        layerKey={key}
                        widthPx={MATTRESS_WIDTH}
                        heightPx={layerPxHeights[i]}
                        depthPx={MATTRESS_DEPTH}
                        isSelected={selectedLayerIndex === i}
                        isExploded={isExploded}
                        explodeGap={18}
                        isCutaway={isCutaway}
                        cutPercent={cutPercent}
                        isBlueprint={isBlueprint}
                        onClick={() => handleLayerClick(i)}
                        language={language}
                        index={i}
                        total={layers.length}
                      />
                      {/* Explode gap label */}
                      {isExploded && i < layers.length - 1 && (
                        <div className="absolute -bottom-5 right-0 left-0 flex items-center justify-end pr-2 pointer-events-none">
                          <div className="h-px flex-1 bg-blue-800/30" />
                          <span className="text-blue-600/50 text-[9px] font-mono px-1">
                            {LAYER_TYPES[layers[i+1][0]]?.defaultThicknessCm}cm ↓
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </RealBedFrame>
            ) : (
              /* Sleep Test mode — show mattress flat */
              <RealBedFrame>
                <div className="flex flex-col" style={{ gap: 0 }}>
                  {layers.map(([key, label], i) => (
                    <LayerSlab
                      key={`st-${i}`}
                      layerKey={key}
                      widthPx={MATTRESS_WIDTH}
                      heightPx={layerPxHeights[i]}
                      depthPx={MATTRESS_DEPTH}
                      isSelected={false}
                      isExploded={false}
                      explodeGap={0}
                      isCutaway={false}
                      cutPercent={0}
                      isBlueprint={false}
                      onClick={() => {}}
                      language={language}
                      index={i}
                      total={layers.length}
                    />
                  ))}
                </div>
              </RealBedFrame>
            )}
          </div>
        </div>

        {/* Cutaway slider */}
        {isCutaway && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20
            bg-slate-900/95 backdrop-blur-xl rounded-2xl px-5 py-3 border border-slate-700/40 shadow-xl">
            <div className="text-blue-400 text-[11px] font-mono mb-2 text-center uppercase tracking-wider">
              Cross-Section Depth
            </div>
            <input type="range" min={-10} max={10} step={0.5}
              value={cutawaySlice}
              onChange={e => setCutawaySlice(Number(e.target.value))}
              className="w-52 accent-blue-500" />
            <div className="flex justify-between text-slate-600 text-[9px] mt-1 font-mono">
              <span>Closed</span><span>Open</span>
            </div>
          </div>
        )}

        {/* Click hint */}
        {mode !== 'sleeptest' && selectedLayerIndex < 0 && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-slate-500 text-[11px]">Click any layer to explore • Switch to Layer Explode for full breakdown</span>
          </div>
        )}

        {/* Mode bar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
          <ModeBar />
        </div>
      </div>

      {/* ── RIGHT: Layer List + Deep Dive ── */}
      <div className={`flex flex-col h-full border-l border-slate-800/60 overflow-hidden transition-all duration-500
        ${(selectedLayerIndex >= 0 || isSleepTest) ? 'w-[42%]' : 'w-[35%]'}`}>

        {/* Layer list sidebar */}
        {(isExploded || selectedLayerIndex >= 0) && !isSleepTest && (
          <div className="border-b border-slate-800/50 overflow-y-auto flex-shrink-0" style={{ maxHeight: '45%' }}>
            <div className="px-3 py-2 flex items-center justify-between">
              <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-widest">
                {layers.length} Layers
              </span>
              <span className="text-slate-600 text-[10px]">{currentModel.name}</span>
            </div>
            <div className="flex flex-col gap-0.5 px-2 pb-2">
              {layers.map(([key, label], i) => {
                const mat = getMaterial(key);
                const info = LAYER_TYPES[key];
                const isActive = selectedLayerIndex === i;
                return (
                  <div key={i} className={`flex items-center gap-2 px-2.5 py-2 rounded-xl cursor-pointer transition-all group ${
                    isActive ? 'bg-blue-600/15 ring-1 ring-blue-500/40' : 'hover:bg-slate-800/60'
                  }`}
                    onClick={() => handleLayerClick(i)}>
                    {/* Real material swatch */}
                    <div className="w-7 h-7 rounded-lg flex-shrink-0 shadow-md overflow-hidden border border-white/10"
                      style={{ background: mat.topFace }}>
                      {key === 'spr' && (
                        <div className="w-full h-full" style={{ background: 'rgba(10,18,34,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg viewBox="0 0 20 20" className="w-4 h-4">
                            <path d="M10,2 Q14,5 10,8 Q6,11 10,14 Q14,17 10,18" fill="none" stroke="#b0bcd8" strokeWidth="1.5" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-[11px] font-semibold leading-tight truncate">
                        {info?.title[language === 'hi' ? 1 : 0] || mat.realLabel}
                      </div>
                      <div className="text-slate-500 text-[9px] truncate">{info?.defaultThicknessCm}cm · {info?.materialTech?.density?.split(' ')[0]}</div>
                    </div>
                    {/* Isolated view button */}
                    <button
                      onClick={e => { e.stopPropagation(); setIsolatedLayer({ key, label }); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg bg-slate-700 hover:bg-blue-700 text-slate-300 hover:text-white transition-all text-[10px]"
                      title="View layer in 3D">
                      ⟳
                    </button>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Deep dive or pressure panel */}
        <div className="flex-1 overflow-y-auto">
          {isSleepTest ? <BodyPressureView /> : <LayerDeepDive />}
        </div>
      </div>

      {/* ── ISOLATED LAYER 3D VIEWER MODAL ── */}
      {isolatedLayer && (
        <IsolatedLayerViewer
          layerKey={isolatedLayer.key}
          label={isolatedLayer.label}
          onClose={() => setIsolatedLayer(null)}
        />
      )}
    </div>
  );
};
