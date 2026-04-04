import { Command } from "commander";
import { createRequire } from "node:module";
import { registerCreateCommand } from "./create-command.js";

const require = createRequire(import.meta.url);
const pkg = require("../../package.json") as { version: string; name: string };

export function createProgram(): Command {
  const program = new Command();
  program
    .name("scx")
    .description("Sitecore Marketplace app scaffolder (marketplace-starter + optional tooling)")
    .version(pkg.version, "-V, --version");

  registerCreateCommand(program);
  return program;
}
