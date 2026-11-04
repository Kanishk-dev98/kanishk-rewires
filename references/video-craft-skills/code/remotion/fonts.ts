/**
 * Font loading. Imported once by the motion kit, so every component can use FIG / FIG_I / MONO.
 * Swap the two Google fonts here (and FONTS in theme.ts) to re-skin type. Any variable or static family works;
 * keep a light (300) and a bold (700 to 800) weight for the "light stem + bold payload" line style.
 */
import { loadFont as loadSans } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

export const { fontFamily: FIG } = loadSans("normal", { weights: ["300", "400", "500", "600", "700", "800"], subsets: ["latin"] });
/** Italic of the sans, for entity labels (people, organisations) in chains. */
export const { fontFamily: FIG_I } = loadSans("italic", { weights: ["500", "600", "700"], subsets: ["latin"] });
export const { fontFamily: MONO } = loadMono("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });
