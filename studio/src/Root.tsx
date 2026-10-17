import { Composition, Folder } from "remotion";
import { calculateStatRaceMetadata, StatRace } from "./StatRace";
import { calculateStoryMetadata, Story } from "./story/Story";
import { calculateFilmMetadata, Film } from "./film/Film";
import { Brand58, BRAND58_FRAMES } from "./film58/Film58";
import { Apolio60, APOLIO_FRAMES } from "./apolio/Apolio60";
import { Launch90, LAUNCH90_FRAMES } from "./launch90/Launch90";
import { calculateRewiresMetadata, Rewires } from "./rewires/Rewires";
import { LogoReveal } from "./rewires/LogoReveal";
import { REWIRES_DEMO } from "./rewires/demo";
import { Cine3D } from "./rewires/cine3d";
import { Thumb16 } from "./rewires/promo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
    <Folder name="Rewires">
      <Composition
        id="Rewires"
        component={Rewires}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={calculateRewiresMetadata}
        defaultProps={REWIRES_DEMO}
      />
      <Composition
        id="CineFlipClip"
        component={Cine3D}
        durationInFrames={150}
        fps={30}
        width={540}
        height={960}
        defaultProps={{ mode: "flip" as const, model: "media/cine/car.glb", hdr: "media/cine/env.hdr" }}
      />
      <Composition
        id="CineTest"
        component={Cine3D}
        durationInFrames={210}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ mode: "flip" as const, model: "media/cine/car.glb", hdr: "media/cine/env.hdr" }}
      />
      <Composition
        id="Thumb16"
        component={Thumb16}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ kicker: "AI TOOL SPOTLIGHT", line1: "Who's engineering?", line2: "Who's just", accent: "vibe coding?", mark: "media/promo/tool/logo-mark.svg", tool: "Outship", site: "OUTSHIP.AI" }}
      />
      <Composition id="RewiresOutro" component={LogoReveal} durationInFrames={90} fps={30} width={1080} height={1920} defaultProps={{}} />
      <Composition id="RewiresOutroWide" component={LogoReveal} durationInFrames={90} fps={30} width={1920} height={1080} defaultProps={{}} />
    </Folder>
    <Folder name="Reels">
      <Composition
        id="StatRace"
        component={StatRace}
        durationInFrames={960}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={calculateStatRaceMetadata}
        defaultProps={{
          hookTop: "Netflix took 18 years.",
          hookBig: "ChatGPT took 2 months.",
          title: "Time to reach 100 million users",
          items: [
            { label: "Netflix", value: 216, display: "18 years", color: "#E50914" },
            { label: "Spotify", value: 132, display: "11 years", color: "#1DB954" },
            { label: "Twitter", value: 60, display: "5 years", color: "#1D9BF0" },
            { label: "Facebook", value: 54, display: "4.5 years", color: "#1877F2" },
            { label: "Instagram", value: 30, display: "2.5 years", color: "#E1306C" },
            { label: "TikTok", value: 9, display: "9 months", color: "#111111" },
            { label: "ChatGPT", value: 2, display: "2 months", color: "#0A9E6E" },
          ],
          revealBig: "2 MONTHS",
          revealSub: "The fastest-growing app in history",
          cta: "Follow for a new AI stat every day",
          handle: "@yourhandle",
          source: "Source: UBS / Similarweb, 2023",
          accent: "#0A9E6E",
          timing: {
            hookFrames: 105,
            titleFrames: 120,
            itemFrames: [60, 50, 45, 55, 65, 60, 45],
            revealFrames: 200,
            ctaFrames: 110,
          },
          audio: null,
        }}
      />
      <Composition
        id="Story"
        component={Story}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={calculateStoryMetadata}
        defaultProps={{
          handle: "@yourhandle",
          accent: "#10C88A",
          source: "Data: UBS, Similarweb (2023)",
          music: null,
          scenes: [
            {
              type: "slam",
              dur: 90,
              vo: null,
              data: { kicker: "CHATGPT  →  100M USERS", big: "2 MONTHS", color: "#10C88A", dark: true, syncFrame: 20 },
            },
            {
              type: "cta",
              dur: 120,
              vo: null,
              data: { cta: "A new AI story. Every day." },
            },
          ],
          captions: [],
        }}
      />
    </Folder>
    <Folder name="Films">
      <Composition
        id="Film"
        component={Film}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        calculateMetadata={calculateFilmMetadata}
        defaultProps={{ title: "", music: null, credit: "", chapters: [] }}
      />
      <Composition
        id="Brand58"
        component={Brand58}
        durationInFrames={BRAND58_FRAMES}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ music: "music/brand58_score.wav" as string | null }}
      />
      <Composition
        id="Apolio60"
        component={Apolio60}
        durationInFrames={APOLIO_FRAMES}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ music: "music/apolio_score.wav" as string | null }}
      />
      <Composition
        id="Launch90"
        component={Launch90}
        durationInFrames={LAUNCH90_FRAMES}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ music: "music/launch90_score.wav" as string | null }}
      />
    </Folder>
    </>
  );
};
