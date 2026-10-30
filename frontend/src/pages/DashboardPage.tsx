import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bot,
  MessageSquare,
  FileText,
  Mic,
  CheckSquare,
  Wrench,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  Settings,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { chatService } from '../services/chatService';
import { taskService } from '../services/taskService';
import { settingsService } from '../services/settingsService';
import { Conversation, TaskItem, UserSettings } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_conversations: 0,
    total_messages: 0,
    total_documents: 0,
    total_tasks: 0,
    completed_tasks: 0,
  });
  const [recentChats, setRecentChats] = useState<Conversation[]>([]);
  const [recentTasks, setRecentTasks] = useState<TaskItem[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsData, chatsData, tasksData, stData] = await Promise.allSettled([
          authService.getUserStats(),
          chatService.listConversations(),
          taskService.listTasks({ status: 'todo' }),
          settingsService.getSettings(),
        ]);

        if (statsData.status === 'fulfilled') setStats(statsData.value);
        if (chatsData.status === 'fulfilled') setRecentChats(chatsData.value.slice(0, 4));
        if (tasksData.status === 'fulfilled') setRecentTasks(tasksData.value.slice(0, 4));
        if (stData.status === 'fulfilled') setUserSettings(stData.value);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>HAIDER AI EXECUTIVE DASHBOARD</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.full_name || 'Haider AI User'}!
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Your personalized AI system is fully operational. How would you like to accelerate your productivity today?
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/chat?new=true')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Start New Chat</span>
            </button>
            <Link
              to="/documents"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 transition-colors"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Upload Docs</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between mb-3 text-cyan-400">
            <MessageSquare className="w-5 h-5" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Chats</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{stats.total_conversations}</div>
          <p className="text-xs text-slate-400 mt-1">Active AI conversations</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between mb-3 text-blue-400">
            <TrendingUp className="w-5 h-5" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Messages</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{stats.total_messages}</div>
          <p className="text-xs text-slate-400 mt-1">Prompts & AI responses</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between mb-3 text-indigo-400">
            <FileText className="w-5 h-5" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Documents</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{stats.total_documents}</div>
          <p className="text-xs text-slate-400 mt-1">Indexed in RAG store</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between mb-3 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tasks Done</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{stats.completed_tasks}</div>
          <p className="text-xs text-slate-400 mt-1">Out of {stats.total_tasks} total tasks</p>
        </div>
      </div>

      {/* Quick Launchpad Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
          Quick Launch Capabilities
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/chat"
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900 transition-all group flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">
                <span>AI Chat Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Stream real-time answers with context retention, markdown and code blocks.
              </p>
            </div>
          </Link>

          <Link
            to="/documents"
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-900 transition-all group flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                <span>Document Intelligence</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Upload PDFs, DOCX, XLSX files and query specific sections via RAG.
              </p>
            </div>
          </Link>

          <Link
            to="/voice"
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900 transition-all group flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">
                <span>Interactive Voice Mode</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Speak with HAIDER AI hands-free using speech-to-text and audio synthesis.
              </p>
            </div>
          </Link>

          <Link
            to="/tools"
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 hover:bg-slate-900 transition-all group flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-white text-sm group-hover:text-purple-400 transition-colors">
                <span>AI Productivity Suite</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Writing, Summarizer, Multilingual Translator (Urdu & English), Coding, Study.
              </p>
            </div>
          </Link>

          <Link
            to="/tasks"
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900 transition-all group flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">
                <span>Task Manager</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Manage personal priorities, deadlines, and imported AI task breakdowns.
              </p>
            </div>
          </Link>

          <Link
            to="/settings"
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900 transition-all group flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">
                <span>Model Settings</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Configure OpenAI, Groq, Ollama endpoints and test live connectivity.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Two Column Section: Recent Chats & Active Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Conversations */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>Recent Conversations</span>
            </h4>
            <Link to="/history" className="text-xs text-cyan-400 hover:underline">
              View All
            </Link>
          </div>

          {recentChats.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No conversations yet. Start a new chat to begin!
            </div>
          ) : (
            <div className="space-y-2">
              {recentChats.map((chat) => (
                <Link
                  key={chat.id}
                  to={`/chat?id=${chat.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 transition-colors"
                >
                  <div className="truncate mr-3">
                    <div className="font-semibold text-xs text-white truncate">{chat.title}</div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {chat.last_message || 'No messages yet'}
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Pending Tasks */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <span>Pending Tasks</span>
            </h4>
            <Link to="/tasks" className="text-xs text-emerald-400 hover:underline">
              Manage Tasks
            </Link>
          </div>

          {recentTasks.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No pending tasks. You are all caught up!
            </div>
          ) : (
            <div className="space-y-2">
              {recentTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                >
                  <div className="truncate mr-2">
                    <span className="font-medium text-slate-200">{t.title}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                      t.priority === 'urgent'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : t.priority === 'high'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

