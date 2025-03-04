/**
 * Configuration for the Backlog MCP server
 */

import { AuthConfig } from './types.js';

/**
 * Load configuration from environment variables
 */
export function loadConfig(): AuthConfig {
  const apiKey = process.env.BACKLOG_API_KEY;
  const spaceUrl = process.env.BACKLOG_SPACE_URL;
  
  if (!apiKey) {
    throw new Error('BACKLOG_API_KEY environment variable is required');
  }
  
  if (!spaceUrl) {
    throw new Error('BACKLOG_SPACE_URL environment variable is required');
  }
  
  return { apiKey, spaceUrl };
}
