export const ROOT = "submissions/";
export const MARKER = "<!-- c001-layout -->";
export const REQUIRED = ["Makefile", "README.md", "SOLUTION.md"];
export const TARGETS = ["start", "reset", "test", "stop"];
export const DEPENDENCY_DIRS = ["node_modules", ".venv", "venv", "__pycache__"];
export const MAX_FILE_BYTES = 2 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 10 * 1024 * 1024;

const LIST_LIMIT = 10;

export function folderFor(author) {
  return `${ROOT}${author.toLowerCase()}/`;
}

export function makeTargets(makefile) {
  const targets = new Set();
  for (const line of makefile.split("\n")) {
    const rule = line.match(/^([^\s#:=][^:=#]*?)\s*::?(?!=)/);
    if (rule) for (const name of rule[1].split(/\s+/)) targets.add(name);
  }
  return targets;
}

function code(path) {
  return `\`${path.replaceAll("`", "'")}\``;
}

function list(paths) {
  const shown = paths.slice(0, LIST_LIMIT).map(code).join(", ");
  return paths.length > LIST_LIMIT ? `${shown} and ${paths.length - LIST_LIMIT} more` : shown;
}

function megabytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function checkLayout({ author, changes, entries, makefile }) {
  const folder = folderFor(author);
  const own = entries.filter((e) => e.path.startsWith(folder));
  const relative = (e) => e.path.slice(folder.length);
  const blobs = own.filter((e) => e.type === "blob" && e.mode !== "120000");
  const bytes = blobs.reduce((sum, e) => sum + e.size, 0);
  const problems = [];

  const outside = changes.filter((path) => !path.startsWith(folder));
  if (outside.length > 0) {
    problems.push({
      title: `This pull request changes files outside \`${folder}\`.`,
      fix: `Your submission must live entirely in \`${folder}\`: your GitHub username, in lowercase. Move or revert ${list(outside)} on this branch and push again.`,
    });
  }

  const present = new Set(own.map(relative));
  const missing = REQUIRED.filter((name) => !present.has(name));
  if (missing.length > 0) {
    problems.push({
      title: "Required files are missing.",
      fix: `Add ${list(missing.map((name) => folder + name))}. SOLUTION.md starts as a copy of SOLUTION_TEMPLATE.md.`,
    });
  }

  if (makefile !== null) {
    const defined = makeTargets(makefile);
    const absent = TARGETS.filter((name) => !defined.has(name));
    if (absent.length > 0) {
      problems.push({
        title: "The Makefile is missing required targets.",
        fix: `Define ${absent.map((name) => `\`${name}\``).join(", ")} in \`${folder}Makefile\`. The contract is in docs/SUBMISSION.md.`,
      });
    }
  }

  const links = own.filter((e) => e.mode === "120000" || e.type === "commit");
  if (links.length > 0) {
    problems.push({
      title: "The folder contains symlinks or submodules.",
      fix: `Replace ${list(links.map((e) => e.path))} with real files inside your folder.`,
    });
  }

  const dependencies = blobs.filter((e) => relative(e).split("/").slice(0, -1).some((part) => DEPENDENCY_DIRS.includes(part)));
  if (dependencies.length > 0) {
    problems.push({
      title: "The folder contains dependency or cache folders.",
      fix: `Remove ${list(dependencies.map((e) => e.path))} and add a \`.gitignore\` to your folder. Dependencies are installed when your containers build.`,
    });
  }

  const large = blobs.filter((e) => e.size > MAX_FILE_BYTES);
  if (large.length > 0) {
    problems.push({
      title: `Files are larger than ${megabytes(MAX_FILE_BYTES)}.`,
      fix: `Remove ${list(large.map((e) => e.path))}. Generate large data when your containers start instead of committing it.`,
    });
  }

  if (bytes > MAX_TOTAL_BYTES) {
    problems.push({
      title: `The folder is ${megabytes(bytes)} in total, over the ${megabytes(MAX_TOTAL_BYTES)} limit.`,
      fix: "Remove build output, binaries and generated files, and add them to your `.gitignore`.",
    });
  }

  return { folder, problems, files: blobs.length, bytes };
}

export function renderReport({ folder, problems, files, bytes }) {
  const summary = `Folder ${code(folder)}, ${files} files, ${megabytes(bytes)}.`;
  if (problems.length === 0) {
    return `${MARKER}\n### Submission layout: passed\n\n${summary}\n\nThe Isolation run check starts your submission and runs its tests.\n`;
  }
  const items = problems.map((p) => `- **${p.title}** ${p.fix}`).join("\n");
  return `${MARKER}\n### Submission layout: needs changes\n\n${summary}\n\n${items}\n\nPush the fixes to this same branch and this check runs again.\n`;
}
