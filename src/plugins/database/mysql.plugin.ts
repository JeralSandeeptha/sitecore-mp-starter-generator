import type { IProjectPlugin } from "../../contracts/project-plugin.js";
import { PluginOrder } from "../../contracts/project-plugin.js";
import type { ScaffoldContext } from "../../services/scaffold-context.js";
import type { UserSelections } from "../../types/user-selections.js";

export class MysqlPlugin implements IProjectPlugin {
  readonly id = "database.mysql";
  readonly order = PluginOrder.Database;

  shouldApply(s: UserSelections): boolean {
    return s.database === "mysql";
  }

  async apply(ctx: ScaffoldContext): Promise<void> {
    ctx.addDependency("mysql2", "^3.12.0");
    await ctx.writeFile(
      ".env.example",
      `# MySQL
DATABASE_URL=mysql://user:password@localhost:3306/marketplace_app
`
    );
    await ctx.writeFile(
      "src/lib/db/mysql.ts",
      `import mysql from "mysql2/promise";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set");
}

export const pool = mysql.createPool(url);
`
    );
  }
}
