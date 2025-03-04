#!/usr/bin/env node

/**
 * Backlog MCP server
 * 
 * This server implements a Backlog integration with Model Context Protocol.
 * It provides resources for viewing recent projects and tools for interactions.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { loadConfig } from './config.js';
import { BacklogClient } from './backlog-client.js';
import { listRecentProjects, readProject } from './handlers/resource-handlers.js';
import { listTools, executeTools } from './handlers/tool-handlers.js';
import { listPrompts, getPrompt } from './handlers/prompt-handlers.js';

/**
 * Create an MCP server with capabilities for resources, tools, and prompts.
 */
const server = new Server(
  {
    name: "mcp-backlog-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);

/**
 * Initialize the Backlog client
 */
const config = loadConfig();
const backlogClient = new BacklogClient(config);

/**
 * Handler for listing available Backlog resources (recently viewed projects)
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return await listRecentProjects(backlogClient);
});

/**
 * Handler for reading the contents of a specific Backlog resource
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  return await readProject(backlogClient, request.params.uri);
});

/**
 * Handler that lists available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return listTools();
});

/**
 * Handler for executing tools
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  return await executeTools(
    backlogClient, 
    request.params.name, 
    request.params.arguments
  );
});

/**
 * Handler that lists available prompts
 */
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return listPrompts();
});

/**
 * Handler for generating prompts
 */
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  return await getPrompt(backlogClient, request.params.name);
});

/**
 * Start the server using stdio transport
 */
async function main() {
  try {
    console.error("Starting Backlog MCP server...");
    const transport = new StdioServerTransport();
    await server.connect(transport);
  } catch (error) {
    console.error("Server initialization error:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
