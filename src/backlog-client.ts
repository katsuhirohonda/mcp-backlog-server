/**
 * Backlog API client for the MCP server
 */

import { AuthConfig, RecentlyViewedProject, BacklogProject, BacklogError, BacklogIssue, BacklogIssueDetail, BacklogComment, BacklogCommentDetail, BacklogCommentCount, BacklogWikiPage } from './types.js';

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
   * Make a POST request with form data to Backlog
   */
  private async postFormData<T>(path: string, formData: Record<string, string | number | boolean>): Promise<T> {
    const url = this.getUrl(path);
    const formBody = new URLSearchParams();
    
    // Add form parameters
    Object.entries(formData).forEach(([key, value]) => {
      formBody.append(key, value.toString());
    });
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody,
      });

      const data = await response.json();
      
      if (!response.ok) {
        const error = data as BacklogError;
        throw new Error(`Backlog API Error: ${error.errors?.[0]?.message || 'Unknown error'} (Code: ${error.errors?.[0]?.code})`);
      }
      
      return data as T;
    } catch (error) {
      console.error(`Error in Backlog API POST request to ${path}:`, error);
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

  /**
   * Get comments from an issue
   * @param issueIdOrKey Issue ID or issue key
   * @param params Query parameters for filtering comments
   */
  async getComments(issueIdOrKey: string, params: {
    minId?: number;
    maxId?: number;
    count?: number;
    order?: 'asc' | 'desc';
  } = {}): Promise<BacklogComment[]> {
    const queryParams: Record<string, string> = {};
    
    if (params.minId !== undefined) queryParams.minId = params.minId.toString();
    if (params.maxId !== undefined) queryParams.maxId = params.maxId.toString();
    if (params.count !== undefined) queryParams.count = params.count.toString();
    if (params.order) queryParams.order = params.order;
    
    return this.request<BacklogComment[]>(`/issues/${issueIdOrKey}/comments`, {}, queryParams);
  }

  /**
   * Add a comment to an issue
   * @param issueIdOrKey Issue ID or issue key
   * @param content Comment content
   */
  async addComment(issueIdOrKey: string, content: string): Promise<BacklogComment> {
    return this.postFormData<BacklogComment>(`/issues/${issueIdOrKey}/comments`, {
      content
    });
  }

  /**
   * Get the count of comments in an issue
   * @param issueIdOrKey Issue ID or issue key
   */
  async getCommentCount(issueIdOrKey: string): Promise<BacklogCommentCount> {
    return this.request<BacklogCommentCount>(`/issues/${issueIdOrKey}/comments/count`);
  }

  /**
   * Get detailed information about a specific comment
   * @param issueIdOrKey Issue ID or issue key
   * @param commentId Comment ID
   */
  async getComment(issueIdOrKey: string, commentId: number): Promise<BacklogCommentDetail> {
    return this.request<BacklogCommentDetail>(`/issues/${issueIdOrKey}/comments/${commentId}`);
  }

  /**
   * Get Wiki page list
   */
  async getWikiPageList(projectIdOrKey?: string, keyword?: string): Promise<BacklogWikiPage[]> {
    const queryParams: Record<string, string> = {};
    
    if (projectIdOrKey) {
      queryParams.projectIdOrKey = projectIdOrKey;
    }
    
    if (keyword) {
      queryParams.keyword = keyword;
    }
    
    return this.request<BacklogWikiPage[]>('/wikis', {}, queryParams);
  }

  /**
   * Get Wiki page detail
   */
  async getWikiPage(wikiId: string): Promise<BacklogWikiPage> {
    return this.request<BacklogWikiPage>(`/wikis/${wikiId}`);
  }

  /**
   * Update Wiki page
   */
  async updateWikiPage(
    wikiId: string, 
    params: { 
      name?: string; 
      content?: string; 
      mailNotify?: boolean;
    }
  ): Promise<BacklogWikiPage> {
    const formData: Record<string, string | number | boolean> = {};
    
    if (params.name !== undefined) {
      formData.name = params.name;
    }
    
    if (params.content !== undefined) {
      formData.content = params.content;
    }
    
    if (params.mailNotify !== undefined) {
      formData.mailNotify = params.mailNotify;
    }
    
    return this.postFormData<BacklogWikiPage>(`/wikis/${wikiId}`, formData);
  }
}
