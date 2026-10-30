export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens_used?: number;
  model?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  model: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  message_count?: number;
  last_message?: string;
  messages?: Message[];
}

export interface DocumentItem {
  id: string;
  user_id: string;
  filename: string;
  original_name: string;
  file_type: string;
  file_size: number;
  status: string;
  summary?: string;
  chunk_count: number;
  created_at: string;
}

export interface DocumentQueryResponse {
  answer: string;
  relevant_chunks: string[];
  sources: string[];
}

export interface TaskItem {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'completed';
  due_date?: string;
  tags?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  in_progress: number;
  todo: number;
  urgent: number;
  high: number;
}

export interface UserSettings {
  id: string;
  user_id: string;
  api_provider: string;
  api_base_url: string;
  model_name: string;
  temperature: number;
  max_tokens: number;
  theme: string;
  system_prompt: string;
  voice_speed: number;
  voice_accent: string;
  has_custom_api_key: boolean;
  api_key_masked: string;
  created_at: string;
  updated_at: string;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latency_ms?: number;
  model_tested?: string;
}

export interface ToolResult {
  feature: string;
  result: string;
  metadata?: Record<string, any>;
}

