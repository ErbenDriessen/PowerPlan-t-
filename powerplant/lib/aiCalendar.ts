// ============================================================
// AI-KALENDER — DIT BESTAND IS VOOR JOU 👋
//
// Hoi! Dit is het enige bestand waar jij in hoeft te werken
// voor de AI-kalender. Onderaan staan twee functies. Op dit
// moment geven ze nepdata terug. Jouw taak is om er echte
// data uit te laten komen.
//
// WAT JE MOET DOEN
// ----------------
// 1) Vul `getPlannedDay()` zodat hij een lijstje teruggeeft
//    met blokken voor de dag van de gebruiker. Eén blok is
//    een tijd + naam + kort tekstje + emoji + kleurcategorie.
//    Zie het type `PlanBlock` hieronder voor de precieze vorm.
//
// 2) Vul `getSuggestion()` als je een tip wil tonen onder het
//    schema (bijvoorbeeld "je dag is best vol, zullen we iets
//    verplaatsen?"). Geef `null` terug als er geen tip is —
//    dan toont het scherm vanzelf een placeholder.
//
// WAT JE *NIET* MOET DOEN
// -----------------------
// - De namen van `getPlannedDay` en `getSuggestion` niet
//   veranderen, en de vorm van wat ze teruggeven ook niet,
//   anders stopt het Planning-scherm met werken.
// - Andere bestanden hoef je niet aan te raken. Je werkt
//   alleen in dit bestand.
//
// HOE ZIE JE HET RESULTAAT?
// -------------------------
// Het bestand `app/(tabs)/planning.tsx` roept jouw twee
// functies aan en tekent de blokken/suggestie op het scherm.
// Zodra je de functies invult, zie je het direct verschijnen
// als je de app opnieuw laadt.
//
// Vragen? Vraag Erben. 🙂
// ============================================================

// --- Types (bouwstenen) ----------------------------------------

// De kleurcategorie van een blok in het schema.
// "primary"  = groen (focus, beweging, doelen)
// "bark"     = bruin (school of vaste afspraken)
// "warm"     = geel  (rust, ontspanning)
// "neutral"  = grijs (eten, overig)
export type PlanTone = "primary" | "bark" | "warm" | "neutral";

// Eén blok in het dagschema.
// Voorbeeld:
//   { time: "08:30", label: "Wandeling", sub: "15 min",
//     emoji: "🚶", tone: "primary" }
export type PlanBlock = {
  time: string;   // tijdstip, formaat "HH:MM"
  label: string;  // naam van de activiteit
  sub: string;    // kort detail, bv. "15 min" of "tot 12:30"
  emoji: string;  // 1 emoji die bij de activiteit past
  tone: PlanTone; // welke kleur het blok krijgt (zie hierboven)
};

// De tip-kaart die onder het schema verschijnt.
// Beide knoppen zijn optioneel. Geef je geen knoppen op? Dan
// toont het scherm alleen de tekst.
export type PlanSuggestion = {
  text: string;
  primaryAction?: { label: string }; // gele "doe het" knop
  dismissAction?: { label: string }; // grijze "laat zo" knop
};

// --- Hier hoort jouw werk te komen -----------------------------
//
// De PLACEHOLDER_BLOCKS hieronder is gewoon nepdata zodat het
// scherm er nu al goed uitziet. Je mag deze constante helemaal
// weghalen of vervangen.

const PLACEHOLDER_BLOCKS: PlanBlock[] = [
  { time: "08:30", label: "Niet", sub: "15 min", emoji: "🚶", tone: "primary" },
  { time: "10:00", label: "Mijn", sub: "tot 12:30", emoji: "📚", tone: "bark" },
  { time: "13:00", label: "Epic", sub: "45 min focus", emoji: "🎯", tone: "primary" },
  { time: "17:30", label: "Lol", sub: "rustig moment", emoji: "🍽️", tone: "neutral" },
  { time: "20:30", label: ":)", sub: "ademen · 10 min", emoji: "🧘", tone: "warm" },
];

// 1) Geeft het dagschema terug.
//    Vervang de inhoud van deze functie door jouw AI-logica.
export function getPlannedDay(): PlanBlock[] {
  return PLACEHOLDER_BLOCKS;
}

// 2) Geeft een tip terug (of `null` als er geen tip is).
//    Voorbeeld van wat je later zou kunnen teruggeven:
//
//      return {
//        text: "Je planning is best vol. Zullen we het studeerblok inkorten?",
//        primaryAction: { label: "Verplaatsen" },
//        dismissAction: { label: "Laat zo" },
//      };
//
//    Voorlopig geven we `null` terug zodat het scherm laat zien
//    dat deze functie nog gebouwd moet worden.
export function getSuggestion(): PlanSuggestion | null {
  return null;
}
