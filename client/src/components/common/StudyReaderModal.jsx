import React, { useEffect, useState } from 'react';
import { 
  X, 
  BookOpen, 
  Code2, 
  HelpCircle, 
  Zap, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Badge } from './Badge';

export function StudyReaderModal({ isOpen, onClose, data, type = 'topic', onToggleComplete, isCompleted }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'code' | 'interview' | 'deepdives'
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  const handleCopyCode = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150 font-sans">
      <div className="w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl border-2 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b-2 border-black/10 bg-[#FAFAF8] flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="purple" size="sm">
                {data.category || 'Architecture'}
              </Badge>
              {data.difficulty && (
                <Badge variant={data.difficulty === 'Hard' ? 'rose' : 'amber'} size="sm">
                  {data.difficulty}
                </Badge>
              )}
              {data.readTime && (
                <span className="text-[11px] font-mono text-black/50 font-medium">
                  • {data.readTime} read
                </span>
              )}
              {data.metrics && (
                <span className="text-[11px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md font-bold">
                  {data.metrics}
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold text-black font-display tracking-tight leading-snug">
              {data.name || data.title}
            </h2>

            {data.description && (
              <p className="text-xs text-black/60 font-medium max-w-2xl leading-relaxed">
                {data.description || data.summary}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-black/50 hover:text-black hover:bg-black/5 transition-colors cursor-pointer flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-black/10 bg-white px-6 gap-6 text-xs font-mono overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 border-b-2 font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-black text-black'
                : 'border-transparent text-black/40 hover:text-black'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Architecture &amp; Core Concepts</span>
          </button>

          {(data.codeSnippet || data.apiDesign || data.databaseSchema) && (
            <button
              onClick={() => setActiveTab('code')}
              className={`py-3.5 border-b-2 font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'code'
                  ? 'border-black text-black'
                  : 'border-transparent text-black/40 hover:text-black'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Implementation &amp; Schema</span>
            </button>
          )}

          {data.deepDives && data.deepDives.length > 0 && (
            <button
              onClick={() => setActiveTab('deepdives')}
              className={`py-3.5 border-b-2 font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'deepdives'
                  ? 'border-black text-black'
                  : 'border-transparent text-black/40 hover:text-black'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Deep Dives &amp; Edge Cases</span>
            </button>
          )}

          {(data.interviewQA || data.interviewTalkingPoints) && (
            <button
              onClick={() => setActiveTab('interview')}
              className={`py-3.5 border-b-2 font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'interview'
                  ? 'border-black text-black'
                  : 'border-transparent text-black/40 hover:text-black'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Interview Defense &amp; Q&amp;A</span>
            </button>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-black/80 leading-relaxed bg-[#FCFCFA]">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Requirements & Scale if available */}
              {data.requirements && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-xs space-y-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-black block">
                      Functional Requirements:
                    </span>
                    <ul className="space-y-1.5 text-xs text-black/70 list-disc list-inside">
                      {data.requirements.functional?.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-xs space-y-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-700 block">
                      Non-Functional Requirements:
                    </span>
                    <ul className="space-y-1.5 text-xs text-black/70 list-disc list-inside">
                      {data.requirements.nonFunctional?.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Capacity Estimations */}
              {data.estimations && (
                <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-xs space-y-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-black block">
                    Capacity Estimations &amp; Math:
                  </span>
                  <div className="font-mono text-xs whitespace-pre-wrap bg-[#F5F5F2] p-3.5 rounded-xl border border-black/5 text-black/80">
                    {data.estimations}
                  </div>
                </div>
              )}

              {/* High-Level Architecture Flow */}
              {data.architecture && (
                <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-xs space-y-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-black block">
                    Step-by-Step High-Level Architecture:
                  </span>
                  <div className="text-xs leading-relaxed whitespace-pre-wrap text-black/80">
                    {data.architecture}
                  </div>
                </div>
              )}

              {/* Theory text from topics */}
              {data.theory && (
                <div className="p-5 rounded-2xl bg-white border border-black/10 shadow-xs space-y-4">
                  <div className="prose prose-xs max-w-none text-xs text-black/80 leading-relaxed whitespace-pre-wrap font-sans">
                    {data.theory}
                  </div>
                </div>
              )}

              {/* Concept text from webdev milestones */}
              {data.concept && (
                <div className="p-5 rounded-2xl bg-white border border-black/10 shadow-xs space-y-4">
                  <div className="text-xs text-black/80 leading-relaxed whitespace-pre-wrap font-sans">
                    {data.concept}
                  </div>
                </div>
              )}

              {/* Key Competencies list */}
              {data.milestones && data.milestones.length > 0 && (
                <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-xs space-y-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-black block">
                    Core Interview Competencies in this Domain:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {data.milestones.map((m, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-[#F4F4F0] border border-black/5 text-xs text-black/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600 flex-shrink-0" />
                        <span className="truncate">{typeof m === 'string' ? m : m.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CODE & SCHEMAS */}
          {activeTab === 'code' && (
            <div className="space-y-6">
              {/* Code Snippet */}
              {data.codeSnippet && (
                <div className="rounded-2xl border-2 border-black overflow-hidden bg-[#1E1E1E] text-white shadow-xs">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-[#141414] border-b border-white/10 text-[11px] font-mono">
                    <span className="text-white/60">Production Implementation</span>
                    <button
                      onClick={() => handleCopyCode(data.codeSnippet)}
                      className="flex items-center gap-1 text-white/60 hover:text-white transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <pre className="p-4 overflow-x-auto text-xs font-mono text-emerald-400 leading-relaxed">
                    <code>{data.codeSnippet}</code>
                  </pre>
                </div>
              )}

              {/* API Design */}
              {data.apiDesign && (
                <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-xs space-y-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-black block">
                    API Contract Design:
                  </span>
                  <pre className="p-4 overflow-x-auto text-xs font-mono bg-[#1E1E1E] text-blue-300 rounded-xl">
                    <code>{data.apiDesign}</code>
                  </pre>
                </div>
              )}

              {/* Database Schema */}
              {data.databaseSchema && (
                <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-xs space-y-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-black block">
                    Database Schema &amp; Storage Layout:
                  </span>
                  <pre className="p-4 overflow-x-auto text-xs font-mono bg-[#1E1E1E] text-amber-300 rounded-xl">
                    <code>{data.databaseSchema}</code>
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DEEP DIVES & BOTTLENECKS */}
          {activeTab === 'deepdives' && data.deepDives && (
            <div className="space-y-4">
              {data.deepDives.map((dd, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-white border border-black/10 shadow-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 font-mono text-xs font-bold flex items-center justify-center border border-amber-200">
                      {idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-black font-display">{dd.title}</h4>
                  </div>
                  <p className="text-xs text-black/70 leading-relaxed pl-8">
                    {dd.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: INTERVIEW Q&A */}
          {activeTab === 'interview' && (
            <div className="space-y-4">
              {data.interviewQA && data.interviewQA.map((qa, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-white border border-black/10 shadow-xs space-y-2.5">
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      Q{idx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-black leading-snug">{qa.q}</h4>
                  </div>
                  <div className="pl-7 text-xs text-black/70 leading-relaxed bg-[#F8F8F5] p-3 rounded-xl border border-black/5">
                    <strong className="text-black block mb-1 font-mono text-[11px]">Model Answer:</strong>
                    {qa.a}
                  </div>
                </div>
              ))}

              {data.interviewTalkingPoints && (
                <div className="p-5 rounded-2xl bg-white border border-black/10 shadow-xs space-y-3">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-black block">
                    Resume &amp; Placement Interview Talking Points:
                  </span>
                  <ul className="space-y-2 text-xs text-black/70 list-disc list-inside">
                    {data.interviewTalkingPoints.map((tp, idx) => (
                      <li key={idx} className="leading-relaxed">{tp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t-2 border-black/10 bg-[#FAFAF8] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onToggleComplete && (
              <button
                type="button"
                onClick={() => onToggleComplete(data.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-2 border-2 transition-all cursor-pointer ${
                  isCompleted
                    ? 'bg-emerald-500 border-emerald-600 text-white'
                    : 'bg-white border-black text-black hover:bg-neutral-100'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isCompleted ? '✓ Completed' : 'Mark as Mastered'}</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white font-mono shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer"
          >
            Close Reader
          </button>
        </div>

      </div>
    </div>
  );
}
