import React, { useState } from 'react';
import { 
  Code2, 
  Globe2, 
  ServerCog, 
  GitBranch, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  Clock, 
  Flame, 
  TrendingUp,
  Settings2,
  RefreshCw,
  Zap,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { Badge } from '../components/common/Badge';
import { DifficultyDistribution, DonutChart } from '../components/common/Charts';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { RatingGraph } from '../components/dashboard/RatingGraph';
import { HandleConfigModal } from '../components/dashboard/HandleConfigModal';
import { useLocalCache } from '../hooks/useLocalCache';

export function Dashboard({ dashboardData, loading, onNavigate, onRefreshAll }) {
  const [handles, setHandles] = useLocalCache('prep_user_handles', {
    codeforces: '',
    leetcode: '',
    github: ''
  });

  const [authProfile] = useLocalCache('prep_auth_user', null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const applyHandles = async (newCf, newLc, newGh) => {
    setSyncing(true);
    setHandles({ codeforces: newCf, leetcode: newLc, github: newGh });
    if (onRefreshAll) await onRefreshAll();
    setSyncing(false);
  };

  if (loading || !dashboardData) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton lines={4} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <LoadingSkeleton lines={3} />
          <LoadingSkeleton lines={3} />
          <LoadingSkeleton lines={3} />
          <LoadingSkeleton lines={3} />
        </div>
      </div>
    );
  }

  const { readiness, metrics, platforms, weakestArea, strongestArea, recommendations = [], dueRevisions = [] } = dashboardData;
  const overallScore = readiness?.overallScore ?? 0;
  const statusTier = readiness?.status || 'Keep Preparing';
  const tierColor = readiness?.tierColor || 'amber';

  const hasLinkedAccount = Boolean(handles.leetcode || handles.codeforces || handles.github);
  const studentName = authProfile?.name || 'Student Developer';
  const targetRole = authProfile?.targetRole || 'Software Development Engineer (SDE-1)';

  const platformSolvesData = [
    { label: 'LeetCode', value: platforms?.leetcode?.problemsSolved ?? 0, color: '#111827' },
    { label: 'Codeforces', value: platforms?.codeforces?.problemsSolved ?? 0, color: '#f59e0b' },
    { label: 'AtCoder', value: platforms?.atcoder?.problemsSolved ?? 0, color: '#10b981' },
    { label: 'HackerRank', value: platforms?.hackerrank?.problemsSolved ?? 0, color: '#8b5cf6' }
  ];

  return (
    <div className="space-y-6 animate-fadeIn font-sans antialiased text-gray-900">
      
      {/* 1. Sleek Modular Executive Top Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 lg:p-5 rounded-2xl bg-white border border-gray-200/90 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
              Welcome back, {studentName}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Synced
            </span>
          </div>
          <p className="text-xs text-gray-500 font-normal flex items-center gap-2">
            <span>Target Goal:</span>
            <span className="text-gray-900 font-medium bg-gray-100 px-2 py-0.5 rounded-md text-[11px]">
              {targetRole}
            </span>
          </p>
        </div>

        {/* Compact Handle Status Strip */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-mono">
            {/* LeetCode Pill */}
            <span className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 ${
              handles.leetcode 
                ? 'bg-gray-50 border-gray-200 text-gray-900 font-semibold' 
                : 'bg-gray-50/50 border-gray-200/60 text-gray-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${handles.leetcode ? 'bg-amber-500' : 'bg-gray-300'}`} />
              LC: {handles.leetcode ? `@${handles.leetcode}` : 'Unlinked'}
            </span>

            {/* Codeforces Pill */}
            <span className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 ${
              handles.codeforces 
                ? 'bg-gray-50 border-gray-200 text-gray-900 font-semibold' 
                : 'bg-gray-50/50 border-gray-200/60 text-gray-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${handles.codeforces ? 'bg-blue-500' : 'bg-gray-300'}`} />
              CF: {handles.codeforces ? `@${handles.codeforces}` : 'Unlinked'}
            </span>

            {/* GitHub Pill */}
            <span className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 ${
              handles.github 
                ? 'bg-gray-50 border-gray-200 text-gray-900 font-semibold' 
                : 'bg-gray-50/50 border-gray-200/60 text-gray-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${handles.github ? 'bg-black' : 'bg-gray-300'}`} />
              GH: {handles.github ? `@${handles.github}` : 'Unlinked'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200/80 text-gray-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Configure competitive coding handles"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit Handles</span>
          </button>
        </div>
      </div>

      {/* 2. Four Primary KPI Metric Cards (Refined Modern SaaS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Readiness Index */}
        <div 
          onClick={() => onNavigate('readiness')}
          className="rounded-2xl bg-white border border-gray-200/90 shadow-xs p-5 hover:border-gray-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Readiness Score
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                FAANG Diagnostic
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono tracking-tight text-gray-950">
                {overallScore}%
              </span>
              <span className="text-xs font-semibold text-gray-600">
                {statusTier}
              </span>
            </div>
          </div>
          <div className="pt-3 border-t border-gray-100 mt-3 flex items-center justify-between text-xs text-gray-500">
            <span className="font-mono text-[11px]">Weighted 4 Pillars</span>
            <span className="text-gray-900 group-hover:translate-x-0.5 transition-transform font-medium flex items-center gap-1">
              View breakdown &rarr;
            </span>
          </div>
        </div>

        {/* DSA Solves */}
        <div 
          onClick={() => onNavigate('dsa')}
          className="rounded-2xl bg-white border border-gray-200/90 shadow-xs p-5 hover:border-gray-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                DSA Solves
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                35% Weight
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono tracking-tight text-gray-950">
                {(metrics?.totalSolved ?? 0).toLocaleString()}
              </span>
              <span className="text-xs font-medium text-gray-500">
                problems
              </span>
            </div>
          </div>
          <div className="pt-3 border-t border-gray-100 mt-3 flex items-center justify-between text-[11px] text-gray-500 font-mono">
            <span>Easy: {metrics?.easy || 0}</span>
            <span>Med: {metrics?.medium || 0}</span>
            <span className="text-gray-950 font-bold">Hard: {metrics?.hard || 0}</span>
          </div>
        </div>

        {/* System Design */}
        <div 
          onClick={() => onNavigate('systemdesign')}
          className="rounded-2xl bg-white border border-gray-200/90 shadow-xs p-5 hover:border-gray-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                System Design
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                20% Weight
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono tracking-tight text-gray-950">
                {metrics?.systemTopicsCompleted ?? 0}/{metrics?.systemTopicsTotal || 6}
              </span>
              <span className="text-xs font-medium text-gray-500">
                modules completed
              </span>
            </div>
          </div>
          <div className="pt-3 border-t border-gray-100 mt-3 flex items-center justify-between text-xs text-gray-500">
            <span className="font-mono text-[11px]">HLD &amp; Concurrency</span>
            <span className="text-gray-900 group-hover:translate-x-0.5 transition-transform font-medium flex items-center gap-1">
              Architecture &rarr;
            </span>
          </div>
        </div>

        {/* GitHub & Open Source */}
        <div 
          onClick={() => onNavigate('github')}
          className="rounded-2xl bg-white border border-gray-200/90 shadow-xs p-5 hover:border-gray-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                GitHub &amp; FOSS
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                10% Weight
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono tracking-tight text-gray-950">
                {(metrics?.commits ?? 0).toLocaleString()}
              </span>
              <span className="text-xs font-medium text-gray-500">
                commits in 12m
              </span>
            </div>
          </div>
          <div className="pt-3 border-t border-gray-100 mt-3 flex items-center justify-between text-xs text-gray-500">
            <span className="font-mono text-[11px]">{metrics?.prs || 0} merged PRs</span>
            <span className="text-gray-900 group-hover:translate-x-0.5 transition-transform font-medium flex items-center gap-1">
              Repositories &rarr;
            </span>
          </div>
        </div>
      </div>

      {/* 3. Competitive Rating Trajectory Chart (Codeforces + LeetCode Graph) */}
      <RatingGraph 
        codeforcesData={platforms?.codeforces} 
        leetcodeData={platforms?.leetcode} 
      />

      {/* 4. Two-Column Modular Workspace: Action vs Retention */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Weak Area Engine & Placement Sprint (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-gray-200/90 shadow-xs p-5 lg:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-900 flex items-center justify-center font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                  Placement Sprint Actions
                </h3>
                <p className="text-[11px] text-gray-500">
                  Prioritized recommendations to maximize placement readiness score
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
              Automated Diagnostic
            </span>
          </div>

          {/* Weak vs Strong Summary Strip */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-500 block mb-0.5">
                Primary Opportunity
              </span>
              <span className="font-bold text-gray-900 font-mono">
                {weakestArea?.name || 'DSA Practice'} ({weakestArea?.score ?? 0}%)
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-500 block mb-0.5">
                Strongest Pillar
              </span>
              <span className="font-bold text-emerald-700 font-mono">
                {strongestArea?.name || 'DSA Practice'} ({strongestArea?.score ?? 0}%)
              </span>
            </div>
          </div>

          {/* Action Sprint List */}
          <div className="space-y-2">
            {recommendations && recommendations.length > 0 ? (
              recommendations.slice(0, 3).map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-gray-200 hover:border-gray-400 bg-white transition-all flex items-start justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-black text-white text-[10px] font-mono font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-gray-900 leading-snug">
                        {rec.action}
                      </p>
                      <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">
                        Focus Pillar: {rec.pillar}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                    rec.priority === 'High'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {rec.priority}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-gray-400 font-mono rounded-xl border border-dashed border-gray-200">
                Link handles to receive targeted algorithm recommendations.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Spaced Repetition Due Queue (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-gray-200/90 shadow-xs p-5 lg:p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-900 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4 text-gray-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                    Spaced Repetition
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Problems scheduled for retention review today
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('dsa')}
                className="text-xs font-bold text-gray-900 hover:underline flex items-center gap-0.5"
              >
                Tracker &rarr;
              </button>
            </div>

            {/* List of due problems */}
            <div className="space-y-2 pt-3">
              {dueRevisions && dueRevisions.length > 0 ? (
                dueRevisions.slice(0, 3).map((prob) => (
                  <div 
                    key={prob.id} 
                    className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between text-xs"
                  >
                    <div className="truncate pr-2">
                      <span className="font-semibold text-gray-900 block truncate">{prob.title}</span>
                      <span className="text-[10px] font-mono text-gray-500">{prob.platform} &bull; {prob.topic}</span>
                    </div>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 flex-shrink-0">
                      Due ({prob.revisionInterval || '7d'})
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-6 px-4 text-center rounded-xl bg-gray-50 border border-dashed border-gray-200 space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                  <p className="text-xs font-bold text-gray-900">No revisions due today</p>
                  <p className="text-[11px] text-gray-500">
                    Your retention queue is clear. Track new problems in DSA to start your next cycle.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Benchmark footer card */}
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block font-semibold">
                Algorithmic Difficulty Mix
              </span>
              <span className="font-mono text-xs text-gray-800">
                {metrics?.easy || 0} Easy &bull; {metrics?.medium || 0} Medium &bull; {metrics?.hard || 0} Hard
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('dsa')}
              className="text-[11px] font-semibold text-gray-900 hover:underline"
            >
              Analyze &rarr;
            </button>
          </div>
        </div>

      </div>

      {/* Handle Configuration Modal */}
      <HandleConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        handles={handles}
        onApplyHandles={applyHandles}
        syncing={syncing}
      />
    </div>
  );
}
