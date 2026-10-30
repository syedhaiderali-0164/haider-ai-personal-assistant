import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Bot,
  MessageSquare,
  FileText,
  Mic,
  Wrench,
  CheckSquare,
  History,
  Settings,
  User,
  Info,
  Plus,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { chatService } from '../services/chatService';
import { Conversation } from '../types';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [recentChats, setRecentChats] = useState<Conversation[]>([]);

  useEffect(() => {
    const loadRecent = async () => {
      try {
        const chats = await chatService.listConversations();
        setRecentChats(chats.slice(0, 5));
      } catch {
        // quiet fallback
      }
    };
    loadRecent();
  }, [location.pathname]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Chat', path: '/chat', icon: MessageSquare },
    { name: 'Document Assistant', path: '/documents', icon: FileText },
    { name: 'Voice Assistant', path: '/voice', icon: Mic },
    { name: 'AI Tools', path: '/tools', icon: Wrench },
    { name: 'Task Manager', path: '/tasks', icon: CheckSquare },
    { name: 'Chat History', path: '/history', icon: History },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'User Profile', path: '/profile', icon: User },
    { name: 'About HAIDER AI', path: '/about', icon: Info },
  ];

  const handleNewChat = () => {
    navigate('/chat?new=true');
    if (onCloseMobile) onCloseMobile();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen transition-all duration-300 ease-in-out border-r border-slate-800/80 bg-slate-950/95 flex flex-col justify-between ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header & Logo */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/60">
            <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
                <Bot className="w-6 h-6 text-white" />
              </div>
              {!collapsed && (
                <div className="leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-lg tracking-tight text-white">
                      HAIDER AI
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                      v1.0
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">
                    by Syed Haider Ali
                  </span>
                </div>
              )}
            </NavLink>

            {/* Collapse toggle (desktop only) */}
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 transition-colors"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* New Chat Primary Action */}
          <div className="p-3">
            <button
              onClick={handleNewChat}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all duration-200 ${
                collapsed ? 'px-0' : ''
              }`}
              title="Start New Chat"
            >
              <Plus className="w-4 h-4 shrink-0" />
              {!collapsed && <span>New Chat</span>}
            </button>
          </div>

          {/* Nav Items */}
          <nav className="px-3 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-320px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25'
                        : 'text-slate-400 hover:text-white hover:bg-slate-850/60'
                    } ${collapsed ? 'justify-center px-0' : ''}`
                  }
                  title={collapsed ? item.name : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </NavLink>
              );
            })}

            {/* Recent Conversations Snippet */}
            {!collapsed && recentChats.length > 0 && (
              <div className="pt-4 pb-2">
                <div className="flex items-center justify-between px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  <span>Recent Chats</span>
                  <NavLink to="/history" className="text-cyan-400 hover:underline">View All</NavLink>
                </div>
                <div className="space-y-0.5">
                  {recentChats.map((chat) => (
                    <NavLink
                      key={chat.id}
                      to={`/chat?id=${chat.id}`}
                      onClick={onCloseMobile}
                      className="block px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900 truncate transition-colors"
                      title={chat.title}
                    >
                      {chat.title}
                    </NavLink>
                  ))}
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* User Card & Controls at Bottom */}
        <div className="p-3 border-t border-slate-800/60 bg-slate-950">
          {!collapsed ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800/80">
              <NavLink to="/profile" className="flex items-center gap-2.5 overflow-hidden flex-1">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {user?.full_name ? user.full_name[0].toUpperCase() : 'H'}
                </div>
                <div className="truncate text-left leading-tight">
                  <div className="text-xs font-semibold text-white truncate">
                    {user?.full_name || 'Haider AI User'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {user?.email || ''}
                  </div>
                </div>
              </NavLink>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={toggleTheme}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  title="Toggle Theme"
                >
                  {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

