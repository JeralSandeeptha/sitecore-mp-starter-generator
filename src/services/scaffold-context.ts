import fs from "fs-extra";
import path from "path";
import type { UserSelections } from "../types/user-selections.js";

export type PackageJson = {
  name?: string;
  version?: string;
  private?: boolean;
  type?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
};

export interface ScaffoldContextOptions {
  projectRoot: string;
  projectName: string;
  selections: UserSelections;
}

/**
 * Mutable workspace for plugins: package.json, scripts, and file writes.
 */
export class ScaffoldContext {
  readonly projectRoot: string;
  readonly projectName: string;
  readonly selections: UserSelections;
  private pkg: PackageJson;

  constructor(options: ScaffoldContextOptions, initialPackageJson: PackageJson) {
    this.projectRoot = options.projectRoot;
    this.projectName = options.projectName;
    this.selections = options.selections;
    this.pkg = initialPackageJson;
  }

  getPackageJson(): PackageJson {
    return this.pkg;
  }

  addDependency(name: string, version: string): void {
    this.pkg.dependencies = this.pkg.dependencies ?? {};
    this.pkg.dependencies[name] = version;
  }

  addDevDependency(name: string, version: string): void {
    this.pkg.devDependencies = this.pkg.devDependencies ?? {};
    this.pkg.devDependencies[name] = version;
  }

  addScript(name: string, command: string): void {
    this.pkg.scripts = this.pkg.scripts ?? {};
    if (this.pkg.scripts[name] === undefined) {
      this.pkg.scripts[name] = command;
    }
  }

  mergeScript(name: string, command: string): void {
    this.pkg.scripts = this.pkg.scripts ?? {};
    this.pkg.scripts[name] = command;
  }

  async writePackageJson(): Promise<void> {
    this.pkg.name = this.projectName;
    const target = path.join(this.projectRoot, "package.json");
    await fs.writeJson(target, this.pkg, { spaces: 2 });
  }

  async writeFile(relativePath: string, content: string): Promise<void> {
    const full = path.join(this.projectRoot, relativePath);
    await fs.ensureDir(path.dirname(full));
    await fs.writeFile(full, content, "utf8");
  }

  async pathExists(relativePath: string): Promise<boolean> {
    return fs.pathExists(path.join(this.projectRoot, relativePath));
  }

  async readFile(relativePath: string): Promise<string> {
    return fs.readFile(path.join(this.projectRoot, relativePath), "utf8");
  }
}

export async function loadScaffoldContext(
  options: ScaffoldContextOptions
): Promise<ScaffoldContext> {
  const pkgPath = path.join(options.projectRoot, "package.json");
  const raw = await fs.readJson(pkgPath);
  return new ScaffoldContext(options, raw as PackageJson);
}
