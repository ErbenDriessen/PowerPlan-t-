// powerplant/components/Forest.tsx
//
// "Looking out a window" scene for the Mijn boom screen. The user's
// actively-growing tree sits in a terracotta pot on the windowsill,
// while previously-prestiged trees populate the landscape outside.
// Translated 1:1 from the prototypes "forest window sil design 1.html"
// and "Forest Window with landscape.html" — wooden frame, sill, sky +
// sun/moon + mountains + hills + grass-foreground, with day/dusk/night
// variants picked from the device clock.

import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient as SvgLinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import {
  getMatureTreeSprite,
  getTreeSprite,
  SpriteRect,
} from "../lib/plantSprites";
import { PlantedTree } from "../stores/useUserStore";
import { PlantSprite } from "./PlantSprite";

export type TimeOfDay = "day" | "dusk" | "night";

// Design coordinate space — same as the HTML mockups. All internal
// positions/sizes are in these units and scaled by (width / DESIGN_W).
const DESIGN_W = 378; // total window width incl. wooden frame
const FRAME_PAD = 14; // wooden frame thickness on left/right/top
const PANE_PAD = 3; // dark pane recess padding inside the frame
const HERO_W = 350; // inner forest pane width
const HERO_H = 320; // inner forest pane height
const SILL_H = 34; // wooden windowsill height
const SCENE_H = FRAME_PAD + PANE_PAD * 2 + HERO_H + SILL_H; // 374

// ───────── Forest slot table (from "Forest layout v7" mockup) ─────────
type Layer = 1 | 2 | 3;
type Slot = {
  id: number;
  layer: Layer;
  species: number;
  scale: number;
  left: number;
  bottom: number;
};
const SLOTS: Slot[] = [
  // L3 closest trees use slightly NEGATIVE bottoms so the wooden sill
  // visually clips a few pixels of trunk — the "this scene continues
  // outside the window" illusion.
  { id: 1, layer: 3, species: 2, scale: 1.0, left: -5, bottom: -6 },
  { id: 2, layer: 3, species: 1, scale: 0.9, left: 22, bottom: -2 },
  { id: 3, layer: 2, species: 0, scale: 0.75, left: 50, bottom: 11 },
  { id: 4, layer: 2, species: 1, scale: 0.68, left: 72, bottom: 14 },
  { id: 5, layer: 2, species: 2, scale: 0.62, left: 92, bottom: 17 },
  { id: 6, layer: 1, species: 0, scale: 0.55, left: 82, bottom: 21 },
  { id: 7, layer: 1, species: 1, scale: 0.5, left: 98, bottom: 19 },
  { id: 8, layer: 1, species: 2, scale: 0.45, left: 115, bottom: 23 },
  { id: 9, layer: 1, species: 0, scale: 0.48, left: 128, bottom: 22 },
  { id: 10, layer: 1, species: 1, scale: 0.4, left: 140, bottom: 25 },
  { id: 11, layer: 3, species: 1, scale: 0.9, left: 285, bottom: -2 },
  { id: 12, layer: 3, species: 2, scale: 1.0, left: 307, bottom: -6 },
  { id: 13, layer: 2, species: 2, scale: 0.62, left: 228, bottom: 17 },
  { id: 14, layer: 2, species: 1, scale: 0.68, left: 245, bottom: 14 },
  { id: 15, layer: 2, species: 0, scale: 0.75, left: 261, bottom: 11 },
  { id: 16, layer: 1, species: 1, scale: 0.4, left: 191, bottom: 25 },
  { id: 17, layer: 1, species: 0, scale: 0.48, left: 197, bottom: 22 },
  { id: 18, layer: 1, species: 2, scale: 0.45, left: 213, bottom: 23 },
  { id: 19, layer: 1, species: 1, scale: 0.5, left: 228, bottom: 19 },
  { id: 20, layer: 1, species: 0, scale: 0.55, left: 239, bottom: 21 },
];
const PROGRESSION = [
  1, 12, 2, 11,
  3, 15, 4, 14, 5, 13,
  6, 20, 7, 19, 8, 18, 9, 17, 10, 16,
] as const;

// Per-stage scale for the pot tree — early stages are pushed extra
// large so a freshly-planted sapling (only 17×20 px native) still
// reads as a real plant on a phone screen.
const POT_TREE_SCALE = [2.0, 1.7, 1.4, 1.1, 1.0] as const;

// ───────── Helpers ─────────
function pickTimeOfDay(): TimeOfDay {
  const h = new Date().getHours();
  if (h >= 6 && h < 17) return "day";
  if (h >= 17 && h < 20) return "dusk";
  return "night";
}

function rectAt(spec: number): SpriteRect {
  return getMatureTreeSprite(spec);
}

// ───────── Sub-components ─────────

function SkyGradient({ tod, w, h }: { tod: TimeOfDay; w: number; h: number }) {
  const COLORS: Record<TimeOfDay, string[]> = {
    day: ["#8FCBE6", "#B3D7E8", "#D5E1D2", "#A8B597", "#7A8F5F", "#5C7B40", "#4B6932", "#618845"],
    dusk: ["#F4A968", "#F6B584", "#ED9C76", "#BD8C84", "#87766E", "#5C6B58", "#455942", "#3D5938"],
    night: ["#1B2D52", "#2A3F6B", "#314765", "#2D3C53", "#243349", "#1F2D40", "#1A2533", "#1C2E27"],
  };
  const LOCATIONS: [number, number, ...number[]] = [
    0, 0.16, 0.32, 0.46, 0.6, 0.75, 0.9, 1,
  ];
  return (
    <LinearGradient
      colors={COLORS[tod] as any}
      locations={LOCATIONS}
      style={{ width: w, height: h }}
    />
  );
}

function SunOrMoon({ tod, scale }: { tod: TimeOfDay; scale: number }) {
  if (tod === "night") {
    // Moon — small white disc with two crater spots
    const size = 50 * scale;
    return (
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 38 * scale,
          right: 44 * scale,
          width: size,
          height: size,
        }}
      >
        <Svg width={size} height={size} viewBox="0 0 50 50">
          <Defs>
            <RadialGradient id="moon" cx="35%" cy="35%" r="65%">
              <Stop offset="0" stopColor="#FFFFFF" />
              <Stop offset="0.4" stopColor="#F5F2EA" />
              <Stop offset="0.75" stopColor="#DAD5C5" />
              <Stop offset="1" stopColor="#B5AE9A" />
            </RadialGradient>
          </Defs>
          <Circle cx="25" cy="25" r="25" fill="url(#moon)" />
          <Circle cx="17" cy="14" r="5.5" fill="rgba(180,175,160,0.4)" />
          <Circle cx="30" cy="28" r="3.5" fill="rgba(180,175,160,0.35)" />
        </Svg>
      </View>
    );
  }
  if (tod === "dusk") {
    // Low warm sun
    const size = 64 * scale;
    return (
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 110 * scale,
          right: 50 * scale,
          width: size,
          height: size,
        }}
      >
        <Svg width={size} height={size} viewBox="0 0 64 64">
          <Defs>
            <RadialGradient id="sun-dusk" cx="35%" cy="35%" r="65%">
              <Stop offset="0" stopColor="#FFE8C8" />
              <Stop offset="0.3" stopColor="#FFB876" />
              <Stop offset="0.65" stopColor="#E97D45" />
              <Stop offset="1" stopColor="#B85628" />
            </RadialGradient>
          </Defs>
          <Circle cx="32" cy="32" r="32" fill="url(#sun-dusk)" />
        </Svg>
      </View>
    );
  }
  // Day sun
  const size = 58 * scale;
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 42 * scale,
        right: 36 * scale,
        width: size,
        height: size,
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 58 58">
        <Defs>
          <RadialGradient id="sun-day" cx="35%" cy="35%" r="65%">
            <Stop offset="0" stopColor="#FFFAE2" />
            <Stop offset="0.35" stopColor="#FFE894" />
            <Stop offset="0.7" stopColor="#F5C846" />
            <Stop offset="1" stopColor="#DB9F1F" />
          </RadialGradient>
        </Defs>
        <Circle cx="29" cy="29" r="29" fill="url(#sun-day)" />
      </Svg>
    </View>
  );
}

function Stars({ scale }: { scale: number }) {
  const positions = [
    { left: 30, top: 40 },
    { left: 110, top: 30 },
    { left: 190, top: 50 },
    { left: 260, top: 80 },
    { left: 70, top: 90 },
    { left: 155, top: 110 },
    { left: 300, top: 140 },
    { left: 200, top: 160 },
  ];
  return (
    <>
      {positions.map((p, i) => (
        <View
          key={i}
          pointerEvents="none"
          style={{
            position: "absolute",
            left: p.left * scale,
            top: p.top * scale,
            width: 2 * scale,
            height: 2 * scale,
            borderRadius: scale,
            backgroundColor: "#FFFEF5",
            opacity: 0.7,
          }}
        />
      ))}
    </>
  );
}

function Mountains({ tod, w, scale }: { tod: TimeOfDay; w: number; scale: number }) {
  const colors = {
    day: { back: "#7A8678", front: "#6A7468" },
    dusk: { back: "#7A6470", front: "#5C4D5A" },
    night: { back: "#1B2540", front: "#131C2E" },
  }[tod];
  const backOpacity = tod === "night" ? 0.85 : tod === "dusk" ? 0.6 : 0.55;
  const frontOpacity = tod === "night" ? 0.7 : tod === "dusk" ? 0.5 : 0.4;
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 132 * scale,
        height: 56 * scale,
      }}
    >
      <Svg width={w} height={56 * scale} viewBox="0 0 350 56" preserveAspectRatio="none">
        <Path
          d="M0 56 L20 22 L55 30 L90 8 L130 22 L170 4 L210 18 L245 12 L280 26 L315 10 L345 22 L350 30 L350 56 Z"
          fill={colors.back}
          opacity={backOpacity}
        />
        <Path
          d="M30 56 L60 36 L95 42 L140 25 L185 38 L230 30 L270 40 L310 28 L350 38 L350 56 Z"
          fill={colors.front}
          opacity={frontOpacity}
        />
      </Svg>
    </View>
  );
}

function Hills({ tod, w, scale }: { tod: TimeOfDay; w: number; scale: number }) {
  const colors = {
    day: { back: "#5A7A48", front: "#446036" },
    dusk: { back: "#5A4D4E", front: "#3D3636" },
    night: { back: "#0F1A22", front: "#0A141A" },
  }[tod];
  const backOpacity = tod === "night" ? 0.85 : tod === "dusk" ? 0.75 : 0.7;
  const frontOpacity = tod === "night" ? 0.75 : tod === "dusk" ? 0.6 : 0.5;
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 72 * scale,
        height: 56 * scale,
      }}
    >
      <Svg width={w} height={56 * scale} viewBox="0 0 350 56" preserveAspectRatio="none">
        <Path
          d="M0 56 Q55 22 110 32 Q170 14 230 28 Q290 16 350 24 L350 56 Z"
          fill={colors.back}
          opacity={backOpacity}
        />
        <Path
          d="M0 56 Q70 40 140 44 Q210 32 280 42 Q335 36 350 40 L350 56 Z"
          fill={colors.front}
          opacity={frontOpacity}
        />
      </Svg>
    </View>
  );
}

/**
 * Time-of-day tint that sits ON TOP of the forest layers but BELOW
 * the grass-foreground. Pushes the forest into the scene's atmospheric
 * mood: warm sepia at dusk, deep silhouette-blue at night, none at day.
 */
function ForestTint({ tod, scale }: { tod: TimeOfDay; scale: number }) {
  if (tod === "day") return null;
  const color =
    tod === "night" ? "rgba(8, 18, 40, 0.55)" : "rgba(160, 70, 30, 0.18)";
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 130 * scale,
        backgroundColor: color,
      }}
    />
  );
}

function GrassForeground({ tod, scale }: { tod: TimeOfDay; scale: number }) {
  const colors = {
    day: ["rgba(70,110,50,0)", "rgba(70,110,50,0.4)", "rgba(85,130,60,0.6)"],
    dusk: ["rgba(60,80,55,0)", "rgba(60,80,55,0.5)", "rgba(50,75,45,0.7)"],
    night: ["rgba(30,55,40,0)", "rgba(30,55,40,0.55)", "rgba(25,45,32,0.75)"],
  }[tod];
  return (
    <LinearGradient
      pointerEvents="none"
      colors={colors as any}
      locations={[0, 0.4, 1]}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 18 * scale,
      }}
    />
  );
}

// Per-layer scale boost so the depth spread is unambiguous: front
// trees are noticeably larger than the back ones, exaggerating the
// "this is far away" feel via size alone. Compress shifts positions
// inward to keep boosted L3 trees inside the scene window.
const LAYER_BOOST: Record<Layer, number> = {
  1: 1.0, // back — keep mockup size
  2: 1.25, // mid
  3: 1.6, // front — biggest jump
};
const POS_COMPRESS = 0.9;

function ForestSprite({ slot, scale }: { slot: Slot; scale: number }) {
  const sprite = rectAt(slot.species);
  const heightPx = sprite.h * slot.scale * LAYER_BOOST[slot.layer] * scale;
  return (
    <View
      style={{
        position: "absolute",
        left: slot.left * POS_COMPRESS * scale,
        bottom: slot.bottom * scale,
      }}
    >
      <PlantSprite rect={sprite} height={heightPx} />
    </View>
  );
}

function Fog({
  variant,
  tod,
  scale,
}: {
  variant: 1 | 2;
  tod: TimeOfDay;
  scale: number;
}) {
  // (color, top alpha, mid alpha)
  const stops: Record<TimeOfDay, Record<1 | 2, [string, string, string]>> = {
    day: {
      1: ["rgba(15,28,22,0)", "rgba(15,28,22,0.18)", "rgba(15,28,22,0.26)"],
      2: ["rgba(15,28,22,0)", "rgba(15,28,22,0.13)", "rgba(15,28,22,0.20)"],
    },
    dusk: {
      1: ["rgba(40,30,28,0)", "rgba(40,30,28,0.20)", "rgba(40,30,28,0.30)"],
      2: ["rgba(40,30,28,0)", "rgba(40,30,28,0.14)", "rgba(40,30,28,0.22)"],
    },
    night: {
      1: ["rgba(10,18,28,0)", "rgba(10,18,28,0.28)", "rgba(10,18,28,0.40)"],
      2: ["rgba(10,18,28,0)", "rgba(10,18,28,0.20)", "rgba(10,18,28,0.30)"],
    },
  };
  const [top, mid, bot] = stops[tod][variant];
  return (
    <LinearGradient
      pointerEvents="none"
      colors={[top, mid, bot] as any}
      locations={[0, 0.2, 1]}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 95 * scale,
      }}
    />
  );
}

function ForestTrees({
  trees,
  tod,
  scale,
}: {
  trees: PlantedTree[];
  tod: TimeOfDay;
  scale: number;
}) {
  const visibleCount = Math.min(trees.length, PROGRESSION.length);
  const visibleIds = new Set<number>(PROGRESSION.slice(0, visibleCount));
  const visible = SLOTS.filter((s) => visibleIds.has(s.id));

  const layered: Record<Layer, Slot[]> = { 1: [], 2: [], 3: [] };
  visible.forEach((s) => layered[s.layer].push(s));
  // Tallest renders last within each layer for clean z-order.
  ([1, 2, 3] as Layer[]).forEach((layer) => {
    layered[layer].sort((a, b) => {
      const ha = rectAt(a.species).h * a.scale;
      const hb = rectAt(b.species).h * b.scale;
      return ha - hb;
    });
  });

  // Trees get a subtle warmth/coolness via overlay (we can't easily
  // apply css filter brightness/saturate in RN); skip per-tree filter
  // for now since fog density already conveys time-of-day mood.
  return (
    <>
      {layered[1].map((slot) => (
        <ForestSprite key={`l1-${slot.id}`} slot={slot} scale={scale} />
      ))}
      {visible.length > 0 && <Fog variant={1} tod={tod} scale={scale} />}
      {layered[2].map((slot) => (
        <ForestSprite key={`l2-${slot.id}`} slot={slot} scale={scale} />
      ))}
      {(layered[2].length > 0 || layered[3].length > 0) && (
        <Fog variant={2} tod={tod} scale={scale} />
      )}
      {layered[3].map((slot) => (
        <ForestSprite key={`l3-${slot.id}`} slot={slot} scale={scale} />
      ))}
    </>
  );
}

function GlassReflection({ w, h }: { w: number; h: number }) {
  return (
    <LinearGradient
      pointerEvents="none"
      colors={["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)", "rgba(255,255,255,0)"]}
      locations={[0, 0.6, 1]}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        width: w,
        height: h * 0.26,
      }}
    />
  );
}

function Pot({ width, height }: { width: number; height: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 90 60">
      <Defs>
        <SvgLinearGradient id="potBody" x1="0" x2="0" y1="0" y2="1">
          <Stop offset="0" stopColor="#C77852" />
          <Stop offset="0.5" stopColor="#A85A30" />
          <Stop offset="1" stopColor="#6E3618" />
        </SvgLinearGradient>
        <SvgLinearGradient id="potRim" x1="0" x2="0" y1="0" y2="1">
          <Stop offset="0" stopColor="#D88A62" />
          <Stop offset="1" stopColor="#A85A30" />
        </SvgLinearGradient>
      </Defs>
      <Path d="M6 12 L84 12 L78 60 L12 60 Z" fill="url(#potBody)" />
      <Path d="M0 0 L90 0 L88 12 L2 12 Z" fill="url(#potRim)" />
      <Ellipse cx="45" cy="11" rx="40" ry="3" fill="#2C1A0C" />
      <Ellipse cx="45" cy="10" rx="36" ry="1.5" fill="#1F0F06" opacity="0.7" />
    </Svg>
  );
}

function PotGlow({ scale, bottom }: { scale: number; bottom: number }) {
  const w = 200 * scale;
  const h = 130 * scale;
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: "50%",
        marginLeft: -w / 2,
        bottom,
        width: w,
        height: h,
      }}
    >
      <Svg width={w} height={h} viewBox="0 0 200 130">
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="80%" r="70%">
            <Stop offset="0" stopColor="rgb(220,235,180)" stopOpacity="0.18" />
            <Stop offset="0.4" stopColor="rgb(190,215,150)" stopOpacity="0.08" />
            <Stop offset="0.7" stopColor="rgb(190,215,150)" stopOpacity="0" />
            <Stop offset="1" stopColor="rgb(190,215,150)" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="200" height="130" fill="url(#glow)" />
      </Svg>
    </View>
  );
}

function WindowLight({ scale, bottom }: { scale: number; bottom: number }) {
  const w = 200 * scale;
  const h = 80 * scale;
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: "50%",
        marginLeft: -w / 2,
        bottom,
        width: w,
        height: h,
      }}
    >
      <Svg width={w} height={h} viewBox="0 0 200 80">
        <Defs>
          <RadialGradient id="winlight" cx="50%" cy="100%" r="80%">
            <Stop offset="0" stopColor="rgb(255,220,160)" stopOpacity="0.22" />
            <Stop offset="0.3" stopColor="rgb(255,200,130)" stopOpacity="0.10" />
            <Stop offset="0.6" stopColor="rgb(255,200,130)" stopOpacity="0" />
            <Stop offset="1" stopColor="rgb(255,200,130)" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="200" height="80" fill="url(#winlight)" />
      </Svg>
    </View>
  );
}

function PotTree({
  species,
  stage,
  scale,
  bottom,
}: {
  species: number;
  stage: number;
  scale: number;
  bottom: number;
}) {
  const stageIdx = Math.max(0, Math.min(POT_TREE_SCALE.length - 1, stage - 1));
  const sprite = getTreeSprite(species, stageIdx);
  const stageScale = POT_TREE_SCALE[stageIdx];
  // Pot dimensions (design): 90 wide × 60 tall.
  const potW = 90 * scale;
  const potH = 60 * scale;
  // Container occupies 90 × 160 design units so the tree always has
  // headroom above the pot regardless of stage scale.
  const containerW = 90 * scale;
  const containerH = 160 * scale;
  // Tree sized off the per-stage sprite content with the prototype's
  // pot-scale curve. Renders bottom-aligned, then nudged 10px down so
  // the trunk visually sits in the soil.
  const treeH = sprite.h * stageScale * scale;
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: "50%",
        marginLeft: -containerW / 2,
        bottom,
        width: containerW,
        height: containerH,
      }}
    >
      {/* Tree — anchored to the pot soil */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 50 * scale,
          alignItems: "center",
        }}
      >
        <PlantSprite rect={sprite} height={treeH} />
      </View>
      {/* Terracotta pot */}
      <View style={{ position: "absolute", left: 0, bottom: 0 }}>
        <Pot width={potW} height={potH} />
      </View>
    </View>
  );
}

type Props = {
  trees: PlantedTree[];
  /** Total available width for the window (frame included). */
  width: number;
  /** Currently-growing species (0..2). */
  mainSpecies: number;
  /** Growth stage 1..5. */
  mainStage: number;
  /** Override the auto-detected time of day. */
  timeOfDay?: TimeOfDay;
};

/** Total rendered height for a given window width, so callers can size
 *  their layout slot accordingly. */
export function windowSceneHeight(width: number): number {
  const scale = width / DESIGN_W;
  return SCENE_H * scale;
}

export function Forest({
  trees,
  width,
  mainSpecies,
  mainStage,
  timeOfDay,
}: Props) {
  const tod = useMemo<TimeOfDay>(() => timeOfDay ?? pickTimeOfDay(), [timeOfDay]);
  // Scale all design coords to the actual window width.
  const scale = width / DESIGN_W;
  const heroWidthPx = HERO_W * scale;
  const heroHeightPx = HERO_H * scale;
  const sillHeightPx = SILL_H * scale;
  const framePadPx = FRAME_PAD * scale;
  const panePadPx = PANE_PAD * scale;

  // Bottom anchor for the pot: the pot's lower edge sits IN the sill by
  // ~12px, so its visual base aligns with the windowsill's top surface.
  const potBottomPx = (SILL_H - 12) * scale;
  const windowLightBottomPx = sillHeightPx * 0.4;

  return (
    <View style={{ width, height: SCENE_H * scale }}>
      {/* Wooden window frame — wraps top + sides of the glass pane. */}
      <View
        style={{
          paddingHorizontal: framePadPx,
          paddingTop: framePadPx,
          paddingBottom: 0,
        }}
      >
        <LinearGradient
          colors={["#5C3A20", "#4A2E1A"]}
          style={[StyleSheet.absoluteFillObject, { borderTopLeftRadius: 6, borderTopRightRadius: 6 }]}
        />
        {/* Dark pane recess inside the wooden frame */}
        <View
          style={{
            padding: panePadPx,
            backgroundColor: "#1F1208",
            borderRadius: 4,
          }}
        >
          {/* Hero — the actual view through the glass */}
          <View
            style={{
              width: heroWidthPx,
              height: heroHeightPx,
              overflow: "hidden",
              borderRadius: 2,
            }}
          >
            <SkyGradient tod={tod} w={heroWidthPx} h={heroHeightPx} />
            <SunOrMoon tod={tod} scale={scale} />
            {tod === "night" && <Stars scale={scale} />}
            <Mountains tod={tod} w={heroWidthPx} scale={scale} />
            <Hills tod={tod} w={heroWidthPx} scale={scale} />
            <ForestTrees trees={trees} tod={tod} scale={scale} />
            <ForestTint tod={tod} scale={scale} />
            <GrassForeground tod={tod} scale={scale} />
            <GlassReflection w={heroWidthPx} h={heroHeightPx} />
          </View>
        </View>
      </View>

      {/* Windowsill — wooden shelf the pot sits on */}
      <View
        style={{
          marginHorizontal: -6 * scale,
          height: sillHeightPx,
          borderBottomLeftRadius: 5,
          borderBottomRightRadius: 5,
          overflow: "hidden",
        }}
      >
        <LinearGradient
          colors={["#7A4F2C", "#6B4426", "#5A3820", "#4A2E1A", "#2D1B0E"]}
          locations={[0, 0.18, 0.45, 0.75, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Highlighted leading edge of the sill */}
        <LinearGradient
          colors={["#8B5C36", "#7A4F2C"]}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 6 * scale,
          }}
        />
      </View>

      {/* Warm window-light spill at night */}
      {tod === "night" && <WindowLight scale={scale} bottom={windowLightBottomPx} />}

      {/* Soft pot glow so the centerpiece pops */}
      <PotGlow scale={scale} bottom={potBottomPx - 14 * scale} />

      {/* Pot + growing tree — sits on the sill */}
      <PotTree
        species={mainSpecies}
        stage={mainStage}
        scale={scale}
        bottom={potBottomPx}
      />
    </View>
  );
}
