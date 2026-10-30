import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bot,
  Sparkles,
  Zap,
  ShieldCheck,
  FileText,
  Mic,
  Code,
  Languages,
  PenTool,
  CheckCircle2,
  ArrowRight,
  Cpu,
  Layers,
  Database
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../components/SocialIcons';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/15 via-blue-600/10 to-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/60 text-xs font-semibold text-cyan-300 mb-8 shadow-inner shadow-cyan-500/10 animate-in fade-in slide-in-from-top-4 duration-500">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>HAIDER AI 1.0 — YOUR INTELLIGENT PERSONAL ASSISTANT</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-tight sm:leading-none">
          Accelerate Your Intellect with{' '}
          <span className="gradient-text">HAIDER AI</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
          A full-stack, enterprise-grade Personal AI Assistant. Featuring real-time streaming chat,
          multimodal document intelligence (RAG), bidirectional voice interactions, 
          specialized productivity tools, and full data privacy.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={isAuthenticated ? '/dashboard' : '/register'}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-base text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all duration-200"
          >
            <span>{isAuthenticated ? 'Open Dashboard' : 'Get Started Free'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-base text-slate-200 bg-slate-900/80 hover:bg-slate-850 border border-slate-800 transition-colors"
          >
            <span>Explore Capabilities</span>
          </a>
        </div>

        {/* Feature Badges */}
        <div className="mt-14 pt-8 border-t border-slate-800/60 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-xs text-slate-400">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Streaming AI Chat</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Document RAG (PDF/DOCX/CSV)</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Voice STT & TTS</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>100% User Data Isolation</span>
          </div>
        </div>
      </section>

      {/* Main Feature Cards */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-xs uppercase tracking-widest font-bold text-cyan-400 mb-3">
            Core Architecture
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineered for Precision, Speed & Privacy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Real-Time Streaming Chat</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Ultra-low latency Server-Sent Events (SSE) token streaming. Full markdown rendering,
              interactive code blocks with syntax highlighting, and conversation branching.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Document Intelligence (RAG)</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Upload PDF, DOCX, TXT, CSV, or XLSX files. Automatic chunking, vector indexing,
              instant executive summaries, and context-grounded question answering.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Interactive Voice Assistant</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Hands-free communication with continuous microphone speech recognition,
              natural speech synthesis playback, and real-time audio soundwave visualizer.
            </p>
          </div>
        </div>
      </section>

      {/* AI Tools Showcase */}
      <section id="tools" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/60">
        <div className="text-center mb-16">
          <h2 className="text-xs uppercase tracking-widest font-bold text-indigo-400 mb-3">
            Productivity Engines
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Specialized AI Power Tools
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <PenTool className="w-8 h-8 text-cyan-400 mb-4" />
            <h4 className="text-lg font-bold text-white mb-1.5">AI Writing Assistant</h4>
            <p className="text-xs text-slate-400">
              Draft professional executive emails, formal business letters, reports, viral captions, and tone rewrites.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <FileText className="w-8 h-8 text-blue-400 mb-4" />
            <h4 className="text-lg font-bold text-white mb-1.5">AI Summarizer</h4>
            <p className="text-xs text-slate-400">
              Condense articles, papers, or dense documents into bullet-point takeaways, TL;DR, and executive briefs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <Languages className="w-8 h-8 text-purple-400 mb-4" />
            <h4 className="text-lg font-bold text-white mb-1.5">Multilingual Translator</h4>
            <p className="text-xs text-slate-400">
              High-fidelity multilingual translation with specialized English and Urdu support with cultural context.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <Code className="w-8 h-8 text-emerald-400 mb-4" />
            <h4 className="text-lg font-bold text-white mb-1.5">AI Coding Assistant</h4>
            <p className="text-xs text-slate-400">
              Debug errors, inspect stack traces, refactor code, and generate production-grade software in any language.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <Bot className="w-8 h-8 text-amber-400 mb-4" />
            <h4 className="text-lg font-bold text-white mb-1.5">AI Study Assistant</h4>
            <p className="text-xs text-slate-400">
              Master complex topics, create interactive MCQ practice quizzes with instant grading, and generate flashcards.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <Sparkles className="w-8 h-8 text-rose-400 mb-4" />
            <h4 className="text-lg font-bold text-white mb-1.5">AI Productivity & Tasks</h4>
            <p className="text-xs text-slate-400">
              Deconstruct ambitious projects into prioritized subtasks with 1-click import into the Task Manager.
            </p>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section id="developer" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/60">
        <div className="max-w-4xl mx-auto p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-950 border border-slate-700/80 shadow-2xl relative">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-cyan-500/25">
              HA
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest font-bold text-cyan-400 mb-1">
                Developer & Architect
              </p>
              <h3 className="text-3xl font-extrabold text-white">Syed Haider Ali</h3>
              <p className="text-sm text-slate-300 mt-2 max-w-xl mx-auto">
                Creator of HAIDER AI. Full-stack software engineer specializing in scalable AI architectures,
                high-performance REST APIs, vector retrieval systems, and responsive modern interfaces.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://github.com/syedhaiderali-0164"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm border border-slate-700 shadow-md transition-all hover:scale-105"
              >
                <GithubIcon className="w-4 h-4 text-cyan-400" />
                <span>GitHub Profile</span>
              </a>
              <a
                href="https://www.linkedin.com/in/haider-ali-1447bb3a/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm shadow-md shadow-blue-500/25 transition-all hover:scale-105"
              >
                <LinkedinIcon className="w-4 h-4" />
                <span>LinkedIn Profile</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Ready to experience your new assistant?
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
          Start for free, configure your favorite AI model, and unlock next-level productivity today.
        </p>
        <div className="mt-8">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-base text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-xl shadow-cyan-500/30 transition-all hover:-translate-y-0.5"
          >
            <span>Launch HAIDER AI</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
