import type { IProjectPlugin } from "../../contracts/project-plugin.js";
import { PluginOrder } from "../../contracts/project-plugin.js";
import type { ScaffoldContext } from "../../services/scaffold-context.js";
import type { UserSelections } from "../../types/user-selections.js";

export class CypressPlugin implements IProjectPlugin {
  readonly id = "testing.cypress";
  readonly order = PluginOrder.Testing;

  shouldApply(s: UserSelections): boolean {
    return s.e2e === "cypress";
  }

  async apply(ctx: ScaffoldContext): Promise<void> {
    ctx.addDevDependency("cypress", "^14.2.1");
    ctx.mergeScript("test:e2e", "cypress run");
    ctx.mergeScript("test:e2e:open", "cypress open");

    await ctx.writeFile(
      "cypress.config.ts",
      `import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents() {},
  },
});
`
    );

    await ctx.writeFile(
      "cypress/e2e/smoke.cy.ts",
      `describe("smoke", () => {
  it("loads home", () => {
    cy.visit("/");
  });
});
`
    );
  }
}
