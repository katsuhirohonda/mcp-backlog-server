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
        description: "Summarize recently viewed Backlog projects",
      },
      {
        name: "analyze_backlog_usage",
        description: "Analyze your Backlog usage patterns",
      },
      {
        name: "summarize_wiki_pages",
        description: "Summarize Wiki pages from a Backlog project",
      }
    ]
  };
}

/**
 * Handle prompt generation
 */
export async function getPrompt(client: BacklogClient, promptName: string) {
  try {
    switch (promptName) {
      case "summarize_projects": {
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
      }
      
      case "analyze_backlog_usage": {
        // Get user data and space data
        const userData = await client.getMyself();
        const spaceData = await client.getSpace();
        const recentProjects = await client.getRecentlyViewedProjects({ count: 20 });
        
        // User data as resource
        const userResource = {
          type: "resource" as const,
          resource: {
            uri: "backlog://user/myself",
            mimeType: "application/json",
            text: JSON.stringify(userData, null, 2)
          }
        };
        
        // Space data as resource
        const spaceResource = {
          type: "resource" as const,
          resource: {
            uri: "backlog://space",
            mimeType: "application/json",
            text: JSON.stringify(spaceData, null, 2)
          }
        };
        
        // Projects summary as resource
        const projectsResource = {
          type: "resource" as const,
          resource: {
            uri: "backlog://projects/summary",
            mimeType: "application/json",
            text: JSON.stringify({
              totalProjects: recentProjects.length,
              projectNames: recentProjects.map(p => p.project.name),
              lastUpdated: recentProjects.map(p => p.updated)
            }, null, 2)
          }
        };
        
        // Construct the prompt
        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: "I'd like to understand my Backlog usage patterns. Please analyze the following information about my Backlog account, space, and recent projects:"
              }
            },
            {
              role: "user",
              content: userResource
            },
            {
              role: "user",
              content: spaceResource
            },
            {
              role: "user",
              content: projectsResource
            },
            {
              role: "user",
              content: {
                type: "text",
                text: "Based on this data, please provide insights about how I'm using Backlog, which projects I'm focusing on recently, and any suggestions for improving my workflow."
              }
            }
          ]
        };
      }
      
      case "summarize_wiki_pages": {
        // Get recent projects to select one
        const recentProjects = await client.getRecentlyViewedProjects({ count: 5 });
        
        if (recentProjects.length === 0) {
          throw new Error("No recent projects found");
        }
        
        // Use the first project
        const firstProject = recentProjects[0].project;
        
        // Get wiki pages for the project
        const wikiPages = await client.getWikiPageList(firstProject.projectKey);
        
        // Limit to 10 wiki pages
        const limitedWikiPages = wikiPages.slice(0, 10);
        
        // Create embedded resources for each wiki page
        const embeddedWikiPages = await Promise.all(
          limitedWikiPages.map(async (wiki) => {
            // Get full wiki content
            const fullWiki = await client.getWikiPage(wiki.id.toString());
            
            return {
              type: "resource" as const,
              resource: {
                uri: `backlog://wiki/${wiki.id}`,
                mimeType: "application/json",
                text: JSON.stringify(fullWiki, null, 2)
              }
            };
          })
        );
        
        // Construct the prompt
        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Please review the following Wiki pages from the "${firstProject.name}" project:`
              }
            },
            ...embeddedWikiPages.map(wiki => ({
              role: "user" as const,
              content: wiki
            })),
            {
              role: "user",
              content: {
                type: "text",
                text: "Provide a concise summary of these Wiki pages, highlighting the key information and how they relate to each other."
              }
            }
          ]
        };
      }
      
      default:
        throw new Error(`Unknown prompt: ${promptName}`);
    }
  } catch (error) {
    console.error(`Error generating prompt ${promptName}:`, error);
    throw error;
  }
}
