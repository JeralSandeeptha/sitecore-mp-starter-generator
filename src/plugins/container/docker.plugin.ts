import type { IProjectPlugin } from "../../contracts/project-plugin.js";
import { PluginOrder } from "../../contracts/project-plugin.js";
import type { ScaffoldContext } from "../../services/scaffold-context.js";
import type { UserSelections } from "../../types/user-selections.js";

export class DockerPlugin implements IProjectPlugin {
  readonly id = "container.docker";
  readonly order = PluginOrder.Container;

  shouldApply(s: UserSelections): boolean {
    return s.docker;
  }

  async apply(ctx: ScaffoldContext): Promise<void> {
    await ctx.writeFile("public/.gitkeep", "");
    await ctx.writeFile(
      "Dockerfile",
      `# syntax=docker/dockerfile:1
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
`
    );

    await ctx.writeFile(
      ".dockerignore",
      `node_modules
.next
.git
.github
*.md
.env*
!.env.example
coverage
playwright-report
cypress/videos
cypress/screenshots
`
    );

    await patchNextConfigForStandalone(ctx);
  }
}

async function patchNextConfigForStandalone(ctx: ScaffoldContext): Promise<void> {
  const rel = "next.config.ts";
  if (!(await ctx.pathExists(rel))) return;
  let src = await ctx.readFile(rel);
  if (src.includes("standalone")) return;
  const replaced = src.replace(
    /(const nextConfig(?::\s*NextConfig)?\s*=\s*\{)/,
    "$1\n  output: \"standalone\","
  );
  await ctx.writeFile(rel, replaced);
}
