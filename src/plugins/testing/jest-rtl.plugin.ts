import type { IProjectPlugin } from "../../contracts/project-plugin.js";
import { PluginOrder } from "../../contracts/project-plugin.js";
import type { ScaffoldContext } from "../../services/scaffold-context.js";
import type { UserSelections } from "../../types/user-selections.js";

export class JestRtlPlugin implements IProjectPlugin {
  readonly id = "testing.jest-rtl";
  readonly order = PluginOrder.Testing;

  shouldApply(s: UserSelections): boolean {
    return s.unitTest === "jest-rtl";
  }

  async apply(ctx: ScaffoldContext): Promise<void> {
    ctx.addDevDependency("jest", "^29.7.0");
    ctx.addDevDependency("jest-environment-jsdom", "^29.7.0");
    ctx.addDevDependency("@types/jest", "^29.5.14");
    ctx.addDevDependency("@testing-library/react", "^16.2.0");
    ctx.addDevDependency("@testing-library/jest-dom", "^6.6.3");
    ctx.addDevDependency("@testing-library/user-event", "^14.6.1");
    ctx.mergeScript("test", "jest");
    ctx.mergeScript("test:watch", "jest --watch");

    await ctx.writeFile(
      "jest.config.mjs",
      `import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

/** @type {import("jest").Config} */
const config = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/e2e/"],
};

export default createJestConfig(config);
`
    );

    await ctx.writeFile(
      "jest.setup.ts",
      `import "@testing-library/jest-dom";
`
    );

    await ctx.writeFile(
      "src/utils/hooks/useMarketplaceClient.test.tsx",
      `import { render, screen } from "@testing-library/react";

describe("smoke", () => {
  it("runs tests", () => {
    render(<span>ok</span>);
    expect(screen.getByText("ok")).toBeInTheDocument();
  });
});
`
    );
  }
}
