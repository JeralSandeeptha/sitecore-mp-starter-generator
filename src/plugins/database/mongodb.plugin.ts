import type { IProjectPlugin } from "../../contracts/project-plugin.js";
import { PluginOrder } from "../../contracts/project-plugin.js";
import type { ScaffoldContext } from "../../services/scaffold-context.js";
import type { UserSelections } from "../../types/user-selections.js";

export class MongodbPlugin implements IProjectPlugin {
  readonly id = "database.mongodb";
  readonly order = PluginOrder.Database;

  shouldApply(s: UserSelections): boolean {
    return s.database === "mongodb";
  }

  async apply(ctx: ScaffoldContext): Promise<void> {
    ctx.addDependency("mongodb", "^6.12.0");
    await ctx.writeFile(
      ".env.example",
      `# MongoDB
MONGODB_URI=mongodb://localhost:27017/marketplace-app
`
    );
    await ctx.writeFile(
      "src/lib/db/mongodb.ts",
      `import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is not set");
}

let client: MongoClient | null = null;

export async function getDb(): Promise<Db> {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client.db();
}
`
    );
  }
}
