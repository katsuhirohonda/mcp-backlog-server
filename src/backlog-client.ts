/**
 * Backlog API client for the MCP server
 */

import { AuthConfig, RecentlyViewedProject, BacklogError } from './types.js';

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
}
