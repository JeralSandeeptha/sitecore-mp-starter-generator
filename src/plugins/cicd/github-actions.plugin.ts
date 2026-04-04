import type { IProjectPlugin } from "../../contracts/project-plugin.js";
import { PluginOrder } from "../../contracts/project-plugin.js";
import type { ScaffoldContext } from "../../services/scaffold-context.js";
import type { UserSelections } from "../../types/user-selections.js";

export class GithubActionsPlugin implements IProjectPlugin {
  readonly id = "cicd.github-actions";
  readonly order = PluginOrder.CICD;

  shouldApply(s: UserSelections): boolean {
    return s.githubActions;
  }

  async apply(ctx: ScaffoldContext): Promise<void> {
    const s = ctx.selections;
    const ci = buildCiWorkflow(s);
    await ctx.writeFile(".github/workflows/ci.yml", ci);

    if (s.securityTest === "snyk") {
      await ctx.writeFile(".github/workflows/security.yml", buildSecurityWorkflow());
    }
  }
}

function buildCiWorkflow(s: UserSelections): string {
  const lintStep = s.eslint
    ? `      - name: Lint
        run: npm run lint
`
    : "";
  const formatStep = s.prettier
    ? `      - name: Format check
        run: npm run format:check
`
    : "";
  const testStep =
    s.unitTest !== "none"
      ? `      - name: Unit tests
        run: npm run test --if-present
`
      : "";
  const integrationStep =
    s.integration === "supertest"
      ? `      - name: Integration tests
        run: npm run test:integration --if-present
`
      : "";
  const e2ePlaywright =
    s.e2e === "playwright"
      ? `      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: E2E tests
        run: npm run test:e2e --if-present
`
      : "";
  const e2eCypress =
    s.e2e === "cypress"
      ? `      - name: E2E (Cypress)
        run: npm run test:e2e --if-present
`
      : "";

  return `name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: npm
      - name: Install
        run: npm ci
${lintStep}${formatStep}${testStep}${integrationStep}      - name: Build
        run: npm run build
${e2ePlaywright}${e2eCypress}`;
}

function buildSecurityWorkflow(): string {
  return `name: Security

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: "0 6 * * 1"

jobs:
  snyk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: npm
      - name: Install
        run: npm ci
      - name: Snyk test
        env:
          SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}
        run: npx snyk test
`;
}
