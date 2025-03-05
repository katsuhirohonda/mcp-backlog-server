/**
 * Backlog API client for the MCP server
 */

import { AuthConfig, RecentlyViewedProject, BacklogProject, BacklogError, BacklogIssue, BacklogIssueDetail } from './types.js';

/**
 * Backlog API client for making API calls
 */
export class BacklogClient {
  private config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
  }

  /**
   * Get the full API URL with API key parameter
   */
  private getUrl(path: string, queryParams: Record<string, string> = {}): string {
    const url = new URL(`${this.config.spaceUrl}/api/v2${path}`);
    
    // Add API key
    url.searchParams.append('apiKey', this.config.apiKey);
    
    // Add any additional query parameters
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    
    return url.toString();
  }

  /**
   * Make an API request to Backlog
   */
  private async request<T>(path: string, options: RequestInit = {}, queryParams: Record<string, string> = {}): Promise<T> {
    const url = this.getUrl(path, queryParams);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        const error = data as BacklogError;
        throw new Error(`Backlog API Error: ${error.errors?.[0]?.message || 'Unknown error'} (Code: ${error.errors?.[0]?.code})`);
      }
      
      return data as T;
    } catch (error) {
      console.error(`Error in Backlog API request to ${path}:`, error);
      throw error;
    }
  }

  /**
   * Get recently viewed projects for the current user
   */
  async getRecentlyViewedProjects(params: { order?: 'asc' | 'desc', offset?: number, count?: number } = {}): Promise<RecentlyViewedProject[]> {
    const queryParams: Record<string, string> = {};
    
    if (params.order) queryParams.order = params.order;
    if (params.offset !== undefined) queryParams.offset = params.offset.toString();
    if (params.count !== undefined) queryParams.count = params.count.toString();
    
    return this.request<RecentlyViewedProject[]>('/users/myself/recentlyViewedProjects', {}, queryParams);
  }

  /**
   * Get information about a specific project
   */
  async getProject(projectId: string): Promise<BacklogProject> {
    return this.request<BacklogProject>(`/projects/${projectId}`);
  }

  /**
   * Get information about the current user
   */
  async getMyself() {
    return this.request('/users/myself');
  }

  /**
   * Get space information
   */
  async getSpace() {
    return this.request('/space');
  }

  /**
   * Get issues from a project
   * @param projectIdOrKey Project ID or project key
   * @param params Query parameters for filtering issues
   */
  async getIssues(projectIdOrKey: string, params: {
    statusId?: number[] | number;
    assigneeId?: number[] | number;
    categoryId?: number[] | number;
    priorityId?: number[] | number;
    offset?: number;
    count?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  } = {}): Promise<BacklogIssue[]> {
    const queryParams: Record<string, string> = {};
    
    // Convert parameters to the format expected by the Backlog API
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => {
          queryParams[`${key}[]`] = v.toString();
        });
      } else if (value !== undefined) {
        queryParams[key] = value.toString();
      }
    });
    
    return this.request<BacklogIssue[]>(`/projects/${projectIdOrKey}/issues`, {}, queryParams);
  }

  /**
   * Get detailed information about a specific issue
   * @param issueIdOrKey Issue ID or issue key
   */
  async getIssue(issueIdOrKey: string): Promise<BacklogIssueDetail> {
    return this.request<BacklogIssueDetail>(`/issues/${issueIdOrKey}`);
  }
}
