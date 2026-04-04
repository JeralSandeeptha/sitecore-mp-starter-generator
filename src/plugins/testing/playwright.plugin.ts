import type { IProjectPlugin } from "../../contracts/project-plugin.js";
import { PluginOrder } from "../../contracts/project-plugin.js";
import type { ScaffoldContext } from "../../services/scaffold-context.js";
import type { UserSelections } from "../../types/user-selections.js";

export class PlaywrightPlugin implements IProjectPlugin {
  readonly id = "testing.playwright";
  readonly order = PluginOrder.Testing;

  shouldApply(s: UserSelections): boolean {
    return s.e2e === "playwright";
  }

  async apply(ctx: ScaffoldContext): Promise<void> {
    ctx.addDevDependency("@playwright/test", "^1.51.0");
    ctx.mergeScript("test:e2e", "playwright test");
    ctx.mergeScript("test:e2e:ui", "playwright test --ui");

    await ctx.writeFile(
      "playwright.config.ts",
      `import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
  },
});
`
    );

    await ctx.writeFile(
      "e2e/smoke.spec.ts",
      `import { test, expect } from "@playwright/test";

test("home loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/./);
});
`
    );
  }
}
