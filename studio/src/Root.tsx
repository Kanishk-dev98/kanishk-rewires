import { Composition, Folder } from "remotion";
import { calculateStatRaceMetadata, StatRace } from "./StatRace";
import { calculateStoryMetadata, Story } from "./story/Story";

export const RemotionRoot: React.FC = () => {
  return (
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
  );
};
