/**
 * Types for the Backlog MCP server
 */

// Auth configuration
export interface AuthConfig {
  apiKey: string;
  spaceUrl: string;
}

// Backlog Project type
export interface BacklogProject {
  id: number;
  projectKey: string;
  name: string;
  chartEnabled: boolean;
  useResolvedForChart: boolean;
  subtaskingEnabled: boolean;
  projectLeaderCanEditProjectLeader: boolean;
  useWiki: boolean;
  useFileSharing: boolean;
  useWikiTreeView: boolean;
  useSubversion: boolean;
  useGit: boolean;
  useOriginalImageSizeAtWiki: boolean;
  textFormattingRule: string;
  archived: boolean;
  displayOrder: number;
  useDevAttributes: boolean;
}

// Recently viewed project response
export interface RecentlyViewedProject {
  project: BacklogProject;
  updated: string;
}

// Backlog Error response
export interface BacklogError {
  errors: Array<{
    message: string;
    code: number;
    moreInfo: string;
  }>;
}
