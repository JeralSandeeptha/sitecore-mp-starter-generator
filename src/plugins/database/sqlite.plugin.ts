import type { IProjectPlugin } from "../../contracts/project-plugin.js";
import { PluginOrder } from "../../contracts/project-plugin.js";
import type { ScaffoldContext } from "../../services/scaffold-context.js";
import type { UserSelections } from "../../types/user-selections.js";

export class SqlitePlugin implements IProjectPlugin {
  readonly id = "database.sqlite";
  readonly order = PluginOrder.Database;

  shouldApply(s: UserSelections): boolean {
    return s.database === "sqlite";
  }

  async apply(ctx: ScaffoldContext): Promise<void> {
    ctx.addDependency("better-sqlite3", "^11.8.1");
    ctx.addDevDependency("@types/better-sqlite3", "^7.6.12");
    await ctx.writeFile(
      ".env.example",
      `# SQLite (path to file)
SQLITE_PATH=./data/app.db
`
    );
    await ctx.writeFile(
      "src/lib/db/sqlite.ts",
      `import Database from "better-sqlite3";
import path from "path";

const file = process.env.SQLITE_PATH ?? path.join(process.cwd(), "data", "app.db");

export const sqlite = new Database(file);
`
    );
  }
}
