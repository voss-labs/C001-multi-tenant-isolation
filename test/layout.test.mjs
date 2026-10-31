import { test } from "node:test";
import assert from "node:assert/strict";
import { checkLayout, folderFor, makeTargets, renderReport, MAX_FILE_BYTES } from "../scripts/lib/layout.mjs";

const MAKEFILE = ".PHONY: start reset test stop\nstart:\n\tdocker compose up -d\nreset:\n\t./reset\ntest:\n\t./test\nstop:\n\tdocker compose down -v\n";

function blob(path, size = 100) {
  return { path, mode: "100644", type: "blob", size };
}

function valid(author = "priya-k") {
  const dir = folderFor(author);
  return {
    author,
    changes: [`${dir}Makefile`, `${dir}README.md`, `${dir}SOLUTION.md`, `${dir}src/app.go`],
    entries: [blob(`${dir}Makefile`), blob(`${dir}README.md`), blob(`${dir}SOLUTION.md`), blob(`${dir}src/app.go`)],
    makefile: MAKEFILE,
  };
}

function titles(result) {
  return result.problems.map((p) => p.title);
}

test("folder is the lowercase username", () => {
  assert.equal(folderFor("Priya-K"), "submissions/priya-k/");
});

test("a complete submission passes", () => {
  const result = checkLayout(valid());
  assert.deepEqual(result.problems, []);
  assert.equal(result.files, 4);
  assert.equal(result.bytes, 400);
});

test("changes outside the author's folder are rejected", () => {
  const input = valid();
  input.changes.push("docs/SPECIFICATION.md", "submissions/someone-else/Makefile");
  const result = checkLayout(input);
  assert.equal(result.problems.length, 1);
  assert.match(result.problems[0].fix, /docs\/SPECIFICATION\.md/);
  assert.match(result.problems[0].fix, /submissions\/someone-else\/Makefile/);
});

test("a folder with the wrong case is outside the author's folder", () => {
  const input = valid("priya-k");
  input.changes = ["submissions/Priya-K/Makefile"];
  input.entries = [blob("submissions/Priya-K/Makefile")];
  const result = checkLayout(input);
  assert.ok(titles(result).some((t) => /outside/.test(t)));
  assert.ok(titles(result).some((t) => /missing/i.test(t)));
  assert.match(result.problems[0].fix, /submissions\/priya-k\//);
});

test("missing required files are listed", () => {
  const input = valid();
  input.entries = input.entries.filter((e) => !e.path.endsWith("SOLUTION.md") && !e.path.endsWith("README.md"));
  const result = checkLayout(input);
  const problem = result.problems.find((p) => /missing/i.test(p.title));
  assert.match(problem.fix, /README\.md/);
  assert.match(problem.fix, /SOLUTION\.md/);
});

test("missing make targets are listed", () => {
  const input = valid();
  input.makefile = "start:\n\techo\nstop:\n\techo\n";
  const problem = checkLayout(input).problems.find((p) => /target/i.test(p.title));
  assert.match(problem.fix, /reset/);
  assert.match(problem.fix, /test/);
});

test("target names are read from rule lines only", () => {
  const targets = makeTargets("X := 1\nstart reset: deps\n\techo test:\ntest::\n# stop:\nstop :\n");
  assert.deepEqual([...targets].sort(), ["reset", "start", "stop", "test"]);
  assert.equal(makeTargets("VAR:=start\nOTHER ?= x\n").size, 0);
});

test("target check is skipped when there is no Makefile", () => {
  const input = valid();
  input.entries = input.entries.filter((e) => !e.path.endsWith("Makefile"));
  input.makefile = null;
  assert.ok(!titles(checkLayout(input)).some((t) => /target/i.test(t)));
});

test("symlinks and submodules are rejected", () => {
  const input = valid();
  input.entries.push({ path: "submissions/priya-k/link", mode: "120000", type: "blob", size: 10 });
  input.entries.push({ path: "submissions/priya-k/lib", mode: "160000", type: "commit", size: null });
  const problem = checkLayout(input).problems.find((p) => /symlink/i.test(p.title));
  assert.match(problem.fix, /link/);
  assert.match(problem.fix, /lib/);
});

test("files over the size limit are rejected", () => {
  const input = valid();
  input.entries.push(blob("submissions/priya-k/dump.sql", MAX_FILE_BYTES + 1));
  assert.ok(titles(checkLayout(input)).some((t) => /larger than/i.test(t)));
});

test("a folder over the total limit is rejected", () => {
  const input = valid();
  for (let i = 0; i < 6; i += 1) input.entries.push(blob(`submissions/priya-k/data/${i}.json`, MAX_FILE_BYTES));
  assert.ok(titles(checkLayout(input)).some((t) => /in total/i.test(t)));
});

test("dependency folders are rejected", () => {
  const input = valid();
  input.entries.push(blob("submissions/priya-k/api/node_modules/x/index.js"));
  input.entries.push(blob("submissions/priya-k/.venv/lib/site.py"));
  const problem = checkLayout(input).problems.find((p) => /dependency/i.test(p.title));
  assert.match(problem.fix, /node_modules/);
  assert.match(problem.fix, /\.venv/);
});

test("a file named like a dependency folder is allowed", () => {
  const input = valid();
  input.entries.push(blob("submissions/priya-k/docs/venv"));
  assert.deepEqual(checkLayout(input).problems, []);
});

test("deleting files inside your own folder is fine", () => {
  const input = valid();
  input.changes.push("submissions/priya-k/old.txt");
  assert.deepEqual(checkLayout(input).problems, []);
});

test("the report carries the marker and the outcome", () => {
  const passed = renderReport(checkLayout(valid()));
  assert.ok(passed.startsWith("<!-- c001-layout -->"));
  assert.match(passed, /passed/);
  const input = valid();
  input.changes.push("README.md");
  const failed = renderReport(checkLayout(input));
  assert.match(failed, /needs changes/);
  assert.match(failed, /README\.md/);
});

test("backticks in paths cannot break out of code spans", () => {
  const input = valid();
  input.changes.push("evil`](http://x)`.md");
  const report = renderReport(checkLayout(input));
  assert.ok(!report.includes("evil`"));
});
