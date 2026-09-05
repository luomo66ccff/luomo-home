import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, "..");
const assetRoot = join(projectRoot, "public", "live2d");
const readmePath = join(assetRoot, "README.md");

const models = {
  atri: join(assetRoot, "atri", "atri_8.model3.json"),
  murasame: join(assetRoot, "companions", "murasame", "Murasame.model3.json"),
  allium: join(assetRoot, "companions", "allium", "ariu", "ariu.model3.json"),
};

const issues = [];
const report = ["# Live2D Model Capabilities", "", `Asset root: ${relative(projectRoot, assetRoot).replaceAll("\\", "/")}`, ""];

function addIssue(message) {
  issues.push(message);
}

function relativeAssetPath(filePath) {
  return relative(projectRoot, filePath).replaceAll("\\", "/");
}

function listExpressions(refs) {
  if (refs.Expressions === undefined) return [];
  if (!Array.isArray(refs.Expressions)) {
    addIssue("FileReferences.Expressions must be an array");
    return [];
  }
  return refs.Expressions;
}

function listMotions(refs) {
  if (refs.Motions === undefined) return {};
  if (!refs.Motions || typeof refs.Motions !== "object" || Array.isArray(refs.Motions)) {
    addIssue("FileReferences.Motions must be an object");
    return {};
  }
  return refs.Motions;
}

function checkReferencedFile(modelName, modelPath, fileName, description) {
  if (typeof fileName !== "string" || !fileName) return;
  const referencedPath = join(dirname(modelPath), fileName);
  if (!existsSync(referencedPath)) {
    addIssue(`${modelName}: ${description} is missing (${relativeAssetPath(referencedPath)})`);
  }
}

function inspectModel(name, modelPath) {
  const modelLabel = name.toUpperCase();
  report.push(`## ${modelLabel}`, `Path: ${relativeAssetPath(modelPath)}`, "");

  if (!existsSync(modelPath)) {
    report.push("**MISSING** (private model asset is not mounted)", "");
    addIssue(`${name}: model file is missing (${relativeAssetPath(modelPath)})`);
    return;
  }

  let data;
  try {
    data = JSON.parse(readFileSync(modelPath, "utf8"));
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    report.push(`**INVALID** (${reason})`, "");
    addIssue(`${name}: model JSON could not be parsed`);
    return;
  }

  const refs = data?.FileReferences;
  if (!refs || typeof refs !== "object" || Array.isArray(refs)) {
    report.push("**INVALID** (FileReferences is missing)", "");
    addIssue(`${name}: FileReferences is missing`);
    return;
  }

  checkReferencedFile(name, modelPath, refs.Moc, "Moc file");
  checkReferencedFile(name, modelPath, refs.Physics, "physics file");
  checkReferencedFile(name, modelPath, refs.Pose, "pose file");
  checkReferencedFile(name, modelPath, refs.DisplayInfo, "display info file");

  const expressions = listExpressions(refs);
  report.push(`### Expressions (${expressions.length})`);
  if (expressions.length === 0) {
    report.push("- (none)");
  } else {
    for (const expression of expressions) {
      const label = expression?.Name || expression?.File || "unnamed";
      report.push(`- ${label}`);
      checkReferencedFile(name, modelPath, expression?.File, `expression file (${label})`);
    }
  }
  report.push("");

  const motions = listMotions(refs);
  let motionCount = 0;
  report.push("### Motions");
  for (const [group, groupMotions] of Object.entries(motions)) {
    if (!Array.isArray(groupMotions)) {
      addIssue(`${name}: motion group ${group} must be an array`);
      continue;
    }
    for (const motion of groupMotions) {
      const fileName = motion?.File || "";
      report.push(`- ${group} -> ${fileName.replace(/\.motion3\.json$/, "")}`);
      checkReferencedFile(name, modelPath, fileName, `motion file (${group})`);
      motionCount += 1;
    }
  }
  if (motionCount === 0) report.push("- (none)");
  report.push("");

  if (typeof refs.DisplayInfo === "string" && refs.DisplayInfo) {
    const displayInfoPath = join(dirname(modelPath), refs.DisplayInfo);
    if (existsSync(displayInfoPath)) {
      try {
        const displayInfo = JSON.parse(readFileSync(displayInfoPath, "utf8"));
        const parameters = Array.isArray(displayInfo?.Parameters) ? displayInfo.Parameters : [];
        report.push(`### Parameters (${parameters.length})`);
        for (const parameter of parameters) {
          if (parameter?.Name) report.push(`- ${parameter.Id || "?"} = ${parameter.Name}`);
        }
        report.push("");
      } catch {
        addIssue(`${name}: display info JSON could not be parsed (${relativeAssetPath(displayInfoPath)})`);
      }
    }
  }

  report.push("### Summary");
  report.push(`- Expression names: ${expressions.map((expression) => expression?.Name || "unnamed").join(", ")}`);
  report.push(`- Motion groups: ${Object.keys(motions).join(", ")}`);
  report.push(`- Motion count: ${motionCount}`, "");
}

report.push("## Asset README", `Path: ${relativeAssetPath(readmePath)}`, "");
if (existsSync(readmePath)) {
  report.push("- present", "");
} else {
  report.push("**MISSING**", "");
  addIssue(`asset README is missing (${relativeAssetPath(readmePath)})`);
}

for (const [name, modelPath] of Object.entries(models)) {
  inspectModel(name, modelPath);
}

console.log(report.join("\n"));
if (issues.length > 0) {
  console.error(`Live2D model check failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exitCode = 1;
} else {
  console.log("Live2D model check passed.");
}
