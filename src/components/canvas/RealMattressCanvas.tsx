import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useShowroomStore } from '../../store/showroomStore';
import { MATTRESS_MODELS } from '../../data/mattresses';
import { LAYER_TYPES } from '../../data/layerTypes';
import {
  getQuiltTexture,
  getFabricBorderTexture,
  getLatexPinholeTexture,
  getCoolGelTexture,
  getFeltTexture,
  getPocketSpringSleeveTexture,
  getAntiSlipTexture,
  getShowroomRugTexture,
  getHeadboardTexture,
  getShowroomBackgroundTexture,
  getShowroomFloorTexture,
  getLuxuryMattressSideTexture,
  getPillowTexture,
  getDuvetRunnerTexture,
} from '../../textures/generators';

interface RealMattressCanvasProps {
  isIsolatedMode?: boolean;
  isolatedLayerKey?: string | null;
  isRealView?: boolean;
  cameraPreset?: number;
  autoRotate?: boolean;
  onLayerClick?: (key: string, index: number) => void;
  onLayerOpenIsolated?: (key: string) => void;
  hoveredLayerIndex?: number;
  pulledLayerIndex?: number;
  setPulledLayerIndex?: (idx: number) => void;
  onScreenPositionsUpdate?: (positions: { index: number; x: number; y: number }[]) => void;
  zoomAction?: 'in' | 'out' | null;
  onZoomReset?: () => void;
}

export const RealMattressCanvas: React.FC<RealMattressCanvasProps> = ({
  isIsolatedMode = false,
  isolatedLayerKey = null,
  isRealView = false,
  cameraPreset = 0,
  autoRotate = false,
  onLayerClick,
  onLayerOpenIsolated,
  hoveredLayerIndex = -1,
  pulledLayerIndex = -1,
  setPulledLayerIndex,
  onScreenPositionsUpdate,
  zoomAction = null,
  onZoomReset,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { selectedModelIndex } = useShowroomStore();
  const currentModel = MATTRESS_MODELS[selectedModelIndex] || MATTRESS_MODELS[0];
  const layers = currentModel.layers;

  // Scene references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const layerMeshesRef = useRef<THREE.Group[]>([]);
  const bedFrameGroupRef = useRef<THREE.Group | null>(null);
  const realBedFinishedGroupRef = useRef<THREE.Group | null>(null);
  const showroomRoomGroupRef = useRef<THREE.Group | null>(null);

  // Animation values
  const currentGapRef = useRef<number>(1.25);
  const targetGapRef = useRef<number>(1.25);

  // Lateral slide offsets for each layer
  const currentSlideOffsetsRef = useRef<number[]>([]);
  const targetSlideOffsetsRef = useRef<number[]>([]);

  // Camera smooth transition lerping
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(31, 16, 36));
  const targetControlsTarget = useRef<THREE.Vector3>(new THREE.Vector3(2.2, -1.8, 0));
  const isAnimatingCamera = useRef<boolean>(false);

  // Gesture tracking
  const pointerStartPos = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const touchedLayerIdx = useRef<number>(-1);
  const isLayerSwipe = useRef<boolean>(false);
  const lastTapTimeRef = useRef<number>(0);
  const lastTapLayerRef = useRef<number>(-1);
  const raycaster = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseVec = useRef<THREE.Vector2>(new THREE.Vector2());

  // Dimensions of mattress
  const MATTRESS_WIDTH = 14;
  const MATTRESS_LENGTH = 19;

  // Sync slide offsets array length with layers
  useEffect(() => {
    currentSlideOffsetsRef.current = new Array(layers.length).fill(0);
    targetSlideOffsetsRef.current = new Array(layers.length).fill(0);
  }, [layers.length]);

  // Update target slide offsets when pulledLayerIndex changes
  useEffect(() => {
    targetSlideOffsetsRef.current = layers.map((_, idx) => (idx === pulledLayerIndex ? -5.8 : 0));
  }, [pulledLayerIndex, layers]);

  // Handle zoom actions with silky smooth lerp
  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls || !zoomAction) return;

    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const step = zoomAction === 'in' ? 4.0 : -4.0;

    targetCamPos.current.copy(camera.position).addScaledVector(dir, step);
    isAnimatingCamera.current = true;

    if (onZoomReset) onZoomReset();
  }, [zoomAction]);

  // ─── INITIALIZE THREE.JS SCENE ─────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // 1. Scene with warm showroom ambient atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c1422);
    sceneRef.current = scene;

    // 2. Camera with proper zoom out showing full bed and room
    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / container.clientHeight,
      0.1,
      400
    );
    camera.position.set(31, 18, 36);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
        powerPreference: 'default',
      });
    } catch (e) {
      console.error('WebGL Init error:', e);
      return;
    }

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 4. Slow, smooth, user-friendly OrbitControls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05; // Gentle, silky luxury deceleration
    controls.rotateSpeed = 0.35;   // Slow, human-friendly, comfortable drag rotation (never too fast)
    controls.panSpeed = 0.45;
    controls.zoomSpeed = 0.55;     // Gentle, silky, non-jarring zoom (avoids trackpad over-acceleration)
    controls.minDistance = 12;
    controls.maxDistance = 58;
    controls.maxPolarAngle = Math.PI / 2 - 0.04; // Keep above floor at all times
    controls.minPolarAngle = 0.18;               // Prevent disorienting top-down flip
    controls.screenSpacePanning = true;
    controls.target.set(2.2, -1.4, 0);
    controlsRef.current = controls;

    // 5. Studio & Showroom Lighting
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.05);
    scene.add(ambientLight);

    // Main Warm Ceiling Spotlight (casting soft shadow on rug)
    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.2);
    keyLight.position.set(16, 28, 18);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 5;
    keyLight.shadow.camera.far = 70;
    keyLight.shadow.camera.left = -20;
    keyLight.shadow.camera.right = 20;
    keyLight.shadow.camera.top = 20;
    keyLight.shadow.camera.bottom = -20;
    keyLight.shadow.bias = -0.0004;
    scene.add(keyLight);

    // Warm Window/Sky Fill Light
    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.75);
    fillLight.position.set(-20, 16, -18);
    scene.add(fillLight);

    // Edge Accent Rim Light
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.9);
    rimLight.position.set(0, -5, 22);
    scene.add(rimLight);

    // Warm Underbed Accent Cove Light
    const underbedLight = new THREE.PointLight(0xf59e0b, 1.4, 32);
    underbedLight.position.set(0, -4.6, 0);
    scene.add(underbedLight);

    // Bedside Table Warm Lamps
    const lampL = new THREE.PointLight(0xfde68a, 0.8, 18);
    lampL.position.set(-MATTRESS_WIDTH / 2 - 4.5, 0, -MATTRESS_LENGTH / 2);
    scene.add(lampL);

    const lampR = new THREE.PointLight(0xfde68a, 0.8, 18);
    lampR.position.set(MATTRESS_WIDTH / 2 + 4.5, 0, -MATTRESS_LENGTH / 2);
    scene.add(lampR);

    // ── 6. FULL ROOM VIEW IN BACKGROUND IN FULL CANVAS ──
    const showroomGroup = new THREE.Group();
    showroomRoomGroupRef.current = showroomGroup;
    scene.add(showroomGroup);

    // A. Full Polished Showroom Floor (extending across entire canvas)
    const floorTex = getShowroomFloorTexture();
    const floorGeo = new THREE.PlaneGeometry(160, 160);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.32,
      metalness: 0.15,
    });
    const fullFloorMesh = new THREE.Mesh(floorGeo, floorMat);
    fullFloorMesh.rotation.x = -Math.PI / 2;
    fullFloorMesh.position.y = -6.05;
    fullFloorMesh.receiveShadow = true;
    showroomGroup.add(fullFloorMesh);

    // B. Showroom Wool Area Rug under bed
    const rugTex = getShowroomRugTexture();
    const rugGeo = new THREE.PlaneGeometry(38, 44);
    const rugMat = new THREE.MeshStandardMaterial({
      map: rugTex,
      roughness: 0.92,
      metalness: 0.04,
    });
    const rugMesh = new THREE.Mesh(rugGeo, rugMat);
    rugMesh.rotation.x = -Math.PI / 2;
    rugMesh.position.y = -5.98;
    rugMesh.receiveShadow = true;
    showroomGroup.add(rugMesh);

    // Soft Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(45, 45);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.45 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -5.96;
    shadowPlane.receiveShadow = true;
    showroomGroup.add(shadowPlane);

    // C. Panoramic Showroom Architectural Curved Back Wall (Cyclorama around entire canvas)
    const bgTex = getShowroomBackgroundTexture();
    bgTex.wrapS = THREE.RepeatWrapping;
    bgTex.repeat.set(1.4, 1);
    const wallGeo = new THREE.CylinderGeometry(65, 65, 68, 64, 1, true, -Math.PI * 0.92, Math.PI * 1.84);
    const wallMat = new THREE.MeshBasicMaterial({ map: bgTex, side: THREE.BackSide });
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.set(0, 22, 0);
    showroomGroup.add(wallMesh);

    // Ceiling Plane for Warm Downward Environment
    const ceilingGeo = new THREE.PlaneGeometry(200, 200);
    const ceilingMat = new THREE.MeshBasicMaterial({ color: 0x0c1322 });
    const ceilingMesh = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceilingMesh.rotation.x = Math.PI / 2;
    ceilingMesh.position.y = 56;
    showroomGroup.add(ceilingMesh);

    // D. 360° Glowing Turntable Pedestal (Image 2 & 3)
    const pedBaseGeo = new THREE.CylinderGeometry(15.2, 15.6, 0.35, 64);
    const pedBaseMat = new THREE.MeshStandardMaterial({
      color: 0x08101e,
      roughness: 0.25,
      metalness: 0.7,
    });
    const pedBaseMesh = new THREE.Mesh(pedBaseGeo, pedBaseMat);
    pedBaseMesh.position.y = -5.8;
    pedBaseMesh.receiveShadow = true;
    showroomGroup.add(pedBaseMesh);

    // Glowing Cyan Neon 360 Ring
    const neonRingGeo = new THREE.RingGeometry(14.3, 14.7, 64);
    const neonRingMat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      side: THREE.DoubleSide,
    });
    const neonRingMesh = new THREE.Mesh(neonRingGeo, neonRingMat);
    neonRingMesh.rotation.x = -Math.PI / 2;
    neonRingMesh.position.y = -5.61;
    showroomGroup.add(neonRingMesh);

    // Outer soft neon blue halo
    const haloRingGeo = new THREE.RingGeometry(13.8, 15.1, 64);
    const haloRingMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const haloRingMesh = new THREE.Mesh(haloRingGeo, haloRingMat);
    haloRingMesh.rotation.x = -Math.PI / 2;
    haloRingMesh.position.y = -5.615;
    showroomGroup.add(haloRingMesh);

    // E. Bedside Nightstands (Left & Right)
    const nsGeo = new THREE.BoxGeometry(3.6, 3.2, 3.6);
    const nsMat = new THREE.MeshStandardMaterial({ color: 0x2d1d12, roughness: 0.6 });
    const lampBaseGeo = new THREE.CylinderGeometry(0.5, 0.6, 1.2, 16);
    const lampShadeGeo = new THREE.CylinderGeometry(0.8, 1.1, 1.4, 16);
    const shadeMat = new THREE.MeshStandardMaterial({ color: 0xfffbeb, roughness: 0.3 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xc8a261, roughness: 0.35, metalness: 0.75 });

    // Left Nightstand
    const nsLeft = new THREE.Mesh(nsGeo, nsMat);
    nsLeft.position.set(-MATTRESS_WIDTH / 2 - 3.8, -4.4, -MATTRESS_LENGTH / 2 + 1.5);
    nsLeft.castShadow = true;
    showroomGroup.add(nsLeft);

    const lampBaseL = new THREE.Mesh(lampBaseGeo, brassMat);
    lampBaseL.position.set(-MATTRESS_WIDTH / 2 - 3.8, -2.2, -MATTRESS_LENGTH / 2 + 1.5);
    showroomGroup.add(lampBaseL);

    const shadeL = new THREE.Mesh(lampShadeGeo, shadeMat);
    shadeL.position.set(-MATTRESS_WIDTH / 2 - 3.8, -0.9, -MATTRESS_LENGTH / 2 + 1.5);
    showroomGroup.add(shadeL);

    // Right Nightstand
    const nsRight = new THREE.Mesh(nsGeo, nsMat);
    nsRight.position.set(MATTRESS_WIDTH / 2 + 3.8, -4.4, -MATTRESS_LENGTH / 2 + 1.5);
    nsRight.castShadow = true;
    showroomGroup.add(nsRight);

    const lampBaseR = new THREE.Mesh(lampBaseGeo, brassMat);
    lampBaseR.position.set(MATTRESS_WIDTH / 2 + 3.8, -2.2, -MATTRESS_LENGTH / 2 + 1.5);
    showroomGroup.add(lampBaseR);

    const shadeR = new THREE.Mesh(lampShadeGeo, shadeMat);
    shadeR.position.set(MATTRESS_WIDTH / 2 + 3.8, -0.9, -MATTRESS_LENGTH / 2 + 1.5);
    showroomGroup.add(shadeR);

    // F. Luxury Showroom Indoor Potted Plant (Ficus / Fiddle Leaf)
    const plantGroup = new THREE.Group();
    const potGeo = new THREE.CylinderGeometry(1.5, 1.1, 4.2, 32);
    const potMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.35,
      metalness: 0.1,
    });
    const potMesh = new THREE.Mesh(potGeo, potMat);
    potMesh.position.set(-MATTRESS_WIDTH / 2 - 7.5, -3.95, -MATTRESS_LENGTH / 2 + 3);
    potMesh.castShadow = true;
    plantGroup.add(potMesh);

    // Brass Planter Rim
    const potRimGeo = new THREE.TorusGeometry(1.5, 0.08, 16, 32);
    const potRimMesh = new THREE.Mesh(potRimGeo, brassMat);
    potRimMesh.rotation.x = Math.PI / 2;
    potRimMesh.position.set(-MATTRESS_WIDTH / 2 - 7.5, -1.85, -MATTRESS_LENGTH / 2 + 3);
    plantGroup.add(potRimMesh);

    // Dark organic potting soil
    const soilGeo = new THREE.CylinderGeometry(1.42, 1.42, 0.25, 24);
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x15100c, roughness: 0.95 });
    const soilMesh = new THREE.Mesh(soilGeo, soilMat);
    soilMesh.position.set(-MATTRESS_WIDTH / 2 - 7.5, -1.9, -MATTRESS_LENGTH / 2 + 3);
    plantGroup.add(soilMesh);

    // Stem and realistic broad ficus leaves
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x2b3826, roughness: 0.8 });
    const stemGeo = new THREE.CylinderGeometry(0.18, 0.24, 7.5, 12);
    const mainStem = new THREE.Mesh(stemGeo, stemMat);
    mainStem.position.set(-MATTRESS_WIDTH / 2 - 7.5, 1.6, -MATTRESS_LENGTH / 2 + 3);
    plantGroup.add(mainStem);

    const ficusLeafGeo = new THREE.SphereGeometry(1.5, 16, 12);
    ficusLeafGeo.scale(1.1, 0.12, 1.9);
    const leafMatDark = new THREE.MeshStandardMaterial({ color: 0x144020, roughness: 0.8 });
    const leafMatLight = new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.75 });

    const leafPlacements = [
      { y: -0.8, rot: [0.35, 0.4, -0.5], offset: [-0.9, 0, 0.5], mat: leafMatDark },
      { y: 0.2, rot: [-0.3, 1.3, 0.4], offset: [0.9, 0, -0.4], mat: leafMatLight },
      { y: 1.2, rot: [0.5, -1.1, -0.3], offset: [-1.1, 0, -0.6], mat: leafMatDark },
      { y: 2.2, rot: [-0.25, 2.3, 0.5], offset: [0.8, 0, 0.8], mat: leafMatLight },
      { y: 3.1, rot: [0.4, 0.1, -0.2], offset: [-0.5, 0, 0.9], mat: leafMatDark },
      { y: 4.0, rot: [-0.35, -2.1, 0.3], offset: [0.7, 0, -0.7], mat: leafMatLight },
      { y: 4.8, rot: [0.1, 0.0, -0.1], offset: [0.0, 0, 0.0], mat: leafMatLight },
    ];

    leafPlacements.forEach((lp) => {
      const leaf = new THREE.Mesh(ficusLeafGeo, lp.mat);
      leaf.position.set(
        -MATTRESS_WIDTH / 2 - 7.5 + lp.offset[0],
        lp.y,
        -MATTRESS_LENGTH / 2 + 3 + lp.offset[2]
      );
      leaf.rotation.set(lp.rot[0], lp.rot[1], lp.rot[2]);
      leaf.castShadow = true;
      plantGroup.add(leaf);
    });

    showroomGroup.add(plantGroup);

    // ── 7. REAL DESIGNER BED FRAME (HEADBOARD, RAILS, TAPERED LEGS) ──
    const bedFrameGroup = new THREE.Group();
    bedFrameGroupRef.current = bedFrameGroup;
    scene.add(bedFrameGroup);

    const headboardTex = getHeadboardTexture();
    const walnutMat = new THREE.MeshStandardMaterial({
      map: headboardTex,
      roughness: 0.6,
      metalness: 0.15,
    });

    // A. Headboard Back Panel
    const hbGeo = new THREE.BoxGeometry(MATTRESS_WIDTH + 3, 11, 1.6);
    const hbMesh = new THREE.Mesh(hbGeo, walnutMat);
    hbMesh.position.set(0, 1.2, -MATTRESS_LENGTH / 2 - 1.2);
    hbMesh.castShadow = true;
    hbMesh.receiveShadow = true;
    bedFrameGroup.add(hbMesh);

    // Headboard Brass Trim Top Cap
    const trimGeo = new THREE.BoxGeometry(MATTRESS_WIDTH + 3.2, 0.25, 1.8);
    const trimMesh = new THREE.Mesh(trimGeo, brassMat);
    trimMesh.position.set(0, 6.75, -MATTRESS_LENGTH / 2 - 1.2);
    bedFrameGroup.add(trimMesh);

    // B. Bed Base Rails (Platform surrounding mattress)
    const railTh = 1.4;
    const railMat = new THREE.MeshStandardMaterial({ color: 0x2b1e14, roughness: 0.7 });

    const sideRailGeo = new THREE.BoxGeometry(1.2, railTh, MATTRESS_LENGTH + 0.8);
    const leftRail = new THREE.Mesh(sideRailGeo, railMat);
    leftRail.position.set(-MATTRESS_WIDTH / 2 - 0.6, -4.5, 0);
    leftRail.castShadow = true;
    bedFrameGroup.add(leftRail);

    const rightRail = new THREE.Mesh(sideRailGeo, railMat);
    rightRail.position.set(MATTRESS_WIDTH / 2 + 0.6, -4.5, 0);
    rightRail.castShadow = true;
    bedFrameGroup.add(rightRail);

    const footRailGeo = new THREE.BoxGeometry(MATTRESS_WIDTH + 2.4, railTh, 1.2);
    const footRail = new THREE.Mesh(footRailGeo, railMat);
    footRail.position.set(0, -4.5, MATTRESS_LENGTH / 2 + 0.6);
    footRail.castShadow = true;
    bedFrameGroup.add(footRail);

    // C. 4 Tapered Designer Bed Legs
    const legGeo = new THREE.CylinderGeometry(0.35, 0.22, 2.2, 16);
    const legPositions = [
      [-MATTRESS_WIDTH / 2 - 0.4, -5.6, -MATTRESS_LENGTH / 2],
      [MATTRESS_WIDTH / 2 + 0.4, -5.6, -MATTRESS_LENGTH / 2],
      [-MATTRESS_WIDTH / 2 - 0.4, -5.6, MATTRESS_LENGTH / 2 + 0.4],
      [MATTRESS_WIDTH / 2 + 0.4, -5.6, MATTRESS_LENGTH / 2 + 0.4],
    ];

    legPositions.forEach(([lx, ly, lz]) => {
      const legMesh = new THREE.Mesh(legGeo, brassMat);
      legMesh.position.set(lx, ly, lz);
      legMesh.castShadow = true;
      bedFrameGroup.add(legMesh);
    });

    // 8. Handle Window Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 9. Animation Loop with smooth physics lerping
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Smooth lerp for explosion gap
      currentGapRef.current += (targetGapRef.current - currentGapRef.current) * 0.12;

      // Smooth lerp for lateral layer slide-out gestures
      if (currentSlideOffsetsRef.current && targetSlideOffsetsRef.current) {
        for (let i = 0; i < currentSlideOffsetsRef.current.length; i++) {
          const target = targetSlideOffsetsRef.current[i] || 0;
          currentSlideOffsetsRef.current[i] += (target - currentSlideOffsetsRef.current[i]) * 0.15;
          if (layerMeshesRef.current[i]) {
            layerMeshesRef.current[i].position.x = currentSlideOffsetsRef.current[i];
          }
        }
      }

      // Smooth cinematic camera transition lerping
      if (isAnimatingCamera.current) {
        camera.position.lerp(targetCamPos.current, 0.08);
        controls.target.lerp(targetControlsTarget.current, 0.08);
        if (
          camera.position.distanceTo(targetCamPos.current) < 0.04 &&
          controls.target.distanceTo(targetControlsTarget.current) < 0.04
        ) {
          camera.position.copy(targetCamPos.current);
          controls.target.copy(targetControlsTarget.current);
          isAnimatingCamera.current = false;
        }
      }

      // Gentle, slow, human-friendly auto-rotation
      controls.autoRotate = autoRotate;
      controls.autoRotateSpeed = 0.14; // Slow, calm, majestic luxury showroom rotation pace
      controls.update();

      // Render
      renderer.render(scene, camera);

      // Project 3D layer positions to screen coordinates for connecting lines
      if (onScreenPositionsUpdate && camera && container) {
        const positions: { index: number; x: number; y: number }[] = [];
        const w = container.clientWidth;
        const h = container.clientHeight;

        layerMeshesRef.current.forEach((group, idx) => {
          if (!group.visible) return;
          const pos = new THREE.Vector3(MATTRESS_WIDTH / 2 + group.position.x, group.position.y, 0);
          pos.project(camera);
          const screenX = (pos.x * 0.5 + 0.5) * w;
          const screenY = (-(pos.y * 0.5) + 0.5) * h;
          positions.push({ index: idx, x: screenX, y: screenY });
        });

        onScreenPositionsUpdate(positions);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  // ─── BUILD 3D MATTRESS MESHES ACCORDING TO MODEL ───────────────────────────
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clean up old layer meshes
    layerMeshesRef.current.forEach((grp) => scene.remove(grp));
    layerMeshesRef.current = [];

    const quilt = getQuiltTexture();
    const borderTex = getFabricBorderTexture();
    const latex = getLatexPinholeTexture();
    const gelTex = getCoolGelTexture();
    const feltTex = getFeltTexture();
    const springSleeveTex = getPocketSpringSleeveTexture();
    const antiSlipTex = getAntiSlipTexture();

    const layerThicknesses = layers.map(([key]) => {
      if (key === 'spr') return 2.6;
      if (key === 'fab') return 1.4;
      if (key === 'soft' || key === 'lat') return 1.0;
      if (key === 'gel') return 0.9;
      if (key === 'hr') return 1.1;
      if (key === 'felt') return 0.35;
      return 0.8;
    });

    const newGroups: THREE.Group[] = [];

    layers.forEach(([key, label], idx) => {
      const group = new THREE.Group();
      (group as any).userData = { layerIndex: idx, layerKey: key };
      const th = layerThicknesses[idx];

      if (key === 'fab') {
        const topGeo = new THREE.BoxGeometry(MATTRESS_WIDTH, th * 0.8, MATTRESS_LENGTH, 16, 2, 20);
        const sideMat = new THREE.MeshStandardMaterial({
          map: borderTex,
          roughness: 0.8,
          metalness: 0.1,
        });
        const topMat = new THREE.MeshStandardMaterial({
          map: quilt.map,
          bumpMap: quilt.bump,
          bumpScale: 0.12,
          roughness: 0.75,
          metalness: 0.05,
        });
        const bottomMat = new THREE.MeshStandardMaterial({
          color: 0xe2e8f0,
          roughness: 0.9,
        });

        const pillowMesh = new THREE.Mesh(topGeo, [sideMat, sideMat, topMat, bottomMat, sideMat, sideMat]);
        pillowMesh.castShadow = true;
        pillowMesh.receiveShadow = true;
        group.add(pillowMesh);

        // Welt cord piping perimeter rope
        const ropeCurve = new THREE.CurvePath<THREE.Vector3>();
        const hx = MATTRESS_WIDTH / 2;
        const hz = MATTRESS_LENGTH / 2;
        const yTop = (th * 0.8) / 2;

        const p1 = new THREE.Vector3(-hx, yTop, -hz);
        const p2 = new THREE.Vector3(hx, yTop, -hz);
        const p3 = new THREE.Vector3(hx, yTop, hz);
        const p4 = new THREE.Vector3(-hx, yTop, hz);

        ropeCurve.add(new THREE.LineCurve3(p1, p2));
        ropeCurve.add(new THREE.LineCurve3(p2, p3));
        ropeCurve.add(new THREE.LineCurve3(p3, p4));
        ropeCurve.add(new THREE.LineCurve3(p4, p1));

        const ropeGeo = new THREE.TubeGeometry(ropeCurve, 64, 0.09, 8, true);
        const ropeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
        const ropeMesh = new THREE.Mesh(ropeGeo, ropeMat);
        group.add(ropeMesh);

        // Corner SleepWorld Label Badge
        const badgeGeo = new THREE.PlaneGeometry(1.6, 0.55);
        const badgeCanvas = document.createElement('canvas');
        badgeCanvas.width = 256;
        badgeCanvas.height = 88;
        const bctx = badgeCanvas.getContext('2d');
        if (bctx) {
          bctx.fillStyle = '#0f172a';
          bctx.fillRect(0, 0, 256, 88);
          bctx.strokeStyle = '#3b82f6';
          bctx.lineWidth = 4;
          bctx.strokeRect(4, 4, 248, 80);
          bctx.fillStyle = '#60a5fa';
          bctx.beginPath();
          bctx.arc(36, 44, 16, 0, Math.PI * 2);
          bctx.fill();
          bctx.fillStyle = '#ffffff';
          bctx.font = 'bold 30px system-ui, sans-serif';
          bctx.fillText('SleepWorld', 64, 54);
        }
        const badgeTex = new THREE.CanvasTexture(badgeCanvas);
        const badgeMat = new THREE.MeshBasicMaterial({ map: badgeTex });
        const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
        badgeMesh.position.set(hx * 0.65, 0, hz + 0.02);
        group.add(badgeMesh);
      } else if (key === 'soft' || key === 'lat') {
        const foamGeo = new THREE.BoxGeometry(MATTRESS_WIDTH, th, MATTRESS_LENGTH, 8, 2, 10);
        const foamSideMat = new THREE.MeshStandardMaterial({
          color: 0xf5ebd0,
          roughness: 0.9,
          metalness: 0.0,
        });
        const foamTopMat = new THREE.MeshStandardMaterial({
          map: latex.map,
          bumpMap: latex.bump,
          bumpScale: 0.08,
          roughness: 0.85,
          metalness: 0.0,
        });
        const foamMesh = new THREE.Mesh(foamGeo, [
          foamSideMat,
          foamSideMat,
          foamTopMat,
          foamSideMat,
          foamSideMat,
          foamSideMat,
        ]);
        foamMesh.castShadow = true;
        foamMesh.receiveShadow = true;
        group.add(foamMesh);
      } else if (key === 'gel') {
        const gelGeo = new THREE.BoxGeometry(MATTRESS_WIDTH, th, MATTRESS_LENGTH, 8, 2, 10);
        const gelMat = new THREE.MeshStandardMaterial({
          map: gelTex,
          color: 0x38bdf8,
          roughness: 0.28,
          metalness: 0.1,
        });
        const gelMesh = new THREE.Mesh(gelGeo, gelMat);
        gelMesh.castShadow = true;
        gelMesh.receiveShadow = true;
        group.add(gelMesh);
      } else if (key === 'hr') {
        const hrGeo = new THREE.BoxGeometry(MATTRESS_WIDTH, th, MATTRESS_LENGTH);
        const hrMat = new THREE.MeshStandardMaterial({
          color: 0xfef3c7,
          roughness: 0.85,
        });
        const hrMesh = new THREE.Mesh(hrGeo, hrMat);
        hrMesh.castShadow = true;
        hrMesh.receiveShadow = true;
        group.add(hrMesh);
      } else if (key === 'felt') {
        const feltGeo = new THREE.BoxGeometry(MATTRESS_WIDTH, th, MATTRESS_LENGTH);
        const feltMat = new THREE.MeshStandardMaterial({
          map: feltTex,
          color: 0x9ca3af,
          roughness: 0.95,
        });
        const feltMesh = new THREE.Mesh(feltGeo, feltMat);
        feltMesh.castShadow = true;
        feltMesh.receiveShadow = true;
        group.add(feltMesh);
      } else if (key === 'spr') {
        const cols = 11;
        const rows = 13;
        const count = cols * rows;

        const coilRadius = 0.52;
        const coilHeight = th * 0.95;
        const cylGeo = new THREE.CylinderGeometry(coilRadius, coilRadius, coilHeight, 16);

        const springMat = new THREE.MeshStandardMaterial({
          map: springSleeveTex,
          color: 0xf1f5f9,
          roughness: 0.6,
        });

        const instancedMesh = new THREE.InstancedMesh(cylGeo, springMat, count);
        instancedMesh.castShadow = true;
        instancedMesh.receiveShadow = true;

        const dummy = new THREE.Object3D();
        const stepX = (MATTRESS_WIDTH - 1.2) / (cols - 1);
        const stepZ = (MATTRESS_LENGTH - 1.2) / (rows - 1);

        let i = 0;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = -MATTRESS_WIDTH / 2 + 0.6 + c * stepX;
            const z = -MATTRESS_LENGTH / 2 + 0.6 + r * stepZ;
            dummy.position.set(x, 0, z);
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(i++, dummy.matrix);
          }
        }
        instancedMesh.instanceMatrix.needsUpdate = true;
        group.add(instancedMesh);
      } else if (key === 'base') {
        const baseGeo = new THREE.BoxGeometry(MATTRESS_WIDTH, th, MATTRESS_LENGTH);
        const baseSideMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
        const baseBottomMat = new THREE.MeshStandardMaterial({ map: antiSlipTex, roughness: 0.95 });
        const baseMesh = new THREE.Mesh(baseGeo, [
          baseSideMat,
          baseSideMat,
          baseSideMat,
          baseBottomMat,
          baseSideMat,
          baseSideMat,
        ]);
        baseMesh.castShadow = true;
        baseMesh.receiveShadow = true;
        group.add(baseMesh);
      } else {
        const fallbackGeo = new THREE.BoxGeometry(MATTRESS_WIDTH, th, MATTRESS_LENGTH);
        const fallbackMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
        const fallbackMesh = new THREE.Mesh(fallbackGeo, fallbackMat);
        fallbackMesh.castShadow = true;
        fallbackMesh.receiveShadow = true;
        group.add(fallbackMesh);
      }

      scene.add(group);
      newGroups.push(group);
    });

    layerMeshesRef.current = newGroups;

    // ─── BUILD REAL FINISHED LUXURY BED (CASING, PILLOWS, DUVET RUNNER) ───
    if (realBedFinishedGroupRef.current) {
      scene.remove(realBedFinishedGroupRef.current);
    }
    const realBedGroup = new THREE.Group();
    realBedFinishedGroupRef.current = realBedGroup;
    scene.add(realBedGroup);

    const totalMattressHeight = layerThicknesses.reduce((a, b) => a + b, 0);
    const settledMattressHeight = Math.min(totalMattressHeight * 0.85, 6.8);
    const luxurySideTex = getLuxuryMattressSideTexture();
    const pillowTex = getPillowTexture();
    const duvetTex = getDuvetRunnerTexture();

    // 1. Finished Fully-Enclosed Luxury Mattress (2-Tier Euro-Top + Core Body)
    const euroTopHeight = 1.4;
    const coreHeight = settledMattressHeight - euroTopHeight;
    const hx = MATTRESS_WIDTH / 2;
    const hz = MATTRESS_LENGTH / 2;

    const borderMat = new THREE.MeshStandardMaterial({
      map: luxurySideTex,
      roughness: 0.72,
      metalness: 0.1,
    });
    const topQuiltMat = new THREE.MeshStandardMaterial({
      map: quilt.map,
      bumpMap: quilt.bump,
      bumpScale: 0.16,
      roughness: 0.72,
      metalness: 0.05,
    });
    const bottomBaseMat = new THREE.MeshStandardMaterial({
      map: antiSlipTex,
      roughness: 0.95,
    });

    // A. Main Lower Core Mattress Body
    const coreGeo = new THREE.BoxGeometry(MATTRESS_WIDTH, coreHeight, MATTRESS_LENGTH, 16, 4, 20);
    const coreMattress = new THREE.Mesh(coreGeo, [
      borderMat,      // Right
      borderMat,      // Left
      borderMat,      // Top (covered by eurotop)
      bottomBaseMat,  // Bottom
      borderMat,      // Foot
      borderMat,      // Head
    ]);
    coreMattress.position.y = -3.8 + coreHeight / 2;
    coreMattress.castShadow = true;
    coreMattress.receiveShadow = true;
    realBedGroup.add(coreMattress);

    // B. Plush Euro-Top / Pillow-Top Cushion Layer
    const euroTopGeo = new THREE.BoxGeometry(MATTRESS_WIDTH, euroTopHeight, MATTRESS_LENGTH, 16, 4, 20);
    // Bevel/soften euro-top edges
    const euroPos = euroTopGeo.attributes.position;
    for (let i = 0; i < euroPos.count; i++) {
      const vx = euroPos.getX(i);
      const vy = euroPos.getY(i);
      const vz = euroPos.getZ(i);
      if (vy > 0) {
        const edgeDistX = Math.abs(vx) / hx;
        const edgeDistZ = Math.abs(vz) / hz;
        if (edgeDistX > 0.85 || edgeDistZ > 0.85) {
          const factor = Math.max(edgeDistX, edgeDistZ);
          euroPos.setY(i, vy * (1 - (factor - 0.85) * 0.35));
        }
      }
    }
    euroTopGeo.computeVertexNormals();

    const euroTopMesh = new THREE.Mesh(euroTopGeo, [
      borderMat,      // Right
      borderMat,      // Left
      topQuiltMat,    // Top plush quilted cloud
      borderMat,      // Bottom
      borderMat,      // Foot
      borderMat,      // Head
    ]);
    euroTopMesh.position.y = -3.8 + coreHeight + euroTopHeight / 2;
    euroTopMesh.castShadow = true;
    euroTopMesh.receiveShadow = true;
    realBedGroup.add(euroTopMesh);

    // C. Triple Welt Cord Piping (Top Pillow edge, Eurotop Gusset Seam, Bottom Base)
    const createPipingRope = (yLevel: number) => {
      const curve = new THREE.CurvePath<THREE.Vector3>();
      curve.add(new THREE.LineCurve3(new THREE.Vector3(-hx, yLevel, -hz), new THREE.Vector3(hx, yLevel, -hz)));
      curve.add(new THREE.LineCurve3(new THREE.Vector3(hx, yLevel, -hz), new THREE.Vector3(hx, yLevel, hz)));
      curve.add(new THREE.LineCurve3(new THREE.Vector3(hx, yLevel, hz), new THREE.Vector3(-hx, yLevel, hz)));
      curve.add(new THREE.LineCurve3(new THREE.Vector3(-hx, yLevel, hz), new THREE.Vector3(-hx, yLevel, -hz)));
      const geo = new THREE.TubeGeometry(curve, 64, 0.08, 8, true);
      const ropeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.55 });
      return new THREE.Mesh(geo, ropeMat);
    };

    // 1. Top welt cord
    realBedGroup.add(createPipingRope(-3.8 + settledMattressHeight));
    // 2. Eurotop gusset seam cord
    realBedGroup.add(createPipingRope(-3.8 + coreHeight));
    // 3. Bottom base welt cord
    realBedGroup.add(createPipingRope(-3.8));

    // D. 4 Stitched Turning Handles with reinforced Box-X stitches
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65 });
    const handleGeo = new THREE.BoxGeometry(0.18, 0.45, 1.8);
    const handleY = -3.8 + coreHeight * 0.55;

    // Right side handles
    const handleR1 = new THREE.Mesh(handleGeo, handleMat);
    handleR1.position.set(hx + 0.09, handleY, -3.5);
    realBedGroup.add(handleR1);
    const handleR2 = new THREE.Mesh(handleGeo, handleMat);
    handleR2.position.set(hx + 0.09, handleY, 3.5);
    realBedGroup.add(handleR2);

    // Left side handles
    const handleL1 = new THREE.Mesh(handleGeo, handleMat);
    handleL1.position.set(-hx - 0.09, handleY, -3.5);
    realBedGroup.add(handleL1);
    const handleL2 = new THREE.Mesh(handleGeo, handleMat);
    handleL2.position.set(-hx - 0.09, handleY, 3.5);
    realBedGroup.add(handleL2);

    // 2. Luxury Propped Sleeping Pillows (Against Headboard)
    const pillowGeo = new THREE.BoxGeometry(5.8, 1.8, 3.8, 8, 4, 8);
    const posAttr = pillowGeo.attributes.position;
    for (let p = 0; p < posAttr.count; p++) {
      const vx = posAttr.getX(p);
      const vy = posAttr.getY(p);
      const vz = posAttr.getZ(p);
      const distFromCenter = Math.sqrt((vx / 2.9) ** 2 + (vz / 1.9) ** 2);
      if (distFromCenter > 0.4) {
        posAttr.setY(p, vy * (1 - (distFromCenter - 0.4) * 0.42));
      }
    }
    pillowGeo.computeVertexNormals();

    const pillowMat = new THREE.MeshStandardMaterial({
      map: pillowTex,
      roughness: 0.65,
    });

    const pillowY = -3.8 + settledMattressHeight + 1.1;
    const pillowZ = -MATTRESS_LENGTH / 2 + 3.2;

    // Left Pillow
    const leftPillow = new THREE.Mesh(pillowGeo, pillowMat);
    leftPillow.position.set(-3.2, pillowY, pillowZ);
    leftPillow.rotation.x = 0.28; // Resting gently against headboard
    leftPillow.castShadow = true;
    leftPillow.receiveShadow = true;
    realBedGroup.add(leftPillow);

    // Right Pillow
    const rightPillow = new THREE.Mesh(pillowGeo, pillowMat);
    rightPillow.position.set(3.2, pillowY, pillowZ);
    rightPillow.rotation.x = 0.28;
    rightPillow.castShadow = true;
    rightPillow.receiveShadow = true;
    realBedGroup.add(rightPillow);

    // 2 Decorative Accent Cushions in Front
    const cushionGeo = new THREE.BoxGeometry(3.8, 1.4, 2.6, 6, 4, 6);
    const cushionMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
    });

    const leftCushion = new THREE.Mesh(cushionGeo, cushionMat);
    leftCushion.position.set(-3.2, pillowY - 0.35, pillowZ + 2.5);
    leftCushion.rotation.x = 0.34;
    leftCushion.castShadow = true;
    realBedGroup.add(leftCushion);

    const rightCushion = new THREE.Mesh(cushionGeo, cushionMat);
    rightCushion.position.set(3.2, pillowY - 0.35, pillowZ + 2.5);
    rightCushion.rotation.x = 0.34;
    rightCushion.castShadow = true;
    realBedGroup.add(rightCushion);

    // 3. Luxury Cashmere Duvet / Bed Runner (Folded at Foot of Bed)
    const runnerGeo = new THREE.BoxGeometry(MATTRESS_WIDTH + 0.3, 0.42, 6.2);
    const runnerMat = new THREE.MeshStandardMaterial({
      map: duvetTex,
      roughness: 0.8,
    });
    const runnerMesh = new THREE.Mesh(runnerGeo, runnerMat);
    runnerMesh.position.set(0, -3.8 + settledMattressHeight + 0.22, MATTRESS_LENGTH / 2 - 3.4);
    runnerMesh.castShadow = true;
    runnerMesh.receiveShadow = true;
    realBedGroup.add(runnerMesh);

    // Drapes on left & right sides of the runner
    const drapeGeo = new THREE.BoxGeometry(0.35, 2.8, 6.2);
    const leftDrape = new THREE.Mesh(drapeGeo, runnerMat);
    leftDrape.position.set(-MATTRESS_WIDTH / 2 - 0.16, -3.8 + settledMattressHeight - 1.2, MATTRESS_LENGTH / 2 - 3.4);
    realBedGroup.add(leftDrape);

    const rightDrape = new THREE.Mesh(drapeGeo, runnerMat);
    rightDrape.position.set(MATTRESS_WIDTH / 2 + 0.16, -3.8 + settledMattressHeight - 1.2, MATTRESS_LENGTH / 2 - 3.4);
    realBedGroup.add(rightDrape);

    // Immediate visibility synchronization on build!
    realBedGroup.visible = isRealView && !isIsolatedMode;
    newGroups.forEach((g) => {
      g.visible = !isRealView && !isIsolatedMode;
    });
  }, [layers, isRealView, isIsolatedMode]);

  // ─── UPDATE EXPLOSION / REAL VIEW / ISOLATED SELECTION ──────────────────────
  useEffect(() => {
    targetGapRef.current = isRealView ? 0 : 1.35;

    // In Real Bed View, show the complete finished luxury bed (casing, pillows, duvet)
    // and hide the naked raw internal slices!
    if (realBedFinishedGroupRef.current) {
      realBedFinishedGroupRef.current.visible = isRealView && !isIsolatedMode;
    }
    if (bedFrameGroupRef.current) {
      bedFrameGroupRef.current.visible = !isIsolatedMode;
    }
    if (showroomRoomGroupRef.current) {
      showroomRoomGroupRef.current.visible = true;
    }

    const layerThicknesses = layers.map(([key]) => {
      if (key === 'spr') return 2.6;
      if (key === 'fab') return 1.4;
      if (key === 'soft' || key === 'lat') return 1.0;
      if (key === 'gel') return 0.9;
      if (key === 'hr') return 1.1;
      if (key === 'felt') return 0.35;
      return 0.8;
    });

    const totalHeight =
      layerThicknesses.reduce((a, b) => a + b, 0) + (layers.length - 1) * targetGapRef.current;

    let currentY = totalHeight / 2;

    layerMeshesRef.current.forEach((group, idx) => {
      const th = layerThicknesses[idx];
      const [key] = layers[idx];

      if (isRealView) {
        // Hide raw individual layer slices in Real Bed View
        group.visible = false;
      } else if (isIsolatedMode && isolatedLayerKey) {
        if (key === isolatedLayerKey) {
          group.visible = true;
          group.position.set(0, 0, 0);
          group.scale.set(1.18, 1.18, 1.18);
        } else {
          group.visible = false;
        }
      } else {
        // 3D Exploded View
        group.visible = true;
        group.scale.set(1, 1, 1);
        group.position.y = currentY - th / 2;

        if (hoveredLayerIndex === idx && !isRealView) {
          group.position.y += 0.45;
        }
      }

      currentY -= th + targetGapRef.current;
    });
  }, [isRealView, layers, isIsolatedMode, isolatedLayerKey, hoveredLayerIndex]);

  // ─── CAMERA PRESETS & PROPER DEFAULT ZOOM (SMOOTH LERP ANIMATION) ───────────
  useEffect(() => {
    if (isIsolatedMode) {
      targetCamPos.current.set(20, 13, 22);
      targetControlsTarget.current.set(0, 0, 0);
      isAnimatingCamera.current = true;
    } else if (cameraPreset === 0) {
      // 3D Exploded Isometric View (Proper wide showroom zoom out)
      targetCamPos.current.set(33, 18, 39);
      targetControlsTarget.current.set(2.4, -1.5, 0);
      isAnimatingCamera.current = true;
    } else if (cameraPreset === 1) {
      // Real Showroom Bed Hero View (Proper wide showroom zoom out)
      targetCamPos.current.set(31, 16, 36);
      targetControlsTarget.current.set(2.2, -1.8, 0);
      isAnimatingCamera.current = true;
    } else if (cameraPreset === 2) {
      // Corner Cutaway Zoom
      targetCamPos.current.set(16, 8, 16);
      targetControlsTarget.current.set(2.5, -1.5, 2.5);
      isAnimatingCamera.current = true;
    } else if (cameraPreset === 3) {
      // Top Quilt Macro
      targetCamPos.current.set(0, 26, 7);
      targetControlsTarget.current.set(0, 0, 0);
      isAnimatingCamera.current = true;
    }
  }, [cameraPreset, isIsolatedMode]);

  // ─── POINTER / TOUCH GESTURE HANDLING (REAL-TIME LIVE DRAG & DOUBLE PULL-OUT)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    pointerStartPos.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    isLayerSwipe.current = false;
    touchedLayerIdx.current = -1;

    const container = containerRef.current;
    const camera = cameraRef.current;
    if (!container || !camera) return;

    const rect = container.getBoundingClientRect();
    mouseVec.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseVec.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouseVec.current, camera);
    const intersects = raycaster.current.intersectObjects(layerMeshesRef.current, true);

    if (intersects.length > 0) {
      let obj: THREE.Object3D | null = intersects[0].object;
      while (obj && !(obj.userData && obj.userData.layerIndex !== undefined)) {
        obj = obj.parent;
      }
      if (obj && obj.userData && obj.userData.layerIndex !== undefined) {
        touchedLayerIdx.current = obj.userData.layerIndex;
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const dx = e.clientX - pointerStartPos.current.x;

    if (touchedLayerIdx.current >= 0 && !isRealView && !isIsolatedMode) {
      if (Math.abs(dx) > 8) {
        isLayerSwipe.current = true;
        if (controlsRef.current) {
          controlsRef.current.enabled = false;
        }
        // Live real-time physical layer drag tracking under finger/mouse
        const liveOffset = Math.min(0.5, Math.max(-7.5, dx * 0.035));
        targetSlideOffsetsRef.current[touchedLayerIdx.current] = liveOffset;
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    if (controlsRef.current) {
      controlsRef.current.enabled = true;
    }

    const dx = e.clientX - pointerStartPos.current.x;
    const dt = Date.now() - pointerStartPos.current.time;
    const layerIdx = touchedLayerIdx.current;

    if (layerIdx >= 0 && !isRealView && !isIsolatedMode) {
      const now = Date.now();
      const [key] = layers[layerIdx];

      // Double-tap on mobile/touch device within 350ms opens isolated 360° view
      if (Math.abs(dx) < 18 && dt < 280) {
        if (now - lastTapTimeRef.current < 350 && lastTapLayerRef.current === layerIdx) {
          if (onLayerOpenIsolated) onLayerOpenIsolated(key);
          lastTapTimeRef.current = 0;
          lastTapLayerRef.current = -1;
          touchedLayerIdx.current = -1;
          return;
        }
        lastTapTimeRef.current = now;
        lastTapLayerRef.current = layerIdx;
      }

      // Drag gestures
      if (dx < -100) {
        // Deep drag left -> open in isolated 360° inspection!
        if (onLayerOpenIsolated) onLayerOpenIsolated(key);
      } else if (dx < -22) {
        // Swipe left past threshold -> snap into pulled-out position (-5.8 units)
        if (setPulledLayerIndex) {
          setPulledLayerIndex(layerIdx);
        }
      } else if (Math.abs(dx) < 12 && dt < 280) {
        // Single click/tap -> toggle slide
        if (onLayerClick) onLayerClick(key, layerIdx);
        if (setPulledLayerIndex) {
          setPulledLayerIndex(pulledLayerIndex === layerIdx ? -1 : layerIdx);
        }
      } else {
        // Did not reach threshold -> smoothly spring back
        targetSlideOffsetsRef.current[layerIdx] = pulledLayerIndex === layerIdx ? -5.8 : 0;
      }
    }
    touchedLayerIdx.current = -1;
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const container = containerRef.current;
    const camera = cameraRef.current;
    if (!container || !camera) return;

    const rect = container.getBoundingClientRect();
    mouseVec.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseVec.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouseVec.current, camera);
    const intersects = raycaster.current.intersectObjects(layerMeshesRef.current, true);

    if (intersects.length > 0) {
      let obj: THREE.Object3D | null = intersects[0].object;
      while (obj && !(obj.userData && obj.userData.layerIndex !== undefined)) {
        obj = obj.parent;
      }
      if (obj && obj.userData && obj.userData.layerIndex !== undefined) {
        const idx = obj.userData.layerIndex;
        const [key] = layers[idx];
        if (onLayerOpenIsolated) {
          onLayerOpenIsolated(key);
        }
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        style={{ touchAction: 'none' }}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onLostPointerCapture={() => {
          if (controlsRef.current) controlsRef.current.enabled = true;
          touchedLayerIdx.current = -1;
        }}
        onDoubleClick={handleDoubleClick}
      />
    </div>
  );
};
