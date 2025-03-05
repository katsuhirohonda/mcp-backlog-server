/**
 * Resource handlers for the Backlog MCP server
 */

import { BacklogClient } from '../backlog-client.js';
import { RecentlyViewedProject, BacklogIssue } from '../types.js';

/**
 * Extract the project ID from a backlog URI
 */
function extractProjectId(uri: string): string {
  const url = new URL(uri);
  return url.pathname.replace(/^\/project\//, '');
}

/**
 * Extract the issue ID from a backlog issue URI
 */
function extractIssueId(uri: string): string {
  const url = new URL(uri);
  return url.pathname.replace(/^\/issue\//, '');
}

/**
 * Extract project key from issue key (e.g., "PROJECT-123" -> "PROJECT")
 */
function extractProjectKeyFromIssueKey(issueKey: string): string {
  const match = issueKey.match(/^([A-Z0-9_]+)-\d+$/);
  return match ? match[1] : '';
}

/**
 * Handler for listing recent projects
 */
export async function listRecentProjects(client: BacklogClient) {
  try {
    const projects = await client.getRecentlyViewedProjects({ count: 20 });
    
    // Create resources for projects
    const projectResources = projects.map(item => ({
      uri: `backlog://project/${item.project.id}`,
      mimeType: "application/json",
      name: item.project.name,
      description: `Backlog project: ${item.project.name} (${item.project.projectKey})`
    }));
    
    // For the first project, also list its issues
    if (projects.length > 0) {
      try {
        const firstProject = projects[0].project;
        const issues = await client.getIssues(firstProject.id.toString(), { count: 10 });
        
        // Create resources for issues
        const issueResources = issues.map(issue => ({
          uri: `backlog://issue/${issue.id}`,
          mimeType: "application/json",
          name: issue.summary,
          description: `Issue: ${issue.issueKey} - ${issue.summary}`
        }));
        
        return {
          resources: [...projectResources, ...issueResources]
        };
      } catch (error) {
        console.error('Error fetching issues for first project:', error);
        // Fall back to just returning projects if issues fetch fails
        return { resources: projectResources };
      }
    }
    
    return { resources: projectResources };
  } catch (error) {
    console.error('Error listing recent projects:', error);
    throw error;
  }
}

/**
 * Handler for reading a project or issue resource
 */
export async function readProject(client: BacklogClient, uri: string) {
  try {
    if (uri.startsWith('backlog://project/')) {
      // Handle project resource
      const projectId = extractProjectId(uri);
      
      try {
        const project = await client.getProject(projectId);
        
        // Return the project data as a JSON resource
        return {
          contents: [{
            uri,
            mimeType: "application/json",
            text: JSON.stringify(project, null, 2)
          }]
        };
      } catch (e) {
        // Fallback: if direct project fetch fails, try to find it in recent projects
        const recentProjects = await client.getRecentlyViewedProjects({ count: 100 });
        const projectData = recentProjects.find(item => item.project.id.toString() === projectId);
        
        if (!projectData) {
          throw new Error(`Project ${projectId} not found`);
        }
        
        return {
          contents: [{
            uri,
            mimeType: "application/json",
            text: JSON.stringify(projectData.project, null, 2)
          }]
        };
      }
    } else if (uri.startsWith('backlog://issue/')) {
      // Handle issue resource
      const issueId = extractIssueId(uri);
      
      try {
        const issue = await client.getIssue(issueId);
        
        // Return the issue data as a JSON resource
        return {
          contents: [{
            uri,
            mimeType: "application/json",
            text: JSON.stringify(issue, null, 2)
          }]
        };
      } catch (error) {
        console.error('Error fetching issue:', error);
        throw new Error(`Issue ${issueId} not found`);
      }
    } else {
      throw new Error(`Unsupported URI format: ${uri}`);
    }
  } catch (error) {
    console.error('Error reading resource:', error);
    throw error;
  }
}
