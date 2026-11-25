// Проверка безопасной зоны: рендерит каждый step-й кадр в режиме probe и собирает логи SafeProbe.
// node probe.mjs <project_dir> <out_log.txt> <from> <to> <step>
// Потом: python3 check_safe.py <out_log.txt>
import { createRequire } from "module";
import path from "path";
import fs from "fs";
import os from "os";
const [projArg, outLog, from, to, step] = process.argv.slice(2);
const project = path.resolve(projArg);
const require = createRequire(path.join(project, "package.json"));
const { bundle } = require("@remotion/bundler");
const { selectComposition, renderStill, openBrowser } = require("@remotion/renderer");
const serveUrl = await bundle({ entryPoint: path.join(project, "src/index.ts") });
const browser = await openBrowser("chrome");
const inputProps = { probe: true };
const composition = await selectComposition({ serveUrl, id: "Reel", puppeteerInstance: browser, inputProps });
const lines = [];
const tmp = path.join(os.tmpdir(), "probe-frame.jpeg");
for (let frame = +from; frame < Math.min(+to, composition.durationInFrames); frame += +step) {
  await renderStill({
    composition, serveUrl, frame, inputProps, output: tmp, imageFormat: "jpeg", scale: 0.2, puppeteerInstance: browser,
    onBrowserLog: (l) => { if (l.text.startsWith("SAFE ")) lines.push(l.text); },
  });
}
fs.writeFileSync(outLog, lines.join("\n") + "\n");
await browser.close({ silent: true });
console.log("frames logged", lines.length, "→", outLog);
