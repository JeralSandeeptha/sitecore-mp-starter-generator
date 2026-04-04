import inquirer from "inquirer";
import {
  DEFAULT_SELECTIONS,
  type DatabaseId,
  type E2EId,
  type IntegrationId,
  type SecurityTestId,
  type UnitTestId,
  type UserSelections,
} from "../../types/user-selections.js";

export async function promptForSelections(
  initial?: Partial<UserSelections>
): Promise<UserSelections> {
  const base: UserSelections = { ...DEFAULT_SELECTIONS, ...initial };

  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "database",
      message: "Database",
      default: base.database,
      choices: [
        { name: "None", value: "none" },
        { name: "MongoDB", value: "mongodb" },
        { name: "Supabase", value: "supabase" },
        { name: "PostgreSQL", value: "postgresql" },
        { name: "MySQL", value: "mysql" },
        { name: "SQLite", value: "sqlite" },
      ],
    },
    {
      type: "list",
      name: "unitTest",
      message: "Unit tests",
      default: base.unitTest,
      choices: [
        { name: "None", value: "none" },
        { name: "Vitest + React Testing Library", value: "vitest-rtl" },
        { name: "Jest + React Testing Library", value: "jest-rtl" },
      ],
    },
    {
      type: "list",
      name: "e2e",
      message: "End-to-end tests",
      default: base.e2e,
      choices: [
        { name: "None", value: "none" },
        { name: "Playwright", value: "playwright" },
        { name: "Cypress", value: "cypress" },
      ],
    },
    {
      type: "list",
      name: "integration",
      message: "Integration tests (HTTP)",
      default: base.integration,
      choices: [
        { name: "None", value: "none" },
        { name: "Supertest", value: "supertest" },
      ],
    },
    {
      type: "list",
      name: "securityTest",
      message: "Security scanning (Snyk)",
      default: base.securityTest,
      choices: [
        { name: "None", value: "none" },
        { name: "Snyk (CLI + optional workflow)", value: "snyk" },
      ],
    },
    {
      type: "confirm",
      name: "githubActions",
      message: "Add GitHub Actions (CI + security workflow when Snyk is on)?",
      default: base.githubActions,
    },
    {
      type: "confirm",
      name: "docker",
      message: "Add Docker (Dockerfile + .dockerignore, Next standalone)?",
      default: base.docker,
    },
    {
      type: "confirm",
      name: "prettier",
      message: "Prettier",
      default: base.prettier,
    },
    {
      type: "confirm",
      name: "eslint",
      message: "ESLint (Next flat config; merges with Prettier when both)",
      default: base.eslint,
    },
    {
      type: "confirm",
      name: "commitlint",
      message: "Commitlint (conventional commits)",
      default: base.commitlint,
    },
    {
      type: "confirm",
      name: "husky",
      message: "Husky (Git hooks; wires commit-msg → commitlint when enabled)",
      default: base.husky,
    },
  ]);

  return {
    database: answers.database as DatabaseId,
    unitTest: answers.unitTest as UnitTestId,
    e2e: answers.e2e as E2EId,
    integration: answers.integration as IntegrationId,
    securityTest: answers.securityTest as SecurityTestId,
    githubActions: answers.githubActions as boolean,
    docker: answers.docker as boolean,
    prettier: answers.prettier as boolean,
    eslint: answers.eslint as boolean,
    commitlint: answers.commitlint as boolean,
    husky: answers.husky as boolean,
  };
}
