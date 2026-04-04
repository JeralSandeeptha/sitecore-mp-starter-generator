import fs from "fs-extra";
import path from "path";
import { execa } from "execa";

const DEFAULT_TEMPLATE_REPO = "https://github.com/Sitecore/marketplace-starter.git";

export interface CloneTemplateOptions {
  targetDir: string;
  templateUrl?: string;
  /** Remove `.git` after clone so the folder is a clean project. */
  detachGit?: boolean;
}

export class TemplateCloner {
  async clone(options: CloneTemplateOptions): Promise<void> {
    const url = options.templateUrl ?? DEFAULT_TEMPLATE_REPO;
    await fs.ensureDir(path.dirname(options.targetDir));
    if (await fs.pathExists(options.targetDir)) {
      const files = await fs.readdir(options.targetDir);
      if (files.length > 0) {
        throw new Error(`Target directory is not empty: ${options.targetDir}`);
      }
    }

    await execa("git", ["clone", "--depth", "1", url, options.targetDir], {
      stdio: "inherit",
    });

    if (options.detachGit !== false) {
      const gitDir = path.join(options.targetDir, ".git");
      await fs.remove(gitDir);
    }
  }
}
