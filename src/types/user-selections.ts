export type DatabaseId = "none" | "mongodb" | "supabase" | "postgresql" | "mysql" | "sqlite";

export type UnitTestId = "none" | "vitest-rtl" | "jest-rtl";

export type E2EId = "none" | "playwright" | "cypress";

export type IntegrationId = "none" | "supertest";

export type SecurityTestId = "none" | "snyk";

export interface UserSelections {
  database: DatabaseId;
  unitTest: UnitTestId;
  e2e: E2EId;
  integration: IntegrationId;
  securityTest: SecurityTestId;
  githubActions: boolean;
  docker: boolean;
  prettier: boolean;
  eslint: boolean;
  commitlint: boolean;
  husky: boolean;
}

export const DEFAULT_SELECTIONS: UserSelections = {
  database: "none",
  unitTest: "vitest-rtl",
  e2e: "none",
  integration: "none",
  securityTest: "none",
  githubActions: true,
  docker: false,
  prettier: true,
  eslint: true,
  commitlint: true,
  husky: true,
};
