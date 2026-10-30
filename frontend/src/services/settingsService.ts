import { apiRequest } from './api';
import { UserSettings, ConnectionTestResult } from '../types';

export const settingsService = {
  async getSettings(): Promise<UserSettings> {
    return apiRequest<UserSettings>('/settings/');
  },

  async updateSettings(data: Partial<{
    api_provider: string;
    api_base_url: string;
    model_name: string;
    api_key: string;
    temperature: number;
    max_tokens: number;
    theme: string;
    system_prompt: string;
    voice_speed: number;
    voice_accent: string;
  }>): Promise<UserSettings> {
    return apiRequest<UserSettings>('/settings/', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async testConnection(data?: {
    api_provider?: string;
    api_base_url?: string;
    model_name?: string;
    api_key?: string;
  }): Promise<ConnectionTestResult> {
    return apiRequest<ConnectionTestResult>('/settings/test-connection', {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  },
};

