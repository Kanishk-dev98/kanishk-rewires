import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
const [propsPath, outDir, ...frames] = process.argv.slice(2);
const inputProps = JSON.parse(fs.readFileSync(propsPath, "utf8"));
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: "Rewires", inputProps });
fs.mkdirSync(outDir, { recursive: true });
for (const fr of frames) {
  await renderStill({ serveUrl, composition, inputProps, frame: Number(fr), output: path.join(outDir, `f${String(fr).padStart(4, "0")}.png`), chromiumOptions: { gl: "angle" } });
  console.log("ok", fr);
}
