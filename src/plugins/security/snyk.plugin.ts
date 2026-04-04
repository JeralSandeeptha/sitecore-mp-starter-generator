import type { IProjectPlugin } from "../../contracts/project-plugin.js";
import { PluginOrder } from "../../contracts/project-plugin.js";
import type { ScaffoldContext } from "../../services/scaffold-context.js";
import type { UserSelections } from "../../types/user-selections.js";

export class SnykPlugin implements IProjectPlugin {
  readonly id = "security.snyk";
  readonly order = PluginOrder.SecurityTooling;

  shouldApply(s: UserSelections): boolean {
    return s.securityTest === "snyk";
  }

  async apply(ctx: ScaffoldContext): Promise<void> {
    ctx.addDevDependency("snyk", "^1.1295.0");
    ctx.mergeScript("security:snyk", "snyk test");
    await ctx.writeFile(
      ".snyk",
      `# Snyk (https://snyk.io) policy file; patches and ignores can be added here.
version: v1.25.0
ignore: {}
patch: {}
`
    );
  }
}
