import type { IProjectPlugin } from "../../contracts/project-plugin.js";
import { PluginOrder } from "../../contracts/project-plugin.js";
import type { ScaffoldContext } from "../../services/scaffold-context.js";
import type { UserSelections } from "../../types/user-selections.js";

export class SupertestPlugin implements IProjectPlugin {
  readonly id = "testing.supertest";
  readonly order = PluginOrder.Testing;

  shouldApply(s: UserSelections): boolean {
    return s.integration === "supertest";
  }

  async apply(ctx: ScaffoldContext): Promise<void> {
    ctx.addDevDependency("supertest", "^7.0.0");
    ctx.addDevDependency("@types/supertest", "^6.0.2");

    const useVitest = ctx.selections.unitTest === "vitest-rtl";
    const useJest = ctx.selections.unitTest === "jest-rtl";

    if (!useVitest && !useJest) {
      ctx.addDevDependency("vitest", "^3.0.9");
      ctx.mergeScript("test:integration", "vitest run --config vitest.integration.config.ts");
    } else if (useVitest) {
      ctx.mergeScript("test:integration", "vitest run tests/integration");
    } else {
      ctx.mergeScript("test:integration", "jest tests/integration");
    }

    await ctx.writeFile(
      "src/app/api/health/route.ts",
      `import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok" });
}
`
    );

    const vitestBody = `// @vitest-environment node
import request from "supertest";
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const app = next({ dev: true, dir: process.cwd() });
const handle = app.getRequestHandler();

describe("GET /api/health", () => {
  let server: ReturnType<typeof createServer>;

  beforeAll(async () => {
    await app.prepare();
    server = createServer((req, res) => {
      const parsed = parse(req.url ?? "", true);
      return handle(req, res, parsed);
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve()))
    );
  });

  it("returns ok", async () => {
    const addr = server.address();
    if (!addr || typeof addr === "string") throw new Error("no address");
    const base = \`http://127.0.0.1:\${addr.port}\`;
    const res = await request(base).get("/api/health").expect(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
`;

    const jestBody = `import request from "supertest";
import { createServer } from "http";
import { parse } from "url";
import next from "next";

const app = next({ dev: true, dir: process.cwd() });
const handle = app.getRequestHandler();

describe("GET /api/health", () => {
  let server: ReturnType<typeof createServer>;

  beforeAll(async () => {
    await app.prepare();
    server = createServer((req, res) => {
      const parsed = parse(req.url ?? "", true);
      return handle(req, res, parsed);
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve()))
    );
  });

  it("returns ok", async () => {
    const addr = server.address();
    if (!addr || typeof addr === "string") throw new Error("no address");
    const base = \`http://127.0.0.1:\${addr.port}\`;
    const res = await request(base).get("/api/health").expect(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
`;

    await ctx.writeFile(
      "tests/integration/health.int.test.ts",
      useJest ? jestBody : vitestBody
    );

    if (!useVitest && !useJest) {
      await ctx.writeFile(
        "vitest.integration.config.ts",
        `import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
  },
});
`
      );
    }
  }
}
