// powerplant/components/Forest.tsx
//
// "Looking out a window" scene for the Mijn boom screen. The user's
// actively-growing tree sits in a terracotta pot on the windowsill,
// while previously-prestiged trees populate the landscape outside.
//
// The atmosphere (sky, sun/moon, mountains, hills, grass, fog, stars,
// indoor light) is fully dynamic: it is driven by a single time value in
// minutes via lib/skyScene.ts. The scene interpolates continuously through
// the day and the sun/moon arc across the sky. The wooden frame, sill and
// pot are time-independent.

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
import { Celestial, clamp01, Scene, sceneAt } from "../lib/skyScene";
import { PlantedTree } from "../stores/useUserStore";
import { PlantSprite } from "./PlantSprite";

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

function rectAt(spec: number): SpriteRect {
  return getMatureTreeSprite(spec);
}

// ───────── Sub-components ─────────

function SkyGradient({ colors, w, h }: { colors: string[]; w: number; h: number }) {
  const LOCATIONS: [number, number, ...number[]] = [
    0, 0.16, 0.32, 0.46, 0.6, 0.75, 0.9, 1,
  ];
  return (
    <LinearGradient
      colors={colors as any}
      locations={LOCATIONS}
      style={{ width: w, height: h }}
    />
  );
}

// Sun or moon, positioned on its arc, with a soft radial glow behind it.
// Sits BEHIND the mountains so it rises/sets behind the landscape.
function CelestialBody({ c, scale }: { c: Celestial; scale: number }) {
  if (c.opacity <= 0.001) return null;
  const isSun = c.kind === "sun";
  const size = isSun ? 58 : 46;
  const glow = isSun ? 200 : 150;
  const cx = c.x * scale;
  const cy = c.y * scale;
  const sizePx = size * scale;
  const glowPx = glow * scale;
  // react-native-svg accepts Stop elements (or an array of them) as gradient
  // children, but NOT a Fragment — so build the stop lists as arrays.
  const glowStops = isSun
    ? [
        <Stop key="0" offset="0" stopColor="rgb(255,232,148)" stopOpacity="0.45" />,
        <Stop key="1" offset="0.35" stopColor="rgb(255,220,120)" stopOpacity="0.18" />,
        <Stop key="2" offset="0.7" stopColor="rgb(255,220,120)" stopOpacity="0" />,
      ]
    : [
        <Stop key="0" offset="0" stopColor="rgb(220,225,240)" stopOpacity="0.3" />,
        <Stop key="1" offset="0.4" stopColor="rgb(180,190,220)" stopOpacity="0.12" />,
        <Stop key="2" offset="0.72" stopColor="rgb(180,190,220)" stopOpacity="0" />,
      ];
  const discStops = isSun
    ? [
        <Stop key="0" offset="0" stopColor="#FFFAE2" />,
        <Stop key="1" offset="0.35" stopColor="#FFE894" />,
        <Stop key="2" offset="0.7" stopColor="#F5C846" />,
        <Stop key="3" offset="1" stopColor="#DB9F1F" />,
      ]
    : [
        <Stop key="0" offset="0" stopColor="#FFFFFF" />,
        <Stop key="1" offset="0.4" stopColor="#F5F2EA" />,
        <Stop key="2" offset="0.75" stopColor="#DAD5C5" />,
        <Stop key="3" offset="1" stopColor="#B5AE9A" />,
      ];
  return (
    <>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: cx - glowPx / 2,
          top: cy - glowPx / 2,
          width: glowPx,
          height: glowPx,
          opacity: c.opacity * (isSun ? 0.8 : 0.5),
        }}
      >
        <Svg width={glowPx} height={glowPx} viewBox="0 0 200 200">
          <Defs>
            <RadialGradient id="celGlow" cx="50%" cy="50%" r="50%">
              {glowStops}
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="200" height="200" fill="url(#celGlow)" />
        </Svg>
      </View>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: cx - sizePx / 2,
          top: cy - sizePx / 2,
          width: sizePx,
          height: sizePx,
          opacity: c.opacity,
        }}
      >
        <Svg width={sizePx} height={sizePx} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            <RadialGradient id="celDisc" cx="35%" cy="35%" r="65%">
              {discStops}
            </RadialGradient>
          </Defs>
          <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#celDisc)" />
          {!isSun && (
            <>
              <Circle cx={size * 0.34} cy={size * 0.28} r={size * 0.11} fill="rgba(180,175,160,0.4)" />
              <Circle cx={size * 0.6} cy={size * 0.56} r={size * 0.07} fill="rgba(180,175,160,0.35)" />
            </>
          )}
        </Svg>
      </View>
    </>
  );
}

function Stars({ scale, opacity }: { scale: number; opacity: number }) {
  if (opacity <= 0.001) return null;
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
    <View pointerEvents="none" style={{ ...StyleSheet.absoluteFillObject, opacity }}>
      {positions.map((p, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: p.left * scale,
            top: p.top * scale,
            width: 2 * scale,
            height: 2 * scale,
            borderRadius: scale,
            backgroundColor: "#FFFEF5",
          }}
        />
      ))}
    </View>
  );
}

function Mountains({
  colors,
  op,
  w,
  scale,
}: {
  colors: [string, string];
  op: [number, number];
  w: number;
  scale: number;
}) {
  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", left: 0, right: 0, bottom: 124 * scale, height: 56 * scale }}
    >
      <Svg width={w} height={56 * scale} viewBox="0 0 350 56" preserveAspectRatio="none">
        <Path
          d="M0 56 L20 22 L55 30 L90 8 L130 22 L170 4 L210 18 L245 12 L280 26 L315 10 L345 22 L350 30 L350 56 Z"
          fill={colors[0]}
          opacity={op[0]}
        />
        <Path
          d="M30 56 L60 36 L95 42 L140 25 L185 38 L230 30 L270 40 L310 28 L350 38 L350 56 Z"
          fill={colors[1]}
          opacity={op[1]}
        />
      </Svg>
    </View>
  );
}

function Hills({
  colors,
  op,
  w,
  scale,
}: {
  colors: [string, string];
  op: [number, number];
  w: number;
  scale: number;
}) {
  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", left: 0, right: 0, bottom: 72 * scale, height: 56 * scale }}
    >
      <Svg width={w} height={56 * scale} viewBox="0 0 350 56" preserveAspectRatio="none">
        <Path
          d="M0 56 Q55 22 110 32 Q170 14 230 28 Q290 16 350 24 L350 56 Z"
          fill={colors[0]}
          opacity={op[0]}
        />
        <Path
          d="M0 56 Q70 40 140 44 Q210 32 280 42 Q335 36 350 40 L350 56 Z"
          fill={colors[1]}
          opacity={op[1]}
        />
      </Svg>
    </View>
  );
}

/**
 * Time-of-day tint that sits ON TOP of the forest layers but BELOW the
 * grass-foreground. Pushes the forest into the scene's atmospheric mood:
 * warm at dusk, deep silhouette-blue at night, invisible (alpha 0) at day.
 */
function ForestTint({ color, scale }: { color: string; scale: number }) {
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

function GrassForeground({ colors, scale }: { colors: [string, string, string]; scale: number }) {
  return (
    <LinearGradient
      pointerEvents="none"
      colors={colors as any}
      locations={[0, 0.4, 1]}
      style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 18 * scale }}
    />
  );
}

// Per-layer scale boost so the depth spread is unambiguous: front
// trees are noticeably larger than the back ones, exaggerating the
// "this is far away" feel via size alone.
const LAYER_BOOST: Record<Layer, number> = { 1: 1.0, 2: 1.25, 3: 1.6 };
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
  colors,
  scale,
}: {
  colors: [string, string, string];
  scale: number;
}) {
  return (
    <LinearGradient
      pointerEvents="none"
      colors={colors as any}
      locations={[0, 0.2, 1]}
      style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 95 * scale }}
    />
  );
}

function ForestTrees({
  trees,
  fog1,
  fog2,
  scale,
}: {
  trees: PlantedTree[];
  fog1: [string, string, string];
  fog2: [string, string, string];
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

  return (
    <>
      {layered[1].map((slot) => (
        <ForestSprite key={`l1-${slot.id}`} slot={slot} scale={scale} />
      ))}
      {visible.length > 0 && <Fog colors={fog1} scale={scale} />}
      {layered[2].map((slot) => (
        <ForestSprite key={`l2-${slot.id}`} slot={slot} scale={scale} />
      ))}
      {(layered[2].length > 0 || layered[3].length > 0) && <Fog colors={fog2} scale={scale} />}
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
      style={{ position: "absolute", left: 0, right: 0, top: 0, width: w, height: h * 0.26 }}
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
      style={{ position: "absolute", left: "50%", marginLeft: -w / 2, bottom, width: w, height: h }}
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

function WindowLight({ scale, bottom, opacity }: { scale: number; bottom: number; opacity: number }) {
  if (opacity <= 0.001) return null;
  const w = 200 * scale;
  const h = 80 * scale;
  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", left: "50%", marginLeft: -w / 2, bottom, width: w, height: h, opacity }}
    >
      <Svg width={w} height={h} viewBox="0 0 200 80">
        <Defs>
          <RadialGradient id="winlight" cx="50%" cy="100%" r="80%">
            <Stop offset="0" stopColor="rgb(255,220,160)" stopOpacity="0.22" />
            <Stop offset="0.3" stopColor="rgb(255,200,130)" stopOpacity="0.1" />
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
  const potW = 90 * scale;
  const potH = 60 * scale;
  const containerW = 90 * scale;
  const containerH = 160 * scale;
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
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 50 * scale, alignItems: "center" }}>
        <PlantSprite rect={sprite} height={treeH} />
      </View>
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
  /** Time of day in minutes since midnight (0..1440) that drives the
   *  whole atmosphere. Callers pass the live clock or a demo override. */
  minutes: number;
};

/** Total rendered height for a given window width, so callers can size
 *  their layout slot accordingly. */
export function windowSceneHeight(width: number): number {
  const scale = width / DESIGN_W;
  return SCENE_H * scale;
}

export function Forest({ trees, width, mainSpecies, mainStage, minutes }: Props) {
  const scene = useMemo<Scene>(() => sceneAt(minutes), [minutes]);
  // Scale all design coords to the actual window width.
  const scale = width / DESIGN_W;
  const heroWidthPx = HERO_W * scale;
  const heroHeightPx = HERO_H * scale;
  const sillHeightPx = SILL_H * scale;
  const framePadPx = FRAME_PAD * scale;
  const panePadPx = PANE_PAD * scale;

  // The pot's lower edge sits IN the sill by ~12px so its visual base
  // aligns with the windowsill's top surface.
  const potBottomPx = (SILL_H - 12) * scale;
  const windowLightBottomPx = sillHeightPx * 0.4;
  // Normalise the warm indoor light (max 0.5 at deep night) to a 0..1 opacity.
  const windowLightOpacity = clamp01(scene.windowLight / 0.5);

  return (
    <View style={{ width, height: SCENE_H * scale }}>
      {/* Wooden window frame — wraps top + sides of the glass pane. */}
      <View style={{ paddingHorizontal: framePadPx, paddingTop: framePadPx, paddingBottom: 0 }}>
        <LinearGradient
          colors={["#5C3A20", "#4A2E1A"]}
          style={[StyleSheet.absoluteFillObject, { borderTopLeftRadius: 6, borderTopRightRadius: 6 }]}
        />
        {/* Dark pane recess inside the wooden frame */}
        <View style={{ padding: panePadPx, backgroundColor: "#1F1208", borderRadius: 4 }}>
          {/* Hero — the actual view through the glass */}
          <View
            style={{
              width: heroWidthPx,
              height: heroHeightPx,
              overflow: "hidden",
              borderRadius: 2,
            }}
          >
            <SkyGradient colors={scene.sky} w={heroWidthPx} h={heroHeightPx} />
            <CelestialBody c={scene.celestial} scale={scale} />
            <Stars scale={scale} opacity={scene.stars} />
            <Mountains colors={scene.mtn} op={scene.mtnOp} w={heroWidthPx} scale={scale} />
            <Hills colors={scene.hill} op={scene.hillOp} w={heroWidthPx} scale={scale} />
            <ForestTrees trees={trees} fog1={scene.fog1} fog2={scene.fog2} scale={scale} />
            <ForestTint color={scene.tint} scale={scale} />
            <GrassForeground colors={scene.grass} scale={scale} />
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
          style={{ position: "absolute", left: 0, right: 0, top: 0, height: 6 * scale }}
        />
      </View>

      {/* Warm window-light spill — grows as the scene darkens */}
      <WindowLight scale={scale} bottom={windowLightBottomPx} opacity={windowLightOpacity} />

      {/* Soft pot glow so the centerpiece pops */}
      <PotGlow scale={scale} bottom={potBottomPx - 14 * scale} />

      {/* Pot + growing tree — sits on the sill */}
      <PotTree species={mainSpecies} stage={mainStage} scale={scale} bottom={potBottomPx} />
    </View>
  );
}
