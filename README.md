# mcp-backlog-server

Backlog MCP Server

This is a TypeScript-based MCP server that implements a Backlog integration. It demonstrates core MCP concepts by providing:

- Resources representing Backlog projects with URIs and metadata
- Tools for interacting with Backlog API
- Prompts for generating summaries and analyses of Backlog data

## Features

### Resources
- List and access Backlog projects via `backlog://project/[id]` URIs
- Each project resource includes project metadata and details
- JSON formatted resources for structured data access

### Tools
- `get_backlog_user` - Get current Backlog user information
- `get_backlog_space` - Get Backlog space information
- `list_recent_projects` - List recently viewed Backlog projects
  - Configure count and sort order

### Prompts
- `summarize_projects` - Generate a summary of recently viewed Backlog projects
- `analyze_backlog_usage` - Analyze Backlog usage patterns based on user, space, and project data

## Requirements

- Backlog account with API access
- Environment variables:
  - `BACKLOG_API_KEY`: Your Backlog API key
  - `BACKLOG_SPACE_URL`: Your Backlog space URL (e.g., `https://your-space.backlog.com`)

## Development

Install dependencies:
```bash
npm install
```

Build the server:
```bash
npm run build
```

For development with auto-rebuild:
```bash
npm run watch
```

## Installation

To use with Claude Desktop, add the server config:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mcp-backlog-server": {
      "command": "/path/to/mcp-backlog-server/build/index.js",
      "env": {
        "BACKLOG_API_KEY": "your-api-key",
        "BACKLOG_SPACE_URL": "https://your-space.backlog.com"
      }
    }
  }
}
```

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.