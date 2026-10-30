import { apiRequest, setToken, removeToken } from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  async register(data: { email: string; full_name: string; password: string }): Promise<AuthResponse> {
    const res = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setToken(res.access_token);
    localStorage.setItem('haider_ai_refresh_token', res.refresh_token);
    return res;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setToken(res.access_token);
    localStorage.setItem('haider_ai_refresh_token', res.refresh_token);
    return res;
  },

  async getMe(): Promise<User> {
    return apiRequest<User>('/auth/me');
  },

  async updateProfile(data: { full_name?: string; email?: string }): Promise<User> {
    return apiRequest<User>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async changePassword(data: { current_password: string; new_password: string }): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/users/me/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getUserStats(): Promise<{
    total_conversations: number;
    total_messages: number;
    total_documents: number;
    total_tasks: number;
    completed_tasks: number;
  }> {
    return apiRequest('/users/me/stats');
  },

  logout(): void {
    removeToken();
  },
};

