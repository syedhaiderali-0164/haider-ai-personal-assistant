import React from 'react';
import {
  Bot,
  ShieldCheck,
  Cpu,
  Layers,
  Database,
  Code2,
  Sparkles,
  Zap,
  Globe,
  Award
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../components/SocialIcons';

export const AboutPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-12 animate-in fade-in duration-300">
      {/* Brand Hero */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-cyan-500/25">
          <Bot className="w-9 h-9" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
            FLAGSHIP PORTFOLIO SYSTEM
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-1">
            About <span className="gradient-text">HAIDER AI</span>
          </h1>
          <p className="text-base text-slate-300 mt-2 max-w-2xl mx-auto">
            Your Intelligent Personal AI Assistant — engineered to serve as an ultra-fast, 
            multimodal cognitive extension for modern professionals, engineers, and creators.
          </p>
        </div>
      </div>

      {/* Developer Spotlight Card */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-700/80 shadow-2xl relative">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
          <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-extrabold shadow-xl shadow-cyan-500/25 shrink-0">
            HA
          </div>

          <div className="space-y-4 text-center sm:text-left flex-1">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-cyan-400">
                  DEVELOPED & ARCHITECTED BY
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
                Syed Haider Ali
              </h2>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Syed Haider Ali is a software engineer passionate about cutting-edge artificial intelligence, 
              distributed backend services, and sleek human-computer interfaces. HAIDER AI was designed and built 
              from first principles to demonstrate commercial-grade full-stack architecture, high-concurrency streaming, 
              robust multi-tenant database isolation, and production-ready code design.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <a
                href="https://github.com/syedhaiderali-0164"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold border border-slate-700 shadow-md transition-all hover:scale-105"
              >
                <GithubIcon className="w-4 h-4 text-cyan-400" />
                <span>GitHub: syedhaiderali-0164</span>
              </a>
              <a
                href="https://www.linkedin.com/in/haider-ali-1447bb3a/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/25 transition-all hover:scale-105"
              >
                <LinkedinIcon className="w-4 h-4" />
                <span>LinkedIn: Syed Haider Ali</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack Specs */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            TECHNOLOGY & ARCHITECTURE
          </h3>
          <p className="text-2xl font-extrabold text-white mt-1">Built With Modern Enterprise Standards</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Frontend Spec */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <Code2 className="w-6 h-6 text-cyan-400" />
              <h4 className="text-base font-bold text-white">Frontend Architecture</h4>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>• <span className="font-semibold text-white">React 19 & TypeScript:</span> Strongly typed modern functional UI with hooks & contexts.</li>
              <li>• <span className="font-semibold text-white">Vite 8:</span> Next-generation ultra-fast bundler and dev server.</li>
              <li>• <span className="font-semibold text-white">Tailwind CSS:</span> Dark navy cyber aesthetic with custom glassmorphism and accents.</li>
              <li>• <span className="font-semibold text-white">Lucide Icons:</span> Consistent, crisp icons throughout the dashboard.</li>
              <li>• <span className="font-semibold text-white">Streaming SSE:</span> TextDecoder streaming parser for real-time word-by-word token delivery.</li>
              <li>• <span className="font-semibold text-white">Web Speech API:</span> Low-latency speech recognition & voice synthesis.</li>
            </ul>
          </div>

          {/* Backend Spec */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <Cpu className="w-6 h-6 text-indigo-400" />
              <h4 className="text-base font-bold text-white">Backend Architecture</h4>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>• <span className="font-semibold text-white">Python 3.12 & FastAPI:</span> High-throughput async REST API endpoints.</li>
              <li>• <span className="font-semibold text-white">SQLAlchemy 2.0 ORM:</span> Async engine supporting PostgreSQL and SQLite fallback.</li>
              <li>• <span className="font-semibold text-white">Alembic:</span> Automated, safe relational database migrations.</li>
              <li>• <span className="font-semibold text-white">JWT & Password Hashing:</span> Argon2 / bcrypt cryptography with strict token lifecycles.</li>
              <li>• <span className="font-semibold text-white">RAG Engine:</span> Multimodal parsing (PDF, DOCX, CSV, XLSX) + recursive text chunking & vector search.</li>
              <li>• <span className="font-semibold text-white">User Data Isolation:</span> Strict tenant boundary enforcement across all queries.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Brand Mission */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
        <Sparkles className="w-8 h-8 text-cyan-400 mx-auto" />
        <h4 className="text-lg font-bold text-white">The HAIDER AI Vision</h4>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Artificial Intelligence should feel like a superpower that you control completely. 
          HAIDER AI empowers you with private document intelligence, voice interactions, 
          writing prowess, code assistance, and task execution — built with security, elegance, and reliability.
        </p>
      </div>
    </div>
  );
};
