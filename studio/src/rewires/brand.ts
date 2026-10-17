// Brand tokens for Kanishk.Rewires. Everything comes from config/brand.config.json,
// so colours, fonts and the logo path are defined in exactly one place.
import { loadFont as loadGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlexMono } from "@remotion/google-fonts/IBMPlexMono";
import { loadFont as loadInstrument } from "@remotion/google-fonts/InstrumentSerif";
import { Easing } from "remotion";
import brand from "../../../config/brand.config.json";

export const BRAND = brand;
export const C = brand.palette;

export const { fontFamily: HEAD } = loadGrotesk("normal", { weights: ["400", "500", "700"], subsets: ["latin"] });
export const { fontFamily: BODY } = loadInter("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });
export const { fontFamily: MONO } = loadPlexMono("normal", { weights: ["400", "500", "600"], subsets: ["latin"] });
export const { fontFamily: SERIF } = loadInstrument("normal", { weights: ["400"], subsets: ["latin"] });

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
/** One easing vocabulary for the whole brand: a fast, settled ease out and a calm ease in out. */
export const EASE = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IO = Easing.bezier(0.65, 0, 0.35, 1);

/** Vertical layout zones as fractions of frame height (mobile safe areas). */
export const ZONE = {
  contentTop: 0.12,
  contentBottom: 0.63,
  captionTop: 0.69,
  sourceY: 0.775,
};
