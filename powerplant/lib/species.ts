// powerplant/lib/species.ts
//
// Metadata voor de drie boomsoorten (sprite-index 0..2). Naam + fruitkleur
// worden o.a. in de prestige-picker getoond.
export type Species = {
  id: number;
  name: string;
  fruit: string;
  color: string;
};

// Volgorde = sprite-index in trees.png (0..2). De fruitkleuren hieronder
// zijn afgestemd op de échte sprites: rij 0 paarse besjes, rij 1 geel
// fruit, rij 2 rood fruit.
export const SPECIES: Species[] = [
  { id: 0, name: "Pruimenboom", fruit: "paars fruit", color: "#9B6BC4" },
  { id: 1, name: "Perenboom", fruit: "geel fruit", color: "#E0B33C" },
  { id: 2, name: "Appelboom", fruit: "rood fruit", color: "#D65A52" },
];
