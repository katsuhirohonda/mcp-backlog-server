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

// Backlog issue information
export interface BacklogIssue {
  id: number;
  projectId: number;
  issueKey: string;
  keyId: number;
  issueType: {
    id: number;
    projectId: number;
    name: string;
    color: string;
    displayOrder: number;
  };
  summary: string;
  description: string;
  priority: {
    id: number;
    name: string;
  };
  status: {
    id: number;
    name: string;
  };
  assignee: {
    id: number;
    name: string;
    roleType: number;
    userId: string;
  } | null;
  category: {
    id: number;
    name: string;
  }[];
  versions: {
    id: number;
    name: string;
  }[];
  milestone: {
    id: number;
    name: string;
  }[];
  startDate: string | null;
  dueDate: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  parentIssueId: number | null;
  createdUser: {
    id: number;
    userId: string;
    name: string;
  };
  created: string;
  updatedUser: {
    id: number;
    userId: string;
    name: string;
  };
  updated: string;
  customFields: any[];
  attachments: any[];
  sharedFiles: any[];
  stars: any[];
}

// Backlog issue detail with comments
export interface BacklogIssueDetail extends BacklogIssue {
  comments: {
    id: number;
    content: string;
    changeLog: any[];
    createdUser: {
      id: number;
      userId: string;
      name: string;
    };
    created: string;
    updated: string;
    stars: any[];
    notifications: any[];
  }[];
}
