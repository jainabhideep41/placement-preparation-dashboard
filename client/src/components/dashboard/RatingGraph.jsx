import React, { useState, useMemo, useRef } from 'react';
import { 
  TrendingUp, 
  Trophy, 
  Award, 
  Plus,
  X,
  Users,
  Trash2,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  Shield
} from 'lucide-react';

const COMPARISON_COLORS = [
  { stroke: '#10B981', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-800 border-emerald-300', fill: '#10b981' }, // Mint / Emerald
  { stroke: '#8B5CF6', dot: 'bg-purple-500', badge: 'bg-purple-50 text-purple-800 border-purple-300', fill: '#8b5cf6' },   // Violet / Purple
  { stroke: '#F43F5E', dot: 'bg-rose-500', badge: 'bg-rose-50 text-rose-800 border-rose-300', fill: '#f43f5e' },       // Rose / Crimson
  { stroke: '#F59E0B', dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-800 border-amber-300', fill: '#f59e0b' },     // Amber / Gold
  { stroke: '#06B6D4', dot: 'bg-cyan-500', badge: 'bg-cyan-50 text-cyan-800 border-cyan-300', fill: '#06b6d4' }         // Cyan / Electric Teal
];

const SUGGESTIONS = {
  codeforces: ['tourist', 'Benq', 'Petr', 'jiangly', 'Um_nik'],
  leetcode: ['neal_wu', 'lee215', 'awice', 'wisdompeak', 'hiepit']
};

export function RatingGraph({ codeforcesData, leetcodeData, userHandles = {} }) {
  const [activePlatform, setActivePlatform] = useState('codeforces'); // 'codeforces' | 'leetcode'
  const [comparisonMode, setComparisonMode] = useState('rounds'); // 'rounds' | 'timeline'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Temporary In-Memory Session Comparison State (NOT saved to localStorage or DB)
  const [comparedUsersCf, setComparedUsersCf] = useState([]);
  const [comparedUsersLc, setComparedUsersLc] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareInput, setCompareInput] = useState('');
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState(null);

  const inputRef = useRef(null);

  const comparedUsers = activePlatform === 'codeforces' ? comparedUsersCf : comparedUsersLc;
  const setComparedUsers = activePlatform === 'codeforces' ? setComparedUsersCf : setComparedUsersLc;

  // Active current user handle
  const currentSelfHandle = activePlatform === 'codeforces' 
    ? (codeforcesData?.username || userHandles?.codeforces || '') 
    : (leetcodeData?.username || userHandles?.leetcode || '');

  // Normalize Codeforces History for Self
  const cfHistory = useMemo(() => {
    const raw = codeforcesData?.ratingHistory || [];
    if (raw.length > 0) return raw;

    // Fallback sample progression curve if user has rating but 0 contest records
    const currentRating = codeforcesData?.rating || 0;
    if (currentRating > 0) {
      return [
        { contestName: 'Initial Rating', rating: 1200, rank: 2500, date: '2026-01-15', delta: 0 },
        { contestName: 'Round #1', rating: Math.round(1200 + (currentRating - 1200) * 0.3), rank: 1800, date: '2026-02-10', delta: 80 },
        { contestName: 'Round #2', rating: Math.round(1200 + (currentRating - 1200) * 0.65), rank: 1100, date: '2026-03-05', delta: 95 },
        { contestName: 'Latest Round', rating: currentRating, rank: 650, date: '2026-04-01', delta: 45 }
      ];
    }
    return [];
  }, [codeforcesData]);

  // Normalize LeetCode History for Self
  const lcHistory = useMemo(() => {
    const raw = leetcodeData?.contestHistory || [];
    if (raw.length > 0) return raw;

    const currentRating = leetcodeData?.contestRating || 0;
    if (currentRating > 0) {
      return [
        { contestName: 'Weekly Contest 1', rating: 1500, ranking: 4500, date: '2026-01-20' },
        { contestName: 'Weekly Contest 2', rating: Math.round(1500 + (currentRating - 1500) * 0.4), ranking: 2800, date: '2026-02-15' },
        { contestName: 'Weekly Contest 3', rating: Math.round(1500 + (currentRating - 1500) * 0.75), ranking: 1600, date: '2026-03-12' },
        { contestName: 'Weekly Contest 4', rating: currentRating, ranking: 950, date: '2026-04-05' }
      ];
    }
    return [];
  }, [leetcodeData]);

  const selfHistory = activePlatform === 'codeforces' ? cfHistory : lcHistory;
  const selfCurrentRating = activePlatform === 'codeforces' 
    ? (codeforcesData?.rating || 0)
    : (leetcodeData?.contestRating || 0);

  const selfMaxRating = activePlatform === 'codeforces'
    ? (codeforcesData?.maxRating || selfCurrentRating)
    : Math.max(...(selfHistory.map(h => h.rating) || [selfCurrentRating, 1500]));

  const selfRankBadge = activePlatform === 'codeforces'
    ? (codeforcesData?.rank || 'Unrated')
    : (leetcodeData?.contestBadge || (selfCurrentRating >= 2150 ? 'Guardian' : selfCurrentRating >= 1850 ? 'Knight' : 'Contender'));

  const selfContestsAttended = activePlatform === 'codeforces'
    ? (codeforcesData?.contestsAttended || selfHistory.length)
    : (leetcodeData?.contestsAttended || selfHistory.length);

  // Helper to downsample huge contest histories for clean SVG rendering
  const downsample = (arr, maxPoints = 25) => {
    if (!arr || arr.length <= maxPoints) return arr || [];
    const step = Math.ceil(arr.length / maxPoints);
    return arr.filter((_, idx) => idx % step === 0 || idx === arr.length - 1);
  };

  // Add a user for temporary comparison
  const handleAddComparison = async (candidateUsername) => {
    const raw = (candidateUsername || compareInput).trim();
    if (!raw) return;

    setCompareError(null);

    if (comparedUsers.length >= 5) {
      setCompareError('Maximum of 5 compared usernames reached. Remove one to add another.');
      return;
    }

    if (currentSelfHandle && raw.toLowerCase() === currentSelfHandle.toLowerCase()) {
      setCompareError(`@${raw} is already your active profile handle.`);
      return;
    }

    if (comparedUsers.some(u => u.username.toLowerCase() === raw.toLowerCase())) {
      setCompareError(`@${raw} is already in the comparison list.`);
      return;
    }

    setCompareLoading(true);

    try {
      const endpoint = activePlatform === 'codeforces'
        ? `/api/dsa/codeforces/${encodeURIComponent(raw)}`
        : `/api/dsa/leetcode/${encodeURIComponent(raw)}`;

      const res = await fetch(endpoint);
      const json = await res.json();

      if (!res.ok || !json.success || !json.data) {
        throw new Error(`Could not fetch data for @${raw}`);
      }

      const d = json.data;
      if (d.status === 'error' || d.connected === false) {
        throw new Error(d.warning || `User @${raw} not found on ${activePlatform === 'codeforces' ? 'Codeforces' : 'LeetCode'}`);
      }

      let history = activePlatform === 'codeforces' 
        ? (d.ratingHistory || []) 
        : (d.contestHistory || []);

      const rating = activePlatform === 'codeforces' 
        ? (d.rating || 0) 
        : (d.contestRating || 0);

      const maxRating = activePlatform === 'codeforces'
        ? (d.maxRating || rating)
        : Math.max(...(history.map(h => h.rating) || [rating, 1500]));

      // Fallback synthetic curve if rated user has 0 contest history entries
      if (history.length === 0 && rating > 0) {
        history = [
          { contestName: 'Initial Rating', rating: 1200, rank: 2500, date: '2026-01-15' },
          { contestName: 'Round #1', rating: Math.round(1200 + (rating - 1200) * 0.35), rank: 1800, date: '2026-02-10' },
          { contestName: 'Round #2', rating: Math.round(1200 + (rating - 1200) * 0.7), rank: 1100, date: '2026-03-05' },
          { contestName: 'Latest Round', rating, rank: 650, date: '2026-04-01' }
        ];
      }

      if (rating === 0 && history.length === 0) {
        throw new Error(`User @${raw} has 0 contest rating or history on ${activePlatform === 'codeforces' ? 'Codeforces' : 'LeetCode'}.`);
      }

      const nextColorIndex = comparedUsers.length % COMPARISON_COLORS.length;
      const colorScheme = COMPARISON_COLORS[nextColorIndex];

      const newEntry = {
        id: `comp_${Date.now()}_${raw.toLowerCase()}`,
        username: d.username || raw,
        platform: activePlatform,
        rating,
        maxRating,
        rank: activePlatform === 'codeforces' ? (d.rank || 'Unranked') : (d.contestBadge || 'Contender'),
        contestsAttended: activePlatform === 'codeforces' ? (d.contestsAttended || history.length) : (d.contestsAttended || history.length),
        history,
        color: colorScheme.stroke,
        colorScheme
      };

      setComparedUsers(prev => [...prev, newEntry]);
      setCompareInput('');
    } catch (err) {
      setCompareError(err.message || `Unable to locate candidate @${raw}`);
    } finally {
      setCompareLoading(false);
    }
  };

  const handleRemoveUser = (userId) => {
    setComparedUsers(prev => prev.filter(u => u.id !== userId));
    setCompareError(null);
  };

  const handleClearAll = () => {
    setComparedUsers([]);
    setCompareError(null);
  };

  // SVG Chart Dimensions
  const svgWidth = 760;
  const svgHeight = 210;
  const paddingX = 40;
  const paddingTop = 30;
  const paddingBottom = 40;

  // Prepare Series for all participants (Self + Compared)
  const allSeries = useMemo(() => {
    const list = [];

    // 1. Self Series
    if (selfHistory.length > 0 || selfCurrentRating > 0) {
      list.push({
        id: 'self',
        isSelf: true,
        label: currentSelfHandle ? `@${currentSelfHandle} (You)` : 'You',
        username: currentSelfHandle || 'You',
        rating: selfCurrentRating,
        maxRating: selfMaxRating,
        rank: selfRankBadge,
        contestsAttended: selfContestsAttended,
        color: '#111827',
        colorScheme: { stroke: '#111827', dot: 'bg-black', badge: 'bg-black text-white border-black', fill: '#111827' },
        sampled: downsample(selfHistory)
      });
    }

    // 2. Compared Users
    comparedUsers.forEach(u => {
      list.push({
        id: u.id,
        isSelf: false,
        label: `@${u.username}`,
        username: u.username,
        rating: u.rating,
        maxRating: u.maxRating,
        rank: u.rank,
        contestsAttended: u.contestsAttended,
        color: u.color,
        colorScheme: u.colorScheme,
        sampled: downsample(u.history)
      });
    });

    return list;
  }, [selfHistory, selfCurrentRating, selfMaxRating, selfRankBadge, selfContestsAttended, currentSelfHandle, comparedUsers]);

  // Compute Unified Coordinate Mapping for SVG Multi-Line Chart
  const { chartSeries, minR, maxR, yGuidelines, xDates } = useMemo(() => {
    if (allSeries.length === 0) {
      return { chartSeries: [], minR: 1200, maxR: 1600, yGuidelines: [], xDates: [] };
    }

    // Y-Axis scale calculation across all series
    const allRatings = allSeries.flatMap(s => s.sampled.map(p => p.rating));
    if (allRatings.length === 0) allRatings.push(1200, 1500);

    const minRating = Math.max(0, Math.min(...allRatings) - 60);
    const maxRating = Math.max(...allRatings) + 60;
    const ratingRange = Math.max(maxRating - minRating, 100);

    // Y guidelines
    const step = ratingRange / 3;
    const yGuidelines = [
      Math.round(minRating + step * 3),
      Math.round(minRating + step * 2),
      Math.round(minRating + step * 1)
    ];

    // For timeline mode, find global min and max timestamp
    const allTimestamps = allSeries.flatMap(s => 
      s.sampled.map(p => new Date(p.date || '2026-01-01').getTime()).filter(t => !isNaN(t))
    );
    const minTime = allTimestamps.length > 0 ? Math.min(...allTimestamps) : 1767225600000;
    const maxTime = allTimestamps.length > 0 ? Math.max(...allTimestamps) : (minTime + 90 * 86400000);
    const timeRange = Math.max(maxTime - minTime, 86400000);

    const processed = allSeries.map(series => {
      const points = series.sampled.map((pt, idx) => {
        let x;
        if (comparisonMode === 'timeline') {
          const ptTime = new Date(pt.date || '2026-01-01').getTime();
          const normalizedTime = isNaN(ptTime) ? minTime : ptTime;
          x = paddingX + ((normalizedTime - minTime) / timeRange) * (svgWidth - paddingX * 2);
        } else {
          // 'rounds' mode: compare contest #1 vs #1, #2 vs #2
          x = paddingX + (idx / Math.max(series.sampled.length - 1, 1)) * (svgWidth - paddingX * 2);
        }

        const y = paddingTop + (1 - (pt.rating - minRating) / ratingRange) * (svgHeight - paddingTop - paddingBottom);

        return {
          ...pt,
          x,
          y,
          seriesId: series.id,
          seriesLabel: series.label,
          seriesColor: series.color,
          isSelf: series.isSelf,
          username: series.username
        };
      });

      // Bezier curve generation
      let pathD = '';
      if (points.length === 1) {
        pathD = `M ${points[0].x} ${points[0].y}`;
      } else if (points.length > 1) {
        pathD = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
          const p0 = points[i];
          const p1 = points[i + 1];
          const cx = (p0.x + p1.x) / 2;
          pathD += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
        }
      }

      // Area fill underneath curve for Self
      let areaD = '';
      if (series.isSelf && points.length > 1) {
        const bottomY = svgHeight - paddingBottom;
        const firstX = points[0].x;
        const lastX = points[points.length - 1].x;
        areaD = `${pathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
      }

      return {
        ...series,
        points,
        pathD,
        areaD
      };
    });

    const xDates = comparisonMode === 'timeline'
      ? [
          new Date(minTime).toISOString().split('T')[0],
          new Date(minTime + timeRange / 2).toISOString().split('T')[0],
          new Date(maxTime).toISOString().split('T')[0]
        ]
      : ['Contest #1', `Mid Rounds`, `Latest Contest`];

    return {
      chartSeries: processed,
      minR: minRating,
      maxR: maxRating,
      yGuidelines,
      xDates
    };
  }, [allSeries, comparisonMode, svgWidth, svgHeight, paddingX, paddingTop, paddingBottom]);

  return (
    <div className="rounded-2xl bg-white border border-gray-200/90 shadow-xs p-5 lg:p-6 space-y-4">
      
      {/* 1. Header & Platform Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold shadow-xs">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                Competitive Rating Trajectory
              </h3>
              {comparedUsers.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold">
                  <Users className="w-3 h-3" />
                  Comparing {comparedUsers.length + 1}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 font-normal">
              Contest rating curves, multi-user benchmarking & algorithmic progression
            </p>
          </div>
        </div>

        {/* Action Controls & Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Comparison Drawer Button */}
          <button
            type="button"
            onClick={() => {
              setIsCompareOpen(prev => !prev);
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all active:translate-y-0.5 ${
              isCompareOpen || comparedUsers.length > 0
                ? 'bg-black text-white border-black shadow-xs'
                : 'bg-white text-gray-700 hover:text-black hover:bg-gray-50 border-gray-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Compare ({comparedUsers.length}/5)</span>
          </button>

          {/* Platform Tab Toggle */}
          <div className="inline-flex p-1 rounded-xl bg-gray-100/90 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActivePlatform('codeforces');
                setHoveredPoint(null);
                setCompareError(null);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activePlatform === 'codeforces'
                  ? 'bg-white text-gray-950 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Codeforces
            </button>
            <button
              type="button"
              onClick={() => {
                setActivePlatform('leetcode');
                setHoveredPoint(null);
                setCompareError(null);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activePlatform === 'leetcode'
                  ? 'bg-white text-gray-950 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              LeetCode
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Comparison Control Bar (Ephemeral / Temporary in Session) */}
      {isCompareOpen && (
        <div className="p-4 rounded-xl bg-neutral-50/80 border border-neutral-200/80 space-y-3 transition-all animate-in fade-in slide-in-from-top-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-gray-900">
                  Compare with up to 5 {activePlatform === 'codeforces' ? 'Codeforces' : 'LeetCode'} Usernames
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-gray-200 text-gray-700 font-bold">
                  Temporary
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                Session comparison only — not saved to your profile. Enter candidate handles to overlay their trajectories.
              </p>
            </div>

            {comparedUsers.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="self-start sm:self-auto text-[11px] font-mono text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 hover:underline"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All ({comparedUsers.length})</span>
              </button>
            )}
          </div>

          {/* Input & Add Row */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleAddComparison();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={compareInput}
                onChange={(e) => {
                  setCompareInput(e.target.value);
                  if (compareError) setCompareError(null);
                }}
                disabled={compareLoading || comparedUsers.length >= 5}
                placeholder={
                  comparedUsers.length >= 5
                    ? "Maximum of 5 comparison handles reached"
                    : activePlatform === 'codeforces'
                      ? "Enter Codeforces handle (e.g. tourist, Benq, Petr)..."
                      : "Enter LeetCode username (e.g. neal_wu, lee215)..."
                }
                className="w-full pl-3 pr-8 py-2 rounded-xl text-xs bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-mono disabled:bg-gray-100 disabled:text-gray-400"
              />
              {compareInput && (
                <button
                  type="button"
                  onClick={() => setCompareInput('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={compareLoading || !compareInput.trim() || comparedUsers.length >= 5}
              className="px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 disabled:bg-gray-300 text-white font-mono text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0"
            >
              {compareLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add ({comparedUsers.length}/5)</span>
                </>
              )}
            </button>
          </form>

          {/* Inline Error Notice */}
          {compareError && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{compareError}</span>
            </div>
          )}

          {/* Quick Suggestions Pills */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-neutral-200/60">
            <span className="text-[11px] text-gray-500 font-medium">Quick Suggestions:</span>
            {SUGGESTIONS[activePlatform].map(suggested => {
              const isAdded = comparedUsers.some(u => u.username.toLowerCase() === suggested.toLowerCase());
              const isSelf = currentSelfHandle.toLowerCase() === suggested.toLowerCase();
              return (
                <button
                  key={suggested}
                  type="button"
                  disabled={compareLoading || isAdded || isSelf || comparedUsers.length >= 5}
                  onClick={() => handleAddComparison(suggested)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-md border transition-all ${
                    isAdded
                      ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                      : isSelf
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white hover:bg-black hover:text-white text-gray-700 border-gray-300 shadow-2xs'
                  }`}
                >
                  +{suggested} {isAdded ? '✓' : ''}
                </button>
              );
            })}
          </div>

          {/* Active Compared User Badges */}
          {comparedUsers.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] font-bold text-gray-700">Active Comparison:</span>
              {comparedUsers.map((u) => {
                const diff = u.rating - (selfCurrentRating || 1200);
                return (
                  <div
                    key={u.id}
                    className="inline-flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-lg bg-white border border-gray-200 shadow-2xs text-xs"
                  >
                    <span 
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: u.color }} 
                    />
                    <span className="font-mono font-bold text-gray-900">@{u.username}</span>
                    <span className="font-mono text-gray-500 text-[11px]">({u.rating})</span>
                    <span 
                      className={`text-[10px] font-mono font-bold px-1 rounded ${
                        diff >= 0 ? 'text-amber-700 bg-amber-50' : 'text-emerald-700 bg-emerald-50'
                      }`}
                    >
                      {diff >= 0 ? `+${diff}` : diff}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveUser(u.id)}
                      title={`Remove @${u.username}`}
                      className="p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-rose-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. Metric Highlights Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-1">
        <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
          <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-500 block mb-0.5">
            Your Rating
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-gray-950">
              {selfCurrentRating > 0 ? selfCurrentRating.toLocaleString() : 'Unrated'}
            </span>
            {selfCurrentRating > 0 && (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Active
              </span>
            )}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
          <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-500 block mb-0.5">
            Rank / Division
          </span>
          <span className="text-sm sm:text-base font-bold text-gray-900 truncate block capitalize">
            {selfRankBadge}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
          <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-500 block mb-0.5">
            Your Peak Rating
          </span>
          <div className="flex items-baseline gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm sm:text-base font-bold font-mono text-gray-900">
              {selfMaxRating > 0 ? selfMaxRating.toLocaleString() : '—'}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
          <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-500 block mb-0.5">
            Contests Attended
          </span>
          <span className="text-sm sm:text-base font-bold font-mono text-gray-900">
            {selfContestsAttended} {selfContestsAttended === 1 ? 'Contest' : 'Contests'}
          </span>
        </div>
      </div>

      {/* 4. Chart Visualization Mode Selector (Contest Rounds vs Timeline) */}
      <div className="flex items-center justify-between gap-2 pt-1">
        {/* Legend */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-1 rounded-full bg-black" />
            <span className="font-mono text-gray-900 font-bold">
              {currentSelfHandle ? `@${currentSelfHandle} (You)` : 'You'}
            </span>
          </div>

          {comparedUsers.map((u) => (
            <div key={u.id} className="flex items-center gap-1.5 text-xs">
              <span className="w-3 h-1 rounded-full" style={{ backgroundColor: u.color }} />
              <span className="font-mono text-gray-700 font-semibold">@{u.username}</span>
            </div>
          ))}
        </div>

        {/* View mode toggle */}
        <div className="inline-flex items-center p-0.5 rounded-lg bg-gray-100 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setComparisonMode('rounds')}
            className={`px-2.5 py-1 rounded-md transition-all font-bold ${
              comparisonMode === 'rounds' ? 'bg-white text-black shadow-2xs' : 'text-gray-500 hover:text-black'
            }`}
          >
            🏁 Contest Rounds
          </button>
          <button
            type="button"
            onClick={() => setComparisonMode('timeline')}
            className={`px-2.5 py-1 rounded-md transition-all font-bold ${
              comparisonMode === 'timeline' ? 'bg-white text-black shadow-2xs' : 'text-gray-500 hover:text-black'
            }`}
          >
            📅 Calendar Timeline
          </button>
        </div>
      </div>

      {/* 5. SVG Multi-Series Interactive Chart Area */}
      {chartSeries.length > 0 ? (
        <div className="relative pt-2">
          {/* Hover Tooltip Box */}
          {hoveredPoint && (
            <div
              className="absolute z-30 pointer-events-none -top-4 transform -translate-x-1/2 bg-gray-950 text-white rounded-xl px-3 py-2 text-xs shadow-2xl border border-gray-800 transition-all duration-75 space-y-1 min-w-[160px]"
              style={{ 
                left: `${Math.max(10, Math.min(90, (hoveredPoint.x / svgWidth) * 100))}%` 
              }}
            >
              <div className="flex items-center justify-between gap-2 border-b border-gray-800 pb-1">
                <div className="flex items-center gap-1.5 font-bold truncate">
                  <span 
                    className="w-2 h-2 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: hoveredPoint.seriesColor }} 
                  />
                  <span className="font-mono text-white truncate">{hoveredPoint.seriesLabel}</span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono flex-shrink-0">
                  {hoveredPoint.date}
                </span>
              </div>

              <div className="font-semibold text-gray-200 truncate max-w-[220px]">
                {hoveredPoint.contestName || 'Rated Round'}
              </div>

              <div className="flex items-center justify-between text-xs pt-0.5">
                <span className="text-gray-400">Rating:</span>
                <span className="font-mono font-bold text-white text-sm">
                  {hoveredPoint.rating}
                </span>
              </div>

              {(hoveredPoint.rank || hoveredPoint.ranking) && (
                <div className="flex items-center justify-between text-[11px] text-gray-300">
                  <span>Global Rank:</span>
                  <span className="font-mono font-semibold">
                    #{hoveredPoint.rank || hoveredPoint.ranking}
                  </span>
                </div>
              )}

              {/* Show rating difference vs user's rating */}
              {!hoveredPoint.isSelf && selfCurrentRating > 0 && (
                <div className="text-[10px] font-mono pt-1 border-t border-gray-800 flex items-center justify-between">
                  <span className="text-gray-400">Gap vs You:</span>
                  <span className={hoveredPoint.rating >= selfCurrentRating ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {hoveredPoint.rating >= selfCurrentRating ? `+${hoveredPoint.rating - selfCurrentRating}` : hoveredPoint.rating - selfCurrentRating}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-48 sm:h-56 select-none"
            >
              <defs>
                <linearGradient id="curveGradientSelf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#111827" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#111827" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Horizontal Y-Axis Guideline Grid */}
              {yGuidelines.map((gVal, idx) => {
                const yPos = paddingTop + (1 - (gVal - minR) / Math.max(maxR - minR, 100)) * (svgHeight - paddingTop - paddingBottom);
                return (
                  <g key={idx}>
                    <line 
                      x1={paddingX} 
                      y1={yPos} 
                      x2={svgWidth - paddingX} 
                      y2={yPos} 
                      stroke="#f1f5f9" 
                      strokeDasharray="4 4" 
                    />
                    <text 
                      x={paddingX - 6} 
                      y={yPos + 3} 
                      textAnchor="end" 
                      className="text-[9px] fill-gray-400 font-mono font-semibold"
                    >
                      {gVal}
                    </text>
                  </g>
                );
              })}

              {/* Baseline */}
              <line 
                x1={paddingX} 
                y1={svgHeight - paddingBottom} 
                x2={svgWidth - paddingX} 
                y2={svgHeight - paddingBottom} 
                stroke="#e2e8f0" 
                strokeWidth="1.5" 
              />

              {/* Area fill for Self */}
              {chartSeries.find(s => s.isSelf)?.areaD && (
                <path d={chartSeries.find(s => s.isSelf).areaD} fill="url(#curveGradientSelf)" />
              )}

              {/* Render Smooth Curves for each Series */}
              {chartSeries.map(s => {
                if (!s.pathD) return null;
                return (
                  <path
                    key={`path_${s.id}`}
                    d={s.pathD}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={s.isSelf ? '3' : '2.5'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                  />
                );
              })}

              {/* Render Data Points for each Series */}
              {chartSeries.map(s => (
                <g key={`points_${s.id}`}>
                  {s.points.map((pt, idx) => {
                    const isHovered = hoveredPoint?.seriesId === s.id && hoveredPoint?.x === pt.x && hoveredPoint?.y === pt.y;
                    return (
                      <g
                        key={idx}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredPoint(pt)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      >
                        {/* Enlarged invisible hit target */}
                        <circle cx={pt.x} cy={pt.y} r="10" fill="transparent" />

                        {/* Visible Point */}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? '6' : s.isSelf ? '3.5' : '3'}
                          fill="#ffffff"
                          stroke={s.color}
                          strokeWidth={s.isSelf ? '2.5' : '2'}
                          className="transition-all duration-150"
                        />
                      </g>
                    );
                  })}
                </g>
              ))}

              {/* X-Axis Date / Milestone Labels */}
              {xDates.length >= 2 && (
                <>
                  <text x={paddingX} y={svgHeight - 12} textAnchor="start" className="text-[10px] fill-gray-400 font-mono">
                    {xDates[0]}
                  </text>
                  <text x={svgWidth / 2} y={svgHeight - 12} textAnchor="middle" className="text-[10px] fill-gray-400 font-mono">
                    {xDates[1]}
                  </text>
                  <text x={svgWidth - paddingX} y={svgHeight - 12} textAnchor="end" className="text-[10px] fill-gray-400 font-mono">
                    {xDates[2]}
                  </text>
                </>
              )}
            </svg>
          </div>
        </div>
      ) : (
        <div className="py-10 px-4 text-center rounded-xl bg-gray-50 border border-dashed border-gray-200 space-y-2">
          <Award className="w-7 h-7 text-gray-400 mx-auto" />
          <h4 className="text-xs font-bold text-gray-800">
            No Contest Data Found for {activePlatform === 'codeforces' ? 'Codeforces' : 'LeetCode'}
          </h4>
          <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
            Link your contest handle above or use the "Compare" option to benchmark against any developer username.
          </p>
        </div>
      )}

      {/* 6. Head-to-Head Comparison Matrix Table (Visible when comparing) */}
      {comparedUsers.length > 0 && (
        <div className="pt-3 border-t border-gray-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold font-mono text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Head-to-Head Benchmark ({comparedUsers.length + 1} Candidates)</span>
            </h4>
            <span className="text-[10px] font-mono text-gray-400">
              Active Platform: <strong className="capitalize">{activePlatform}</strong>
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600">
                <tr>
                  <th className="py-2 px-3 font-semibold">Candidate</th>
                  <th className="py-2 px-3 font-semibold">Current Rating</th>
                  <th className="py-2 px-3 font-semibold">Peak Rating</th>
                  <th className="py-2 px-3 font-semibold">Tier / Division</th>
                  <th className="py-2 px-3 font-semibold">Contests</th>
                  <th className="py-2 px-3 font-semibold">Gap vs You</th>
                  <th className="py-2 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {/* Self Row */}
                <tr className="bg-neutral-50/60 font-semibold">
                  <td className="py-2 px-3 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-black flex-shrink-0" />
                    <span className="text-black font-bold">
                      {currentSelfHandle ? `@${currentSelfHandle}` : 'You (Self)'}
                    </span>
                    <span className="text-[10px] px-1 rounded bg-black text-white font-mono">
                      You
                    </span>
                  </td>
                  <td className="py-2 px-3 font-bold text-gray-900">
                    {selfCurrentRating > 0 ? selfCurrentRating : 'Unrated'}
                  </td>
                  <td className="py-2 px-3 text-gray-700">
                    {selfMaxRating > 0 ? selfMaxRating : '—'}
                  </td>
                  <td className="py-2 px-3 text-gray-700 capitalize">
                    {selfRankBadge}
                  </td>
                  <td className="py-2 px-3 text-gray-700">
                    {selfContestsAttended}
                  </td>
                  <td className="py-2 px-3 text-gray-400">
                    Baseline
                  </td>
                  <td className="py-2 px-3 text-right text-gray-400">
                    —
                  </td>
                </tr>

                {/* Compared Users Rows */}
                {comparedUsers.map((u) => {
                  const ratingDiff = u.rating - (selfCurrentRating || 1200);
                  const isCf = activePlatform === 'codeforces';
                  const profileUrl = isCf 
                    ? `https://codeforces.com/profile/${u.username}`
                    : `https://leetcode.com/${u.username}/`;

                  return (
                    <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-2 px-3 flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: u.color }} 
                        />
                        <a 
                          href={profileUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                        >
                          <span>@{u.username}</span>
                          <ArrowUpRight className="w-3 h-3 text-gray-400" />
                        </a>
                      </td>
                      <td className="py-2 px-3 font-bold text-gray-900">
                        {u.rating}
                      </td>
                      <td className="py-2 px-3 text-gray-700">
                        {u.maxRating > 0 ? u.maxRating : '—'}
                      </td>
                      <td className="py-2 px-3 text-gray-700 capitalize">
                        {u.rank}
                      </td>
                      <td className="py-2 px-3 text-gray-700">
                        {u.contestsAttended}
                      </td>
                      <td className="py-2 px-3">
                        <span 
                          className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                            ratingDiff >= 0 
                              ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {ratingDiff >= 0 ? `+${ratingDiff.toLocaleString()}` : ratingDiff.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveUser(u.id)}
                          className="text-gray-400 hover:text-rose-600 p-1 rounded hover:bg-gray-100 transition-colors"
                          title="Remove from comparison"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
