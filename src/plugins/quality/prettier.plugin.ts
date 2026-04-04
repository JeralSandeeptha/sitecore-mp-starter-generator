import type { IProjectPlugin } from "../../contracts/project-plugin.js";
import { PluginOrder } from "../../contracts/project-plugin.js";
import type { ScaffoldContext } from "../../services/scaffold-context.js";
import type { UserSelections } from "../../types/user-selections.js";

export class PrettierPlugin implements IProjectPlugin {
  readonly id = "quality.prettier";
  readonly order = PluginOrder.LintFormat;

  shouldApply(s: UserSelections): boolean {
    return s.prettier;
  }

  async apply(ctx: ScaffoldContext): Promise<void> {
    ctx.addDevDependency("prettier", "^3.5.3");
    ctx.mergeScript("format", "prettier --write .");
    ctx.mergeScript("format:check", "prettier --check .");

    await ctx.writeFile(
      ".prettierrc",
      JSON.stringify(
        {
          semi: true,
          singleQuote: false,
          trailingComma: "es5",
          printWidth: 100,
        },
        null,
        2
      )
    );

    await ctx.writeFile(
      ".prettierignore",
      `.next
node_modules
out
build
coverage
playwright-report
`
    );
  }
}
