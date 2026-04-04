import type { IProjectPlugin } from "../../contracts/project-plugin.js";
import { PluginOrder } from "../../contracts/project-plugin.js";
import type { ScaffoldContext } from "../../services/scaffold-context.js";
import type { UserSelections } from "../../types/user-selections.js";

export class EslintPlugin implements IProjectPlugin {
  readonly id = "quality.eslint";
  readonly order = PluginOrder.LintFormat;

  shouldApply(s: UserSelections): boolean {
    return s.eslint;
  }

  async apply(ctx: ScaffoldContext): Promise<void> {
    ctx.addDevDependency("eslint", "^9.21.0");
    ctx.addDevDependency("@eslint/eslintrc", "^3.2.0");
    ctx.addDevDependency("eslint-config-next", "^15.4.6");
    ctx.mergeScript("lint", "eslint .");
    ctx.mergeScript("lint:fix", "eslint . --fix");

    if (ctx.selections.prettier) {
      ctx.addDevDependency("eslint-config-prettier", "^10.0.1");
      await ctx.writeFile(
        "eslint.config.mjs",
        `import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import eslintConfigPrettier from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  eslintConfigPrettier,
];

export default eslintConfig;
`
      );
    }
  }
}
