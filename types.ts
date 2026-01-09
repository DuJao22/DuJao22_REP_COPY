
export type FileType = 'python' | 'html' | 'css' | 'javascript' | 'json' | 'markdown' | 'typescript' | 'tsx';
export type AgentType = 'architect' | 'developer' | 'reviewer';

export interface ProjectFile {
  name: string;
  content: string;
  language: FileType;
  lastModified?: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  files: Record<string, ProjectFile>;
  createdAt: number;
  progress: number; // 0-100 para indicar maturidade do sistema
  stack: string[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  github?: {
    login: string;
    avatar_url: string;
    token: string;
  };
  vercel?: {
    token: string;
    teamId?: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  agent?: AgentType;
  content: string;
  timestamp: Date;
  suggestedActions?: { label: string; action: string }[];
}
