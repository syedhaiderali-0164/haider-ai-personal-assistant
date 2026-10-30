import { apiRequest } from './api';
import { TaskItem, TaskStats } from '../types';

export const taskService = {
  async listTasks(params?: {
    status?: string;
    priority?: string;
    search?: string;
  }): Promise<TaskItem[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.priority) searchParams.append('priority', params.priority);
    if (params?.search) searchParams.append('search', params.search);

    const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiRequest<TaskItem[]>(`/tasks/${queryStr}`);
  },

  async createTask(data: {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    status?: 'todo' | 'in_progress' | 'completed';
    due_date?: string;
    tags?: string;
  }): Promise<TaskItem> {
    return apiRequest<TaskItem>('/tasks/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async batchCreateTasks(
    tasks: Array<{
      title: string;
      description?: string;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      status?: 'todo' | 'in_progress' | 'completed';
      due_date?: string;
      tags?: string;
    }>
  ): Promise<TaskItem[]> {
    return apiRequest<TaskItem[]>('/tasks/batch', {
      method: 'POST',
      body: JSON.stringify(tasks),
    });
  },

  async updateTask(
    taskId: string,
    data: Partial<{
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high' | 'urgent';
      status: 'todo' | 'in_progress' | 'completed';
      due_date: string;
      tags: string;
    }>
  ): Promise<TaskItem> {
    return apiRequest<TaskItem>(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteTask(taskId: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  async getStats(): Promise<TaskStats> {
    return apiRequest<TaskStats>('/tasks/stats');
  },
};
