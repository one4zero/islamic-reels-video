// Рендер отдельных кадров для просмотра (скриншоты перед рендером).
// node stills.mjs <project_dir> <out_dir> [--scale 0.6] <кадр> <кадр> ...
import { createRequire } from "module";
import path from "path";
import fs from "fs";
const args = process.argv.slice(2);
const project = path.resolve(args[0]);
const out = path.resolve(args[1]);
let scale = 0.6;
const frames = [];
for (let i = 2; i < args.length; i++) {
  if (args[i] === "--scale") scale = Number(args[++i]);
  else frames.push(Number(args[i]));
}
fs.mkdirSync(out, { recursive: true });
const require = createRequire(path.join(project, "package.json"));
const { bundle } = require("@remotion/bundler");
const { selectComposition, renderStill, openBrowser } = require("@remotion/renderer");
const serveUrl = await bundle({ entryPoint: path.join(project, "src/index.ts") });
const browser = await openBrowser("chrome");
const composition = await selectComposition({ serveUrl, id: "Reel", puppeteerInstance: browser });
for (const frame of frames) {
  await renderStill({ composition, serveUrl, frame, output: `${out}/f${String(frame).padStart(5, "0")}.jpeg`, imageFormat: "jpeg", scale, puppeteerInstance: browser });
  process.stdout.write(frame + " ");
}
await browser.close({ silent: true });
console.log("\n→", out);
