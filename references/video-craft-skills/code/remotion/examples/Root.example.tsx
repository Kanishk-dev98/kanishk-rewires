/**
 * Example registration. Merge these <Composition> entries into your project's Root.tsx.
 * Default props for FilmTemplate are a placeholder; the builder writes the real ones to out/<tag>.props.json,
 * which you pass with --props at render time.
 */
import React from "react";
import { Composition } from "remotion";
import { CRAFT_LAB_FRAMES, CraftLab } from "./CraftLab";
import { FilmTemplate, FilmProps, calculateFilmMetadata } from "./FilmTemplate";

const placeholder: FilmProps = { totalFrames: 300, scenes: [{ id: "open", from: 0, dur: 300, lines: [] }], vo: [], music: null };

export const ExampleRoot: React.FC = () => (
  <>
    <Composition id="CraftLab" component={CraftLab} durationInFrames={CRAFT_LAB_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Film" component={FilmTemplate} durationInFrames={300} fps={30} width={1920} height={1080} defaultProps={placeholder} calculateMetadata={calculateFilmMetadata} />
  </>
);
