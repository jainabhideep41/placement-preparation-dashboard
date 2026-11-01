import React from 'react';
import { 
  Zap, 
  Code2, 
  ServerCog, 
  Globe2, 
  GitBranch, 
  ArrowUpRight, 
  ChevronRight,
  Sparkles,
  Layers,
  Target,
  ArrowRight
} from 'lucide-react';

export function PlacementSprintCard({ 
  weakestArea, 
  strongestArea, 
  recommendations = [], 
  onNavigate 
}) {
  // Map recommendation pillar to platform route and icon
  const getPillarMeta = (pillar = '') => {
    const clean = (pillar || '').toLowerCase();
    if (clean.includes('dsa') || clean.includes('algorithm') || clean.includes('codeforces') || clean.includes('leetcode')) {
      return {
        icon: Code2,
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        label: 'DSA Practice',
        route: 'dsa',
        actionText: 'Solve on DSA'
      };
    }
    if (clean.includes('system') || clean.includes('design') || clean.includes('architecture') || clean.includes('caching')) {
      return {
        icon: ServerCog,
        color: 'text-purple-600 bg-purple-50 border-purple-200',
        label: 'System Design',
        route: 'system-design',
        actionText: 'Study HLD Module'
      };
    }
    if (clean.includes('project') || clean.includes('web') || clean.includes('frontend') || clean.includes('backend')) {
      return {
        icon: Globe2,
        color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        label: 'Web & Projects',
        route: 'webdev',
        actionText: 'Open Roadmap'
      };
    }
    if (clean.includes('github') || clean.includes('foss') || clean.includes('open-source')) {
      return {
        icon: GitBranch,
        color: 'text-neutral-700 bg-neutral-100 border-neutral-300',
        label: 'GitHub / FOSS',
        route: 'github',
        actionText: 'View Activity'
      };
    }
    return {
      icon: Target,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      label: 'Readiness Engine',
      route: 'readiness',
      actionText: 'Calibrate Role'
    };
  };

  const handlePillarClick = (pillar) => {
    if (!onNavigate) return;
    const meta = getPillarMeta(pillar);
    onNavigate(meta.route);
  };

  return (
    <div className="rounded-2xl bg-white border border-gray-200/90 shadow-xs p-5 lg:p-6 space-y-5 transition-all">
      
      {/* 1. Header with Diagnostic Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold shadow-xs">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900 tracking-tight font-display">
                Placement Sprint Actions
              </h3>
            </div>
            <p className="text-[11px] text-gray-500 font-normal">
              Prioritized high-yield sprints calibrated to maximize campus & off-campus interview readiness
            </p>
          </div>
        </div>

        {/* Live Diagnostic Pulse Pill */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold tracking-tight shadow-2xs self-start sm:self-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>AUTOMATED DIAGNOSTIC</span>
        </div>
      </div>

      {/* 2. Opportunity vs Mastery Diagnostic Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Primary Opportunity (Weak Area) */}
        <div 
          onClick={() => handlePillarClick(weakestArea?.name)}
          className="group p-3.5 rounded-xl bg-gradient-to-br from-amber-50/60 to-white border border-amber-200/80 hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-amber-800 flex items-center gap-1">
              <span>Primary Opportunity</span>
            </span>
            <span className="text-[11px] font-mono font-bold text-amber-900 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              <span>Calibrate</span>
              <ArrowUpRight className="w-3 h-3 text-amber-600" />
            </span>
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <span className="font-bold text-gray-900 text-sm truncate font-display">
              {weakestArea?.name || 'DSA Practice'}
            </span>
            <span className="font-mono text-xs font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded">
              {weakestArea?.score ?? 0}%
            </span>
          </div>

          {/* Progress track */}
          <div className="w-full h-1.5 bg-amber-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(8, Math.min(100, weakestArea?.score ?? 15))}%` }}
            />
          </div>
          <span className="text-[10px] text-amber-700/80 font-mono mt-1 block">
            Target Tier-1 benchmark: 80%+
          </span>
        </div>

        {/* Strongest Pillar (Mastery) */}
        <div 
          onClick={() => handlePillarClick(strongestArea?.name)}
          className="group p-3.5 rounded-xl bg-gradient-to-br from-emerald-50/60 to-white border border-emerald-200/80 hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-emerald-800 flex items-center gap-1">
              <span>Strongest Pillar</span>
            </span>
            <span className="text-[11px] font-mono font-bold text-emerald-900 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              <span>Inspect</span>
              <ArrowUpRight className="w-3 h-3 text-emerald-600" />
            </span>
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <span className="font-bold text-gray-900 text-sm truncate font-display">
              {strongestArea?.name || 'Developer Activity'}
            </span>
            <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
              {strongestArea?.score ?? 0}%
            </span>
          </div>

          {/* Progress track */}
          <div className="w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(10, Math.min(100, strongestArea?.score ?? 67))}%` }}
            />
          </div>
          <span className="text-[10px] text-emerald-700/80 font-mono mt-1 block">
            Verified candidate strength ✓
          </span>
        </div>
      </div>

      {/* 3. Action Sprint Interactive Cards */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono font-semibold text-gray-500 px-0.5">
          <span>PRIORITIZED SPRINT QUEUE</span>
          <span>ESTIMATED GAIN</span>
        </div>

        {recommendations && recommendations.length > 0 ? (
          recommendations.slice(0, 3).map((rec, idx) => {
            const meta = getPillarMeta(rec.pillar);
            const Icon = meta.icon;
            const isHigh = rec.priority === 'High';

            return (
              <div
                key={idx}
                onClick={() => onNavigate && onNavigate(meta.route)}
                className="group p-3.5 rounded-xl border border-gray-200/90 hover:border-black bg-white hover:bg-neutral-50/50 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  {/* Numerical Monospace Badge */}
                  <div className="w-6 h-6 rounded-lg bg-black text-white text-xs font-mono font-bold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs group-hover:scale-105 transition-transform">
                    0{idx + 1}
                  </div>

                  {/* Sprint Text & Pillar Tag */}
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${meta.color}`}>
                        <Icon className="w-3 h-3" />
                        <span>{rec.pillar}</span>
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        ~25 min sprint
                      </span>
                    </div>

                    <p className="text-xs font-bold text-gray-900 group-hover:text-black leading-snug line-clamp-2">
                      {rec.action}
                    </p>
                  </div>
                </div>

                {/* Right Action Badge & Trigger */}
                <div className="flex items-center justify-between sm:justify-end gap-2.5 flex-shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md border ${
                    isHigh
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {isHigh ? '🔥 High Impact' : '⚡ Recommended'}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onNavigate) onNavigate(meta.route);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 group-hover:bg-black group-hover:text-white text-gray-700 text-xs font-mono font-bold transition-all"
                  >
                    <span>Launch</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center text-xs text-gray-400 font-mono rounded-xl border border-dashed border-gray-200">
            Link contest handles in Settings to unlock your personalized algorithm sprint recommendations.
          </div>
        )}
      </div>

    </div>
  );
}
