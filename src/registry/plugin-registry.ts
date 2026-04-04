import type { IProjectPlugin } from "../contracts/project-plugin.js";
import type { UserSelections } from "../types/user-selections.js";
import { MongodbPlugin } from "../plugins/database/mongodb.plugin.js";
import { SupabasePlugin } from "../plugins/database/supabase.plugin.js";
import { PostgresqlPlugin } from "../plugins/database/postgresql.plugin.js";
import { MysqlPlugin } from "../plugins/database/mysql.plugin.js";
import { SqlitePlugin } from "../plugins/database/sqlite.plugin.js";
import { VitestRtlPlugin } from "../plugins/testing/vitest-rtl.plugin.js";
import { JestRtlPlugin } from "../plugins/testing/jest-rtl.plugin.js";
import { PlaywrightPlugin } from "../plugins/testing/playwright.plugin.js";
import { CypressPlugin } from "../plugins/testing/cypress.plugin.js";
import { SupertestPlugin } from "../plugins/testing/supertest.plugin.js";
import { PrettierPlugin } from "../plugins/quality/prettier.plugin.js";
import { EslintPlugin } from "../plugins/quality/eslint.plugin.js";
import { CommitlintPlugin } from "../plugins/quality/commitlint.plugin.js";
import { HuskyPlugin } from "../plugins/quality/husky.plugin.js";
import { SnykPlugin } from "../plugins/security/snyk.plugin.js";
import { GithubActionsPlugin } from "../plugins/cicd/github-actions.plugin.js";
import { DockerPlugin } from "../plugins/container/docker.plugin.js";

/**
 * Open for extension: register additional plugins without editing the scaffolder.
 */
export class PluginRegistry {
  private readonly plugins: IProjectPlugin[];

  constructor(plugins?: IProjectPlugin[]) {
    this.plugins = plugins ?? PluginRegistry.defaultPlugins();
  }

  static defaultPlugins(): IProjectPlugin[] {
    return [
      new MongodbPlugin(),
      new SupabasePlugin(),
      new PostgresqlPlugin(),
      new MysqlPlugin(),
      new SqlitePlugin(),
      new VitestRtlPlugin(),
      new JestRtlPlugin(),
      new PlaywrightPlugin(),
      new CypressPlugin(),
      new SupertestPlugin(),
      new PrettierPlugin(),
      new EslintPlugin(),
      new CommitlintPlugin(),
      new HuskyPlugin(),
      new SnykPlugin(),
      new GithubActionsPlugin(),
      new DockerPlugin(),
    ];
  }

  resolve(selections: UserSelections): IProjectPlugin[] {
    return this.plugins
      .filter((p) => p.shouldApply(selections))
      .sort((a, b) => a.order - b.order);
  }
}
