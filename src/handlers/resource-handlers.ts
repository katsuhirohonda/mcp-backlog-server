/**
 * Resource handlers for the Backlog MCP server
 */

import { BacklogClient } from '../backlog-client.js';
import { RecentlyViewedProject, BacklogIssue, BacklogWikiPage } from '../types.js';

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
 * Extract the wiki ID from a backlog wiki URI
 */
function extractWikiId(uri: string): string {
  const url = new URL(uri);
  return url.pathname.replace(/^\/wiki\//, '');
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
    
    // For the first project, also list its issues and wikis
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
        
        // Try to get wiki pages for the first project
        try {
          const wikiPages = await client.getWikiPageList(firstProject.projectKey);
          
          // Create resources for wiki pages (limit to 10)
          const wikiResources = wikiPages.slice(0, 10).map(wiki => ({
            uri: `backlog://wiki/${wiki.id}`,
            mimeType: "application/json",
            name: wiki.name,
            description: `Wiki: ${wiki.name}`
          }));
          
          return {
            resources: [...projectResources, ...issueResources, ...wikiResources]
          };
        } catch (wikiError) {
          console.error('Error fetching wikis for first project:', wikiError);
          // Fall back to just returning projects and issues if wiki fetch fails
          return { resources: [...projectResources, ...issueResources] };
        }
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
 * Handler for reading a project, issue, or wiki resource
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
    } else if (uri.startsWith('backlog://wiki/')) {
      // Handle wiki resource
      const wikiId = extractWikiId(uri);
      
      try {
        const wiki = await client.getWikiPage(wikiId);
        
        // Return the wiki data as a JSON resource
        return {
          contents: [{
            uri,
            mimeType: "application/json",
            text: JSON.stringify(wiki, null, 2)
          }]
        };
      } catch (e) {
        console.error(`Error fetching wiki ${wikiId}:`, e);
        throw new Error(`Wiki not found: ${wikiId}`);
      }
    } else {
      throw new Error(`Unsupported resource URI: ${uri}`);
    }
  } catch (error) {
    console.error(`Error reading resource ${uri}:`, error);
    throw error;
  }
}
