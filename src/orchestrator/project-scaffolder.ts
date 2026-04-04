import path from "node:path";
import chalk from "chalk";
import { execa } from "execa";
import type { UserSelections } from "../types/user-selections.js";
import { TemplateCloner } from "../services/template-cloner.js";
import { loadScaffoldContext } from "../services/scaffold-context.js";
import { PluginRegistry } from "../registry/plugin-registry.js";

export interface ScaffoldProjectInput {
  projectName: string;
  cwd: string;
  templateUrl?: string;
  selections: UserSelections;
  skipInstall?: boolean;
  registry?: PluginRegistry;
}

export class ProjectScaffolder {
  private readonly cloner = new TemplateCloner();
  private readonly defaultRegistry: PluginRegistry;

  constructor(registry?: PluginRegistry) {
    this.defaultRegistry = registry ?? new PluginRegistry();
  }

  async scaffold(input: ScaffoldProjectInput): Promise<string> {
    const targetDir = path.resolve(input.cwd, input.projectName);
    console.log(chalk.cyan(`Cloning template into ${targetDir}…`));
    await this.cloner.clone({
      targetDir,
      templateUrl: input.templateUrl,
      detachGit: true,
    });

    await execa("git", ["init"], { cwd: targetDir, stdio: "pipe" });

    const ctx = await loadScaffoldContext({
      projectRoot: targetDir,
      projectName: toPackageName(input.projectName),
      selections: input.selections,
    });

    const registry = input.registry ?? this.defaultRegistry;
    const plugins = registry.resolve(input.selections);
    console.log(chalk.cyan(`Applying ${plugins.length} feature modules…`));
    for (const p of plugins) {
      await p.apply(ctx);
    }

    await ctx.writePackageJson();

    if (!input.skipInstall) {
      console.log(chalk.cyan("Installing dependencies (npm install)…"));
      await execa("npm", ["install"], { cwd: targetDir, stdio: "inherit" });
    } else {
      console.log(chalk.yellow("Skipped npm install (--skip-install)."));
    }

    console.log(chalk.green(`\nDone. Next: cd ${input.projectName} && npm run dev`));
    return targetDir;
  }
}

function toPackageName(dirName: string): string {
  const base = path.basename(dirName);
  const cleaned = base
    .toLowerCase()
    .replace(/[^a-z0-9-._]/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || "marketplace-app";
}
