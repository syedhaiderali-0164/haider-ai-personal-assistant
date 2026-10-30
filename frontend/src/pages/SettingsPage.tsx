import React, { useState, useEffect } from 'react';
import {
  Settings,
  Cpu,
  Key,
  Globe,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Eye,
  EyeOff,
  Zap,
  Info
} from 'lucide-react';
import { settingsService } from '../services/settingsService';
import { UserSettings, ConnectionTestResult } from '../types';
import { useToast } from '../context/ToastContext';

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);

  // Form Fields
  const [provider, setProvider] = useState('openai');
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1');
  const [modelName, setModelName] = useState('gpt-4o-mini');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasCustomKey, setHasCustomKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [systemPrompt, setSystemPrompt] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await settingsService.getSettings();
        setProvider(data.api_provider || 'openai');
        setBaseUrl(data.api_base_url || 'https://api.openai.com/v1');
        setModelName(data.model_name || 'gpt-4o-mini');
        setTemperature(data.temperature ?? 0.7);
        setMaxTokens(data.max_tokens || 2048);
        setSystemPrompt(data.system_prompt || '');
        setHasCustomKey(data.has_custom_api_key);
        setMaskedKey(data.api_key_masked || '');
      } catch {
        showToast('Failed to load settings', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleProviderPresetChange = (selected: string) => {
    setProvider(selected);
    setTestResult(null);

    switch (selected) {
      case 'openai':
        setBaseUrl('https://api.openai.com/v1');
        setModelName('gpt-4o-mini');
        break;
      case 'groq':
        setBaseUrl('https://api.groq.com/openai/v1');
        setModelName('llama-3.3-70b-versatile');
        break;
      case 'openrouter':
        setBaseUrl('https://openrouter.ai/api/v1');
        setModelName('meta-llama/llama-3.1-8b-instruct:free');
        break;
      case 'ollama':
        setBaseUrl('http://localhost:11434/v1');
        setModelName('llama3');
        break;
      default:
        break;
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await settingsService.updateSettings({
        api_provider: provider,
        api_base_url: baseUrl.trim(),
        model_name: modelName.trim(),
        api_key: apiKey.trim() ? apiKey.trim() : undefined,
        temperature,
        max_tokens: maxTokens,
        system_prompt: systemPrompt.trim(),
      });
      setHasCustomKey(updated.has_custom_api_key);
      setMaskedKey(updated.api_key_masked);
      setApiKey(''); // clear plain input
      showToast('AI Settings saved successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const result = await settingsService.testConnection({
        api_provider: provider,
        api_base_url: baseUrl.trim(),
        model_name: modelName.trim(),
        api_key: apiKey.trim() ? apiKey.trim() : undefined,
      });
      setTestResult(result);
      if (result.success) {
        showToast('AI Provider Connection Successful!', 'success');
      } else {
        showToast('Connection failed. See details below.', 'error');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Network error reaching test endpoint.',
      });
      showToast('Connection test error', 'error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Cpu className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-extrabold text-white">AI Engine Configuration</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          Connect HAIDER AI to any OpenAI-compatible provider (OpenAI, Groq, OpenRouter, local Ollama, vLLM).
          Credentials are encrypted server-side and never exposed.
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        {/* Provider Preset Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            AI Provider Preset
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'openai', label: 'OpenAI' },
              { id: 'groq', label: 'Groq (Fast)' },
              { id: 'openrouter', label: 'OpenRouter' },
              { id: 'ollama', label: 'Ollama (Local)' },
              { id: 'custom', label: 'Custom' },
            ].map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => handleProviderPresetChange(p.id)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  provider === p.id
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/25'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Base URL and Model Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              API Base URL
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                required
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.openai.com/v1"
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Model Name
            </label>
            <div className="relative">
              <Cpu className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                required
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="gpt-4o-mini, llama-3.3-70b-versatile, etc."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* API Key */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              API Key (Secret)
            </label>
            {hasCustomKey && (
              <span className="text-[11px] text-emerald-400 font-medium">
                Active Key Saved: {maskedKey}
              </span>
            )}
          </div>
          <div className="relative">
            <Key className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={hasCustomKey ? 'Enter new key to replace existing' : 'sk-...'}
              className="w-full pl-10 pr-10 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            *Keys are securely stored server-side with zero frontend logging. Not required for local Ollama.
          </p>
        </div>

        {/* Temperature & Max Tokens Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
              <span>Temperature</span>
              <span className="font-mono text-cyan-400">{temperature}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.5"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <span className="text-[10px] text-slate-500">
              0.0 = Precise & factual, 1.0+ = Creative & exploratory
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
              <span>Max Response Tokens</span>
              <span className="font-mono text-cyan-400">{maxTokens}</span>
            </div>
            <input
              type="range"
              min="256"
              max="8192"
              step="256"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <span className="text-[10px] text-slate-500">
              Maximum token budget per generated response
            </span>
          </div>
        </div>

        {/* System Prompt Customization */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Assistant Persona & System Prompt
          </label>
          <textarea
            rows={3}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full bg-slate-950 text-white text-xs p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 resize-none"
          />
        </div>

        {/* Connection Test Output Card */}
        {testResult && (
          <div
            className={`p-4 rounded-2xl border text-xs flex items-start gap-3 animate-in fade-in ${
              testResult.success
                ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-200'
                : 'bg-rose-950/60 border-rose-800/80 text-rose-200'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold text-sm">
                {testResult.success ? 'Connection Verified' : 'Connection Failed'}
              </p>
              <p className="mt-0.5 leading-relaxed">{testResult.message}</p>
            </div>
          </div>
        )}

        {/* Buttons Row */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {testing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Probing AI Server...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Test AI Connection</span>
              </>
            )}
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save AI Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};
