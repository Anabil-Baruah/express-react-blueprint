export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface FileItem {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  owner: User | string;
  sharedWith: SharedUser[];
  shareLinks: ShareLink[];
  uploadDate: string;
  path: string;
}

export interface SharedUser {
  user: User | string;
  permission: 'view' | 'download';
  sharedAt: string;
}

export interface ShareLink {
  _id: string;
  token: string;
  expiresAt?: string;
  createdAt: string;
  isActive: boolean;
}

export interface AuditLog {
  _id: string;
  file: FileItem | string;
  user: User | string;
  action: 'upload' | 'download' | 'share' | 'view' | 'delete' | 'revoke';
  details?: string;
  timestamp: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  status: number;
}
