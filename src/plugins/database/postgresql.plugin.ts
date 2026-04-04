import type { IProjectPlugin } from "../../contracts/project-plugin.js";
import { PluginOrder } from "../../contracts/project-plugin.js";
import type { ScaffoldContext } from "../../services/scaffold-context.js";
import type { UserSelections } from "../../types/user-selections.js";

export class PostgresqlPlugin implements IProjectPlugin {
  readonly id = "database.postgresql";
  readonly order = PluginOrder.Database;

  shouldApply(s: UserSelections): boolean {
    return s.database === "postgresql";
  }

  async apply(ctx: ScaffoldContext): Promise<void> {
    ctx.addDependency("pg", "^8.14.0");
    ctx.addDevDependency("@types/pg", "^8.11.11");
    await ctx.writeFile(
      ".env.example",
      `# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/marketplace_app
`
    );
    await ctx.writeFile(
      "src/lib/db/postgres.ts",
      `import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

export const pool = new Pool({ connectionString });
`
    );
  }
}
