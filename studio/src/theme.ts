/**
 * THEME TOKENS: the only file you edit to re-skin the whole kit for a brand.
 *
 * - Colours: one accent family (accent / accentDeep / accentBright / deep / accentText / accentSoft / accentSoft2),
 *   neutrals, a dark stage, and a "deny" family used only for refused / held items.
 * - ACCENT_SHAPE: the brand shape used for windows, irises, chip notches, shards and the shape grid. Give the
 *   polygon in a 100-unit box (convex works best for windows). Default: a neutral hexagon.
 * - Fonts: family names only. Load them in fonts.ts (or your own loader) before rendering.
 *
 * Rules the components assume: read text >= 26 px, UI body >= 28 px, contrast >= 4.5:1 on the stage behind it,
 * the deny family is never the accent, and the accent is never used as a full-frame wash for long.
 */

export const T = {
  /* accent family (default: cobalt). Replace all seven together so gradients stay coherent. */
  accent: "#5B7CFA",
  accentDeep: "#3A5BD9",
  accentBright: "#86A2FF",
  deep: "#24399A",
  accentText: "#1F2F80",
  accentSoft: "#DCE4FF",
  accentSoft2: "#C5D2FF",
  /* neutrals */
  ink: "#171717",
  muted: "#6B6B6B",
  surface: "#FFFFFF",
  soft: "#F5F5F5",
  wash: "#F4F6FC",
  border: "#E7E7E5",
  borderDark: "#3A3A3A",
  hair: "#D6D6D6",
  /* dark stage */
  dark: "#0A0A0A",
  darkTint: "#101833",
  /* refused / held only */
  deny: "#E2887C",
  denyDeep: "#A33F31",
  denyWash: "#FDEEEC",
} as const;

/** Accent gradient surface (hero cards, accent buttons, card-to-panel). */
export const ACCENT_GRAD = `linear-gradient(135deg, ${T.accentSoft} 0%, ${T.accentDeep} 55%, ${T.deep} 100%)`;
export const ACCENT_GRAD_SOFT = `linear-gradient(135deg, #EEF2FF 0%, ${T.accentSoft2} 50%, ${T.accentDeep} 100%)`;

/** RGB triplet of a #RRGGBB colour, for rgba() strings. */
export const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(",");

/**
 * The brand shape as a polygon in a 100 x 100 box. Used by ShapeWindowZoom, ShapeIris (via SHAPE_PATH),
 * AccentShape (chip notch, shards, send button) and ShapeGrid. Replace with your logo's silhouette.
 */
export const ACCENT_SHAPE: [number, number][] = [
  [50, 6],
  [88, 28],
  [88, 72],
  [50, 94],
  [12, 72],
  [12, 28],
];
export const SHAPE_PATH = `M${ACCENT_SHAPE.map((p) => p.join(" ")).join(" L")} Z`;

/** Font family names. fonts.ts loads the defaults from Google Fonts; swap both together. */
export const FONTS = {
  sans: "Inter",
  mono: "JetBrains Mono",
};

/** Video format. All components assume this canvas (1920 x 1080 at 30 fps). */
export const FORMAT = { width: 1920, height: 1080, fps: 30, safe: 80 } as const;
