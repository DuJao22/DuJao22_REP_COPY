
export type FileType = 'python' | 'html' | 'css' | 'javascript' | 'json' | 'markdown';
export type AgentType = 'architect' | 'developer';

export interface ProjectFile {
  name: string;
  content: string;
  language: FileType;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  files: Record<string, ProjectFile>;
  createdAt: number;
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
}

export interface ProjectState {
  activeProject: Project | null;
  activeFile: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  agent?: AgentType;
  content: string;
  timestamp: Date;
}
