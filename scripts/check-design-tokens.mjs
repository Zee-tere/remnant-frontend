import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const projectRoot = process.cwd();
const sourceRoot = join(projectRoot, "src");
const globalsPath = join(sourceRoot, "app", "globals.css");
const failures = [];

const requiredContracts = [
  "--shape-radius-control: 0.625rem",
  "--shape-radius-card: 1rem",
  "--shape-radius-surface: 1.5rem",
  "--shape-radius-feature: 2rem",
  "--shape-radius-pill: 999px",
  "--intent-sell:",
  "--intent-trade:",
  "--intent-donate:",
  "--intent-repair:",
  "--intent-recycle:",
  "--state-success:",
  "--state-info:",
  "--state-pending:",
  "--state-danger:",
];

const globals = readFileSync(globalsPath, "utf8");
for (const contract of requiredContracts) {
  if (!globals.includes(contract)) failures.push(`src/app/globals.css: missing design contract ${contract}`);
}

function sourceFiles(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? sourceFiles(path) : [path];
  });
}

function lineNumber(source, index) {
  return source.slice(0, index).split("\n").length;
}

for (const path of sourceFiles(sourceRoot)) {
  if (![".tsx", ".ts", ".css"].includes(extname(path))) continue;
  const source = readFileSync(path, "utf8");
  const displayPath = relative(projectRoot, path).replaceAll("\\", "/");

  for (const match of source.matchAll(/rounded-\[[^\]]+\]/g)) {
    failures.push(`${displayPath}:${lineNumber(source, match.index)}: use a named radius token instead of ${match[0]}`);
  }

  for (const match of source.matchAll(/text-\[0\.(\d+)rem\]/g)) {
    const size = Number(`0.${match[1]}`) * 16;
    if (size < 12) failures.push(`${displayPath}:${lineNumber(source, match.index)}: meaningful text must be at least 12px`);
  }

  const formControlPattern = /<(?:Input|Textarea|select|input)\b[\s\S]*?>/g;
  for (const match of source.matchAll(formControlPattern)) {
    const tag = match[0];
    if (!tag.includes("rounded-full")) continue;
    if (/type=["'](?:checkbox|radio|range)["']/.test(tag)) continue;
    failures.push(`${displayPath}:${lineNumber(source, match.index)}: persistent form controls must use rounded-control`);
  }

  const buttonPattern = /<Button\b[\s\S]*?>/g;
  for (const match of source.matchAll(buttonPattern)) {
    if (match[0].includes("rounded-full")) {
      failures.push(`${displayPath}:${lineNumber(source, match.index)}: buttons inherit rounded-control; remove rounded-full`);
    }
  }

  for (const match of source.matchAll(/#(?:e2f7ff|fff6cf|9a4d13|13705e)/gi)) {
    failures.push(`${displayPath}:${lineNumber(source, match.index)}: use semantic intent/state tokens instead of ${match[0]}`);
  }
}

if (failures.length > 0) {
  console.error("Design token policy failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Design token policy passed.");
