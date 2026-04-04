import type { IProjectPlugin } from "../../contracts/project-plugin.js";
import { PluginOrder } from "../../contracts/project-plugin.js";
import type { ScaffoldContext } from "../../services/scaffold-context.js";
import type { UserSelections } from "../../types/user-selections.js";

export class VitestRtlPlugin implements IProjectPlugin {
  readonly id = "testing.vitest-rtl";
  readonly order = PluginOrder.Testing;

  shouldApply(s: UserSelections): boolean {
    return s.unitTest === "vitest-rtl";
  }

  async apply(ctx: ScaffoldContext): Promise<void> {
    ctx.addDevDependency("vitest", "^3.0.9");
    ctx.addDevDependency("@vitejs/plugin-react", "^4.3.4");
    ctx.addDevDependency("jsdom", "^26.0.0");
    ctx.addDevDependency("@testing-library/react", "^16.2.0");
    ctx.addDevDependency("@testing-library/dom", "^10.4.0");
    ctx.addDevDependency("@testing-library/jest-dom", "^6.6.3");
    ctx.addDevDependency("@testing-library/user-event", "^14.6.1");
    ctx.mergeScript("test", "vitest run");
    ctx.mergeScript("test:watch", "vitest");

    await ctx.writeFile(
      "vitest.config.ts",
      `import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/e2e/**", "**/.next/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
    },
  },
});
`
    );

    await ctx.writeFile(
      "vitest.setup.ts",
      `import "@testing-library/jest-dom/vitest";
`
    );

    await ctx.writeFile(
      "src/utils/hooks/useMarketplaceClient.test.tsx",
      `import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

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
