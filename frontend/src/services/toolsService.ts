import { apiRequest } from './api';
import { ToolResult } from '../types';

export const toolsService = {
  async runWritingTool(data: {
    category: string;
    topic_or_content: string;
    tone?: string;
    audience?: string;
    extra_instructions?: string;
  }): Promise<ToolResult> {
    return apiRequest<ToolResult>('/tools/writing', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async runSummarizerTool(data: {
    content: string;
    summary_type?: string;
    length?: string;
  }): Promise<ToolResult> {
    return apiRequest<ToolResult>('/tools/summarizer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async runTranslatorTool(data: {
    text: string;
    target_language: string;
    source_language?: string;
    preserve_tone?: boolean;
  }): Promise<ToolResult> {
    return apiRequest<ToolResult>('/tools/translator', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async runCodingTool(data: {
    action: string;
    code_or_prompt: string;
    language?: string;
    error_message?: string;
  }): Promise<ToolResult> {
    return apiRequest<ToolResult>('/tools/coding', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async runStudyTool(data: {
    action: string;
    topic: string;
    difficulty_level?: string;
    num_questions?: number;
  }): Promise<ToolResult> {
    return apiRequest<ToolResult>('/tools/study', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async runProductivityTool(data: {
    action: string;
    goals_or_project: string;
    available_hours?: number;
    deadline?: string;
  }): Promise<ToolResult> {
    return apiRequest<ToolResult>('/tools/productivity', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

