import type { IProjectPlugin } from "../../contracts/project-plugin.js";
import { PluginOrder } from "../../contracts/project-plugin.js";
import type { ScaffoldContext } from "../../services/scaffold-context.js";
import type { UserSelections } from "../../types/user-selections.js";

export class HuskyPlugin implements IProjectPlugin {
  readonly id = "quality.husky";
  readonly order = PluginOrder.Husky;

  shouldApply(s: UserSelections): boolean {
    return s.husky;
  }

  async apply(ctx: ScaffoldContext): Promise<void> {
    ctx.addDevDependency("husky", "^9.1.7");
    ctx.mergeScript("prepare", "husky");

    const useCommitlint = ctx.selections.commitlint;
    const commitMsg = useCommitlint
      ? `npx --no -- commitlint --edit $1
`
      : `# git hook placeholder
`;

    await ctx.writeFile(".husky/commit-msg", `#!/usr/bin/env sh
${commitMsg}`);
    await ctx.writeFile(
      ".husky/pre-commit",
      `#!/usr/bin/env sh
# Optional: npm run lint
`
    );
  }
}
