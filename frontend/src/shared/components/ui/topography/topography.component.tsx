import React, { useEffect, useRef, useState } from 'react';
import styles from './topography.module.css';

export type ColorMode = 'elevation' | 'uniform' | 'alternating';

export interface TopographyProps {
  lowColor?: string;
  midColor?: string;
  highColor?: string;
  speed?: number;
  morphAmount?: number;
  morphSpeed?: number;
  bands?: number;
  thickness?: number;
  scale?: number;
  pixelSize?: number;
  glow?: number;
  colorMode?: ColorMode;
  contrast?: number;
  brightness?: number;
  fillBands?: boolean;
  opacity?: number;
  grain?: boolean;
  grainIntensity?: number;
  mouseInteraction?: boolean;
  mouseRadius?: number;
  mouseStrength?: number;
  lightMode?: boolean;
  className?: string;
}

/**
 * Relationship background
 *
 * Keeps the original Topography component API so existing imports/props
 * do not need to change. The old contour-field renderer is replaced with
 * a lightweight SVG/CSS scene built around:
 * - interlocking rings
 * - heart outlines
 * - connection paths
 * - subtle home/living-together geometry
 * - soft floating particles
 *
 * No emoji, icon font, or external icon package is required.
 */
const Topography: React.FC<TopographyProps> = ({
  lowColor = '#5227FF',
  midColor = '#FF4FD8',
  highColor = '#FFFFFF',
  speed = 0.35,
  opacity = 1,
  glow = 0.5,
  mouseInteraction = true,
  mouseRadius = 0.3,
  mouseStrength = 0.4,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointerRef = useRef({ x: 0.5, y: 0.5, active: false });
  const rafRef = useRef<number | null>(null);
  const [pointer, setPointer] = useState({ x: 50, y: 50, active: false });

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !mouseInteraction) return;

    let frame = 0;

    const onMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));

      pointerRef.current = { x, y, active: true };

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setPointer({
          x: x * 100,
          y: y * 100,
          active: true,
        });
      });
    };

    const onLeave = () => {
      pointerRef.current.active = false;

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setPointer({ x: 50, y: 50, active: false });
      });
    };

    container.addEventListener('pointermove', onMove, { passive: true });
    container.addEventListener('pointerleave', onLeave, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      container.removeEventListener('pointermove', onMove);
      container.removeEventListener('pointerleave', onLeave);
    };
  }, [mouseInteraction]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const root = container.style;
    root.setProperty('--relationship-speed', `${Math.max(0.1, 1 / Math.max(speed, 0.05))}s`);
    root.setProperty('--relationship-opacity', `${Math.max(0, Math.min(1, opacity))}`);
    root.setProperty('--relationship-glow', `${Math.max(0, Math.min(1.5, glow))}`);
    root.setProperty('--relationship-low', lowColor);
    root.setProperty('--relationship-mid', midColor);
    root.setProperty('--relationship-high', highColor);
    root.setProperty('--pointer-x', `${pointer.x}%`);
    root.setProperty('--pointer-y', `${pointer.y}%`);
    root.setProperty('--pointer-strength', `${mouseStrength}`);
    root.setProperty('--pointer-radius', `${Math.max(0.08, mouseRadius)}`);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [
    lowColor,
    midColor,
    highColor,
    speed,
    opacity,
    glow,
    mouseRadius,
    mouseStrength,
    pointer.x,
    pointer.y,
  ]);

  const sceneClass = [
    styles.topographyContainer,
    pointer.active ? styles.pointerActive : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={containerRef}
      className={sceneClass}
      aria-hidden="true"
    >
      <div className={styles.ambientGlow} />

      <svg
        className={styles.relationshipScene}
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        <defs>
          <linearGradient id="mergeRelationshipGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={lowColor} />
            <stop offset="55%" stopColor={midColor} />
            <stop offset="100%" stopColor={lowColor} />
          </linearGradient>

          <radialGradient id="mergeHeartGlow">
            <stop offset="0%" stopColor={midColor} stopOpacity="0.42" />
            <stop offset="55%" stopColor={midColor} stopOpacity="0.12" />
            <stop offset="100%" stopColor={midColor} stopOpacity="0" />
          </radialGradient>

          <filter id="mergeSoftGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="mergeSmallGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Large continuous connection paths — the replacement for the old
            topographic contour lines. */}
        <g className={styles.connectionField}>
          <path
            className={`${styles.connectionLine} ${styles.lineA}`}
            d="M-80 170 C150 20 285 45 430 190 S720 420 875 250 S1190 -10 1690 170"
          />
          <path
            className={`${styles.connectionLine} ${styles.lineB}`}
            d="M-120 470 C140 270 285 280 470 455 S770 735 970 510 S1300 260 1710 430"
          />
          <path
            className={`${styles.connectionLine} ${styles.lineC}`}
            d="M-90 770 C165 575 320 620 500 790 S815 1010 1010 785 S1340 560 1690 730"
          />
          <path
            className={`${styles.connectionLine} ${styles.lineD}`}
            d="M180 -70 C320 110 390 160 505 115 S720 -20 845 105 S1030 360 1165 245 S1370 65 1510 -80"
          />
        </g>

        {/* Interlocking rings: connection + commitment/marriage symbolism. */}
        <g className={styles.rings} transform="translate(800 420)">
          <circle className={styles.ring} cx="-42" cy="0" r="94" />
          <circle className={`${styles.ring} ${styles.ringSecondary}`} cx="42" cy="0" r="94" />
          <circle className={styles.ringHighlight} cx="-42" cy="0" r="94" />
          <circle className={styles.ringHighlight} cx="42" cy="0" r="94" />
        </g>

        {/* A clean heart outline in the center. */}
        <g className={styles.centralHeart} transform="translate(800 420)">
          <path
            d="M0 84 C-22 60 -108 12 -108 -49 C-108 -91 -58 -112 -28 -79 L0 -48 L28 -79 C58 -112 108 -91 108 -49 C108 12 22 60 0 84Z"
            fill="none"
            stroke="url(#mergeRelationshipGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="0" cy="-15" r="155" fill="url(#mergeHeartGlow)" />
        </g>

        {/* Date / meeting motif: two elegant location-style heart markers
            connected by a single solid path. */}
        <g className={styles.dateConnection}>
          <path
            className={styles.datePath}
            d="M365 545 C505 625 575 625 680 545"
          />
          <path
            className={styles.datePath}
            d="M920 545 C1025 625 1095 625 1235 545"
          />

          <g transform="translate(330 515)">
            <path
              d="M35 82 C35 82 4 50 4 27 C4 10 17 -2 35 -2 C53 -2 66 10 66 27 C66 50 35 82 35 82Z"
              fill="none"
              stroke={midColor}
              strokeWidth="3"
            />
            <path
              d="M35 45 C25 36 17 30 17 21 C17 13 27 10 35 19 C43 10 53 13 53 21 C53 30 45 36 35 45Z"
              fill="none"
              stroke={midColor}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </g>

          <g transform="translate(1200 515)">
            <path
              d="M35 82 C35 82 4 50 4 27 C4 10 17 -2 35 -2 C53 -2 66 10 66 27 C66 50 35 82 35 82Z"
              fill="none"
              stroke={lowColor}
              strokeWidth="3"
            />
            <path
              d="M35 45 C25 36 17 30 17 21 C17 13 27 10 35 19 C43 10 53 13 53 21 C53 30 45 36 35 45Z"
              fill="none"
              stroke={lowColor}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </g>
        </g>

        {/* Home / living-together motif. */}
        <g className={styles.homeMotif} transform="translate(1220 185)">
          <path
            d="M-78 15 L0 -48 L78 15 V88 H-78Z"
            fill="none"
            stroke="url(#mergeRelationshipGradient)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M-26 88 V39 H26 V88 M-48 18 H-20 V-5 M48 18 H20 V-5"
            fill="none"
            stroke={midColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M-48 18 C-40 8 -30 8 -20 18 M48 18 C40 8 30 8 20 18"
            fill="none"
            stroke={lowColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* Small, sparse connection nodes — solid SVG circles, not dotted lines. */}
        <g className={styles.connectionNodes}>
          <circle cx="210" cy="210" r="5" />
          <circle cx="1380" cy="330" r="5" />
          <circle cx="285" cy="690" r="4" />
          <circle cx="1320" cy="690" r="4" />
          <circle cx="530" cy="140" r="4" />
          <circle cx="1070" cy="150" r="4" />
        </g>

        {/* Soft floating heart outlines. */}
        <g className={styles.floatingHearts}>
          <path
            className={styles.heartOne}
            d="M180 335 C165 316 132 324 132 351 C132 378 180 407 180 407 C180 407 228 378 228 351 C228 324 195 316 180 335Z"
          />
          <path
            className={styles.heartTwo}
            d="M1395 585 C1382 569 1355 576 1355 598 C1355 620 1395 645 1395 645 C1395 645 1435 620 1435 598 C1435 576 1408 569 1395 585Z"
          />
          <path
            className={styles.heartThree}
            d="M1030 730 C1020 717 999 721 999 739 C999 756 1030 776 1030 776 C1030 776 1061 756 1061 739 C1061 721 1040 717 1030 730Z"
          />
        </g>

        {/* A few "connection sparks" that travel along paths. */}
        <g className={styles.travelingPoints}>
          <circle className={styles.travelOne} r="4" />
          <circle className={styles.travelTwo} r="3.5" />
          <circle className={styles.travelThree} r="4" />
        </g>
      </svg>

      <div className={styles.pointerGlow} />
      <div className={styles.edgeFade} />
    </div>
  );
};

export default Topography;
