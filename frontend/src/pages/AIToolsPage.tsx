import React, { useState } from 'react';
import {
  PenTool,
  FileText,
  Languages,
  Code,
  GraduationCap,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  ListPlus,
  Play,
  RotateCcw
} from 'lucide-react';
import { toolsService } from '../services/toolsService';
import { taskService } from '../services/taskService';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { useToast } from '../context/ToastContext';

type ToolTab = 'writing' | 'summarizer' | 'translator' | 'coding' | 'study' | 'productivity';

export const AIToolsPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<ToolTab>('writing');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // 1. Writing form state
  const [writingCategory, setWritingCategory] = useState('email');
  const [writingContent, setWritingContent] = useState('');
  const [writingTone, setWritingTone] = useState('professional');
  const [writingAudience, setWritingAudience] = useState('Executive Leadership');

  // 2. Summarizer form state
  const [summarizerText, setSummarizerText] = useState('');
  const [summarizerType, setSummarizerType] = useState('bullet_points');
  const [summarizerLength, setSummarizerLength] = useState('medium');

  // 3. Translator form state
  const [translateText, setTranslateText] = useState('');
  const [targetLang, setTargetLang] = useState('Urdu');
  const [sourceLang, setSourceLang] = useState('English');

  // 4. Coding form state
  const [codingAction, setCodingAction] = useState('explain');
  const [codingPrompt, setCodingPrompt] = useState('');
  const [codingLang, setCodingLang] = useState('python');
  const [codingError, setCodingError] = useState('');

  // 5. Study form state
  const [studyAction, setStudyAction] = useState('mcq_quiz');
  const [studyTopic, setStudyTopic] = useState('');
  const [studyLevel, setStudyLevel] = useState('intermediate');
  const [studyCount, setStudyCount] = useState(5);

  // 6. Productivity form state
  const [prodAction, setProdAction] = useState('breakdown_project');
  const [prodGoal, setProdGoal] = useState('');
  const [prodHours, setProdHours] = useState(8);

  const handleCopyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuteTool = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      if (activeTab === 'writing') {
        const res = await toolsService.runWritingTool({
          category: writingCategory,
          topic_or_content: writingContent,
          tone: writingTone,
          audience: writingAudience,
        });
        setResult(res.result);
      } else if (activeTab === 'summarizer') {
        const res = await toolsService.runSummarizerTool({
          content: summarizerText,
          summary_type: summarizerType,
          length: summarizerLength,
        });
        setResult(res.result);
      } else if (activeTab === 'translator') {
        const res = await toolsService.runTranslatorTool({
          text: translateText,
          target_language: targetLang,
          source_language: sourceLang,
        });
        setResult(res.result);
      } else if (activeTab === 'coding') {
        const res = await toolsService.runCodingTool({
          action: codingAction,
          code_or_prompt: codingPrompt,
          language: codingLang,
          error_message: codingError || undefined,
        });
        setResult(res.result);
      } else if (activeTab === 'study') {
        const res = await toolsService.runStudyTool({
          action: studyAction,
          topic: studyTopic,
          difficulty_level: studyLevel,
          num_questions: studyCount,
        });
        setResult(res.result);
      } else if (activeTab === 'productivity') {
        const res = await toolsService.runProductivityTool({
          action: prodAction,
          goals_or_project: prodGoal,
          available_hours: prodHours,
        });
        setResult(res.result);
      }
    } catch (err: any) {
      showToast(err.message || 'Tool execution failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Import AI Tasks into Task Manager
  const handleImportTasksToManager = async () => {
    if (!result) return;
    // Extract task bullet points or lines
    const lines = result
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('-') || l.startsWith('*') || /^\d+\./.test(l));

    const tasksToCreate = lines.slice(0, 8).map((line) => {
      const cleanTitle = line.replace(/^[-*]|\d+\.\s*/, '').trim();
      return {
        title: cleanTitle.slice(0, 100),
        description: `Imported from HAIDER AI Productivity Assistant (${prodGoal})`,
        priority: 'high' as const,
        status: 'todo' as const,
        tags: 'AI-Generated,Productivity',
      };
    });

    if (tasksToCreate.length === 0) {
      showToast('No bulleted tasks found in output to import.', 'info');
      return;
    }

    try {
      await taskService.batchCreateTasks(tasksToCreate);
      showToast(`Successfully imported ${tasksToCreate.length} tasks into Task Manager!`, 'success');
    } catch {
      showToast('Failed to import tasks', 'error');
    }
  };

  const tabs = [
    { id: 'writing', label: 'AI Writing', icon: PenTool },
    { id: 'summarizer', label: 'AI Summarizer', icon: FileText },
    { id: 'translator', label: 'AI Translator', icon: Languages },
    { id: 'coding', label: 'Coding Assistant', icon: Code },
    { id: 'study', label: 'Study Assistant', icon: GraduationCap },
    { id: 'productivity', label: 'Productivity', icon: Sparkles },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-white">AI Power Tools Suite</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Specialized intelligent workflows configured for high-impact writing, translation, programming, learning, and planning.
          </p>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as ToolTab);
                setResult(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Two Column Grid: Inputs & Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tool Parameters Form */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-lg">
          <form onSubmit={handleExecuteTool} className="space-y-4">
            {/* 1. WRITING ASSISTANT */}
            {activeTab === 'writing' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <select
                      value={writingCategory}
                      onChange={(e) => setWritingCategory(e.target.value)}
                      className="w-full bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="email">Professional Email</option>
                      <option value="letter">Formal Business Letter</option>
                      <option value="report">Executive Report</option>
                      <option value="social_caption">Social Media Caption</option>
                      <option value="rewrite">Content Rewriting</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Tone
                    </label>
                    <select
                      value={writingTone}
                      onChange={(e) => setWritingTone(e.target.value)}
                      className="w-full bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="professional">Professional & Polished</option>
                      <option value="persuasive">Persuasive & Compelling</option>
                      <option value="casual">Casual & Friendly</option>
                      <option value="urgent">Urgent & Direct</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={writingAudience}
                    onChange={(e) => setWritingAudience(e.target.value)}
                    placeholder="e.g., C-Suite, Investors, Clients, General Public"
                    className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Topic, Context or Draft to Rewrite
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={writingContent}
                    onChange={(e) => setWritingContent(e.target.value)}
                    placeholder="Describe what you want to write or paste your draft here..."
                    className="w-full bg-slate-950 text-white text-xs p-3.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>
              </>
            )}

            {/* 2. SUMMARIZER */}
            {activeTab === 'summarizer' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Format
                    </label>
                    <select
                      value={summarizerType}
                      onChange={(e) => setSummarizerType(e.target.value)}
                      className="w-full bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="bullet_points">Key Points (Bullets)</option>
                      <option value="executive">Executive Summary</option>
                      <option value="tldr">TL;DR</option>
                      <option value="one_sentence">One Sentence Punchline</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Length
                    </label>
                    <select
                      value={summarizerLength}
                      onChange={(e) => setSummarizerLength(e.target.value)}
                      className="w-full bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="short">Concise (1-2 min read)</option>
                      <option value="medium">Standard (Balanced)</option>
                      <option value="detailed">In-depth Analysis</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Text / Content to Summarize
                  </label>
                  <textarea
                    rows={8}
                    required
                    value={summarizerText}
                    onChange={(e) => setSummarizerText(e.target.value)}
                    placeholder="Paste article, transcript, notes or report to summarize..."
                    className="w-full bg-slate-950 text-white text-xs p-3.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>
              </>
            )}

            {/* 3. TRANSLATOR */}
            {activeTab === 'translator' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Source Language
                    </label>
                    <select
                      value={sourceLang}
                      onChange={(e) => setSourceLang(e.target.value)}
                      className="w-full bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="English">English</option>
                      <option value="Urdu">Urdu (اردو)</option>
                      <option value="Auto-detect">Auto-detect</option>
                      <option value="Arabic">Arabic (العربية)</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Japanese">Japanese</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Target Language
                    </label>
                    <select
                      value={targetLang}
                      onChange={(e) => setTargetLang(e.target.value)}
                      className="w-full bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Urdu">Urdu (اردو)</option>
                      <option value="English">English</option>
                      <option value="Arabic">Arabic (العربية)</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Japanese">Japanese</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Text to Translate
                  </label>
                  <textarea
                    rows={8}
                    required
                    value={translateText}
                    onChange={(e) => setTranslateText(e.target.value)}
                    placeholder="Enter or paste text to translate..."
                    className="w-full bg-slate-950 text-white text-xs p-3.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>
              </>
            )}

            {/* 4. CODING ASSISTANT */}
            {activeTab === 'coding' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Action
                    </label>
                    <select
                      value={codingAction}
                      onChange={(e) => setCodingAction(e.target.value)}
                      className="w-full bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="explain">Explain Code</option>
                      <option value="debug">Debug & Fix Bug</option>
                      <option value="improve">Refactor & Optimize</option>
                      <option value="generate">Generate Code</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Language
                    </label>
                    <select
                      value={codingLang}
                      onChange={(e) => setCodingLang(e.target.value)}
                      className="w-full bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="python">Python</option>
                      <option value="typescript">TypeScript / JavaScript</option>
                      <option value="sql">SQL</option>
                      <option value="bash">Bash / Shell</option>
                      <option value="rust">Rust</option>
                      <option value="go">Go</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                    </select>
                  </div>
                </div>

                {codingAction === 'debug' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Error Message / Stack Trace (Optional)
                    </label>
                    <input
                      type="text"
                      value={codingError}
                      onChange={(e) => setCodingError(e.target.value)}
                      placeholder="e.g., TypeError: Cannot read properties of undefined..."
                      className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Code Snippet or Prompt
                  </label>
                  <textarea
                    rows={7}
                    required
                    value={codingPrompt}
                    onChange={(e) => setCodingPrompt(e.target.value)}
                    placeholder="Paste code to explain/debug or prompt for generation..."
                    className="w-full bg-slate-950 font-mono text-white text-xs p-3.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>
              </>
            )}

            {/* 5. STUDY ASSISTANT */}
            {activeTab === 'study' && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Action
                    </label>
                    <select
                      value={studyAction}
                      onChange={(e) => setStudyAction(e.target.value)}
                      className="w-full bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="mcq_quiz">Interactive MCQ Quiz</option>
                      <option value="explain_topic">Explain Topic (ELI5)</option>
                      <option value="study_notes">Structured Notes</option>
                      <option value="flashcards">Flashcards</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Difficulty
                    </label>
                    <select
                      value={studyLevel}
                      onChange={(e) => setStudyLevel(e.target.value)}
                      className="w-full bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="academic">Academic / Expert</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Questions
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={studyCount}
                      onChange={(e) => setStudyCount(parseInt(e.target.value) || 5)}
                      className="w-full bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Topic / Concept
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={studyTopic}
                    onChange={(e) => setStudyTopic(e.target.value)}
                    placeholder="e.g., Photosynthesis, Transformer neural network architecture, Monetary policy..."
                    className="w-full bg-slate-950 text-white text-xs p-3.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>
              </>
            )}

            {/* 6. PRODUCTIVITY ASSISTANT */}
            {activeTab === 'productivity' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Action
                    </label>
                    <select
                      value={prodAction}
                      onChange={(e) => setProdAction(e.target.value)}
                      className="w-full bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="breakdown_project">Break Down Project Into Tasks</option>
                      <option value="daily_plan">Generate Daily Plan</option>
                      <option value="smart_reminders">Smart Reminders & Milestones</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Available Time (Hours)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={24}
                      value={prodHours}
                      onChange={(e) => setProdHours(parseFloat(e.target.value) || 8)}
                      className="w-full bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Goals, Project Objective or Daily Schedule
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={prodGoal}
                    onChange={(e) => setProdGoal(e.target.value)}
                    placeholder="e.g., Build and launch an AI SaaS personal assistant application with frontend, backend, and documentation..."
                    className="w-full bg-slate-950 text-white text-xs p-3.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Generating with HAIDER AI...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Execute AI Workflow</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output Panel */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Output</span>
              </h3>

              {result && (
                <div className="flex items-center gap-2">
                  {activeTab === 'productivity' && (
                    <button
                      onClick={handleImportTasksToManager}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/40 text-xs font-semibold transition-colors border border-emerald-500/30"
                      title="Import these tasks directly into Task Manager"
                    >
                      <ListPlus className="w-3.5 h-3.5" />
                      <span>Import into Task Manager</span>
                    </button>
                  )}

                  <button
                    onClick={handleCopyResult}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-8 h-8 mx-auto border-3 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-400">Synthesizing intelligence...</p>
              </div>
            ) : result ? (
              <div className={`p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 max-h-[500px] overflow-y-auto ${
                activeTab === 'translator' && targetLang === 'Urdu' ? 'font-serif text-right text-base leading-loose' : ''
              }`}>
                <MarkdownRenderer content={result} />
              </div>
            ) : (
              <div className="py-24 text-center text-xs text-slate-500 space-y-2">
                <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
                <p>Configure parameters on the left and click Execute to generate results.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

