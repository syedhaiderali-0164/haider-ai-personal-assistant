import { apiRequest, getToken } from './api';
import { Conversation, Message } from '../types';

export interface StreamChatParams {
  conversationId?: string | null;
  message: string;
  model?: string;
  temperature?: number;
  systemPrompt?: string;
  signal?: AbortSignal;
  onToken: (token: string) => void;
  onConversationInfo?: (info: { conversation_id: string; title: string }) => void;
  onComplete?: () => void;
  onError?: (err: Error) => void;
}

export const chatService = {
  async listConversations(query?: string): Promise<Conversation[]> {
    const q = query ? `?q=${encodeURIComponent(query)}` : '';
    return apiRequest<Conversation[]>(`/conversations/${q}`);
  },

  async getConversation(id: string): Promise<Conversation> {
    return apiRequest<Conversation>(`/conversations/${id}`);
  },

  async createConversation(data: { title?: string; model?: string }): Promise<Conversation> {
    return apiRequest<Conversation>('/conversations/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateConversation(id: string, data: { title?: string; is_pinned?: boolean }): Promise<Conversation> {
    return apiRequest<Conversation>(`/conversations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteConversation(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/conversations/${id}`, {
      method: 'DELETE',
    });
  },

  async editMessage(messageId: string, content: string): Promise<Message> {
    return apiRequest<Message>(`/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  },

  async deleteMessage(messageId: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/messages/${messageId}`, {
      method: 'DELETE',
    });
  },

  async streamChat({
    conversationId,
    message,
    model,
    temperature,
    systemPrompt,
    signal,
    onToken,
    onConversationInfo,
    onComplete,
    onError,
  }: StreamChatParams): Promise<void> {
    const token = getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch('/api/v1/chat/stream', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          conversation_id: conversationId,
          message,
          model,
          temperature,
          system_prompt: systemPrompt,
        }),
        signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Chat stream failed (${response.status}): ${errorText}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported by browser/server.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const dataStr = trimmed.slice(6);
          if (dataStr === '[DONE]') {
            onComplete?.();
            return;
          }

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.error) {
              onError?.(new Error(parsed.error));
              return;
            }
            if (parsed.type === 'conversation_info' && onConversationInfo) {
              onConversationInfo(parsed);
            }
            if (parsed.content) {
              onToken(parsed.content);
            }
          } catch {
            // Raw text fallback
            if (dataStr) onToken(dataStr);
          }
        }
      }

      onComplete?.();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        onComplete?.();
        return;
      }
      onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  },
};

