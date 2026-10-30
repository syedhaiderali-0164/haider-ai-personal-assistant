import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Upload,
  Search,
  Sparkles,
  Trash2,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  File,
  HelpCircle,
  FileSpreadsheet,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { documentService } from '../services/documentService';
import { DocumentItem, DocumentQueryResponse } from '../types';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { useToast } from '../context/ToastContext';

export const DocumentAssistantPage: React.FC = () => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Q&A state
  const [queryPrompt, setQueryPrompt] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState<DocumentQueryResponse | null>(null);

  // Summarize state
  const [summaryMode, setSummaryMode] = useState<'executive' | 'key_points' | 'eli5' | 'comprehensive'>('executive');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [activeSummary, setActiveSummary] = useState<string | null>(null);

  const loadDocuments = async () => {
    try {
      const list = await documentService.listDocuments();
      setDocuments(list);
      if (list.length > 0 && !selectedDocId) {
        setSelectedDocId(list[0].id);
        setActiveSummary(list[0].summary || null);
      }
    } catch {
      showToast('Failed to load documents', 'error');
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const newDoc = await documentService.uploadDocument(file);
      showToast(`Document "${file.name}" indexed successfully!`, 'success');
      await loadDocuments();
      setSelectedDocId(newDoc.id);
      setActiveSummary(newDoc.summary || null);
    } catch (err: any) {
      showToast(err.message || 'File upload failed', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteDocument = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await documentService.deleteDocument(id);
      showToast('Document deleted', 'info');
      if (selectedDocId === id) {
        setSelectedDocId(null);
        setActiveSummary(null);
        setQueryResult(null);
      }
      loadDocuments();
    } catch {
      showToast('Failed to delete document', 'error');
    }
  };

  const handleSelectDoc = (doc: DocumentItem) => {
    setSelectedDocId(doc.id);
    setActiveSummary(doc.summary || null);
    setQueryResult(null);
  };

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryPrompt.trim()) return;

    setIsQuerying(true);
    try {
      const res = await documentService.queryDocuments({
        query: queryPrompt.trim(),
        document_ids: selectedDocId ? [selectedDocId] : undefined,
        top_k: 4,
      });
      setQueryResult(res);
    } catch (err: any) {
      showToast(err.message || 'Query failed', 'error');
    } finally {
      setIsQuerying(false);
    }
  };

  const handleGenerateSummary = async (mode: 'executive' | 'key_points' | 'eli5' | 'comprehensive') => {
    if (!selectedDocId) return;
    setIsSummarizing(true);
    setSummaryMode(mode);
    try {
      const res = await documentService.summarizeDocument(selectedDocId, mode);
      setActiveSummary(res.summary);
      showToast(`Generated ${mode.replace('_', ' ')} summary!`, 'success');
      loadDocuments();
    } catch (err: any) {
      showToast(err.message || 'Failed to generate summary', 'error');
    } finally {
      setIsSummarizing(false);
    }
  };

  const selectedDoc = documents.find((d) => d.id === selectedDocId);

  const getFileIcon = (type: string) => {
    if (['xlsx', 'xls', 'csv'].includes(type.toLowerCase())) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    }
    return <FileText className="w-5 h-5 text-cyan-400" />;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-white">Document Intelligence (RAG)</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Upload PDFs, Word docs, spreadsheets, or text files. Chunked and indexed for high-precision semantic Q&A.
          </p>
        </div>

        {/* Upload Button */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.docx,.doc,.txt,.csv,.xlsx,.xls"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Parsing & Indexing...' : 'Upload Document'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Document List */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Your Documents ({documents.length})</span>
            <span className="text-[10px] text-slate-500">PDF, DOCX, CSV, XLSX, TXT</span>
          </h3>

          {loadingDocs ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
              <Upload className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No documents uploaded yet.</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-cyan-400 font-semibold hover:underline"
              >
                Upload your first file
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => {
                const isSelected = doc.id === selectedDocId;
                return (
                  <div
                    key={doc.id}
                    onClick={() => handleSelectDoc(doc)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-500/40 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate mr-2">
                      <div className="shrink-0">{getFileIcon(doc.file_type)}</div>
                      <div className="truncate text-left">
                        <div className="text-xs font-semibold text-white truncate">
                          {doc.original_name}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="uppercase">{doc.file_type}</span>
                          <span>•</span>
                          <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                          <span>•</span>
                          <span>{doc.chunk_count} chunks</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDocument(doc.id, doc.original_name);
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Q&A and Document Insights */}
        <div className="lg:col-span-2 space-y-6">
          {selectedDoc ? (
            <>
              {/* Document Header & Summary Controls */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{selectedDoc.original_name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                        Indexed
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Uploaded {new Date(selectedDoc.created_at).toLocaleDateString()} • {selectedDoc.chunk_count} semantic segments
                    </p>
                  </div>

                  {/* Summary Mode Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(['executive', 'key_points', 'eli5', 'comprehensive'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => handleGenerateSummary(mode)}
                        disabled={isSummarizing}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                          summaryMode === mode
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {mode === 'key_points' ? 'Key Points' : mode.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary View */}
                {isSummarizing ? (
                  <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating {summaryMode.replace('_', ' ')} summary...</span>
                  </div>
                ) : activeSummary ? (
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Document Summary</span>
                    </h4>
                    <MarkdownRenderer content={activeSummary} />
                  </div>
                ) : null}
              </div>

              {/* Document Q&A Console */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <HelpCircle className="w-4 h-4 text-cyan-400" />
                  <span>Ask Questions About This Document</span>
                </div>

                <form onSubmit={handleQuery} className="flex gap-2">
                  <input
                    type="text"
                    value={queryPrompt}
                    onChange={(e) => setQueryPrompt(e.target.value)}
                    placeholder="e.g., What are the key financial metrics, main arguments, or action items?"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={isQuerying || !queryPrompt.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-md shadow-cyan-500/20 disabled:opacity-40 transition-all flex items-center gap-1.5 shrink-0"
                  >
                    {isQuerying ? (
                      <span>Searching...</span>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>Query</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Query Result Card */}
                {queryResult && (
                  <div className="mt-4 p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2">
                      <span className="font-semibold text-slate-200">Answer</span>
                      <span>Sources: {queryResult.sources.join(', ')}</span>
                    </div>

                    <MarkdownRenderer content={queryResult.answer} />

                    {/* Excerpt context chunks */}
                    {queryResult.relevant_chunks.length > 0 && (
                      <div className="pt-3 border-t border-slate-800/60">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                          Retrieved Context Chunks ({queryResult.relevant_chunks.length})
                        </span>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                          {queryResult.relevant_chunks.map((chunk, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono"
                            >
                              {chunk.slice(0, 200)}...
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-semibold text-white">Select a document</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select an indexed document on the left or upload a new PDF, DOCX, CSV, or XLSX file to query and summarize.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
