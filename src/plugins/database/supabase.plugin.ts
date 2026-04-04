import type { IProjectPlugin } from "../../contracts/project-plugin.js";
import { PluginOrder } from "../../contracts/project-plugin.js";
import type { ScaffoldContext } from "../../services/scaffold-context.js";
import type { UserSelections } from "../../types/user-selections.js";

export class SupabasePlugin implements IProjectPlugin {
  readonly id = "database.supabase";
  readonly order = PluginOrder.Database;

  shouldApply(s: UserSelections): boolean {
    return s.database === "supabase";
  }

  async apply(ctx: ScaffoldContext): Promise<void> {
    ctx.addDependency("@supabase/supabase-js", "^2.49.1");
    await ctx.writeFile(
      ".env.example",
      `# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
`
    );
    await ctx.writeFile(
      "src/lib/db/supabase.ts",
      `import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error("Supabase URL and anon key must be set");
}

export const supabase = createClient(url, key);
`
    );
  }
}
