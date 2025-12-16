const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
  token?: string;
}

async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;
  
  const headers: HeadersInit = {
    ...fetchOptions.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  if (!(fetchOptions.body instanceof FormData)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

// Auth API
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  
  login: (data: { email: string; password: string }) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  
  getProfile: (token: string) =>
    apiRequest('/auth/profile', { token }),
};

// Files API
export const filesApi = {
  upload: (formData: FormData, token: string) =>
    apiRequest('/files/upload', { method: 'POST', body: formData, token }),
  
  getMyFiles: (token: string) =>
    apiRequest('/files/my-files', { token }),
  
  getSharedWithMe: (token: string) =>
    apiRequest('/files/shared-with-me', { token }),
  
  getFile: (fileId: string, token: string) =>
    apiRequest(`/files/${fileId}`, { token }),
  
  deleteFile: (fileId: string, token: string) =>
    apiRequest(`/files/${fileId}`, { method: 'DELETE', token }),
  
  shareWithUsers: (fileId: string, data: { users: string[]; permission: string }, token: string) =>
    apiRequest(`/files/${fileId}/share`, { method: 'POST', body: JSON.stringify(data), token }),
  
  generateShareLink: (fileId: string, data: { expiresIn?: number }, token: string) =>
    apiRequest(`/files/${fileId}/share-link`, { method: 'POST', body: JSON.stringify(data), token }),
  
  revokeShareLink: (fileId: string, linkId: string, token: string) =>
    apiRequest(`/files/${fileId}/share-link/${linkId}`, { method: 'DELETE', token }),
  
  revokeUserAccess: (fileId: string, userId: string, token: string) =>
    apiRequest(`/files/${fileId}/share/${userId}`, { method: 'DELETE', token }),
  
  accessByLink: (token: string, shareToken: string) =>
    apiRequest(`/files/link/${shareToken}`, { token }),
  
  download: (fileId: string, token: string) =>
    `${API_BASE_URL}/files/${fileId}/download?token=${token}`,
};

// Users API
export const usersApi = {
  search: (query: string, token: string) =>
    apiRequest(`/users/search?q=${encodeURIComponent(query)}`, { token }),
  
  getAll: (token: string) =>
    apiRequest('/users', { token }),
};

// Audit API
export const auditApi = {
  getFileLogs: (fileId: string, token: string) =>
    apiRequest(`/audit/file/${fileId}`, { token }),
  
  getMyLogs: (token: string) =>
    apiRequest('/audit/my-activity', { token }),
};
