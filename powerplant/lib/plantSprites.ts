// powerplant/lib/plantSprites.ts
//
// Sprite atlas map for trees.png (258×213). Each species has 5 growth
// stages, and the per-stage rectangles below are *tight* content
// bounding boxes verified by alpha-channel inspection of the actual
// atlas — earlier coordinates copied from the HTML prototype had a few
// pixels of clipping at the top of saplings/young trees.

import { ImageRequireSource } from "react-native";

export const ATLAS: { source: ImageRequireSource; width: number; height: number } = {
  source: require("../assets/sprites/trees.png"),
  width: 258,
  height: 213,
};

export type SpriteRect = { x: number; y: number; w: number; h: number };

const STAGES: SpriteRect[][] = [
  // Species 0 — paars/purple fruit
  [
    { x: 8, y: 54, w: 17, h: 20 },   // stage 0 — sapling
    { x: 35, y: 42, w: 27, h: 36 },  // stage 1 — young
    { x: 76, y: 29, w: 38, h: 51 },  // stage 2 — small
    { x: 135, y: 14, w: 52, h: 66 }, // stage 3 — medium
    { x: 199, y: 14, w: 52, h: 66 }, // stage 4 — full (with fruit)
  ],
  // Species 1 — rood/red fruit
  [
    { x: 9, y: 119, w: 14, h: 20 },
    { x: 37, y: 108, w: 23, h: 33 },
    { x: 78, y: 96, w: 35, h: 47 },
    { x: 138, y: 82, w: 48, h: 62 },
    { x: 202, y: 82, w: 48, h: 62 },
  ],
  // Species 2 — geel/yellow fruit
  [
    { x: 9, y: 180, w: 14, h: 22 },
    { x: 35, y: 172, w: 28, h: 32 },
    { x: 78, y: 162, w: 38, h: 44 },
    { x: 137, y: 149, w: 48, h: 59 },
    { x: 201, y: 149, w: 48, h: 59 },
  ],
];

export const SPECIES_COUNT = STAGES.length;
export const VISIBLE_STAGE_COUNT = STAGES[0].length;

/** Atlas rectangle for a given species (0..2) and stage (0..4). */
export function getTreeSprite(species: number, stage: number): SpriteRect {
  const sIdx = Math.max(0, Math.min(SPECIES_COUNT - 1, species));
  const stIdx = Math.max(0, Math.min(VISIBLE_STAGE_COUNT - 1, stage));
  return STAGES[sIdx][stIdx];
}

/** Mature-stage sprite — shorthand for the last stage on a species. */
export function getMatureTreeSprite(species: number): SpriteRect {
  return getTreeSprite(species, VISIBLE_STAGE_COUNT - 1);
}
