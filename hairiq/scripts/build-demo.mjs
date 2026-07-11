// Builds the single-file live demo (demo/index.html) from the SAME lib files
// the Next.js app uses — questions, principles, products, and the
// recommendation engine — so the demo never drifts from the real app.
//
//   npm run build:demo
//
// The lib files are plain ESM with single-line imports/exports, which lets us
// concatenate them into one <script> by stripping module syntax.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const LIB_ORDER = ["config.js", "questions.js", "principles.js", "products.js", "recommendations.js"];

const data = LIB_ORDER.map((file) => {
  const src = readFileSync(join(root, "lib", file), "utf8");
  return `// ===== lib/${file} =====\n${src
    .split("\n")
    .filter((line) => !line.startsWith("import "))
    .map((line) => line.replace(/^export /, ""))
    .join("\n")}`;
}).join("\n\n");

const template = readFileSync(join(root, "scripts", "demo-template.html"), "utf8");
const out = template.replace("/*__HAIRIQ_DATA__*/", () => data);

mkdirSync(join(root, "demo"), { recursive: true });
writeFileSync(join(root, "demo", "index.html"), out);
console.log(`demo/index.html written (${(out.length / 1024).toFixed(0)} kB)`);
