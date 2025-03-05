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
        name: "get_backlog_user",
        description: "Get current Backlog user information",
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      {
        name: "get_backlog_space",
        description: "Get Backlog space information",
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      {
        name: "list_recent_projects",
        description: "List recently viewed Backlog projects",
        inputSchema: {
          type: "object",
          properties: {
            count: {
              type: "number",
              description: "Number of projects to retrieve (1-100, default 20)"
            },
            order: {
              type: "string",
              description: "Sorting order (asc or desc, default desc)",
              enum: ["asc", "desc"]
            }
          },
          required: []
        }
      },
      {
        name: "get_project_issues",
        description: "Get issues from a Backlog project",
        inputSchema: {
          type: "object",
          properties: {
            projectIdOrKey: {
              type: "string",
              description: "Project ID or project key"
            },
            statusId: {
              type: "array",
              items: {
                type: "number"
              },
              description: "Filter by status IDs"
            },
            assigneeId: {
              type: "array",
              items: {
                type: "number"
              },
              description: "Filter by assignee IDs"
            },
            count: {
              type: "number",
              description: "Number of issues to retrieve (1-100, default 20)"
            },
            offset: {
              type: "number",
              description: "Offset for pagination"
            },
            sort: {
              type: "string",
              description: "Sort field (e.g., 'created', 'updated')"
            },
            order: {
              type: "string",
              description: "Sorting order (asc or desc, default desc)",
              enum: ["asc", "desc"]
            }
          },
          required: ["projectIdOrKey"]
        }
      },
      {
        name: "get_issue_detail",
        description: "Get detailed information about a specific Backlog issue",
        inputSchema: {
          type: "object",
          properties: {
            issueIdOrKey: {
              type: "string",
              description: "Issue ID or issue key"
            }
          },
          required: ["issueIdOrKey"]
        }
      },
      {
        name: "get_issue_comments",
        description: "Get comments from a specific Backlog issue",
        inputSchema: {
          type: "object",
          properties: {
            issueIdOrKey: {
              type: "string",
              description: "Issue ID or issue key"
            },
            minId: {
              type: "number",
              description: "Minimum comment ID"
            },
            maxId: {
              type: "number",
              description: "Maximum comment ID"
            },
            count: {
              type: "number",
              description: "Number of comments to retrieve (1-100, default 20)"
            },
            order: {
              type: "string",
              description: "Sorting order (asc or desc, default desc)",
              enum: ["asc", "desc"]
            }
          },
          required: ["issueIdOrKey"]
        }
      },
      {
        name: "add_issue_comment",
        description: "Add a comment to a specific Backlog issue",
        inputSchema: {
          type: "object",
          properties: {
            issueIdOrKey: {
              type: "string",
              description: "Issue ID or issue key"
            },
            content: {
              type: "string",
              description: "Comment content"
            }
          },
          required: ["issueIdOrKey", "content"]
        }
      },
      {
        name: "get_issue_comment_count",
        description: "Get the count of comments in a specific Backlog issue",
        inputSchema: {
          type: "object",
          properties: {
            issueIdOrKey: {
              type: "string",
              description: "Issue ID or issue key"
            }
          },
          required: ["issueIdOrKey"]
        }
      },
      {
        name: "get_issue_comment",
        description: "Get detailed information about a specific comment in a Backlog issue",
        inputSchema: {
          type: "object",
          properties: {
            issueIdOrKey: {
              type: "string",
              description: "Issue ID or issue key"
            },
            commentId: {
              type: "number",
              description: "Comment ID"
            }
          },
          required: ["issueIdOrKey", "commentId"]
        }
      }
    ]
  };
}

/**
 * Format data for display in tool response
 */
function formatToolResponse(title: string, data: any): any {
  return {
    content: [
      {
        type: "text",
        text: `# ${title}\n\n${JSON.stringify(data, null, 2)}`
      }
    ]
  };
}

/**
 * Handle tool execution
 */
export async function executeTools(client: BacklogClient, toolName: string, args: any) {
  try {
    switch (toolName) {
      case "get_backlog_user": {
        const userData = await client.getMyself();
        return formatToolResponse("Backlog User Information", userData);
      }
      
      case "get_backlog_space": {
        const spaceData = await client.getSpace();
        return formatToolResponse("Backlog Space Information", spaceData);
      }
      
      case "list_recent_projects": {
        const count = args?.count && Number(args.count) > 0 && Number(args.count) <= 100 
          ? Number(args.count) 
          : 20;
          
        const order = args?.order === 'asc' ? 'asc' : 'desc';
        
        const projects = await client.getRecentlyViewedProjects({ 
          count, 
          order 
        });
        
        return formatToolResponse("Recently Viewed Projects", projects);
      }
      
      case "get_project_issues": {
        if (!args?.projectIdOrKey) {
          throw new Error("Project ID or key is required");
        }
        
        const projectIdOrKey = args.projectIdOrKey;
        const count = args?.count && Number(args.count) > 0 && Number(args.count) <= 100 
          ? Number(args.count) 
          : 20;
        const offset = args?.offset && Number(args.offset) >= 0 
          ? Number(args.offset) 
          : 0;
        const sort = args?.sort || 'created';
        const order = args?.order === 'asc' ? 'asc' : 'desc';
        
        // Handle array parameters
        const statusId = args?.statusId;
        const assigneeId = args?.assigneeId;
        
        const issues = await client.getIssues(projectIdOrKey, {
          statusId,
          assigneeId,
          count,
          offset,
          sort,
          order
        });
        
        return formatToolResponse("Project Issues", issues);
      }
      
      case "get_issue_detail": {
        if (!args?.issueIdOrKey) {
          throw new Error("Issue ID or key is required");
        }
        
        const issueIdOrKey = args.issueIdOrKey;
        const issueDetail = await client.getIssue(issueIdOrKey);
        
        return formatToolResponse("Issue Detail", issueDetail);
      }
      
      case "get_issue_comments": {
        if (!args?.issueIdOrKey) {
          throw new Error("Issue ID or key is required");
        }
        
        const issueIdOrKey = args.issueIdOrKey;
        const minId = args?.minId !== undefined ? Number(args.minId) : undefined;
        const maxId = args?.maxId !== undefined ? Number(args.maxId) : undefined;
        const count = args?.count && Number(args.count) > 0 && Number(args.count) <= 100 
          ? Number(args.count) 
          : 20;
        const order = args?.order === 'asc' ? 'asc' : 'desc';
        
        const comments = await client.getComments(issueIdOrKey, {
          minId,
          maxId,
          count,
          order
        });
        
        return formatToolResponse("Issue Comments", comments);
      }
      
      case "add_issue_comment": {
        if (!args?.issueIdOrKey) {
          throw new Error("Issue ID or key is required");
        }
        
        if (!args?.content) {
          throw new Error("Comment content is required");
        }
        
        const issueIdOrKey = args.issueIdOrKey;
        const content = args.content;
        
        const comment = await client.addComment(issueIdOrKey, content);
        
        return formatToolResponse("Added Comment", comment);
      }
      
      case "get_issue_comment_count": {
        if (!args?.issueIdOrKey) {
          throw new Error("Issue ID or key is required");
        }
        
        const issueIdOrKey = args.issueIdOrKey;
        const commentCount = await client.getCommentCount(issueIdOrKey);
        
        return formatToolResponse("Issue Comment Count", commentCount);
      }
      
      case "get_issue_comment": {
        if (!args?.issueIdOrKey) {
          throw new Error("Issue ID or key is required");
        }
        
        if (!args?.commentId) {
          throw new Error("Comment ID is required");
        }
        
        const issueIdOrKey = args.issueIdOrKey;
        const commentId = Number(args.commentId);
        
        const comment = await client.getComment(issueIdOrKey, commentId);
        
        return formatToolResponse("Issue Comment", comment);
      }
      
      default:
        throw new Error("Unknown tool");
    }
  } catch (error) {
    console.error(`Error executing tool ${toolName}:`, error);
    throw error;
  }
}
