/**
 * Prompt handlers for the Backlog MCP server
 */

import { BacklogClient } from '../backlog-client.js';

/**
 * List the available prompts
 */
export function listPrompts() {
  return {
    prompts: [
      {
        name: "summarize_projects",
        description: "Summarize recently viewed projects",
      }
    ]
  };
}

/**
 * Handle prompt generation
 */
export async function getPrompt(client: BacklogClient, promptName: string) {
  if (promptName !== "summarize_projects") {
    throw new Error("Unknown prompt");
  }
  
  try {
    // Get recent projects
    const recentProjects = await client.getRecentlyViewedProjects({ count: 10 });
    
    // Create embedded resources for each project
    const embeddedProjects = recentProjects.map(item => ({
      type: "resource" as const,
      resource: {
        uri: `backlog://project/${item.project.id}`,
        mimeType: "application/json",
        text: JSON.stringify(item.project, null, 2)
      }
    }));
    
    // Construct the prompt
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: "Please review the following recent Backlog projects:"
          }
        },
        ...embeddedProjects.map(project => ({
          role: "user" as const,
          content: project
        })),
        {
          role: "user",
          content: {
            type: "text",
            text: "Provide a concise summary of these recent projects, highlighting any patterns or important activities."
          }
        }
      ]
    };
  } catch (error) {
    console.error('Error generating prompt:', error);
    throw error;
  }
}
