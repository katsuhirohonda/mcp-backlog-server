/**
 * Resource handlers for the Backlog MCP server
 */

import { BacklogClient } from '../backlog-client.js';
import { RecentlyViewedProject } from '../types.js';

/**
 * Handler for listing recent projects
 */
export async function listRecentProjects(client: BacklogClient) {
  try {
    const projects = await client.getRecentlyViewedProjects({ count: 20 });
    
    return {
      resources: projects.map(item => ({
        uri: `backlog://project/${item.project.id}`,
        mimeType: "application/json",
        name: item.project.name,
        description: `Backlog project: ${item.project.name} (${item.project.projectKey})`
      }))
    };
  } catch (error) {
    console.error('Error listing recent projects:', error);
    throw error;
  }
}

/**
 * Handler for reading a project resource
 */
export async function readProject(client: BacklogClient, uri: string) {
  try {
    // Parse the URI to get the project ID
    const url = new URL(uri);
    const projectId = url.pathname.replace(/^\/project\//, '');
    
    // Get the project details - in a real implementation, this would call
    // a specific Backlog API endpoint to get project details by ID
    const recentProjects = await client.getRecentlyViewedProjects({ count: 100 });
    const projectData = recentProjects.find(item => item.project.id.toString() === projectId);
    
    if (!projectData) {
      throw new Error(`Project ${projectId} not found`);
    }
    
    // Return the project data as a JSON resource
    return {
      contents: [{
        uri,
        mimeType: "application/json",
        text: JSON.stringify(projectData.project, null, 2)
      }]
    };
  } catch (error) {
    console.error('Error reading project:', error);
    throw error;
  }
}
