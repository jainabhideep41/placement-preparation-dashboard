import React from 'react';
import { 
  Brain, 
  ArrowUpRight, 
  Plus, 
  BarChart3, 
  ShieldCheck, 
  Check
} from 'lucide-react';

export function SpacedRepetitionCard({ 
  dueRevisions = [], 
  metrics = {}, 
  onNavigate 
}) {
  const easy = metrics?.easy || 0;
  const medium = metrics?.medium || 0;
  const hard = metrics?.hard || 0;
  const total = easy + medium + hard || 1;

  const easyPct = Math.round((easy / total) * 100);
  const medPct = Math.round((medium / total) * 100);
  const hardPct = Math.max(0, 100 - easyPct - medPct);

  // 5-Stage Ebbinghaus Retention Pipeline steps
  const retentionStages = [
    { label: 'Day 1', status: 'cleared', desc: 'Immediate Recall' },
    { label: 'Day 3', status: 'cleared', desc: 'Short-term Lock' },
    { label: 'Day 7', status: 'cleared', desc: 'Consolidation' },
    { label: 'Day 14', status: 'upcoming', desc: 'Scheduled' },
    { label: 'Day 30', status: 'locked', desc: 'Permanent Memory' }
  ];

  return (
    <div className="rounded-2xl bg-white border border-gray-200/90 shadow-xs p-5 lg:p-6 space-y-5 flex flex-col justify-between transition-all">
      
      {/* 1. Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold shadow-xs">
              <Brain className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900 tracking-tight font-display">
                  Spaced Repetition & Retention
                </h3>
              </div>
              <p className="text-[11px] text-gray-500">
                Ebbinghaus cognitive retention curve (1d → 3d → 7d → 14d → 30d)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('dsa')}
            className="text-xs font-mono font-bold text-gray-900 hover:underline flex items-center gap-1 group flex-shrink-0"
          >
            <span>Tracker</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* 2. Main Body: Due Queue or Calibrated Retention Pipeline */}
        <div className="pt-3">
          {dueRevisions && dueRevisions.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-gray-500 pb-1">
                <span className="font-bold text-amber-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>{dueRevisions.length} Problems Due for Review</span>
                </span>
                <span>Interval</span>
              </div>

              {dueRevisions.slice(0, 3).map((prob) => (
                <div 
                  key={prob.id} 
                  onClick={() => onNavigate && onNavigate('dsa')}
                  className="group p-3 rounded-xl bg-white hover:bg-neutral-50/60 border border-gray-200 hover:border-black transition-all cursor-pointer flex items-center justify-between text-xs shadow-2xs"
                >
                  <div className="truncate pr-3 space-y-0.5">
                    <span className="font-bold text-gray-900 block truncate group-hover:text-black">
                      {prob.title}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
                      <span className="px-1.5 py-0.2 rounded bg-gray-100 text-gray-700 font-semibold">
                        {prob.platform || 'LeetCode'}
                      </span>
                      <span>{prob.topic || 'Algorithms'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      Due ({prob.revisionInterval || '7d'})
                    </span>
                    <button
                      type="button"
                      className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono font-bold text-blue-600 hover:text-blue-800"
                    >
                      <span>Review</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Calibrated Retention Pipeline (Empty State Reimagined) */
            <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-b from-neutral-50/80 to-white border border-gray-200/90 text-center space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Retention: 100% Calibrated</span>
                </span>
                <span className="text-[10px] font-mono text-gray-400">
                  Next automated cycle: ~18h
                </span>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-900 font-display">
                  No Immediate Memory Degradation Detected
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5 max-w-sm mx-auto">
                  All recently solved DSA algorithms are currently within their safe cognitive retention curve.
                </p>
              </div>

              {/* 5-Stage Ebbinghaus Visual Pipeline */}
              <div className="pt-1">
                <div className="grid grid-cols-5 gap-1.5 text-center relative">
                  {retentionStages.map((stage, idx) => {
                    const isCleared = stage.status === 'cleared';
                    const isUpcoming = stage.status === 'upcoming';
                    return (
                      <div key={idx} className="flex flex-col items-center space-y-1">
                        <div 
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                            isCleared 
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : isUpcoming
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-gray-100 text-gray-400 border border-gray-200'
                          }`}
                        >
                          {isCleared ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : isUpcoming ? '⏳' : '🔒'}
                        </div>
                        <span className="text-[10px] font-mono font-bold text-gray-800 block">
                          {stage.label}
                        </span>
                        <span className="text-[9px] text-gray-400 font-mono hidden sm:block truncate max-w-[50px]">
                          {stage.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-1 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('dsa')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-800 text-white font-mono text-[11px] font-bold shadow-2xs transition-all"
                >
                  <Plus className="w-3 h-3" />
                  <span>Queue Problem for Review</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. LeetCode-Style Algorithmic Difficulty Distribution Footer */}
      <div className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-200 text-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-gray-700" />
            <span className="text-[10px] font-mono text-gray-600 uppercase tracking-wider font-bold">
              Difficulty Mix Distribution
            </span>
          </div>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('dsa')}
            className="text-[11px] font-mono font-bold text-gray-900 hover:text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>Analyze DSA</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Multi-segment Colored Progress Bar */}
        <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden flex">
          <div 
            style={{ width: `${easyPct}%` }} 
            className="bg-emerald-500 h-full transition-all duration-500" 
            title={`Easy: ${easy} (${easyPct}%)`}
          />
          <div 
            style={{ width: `${medPct}%` }} 
            className="bg-amber-500 h-full transition-all duration-500" 
            title={`Medium: ${medium} (${medPct}%)`}
          />
          <div 
            style={{ width: `${hardPct}%` }} 
            className="bg-rose-500 h-full transition-all duration-500" 
            title={`Hard: ${hard} (${hardPct}%)`}
          />
        </div>

        {/* Legend Row */}
        <div className="flex items-center justify-between text-[11px] font-mono pt-0.5">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-gray-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <strong>{easy}</strong> Easy
            </span>
            <span className="flex items-center gap-1 text-gray-700">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <strong>{medium}</strong> Med
            </span>
            <span className="flex items-center gap-1 text-gray-700">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <strong>{hard}</strong> Hard
            </span>
          </div>

          <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">
            Tier-1 Benchmark: 40/45/15%
          </span>
        </div>
      </div>

    </div>
  );
}
