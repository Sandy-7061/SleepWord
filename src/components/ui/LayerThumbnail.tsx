import React from 'react';

interface LayerThumbnailProps {
  layerKey: string;
  className?: string;
  size?: number;
}

export const LayerThumbnail: React.FC<LayerThumbnailProps> = ({
  layerKey,
  className = '',
  size = 64,
}) => {
  // Returns a custom rendered SVG cutaway block matching the real material
  switch (layerKey) {
    case 'fab':
      // Quilted Fabric Cover thumbnail: plush tufted cushion with welt piping and dark border
      return (
        <svg
          viewBox="0 0 100 70"
          className={`rounded-xl overflow-hidden shadow-md ${className}`}
          style={{ width: size, height: (size * 70) / 100 }}
        >
          <defs>
            <linearGradient id="fabTop" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#f3f1ec" />
              <stop offset="100%" stopColor="#e2ded4" />
            </linearGradient>
            <linearGradient id="fabBorder" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1e2530" />
              <stop offset="100%" stopColor="#2c3545" />
            </linearGradient>
          </defs>
          {/* Base slab */}
          <path d="M50 8 L92 24 L50 40 L8 24 Z" fill="url(#fabTop)" />
          {/* Tuft stitches */}
          <circle cx="34" cy="20" r="2.5" fill="#c4bfb4" />
          <circle cx="66" cy="20" r="2.5" fill="#c4bfb4" />
          <circle cx="50" cy="26" r="3" fill="#b0aba0" />
          <path d="M34 20 L50 26 L66 20 M50 12 L50 26 L50 38" stroke="#d5d0c5" strokeWidth="1.2" fill="none" />
          {/* Piping cord */}
          <path d="M8 24 L50 40 L92 24" stroke="#ffffff" strokeWidth="2.5" fill="none" />
          {/* Front Left Border */}
          <path d="M8 24 L50 40 L50 56 L8 40 Z" fill="url(#fabBorder)" />
          {/* Front Right Border */}
          <path d="M50 40 L92 24 L92 40 L50 56 Z" fill="#181d26" />
          {/* SleepWorld Tag */}
          <rect x="58" y="36" width="22" height="8" rx="2" fill="#0f172a" stroke="#3b82f6" strokeWidth="0.8" />
          <circle cx="63" cy="40" r="1.8" fill="#60a5fa" />
          <line x1="68" y1="40" x2="76" y2="40" stroke="#ffffff" strokeWidth="1.5" />
        </svg>
      );

    case 'soft':
    case 'lat':
      // Super Soft Comfort Foam with perforated pinholes
      return (
        <svg
          viewBox="0 0 100 70"
          className={`rounded-xl overflow-hidden shadow-md ${className}`}
          style={{ width: size, height: (size * 70) / 100 }}
        >
          <defs>
            <linearGradient id="foamTop" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fffcf4" />
              <stop offset="100%" stopColor="#f7eccd" />
            </linearGradient>
          </defs>
          {/* Top Face */}
          <path d="M50 10 L92 26 L50 42 L8 26 Z" fill="url(#foamTop)" />
          {/* Pinholes */}
          {[
            [30, 22], [42, 18], [58, 18], [70, 22],
            [36, 28], [50, 26], [64, 28],
            [26, 28], [50, 34], [74, 28],
          ].map(([x, y], i) => (
            <g key={i}>
              <ellipse cx={x} cy={y} rx="2.5" ry="1.4" fill="#a88c52" />
              <ellipse cx={x} cy={y - 0.4} rx="1.6" ry="0.9" fill="#6e572d" />
            </g>
          ))}
          {/* Front Left Thickness */}
          <path d="M8 26 L50 42 L50 58 L8 42 Z" fill="#e8d9b0" />
          {/* Front Right Thickness */}
          <path d="M50 42 L92 26 L92 42 L50 58 Z" fill="#d4c294" />
          {/* Bevel highlight */}
          <path d="M8 26 L50 42 L92 26" stroke="#ffffff" strokeWidth="1" opacity="0.6" fill="none" />
        </svg>
      );

    case 'gel':
      // Cooling Gel Foam (vibrant blue with pores and gel beads)
      return (
        <svg
          viewBox="0 0 100 70"
          className={`rounded-xl overflow-hidden shadow-md ${className}`}
          style={{ width: size, height: (size * 70) / 100 }}
        >
          <defs>
            <linearGradient id="gelTop" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          <path d="M50 10 L92 26 L50 42 L8 26 Z" fill="url(#gelTop)" />
          {/* Gel pores */}
          {[
            [32, 20], [45, 18], [60, 22], [72, 24],
            [38, 28], [52, 28], [66, 30], [50, 36],
          ].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx="2.2" ry="1.2" fill="#0369a1" />
          ))}
          {/* Gel beads */}
          {[
            [28, 24], [55, 20], [68, 18], [44, 32],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.5" fill="#0c4a6e" />
          ))}
          {/* Front Left */}
          <path d="M8 26 L50 42 L50 58 L8 42 Z" fill="#0284c7" />
          {/* Front Right */}
          <path d="M50 42 L92 26 L92 42 L50 58 Z" fill="#0369a1" />
          {/* Edge highlight */}
          <path d="M8 26 L50 42 L92 26" stroke="#bae6fd" strokeWidth="1.2" fill="none" />
        </svg>
      );

    case 'hr':
      // High Resilience Foam (buttery warm solid foam block)
      return (
        <svg
          viewBox="0 0 100 70"
          className={`rounded-xl overflow-hidden shadow-md ${className}`}
          style={{ width: size, height: (size * 70) / 100 }}
        >
          <defs>
            <linearGradient id="hrTop" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="100%" stopColor="#fef3c7" />
            </linearGradient>
          </defs>
          <path d="M50 10 L92 26 L50 42 L8 26 Z" fill="url(#hrTop)" />
          {/* Front Left */}
          <path d="M8 26 L50 42 L50 58 L8 42 Z" fill="#fde68a" />
          {/* Front Right */}
          <path d="M50 42 L92 26 L92 42 L50 58 Z" fill="#f59e0b" />
          {/* Top highlight */}
          <path d="M8 26 L50 42 L92 26" stroke="#ffffff" strokeWidth="1.2" fill="none" opacity="0.7" />
        </svg>
      );

    case 'felt':
      // Premium Felt Layer (dense mottled fibrous grey pad)
      return (
        <svg
          viewBox="0 0 100 70"
          className={`rounded-xl overflow-hidden shadow-md ${className}`}
          style={{ width: size, height: (size * 70) / 100 }}
        >
          <defs>
            <linearGradient id="feltTop" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#9ca3af" />
              <stop offset="100%" stopColor="#6b7280" />
            </linearGradient>
          </defs>
          <path d="M50 16 L92 30 L50 44 L8 30 Z" fill="url(#feltTop)" />
          {/* Flecks */}
          {[
            [25, 28], [40, 24], [60, 26], [75, 32],
            [35, 34], [52, 36], [68, 36],
          ].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx="2" ry="1.2" fill={i % 2 === 0 ? '#374151' : '#e5e7eb'} opacity="0.6" />
          ))}
          {/* Front Left */}
          <path d="M8 30 L50 44 L50 54 L8 40 Z" fill="#4b5563" />
          {/* Front Right */}
          <path d="M50 44 L92 30 L92 40 L50 54 Z" fill="#374151" />
        </svg>
      );

    case 'spr':
      // Pocket Springs (array of white fabric pocketed cylinders)
      return (
        <svg
          viewBox="0 0 100 70"
          className={`rounded-xl overflow-hidden shadow-md ${className}`}
          style={{ width: size, height: (size * 70) / 100 }}
        >
          <defs>
            <linearGradient id="springCyl" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="30%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
          </defs>
          <rect width="100" height="70" fill="#0f172a" />
          {/* Row 1 back */}
          {[20, 38, 56, 74].map((x, i) => (
            <g key={i}>
              <ellipse cx={x} cy="18" rx="7" ry="3.5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.5" />
              <rect x={x - 7} y="18" width="14" height="20" fill="url(#springCyl)" />
              <ellipse cx={x} cy="38" rx="7" ry="3.5" fill="#94a3b8" />
            </g>
          ))}
          {/* Row 2 front */}
          {[12, 30, 48, 66, 84].map((x, i) => (
            <g key={i}>
              <ellipse cx={x} cy="30" rx="8" ry="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
              <rect x={x - 8} y="30" width="16" height="26" fill="url(#springCyl)" />
              <ellipse cx={x} cy="56" rx="8" ry="4" fill="#cbd5e1" />
              {/* Ultrasonic seam */}
              <line x1={x} y1="30" x2={x} y2="56" stroke="rgba(148,163,184,0.4)" strokeWidth="0.8" />
            </g>
          ))}
        </svg>
      );

    case 'base':
    default:
      // Anti-Slip Base (charcoal honeycomb grip foundation)
      return (
        <svg
          viewBox="0 0 100 70"
          className={`rounded-xl overflow-hidden shadow-md ${className}`}
          style={{ width: size, height: (size * 70) / 100 }}
        >
          <defs>
            <linearGradient id="baseTop" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>
          <path d="M50 12 L92 28 L50 44 L8 28 Z" fill="url(#baseTop)" />
          {/* Non-slip traction dots */}
          {[
            [26, 26], [38, 22], [62, 22], [74, 26],
            [34, 30], [50, 30], [66, 30],
            [44, 36], [56, 36],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.3" fill="#0f172a" />
          ))}
          {/* Front Left */}
          <path d="M8 28 L50 44 L50 58 L8 42 Z" fill="#0f172a" />
          {/* Front Right */}
          <path d="M50 44 L92 28 L92 42 L50 58 Z" fill="#020617" />
        </svg>
      );
  }
};

