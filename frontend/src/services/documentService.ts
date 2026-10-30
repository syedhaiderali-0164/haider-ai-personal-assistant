import { apiRequest } from './api';
import { DocumentItem, DocumentQueryResponse } from '../types';

export const documentService = {
  async uploadDocument(file: File): Promise<DocumentItem> {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest<DocumentItem>('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  },

  async listDocuments(): Promise<DocumentItem[]> {
    return apiRequest<DocumentItem[]>('/documents/');
  },

  async getDocument(id: string): Promise<DocumentItem> {
    return apiRequest<DocumentItem>(`/documents/${id}`);
  },

  async deleteDocument(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/documents/${id}`, {
      method: 'DELETE',
    });
  },

  async queryDocuments(data: {
    query: string;
    document_ids?: string[];
    top_k?: number;
  }): Promise<DocumentQueryResponse> {
    return apiRequest<DocumentQueryResponse>('/documents/query', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async summarizeDocument(
    documentId: string,
    mode: 'executive' | 'key_points' | 'eli5' | 'comprehensive' = 'comprehensive'
  ): Promise<{ summary: string; mode: string }> {
    return apiRequest<{ summary: string; mode: string }>(`/documents/${documentId}/summary`, {
      method: 'POST',
      body: JSON.stringify({ mode }),
    });
  },
};

