/**
 * Tool handlers for the Backlog MCP server
 */

import { BacklogClient } from '../backlog-client.js';

/**
 * List the available tools for Backlog operations
 */
export function listTools() {
  return {
    tools: [
      {
        name: "create_note",
        description: "Create a new note",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Title of the note"
            },
            content: {
              type: "string",
              description: "Text content of the note"
            }
          },
          required: ["title", "content"]
        }
      }
    ]
  };
}

/**
 * Handle tool execution
 */
export async function executeTools(client: BacklogClient, toolName: string, args: any) {
  switch (toolName) {
    case "create_note": {
      const title = String(args?.title);
      const content = String(args?.content);
      
      if (!title || !content) {
        throw new Error("Title and content are required");
      }
      
      // Here we would actually interact with the Backlog API
      // For now, we're just mocking the behavior
      
      return {
        content: [{
          type: "text",
          text: `Created note: ${title}`
        }]
      };
    }
    
    default:
      throw new Error("Unknown tool");
  }
}
