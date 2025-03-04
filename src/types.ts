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

// Backlog user information
export interface BacklogUser {
  id: number;
  userId: string;
  name: string;
  roleType: number;
  lang: string;
  mailAddress: string;
  nulabAccount: {
    nulabId: string;
    name: string;
    uniqueId: string;
  };
}

// Backlog space information
export interface BacklogSpace {
  spaceKey: string;
  name: string;
  ownerId: number;
  lang: string;
  timezone: string;
  reportSendTime: string;
  textFormattingRule: string;
  created: string;
  updated: string;
}
