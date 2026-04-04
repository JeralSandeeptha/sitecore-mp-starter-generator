import type { IProjectPlugin } from "../../contracts/project-plugin.js";
import { PluginOrder } from "../../contracts/project-plugin.js";
import type { ScaffoldContext } from "../../services/scaffold-context.js";
import type { UserSelections } from "../../types/user-selections.js";

export class CommitlintPlugin implements IProjectPlugin {
  readonly id = "quality.commitlint";
  readonly order = PluginOrder.Commitlint;

  shouldApply(s: UserSelections): boolean {
    return s.commitlint;
  }

  async apply(ctx: ScaffoldContext): Promise<void> {
    ctx.addDevDependency("@commitlint/cli", "^19.7.1");
    ctx.addDevDependency("@commitlint/config-conventional", "^19.7.1");
    ctx.mergeScript("commitlint", "commitlint --edit");

    await ctx.writeFile(
      "commitlint.config.cjs",
      `module.exports = { extends: ["@commitlint/config-conventional"] };
`
    );
  }
}
