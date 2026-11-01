import React from 'react';
import { 
  Target, 
  Code2, 
  ServerCog, 
  GitBranch, 
  ArrowRight
} from 'lucide-react';

export function PrimaryMetricCards({ 
  overallScore = 0, 
  statusTier = 'Keep Preparing', 
  metrics = {}, 
  calibratedRole = {}, 
  onNavigate 
}) {
  const totalSolved = metrics?.totalSolved ?? 0;
  const easy = metrics?.easy ?? 0;
  const medium = metrics?.medium ?? 0;
  const hard = metrics?.hard ?? 0;
  const totalDifficulty = (easy + medium + hard) || 1;

  const easyPct = Math.round((easy / totalDifficulty) * 100);
  const medPct = Math.round((medium / totalDifficulty) * 100);
  const hardPct = Math.max(0, 100 - easyPct - medPct);

  const sysCompleted = metrics?.systemTopicsCompleted ?? 0;
  const sysTotal = metrics?.systemTopicsTotal || 6;
  const sysPct = Math.min(100, Math.round((sysCompleted / sysTotal) * 100));

  const commits = metrics?.commits ?? 0;
  const prs = metrics?.prs ?? 0;
  const repos = metrics?.repos ?? 0;

  const weights = calibratedRole?.weights || {
    dsa: 35,
    systemDesign: 20,
    webDev: 20,
    projects: 15,
    developerActivity: 10
  };

  // Readiness color theme based on score
  const isReady = overallScore >= 75;
  const isCompetitive = overallScore >= 50;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. Placement Readiness Index */}
      <div 
        onClick={() => onNavigate && onNavigate('readiness')}
        className="group rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:shadow-xs hover:border-black transition-all p-5 cursor-pointer flex flex-col justify-between space-y-4"
      >
        <div>
          {/* Card Top Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-2xs">
                <Target className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-gray-500 uppercase font-mono tracking-wider">
                Readiness Score
              </span>
            </div>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 text-[10px] font-mono font-bold tracking-tight">
              <span className={`w-1.5 h-1.5 rounded-full ${isReady ? 'bg-emerald-500' : isCompetitive ? 'bg-blue-500' : 'bg-amber-500'} animate-pulse`} />
              FAANG Tier
            </span>
          </div>

          {/* Metric Value & Status */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono tracking-tight text-gray-950 font-display">
                {overallScore}%
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                isReady 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : isCompetitive 
                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                    : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {statusTier}
              </span>
            </div>

            {/* Visual Multi-Stop Readiness Bar */}
            <div className="pt-2">
              <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    isReady ? 'bg-emerald-500' : isCompetitive ? 'bg-blue-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.max(5, overallScore)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="font-mono text-[11px] text-gray-500">
            5 Calibrated Pillars
          </span>
          <span className="text-gray-900 group-hover:text-black font-mono font-bold text-[11px] flex items-center gap-1">
            <span>Breakdown</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>

      {/* 2. DSA Solves & Algorithm Engine */}
      <div 
        onClick={() => onNavigate && onNavigate('dsa')}
        className="group rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:shadow-xs hover:border-black transition-all p-5 cursor-pointer flex flex-col justify-between space-y-4"
      >
        <div>
          {/* Card Top Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-2xs">
                <Code2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-gray-500 uppercase font-mono tracking-wider">
                DSA Solves
              </span>
            </div>

            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              {weights.dsa}% Weight
            </span>
          </div>

          {/* Metric Value & Difficulty Sub-Breakdown */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono tracking-tight text-gray-950 font-display">
                {totalSolved.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-gray-500 font-mono">
                problems solved
              </span>
            </div>

            {/* Segmented Color Bar */}
            <div className="pt-2">
              <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden flex">
                <div style={{ width: `${easyPct}%` }} className="bg-emerald-500 h-full" title={`Easy: ${easy}`} />
                <div style={{ width: `${medPct}%` }} className="bg-amber-500 h-full" title={`Medium: ${medium}`} />
                <div style={{ width: `${hardPct}%` }} className="bg-rose-500 h-full" title={`Hard: ${hard}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-[10px] text-gray-600">
            <span>E: <strong className="text-emerald-700">{easy}</strong></span>
            <span>M: <strong className="text-amber-700">{medium}</strong></span>
            <span>H: <strong className="text-rose-700">{hard}</strong></span>
          </div>
          <span className="text-gray-900 group-hover:text-black font-bold text-[11px] flex items-center gap-1">
            <span>Practice</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>

      {/* 3. System Design & Architecture */}
      <div 
        onClick={() => onNavigate && onNavigate('systemdesign')}
        className="group rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:shadow-xs hover:border-black transition-all p-5 cursor-pointer flex flex-col justify-between space-y-4"
      >
        <div>
          {/* Card Top Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors shadow-2xs">
                <ServerCog className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-gray-500 uppercase font-mono tracking-wider">
                System Design
              </span>
            </div>

            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
              {weights.systemDesign}% Weight
            </span>
          </div>

          {/* Metric Value */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono tracking-tight text-gray-950 font-display">
                {sysCompleted}/{sysTotal}
              </span>
              <span className="text-xs font-semibold text-gray-500 font-mono">
                modules ({sysPct}%)
              </span>
            </div>

            {/* Mini Progress Bar */}
            <div className="pt-2">
              <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div 
                  className="h-full bg-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, sysPct)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="font-mono text-[11px] text-gray-500">
            HLD &amp; Concurrency
          </span>
          <span className="text-gray-900 group-hover:text-black font-mono font-bold text-[11px] flex items-center gap-1">
            <span>Architecture</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>

      {/* 4. GitHub & FOSS Developer Activity */}
      <div 
        onClick={() => onNavigate && onNavigate('github')}
        className="group rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:shadow-xs hover:border-black transition-all p-5 cursor-pointer flex flex-col justify-between space-y-4"
      >
        <div>
          {/* Card Top Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-neutral-100 border border-neutral-300 flex items-center justify-center text-neutral-800 group-hover:bg-black group-hover:text-white transition-colors shadow-2xs">
                <GitBranch className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-gray-500 uppercase font-mono tracking-wider">
                GitHub &amp; FOSS
              </span>
            </div>

            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-300">
              {weights.developerActivity !== undefined ? weights.developerActivity : (weights.devActivity || 10)}% Weight
            </span>
          </div>

          {/* Metric Value */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono tracking-tight text-gray-950 font-display">
                {commits.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-gray-500 font-mono">
                commits in 12m
              </span>
            </div>

            {/* Commits / PRs Sub-status */}
            <div className="pt-2">
              <div className="flex items-center gap-2 text-[10px] font-mono text-gray-600">
                <span className="px-1.5 py-0.5 rounded bg-gray-100 font-bold text-gray-800">
                  {prs} Merged PRs
                </span>
                <span>{repos} Public Repos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="font-mono text-[11px] text-gray-500">
            Verified Git Activity
          </span>
          <span className="text-gray-900 group-hover:text-black font-mono font-bold text-[11px] flex items-center gap-1">
            <span>Repositories</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>

    </div>
  );
}
