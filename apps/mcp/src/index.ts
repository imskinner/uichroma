#!/usr/bin/env node
// UI Chroma MCP server. A thin transport over @uichroma/core: it lets a coding agent
// (Claude Code, Cursor, Windsurf, …) generate a brand theme from one sentence and pull the
// DTCG tokens + AGENTS.md constraint pack straight into the project it's building.
//
// Tools:
//   - generate_theme(vibe)      run the generation pipeline, return tokens + constraint pack
//   - get_theme(permalink)      fetch a saved theme by permalink, return tokens + constraint pack
// Resource:
//   - theme://{permalink}       the saved theme's DTCG tokens + AGENTS.md
//
// Config (env): OPENAI_API_KEY (required for generate_theme); UICHROMA_API_BASE (read API base
// for get_theme / the resource, default http://localhost:3000).

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  runPalettePipeline,
  buildTheme,
  toDTCG,
  generateAgentsMd,
  type Palette,
  type Style,
} from "@uichroma/core";

const OPENAI_KEY =
  process.env.OPENAI_API_KEY || process.env.API_KEY || process.env.OPENAI_KEY || "";
const API_BASE = (process.env.UICHROMA_API_BASE || "http://localhost:3000").replace(
  /\/+$/,
  "",
);

interface FetchedTheme {
  colors: Palette;
  keywords?: string;
  style?: Style | null;
}

/** Fetch a saved palette from the UI Chroma read API. Returns null if missing/unreachable. */
async function fetchTheme(permalink: string): Promise<FetchedTheme | null> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/palette/${encodeURIComponent(permalink)}/data`);
  } catch {
    return null;
  }
  if (!res.ok) return null;
  const data = (await res.json()) as { colors?: Palette; keywords?: string; style?: Style | null };
  if (!data?.colors) return null;
  return { colors: data.colors, keywords: data.keywords, style: data.style };
}

/** Render a theme as the two text blocks a coding agent wants: the rules, then the tokens. */
function themeContent(colors: Palette, style?: Style | null, vibe?: string, permalink?: string) {
  const theme = buildTheme(colors, style ?? undefined);
  const agents = generateAgentsMd({
    colors,
    vibe,
    permalink,
    modes: theme.modes,
    wcag: theme.wcag,
    tokens: theme.tokens,
  });
  const dtcg = toDTCG(colors, { modes: theme.modes, tokens: theme.tokens });
  return [
    { type: "text" as const, text: agents },
    {
      type: "text" as const,
      text: "DTCG tokens — save as `tokens.dtcg.json`:\n\n```json\n" + dtcg + "\n```",
    },
  ];
}

const server = new McpServer({ name: "uichroma", version: "1.0.0" });

server.registerTool(
  "generate_theme",
  {
    title: "Generate a brand theme",
    description:
      "Generate a complete, accessible UI color theme from a one-sentence brand or vibe description. Returns an AGENTS.md constraint pack plus W3C DTCG design tokens to drop into a project so codegen produces THIS brand's UI instead of the generic default.",
    inputSchema: {
      vibe: z
        .string()
        .min(1)
        .describe(
          "Short description of the brand, product, mood, or aesthetic — e.g. 'calm zen meditation app' or 'high-energy esports brand'.",
        ),
    },
  },
  async ({ vibe }) => {
    if (!OPENAI_KEY) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: "No OpenAI API key configured. Set OPENAI_API_KEY in the MCP server environment to use generate_theme.",
          },
        ],
      };
    }
    try {
      const { colors, style } = await runPalettePipeline(vibe, OPENAI_KEY);
      return { content: themeContent(colors, style, vibe) };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: "text", text: `Theme generation failed: ${(err as Error).message}` }],
      };
    }
  },
);

server.registerTool(
  "get_theme",
  {
    title: "Fetch a saved theme",
    description:
      "Fetch a previously generated UI Chroma theme by its permalink and return its AGENTS.md constraint pack + W3C DTCG design tokens.",
    inputSchema: {
      permalink: z
        .string()
        .min(1)
        .describe("The UI Chroma palette permalink (the id in /palette/<permalink>)."),
    },
  },
  async ({ permalink }) => {
    const theme = await fetchTheme(permalink);
    if (!theme) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `No theme found for permalink '${permalink}' at ${API_BASE}. Check the permalink and UICHROMA_API_BASE.`,
          },
        ],
      };
    }
    return { content: themeContent(theme.colors, theme.style, theme.keywords, permalink) };
  },
);

server.registerResource(
  "theme",
  new ResourceTemplate("theme://{permalink}", { list: undefined }),
  {
    title: "UI Chroma theme",
    description: "DTCG design tokens + AGENTS.md constraint pack for a saved UI Chroma theme.",
    mimeType: "application/json",
  },
  async (uri, variables) => {
    const raw = variables.permalink;
    const permalink = Array.isArray(raw) ? raw[0] : raw;
    const theme = await fetchTheme(permalink);
    if (!theme) {
      return {
        contents: [
          { uri: uri.href, mimeType: "text/plain", text: `No theme found for '${permalink}'.` },
        ],
      };
    }
    const built = buildTheme(theme.colors, theme.style ?? undefined);
    return {
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: toDTCG(theme.colors, { modes: built.modes, tokens: built.tokens }),
        },
        {
          uri: `${uri.href}#agents`,
          mimeType: "text/markdown",
          text: generateAgentsMd({
            colors: theme.colors,
            vibe: theme.keywords,
            permalink,
            modes: built.modes,
            wcag: built.wcag,
            tokens: built.tokens,
          }),
        },
      ],
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Logs MUST go to stderr — stdout is the JSON-RPC channel.
  console.error(`UI Chroma MCP server running on stdio (read API: ${API_BASE})`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
