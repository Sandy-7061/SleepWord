import * as THREE from 'three';

// Cache generated textures so we don't recreate them every render
const textureCache = new Map<string, THREE.CanvasTexture>();

function createOffscreen(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    draw(ctx);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 1. Quilted Pillow Top Texture (Plush diamond tufts with stitched seams)
export function getQuiltTexture(): { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const cacheKey = 'quilt_diffuse';
  if (!textureCache.has(cacheKey)) {
    const size = 1024;
    // Diffuse Map
    const map = createOffscreen(size, size, (ctx) => {
      // Base warm luxury white fabric
      ctx.fillStyle = '#f8f7f2';
      ctx.fillRect(0, 0, size, size);

      // Micro fabric weave noise
      const imgData = ctx.getImageData(0, 0, size, size);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 8;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
      }
      ctx.putImageData(imgData, 0, 0);

      // Diamond tufting cushions
      const step = size / 4;
      for (let y = 0; y < size + step; y += step) {
        for (let x = 0; x < size + step; x += step) {
          const cx = x + (Math.floor(y / step) % 2 === 0 ? 0 : step / 2);
          const cy = y;

          // Radial cushion puff highlight
          const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, step * 0.7);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
          grad.addColorStop(0.5, 'rgba(245, 243, 237, 0.4)');
          grad.addColorStop(0.85, 'rgba(215, 210, 200, 0.25)');
          grad.addColorStop(1, 'rgba(165, 158, 145, 0.5)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, step * 0.68, 0, Math.PI * 2);
          ctx.fill();

          // Tuft center dimple / button
          ctx.fillStyle = 'rgba(120, 112, 98, 0.6)';
          ctx.beginPath();
          ctx.arc(cx, cy, 7, 0, Math.PI * 2);
          ctx.fill();

          // Stitch lines connecting tufts
          ctx.strokeStyle = 'rgba(180, 172, 160, 0.55)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(cx - step / 2, cy - step / 2);
          ctx.lineTo(cx + step / 2, cy + step / 2);
          ctx.moveTo(cx + step / 2, cy - step / 2);
          ctx.lineTo(cx - step / 2, cy + step / 2);
          ctx.stroke();
        }
      }
    });

    // Bump Map (Greyscale depth)
    const bump = createOffscreen(size, size, (ctx) => {
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, size, size);

      const step = size / 4;
      for (let y = 0; y < size + step; y += step) {
        for (let x = 0; x < size + step; x += step) {
          const cx = x + (Math.floor(y / step) % 2 === 0 ? 0 : step / 2);
          const cy = y;

          const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, step * 0.7);
          grad.addColorStop(0, '#ffffff'); // Highest puff
          grad.addColorStop(0.7, '#a0a0a0');
          grad.addColorStop(1, '#202020'); // Deep seam groove

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, step * 0.68, 0, Math.PI * 2);
          ctx.fill();

          // Deep dimple
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(cx, cy, 8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    map.repeat.set(3, 4);
    bump.repeat.set(3, 4);
    textureCache.set('quilt_diffuse', map);
    textureCache.set('quilt_bump', bump);
  }

  return {
    map: textureCache.get('quilt_diffuse')!,
    bump: textureCache.get('quilt_bump')!,
  };
}

// 2. Dark Woven Fabric Border Texture (Sidewalls of pillow top)
export function getFabricBorderTexture(): THREE.CanvasTexture {
  const cacheKey = 'fabric_border';
  if (!textureCache.has(cacheKey)) {
    const size = 512;
    const tex = createOffscreen(size, size, (ctx) => {
      ctx.fillStyle = '#1c2330';
      ctx.fillRect(0, 0, size, size);

      // Fine jacquard weave pattern
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < size; i += 6) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, size);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(size, i);
        ctx.stroke();
      }
    });
    tex.repeat.set(6, 2);
    textureCache.set(cacheKey, tex);
  }
  return textureCache.get(cacheKey)!;
}

// 3. Perforated Latex / Comfort Foam Texture (Circular pinhole aeration channels)
export function getLatexPinholeTexture(): { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const cacheKey = 'latex_diffuse';
  if (!textureCache.has(cacheKey)) {
    const size = 512;
    const map = createOffscreen(size, size, (ctx) => {
      ctx.fillStyle = '#fbf5e6'; // Cream ivory foam
      ctx.fillRect(0, 0, size, size);

      // Soft cellular grain
      const imgData = ctx.getImageData(0, 0, size, size);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 10;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
      }
      ctx.putImageData(imgData, 0, 0);

      // Pinhole ventilation channels
      const step = size / 8;
      for (let y = 0; y < size; y += step) {
        for (let x = 0; x < size; x += step) {
          const shift = (Math.floor(y / step) % 2 === 0 ? 0 : step / 2);
          const px = x + shift;
          const py = y + step / 2;

          // Outer shadow ring
          ctx.fillStyle = '#a88c52';
          ctx.beginPath();
          ctx.arc(px, py, 11, 0, Math.PI * 2);
          ctx.fill();

          // Dark interior tunnel
          ctx.fillStyle = '#6e572d';
          ctx.beginPath();
          ctx.arc(px, py - 1, 7.5, 0, Math.PI * 2);
          ctx.fill();

          // Highlight rim
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(px, py + 1, 11, 0, Math.PI);
          ctx.stroke();
        }
      }
    });

    const bump = createOffscreen(size, size, (ctx) => {
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, size, size);

      const step = size / 8;
      for (let y = 0; y < size; y += step) {
        for (let x = 0; x < size; x += step) {
          const shift = (Math.floor(y / step) % 2 === 0 ? 0 : step / 2);
          const px = x + shift;
          const py = y + step / 2;

          ctx.fillStyle = '#000000'; // Hole cutout
          ctx.beginPath();
          ctx.arc(px, py, 10, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    map.repeat.set(4, 5);
    bump.repeat.set(4, 5);
    textureCache.set('latex_diffuse', map);
    textureCache.set('latex_bump', bump);
  }

  return {
    map: textureCache.get('latex_diffuse')!,
    bump: textureCache.get('latex_bump')!,
  };
}

// 4. Cooling Gel Foam Texture (Translucent sky-blue with pores and beads)
export function getCoolGelTexture(): THREE.CanvasTexture {
  const cacheKey = 'gel_diffuse';
  if (!textureCache.has(cacheKey)) {
    const size = 512;
    const tex = createOffscreen(size, size, (ctx) => {
      ctx.fillStyle = '#38bdf8'; // Sky blue
      ctx.fillRect(0, 0, size, size);

      // Micro-pores
      for (let i = 0; i < 400; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = 2 + Math.random() * 4;

        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0369a1';
        ctx.beginPath();
        ctx.arc(x, y - 0.5, r * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cooling gel beads
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = 1.5 + Math.random() * 2.5;

        ctx.fillStyle = '#0c4a6e';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    tex.repeat.set(4, 5);
    textureCache.set(cacheKey, tex);
  }
  return textureCache.get(cacheKey)!;
}

// 5. Felt Layer Texture (Mottled heather grey fibrous pad)
export function getFeltTexture(): THREE.CanvasTexture {
  const cacheKey = 'felt_diffuse';
  if (!textureCache.has(cacheKey)) {
    const size = 512;
    const tex = createOffscreen(size, size, (ctx) => {
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(0, 0, size, size);

      const flecks = [
        'rgba(31, 41, 55, 0.7)',
        'rgba(156, 163, 175, 0.6)',
        'rgba(243, 244, 246, 0.4)',
        'rgba(55, 65, 81, 0.8)',
      ];

      for (let i = 0; i < 1500; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const rx = 3 + Math.random() * 6;
        const ry = 1.5 + Math.random() * 3;
        const rot = Math.random() * Math.PI;

        ctx.fillStyle = flecks[i % flecks.length];
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    tex.repeat.set(3, 4);
    textureCache.set(cacheKey, tex);
  }
  return textureCache.get(cacheKey)!;
}

// 6. Pocket Spring Fabric Sleeve Texture (Non-woven fabric with vertical seam)
export function getPocketSpringSleeveTexture(): THREE.CanvasTexture {
  const cacheKey = 'spring_sleeve';
  if (!textureCache.has(cacheKey)) {
    const size = 256;
    const tex = createOffscreen(size, size, (ctx) => {
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, 0, size, size);

      // Vertical ultrasonic weld line
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(size / 2, 0);
      ctx.lineTo(size / 2, size);
      ctx.stroke();

      // Translucent spiral coil ring shadows
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
      ctx.lineWidth = 5;
      for (let y = 30; y < size; y += 45) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size, y);
        ctx.stroke();
      }
    });
    textureCache.set(cacheKey, tex);
  }
  return textureCache.get(cacheKey)!;
}

// 7. Anti-Slip Base Texture (Dark honeycomb non-skid dots)
export function getAntiSlipTexture(): THREE.CanvasTexture {
  const cacheKey = 'antislip_diffuse';
  if (!textureCache.has(cacheKey)) {
    const size = 512;
    const tex = createOffscreen(size, size, (ctx) => {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, size, size);

      // Rubber traction dots
      const step = 24;
      for (let y = 0; y < size; y += step) {
        for (let x = 0; x < size; x += step) {
          const shift = (Math.floor(y / step) % 2 === 0 ? 0 : step / 2);
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(x + shift, y + step / 2, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
    tex.repeat.set(5, 7);
    textureCache.set(cacheKey, tex);
  }
  return textureCache.get(cacheKey)!;
}

// 8. Luxury Showroom Rug Texture (Soft woven wool carpet)
export function getShowroomRugTexture(): THREE.CanvasTexture {
  const cacheKey = 'showroom_rug';
  if (!textureCache.has(cacheKey)) {
    const size = 512;
    const tex = createOffscreen(size, size, (ctx) => {
      // Soft heather charcoal/taupe wool rug
      ctx.fillStyle = '#1e2430';
      ctx.fillRect(0, 0, size, size);

      // Micro woven carpet loops
      const imgData = ctx.getImageData(0, 0, size, size);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 16;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise + 2));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise + 4));
      }
      ctx.putImageData(imgData, 0, 0);

      // Fine woven border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 2;
      for (let i = 0; i < size; i += 12) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, size);
        ctx.stroke();
      }
    });
    tex.repeat.set(8, 8);
    textureCache.set(cacheKey, tex);
  }
  return textureCache.get(cacheKey)!;
}

// 9. Luxury Bed Frame Headboard Texture (Walnut wood + upholstered channels)
export function getHeadboardTexture(): THREE.CanvasTexture {
  const cacheKey = 'headboard_wood';
  if (!textureCache.has(cacheKey)) {
    const size = 512;
    const tex = createOffscreen(size, size, (ctx) => {
      // Rich walnut wood base
      const grad = ctx.createLinearGradient(0, 0, size, 0);
      grad.addColorStop(0, '#3e2718');
      grad.addColorStop(0.3, '#4a301e');
      grad.addColorStop(0.7, '#331d10');
      grad.addColorStop(1, '#4a301e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Wood grain lines
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * size;
        ctx.strokeStyle = 'rgba(20, 10, 5, 0.35)';
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.bezierCurveTo(x + 10, size * 0.3, x - 10, size * 0.7, x + 5, size);
        ctx.stroke();
      }

      // Vertical fluted channels
      const step = size / 6;
      for (let x = 0; x < size; x += step) {
        // Channel shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(x, 0, 6, size);
        // Channel golden highlight
        ctx.fillStyle = 'rgba(212, 175, 55, 0.25)';
        ctx.fillRect(x + 6, 0, 3, size);
      }
    });
    tex.repeat.set(2, 1);
    textureCache.set(cacheKey, tex);
  }
  return textureCache.get(cacheKey)!;
}

// 10. Warm Showroom Architectural Background Texture
export function getShowroomBackgroundTexture(): THREE.CanvasTexture {
  const cacheKey = 'showroom_bg';
  if (!textureCache.has(cacheKey)) {
    const w = 2048;
    const h = 1024;
    const tex = createOffscreen(w, h, (ctx) => {
      // 1. Soft Warm Showroom Ambient Backdrop
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#111827');
      bgGrad.addColorStop(0.35, '#1e293b');
      bgGrad.addColorStop(0.7, '#182232');
      bgGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Ceiling Recessed Spotlights & Warm Light Cones
      const spotXs = [w * 0.15, w * 0.35, w * 0.55, w * 0.75, w * 0.9];
      spotXs.forEach((sx) => {
        // Spotlight cone
        const coneGrad = ctx.createRadialGradient(sx, 0, 20, sx, h * 0.7, w * 0.25);
        coneGrad.addColorStop(0, 'rgba(254, 243, 199, 0.28)');
        coneGrad.addColorStop(0.25, 'rgba(251, 191, 36, 0.12)');
        coneGrad.addColorStop(0.65, 'rgba(245, 158, 11, 0.04)');
        coneGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = coneGrad;
        ctx.beginPath();
        ctx.ellipse(sx, 0, w * 0.2, h * 0.9, 0, 0, Math.PI);
        ctx.fill();

        // Spotlight fixture
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(sx, 12, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(sx, 12, 22, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Architectural Wood Slatted Wall (Left to Center)
      const slatStartX = w * 0.05;
      const slatEndX = w * 0.42;
      const slatW = 16;
      for (let x = slatStartX; x < slatEndX; x += slatW * 2) {
        // Dark walnut slat
        ctx.fillStyle = '#2b1b11';
        ctx.fillRect(x, h * 0.12, slatW, h * 0.76);

        // Warm linear LED cove glow between slats
        const glow = ctx.createLinearGradient(x + slatW, 0, x + slatW * 2, 0);
        glow.addColorStop(0, 'rgba(245, 158, 11, 0.18)');
        glow.addColorStop(0.5, 'rgba(217, 119, 6, 0.08)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        ctx.fillStyle = glow;
        ctx.fillRect(x + slatW, h * 0.12, slatW, h * 0.76);
      }

      // 4. Center-Left Feature Wall: Illuminated "SleepWorld" Showroom Sign
      const signX = w * 0.24;
      const signY = h * 0.38;

      // Soft circular wall back-glow for sign
      const signGlow = ctx.createRadialGradient(signX, signY, 30, signX, signY, 260);
      signGlow.addColorStop(0, 'rgba(251, 191, 36, 0.25)');
      signGlow.addColorStop(0.4, 'rgba(217, 119, 6, 0.1)');
      signGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = signGlow;
      ctx.beginPath();
      ctx.arc(signX, signY, 260, 0, Math.PI * 2);
      ctx.fill();

      // Brand Wave Logo Icon on wall
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.arc(signX - 160, signY, 24, 0, Math.PI * 2);
      ctx.fill();

      // "SleepWorld" Warm Metallic Sign
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 54px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('SleepWorld', signX - 120, signY);

      ctx.fillStyle = '#fde68a';
      ctx.font = '600 22px system-ui, sans-serif';
      ctx.fillText('SHOWROOM GALLERY', signX - 116, signY + 38);

      // 5. Right Side: Large Panoramic Showroom Boutique Window
      const winX = w * 0.58;
      const winW = w * 0.38;
      const winY = h * 0.1;
      const winH = h * 0.78;

      // Window evening ambient view
      const winGrad = ctx.createLinearGradient(0, winY, 0, winY + winH);
      winGrad.addColorStop(0, '#0a101d');
      winGrad.addColorStop(0.5, '#131e32');
      winGrad.addColorStop(0.85, '#1e293b');
      winGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = winGrad;
      ctx.fillRect(winX, winY, winW, winH);

      // Window mullions / architectural frames
      ctx.strokeStyle = '#27354a';
      ctx.lineWidth = 10;
      ctx.strokeRect(winX, winY, winW, winH);
      ctx.beginPath();
      ctx.moveTo(winX + winW / 2, winY);
      ctx.lineTo(winX + winW / 2, winY + winH);
      ctx.stroke();

      // Translucent sheer curtains hanging on edges
      const curtainGrad = ctx.createLinearGradient(winX, 0, winX + 80, 0);
      curtainGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      curtainGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.15)');
      curtainGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = curtainGrad;
      ctx.fillRect(winX, winY, 120, winH);

      // 6. Modern Showroom Lounge Furniture Silhouette (Sofa / Credenza)
      const furnX = w * 0.1;
      const furnY = h * 0.62;
      ctx.fillStyle = '#1e2430';
      ctx.beginPath();
      ctx.roundRect(furnX, furnY, 320, 95, 12);
      ctx.fill();
      ctx.fillStyle = '#283142';
      ctx.beginPath();
      ctx.roundRect(furnX + 15, furnY + 12, 140, 70, 8);
      ctx.roundRect(furnX + 165, furnY + 12, 140, 70, 8);
      ctx.fill();

      // 7. Large Indoor Fiddle-Leaf Fig / Monstera Plant
      const plantX = w * 0.52;
      const plantY = h * 0.56;

      // Ceramic planter pot
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(plantX - 28, plantY + 120);
      ctx.lineTo(plantX + 28, plantY + 120);
      ctx.lineTo(plantX + 22, plantY + 190);
      ctx.lineTo(plantX - 22, plantY + 190);
      ctx.closePath();
      ctx.fill();

      // Lush green tropical leaves
      const leafColors = ['#15803d', '#166534', '#14532d', '#22c55e', '#1e3a1e'];
      const leaves = [
        [-35, -40, 36, 60, -0.6],
        [40, -30, 40, 65, 0.7],
        [-15, -80, 38, 70, -0.2],
        [20, -75, 42, 68, 0.3],
        [-50, 10, 35, 55, -0.8],
        [48, 15, 38, 58, 0.9],
        [0, -110, 45, 75, 0.05],
      ];

      leaves.forEach(([lx, ly, lw, lh, lrot], idx) => {
        ctx.save();
        ctx.translate(plantX + lx, plantY + ly + 40);
        ctx.rotate(lrot);
        ctx.fillStyle = leafColors[idx % leafColors.length];
        ctx.beginPath();
        ctx.ellipse(0, 0, lw, lh, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 8. Soft Warm Showroom Floor Line
      const floorGrad = ctx.createLinearGradient(0, h * 0.84, 0, h);
      floorGrad.addColorStop(0, '#1a2332');
      floorGrad.addColorStop(0.3, '#141c28');
      floorGrad.addColorStop(1, '#0b1017');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, h * 0.84, w, h * 0.16);
    });
    textureCache.set(cacheKey, tex);
  }
  return textureCache.get(cacheKey)!;
}

// 11. Luxury Showroom Polished Floor Texture (High-end terrazzo/hardwood with soft reflection)
export function getShowroomFloorTexture(): THREE.CanvasTexture {
  const cacheKey = 'showroom_floor';
  if (!textureCache.has(cacheKey)) {
    const size = 1024;
    const tex = createOffscreen(size, size, (ctx) => {
      // Warm dark terrazzo floor
      ctx.fillStyle = '#161e2b';
      ctx.fillRect(0, 0, size, size);

      // Fine marble / terrazzo stone chips
      const flecks = [
        'rgba(241, 245, 249, 0.18)',
        'rgba(148, 163, 184, 0.15)',
        'rgba(51, 65, 85, 0.3)',
        'rgba(217, 119, 6, 0.12)', // warm honey flecks
      ];

      for (let i = 0; i < 2500; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = 1 + Math.random() * 2.5;
        ctx.fillStyle = flecks[i % flecks.length];
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Large floor tile grid joints
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, size / 2, size / 2);
      ctx.strokeRect(size / 2, 0, size / 2, size / 2);
      ctx.strokeRect(0, size / 2, size / 2, size / 2);
      ctx.strokeRect(size / 2, size / 2, size / 2, size / 2);
    });
    tex.repeat.set(8, 8);
    textureCache.set(cacheKey, tex);
  }
  return textureCache.get(cacheKey)!;
}

// 12. Full Luxury Finished Mattress Sidewall Texture (High-GSM border, channel stitching, handles, emblem)
export function getLuxuryMattressSideTexture(): THREE.CanvasTexture {
  const cacheKey = 'luxury_mattress_side';
  if (!textureCache.has(cacheKey)) {
    const w = 1024;
    const h = 512;
    const tex = createOffscreen(w, h, (ctx) => {
      // 1. Base dark charcoal/slate luxury upholstery jacquard
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#1c2534');
      bgGrad.addColorStop(0.5, '#161e2b');
      bgGrad.addColorStop(1, '#111722');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Micro jacquard cross-weave texture
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 14;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise + 2));
      }
      ctx.putImageData(imgData, 0, 0);

      // 3. Vertical Channel Padded Tufting Lines
      const channelStep = 64;
      for (let x = 0; x < w; x += channelStep) {
        // Deep groove shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(x, 0, 4, h);
        // Highlight ridge
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(x + 4, 0, 2, h);
      }

      // 4. Horizontal Contrast Tape & Piping Bands
      const bandYs = [h * 0.18, h * 0.82];
      bandYs.forEach((by) => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, by - 6, w, 12);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, by - 6, w, 12);
      });

      // 5. Stitched Fabric Mattress Turning Handles
      const handleXs = [w * 0.25, w * 0.75];
      handleXs.forEach((hx) => {
        // Handle strap
        ctx.fillStyle = '#222f42';
        ctx.beginPath();
        ctx.roundRect(hx - 70, h * 0.42, 140, 36, 8);
        ctx.fill();

        // Handle border & double-stitching
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Reinforced Box-X stitches at both ends
        [-52, 52].forEach((sx) => {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(hx + sx - 10, h * 0.42 + 6, 20, 24);
          ctx.beginPath();
          ctx.moveTo(hx + sx - 10, h * 0.42 + 6);
          ctx.lineTo(hx + sx + 10, h * 0.42 + 30);
          ctx.moveTo(hx + sx + 10, h * 0.42 + 6);
          ctx.lineTo(hx + sx - 10, h * 0.42 + 30);
          ctx.stroke();
        });
      });

      // 6. Embroidered SleepWorld Emblem Badge (Center)
      const badgeX = w * 0.5;
      const badgeY = h * 0.48;

      ctx.fillStyle = '#0a101d';
      ctx.beginPath();
      ctx.roundRect(badgeX - 110, badgeY - 32, 220, 64, 10);
      ctx.fill();

      // Silver/Blue embroidered frame
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.strokeRect(badgeX - 106, badgeY - 28, 212, 56);

      // Blue Wave Logo
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(badgeX - 70, badgeY, 14, 0, Math.PI * 2);
      ctx.fill();

      // "SleepWorld" text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('SleepWorld', badgeX - 48, badgeY - 4);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 10px system-ui, sans-serif';
      ctx.fillText('HANDCRAFTED LUXURY', badgeX - 46, badgeY + 14);
    });
    tex.repeat.set(1, 1);
    textureCache.set(cacheKey, tex);
  }
  return textureCache.get(cacheKey)!;
}

// 13. Luxury Bed Pillows Texture (1000TC White Cotton Sateen)
export function getPillowTexture(): THREE.CanvasTexture {
  const cacheKey = 'luxury_pillow';
  if (!textureCache.has(cacheKey)) {
    const size = 512;
    const tex = createOffscreen(size, size, (ctx) => {
      // Crisp sateen white
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, size, size);

      // Fine micro cotton weave
      const imgData = ctx.getImageData(0, 0, size, size);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 8;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
      }
      ctx.putImageData(imgData, 0, 0);

      // Soft pillow center hollow shading
      const grad = ctx.createRadialGradient(size / 2, size / 2, 20, size / 2, size / 2, size * 0.48);
      grad.addColorStop(0, 'rgba(226, 232, 240, 0.35)');
      grad.addColorStop(0.7, 'rgba(241, 245, 249, 0.15)');
      grad.addColorStop(1, 'rgba(203, 213, 225, 0.4)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Perimeter stitched welt seam
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.lineWidth = 4;
      ctx.strokeRect(12, 12, size - 24, size - 24);
    });
    textureCache.set(cacheKey, tex);
  }
  return textureCache.get(cacheKey)!;
}

// 14. Luxury Duvet Bed Runner / Throw Texture
export function getDuvetRunnerTexture(): THREE.CanvasTexture {
  const cacheKey = 'duvet_runner';
  if (!textureCache.has(cacheKey)) {
    const size = 512;
    const tex = createOffscreen(size, size, (ctx) => {
      // Elegant Slate Blue Cashmere Waffle
      ctx.fillStyle = '#243247';
      ctx.fillRect(0, 0, size, size);

      // Waffle weave matrix
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
      ctx.lineWidth = 2;
      for (let i = 0; i < size; i += 16) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, size);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(size, i);
        ctx.stroke();
      }

      // Elegant gold trim border
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(0, 0, size, 8);
      ctx.fillRect(0, size - 8, size, 8);
    });
    tex.repeat.set(4, 2);
    textureCache.set(cacheKey, tex);
  }
  return textureCache.get(cacheKey)!;
}

// Backward compatibility helpers for legacy files
export function generateBedWoodTexture(): THREE.CanvasTexture {
  return createOffscreen(256, 256, (ctx) => {
    ctx.fillStyle = '#5A3E28';
    ctx.fillRect(0, 0, 256, 256);
  });
}

export function generateLayerTexture(
  layerTypeKey: string,
  pattern?: [string, string, string],
  isCutOrWall?: boolean | string,
  wallColor?: string
): THREE.CanvasTexture {
  return createOffscreen(256, 256, (ctx) => {
    ctx.fillStyle = '#f8f7f2';
    ctx.fillRect(0, 0, 256, 256);
  });
}

