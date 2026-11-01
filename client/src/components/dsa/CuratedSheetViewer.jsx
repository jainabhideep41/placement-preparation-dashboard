import React, { useState, useMemo, useEffect } from 'react';
import { 
  ExternalLink, 
  CheckCircle2, 
  Circle, 
  Search, 
  ArrowLeft, 
  BookOpen, 
  ChevronDown, 
  ChevronRight, 
  RotateCw,
  Check,
  Trophy,
  Code2,
  Sparkles,
  Layers,
  X,
  Share2
} from 'lucide-react';
import { striverSdeSheet } from '../../data/striverSdeSheet';
import { blind75Sheet } from '../../data/blind75Sheet';
import { neetcode150Sheet } from '../../data/neetcode150Sheet';
import { cpEssentialsSheet } from '../../data/cpEssentialsSheet';
import { 
  CANONICAL_STORAGE_KEY,
  ALL_UNIQUE_PROBLEMS,
  getCanonicalKey,
  isProblemSolved,
  toggleCanonicalSolvedState,
  CANONICAL_TO_SHEETS_MAP,
  matchProblem,
  migrateLegacySolvedMaps
} from '../../utils/curatedSheetsManager';
import { useLocalCache } from '../../hooks/useLocalCache';
import { ProgressBar } from '../common/ProgressBar';

export const SHEET_REGISTRY = {
  all_unique: {
    id: 'all_unique',
    title: "All Curated Problems (Master Question Bank)",
    subtitle: "Consolidated 365 unique problems deduplicated across Striver, Blind 75, NeetCode 150, and CP Essentials.",
    badge: "365 Unique Questions",
    category: "Master Question Bank",
    problems: ALL_UNIQUE_PROBLEMS,
    groupType: 'topic',
    groupLabel: 'Topic'
  },
  striver_sde: {
    id: 'striver_sde',
    title: "Striver's SDE Sheet",
    subtitle: "The gold-standard curated 180 questions for top-tier product interview preparation.",
    badge: "180 Questions",
    category: "Interview Preparation",
    problems: striverSdeSheet,
    groupType: 'day',
    groupLabel: 'Day'
  },
  blind_75: {
    id: 'blind_75',
    title: "Blind 75 Essential DSA",
    subtitle: "The definitive 75 LeetCode problems covering all fundamental algorithmic patterns.",
    badge: "75 Questions",
    category: "Patterns",
    problems: blind75Sheet,
    groupType: 'topic',
    groupLabel: 'Pattern'
  },
  neetcode_150: {
    id: 'neetcode_150',
    title: "NeetCode 150 Roadmap",
    subtitle: "Structured progressive list grouped by pattern and algorithmic difficulty.",
    badge: "150 Questions",
    category: "Patterns",
    problems: neetcode150Sheet,
    groupType: 'topic',
    groupLabel: 'Category'
  },
  cp_essentials: {
    id: 'cp_essentials',
    title: "Codeforces Edu & CP Essentials",
    subtitle: "Speed, greedy heuristics, number theory, and contest-specific problem solving rated 800-1600.",
    badge: "100 Questions",
    category: "Competitive Programming",
    problems: cpEssentialsSheet,
    groupType: 'phase',
    groupLabel: 'Phase'
  }
};

export function CuratedSheetViewer({ sheetId = 'striver_sde', onBack, onAddProblem, onDeleteProblem }) {
  const currentSheet = SHEET_REGISTRY[sheetId] || SHEET_REGISTRY.striver_sde;
  const rawProblems = currentSheet.problems;

  // Global Canonical Solved Map across all sheets
  const [canonicalSolvedMap, setCanonicalSolvedMap] = useLocalCache(CANONICAL_STORAGE_KEY, {});
  const [revisionAddedMap, setRevisionAddedMap] = useLocalCache('prep_revision_added_map', {});

  // Migrate any previous local storage caches on initial mount
  useEffect(() => {
    const migrated = migrateLegacySolvedMaps();
    if (migrated && Object.keys(migrated).length > 0) {
      setCanonicalSolvedMap(prev => ({ ...prev, ...migrated }));
    }
  }, [setCanonicalSolvedMap]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Solved' | 'Unsolved'
  
  // Track expanded groups explicitly: { [groupId]: boolean }
  const [expandedGroups, setExpandedGroups] = useState({});

  // Helper to determine group identifier for any problem
  const getProblemGroup = useMemo(() => {
    return (problem) => {
      if (currentSheet.groupType === 'day') {
        return {
          id: String(problem.day || 1),
          title: `Day ${problem.day}: ${problem.topic}`,
          sortKey: Number(problem.day || 1)
        };
      }
      if (currentSheet.groupType === 'phase') {
        const rating = problem.rating || 800;
        if (rating <= 1000) {
          return { id: 'phase_1', title: 'Phase 1: Rating 800–1000 (Foundation)', sortKey: 1 };
        } else if (rating <= 1200) {
          return { id: 'phase_2', title: 'Phase 2: Rating 1000–1200 (Core Patterns)', sortKey: 2 };
        } else if (rating <= 1500) {
          return { id: 'phase_3', title: 'Phase 3: Rating 1300–1500 (Intermediate)', sortKey: 3 };
        } else {
          return { id: 'phase_4', title: 'Phase 4: Rating 1500–1600 (Masterclass)', sortKey: 4 };
        }
      }
      // Default: group by topic
      return {
        id: problem.topic,
        title: problem.topic,
        sortKey: problem.topic
      };
    };
  }, [currentSheet.groupType]);

  // Toggle solved status synchronized across all sheets
  const toggleSolved = (problem, e) => {
    e?.stopPropagation();
    setCanonicalSolvedMap(prev => toggleCanonicalSolvedState(problem, prev));
  };

  // Add or remove from spaced repetition revision queue
  const handleToggleRevision = async (problem, e) => {
    e?.stopPropagation();
    const canonKey = getCanonicalKey(problem);
    const key = problem.id || canonKey;
    const isCurrentlyAdded = Boolean(revisionAddedMap[key] || revisionAddedMap[canonKey] || (problem.canonicalKey && revisionAddedMap[problem.canonicalKey]));

    if (isCurrentlyAdded) {
      setRevisionAddedMap(prev => {
        const next = { ...prev };
        delete next[key];
        delete next[canonKey];
        if (problem.canonicalKey) delete next[problem.canonicalKey];
        if (problem.id) delete next[problem.id];
        return next;
      });
      if (onDeleteProblem) {
        await onDeleteProblem(problem.id || canonKey);
      }
    } else {
      if (onAddProblem) {
        const notesContext = problem.day 
          ? `Imported from ${currentSheet.title} (Day ${problem.day})` 
          : problem.rating 
          ? `Imported from ${currentSheet.title} (Rating ${problem.rating})` 
          : `Imported from ${currentSheet.title} (${problem.topic})`;

        await onAddProblem({
          title: problem.title,
          platform: problem.platform,
          difficulty: problem.difficulty,
          topic: problem.topic,
          url: problem.problemUrl,
          notes: notesContext,
          revisionInterval: '7d'
        });
        setRevisionAddedMap(prev => ({ 
          ...prev, 
          [key]: true,
          [canonKey]: true,
          ...(problem.canonicalKey ? { [problem.canonicalKey]: true } : {})
        }));
      }
    }
  };
  const handleAddToRevision = handleToggleRevision;

  // Compute overall metrics
  const totalCount = rawProblems.length;
  const solvedCount = rawProblems.filter(p => isProblemSolved(p, canonicalSolvedMap)).length;
  const progressPct = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  const easySolved = rawProblems.filter(p => p.difficulty === 'Easy' && isProblemSolved(p, canonicalSolvedMap)).length;
  const mediumSolved = rawProblems.filter(p => p.difficulty === 'Medium' && isProblemSolved(p, canonicalSolvedMap)).length;
  const hardSolved = rawProblems.filter(p => p.difficulty === 'Hard' && isProblemSolved(p, canonicalSolvedMap)).length;

  const easyTotal = rawProblems.filter(p => p.difficulty === 'Easy').length;
  const mediumTotal = rawProblems.filter(p => p.difficulty === 'Medium').length;
  const hardTotal = rawProblems.filter(p => p.difficulty === 'Hard').length;

  // Unique topics list
  const topicsList = useMemo(() => {
    const set = new Set(rawProblems.map(p => p.topic));
    return Array.from(set).sort();
  }, [rawProblems]);

  // Unique platforms list
  const platformsList = useMemo(() => {
    const set = new Set(rawProblems.map(p => p.platform));
    return Array.from(set).sort();
  }, [rawProblems]);

  // Unique groups list
  const groupsList = useMemo(() => {
    const map = new Map();
    for (const p of rawProblems) {
      const g = getProblemGroup(p);
      if (!map.has(g.id)) {
        map.set(g.id, g);
      }
    }
    return Array.from(map.values()).sort((a, b) => {
      if (typeof a.sortKey === 'number' && typeof b.sortKey === 'number') {
        return a.sortKey - b.sortKey;
      }
      return String(a.sortKey).localeCompare(String(b.sortKey));
    });
  }, [rawProblems, getProblemGroup]);

  // Filtered problems with robust search matching
  const filteredProblems = useMemo(() => {
    return rawProblems.filter(p => {
      const g = getProblemGroup(p);
      if (selectedGroup !== 'All' && g.id !== selectedGroup) return false;
      if (selectedTopic !== 'All' && p.topic !== selectedTopic) return false;
      if (selectedDifficulty !== 'All' && p.difficulty !== selectedDifficulty) return false;
      if (selectedPlatform !== 'All' && p.platform !== selectedPlatform) return false;
      
      const solved = isProblemSolved(p, canonicalSolvedMap);
      if (statusFilter === 'Solved' && !solved) return false;
      if (statusFilter === 'Unsolved' && solved) return false;

      if (searchQuery.trim() && !matchProblem(p, searchQuery)) {
        return false;
      }

      return true;
    });
  }, [rawProblems, getProblemGroup, selectedGroup, selectedTopic, selectedDifficulty, selectedPlatform, statusFilter, searchQuery, canonicalSolvedMap]);

  // Group filtered problems into accordion sections
  const groupedSections = useMemo(() => {
    const groups = {};
    for (const p of filteredProblems) {
      const g = getProblemGroup(p);
      if (!groups[g.id]) {
        groups[g.id] = {
          id: g.id,
          title: g.title,
          sortKey: g.sortKey,
          problems: []
        };
      }
      groups[g.id].problems.push(p);
    }
    return Object.values(groups).sort((a, b) => {
      if (typeof a.sortKey === 'number' && typeof b.sortKey === 'number') {
        return a.sortKey - b.sortKey;
      }
      return String(a.sortKey).localeCompare(String(b.sortKey));
    });
  }, [filteredProblems, getProblemGroup]);

  const toggleGroupExpansion = (groupId) => {
    setExpandedGroups(prev => {
      const current = prev[groupId] !== undefined ? prev[groupId] : true;
      return { ...prev, [groupId]: !current };
    });
  };

  const expandAll = () => {
    const all = {};
    groupsList.forEach((g) => { all[g.id] = true; });
    setExpandedGroups(all);
  };

  const collapseAll = () => {
    const all = {};
    groupsList.forEach((g) => { all[g.id] = false; });
    setExpandedGroups(all);
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Hard':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPlatformBadge = (platform) => {
    switch (platform) {
      case 'LeetCode':
        return {
          pill: 'bg-orange-50 text-orange-800 border-orange-200',
          dot: 'bg-orange-500'
        };
      case 'Codeforces':
        return {
          pill: 'bg-amber-50 text-amber-900 border-amber-200',
          dot: 'bg-amber-500'
        };
      case 'GeeksforGeeks':
        return {
          pill: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-600'
        };
      case 'InterviewBit':
        return {
          pill: 'bg-purple-50 text-purple-800 border-purple-200',
          dot: 'bg-purple-600'
        };
      case 'Coding Ninjas':
        return {
          pill: 'bg-red-50 text-red-800 border-red-200',
          dot: 'bg-red-500'
        };
      default:
        return {
          pill: 'bg-gray-50 text-gray-800 border-gray-200',
          dot: 'bg-gray-500'
        };
    }
  };

  const isSearching = Boolean(searchQuery.trim());

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-12">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-black transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-xs"
            title="Back to all curated sheets"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Sheets</span>
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight font-display">
                {currentSheet.title}
              </h1>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-black text-white font-bold">
                {currentSheet.badge}
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center gap-1">
                <Share2 className="w-3 h-3" /> Cross-Sheet Synced
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {currentSheet.subtitle}
            </p>
          </div>
        </div>

        {/* Action button to expand / collapse */}
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Progress & Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs col-span-2 sm:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-mono">
              Sheet Progress
            </span>
            <span className="text-xs font-mono font-bold text-gray-900">
              {solvedCount} / {totalCount} ({progressPct}%)
            </span>
          </div>
          <ProgressBar
            value={solvedCount}
            max={totalCount}
            color={progressPct >= 75 ? 'emerald' : progressPct >= 40 ? 'blue' : 'amber'}
          />
          <span className="text-[10px] text-gray-400 font-mono mt-1.5 block">
            {totalCount - solvedCount} problems remaining • Common questions auto-sync with other sheets
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <span className="text-[11px] font-mono text-gray-500 uppercase tracking-wider block font-medium">
            Easy
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-700">
              {easySolved}
            </span>
            <span className="text-xs text-gray-400 font-mono">/ {easyTotal}</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">
            {easyTotal > 0 ? Math.round((easySolved / easyTotal) * 100) : 0}% Solved
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <span className="text-[11px] font-mono text-gray-500 uppercase tracking-wider block font-medium">
            Medium
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-extrabold text-amber-700">
              {mediumSolved}
            </span>
            <span className="text-xs text-gray-400 font-mono">/ {mediumTotal}</span>
          </div>
          <span className="text-[10px] text-amber-600 font-medium">
            {mediumTotal > 0 ? Math.round((mediumSolved / mediumTotal) * 100) : 0}% Solved
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <span className="text-[11px] font-mono text-gray-500 uppercase tracking-wider block font-medium">
            Hard
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-extrabold text-rose-700">
              {hardSolved}
            </span>
            <span className="text-xs text-gray-400 font-mono">/ {hardTotal}</span>
          </div>
          <span className="text-[10px] text-rose-600 font-medium">
            {hardTotal > 0 ? Math.round((hardSolved / hardTotal) * 100) : 0}% Solved
          </span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Active Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by problem name, topic, rating, or keywords (e.g. Two Sum, Subarray, DP, 4A)..."
              className="w-full pl-9 pr-9 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black font-medium transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 p-0.5 text-gray-400 hover:text-black rounded-full"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Status Filter Pills & Result Counter */}
          <div className="flex items-center gap-2">
            {isSearching && (
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-semibold whitespace-nowrap">
                {filteredProblems.length} matched
              </span>
            )}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              {['All', 'Unsolved', 'Solved'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                    statusFilter === st
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:text-black hover:bg-gray-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100 text-xs font-mono">
          {/* Group / Phase / Day Dropdown */}
          <div>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 font-medium focus:outline-none focus:border-black"
            >
              <option value="All">All {currentSheet.groupLabel}s ({groupsList.length})</option>
              {groupsList.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>

          {/* Topic Dropdown */}
          <div>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 font-medium focus:outline-none focus:border-black"
            >
              <option value="All">All Topics ({topicsList.length})</option>
              {topicsList.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Dropdown */}
          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 font-medium focus:outline-none focus:border-black"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Platform Dropdown */}
          <div>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 font-medium focus:outline-none focus:border-black"
            >
              <option value="All">All Platforms</option>
              {platformsList.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Problem List Display */}
      {filteredProblems.length === 0 ? (
        <div className="py-12 text-center bg-white border border-gray-200 rounded-3xl p-6">
          <p className="text-sm font-semibold text-gray-700">No problems match your current search/filters</p>
          <p className="text-xs text-gray-400 mt-1">Try resetting search keywords or dropdown selections.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedGroup('All');
              setSelectedTopic('All');
              setSelectedDifficulty('All');
              setSelectedPlatform('All');
              setStatusFilter('All');
            }}
            className="mt-3 px-4 py-2 rounded-xl bg-black text-white text-xs font-semibold shadow-xs hover:bg-neutral-800 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedSections.map((group) => {
            // Guarantee that when a user searches, all matching groups are expanded!
            const isExpanded = isSearching || (expandedGroups[group.id] !== undefined ? expandedGroups[group.id] : true);
            const groupSolvedCount = group.problems.filter(p => isProblemSolved(p, canonicalSolvedMap)).length;
            const isGroupCompleted = groupSolvedCount === group.problems.length && group.problems.length > 0;

            return (
              <div 
                key={group.id} 
                className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden transition-all"
              >
                {/* Group Accordion Header */}
                <div
                  onClick={() => toggleGroupExpansion(group.id)}
                  className="px-5 py-3.5 bg-gray-50/70 hover:bg-gray-100/70 border-b border-gray-200 cursor-pointer flex items-center justify-between transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 hover:text-gray-600 transition-colors">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm font-bold text-gray-900 font-display">
                        {group.title}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                      isGroupCompleted 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-white text-gray-600 border-gray-200'
                    }`}>
                      {groupSolvedCount} / {group.problems.length} Solved
                    </span>
                  </div>
                </div>

                {/* Problems Table / Rows */}
                {isExpanded && (
                  <div className="divide-y divide-gray-100">
                    {group.problems.map((problem) => {
                      const canonKey = getCanonicalKey(problem);
                      const isSolved = isProblemSolved(problem, canonicalSolvedMap);
                      const isRevAdded = Boolean(
                        revisionAddedMap[problem.id] || 
                        revisionAddedMap[canonKey] || 
                        (problem.canonicalKey && revisionAddedMap[problem.canonicalKey])
                      );
                      const platInfo = getPlatformBadge(problem.platform);
                      
                      // Check other sheets that also have this problem
                      const sharedRefs = CANONICAL_TO_SHEETS_MAP[canonKey] || [];
                      const otherSheets = sharedRefs.filter(ref => ref.sheetId !== currentSheet.id);

                      return (
                        <div
                          key={problem.id || canonKey}
                          className={`p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                            isSolved ? 'bg-emerald-50/20' : 'hover:bg-gray-50/50'
                          }`}
                        >
                          {/* Left: Checkbox + Title + Badges */}
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            {/* Solved Checkbox */}
                            <button
                              onClick={(e) => toggleSolved(problem, e)}
                              className="mt-0.5 text-gray-300 hover:text-emerald-600 transition-colors shrink-0"
                              title={isSolved ? 'Mark as Unsolved across all sheets' : 'Mark as Solved across all sheets'}
                            >
                              {isSolved ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-300 hover:text-gray-400" />
                              )}
                            </button>

                            {/* Title & Tags */}
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <a
                                  href={problem.problemUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`text-xs sm:text-sm font-bold hover:underline transition-colors ${
                                    isSolved ? 'line-through text-gray-400' : 'text-gray-900 hover:text-blue-600'
                                  }`}
                                >
                                  {problem.title}
                                </a>

                                <span className="text-[10px] font-mono text-gray-400 font-medium">
                                  #{problem.id ? problem.id.replace(/^[a-z0-9]+_/, '') : canonKey}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] font-mono">
                                {/* Difficulty Pill */}
                                <span className={`px-2 py-0.5 rounded-md font-semibold border ${getDifficultyBadge(problem.difficulty)}`}>
                                  {problem.difficulty}
                                </span>

                                {/* Codeforces Official Rating if present */}
                                {problem.rating && (
                                  <span className="px-2 py-0.5 rounded-md font-bold bg-amber-50 text-amber-900 border border-amber-300">
                                    ★ {problem.rating}
                                  </span>
                                )}

                                {/* Platform Pill */}
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold border ${platInfo.pill}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${platInfo.dot}`} />
                                  {problem.platform}
                                </span>

                                {/* Topic Tag */}
                                <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                                  {problem.topic}
                                </span>

                                {/* Shared Sheets Indicator */}
                                {otherSheets.length > 0 && (
                                  <span 
                                    className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-semibold"
                                    title={`This question also appears in: ${otherSheets.map(s => s.sheetName).join(', ')}`}
                                  >
                                    Also in {otherSheets.map(s => s.sheetName).join(' & ')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center font-mono text-xs">
                            {/* Solution / Guide Link */}
                            {problem.solutionUrl && (
                              <a
                                href={problem.solutionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-black transition-colors text-[11px] font-medium"
                                title="View Editorial & Solution Walkthrough"
                              >
                                <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                                <span>Guide</span>
                              </a>
                            )}

                            {/* Add / Untrack Revision */}
                            <button
                              onClick={(e) => handleToggleRevision(problem, e)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-colors ${
                                isRevAdded
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                                  : 'bg-white hover:bg-gray-50 text-gray-600 hover:text-black border-gray-200'
                              }`}
                              title={isRevAdded ? "Tracked in Revision Suite — click to untrack" : "Add problem to Spaced Repetition Revision queue"}
                            >
                              {isRevAdded ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Tracked</span>
                                </>
                              ) : (
                                <>
                                  <RotateCw className="w-3.5 h-3.5 text-gray-400" />
                                  <span>+ Revision</span>
                                </>
                              )}
                            </button>

                            {/* Direct Platform Solve CTA */}
                            <a
                              href={problem.problemUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-800 text-white font-bold text-xs shadow-xs transition-all"
                            >
                              <span>Solve</span>
                              <ExternalLink className="w-3 h-3 text-white/80" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
