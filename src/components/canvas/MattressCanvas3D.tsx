import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useShowroomStore } from '../../store/showroomStore';
import { MATTRESS_MODELS } from '../../data/mattresses';
import { LAYER_TYPES } from '../../data/layerTypes';

interface MattressCanvas3DProps {
  isIsolatedMode?: boolean;
  isolatedLayerKey?: string;
  isRealView?: boolean;
  cameraPreset?: number; // 0: Iso, 1: Assembled, 2: Corner, 3: Top
  onLayerClick?: (index: number, key: string) => void;
  hoveredLayerIndex?: number;
  setHoveredLayerIndex?: (idx: number) => void;
  onLayerPositionsUpdate?: (positions: { index: number; y: number; xRight: number }[]) => void;
  autoRotate?: boolean;
  zoomLevel?: number;
}

export const MattressCanvas3D: React.FC<MattressCanvas3DProps> = ({
  isIsolatedMode = false,
  isolatedLayerKey,
  isRealView = false,
  cameraPreset = 0,
  onLayerClick,
  hoveredLayerIndex = -1,
  setHoveredLayerIndex,
  onLayerPositionsUpdate,
  autoRotate = true,
  zoomLevel = 1.0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { selectedModelIndex } = useShowroomStore();

  const currentModel = MATTRESS_MODELS[selectedModelIndex] || MATTRESS_MODELS[0];
  const layers = currentModel.layers;

  // Rotation angles (in radians)
  // Default isometric view angle: ~36 degrees (0.63 rad)
  const [rotAngle, setRotAngle] = useState<number>(0.65);
  const [pitchAngle, setPitchAngle] = useState<number>(0.38); // tilt angle
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const isDraggingRef = useRef<boolean>(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameRef = useRef<number>(0);
  const autoRotateSpeed = useRef<number>(0.003);

  // Preset cameras
  useEffect(() => {
    if (cameraPreset === 0) {
      // Isometric 3D
      setRotAngle(0.65);
      setPitchAngle(0.38);
      setPanOffset({ x: 0, y: 0 });
    } else if (cameraPreset === 1) {
      // Flat front-side profile
      setRotAngle(0.25);
      setPitchAngle(0.22);
      setPanOffset({ x: 0, y: 15 });
    } else if (cameraPreset === 2) {
      // Corner close-up
      setRotAngle(0.85);
      setPitchAngle(0.45);
      setPanOffset({ x: -20, y: -10 });
    } else if (cameraPreset === 3) {
      // Top macro view
      setRotAngle(0.65);
      setPitchAngle(0.72);
      setPanOffset({ x: 0, y: 20 });
    }
  }, [cameraPreset]);

  // Handle Drag / Touch
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) {
      // Check hit testing for hover
      return;
    }
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    setRotAngle((prev) => prev + dx * 0.008);
    setPitchAngle((prev) => Math.max(0.18, Math.min(0.85, prev - dy * 0.005)));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  // Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localRot = rotAngle;
    let localPitch = pitchAngle;

    const render = () => {
      if (autoRotate && !isDraggingRef.current) {
        localRot += autoRotateSpeed.current;
        setRotAngle(localRot);
      } else {
        localRot = rotAngle;
      }
      localPitch = pitchAngle;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Center point of canvas
      const centerX = width * 0.44 + panOffset.x;
      const centerY = height * 0.52 + panOffset.y;

      const scale = Math.min(width / 950, height / 680) * zoomLevel * (isIsolatedMode ? 1.45 : 1.05);

      // Draw Glowing Turntable Pedestal
      drawTurntable(ctx, centerX, centerY + (isIsolatedMode ? 85 : 175) * scale, scale, localRot);

      // Render layers
      if (isIsolatedMode && isolatedLayerKey) {
        // Single Layer 3D View
        drawSingleLayer(ctx, centerX, centerY, scale, localRot, localPitch, isolatedLayerKey);
      } else {
        // Full Exploded or Assembled Stack
        drawMattressStack(ctx, centerX, centerY, scale, localRot, localPitch, layers, isRealView, hoveredLayerIndex);
      }

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [
    rotAngle,
    pitchAngle,
    panOffset,
    layers,
    isIsolatedMode,
    isolatedLayerKey,
    isRealView,
    hoveredLayerIndex,
    autoRotate,
    zoomLevel,
  ]);

  // ─── DRAW TURNTABLE ────────────────────────────────────────────────────────
  const drawTurntable = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    scale: number,
    rot: number
  ) => {
    const rx = 360 * scale;
    const ry = 110 * scale;

    ctx.save();

    // 1. Soft Floor Glow & Ambient Shadow
    const floorGlow = ctx.createRadialGradient(cx, cy, rx * 0.2, cx, cy, rx * 1.3);
    floorGlow.addColorStop(0, 'rgba(0, 162, 255, 0.12)');
    floorGlow.addColorStop(0.5, 'rgba(14, 116, 244, 0.05)');
    floorGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = floorGlow;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 15 * scale, rx * 1.3, ry * 1.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Base Pedestal Cylinder Bottom Edge
    ctx.beginPath();
    ctx.ellipse(cx, cy + 12 * scale, rx, ry, 0, 0, Math.PI);
    ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, 0, true);
    ctx.closePath();
    const pedestalSideGrad = ctx.createLinearGradient(cx - rx, cy, cx + rx, cy);
    pedestalSideGrad.addColorStop(0, '#0c1524');
    pedestalSideGrad.addColorStop(0.3, '#1a2a44');
    pedestalSideGrad.addColorStop(0.5, '#2e456b');
    pedestalSideGrad.addColorStop(0.7, '#1a2a44');
    pedestalSideGrad.addColorStop(1, '#0c1524');
    ctx.fillStyle = pedestalSideGrad;
    ctx.fill();

    // 3. Glowing Neon Cyan Edge Ring
    ctx.shadowColor = '#00d2ff';
    ctx.shadowBlur = 24 * scale;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3.5 * scale;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Inner bright neon rim
    ctx.shadowBlur = 8 * scale;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2 * scale;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 4. Glass Turntable Top Surface
    ctx.shadowBlur = 0;
    const discGrad = ctx.createRadialGradient(cx, cy - 20 * scale, 10 * scale, cx, cy, rx);
    discGrad.addColorStop(0, 'rgba(25, 42, 70, 0.7)');
    discGrad.addColorStop(0.7, 'rgba(11, 20, 36, 0.85)');
    discGrad.addColorStop(1, 'rgba(5, 10, 20, 0.95)');
    ctx.fillStyle = discGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5. 360° Indicator in front of turntable
    const textY = cy + ry + 24 * scale;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = `bold ${Math.round(13 * scale)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('360°', cx, textY);

    // Left & Right Curved Rotation Arrows
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2 * scale;
    ctx.lineCap = 'round';

    // Left curved arc
    ctx.beginPath();
    ctx.arc(cx - 38 * scale, textY, 14 * scale, 0.6 * Math.PI, 1.4 * Math.PI, false);
    ctx.stroke();
    // Left arrowhead
    ctx.beginPath();
    ctx.moveTo(cx - 43 * scale, textY - 8 * scale);
    ctx.lineTo(cx - 49 * scale, textY - 14 * scale);
    ctx.lineTo(cx - 39 * scale, textY - 14 * scale);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();

    // Right curved arc
    ctx.beginPath();
    ctx.arc(cx + 38 * scale, textY, 14 * scale, 1.6 * Math.PI, 0.4 * Math.PI, false);
    ctx.stroke();
    // Right arrowhead
    ctx.beginPath();
    ctx.moveTo(cx + 43 * scale, textY + 8 * scale);
    ctx.lineTo(cx + 49 * scale, textY + 14 * scale);
    ctx.lineTo(cx + 39 * scale, textY + 14 * scale);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();

    ctx.restore();
  };

  // ─── DRAW FULL MATTRESS STACK ──────────────────────────────────────────────
  const drawMattressStack = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    scale: number,
    rot: number,
    pitch: number,
    layerList: [string, string][],
    realView: boolean,
    hoveredIdx: number
  ) => {
    const W = 280 * scale; // Width along X
    const L = 220 * scale; // Length along Y

    // Projection vectors
    const cosR = Math.cos(rot);
    const sinR = Math.sin(rot);

    // Isometric screen projection
    const vxX = W * cosR;
    const vxY = W * sinR * pitch;
    const vyX = -L * sinR;
    const vyY = L * cosR * pitch;

    // Layer thicknesses in px
    const layerThicknesses = layerList.map(([key]) => {
      if (key === 'spr') return 52 * scale;
      if (key === 'fab') return 36 * scale;
      if (key === 'soft' || key === 'lat') return 28 * scale;
      if (key === 'gel') return 24 * scale;
      if (key === 'hr') return 26 * scale;
      if (key === 'felt') return 12 * scale;
      return 20 * scale;
    });

    // Vertical spacing
    const explodeGap = realView ? 0 : 34 * scale;
    const totalHeight = layerThicknesses.reduce((a, b) => a + b, 0) + (layerList.length - 1) * explodeGap;

    let currentY = cy - totalHeight * 0.42;

    const layerPositions: { index: number; y: number; xRight: number }[] = [];

    // Render layers from bottom to top so upper layers sit on top of lower ones
    for (let i = layerList.length - 1; i >= 0; i--) {
      const [key, label] = layerList[i];
      const th = layerThicknesses[i];
      const isHovered = hoveredIdx === i;

      // Slight lift on hover
      const hoverLift = isHovered && !realView ? -8 * scale : 0;
      const layerCenterY = currentY + hoverLift;

      // Draw single layer at this height
      drawLayerSlab(
        ctx,
        cx,
        layerCenterY,
        vxX,
        vxY,
        vyX,
        vyY,
        th,
        key,
        scale,
        isHovered,
        realView && i === 0 // is pillow top
      );

      // Track rightmost anchor point for callout line
      const rightX = cx + vxX;
      const rightY = layerCenterY + vxY + th * 0.5;
      layerPositions.unshift({ index: i, y: rightY, xRight: rightX });

      currentY += th + explodeGap;
    }

    if (onLayerPositionsUpdate) {
      onLayerPositionsUpdate(layerPositions);
    }
  };

  // ─── DRAW SINGLE LAYER (ISOLATED VIEW) ──────────────────────────────────────
  const drawSingleLayer = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    scale: number,
    rot: number,
    pitch: number,
    key: string
  ) => {
    const W = 320 * scale;
    const L = 240 * scale;
    const th = key === 'spr' ? 65 * scale : key === 'fab' ? 46 * scale : 34 * scale;

    const cosR = Math.cos(rot);
    const sinR = Math.sin(rot);

    const vxX = W * cosR;
    const vxY = W * sinR * pitch;
    const vyX = -L * sinR;
    const vyY = L * cosR * pitch;

    drawLayerSlab(ctx, cx, cy - th * 0.5, vxX, vxY, vyX, vyY, th, key, scale, true, key === 'fab');
  };

  // ─── DRAW INDIVIDUAL LAYER SLAB WITH TEXTURES ───────────────────────────────
  const drawLayerSlab = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    vxX: number,
    vxY: number,
    vyX: number,
    vyY: number,
    th: number,
    key: string,
    scale: number,
    isHovered: boolean,
    isPillowTop: boolean
  ) => {
    ctx.save();

    // 4 Corners of Top Face
    const pBack = { x: cx, y: cy };
    const pRight = { x: cx + vxX, y: cy + vxY };
    const pFront = { x: cx + vxX + vyX, y: cy + vxY + vyY };
    const pLeft = { x: cx + vyX, y: cy + vyY };

    // Ambient drop shadow beneath layer
    ctx.beginPath();
    ctx.moveTo(pBack.x, pBack.y + th + 10 * scale);
    ctx.lineTo(pRight.x + 8 * scale, pRight.y + th + 12 * scale);
    ctx.lineTo(pFront.x, pFront.y + th + 16 * scale);
    ctx.lineTo(pLeft.x - 8 * scale, pLeft.y + th + 12 * scale);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.filter = `blur(${Math.round(8 * scale)}px)`;
    ctx.fill();
    ctx.filter = 'none';

    // ── 1. FRONT-LEFT THICKNESS FACE ──
    ctx.beginPath();
    ctx.moveTo(pLeft.x, pLeft.y);
    ctx.lineTo(pFront.x, pFront.y);
    ctx.lineTo(pFront.x, pFront.y + th);
    ctx.lineTo(pLeft.x, pLeft.y + th);
    ctx.closePath();

    if (key === 'spr') {
      // Pocket springs front row
      drawPocketSpringSide(ctx, pLeft, pFront, th, scale, '#dbe2ef', '#94a3b8');
    } else {
      ctx.fillStyle = getSideColor(key, 'left');
      ctx.fill();
      // Side texture detail
      drawSideDetail(ctx, pLeft, pFront, th, key, scale, 'left');
    }

    // ── 2. FRONT-RIGHT THICKNESS FACE ──
    ctx.beginPath();
    ctx.moveTo(pFront.x, pFront.y);
    ctx.lineTo(pRight.x, pRight.y);
    ctx.lineTo(pRight.x, pRight.y + th);
    ctx.lineTo(pFront.x, pFront.y + th);
    ctx.closePath();

    if (key === 'spr') {
      // Pocket springs right row
      drawPocketSpringSide(ctx, pFront, pRight, th, scale, '#cfd8dc', '#64748b');
    } else {
      ctx.fillStyle = getSideColor(key, 'right');
      ctx.fill();
      // Side texture detail
      drawSideDetail(ctx, pFront, pRight, th, key, scale, 'right');
    }

    // Brand Label on Front Edge of Fabric Cover
    if (key === 'fab') {
      drawBrandBadge(ctx, pFront, pRight, th, scale);
    }

    // ── 3. TOP FACE ──
    ctx.beginPath();
    ctx.moveTo(pBack.x, pBack.y);
    ctx.lineTo(pRight.x, pRight.y);
    ctx.lineTo(pFront.x, pFront.y);
    ctx.lineTo(pLeft.x, pLeft.y);
    ctx.closePath();

    // Top face base color
    ctx.fillStyle = getTopColor(key);
    ctx.fill();

    // Specific Surface Textures
    if (key === 'fab' || isPillowTop) {
      drawQuiltedPillowTop(ctx, pBack, pRight, pFront, pLeft, scale);
    } else if (key === 'soft' || key === 'lat') {
      drawPinholeMatrix(ctx, pBack, pRight, pFront, pLeft, scale);
    } else if (key === 'gel') {
      drawCoolGelSurface(ctx, pBack, pRight, pFront, pLeft, scale);
    } else if (key === 'felt') {
      drawFeltSurface(ctx, pBack, pRight, pFront, pLeft, scale);
    } else if (key === 'spr') {
      drawSpringTopArray(ctx, pBack, pRight, pFront, pLeft, scale);
    } else if (key === 'base') {
      drawAntiSlipSurface(ctx, pBack, pRight, pFront, pLeft, scale);
    } else if (key === 'reb') {
      drawRebondedSurface(ctx, pBack, pRight, pFront, pLeft, scale);
    }

    // Top Rim Bevel Highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.2 * scale;
    ctx.beginPath();
    ctx.moveTo(pLeft.x, pLeft.y);
    ctx.lineTo(pFront.x, pFront.y);
    ctx.lineTo(pRight.x, pRight.y);
    ctx.stroke();

    // Hover Halo
    if (isHovered) {
      ctx.shadowColor = '#00d2ff';
      ctx.shadowBlur = 18 * scale;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.moveTo(pBack.x, pBack.y);
      ctx.lineTo(pRight.x, pRight.y);
      ctx.lineTo(pFront.x, pFront.y);
      ctx.lineTo(pLeft.x, pLeft.y);
      ctx.closePath();
      ctx.stroke();
    }

    ctx.restore();
  };

  // ─── TEXTURE HELPERS ────────────────────────────────────────────────────────

  // 1. Quilted Pillow Top (Fabric Tufting)
  const drawQuiltedPillowTop = (
    ctx: CanvasRenderingContext2D,
    pB: { x: number; y: number },
    pR: { x: number; y: number },
    pF: { x: number; y: number },
    pL: { x: number; y: number },
    scale: number
  ) => {
    ctx.save();
    // Clip to top surface
    ctx.beginPath();
    ctx.moveTo(pB.x, pB.y);
    ctx.lineTo(pR.x, pR.y);
    ctx.lineTo(pF.x, pF.y);
    ctx.lineTo(pL.x, pL.y);
    ctx.closePath();
    ctx.clip();

    // Diamond grid division
    const rows = 6;
    const cols = 7;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const u = (c + 0.5) / cols;
        const v = (r + 0.5) / rows;

        // Bilinear interpolation in isometric quad
        const px = (1 - u) * (1 - v) * pB.x + u * (1 - v) * pR.x + u * v * pF.x + (1 - u) * v * pL.x;
        const py = (1 - u) * (1 - v) * pB.y + u * (1 - v) * pR.y + u * v * pF.y + (1 - u) * v * pL.y;

        // Plush tufting cushion radial highlight
        const tuftRadius = 26 * scale;
        const tuftGrad = ctx.createRadialGradient(px, py - 4 * scale, 2 * scale, px, py, tuftRadius);
        tuftGrad.addColorStop(0, '#ffffff');
        tuftGrad.addColorStop(0.5, '#f4f3ee');
        tuftGrad.addColorStop(0.85, '#e4e2db');
        tuftGrad.addColorStop(1, '#cdc9bf');

        ctx.fillStyle = tuftGrad;
        ctx.beginPath();
        ctx.ellipse(px, py, tuftRadius * 0.9, tuftRadius * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tuft Center Dimple / Stitch
        ctx.fillStyle = 'rgba(140, 130, 115, 0.45)';
        ctx.beginPath();
        ctx.ellipse(px, py, 2.5 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Stitch cross
        ctx.strokeStyle = 'rgba(160, 150, 135, 0.6)';
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.moveTo(px - 5 * scale, py);
        ctx.lineTo(px + 5 * scale, py);
        ctx.moveTo(px, py - 3 * scale);
        ctx.lineTo(px, py + 3 * scale);
        ctx.stroke();
      }
    }

    // Outer cord welt piping
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.5 * scale;
    ctx.beginPath();
    ctx.moveTo(pB.x, pB.y);
    ctx.lineTo(pR.x, pR.y);
    ctx.lineTo(pF.x, pF.y);
    ctx.lineTo(pL.x, pL.y);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  };

  // 2. Perforated Pinhole Matrix (Super Soft / Latex Foam)
  const drawPinholeMatrix = (
    ctx: CanvasRenderingContext2D,
    pB: { x: number; y: number },
    pR: { x: number; y: number },
    pF: { x: number; y: number },
    pL: { x: number; y: number },
    scale: number
  ) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pB.x, pB.y);
    ctx.lineTo(pR.x, pR.y);
    ctx.lineTo(pF.x, pF.y);
    ctx.lineTo(pL.x, pL.y);
    ctx.closePath();
    ctx.clip();

    const rows = 10;
    const cols = 12;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Offset alternate rows for realistic diamond pinhole matrix
        const colShift = r % 2 === 0 ? 0 : 0.5;
        const u = Math.min(0.96, Math.max(0.04, (c + colShift) / cols));
        const v = Math.min(0.96, Math.max(0.04, (r + 0.5) / rows));

        const px = (1 - u) * (1 - v) * pB.x + u * (1 - v) * pR.x + u * v * pF.x + (1 - u) * v * pL.x;
        const py = (1 - u) * (1 - v) * pB.y + u * (1 - v) * pR.y + u * v * pF.y + (1 - u) * v * pL.y;

        const prx = 3.8 * scale;
        const pry = 2.0 * scale;

        // Dark interior depth shadow
        ctx.fillStyle = '#b59a68';
        ctx.beginPath();
        ctx.ellipse(px, py, prx, pry, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner deep shadow
        ctx.fillStyle = '#7a6438';
        ctx.beginPath();
        ctx.ellipse(px, py - 0.5 * scale, prx * 0.7, pry * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bottom-Right highlight lip
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.ellipse(px, py + 0.4 * scale, prx, pry, 0, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
      }
    }
    ctx.restore();
  };

  // 3. Cooling Gel Foam (Translucent blue with pores and gel beads)
  const drawCoolGelSurface = (
    ctx: CanvasRenderingContext2D,
    pB: { x: number; y: number },
    pR: { x: number; y: number },
    pF: { x: number; y: number },
    pL: { x: number; y: number },
    scale: number
  ) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pB.x, pB.y);
    ctx.lineTo(pR.x, pR.y);
    ctx.lineTo(pF.x, pF.y);
    ctx.lineTo(pL.x, pL.y);
    ctx.closePath();
    ctx.clip();

    // Micro-pores
    const rows = 8;
    const cols = 10;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const u = (c + 0.5) / cols + (Math.sin(r * 3 + c) * 0.02);
        const v = (r + 0.5) / rows + (Math.cos(c * 2 + r) * 0.02);

        const px = (1 - u) * (1 - v) * pB.x + u * (1 - v) * pR.x + u * v * pF.x + (1 - u) * v * pL.x;
        const py = (1 - u) * (1 - v) * pB.y + u * (1 - v) * pR.y + u * v * pF.y + (1 - u) * v * pL.y;

        // Gel pore
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.ellipse(px, py, 3.2 * scale, 1.8 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Darker gel bead
        ctx.fillStyle = '#0369a1';
        ctx.beginPath();
        ctx.ellipse(px, py - 0.4 * scale, 2.0 * scale, 1.1 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Cool specular sheen
    const sheen = ctx.createLinearGradient(pB.x, pB.y, pF.x, pF.y);
    sheen.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    sheen.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
    sheen.addColorStop(1, 'rgba(0, 160, 255, 0.15)');
    ctx.fillStyle = sheen;
    ctx.fill();

    ctx.restore();
  };

  // 4. Premium Felt Surface (Heather grey fibrous texture)
  const drawFeltSurface = (
    ctx: CanvasRenderingContext2D,
    pB: { x: number; y: number },
    pR: { x: number; y: number },
    pF: { x: number; y: number },
    pL: { x: number; y: number },
    scale: number
  ) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pB.x, pB.y);
    ctx.lineTo(pR.x, pR.y);
    ctx.lineTo(pF.x, pF.y);
    ctx.lineTo(pL.x, pL.y);
    ctx.closePath();
    ctx.clip();

    // Mottled flecks
    const flecks = [
      'rgba(55, 65, 81, 0.6)',
      'rgba(156, 163, 175, 0.5)',
      'rgba(243, 244, 246, 0.35)',
      'rgba(31, 41, 55, 0.7)',
    ];

    for (let i = 0; i < 70; i++) {
      const u = (Math.sin(i * 12.3) * 0.5 + 0.5);
      const v = (Math.cos(i * 8.7) * 0.5 + 0.5);

      const px = (1 - u) * (1 - v) * pB.x + u * (1 - v) * pR.x + u * v * pF.x + (1 - u) * v * pL.x;
      const py = (1 - u) * (1 - v) * pB.y + u * (1 - v) * pR.y + u * v * pF.y + (1 - u) * v * pL.y;

      ctx.fillStyle = flecks[i % flecks.length];
      ctx.beginPath();
      ctx.ellipse(px, py, (4 + (i % 6)) * scale, (2 + (i % 3)) * scale, (i * 0.3) % Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  // 5. Pocket Springs Array (Top array of spring caps)
  const drawSpringTopArray = (
    ctx: CanvasRenderingContext2D,
    pB: { x: number; y: number },
    pR: { x: number; y: number },
    pF: { x: number; y: number },
    pL: { x: number; y: number },
    scale: number
  ) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pB.x, pB.y);
    ctx.lineTo(pR.x, pR.y);
    ctx.lineTo(pF.x, pF.y);
    ctx.lineTo(pL.x, pL.y);
    ctx.closePath();
    ctx.clip();

    const cols = 11;
    const rows = 9;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const u = (c + 0.5) / cols;
        const v = (r + 0.5) / rows;

        const px = (1 - u) * (1 - v) * pB.x + u * (1 - v) * pR.x + u * v * pF.x + (1 - u) * v * pL.x;
        const py = (1 - u) * (1 - v) * pB.y + u * (1 - v) * pR.y + u * v * pF.y + (1 - u) * v * pL.y;

        const rx = 10 * scale;
        const ry = 5.2 * scale;

        // Pocket fabric circular cap
        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath();
        ctx.ellipse(px, py, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

        // Inner coil spiral circle
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.2 * scale;
        ctx.beginPath();
        ctx.ellipse(px, py, rx * 0.65, ry * 0.65, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  };

  // Pocket Spring Side Row (Individual 3D cylinders with fabric sleeves)
  const drawPocketSpringSide = (
    ctx: CanvasRenderingContext2D,
    pStart: { x: number; y: number },
    pEnd: { x: number; y: number },
    th: number,
    scale: number,
    gradLight: string,
    gradDark: string
  ) => {
    const numSprings = 10;
    const dx = (pEnd.x - pStart.x) / numSprings;
    const dy = (pEnd.y - pStart.y) / numSprings;

    for (let i = 0; i < numSprings; i++) {
      const x0 = pStart.x + dx * i;
      const y0 = pStart.y + dy * i;
      const x1 = x0 + dx;
      const y1 = y0 + dy;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x1, y1 + th);
      ctx.lineTo(x0, y0 + th);
      ctx.closePath();

      // Barrel cylinder gradient
      const cylGrad = ctx.createLinearGradient(x0, y0, x1, y1);
      cylGrad.addColorStop(0, gradDark);
      cylGrad.addColorStop(0.25, gradLight);
      cylGrad.addColorStop(0.65, '#ffffff');
      cylGrad.addColorStop(0.9, gradLight);
      cylGrad.addColorStop(1, gradDark);

      ctx.fillStyle = cylGrad;
      ctx.fill();

      // Ultrasonic vertical weld seam
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo((x0 + x1) * 0.5, (y0 + y1) * 0.5);
      ctx.lineTo((x0 + x1) * 0.5, (y0 + y1) * 0.5 + th);
      ctx.stroke();

      // Translucent spiral coil loops inside
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.22)';
      ctx.lineWidth = 1.8 * scale;
      for (let step = 1; step <= 4; step++) {
        const loopY = (y0 + y1) * 0.5 + (th * step) / 5;
        ctx.beginPath();
        ctx.ellipse((x0 + x1) * 0.5, loopY, Math.abs(dx) * 0.45, 3.5 * scale, 0, 0, Math.PI);
        ctx.stroke();
      }

      ctx.restore();
    }
  };

  // 6. Anti-Slip Surface (Honeycomb grip dots)
  const drawAntiSlipSurface = (
    ctx: CanvasRenderingContext2D,
    pB: { x: number; y: number },
    pR: { x: number; y: number },
    pF: { x: number; y: number },
    pL: { x: number; y: number },
    scale: number
  ) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pB.x, pB.y);
    ctx.lineTo(pR.x, pR.y);
    ctx.lineTo(pF.x, pF.y);
    ctx.lineTo(pL.x, pL.y);
    ctx.closePath();
    ctx.clip();

    const rows = 12;
    const cols = 14;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const u = (c + 0.5) / cols;
        const v = (r + 0.5) / rows;
        const px = (1 - u) * (1 - v) * pB.x + u * (1 - v) * pR.x + u * v * pF.x + (1 - u) * v * pL.y;
        const py = (1 - u) * (1 - v) * pB.y + u * (1 - v) * pR.y + u * v * pF.y + (1 - u) * v * pL.y;

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(px, py, 2.2 * scale, 1.2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  };

  // 7. Rebonded Surface (Multicolored chips)
  const drawRebondedSurface = (
    ctx: CanvasRenderingContext2D,
    pB: { x: number; y: number },
    pR: { x: number; y: number },
    pF: { x: number; y: number },
    pL: { x: number; y: number },
    scale: number
  ) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pB.x, pB.y);
    ctx.lineTo(pR.x, pR.y);
    ctx.lineTo(pF.x, pF.y);
    ctx.lineTo(pL.x, pL.y);
    ctx.closePath();
    ctx.clip();

    const colors = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];
    for (let i = 0; i < 50; i++) {
      const u = (Math.sin(i * 17.1) * 0.5 + 0.5);
      const v = (Math.cos(i * 11.3) * 0.5 + 0.5);

      const px = (1 - u) * (1 - v) * pB.x + u * (1 - v) * pR.x + u * v * pF.x + (1 - u) * v * pL.x;
      const py = (1 - u) * (1 - v) * pB.y + u * (1 - v) * pR.y + u * v * pF.y + (1 - u) * v * pL.y;

      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.ellipse(px, py, (6 + (i % 6)) * scale, (3 + (i % 4)) * scale, (i * 0.5) % Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  // Side cut face textures
  const drawSideDetail = (
    ctx: CanvasRenderingContext2D,
    p0: { x: number; y: number },
    p1: { x: number; y: number },
    th: number,
    key: string,
    scale: number,
    side: 'left' | 'right'
  ) => {
    if (key === 'fab') {
      // Dark woven textile texture on fabric border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1 * scale;
      const steps = 14;
      for (let s = 1; s < steps; s++) {
        const t = s / steps;
        const x = p0.x + (p1.x - p0.x) * t;
        const y = p0.y + (p1.y - p0.y) * t;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + th);
        ctx.stroke();
      }
    } else if (key === 'reb') {
      // Rebonded chips on cut side
      const colors = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444'];
      for (let i = 0; i < 18; i++) {
        const t = (i + 0.5) / 18;
        const x = p0.x + (p1.x - p0.x) * t;
        const y = p0.y + (p1.y - p0.y) * t + (th * ((i % 3) + 1)) / 4;
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(x - 3 * scale, y - 2 * scale, 6 * scale, 4 * scale);
      }
    }
  };

  // Brand Badge on the corner
  const drawBrandBadge = (
    ctx: CanvasRenderingContext2D,
    pF: { x: number; y: number },
    pR: { x: number; y: number },
    th: number,
    scale: number
  ) => {
    const t = 0.65;
    const bx = pF.x + (pR.x - pF.x) * t;
    const by = pF.y + (pR.y - pF.y) * t + th * 0.22;
    const bw = 55 * scale;
    const bh = 18 * scale;

    ctx.save();
    ctx.translate(bx, by);

    // Badge background
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.2 * scale;
    ctx.beginPath();
    ctx.roundRect(0, 0, bw, bh, 3 * scale);
    ctx.fill();
    ctx.stroke();

    // Blue wave logo + SleepWorld text
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.arc(8 * scale, bh * 0.5, 3.5 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(7.5 * scale)}px system-ui, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('SleepWorld', 14 * scale, bh * 0.5);

    ctx.restore();
  };

  // Color schemes
  const getTopColor = (key: string) => {
    switch (key) {
      case 'fab': return '#f8f7f2';
      case 'soft':
      case 'lat': return '#fbf5e6';
      case 'gel': return '#38bdf8';
      case 'hr': return '#fef3c7';
      case 'felt': return '#9ca3af';
      case 'spr': return '#e2e8f0';
      case 'base': return '#1e293b';
      case 'reb': return '#2dd4bf';
      default: return '#e2e8f0';
    }
  };

  const getSideColor = (key: string, side: 'left' | 'right') => {
    const factor = side === 'left' ? 1.0 : 0.85;
    switch (key) {
      case 'fab': return side === 'left' ? '#1f242e' : '#141820'; // dark woven sidewall
      case 'soft':
      case 'lat': return side === 'left' ? '#eee3c7' : '#dfd1af';
      case 'gel': return side === 'left' ? '#0284c7' : '#0369a1';
      case 'hr': return side === 'left' ? '#fde68a' : '#f59e0b';
      case 'felt': return side === 'left' ? '#6b7280' : '#4b5563';
      case 'spr': return side === 'left' ? '#cbd5e1' : '#94a3b8';
      case 'base': return side === 'left' ? '#0f172a' : '#020617';
      case 'reb': return side === 'left' ? '#14b8a6' : '#0f766e';
      default: return side === 'left' ? '#cbd5e1' : '#94a3b8';
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
    </div>
  );
};

