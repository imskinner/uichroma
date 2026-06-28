# @uichroma/mcp

An [MCP](https://modelcontextprotocol.io) server for **UI Chroma**. It lets a coding agent
(Claude Code, Cursor, Windsurf, …) generate an accessible brand theme from one sentence and pull
the **DTCG design tokens + `AGENTS.md` constraint pack** straight into the project it's building —
so the generated UI is _your_ brand instead of the generic default.

It's a thin transport over [`@uichroma/core`](../../packages/core): the same generation + scoring
+ critique engine the web app uses.

## Capabilities

| Kind | Name | Description |
|------|------|-------------|
| Tool | `generate_theme(vibe)` | Generate a theme from a vibe; returns the `AGENTS.md` pack + DTCG tokens. |
| Tool | `get_theme(permalink)` | Fetch a saved UI Chroma theme by permalink; returns the same. |
| Resource | `theme://{permalink}` | A saved theme's DTCG tokens (JSON) + `AGENTS.md` (markdown). |

## Configuration (env)

| Var | Required | Default | Purpose |
|-----|----------|---------|---------|
| `OPENAI_API_KEY` | for `generate_theme` | — | OpenAI key for generation (`API_KEY` / `OPENAI_KEY` also accepted). |
| `UICHROMA_API_BASE` | for `get_theme` / resource | `http://localhost:3000` | Base URL of the UI Chroma read API. |

## Build

```bash
npm --prefix apps/mcp install
npm --prefix apps/mcp run build      # -> apps/mcp/dist/index.js
```

(Requires Node ≥ 22.12 — the server is ESM and imports the shared core.)

## Install in your agent

Point your agent at the built entry. Use the **absolute** path to `apps/mcp/dist/index.js`.

### Claude Code

```bash
claude mcp add uichroma --env OPENAI_API_KEY=sk-... -- node /abs/path/to/uichroma/apps/mcp/dist/index.js
```

…or in a project `.mcp.json`:

```json
{
  "mcpServers": {
    "uichroma": {
      "command": "node",
      "args": ["/abs/path/to/uichroma/apps/mcp/dist/index.js"],
      "env": { "OPENAI_API_KEY": "sk-...", "UICHROMA_API_BASE": "https://your-uichroma.app" }
    }
  }
}
```

### Cursor — `.cursor/mcp.json`

```json
{
  "mcpServers": {
    "uichroma": {
      "command": "node",
      "args": ["/abs/path/to/uichroma/apps/mcp/dist/index.js"],
      "env": { "OPENAI_API_KEY": "sk-..." }
    }
  }
}
```

### Windsurf — `~/.codeium/windsurf/mcp_config.json`

Same `command` / `args` / `env` shape as above.

> Once published to npm, the `command`/`args` become `npx` + `["-y", "@uichroma/mcp"]` and no local
> build is needed.

## Usage

Ask your agent something like:

> Generate a theme for a calm zen meditation app and use it for this project.

The agent calls `generate_theme`, receives the constraint pack + tokens, and builds against them.
