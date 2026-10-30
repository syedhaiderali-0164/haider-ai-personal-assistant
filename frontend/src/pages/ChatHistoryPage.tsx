import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  MessageSquare,
  Search,
  Pin,
  Trash2,
  Calendar,
  ArrowRight,
  Sparkles,
  Edit2,
  Check
} from 'lucide-react';
import { chatService } from '../services/chatService';
import { Conversation } from '../types';
import { useToast } from '../context/ToastContext';

export const ChatHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const loadHistory = async () => {
    try {
      const data = await chatService.listConversations();
      setConversations(data);
    } catch {
      showToast('Failed to load conversation history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleTogglePin = async (conv: Conversation) => {
    try {
      await chatService.updateConversation(conv.id, { is_pinned: !conv.is_pinned });
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, is_pinned: !c.is_pinned } : c))
      );
      showToast(conv.is_pinned ? 'Conversation unpinned' : 'Conversation pinned to top', 'info');
    } catch {
      showToast('Failed to update pin status', 'error');
    }
  };

  const handleSaveRename = async (convId: string) => {
    if (!editTitle.trim()) return;
    try {
      await chatService.updateConversation(convId, { title: editTitle.trim() });
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, title: editTitle.trim() } : c))
      );
      setEditingId(null);
      showToast('Conversation renamed', 'success');
    } catch {
      showToast('Failed to rename conversation', 'error');
    }
  };

  const handleDelete = async (convId: string) => {
    if (!confirm('Are you sure you want to permanently delete this conversation?')) return;
    try {
      await chatService.deleteConversation(convId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      showToast('Conversation deleted', 'info');
    } catch {
      showToast('Failed to delete conversation', 'error');
    }
  };

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-white">Conversation History & Archive</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Browse, search, pin, or resume all past conversations with HAIDER AI.
          </p>
        </div>

        <button
          onClick={() => navigate('/chat?new=true')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 transition-all"
        >
          <span>Start New Chat</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
        <input
          type="text"
          placeholder="Search conversation topics or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Conversations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-500">
            Loading conversations...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center space-y-2">
            <MessageSquare className="w-10 h-10 text-slate-700 mx-auto" />
            <p className="text-sm text-slate-400">No conversation history found.</p>
          </div>
        ) : (
          filtered.map((conv) => {
            const isEditing = editingId === conv.id;
            return (
              <div
                key={conv.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    {isEditing ? (
                      <div className="flex items-center gap-1 w-full">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="flex-1 bg-slate-950 text-white px-2 py-1 rounded border border-cyan-500 text-xs focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveRename(conv.id)}
                          className="p-1 text-emerald-400 hover:text-emerald-300"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <h4 className="font-bold text-sm text-white truncate flex-1 group-hover:text-cyan-400 transition-colors">
                        {conv.title}
                      </h4>
                    )}

                    <button
                      onClick={() => handleTogglePin(conv)}
                      className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                        conv.is_pinned
                          ? 'text-cyan-400 bg-cyan-500/10'
                          : 'text-slate-500 hover:text-white'
                      }`}
                      title={conv.is_pinned ? 'Unpin' : 'Pin to top'}
                    >
                      <Pin className={`w-3.5 h-3.5 ${conv.is_pinned ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {conv.last_message || 'Empty conversation'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(conv.updated_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingId(conv.id);
                        setEditTitle(conv.title);
                      }}
                      className="p-1.5 text-slate-400 hover:text-white rounded"
                      title="Rename"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(conv.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => navigate(`/chat?id=${conv.id}`)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium flex items-center gap-1 transition-colors ml-1"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
