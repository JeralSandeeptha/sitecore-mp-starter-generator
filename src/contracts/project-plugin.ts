import type { UserSelections } from "../types/user-selections.js";
import type { ScaffoldContext } from "../services/scaffold-context.js";

/**
 * Plugin order groups (lower runs first).
 */
export enum PluginOrder {
  Database = 10,
  Testing = 20,
  LintFormat = 30,
  Commitlint = 40,
  Husky = 41,
  SecurityTooling = 45,
  CICD = 50,
  Container = 60,
}

export interface IProjectPlugin {
  readonly id: string;
  readonly order: PluginOrder;
  shouldApply(selections: UserSelections): boolean;
  apply(ctx: ScaffoldContext): Promise<void>;
}
