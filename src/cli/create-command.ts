import path from "node:path";
import chalk from "chalk";
import type { Command } from "commander";
import { DEFAULT_SELECTIONS, type UserSelections } from "../types/user-selections.js";
import { ProjectScaffolder } from "../orchestrator/project-scaffolder.js";
import { promptForSelections } from "./prompts/create-prompts.js";

export interface ParsedCreateOptions {
  templateUrl?: string;
  skipInstall: boolean;
  defaults: boolean;
  cwd: string;
  flags: Partial<UserSelections>;
}

function pickDefined<T extends Record<string, unknown>>(obj: T): Partial<UserSelections> {
  const out: Partial<UserSelections> = {};
  const keys: (keyof UserSelections)[] = [
    "database",
    "unitTest",
    "e2e",
    "integration",
    "securityTest",
    "githubActions",
    "docker",
    "prettier",
    "eslint",
    "commitlint",
    "husky",
  ];
  for (const k of keys) {
    if (obj[k as string] !== undefined) {
      (out as Record<string, unknown>)[k] = obj[k as string];
    }
  }
  return out;
}

export function registerCreateCommand(program: Command): void {
  const cmd = program
    .command("create")
    .description("Scaffold a new app from the Sitecore marketplace-starter template")
    .argument("<name>", "Project directory name")
    .option("--template-url <url>", "Git URL of the template")
    .option("--skip-install", "Do not run npm install")
    .option("-y, --defaults", "Skip prompts; use defaults (overridable with flags below)")
    .option("--cwd <dir>", "Parent directory for the new project")
    .option("--database <id>", "none | mongodb | supabase | postgresql | mysql | sqlite")
    .option("--unit-test <id>", "none | vitest-rtl | jest-rtl")
    .option("--e2e <id>", "none | playwright | cypress")
    .option("--integration <id>", "none | supertest")
    .option("--security-test <id>", "none | snyk")
    .option("--github-actions", "Enable GitHub Actions")
    .option("--no-github-actions", "Disable GitHub Actions")
    .option("--docker", "Add Docker")
    .option("--no-docker", "Skip Docker")
    .option("--prettier", "Enable Prettier")
    .option("--no-prettier", "Disable Prettier")
    .option("--eslint", "Enable ESLint")
    .option("--no-eslint", "Disable ESLint")
    .option("--commitlint", "Enable Commitlint")
    .option("--no-commitlint", "Disable Commitlint")
    .option("--husky", "Enable Husky")
    .option("--no-husky", "Disable Husky");

  cmd.action(async (name: string) => {
    const raw = cmd.opts() as Record<string, unknown>;
    const cwd = (raw.cwd as string | undefined)
      ? path.resolve(raw.cwd as string)
      : process.cwd();
    const flags = pickDefined({
      database: raw.database,
      unitTest: raw.unitTest,
      e2e: raw.e2e,
      integration: raw.integration,
      securityTest: raw.securityTest,
      githubActions: raw.githubActions,
      docker: raw.docker,
      prettier: raw.prettier,
      eslint: raw.eslint,
      commitlint: raw.commitlint,
      husky: raw.husky,
    });

    const useDefaults = Boolean(raw.defaults);
    const base = { ...DEFAULT_SELECTIONS, ...flags };
    const selections: UserSelections = useDefaults
      ? base
      : { ...(await promptForSelections(base)), ...flags };

    const projectName = name.trim();
    if (!projectName) {
      console.error(chalk.red("Project name is required."));
      process.exitCode = 1;
      return;
    }

    const scaffolder = new ProjectScaffolder();
    try {
      await scaffolder.scaffold({
        projectName,
        cwd,
        templateUrl: raw.templateUrl as string | undefined,
        skipInstall: Boolean(raw.skipInstall),
        selections,
      });
    } catch (err) {
      console.error(chalk.red(err instanceof Error ? err.message : String(err)));
      process.exitCode = 1;
    }
  });
}
