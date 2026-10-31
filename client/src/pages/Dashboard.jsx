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
  BookOpen, 
  TrendingUp,
  Layers,
  User,
  Check,
  RefreshCw,
  PlusCircle,
  ExternalLink,
  Zap
} from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge, StatusBadge } from '../components/common/Badge';
import { DonutChart, DifficultyDistribution } from '../components/common/Charts';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { useLocalCache } from '../hooks/useLocalCache';

export function Dashboard({ dashboardData, loading, onNavigate, onRefreshAll }) {
  const [handles, setHandles] = useLocalCache('prep_user_handles', {
    codeforces: '',
    leetcode: '',
    github: ''
  });

  const [cfInput, setCfInput] = useState(handles.codeforces || '');
  const [lcInput, setLcInput] = useState(handles.leetcode || '');
  const [ghInput, setGhInput] = useState(handles.github || '');
  const [syncing, setSyncing] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const applyHandles = async (newCf, newLc, newGh) => {
    setSyncing(true);
    setHandles({ codeforces: newCf, leetcode: newLc, github: newGh });
    setCfInput(newCf);
    setLcInput(newLc);
    setGhInput(newGh);
    if (onRefreshAll) await onRefreshAll();
    setSyncing(false);
  };

  if (loading || !dashboardData) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton lines={6} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <LoadingSkeleton lines={3} />
          <LoadingSkeleton lines={3} />
          <LoadingSkeleton lines={3} />
          <LoadingSkeleton lines={3} />
        </div>
      </div>
    );
  }

  const { readiness, metrics, platforms, weakestArea, strongestArea, recommendations, dueRevisions = [] } = dashboardData;
  const overallScore = readiness?.overallScore ?? 0;
  const statusTier = readiness?.status || 'Keep Preparing';
  const tierColor = readiness?.tierColor || 'amber';

  const platformSolvesData = [
    { label: 'LeetCode', value: platforms?.leetcode?.problemsSolved ?? 0, color: '#3b82f6' },
    { label: 'Codeforces', value: platforms?.codeforces?.problemsSolved ?? 0, color: '#f59e0b' },
    { label: 'AtCoder', value: platforms?.atcoder?.problemsSolved ?? 0, color: '#10b981' },
    { label: 'HackerRank', value: platforms?.hackerrank?.problemsSolved ?? 0, color: '#a855f7' }
  ];

  const hasLinkedAccount = Boolean(handles.leetcode || handles.codeforces || handles.github);

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* 0. PROMINENT UNLINKED ACCOUNTS CALLOUT BANNER (Shown if student hasn't linked accounts) */}
      {!hasLinkedAccount && (
        <div className="p-5 rounded-3xl bg-amber-50 border-2 border-amber-400 shadow-[4px_4px_0px_rgba(217,119,6,0.3)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-white font-bold flex-shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-950 font-display">
                No Coding Accounts Linked Yet!
              </h2>
              <p className="text-xs text-amber-800/80 mt-0.5 max-w-xl">
                Connect your LeetCode, Codeforces, or GitHub username to auto-sync your real problems solved, contest ratings, and live commits into this dashboard.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowConfig(true)}
            className="px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold font-mono shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 flex-shrink-0 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            Connect Accounts Now
          </button>
        </div>
      )}

      {/* Live Profile Connect & Quick Presets Bar */}
      <div className="p-5 rounded-3xl bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${hasLinkedAccount ? 'bg-emerald-500 animate-pulse' : 'bg-black/20'}`} />
              <span className="text-xs font-bold uppercase tracking-wider font-mono text-black">
                Connected Coding Handles:
              </span>
            </div>
            
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono pt-0.5">
              <span className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 ${
                handles.leetcode 
                  ? 'bg-blue-50 border-blue-300 text-blue-700' 
                  : 'bg-black/5 border-black/10 text-black/40'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                LC: {handles.leetcode ? `@${handles.leetcode}` : 'Unlinked'}
              </span>

              <span className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 ${
                handles.codeforces 
                  ? 'bg-amber-50 border-amber-300 text-amber-800' 
                  : 'bg-black/5 border-black/10 text-black/40'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                CF: {handles.codeforces ? `@${handles.codeforces}` : 'Unlinked'}
              </span>

              <span className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 ${
                handles.github 
                  ? 'bg-neutral-100 border-neutral-300 text-neutral-800' 
                  : 'bg-black/5 border-black/10 text-black/40'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-black" />
                GH: {handles.github ? `@${handles.github}` : 'Unlinked'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-black text-white hover:bg-neutral-800 shadow-[2px_2px_0px_rgba(0,0,0,0.3)] transition-all"
            >
              {showConfig ? 'Close Handle Setup' : 'Edit / Change Handles'}
            </button>

            {/* Quick Demo Presets */}
            <button
              onClick={() => applyHandles('tourist', 'tourist', 'torvalds')}
              disabled={syncing}
              className="text-[11px] font-mono text-amber-900 font-bold px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-colors"
              title="Load Tourist Codeforces & Linus Torvalds GitHub"
            >
              Preset: Tourist
            </button>
            <button
              onClick={() => applyHandles('Petr', 'neal_wu', 'gaearon')}
              disabled={syncing}
              className="text-[11px] font-mono text-blue-900 font-bold px-2.5 py-1.5 rounded-xl bg-blue-100 hover:bg-blue-200 border border-blue-300 transition-colors"
              title="Load Neal Wu LeetCode & Dan Abramov GitHub"
            >
              Preset: Neal Wu
            </button>
            <button
              onClick={() => applyHandles('', '', '')}
              disabled={syncing}
              className="text-[11px] font-mono text-black/60 hover:text-black px-2 py-1.5 rounded-xl bg-black/5 hover:bg-black/10 border border-black/10 transition-colors"
              title="Reset to 0 solves"
            >
              Clean (0)
            </button>
          </div>
        </div>

        {/* Expandable Handle Inputs Form */}
        {showConfig && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              applyHandles(cfInput.trim(), lcInput.trim(), ghInput.trim());
            }}
            className="pt-4 border-t border-black/10 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs"
          >
            <div>
              <label className="block text-black/70 text-[10px] uppercase font-mono font-bold mb-1">
                LeetCode Username
              </label>
              <input
                type="text"
                value={lcInput}
                onChange={(e) => setLcInput(e.target.value)}
                placeholder="e.g. neal_wu"
                className="w-full px-3 py-2 rounded-xl bg-[#F4F4F0] border border-black/15 text-black font-mono focus:outline-none focus:border-black focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-black/70 text-[10px] uppercase font-mono font-bold mb-1">
                Codeforces Handle
              </label>
              <input
                type="text"
                value={cfInput}
                onChange={(e) => setCfInput(e.target.value)}
                placeholder="e.g. tourist"
                className="w-full px-3 py-2 rounded-xl bg-[#F4F4F0] border border-black/15 text-black font-mono focus:outline-none focus:border-black focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-black/70 text-[10px] uppercase font-mono font-bold mb-1">
                GitHub Username
              </label>
              <input
                type="text"
                value={ghInput}
                onChange={(e) => setGhInput(e.target.value)}
                placeholder="e.g. torvalds"
                className="w-full px-3 py-2 rounded-xl bg-[#F4F4F0] border border-black/15 text-black font-mono focus:outline-none focus:border-black focus:bg-white"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={syncing}
                className="w-full py-2 px-4 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Fetching...' : 'Save & Sync Live'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 1. Hero Placement Readiness Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white border-2 border-black p-6 lg:p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant={tierColor} size="md">
                <Sparkles className="w-3.5 h-3.5" />
                {statusTier}
              </Badge>
              <span className="text-xs font-mono text-black/50 font-medium">
                Algorithm: Multi-Pillar Weighted Diagnostic
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-black">
              Placement Preparation Index
            </h1>

            <p className="text-xs sm:text-sm text-black/60 leading-relaxed font-normal">
              Unified evaluation synthesizing <span className="text-black font-semibold">DSA Practice (35%)</span>,{' '}
              <span className="text-black font-semibold">Web Development (25%)</span>,{' '}
              <span className="text-black font-semibold">System Design (20%)</span>, and{' '}
              <span className="text-black font-semibold">GitHub FOSS Activity (10%)</span>.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('readiness')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white shadow-[2px_2px_0px_rgba(0,0,0,0.3)] transition-all"
              >
                View Diagnostic Breakdown
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('dsa')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-black/5 hover:bg-black/10 text-black border border-black/15 transition-colors"
              >
                Continue Daily Problems
              </button>
            </div>
          </div>

          {/* Readiness Score Ring Display */}
          <div className="flex items-center gap-6 p-4 sm:p-6 rounded-2xl bg-[#F4F4F0] border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-extrabold font-display tracking-tight text-black">
                {overallScore}%
              </div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-black/60 mt-1 block font-bold">
                Readiness Score
              </span>
            </div>

            <div className="hidden sm:block w-px h-16 bg-black/15" />

            <div className="space-y-1.5 min-w-[140px] text-xs font-mono">
              <div className="flex items-center justify-between text-black/60">
                <span>DSA (35%):</span>
                <span className="text-black font-bold">{readiness?.breakdown?.dsa?.score ?? 0}%</span>
              </div>
              <div className="flex items-center justify-between text-black/60">
                <span>Web Dev (25%):</span>
                <span className="text-black font-bold">{readiness?.breakdown?.webDevelopment?.score ?? 0}%</span>
              </div>
              <div className="flex items-center justify-between text-black/60">
                <span>SysDesign (20%):</span>
                <span className="text-black font-bold">{readiness?.breakdown?.systemDesign?.score ?? 0}%</span>
              </div>
              <div className="flex items-center justify-between text-black/60">
                <span>Projects (10%):</span>
                <span className="text-black font-bold">{readiness?.breakdown?.projects?.score ?? 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Four Primary Pillar Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="DSA Solves"
          value={metrics?.totalSolved ?? 0}
          subtext={
            (metrics?.totalSolved ?? 0) > 0
              ? `LC: ${metrics?.lcRating || 'Active'} | CF: ${metrics?.cfRating || 'Active'}`
              : 'Link handles to sync solves'
          }
          badge="35% weight"
          color="blue"
          icon={Code2}
          onClick={() => onNavigate('dsa')}
        />

        <MetricCard
          title="Web Development"
          value={`${readiness?.breakdown?.webDevelopment?.score ?? 0}%`}
          subtext="Full-Stack Roadmaps & Milestones"
          badge="25% weight"
          color="cyan"
          icon={Globe2}
          onClick={() => onNavigate('webdev')}
        />

        <MetricCard
          title="System Design"
          value={`${metrics?.systemTopicsCompleted ?? 0}/${metrics?.systemTopicsTotal || 6}`}
          subtext="Scalability, Networking & HLD"
          badge="20% weight"
          color="purple"
          icon={ServerCog}
          onClick={() => onNavigate('systemdesign')}
        />

        <MetricCard
          title="GitHub & FOSS"
          value={metrics?.commits ?? 0}
          subtext={
            (metrics?.commits ?? 0) > 0
              ? `${metrics?.prs || 0} merged PRs | ${metrics?.repos || 0} repos`
              : 'Link GitHub account'
          }
          badge="10% weight"
          color="amber"
          icon={GitBranch}
          onClick={() => onNavigate('github')}
        />
      </div>

      {/* 3. Middle Section: Weak Area Engine & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weak Area Engine (Left 2 cols) */}
        <div className="lg:col-span-2 rounded-3xl bg-white border-2 border-black p-6 space-y-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-500 text-white font-bold shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-black font-display">
                  Weak Area Engine & Action Plan
                </h3>
                <p className="text-xs text-black/50">
                  Automated opportunity detection based on current preparation metrics
                </p>
              </div>
            </div>
            <Badge variant="amber">Priority Focus</Badge>
          </div>

          <div className="p-4 rounded-2xl bg-[#F4F4F0] border border-black/10 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-black/50 uppercase tracking-wider block font-medium">
                Primary Improvement Opportunity
              </span>
              <span className="text-sm font-bold text-amber-700 font-display">
                {weakestArea?.name || 'DSA Practice'} ({weakestArea?.score ?? 0}%)
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono text-black/50 uppercase tracking-wider block font-medium">
                Strongest Pillar
              </span>
              <span className="text-sm font-bold text-emerald-700 font-display">
                {strongestArea?.name || 'DSA Practice'} ({strongestArea?.score ?? 0}%)
              </span>
            </div>
          </div>

          {/* Action Recommendations List */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-black uppercase tracking-wider text-[11px]">
              Recommended Placement Sprint Actions:
            </span>
            <div className="space-y-2">
              {(recommendations && recommendations.length > 0) ? (
                recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-3 p-3 rounded-xl bg-white border border-black/10 hover:border-black/30 transition-all shadow-sm"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="flex-shrink-0 w-5 h-5 rounded-lg bg-black text-white font-mono text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-black">{rec.action}</p>
                        <span className="text-[10px] font-mono text-black/50">Pillar: {rec.pillar}</span>
                      </div>
                    </div>
                    <Badge variant={rec.priority === 'High' ? 'rose' : 'amber'} size="sm">
                      {rec.priority}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-black/50 font-mono rounded-xl border border-dashed border-black/15">
                  Link your coding accounts or track milestones to receive prioritized placement recommendations.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Platform Solves Donut Chart (Right 1 col) */}
        <div className="rounded-3xl bg-white border-2 border-black p-6 flex flex-col justify-between shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <div>
            <h3 className="text-sm font-bold text-black font-display mb-1">Platform Solve Distribution</h3>
            <p className="text-xs text-black/50 mb-4">Problem solves across competitive handles</p>
          </div>

          <DonutChart
            data={platformSolvesData}
            size={170}
            strokeWidth={22}
            centerLabel="Total Solves"
            centerValue={metrics?.totalSolved ?? 0}
          />

          <div className="pt-4 border-t border-black/10 text-center">
            <button
              onClick={() => onNavigate('dsa')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 font-mono"
            >
              View Detailed DSA Breakdown →
            </button>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Difficulty Mix & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Difficulty Distribution */}
        <div className="rounded-3xl bg-white border-2 border-black p-6 space-y-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <div>
            <h3 className="text-sm font-bold text-black font-display">Algorithmic Difficulty Mix</h3>
            <p className="text-xs text-black/50">Distribution of solved interview problems</p>
          </div>

          <DifficultyDistribution
            easy={metrics?.easy ?? 0}
            medium={metrics?.medium ?? 0}
            hard={metrics?.hard ?? 0}
          />

          <div className="p-3.5 rounded-2xl bg-[#F4F4F0] border border-black/10 text-xs text-black/60">
            <span className="font-bold text-black block mb-1">Placement Guideline:</span>
            Aim for at least <span className="text-rose-600 font-bold font-mono">50+ Hard</span> and{' '}
            <span className="text-black font-bold font-mono">200+ Medium</span> problems for Tier 1 tech product companies.
          </div>
        </div>

        {/* Dynamic Revision Due Alert Card */}
        <div className="lg:col-span-2 rounded-3xl bg-white border-2 border-black p-6 space-y-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-black text-white">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-black font-display">Spaced Repetition & Revision</h3>
                <p className="text-xs text-black/50">Problems due for retention check today</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('dsa')}
              className="text-xs font-mono font-bold text-blue-600 hover:underline"
            >
              Go to Tracker →
            </button>
          </div>

          {(dueRevisions && dueRevisions.length > 0) ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dueRevisions.slice(0, 4).map((prob) => (
                <div key={prob.id} className="p-3.5 rounded-2xl bg-[#F4F4F0] border border-black/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-black block">{prob.title}</span>
                    <span className="text-[10px] font-mono text-black/50">{prob.platform} • {prob.topic}</span>
                  </div>
                  <Badge variant={prob.revisionStatus === 'Due' ? 'amber' : 'emerald'} size="sm">
                    {prob.revisionStatus} ({prob.revisionInterval || '7d'})
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 px-4 text-center rounded-2xl bg-[#F4F4F0] border-2 border-dashed border-black/15 space-y-1.5">
              <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-black font-display">No revisions currently due</p>
              <p className="text-[11px] text-black/50 max-w-sm mx-auto">
                Solve or track problems in DSA Preparation to start your spaced repetition retention cycle.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
