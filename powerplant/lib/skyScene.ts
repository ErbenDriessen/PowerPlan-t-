// powerplant/lib/skyScene.ts
//
// "Portable scene engine" voor het raam-uitzicht op het Mijn boom-scherm.
// Pure functies, geen React/DOM — gebaseerd op het prototype
// "Forest dynamic.html". sceneAt(minutes) geeft één plain object terug met
// alle kleuren/posities voor dat tijdstip; Forest.tsx leest daaruit.
//
// De keyframes ankeren op de BESTAANDE day/dusk/night-paletten van de app,
// zodat 12:00 er identiek uitziet als de oude vaste "dag"-stand. Tussen de
// keyframes wordt alles continu geïnterpoleerd, en de zon/maan boog echt
// over de lucht.

// ───────── Kleur-helpers ─────────
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
export function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

function hexToRgb(h: string): [number, number, number] {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.round(v).toString(16).padStart(2, "0");
  return "#" + c(r) + c(g) + c(b);
}
export function hexLerp(h1: string, h2: string, t: number): string {
  const a = hexToRgb(h1);
  const b = hexToRgb(h2);
  return rgbToHex(lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t));
}

// Parse "rgba(r,g,b,a)" / "rgb(r,g,b)" → [r,g,b,a].
function parseRgba(s: string): [number, number, number, number] {
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (!m) return [0, 0, 0, 0];
  const parts = m[1].split(",").map((x) => parseFloat(x.trim()));
  return [parts[0], parts[1], parts[2], parts[3] ?? 1];
}
export function rgbaLerp(s1: string, s2: string, t: number): string {
  const a = parseRgba(s1);
  const b = parseRgba(s2);
  const r = Math.round(lerp(a[0], b[0], t));
  const g = Math.round(lerp(a[1], b[1], t));
  const bl = Math.round(lerp(a[2], b[2], t));
  const al = lerp(a[3], b[3], t);
  return `rgba(${r},${g},${bl},${+al.toFixed(3)})`;
}

// ───────── Scene-vorm ─────────
export type SceneFrame = {
  sky: string[]; // 8 hex-stops, top→bottom
  mtn: [string, string]; // back, front
  mtnOp: [number, number];
  hill: [string, string];
  hillOp: [number, number];
  grass: [string, string, string]; // 3 rgba-stops
  fog1: [string, string, string]; // rgba: top, mid, bottom
  fog2: [string, string, string];
  tint: string; // rgba over het bos (sfeer)
  stars: number; // 0..1 opacity
  windowLight: number; // 0..1 warm binnenlicht
  phase: string;
};

// De drie ankers = exact de huidige paletten uit Forest.tsx.
const DAY: SceneFrame = {
  sky: ["#8FCBE6", "#B3D7E8", "#D5E1D2", "#A8B597", "#7A8F5F", "#5C7B40", "#4B6932", "#618845"],
  mtn: ["#7A8678", "#6A7468"],
  mtnOp: [0.55, 0.4],
  hill: ["#5A7A48", "#446036"],
  hillOp: [0.7, 0.5],
  grass: ["rgba(70,110,50,0)", "rgba(70,110,50,0.4)", "rgba(85,130,60,0.6)"],
  fog1: ["rgba(15,28,22,0)", "rgba(15,28,22,0.18)", "rgba(15,28,22,0.26)"],
  fog2: ["rgba(15,28,22,0)", "rgba(15,28,22,0.13)", "rgba(15,28,22,0.2)"],
  tint: "rgba(160,70,30,0)",
  stars: 0,
  windowLight: 0,
  phase: "dag",
};
const DUSK: SceneFrame = {
  sky: ["#F4A968", "#F6B584", "#ED9C76", "#BD8C84", "#87766E", "#5C6B58", "#455942", "#3D5938"],
  mtn: ["#7A6470", "#5C4D5A"],
  mtnOp: [0.6, 0.5],
  hill: ["#5A4D4E", "#3D3636"],
  hillOp: [0.75, 0.6],
  grass: ["rgba(60,80,55,0)", "rgba(60,80,55,0.5)", "rgba(50,75,45,0.7)"],
  fog1: ["rgba(40,30,28,0)", "rgba(40,30,28,0.2)", "rgba(40,30,28,0.3)"],
  fog2: ["rgba(40,30,28,0)", "rgba(40,30,28,0.14)", "rgba(40,30,28,0.22)"],
  tint: "rgba(160,70,30,0.18)",
  stars: 0,
  windowLight: 0.15,
  phase: "schemering",
};
const NIGHT: SceneFrame = {
  sky: ["#1B2D52", "#2A3F6B", "#314765", "#2D3C53", "#243349", "#1F2D40", "#1A2533", "#1C2E27"],
  mtn: ["#1B2540", "#131C2E"],
  mtnOp: [0.85, 0.7],
  hill: ["#0F1A22", "#0A141A"],
  hillOp: [0.85, 0.75],
  grass: ["rgba(30,55,40,0)", "rgba(30,55,40,0.55)", "rgba(25,45,32,0.75)"],
  fog1: ["rgba(10,18,28,0)", "rgba(10,18,28,0.28)", "rgba(10,18,28,0.4)"],
  fog2: ["rgba(10,18,28,0)", "rgba(10,18,28,0.2)", "rgba(10,18,28,0.3)"],
  tint: "rgba(8,18,40,0.55)",
  stars: 0.9,
  windowLight: 0.5,
  phase: "nacht",
};

// Keyframes rond de 24u-klok. Tussen night(5u) en day(8u) ontstaat vanzelf
// een dageraad-overgang; tussen day(16u) en dusk(19u) een zonsondergang.
type Keyed = SceneFrame & { h: number };
const KEYFRAMES: Keyed[] = [
  { h: 0, ...NIGHT },
  { h: 5, ...NIGHT },
  { h: 8, ...DAY },
  { h: 16, ...DAY },
  { h: 19, ...DUSK },
  { h: 20.5, ...NIGHT },
  { h: 24, ...NIGHT },
];

function sampleKeyframes(hour: number): SceneFrame {
  let i = 0;
  while (i < KEYFRAMES.length - 1 && hour >= KEYFRAMES[i + 1].h) i++;
  const A = KEYFRAMES[i];
  const B = KEYFRAMES[Math.min(i + 1, KEYFRAMES.length - 1)];
  const span = B.h - A.h || 1;
  const t = clamp01((hour - A.h) / span);

  return {
    sky: A.sky.map((c, k) => hexLerp(c, B.sky[k], t)),
    mtn: [hexLerp(A.mtn[0], B.mtn[0], t), hexLerp(A.mtn[1], B.mtn[1], t)],
    mtnOp: [lerp(A.mtnOp[0], B.mtnOp[0], t), lerp(A.mtnOp[1], B.mtnOp[1], t)],
    hill: [hexLerp(A.hill[0], B.hill[0], t), hexLerp(A.hill[1], B.hill[1], t)],
    hillOp: [lerp(A.hillOp[0], B.hillOp[0], t), lerp(A.hillOp[1], B.hillOp[1], t)],
    grass: [
      rgbaLerp(A.grass[0], B.grass[0], t),
      rgbaLerp(A.grass[1], B.grass[1], t),
      rgbaLerp(A.grass[2], B.grass[2], t),
    ],
    fog1: [
      rgbaLerp(A.fog1[0], B.fog1[0], t),
      rgbaLerp(A.fog1[1], B.fog1[1], t),
      rgbaLerp(A.fog1[2], B.fog1[2], t),
    ],
    fog2: [
      rgbaLerp(A.fog2[0], B.fog2[0], t),
      rgbaLerp(A.fog2[1], B.fog2[1], t),
      rgbaLerp(A.fog2[2], B.fog2[2], t),
    ],
    tint: rgbaLerp(A.tint, B.tint, t),
    stars: lerp(A.stars, B.stars, t),
    windowLight: lerp(A.windowLight, B.windowLight, t),
    phase: t < 0.5 ? A.phase : B.phase,
  };
}

// ───────── Zon & maan ─────────
// Coördinaten in de 350×320 scene-box (px vanaf links/boven).
export type Celestial = {
  kind: "sun" | "moon";
  x: number;
  y: number;
  opacity: number;
};

export function celestialAt(hour: number): Celestial {
  const W = 350;
  const HORIZON_Y = 168;
  const ARC_H = 138;
  const FADE = 0.9; // uren vervaging bij op-/ondergang

  function body(riseH: number, setH: number): { x: number; y: number; opacity: number } | null {
    let h = hour;
    let set = setH;
    if (set < riseH) {
      // boog loopt over middernacht (de maan)
      if (h < riseH) h += 24;
      set += 24;
    }
    if (h < riseH - FADE || h > set + FADE) return null;
    const p = clamp01((h - riseH) / (set - riseH));
    const x = lerp(40, W - 40, p);
    const y = HORIZON_Y - ARC_H * Math.sin(p * Math.PI);
    let op = 1;
    if (h < riseH) op = clamp01((h - (riseH - FADE)) / FADE);
    else if (h > set) op = clamp01((set + FADE - h) / FADE);
    return { x, y, opacity: op };
  }

  const sun = body(6.0, 19.0);
  const moon = body(19.0, 6.0);
  if (sun && sun.opacity >= (moon ? moon.opacity : 0)) {
    return { kind: "sun", ...sun };
  }
  if (moon) {
    return { kind: "moon", ...moon };
  }
  return { kind: "sun", x: 175, y: HORIZON_Y, opacity: 0 };
}

// ───────── Master ─────────
export type Scene = SceneFrame & { hour: number; celestial: Celestial };

/** minutes 0..1440 → volledige scene-beschrijving. */
export function sceneAt(minutes: number): Scene {
  const hour = ((minutes / 60) % 24 + 24) % 24;
  const k = sampleKeyframes(hour);
  const celestial = celestialAt(hour);
  return { hour, ...k, celestial };
}

/** Huidige tijd van het toestel in minuten sinds middernacht. */
export function nowMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

/** "08:30"-weergave voor een minuten-waarde. */
export function formatClock(minutes: number): string {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const hh = Math.floor(m / 60).toString().padStart(2, "0");
  const mm = (m % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}
