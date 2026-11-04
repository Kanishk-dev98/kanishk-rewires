/**
 * CraftLab: one labelled demo per core technique, 120 frames each, so a new repo can render the kit and look at it.
 * Render stills first: npx remotion still src/index.ts CraftLab out/lab.png --frame=<n> --gl=angle
 * Scene n starts at frame (n - 1) * 120.
 */
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import {
  AuditStaircase,
  BlurIn,
  Brandify,
  CaptionToInput,
  CardToPanel,
  ChipDive,
  DarkStage,
  FIG,
  HiddenQuestions,
  LabLabel,
  LightStage,
  MONO,
  OptionRing,
  ReasoningLog,
  ShapeWindowZoom,
  Spotlight,
  StatePill,
  T,
  TagChip,
  TrackIn,
  UICard,
  UIPlane,
  WordBuild,
  chipDiveSquare,
} from "../motion";
import { Logo3D, Stage3D, focusDistance, prog, pushSettle, withDrift } from "../three";

const PER = 120;

/** A dense, realistic data screen (never sparse placeholder panels): header, filters, 8 rows, one held row. */
const Ledger: React.FC<{ w?: number }> = ({ w = 1500 }) => {
  const rows = [
    ["4178", "Freight quote", "0.40", "allow"],
    ["4179", "Data lookup", "0.03", "allow"],
    ["4180", "Design tool", "49.00", "ask"],
    ["4181", "Map tiles", "1.20", "allow"],
    ["4182", "Supplier invoice", "96.20", "held"],
    ["4183", "Translation", "4.10", "allow"],
    ["4184", "Storage", "12.00", "allow"],
    ["4185", "Courier", "18.50", "allow"],
  ] as const;
  return (
    <UICard w={w} pad={40}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 26 }}>
        <span style={{ fontFamily: FIG, fontWeight: 700, fontSize: 40 }}>Requests today</span>
        <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 24, color: T.muted, letterSpacing: 2 }}>8 OF 214 · LIVE</span>
      </div>
      {rows.map(([id, what, amt, s]) => (
        <div key={id} style={{ display: "flex", alignItems: "center", height: 72, borderTop: `1px solid ${T.border}`, fontFamily: FIG, fontSize: 30, background: s === "held" ? T.denyWash : undefined }}>
          <span style={{ width: 140, fontFamily: MONO, fontSize: 26, color: T.muted }}>{id}</span>
          <span style={{ flex: 1, fontWeight: 500 }}>{what}</span>
          <span style={{ width: 200, textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{amt}</span>
          <span style={{ width: 260, display: "flex", justifyContent: "flex-end" }}>
            <StatePill s={s} size={22} />
          </span>
        </div>
      ))}
    </UICard>
  );
};

const Hero3D: React.FC = () => {
  const f = useCurrentFrame();
  const pose = withDrift(
    pushSettle({ frame: f, start: 4, dur: 70, from: { position: [-1.6, 0.5, 4.2], target: [0, 0, 0], fov: 30 }, to: { position: [0.6, 0.2, 3.3], target: [0, 0, 0], fov: 30 } }),
    f,
    0.025,
  );
  return (
    <Stage3D mode="light" pose={pose} envRotation={-0.4 + f * 0.006} post={{ grain: 0.02, dof: { focus: focusDistance(pose, [0, 0, 0]), aperture: 0.0035, maxblur: 0.008 } }}>
      <Logo3D finish="satin" assemble={prog(f, 6, 50)} rotation={[0.1, -0.4, 0.02]} />
    </Stage3D>
  );
};

const demos: { name: string; dark?: boolean; el: React.ReactNode }[] = [
  {
    name: "WordBuild + TrackIn",
    el: (
      <LightStage>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 40 }}>
          <WordBuild text="Every request checked before it moves." at={6} every={5} size={84} />
          <TrackIn text="Before, not after." at={50} size={64} color={T.muted} />
        </AbsoluteFill>
      </LightStage>
    ),
  },
  {
    name: "UIPlane macro push + whip",
    el: (
      <UIPlane
        width={1920}
        height={1080}
        keys={[
          { at: 0, x: 960, y: 540, zoom: 0.9 },
          { at: 20, x: 1000, y: 610, zoom: 2.0, move: "push" },
          { at: 70, x: 1100, y: 470, zoom: 2.0, move: "whip" },
        ]}
        focusY={540}
      >
        <div style={{ position: "absolute", left: 210, top: 150 }}>
          <Ledger />
        </div>
      </UIPlane>
    ),
  },
  {
    name: "Spotlight + OptionRing",
    el: (
      <LightStage>
        <div style={{ position: "absolute", left: 210, top: 150 }}>
          <Ledger />
        </div>
        {/* ledger rows start at y ≈ 265 and are 72 px tall: row i spans 265 + 72·i */}
        <Spotlight at={10} out={70} rect={{ x: 250, y: 553, w: 1420, h: 72 }} />
        <OptionRing at={76} options={[{ x: 1515, y: 276, w: 155, h: 50 }, { x: 1515, y: 420, w: 155, h: 50 }, { x: 1515, y: 564, w: 155, h: 50 }]} per={14} />
      </LightStage>
    ),
  },
  {
    name: "ChipDive into AuditStaircase",
    dark: true,
    el: (
      <ChipDive
        at={20}
        surfaceAt={100}
        chip={{ x: 960, y: 540 }}
        label="Policy check"
        surfaceLabel="Held"
        surfaceState="held"
        light={<LightStage />}
        dark={
          <DarkStage>
            <AuditStaircase
              at={30}
              every={12}
              bornFrom={chipDiveSquare({ x: 960, y: 540 })}
              steps={[
                { label: "Requester verified", kind: "check" },
                { label: "Owner: Finance team", kind: "entity" },
                { label: "Amount within limit", kind: "check" },
                { label: "Payee changed 14 h ago", kind: "held" },
              ]}
            />
          </DarkStage>
        }
      />
    ),
  },
  {
    name: "ShapeWindowZoom",
    el: (
      <ShapeWindowZoom at={20} title={<span style={{ fontFamily: FIG, fontWeight: 300, fontSize: 110, color: T.ink }}>One place.</span>} peek={[960, 590]}>
        <LightStage>
          <div style={{ position: "absolute", left: 210, top: 150 }}>
            <Ledger />
          </div>
        </LightStage>
      </ShapeWindowZoom>
    ),
  },
  {
    name: "CardToPanel",
    el: (
      <CardToPanel at={30} rect={{ x: 360, y: 190, w: 1200, h: 700 }} hero={<span style={{ fontFamily: FIG, fontWeight: 800, fontSize: 140, color: "#FFFFFF" }}>Ready.</span>}>
        <div style={{ padding: 60, fontFamily: FIG, fontSize: 44, fontWeight: 700, color: "#FFFFFF" }}>Account panel</div>
      </CardToPanel>
    ),
  },
  {
    name: "ReasoningLog",
    el: (
      <LightStage>
        <ReasoningLog
          at={4}
          openAt={24}
          title="Checking 4 rules…"
          doneTitle="Held: payee changed"
          rows={[
            { text: "Loaded policy 7F3A (4 rules)", mono: true },
            { text: "Amount 96.20 ≤ 200", state: "ok" },
            { text: "Merchant on the allow list", state: "ok" },
            { text: "Payee changed 14 h ago → hold", state: "held" },
          ]}
        />
      </LightStage>
    ),
  },
  {
    name: "HiddenQuestions",
    el: (
      <HiddenQuestions
        at={20}
        resolveAt={80}
        questions={[
          { q: "Who asked?", a: "Verified requester", x: 560, y: 320, size: 34 },
          { q: "Is it allowed?", a: "Within policy", x: 1380, y: 300, size: 30 },
          { q: "Over the limit?", a: "Under 200", x: 600, y: 760, size: 28 },
          { q: "Who approves?", a: "Finance lead", x: 1340, y: 780, size: 36 },
        ]}
      >
        <LightStage>
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
            <TagChip label="Pay supplier 96.20" size={40} />
          </AbsoluteFill>
        </LightStage>
      </HiddenQuestions>
    ),
  },
  {
    name: "Brandify trilogy (last one held)",
    el: (
      <LightStage>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 60 }}>
          <Brandify at={10} label="Create" doneLabel="Created" size={44} />
          <Brandify at={45} label="Confirm" doneLabel="Confirmed" size={44} />
          <Brandify at={80} label="Release" held size={44} />
        </AbsoluteFill>
      </LightStage>
    ),
  },
  {
    name: "CaptionToInput",
    el: (
      <LightStage>
        <CaptionToInput at={20} caption="Ready to send" prompt="Send the March invoice to the supplier" />
      </LightStage>
    ),
  },
  { name: "Logo3D push with settle", el: <Hero3D /> },
  {
    name: "BlurIn + StatePills",
    el: (
      <LightStage>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 40 }}>
          <BlurIn at={6}>
            <StatePill s="allow" size={34} />
          </BlurIn>
          <BlurIn at={14}>
            <StatePill s="ask" size={34} />
          </BlurIn>
          <BlurIn at={22}>
            <StatePill s="held" size={34} />
          </BlurIn>
        </AbsoluteFill>
      </LightStage>
    ),
  },
];

export const CRAFT_LAB_FRAMES = demos.length * PER;

export const CraftLab: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {demos.map((d, i) => (
      <Sequence key={d.name} from={i * PER} durationInFrames={PER} premountFor={0}>
        {d.el}
        <LabLabel n={i + 1} name={d.name} dark={d.dark} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
