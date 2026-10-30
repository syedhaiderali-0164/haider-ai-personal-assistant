import React from 'react';
import { Menu, Bot, Sparkles, Settings as SettingsIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface TopHeaderProps {
  onOpenMobileMenu?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenMobileMenu }) => {
  const location = useLocation();

  const getPageTitle = (path: string) => {
    if (path.startsWith('/chat')) return 'AI Chat Workspace';
    if (path.startsWith('/documents')) return 'Document Intelligence (RAG)';
    if (path.startsWith('/voice')) return 'Interactive Voice Assistant';
    if (path.startsWith('/tools')) return 'AI Productivity & Writing Suite';
    if (path.startsWith('/tasks')) return 'Task Management Hub';
    if (path.startsWith('/history')) return 'Conversation History';
    if (path.startsWith('/settings')) return 'AI Model & System Settings';
    if (path.startsWith('/profile')) return 'User Account & Profile';
    if (path.startsWith('/about')) return 'About HAIDER AI';
    return 'Dashboard Overview';
  };

  return (
    <header className="sticky top-0 z-30 h-16 glass-panel border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 md:hidden transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page Title */}
        <div>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>{getPageTitle(location.pathname)}</span>
          </h1>
        </div>
      </div>

      {/* Right status indicators */}
      <div className="flex items-center gap-3">
        {/* Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300 font-medium">HAIDER AI Engine Online</span>
        </div>

        {/* Quick Settings Link */}
        <Link
          to="/settings"
          className="p-2 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-850 transition-colors"
          title="AI Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
};

