"use client";

import { motion } from "framer-motion";

type ShapeKind =
  | "circle"
  | "ring"
  | "squiggle"
  | "star"
  | "heart"
  | "zigzag"
  | "plus"
  | "triangle"
  | "blob"
  | "arc"
  | "dots";

interface Shape {
  kind: ShapeKind;
  left: string;
  top: string;
  size: number;
  color: string;
  rotate: number;
  drift: number;
  duration: number;
}

/**
 * Positions are hardcoded rather than random: this renders on the server
 * too, and random values would differ on hydration.
 */
const SHAPES: Shape[] = [
  { kind: "squiggle", left: "4%", top: "8%", size: 64, color: "#fbbf24", rotate: -12, drift: 10, duration: 13 },
  { kind: "ring", left: "13%", top: "22%", size: 40, color: "#38bdf8", rotate: 0, drift: -12, duration: 15 },
  { kind: "star", left: "22%", top: "6%", size: 30, color: "#f472b6", rotate: 14, drift: 8, duration: 11 },
  { kind: "dots", left: "31%", top: "16%", size: 46, color: "#a78bfa", rotate: 0, drift: -9, duration: 17 },
  { kind: "heart", left: "44%", top: "5%", size: 30, color: "#fb7185", rotate: -8, drift: 11, duration: 12 },
  { kind: "zigzag", left: "58%", top: "11%", size: 58, color: "#22c55e", rotate: 6, drift: -10, duration: 14 },
  { kind: "circle", left: "70%", top: "6%", size: 26, color: "#fbbf24", rotate: 0, drift: 9, duration: 16 },
  { kind: "plus", left: "80%", top: "17%", size: 30, color: "#38bdf8", rotate: 12, drift: -8, duration: 12 },
  { kind: "blob", left: "90%", top: "9%", size: 58, color: "#f472b6", rotate: -10, drift: 12, duration: 18 },
  { kind: "arc", left: "6%", top: "38%", size: 52, color: "#a78bfa", rotate: 18, drift: -11, duration: 15 },
  { kind: "triangle", left: "17%", top: "48%", size: 34, color: "#fb923c", rotate: -14, drift: 10, duration: 13 },
  { kind: "star", left: "27%", top: "36%", size: 24, color: "#22c55e", rotate: 8, drift: -7, duration: 11 },
  { kind: "ring", left: "38%", top: "45%", size: 44, color: "#fb7185", rotate: 0, drift: 12, duration: 19 },
  { kind: "squiggle", left: "52%", top: "34%", size: 60, color: "#38bdf8", rotate: 10, drift: -10, duration: 14 },
  { kind: "dots", left: "65%", top: "44%", size: 42, color: "#fbbf24", rotate: 0, drift: 8, duration: 16 },
  { kind: "heart", left: "77%", top: "35%", size: 26, color: "#a78bfa", rotate: 12, drift: -9, duration: 12 },
  { kind: "circle", left: "88%", top: "46%", size: 34, color: "#22c55e", rotate: 0, drift: 11, duration: 17 },
  { kind: "plus", left: "3%", top: "62%", size: 28, color: "#f472b6", rotate: -8, drift: -10, duration: 13 },
  { kind: "blob", left: "14%", top: "74%", size: 54, color: "#38bdf8", rotate: 16, drift: 9, duration: 18 },
  { kind: "zigzag", left: "26%", top: "64%", size: 54, color: "#fb923c", rotate: -6, drift: -12, duration: 15 },
  { kind: "star", left: "39%", top: "76%", size: 28, color: "#fbbf24", rotate: 10, drift: 10, duration: 12 },
  { kind: "arc", left: "51%", top: "66%", size: 48, color: "#22c55e", rotate: -20, drift: -8, duration: 16 },
  { kind: "ring", left: "63%", top: "78%", size: 38, color: "#a78bfa", rotate: 0, drift: 11, duration: 14 },
  { kind: "triangle", left: "74%", top: "63%", size: 32, color: "#f472b6", rotate: 18, drift: -9, duration: 13 },
  { kind: "dots", left: "86%", top: "74%", size: 44, color: "#38bdf8", rotate: 0, drift: 8, duration: 17 },
  { kind: "heart", left: "95%", top: "60%", size: 24, color: "#fb7185", rotate: -12, drift: -10, duration: 12 },
  { kind: "squiggle", left: "8%", top: "88%", size: 56, color: "#a78bfa", rotate: 8, drift: 9, duration: 15 },
  { kind: "circle", left: "34%", top: "92%", size: 22, color: "#f472b6", rotate: 0, drift: -8, duration: 14 },
  { kind: "plus", left: "58%", top: "90%", size: 26, color: "#22c55e", rotate: 14, drift: 10, duration: 12 },
  { kind: "blob", left: "82%", top: "92%", size: 50, color: "#fbbf24", rotate: -12, drift: -11, duration: 18 },
];

function ShapeSvg({ kind, size, color }: { kind: ShapeKind; size: number; color: string }) {
  const common = { width: size, height: size, viewBox: "0 0 40 40", fill: "none" as const };
  const stroke = { stroke: color, strokeWidth: 4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  switch (kind) {
    case "circle":
      return (
        <svg {...common}>
          <circle cx="20" cy="20" r="14" fill={color} />
        </svg>
      );
    case "ring":
      return (
        <svg {...common}>
          <circle cx="20" cy="20" r="14" {...stroke} />
        </svg>
      );
    case "squiggle":
      return (
        <svg {...common}>
          <path d="M4 26c4-10 8-10 12 0s8 10 12 0 8-10 8-4" {...stroke} />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="M20 4l4 11 11 4-11 4-4 11-4-11-11-4 11-4z" fill={color} />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path
            d="M20 33S6 25 6 16a7 7 0 0114-3 7 7 0 0114 3c0 9-14 17-14 17z"
            fill={color}
          />
        </svg>
      );
    case "zigzag":
      return (
        <svg {...common}>
          <path d="M3 26l7-11 7 11 7-11 7 11" {...stroke} />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M20 7v26M7 20h26" {...stroke} />
        </svg>
      );
    case "triangle":
      return (
        <svg {...common}>
          <path d="M20 6l14 26H6z" {...stroke} />
        </svg>
      );
    case "blob":
      return (
        <svg {...common}>
          <path
            d="M32 14c3 6 1 14-5 17s-14 1-18-4S6 12 13 8s16 0 19 6z"
            fill={color}
          />
        </svg>
      );
    case "arc":
      return (
        <svg {...common}>
          <path d="M6 30a14 14 0 0128 0" {...stroke} />
        </svg>
      );
    case "dots":
      return (
        <svg {...common}>
          {[8, 20, 32].map((cy) =>
            [8, 20, 32].map((cx) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" fill={color} />)
          )}
        </svg>
      );
  }
}

/**
 * Confetti of soft doodles behind the page. Lots of shapes, but kept at
 * low opacity so they never fight with the content for attention.
 */
export function PlayfulBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-cream">
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(34,197,94,0.10), transparent 70%), radial-gradient(50% 40% at 85% 60%, rgba(244,114,182,0.10), transparent 70%), radial-gradient(45% 40% at 10% 75%, rgba(56,189,248,0.10), transparent 70%)",
        }}
      />

      {SHAPES.map((shape, i) => (
        <motion.div
          key={i}
          className="absolute opacity-[0.28]"
          style={{ left: shape.left, top: shape.top, rotate: shape.rotate }}
          animate={{ y: [0, shape.drift, 0] }}
          transition={{ duration: shape.duration, repeat: Infinity, ease: "easeInOut" }}
        >
          <ShapeSvg kind={shape.kind} size={shape.size} color={shape.color} />
        </motion.div>
      ))}
    </div>
  );
}
