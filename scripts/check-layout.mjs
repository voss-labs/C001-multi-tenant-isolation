import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { checkLayout, folderFor, renderReport } from "./lib/layout.mjs";

const { AUTHOR, BASE_SHA, HEAD_SHA, GITHUB_OUTPUT } = process.env;

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
}

function treeEntries(sha, folder) {
  return git("ls-tree", "-r", "-l", "-z", sha, "--", folder)
    .split("\0")
    .filter(Boolean)
    .map((line) => {
      const [meta, path] = line.split("\t");
      const [mode, type, , size] = meta.trim().split(/\s+/);
      return { path, mode, type, size: size === "-" ? null : Number(size) };
    });
}

function readMakefile(sha, folder) {
  try {
    return git("show", `${sha}:${folder}Makefile`);
  } catch {
    return null;
  }
}

if (!AUTHOR || !BASE_SHA || !HEAD_SHA) {
  console.error("AUTHOR, BASE_SHA and HEAD_SHA must be set.");
  process.exit(2);
}

const folder = folderFor(AUTHOR);
const result = checkLayout({
  author: AUTHOR,
  changes: git("diff", "--name-only", "--no-renames", "-z", `${BASE_SHA}...${HEAD_SHA}`).split("\0").filter(Boolean),
  entries: treeEntries(HEAD_SHA, folder),
  makefile: readMakefile(HEAD_SHA, folder),
});

process.stdout.write(renderReport(result));
if (GITHUB_OUTPUT) appendFileSync(GITHUB_OUTPUT, `ok=${result.problems.length === 0}\n`);
