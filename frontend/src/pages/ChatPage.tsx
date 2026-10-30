import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Bot,
  User,
  Send,
  Square,
  Copy,
  Check,
  RotateCcw,
  Edit2,
  Trash2,
  Plus,
  Sparkles,
  Search,
  MessageSquare,
  MoreVertical,
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import { chatService } from '../services/chatService';
import { settingsService } from '../services/settingsService';
import { Conversation, Message, UserSettings } from '../types';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { TypingIndicator } from '../components/TypingIndicator';
import { useToast } from '../context/ToastContext';

export const ChatPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const conversationIdFromUrl = searchParams.get('id');
  const isNewFromUrl = searchParams.get('new');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, isStreaming]);

  // Load conversations and settings
  const loadConversations = async () => {
    try {
      const list = await chatService.listConversations();
      setConversations(list);
      return list;
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const init = async () => {
      const list = await loadConversations();
      try {
        const st = await settingsService.getSettings();
        setUserSettings(st);
      } catch {
        // ignore
      }

      if (isNewFromUrl) {
        setCurrentConversation(null);
        setMessages([]);
      } else if (conversationIdFromUrl) {
        loadConversationDetails(conversationIdFromUrl);
      } else if (list.length > 0) {
        loadConversationDetails(list[0].id);
      }
    };
    init();
  }, [conversationIdFromUrl, isNewFromUrl]);

  const loadConversationDetails = async (id: string) => {
    try {
      const detail = await chatService.getConversation(id);
      setCurrentConversation(detail);
      setMessages(detail.messages || []);
      setSearchParams({ id });
    } catch {
      showToast('Could not load conversation', 'error');
    }
  };

  const handleStartNewChat = () => {
    setCurrentConversation(null);
    setMessages([]);
    setStreamingContent('');
    setIsStreaming(false);
    setSearchParams({ new: 'true' });
  };

  // Submit Prompt
  const handleSendMessage = async (e?: React.FormEvent, promptOverride?: string) => {
    if (e) e.preventDefault();
    const promptToSend = (promptOverride || inputPrompt).trim();
    if (!promptToSend || isStreaming) return;

    setInputPrompt('');
    setIsStreaming(true);
    setStreamingContent('');

    // Optimistically add user message to UI
    const tempUserMsg: Message = {
      id: 'temp-' + Date.now(),
      conversation_id: currentConversation?.id || '',
      role: 'user',
      content: promptToSend,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let accumulatedContent = '';

    await chatService.streamChat({
      conversationId: currentConversation?.id,
      message: promptToSend,
      model: userSettings?.model_name,
      temperature: userSettings?.temperature,
      signal: controller.signal,
      onConversationInfo: (info) => {
        if (!currentConversation || currentConversation.id !== info.conversation_id) {
          setCurrentConversation({
            id: info.conversation_id,
            user_id: '',
            title: info.title,
            model: userSettings?.model_name || 'gpt-4o-mini',
            is_pinned: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          setSearchParams({ id: info.conversation_id });
          loadConversations();
        }
      },
      onToken: (token) => {
        accumulatedContent += token;
        setStreamingContent(accumulatedContent);
      },
      onComplete: async () => {
        setIsStreaming(false);
        abortControllerRef.current = null;
        if (accumulatedContent) {
          const finalAsstMsg: Message = {
            id: 'asst-' + Date.now(),
            conversation_id: currentConversation?.id || '',
            role: 'assistant',
            content: accumulatedContent,
            created_at: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, finalAsstMsg]);
          setStreamingContent('');
        }
        await loadConversations();
      },
      onError: (err) => {
        setIsStreaming(false);
        abortControllerRef.current = null;
        showToast(err.message, 'error');
      },
    });
  };

  // Stop generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      if (streamingContent) {
        setMessages((prev) => [
          ...prev,
          {
            id: 'asst-' + Date.now(),
            conversation_id: currentConversation?.id || '',
            role: 'assistant',
            content: streamingContent + '\n\n*(Generation stopped by user)*',
            created_at: new Date().toISOString(),
          },
        ]);
        setStreamingContent('');
      }
    }
  };

  // Copy message text
  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Delete message
  const handleDeleteMessage = async (msgId: string) => {
    try {
      await chatService.deleteMessage(msgId);
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
      showToast('Message deleted', 'info');
    } catch {
      showToast('Failed to delete message', 'error');
    }
  };

  // Edit message & regenerate
  const handleStartEdit = (msg: Message) => {
    setEditingMessageId(msg.id);
    setEditPrompt(msg.content);
  };

  const handleSaveEdit = async (msgId: string) => {
    if (!editPrompt.trim()) return;
    try {
      await chatService.editMessage(msgId, editPrompt.trim());
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, content: editPrompt.trim() } : m))
      );
      setEditingMessageId(null);
      // Trigger regeneration with updated content
      handleSendMessage(undefined, editPrompt.trim());
    } catch {
      showToast('Failed to edit message', 'error');
    }
  };

  // Regenerate assistant response
  const handleRegenerate = () => {
    if (messages.length === 0 || isStreaming) return;
    // Find last user prompt
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSendMessage(undefined, lastUserMsg.content);
    }
  };

  // Delete Conversation
  const handleDeleteConversation = async (convId: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;
    try {
      await chatService.deleteConversation(convId);
      showToast('Conversation deleted', 'info');
      const list = await loadConversations();
      if (currentConversation?.id === convId) {
        if (list.length > 0) {
          loadConversationDetails(list[0].id);
        } else {
          handleStartNewChat();
        }
      }
    } catch {
      showToast('Failed to delete conversation', 'error');
    }
  };

  // Rename Conversation
  const handleRenameConversation = async (convId: string) => {
    if (!renameTitle.trim()) return;
    try {
      await chatService.updateConversation(convId, { title: renameTitle.trim() });
      if (currentConversation?.id === convId) {
        setCurrentConversation((prev) => (prev ? { ...prev, title: renameTitle.trim() } : null));
      }
      setRenamingId(null);
      loadConversations();
      showToast('Conversation renamed', 'success');
    } catch {
      showToast('Failed to rename conversation', 'error');
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const suggestedPrompts = [
    'Explain quantum computing in simple terms with an everyday analogy.',
    'Help me draft an executive email proposing a strategic AI initiative.',
    'Write a robust Python FastAPI script for streaming Server-Sent Events.',
    'Summarize the key differences between monolithic and microservices architecture.',
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-950">
      {/* Conversations Sub-sidebar (Desktop) */}
      <div className="w-72 hidden lg:flex flex-col border-r border-slate-800/80 bg-slate-950/60 p-3 space-y-3 shrink-0">
        <button
          onClick={handleStartNewChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-md shadow-cyan-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No conversations found.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = currentConversation?.id === conv.id;
              const isRenaming = renamingId === conv.id;

              return (
                <div
                  key={conv.id}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white font-medium border border-cyan-500/30'
                      : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  {isRenaming ? (
                    <div className="flex items-center gap-1 w-full">
                      <input
                        type="text"
                        value={renameTitle}
                        onChange={(e) => setRenameTitle(e.target.value)}
                        className="flex-1 bg-slate-950 text-white px-2 py-1 rounded border border-cyan-500 text-xs focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleRenameConversation(conv.id)}
                        className="p-1 text-emerald-400 hover:text-emerald-300"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => loadConversationDetails(conv.id)}
                        className="flex items-center gap-2.5 text-left truncate flex-1"
                      >
                        <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <span className="truncate">{conv.title}</span>
                      </button>

                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 ml-1 transition-opacity">
                        <button
                          onClick={() => {
                            setRenamingId(conv.id);
                            setRenameTitle(conv.title);
                          }}
                          className="p-1 text-slate-400 hover:text-cyan-400 rounded"
                          title="Rename"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteConversation(conv.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Chat Top Banner */}
        <div className="h-14 px-4 sm:px-6 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-950/80 backdrop-blur-md">
          <div className="flex items-center gap-3 truncate">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="truncate">
              <h2 className="text-sm font-bold text-white truncate">
                {currentConversation?.title || 'New Conversation'}
              </h2>
              <span className="text-[10px] text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Active Model: {userSettings?.model_name || 'gpt-4o-mini'}</span>
              </span>
            </div>
          </div>

          {currentConversation && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDeleteConversation(currentConversation.id)}
                className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors"
                title="Delete Conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Messages Feed Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 && !isStreaming ? (
            /* Empty State with Prompt Suggestions */
            <div className="h-full flex flex-col items-center justify-center max-w-xl mx-auto text-center space-y-6 py-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/25">
                <Bot className="w-9 h-9" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  How can <span className="gradient-text">HAIDER AI</span> assist you?
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Ask questions, draft content, inspect code, or explore complex concepts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(undefined, prompt)}
                    className="p-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-white transition-all duration-200 group"
                  >
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <span className="leading-snug">{prompt}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3.5 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  } group animate-in fade-in duration-200`}
                >
                  {/* Assistant Avatar */}
                  {msg.role !== 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-cyan-500/20">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-2xl sm:max-w-3xl rounded-2xl p-4 sm:p-5 shadow-sm text-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-xs'
                        : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-xs'
                    }`}
                  >
                    {editingMessageId === msg.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editPrompt}
                          onChange={(e) => setEditPrompt(e.target.value)}
                          className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-cyan-500 text-sm focus:outline-none resize-none"
                          rows={3}
                        />
                        <div className="flex items-center justify-end gap-2 text-xs">
                          <button
                            onClick={() => setEditingMessageId(null)}
                            className="px-3 py-1 rounded-lg text-slate-300 hover:bg-slate-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(msg.id)}
                            className="px-3 py-1 rounded-lg bg-cyan-500 text-white font-semibold hover:bg-cyan-400"
                          >
                            Save & Regenerate
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {msg.role === 'user' ? (
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                        ) : (
                          <MarkdownRenderer content={msg.content} />
                        )}

                        {/* Actions Toolbar */}
                        <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopyMessage(msg.id, msg.content)}
                              className="p-1 hover:text-white rounded flex items-center gap-1 transition-colors"
                              title="Copy response"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>

                            {msg.role === 'user' && (
                              <button
                                onClick={() => handleStartEdit(msg)}
                                className="p-1 hover:text-white rounded flex items-center gap-1 transition-colors"
                                title="Edit message"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                            )}

                            {msg.role === 'assistant' && (
                              <button
                                onClick={handleRegenerate}
                                className="p-1 hover:text-white rounded flex items-center gap-1 transition-colors"
                                title="Regenerate response"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Regenerate</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="p-1 hover:text-rose-400 rounded transition-colors"
                              title="Delete message"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* User Avatar */}
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {/* Live Streaming Assistant Message */}
              {isStreaming && (
                <div className="flex items-start gap-3.5 justify-start animate-in fade-in">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-cyan-500/20">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="max-w-2xl sm:max-w-3xl rounded-2xl rounded-tl-xs p-4 sm:p-5 bg-slate-900/90 border border-slate-800 text-slate-100 text-sm shadow-sm">
                    {streamingContent ? (
                      <MarkdownRenderer content={streamingContent} />
                    ) : (
                      <TypingIndicator />
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar Form */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/90 shrink-0">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative">
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-900 border border-slate-800 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 shadow-xl transition-all">
              <textarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask HAIDER AI anything... (Press Enter to send, Shift+Enter for newline)"
                rows={1}
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 px-3 py-1.5 focus:outline-none resize-none max-h-32 min-h-[38px]"
              />

              {isStreaming ? (
                <button
                  type="button"
                  onClick={handleStopGeneration}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-all cursor-pointer"
                  title="Stop generation"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputPrompt.trim()}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white disabled:opacity-40 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>

            <p className="text-[10px] text-center text-slate-500 mt-2">
              HAIDER AI can make mistakes. Verify critical facts. All data is isolated to your private account.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
