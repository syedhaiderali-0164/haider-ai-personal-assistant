import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Heart, ShieldCheck, Cpu } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './SocialIcons';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/70 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand Info */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              HAIDER AI
            </span>
          </div>
          <p className="text-sm text-slate-400 max-w-md leading-relaxed">
            Your Intelligent Personal AI Assistant. Engineered for enterprise productivity, 
            multimodal document intelligence, speech synthesis, and next-generation task orchestration.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <a
              href="https://github.com/syedhaiderali-0164"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-colors"
            >
              <GithubIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>syedhaiderali-0164</span>
            </a>
            <a
              href="https://www.linkedin.com/in/haider-ali-1447bb3a/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-colors"
            >
              <LinkedinIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>Syed Haider Ali</span>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Capabilities</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/chat" className="hover:text-cyan-400 transition-colors">Streaming AI Chat</Link></li>
            <li><Link to="/documents" className="hover:text-cyan-400 transition-colors">Document RAG Intelligence</Link></li>
            <li><Link to="/voice" className="hover:text-cyan-400 transition-colors">Interactive Voice Assistant</Link></li>
            <li><Link to="/tools" className="hover:text-cyan-400 transition-colors">AI Writing & Coding Suite</Link></li>
            <li><Link to="/tasks" className="hover:text-cyan-400 transition-colors">Productivity Task Hub</Link></li>
          </ul>
        </div>

        {/* Architecture & About */}
        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Platform</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-cyan-400 transition-colors">About HAIDER AI</Link></li>
            <li><Link to="/settings" className="hover:text-cyan-400 transition-colors">AI Model Configuration</Link></li>
            <li><a href="/#developer" className="hover:text-cyan-400 transition-colors">Developer Profile</a></li>
            <li>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>FastAPI + React 19 Core</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <p className="text-slate-400">
          © {new Date().getFullYear()} <span className="font-semibold text-slate-300">HAIDER AI</span>. All rights reserved.
        </p>
        <p className="flex items-center gap-1.5 text-slate-400 font-medium">
          <span>Developed by</span>
          <a
            href="https://www.linkedin.com/in/haider-ali-1447bb3a/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 underline font-semibold transition-colors"
          >
            Syed Haider Ali
          </a>
        </p>
      </div>
    </footer>
  );
};
