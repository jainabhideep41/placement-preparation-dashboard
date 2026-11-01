import React, { useState, useEffect, useMemo } from 'react';
import { 
  Code2, 
  Search, 
  Plus, 
  Filter, 
  ExternalLink, 
  RotateCw, 
  CheckCircle, 
  CheckCircle2,
  Circle,
  Clock, 
  Layers, 
  Sparkles, 
  Trophy, 
  Activity, 
  X,
  Share2,
  ChevronDown,
  ChevronUp,
  Trash2
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { MetricCard } from '../components/common/MetricCard';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge, DifficultyBadge, StatusBadge } from '../components/common/Badge';
import { LoadingSkeleton, EmptyState } from '../components/common/LoadingSkeleton';
import { REVISION_INTERVALS } from '../utils/constants';
import { CuratedSheetViewer } from '../components/dsa/CuratedSheetViewer';
import { useLocalCache } from '../hooks/useLocalCache';
import { 
  CANONICAL_STORAGE_KEY,
  ALL_UNIQUE_PROBLEMS,
  getUniqueSolvedStats,
  getSheetSolvedCount,
  isProblemSolved,
  toggleCanonicalSolvedState,
  matchProblem,
  migrateLegacySolvedMaps,
  getTopicMasteryStats,
  getCanonicalKey
} from '../utils/curatedSheetsManager';
import { striverSdeSheet } from '../data/striverSdeSheet';
import { blind75Sheet } from '../data/blind75Sheet';
import { neetcode150Sheet } from '../data/neetcode150Sheet';
import { cpEssentialsSheet } from '../data/cpEssentialsSheet';

export function DSA({ dsaHook }) {
  const {
    data,
    loading,
    problems,
    allProblems,
    dueRevisionCount,
    filters,
    setFilterTopic,
    setFilterDifficulty,
    setFilterPlatform,
    setFilterStatus,
    setSearchQuery,
    addProblem,
    updateProblem,
    deleteProblem
  } = dsaHook;

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'problems'; // 'problems' | 'platforms' | 'sheets' | 'topics'
  const setActiveTab = (tab) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (tab === 'problems') next.delete('tab');
      else next.set('tab', tab);
      return next;
    }, { replace: false });
  };

  const selectedSheetId = searchParams.get('sheet') || null;
  const setSelectedSheetId = (sheetId) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (sheetId) {
        next.set('tab', 'sheets');
        next.set('sheet', sheetId);
      } else {
        next.delete('sheet');
      }
      return next;
    }, { replace: false });
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [curatedSearchQuery, setCuratedSearchQuery] = useState('');
  const [expandedTopicId, setExpandedTopicId] = useState(null);

  // Synchronized Canonical Solved Map across all sheets
  const [canonicalSolvedMap, setCanonicalSolvedMap] = useLocalCache(CANONICAL_STORAGE_KEY, {});

  // Migrate legacy solved maps if any exist
  useEffect(() => {
    const migrated = migrateLegacySolvedMaps();
    if (migrated && Object.keys(migrated).length > 0) {
      setCanonicalSolvedMap(prev => ({ ...prev, ...migrated }));
    }
  }, [setCanonicalSolvedMap]);

  // Overall unique solved stats across all sheets (365 unique problems)
  const uniqueStats = useMemo(() => {
    return getUniqueSolvedStats(canonicalSolvedMap);
  }, [canonicalSolvedMap]);

  const sheetProblemsMap = useMemo(() => ({
    all_unique: ALL_UNIQUE_PROBLEMS,
    striver_sde: striverSdeSheet,
    blind_75: blind75Sheet,
    neetcode_150: neetcode150Sheet,
    cp_essentials: cpEssentialsSheet
  }), []);

  const getSheetSolvedCountById = (sheetId) => {
    const list = sheetProblemsMap[sheetId] || [];
    return getSheetSolvedCount(list, canonicalSolvedMap);
  };

  // Merged problems: custom manual problems + any solved curated problems
  const mergedProblems = useMemo(() => {
    const list = [...(allProblems || [])];
    const seenKeys = new Set(list.map(p => getCanonicalKey(p) || p.title?.toLowerCase()));

    for (const prob of ALL_UNIQUE_PROBLEMS) {
      if (isProblemSolved(prob, canonicalSolvedMap)) {
        const key = prob.canonicalKey;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          list.unshift({
            id: prob.id || `curated_${key}`,
            title: prob.title,
            platform: prob.platform,
            difficulty: prob.difficulty,
            topic: prob.topic,
            url: prob.problemUrl,
            status: 'Solved',
            revisionStatus: 'Done',
            revisionInterval: '7d',
            lastReviewed: new Date().toISOString().split('T')[0],
            notes: `Solved via Curated Sheets (${prob.sheets?.map(s => s.sheetName).join(', ') || 'PrepStack'})`,
            canonicalKey: key
          });
        }
      }
    }

    return list;
  }, [allProblems, canonicalSolvedMap]);

  // Filtered merged problems for Tab 1
  const filteredMergedProblems = useMemo(() => {
    return mergedProblems.filter(p => {
      if (filters.topic !== 'All' && p.topic !== filters.topic) return false;
      if (filters.difficulty !== 'All' && p.difficulty !== filters.difficulty) return false;
      if (filters.platform !== 'All' && p.platform !== filters.platform) return false;
      if (filters.status !== 'All' && p.status !== filters.status && p.revisionStatus !== filters.status) return false;
      if (filters.search && filters.search.trim() !== '') {
        const query = filters.search.toLowerCase();
        const matchTitle = p.title?.toLowerCase().includes(query);
        const matchTopic = p.topic?.toLowerCase().includes(query);
        const matchNotes = p.notes?.toLowerCase().includes(query);
        if (!matchTitle && !matchTopic && !matchNotes) return false;
      }
      return true;
    });
  }, [mergedProblems, filters]);

  // Dynamic Topic Mastery Stats calculated from canonical solved problems & manual problems
  const dynamicTopicMastery = useMemo(() => {
    return getTopicMasteryStats(canonicalSolvedMap, mergedProblems);
  }, [canonicalSolvedMap, mergedProblems]);

  // New problem form state
  const [newTitle, setNewTitle] = useState('');
  const [newPlatform, setNewPlatform] = useState('LeetCode');
  const [newDifficulty, setNewDifficulty] = useState('Medium');
  const [newTopic, setNewTopic] = useState('Arrays & Two Pointers');
  const [newUrl, setNewUrl] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newInterval, setNewInterval] = useState('7d');

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton lines={6} />
        <LoadingSkeleton lines={8} />
      </div>
    );
  }

  const platforms = data?.platforms || {};
  const topics = data?.topics || [];
  const sheets = data?.sheets || [];
  const stats = data?.stats || {};

  const handleCreateProblem = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await addProblem({
      title: newTitle,
      platform: newPlatform,
      difficulty: newDifficulty,
      topic: newTopic,
      url: newUrl,
      notes: newNotes,
      revisionInterval: newInterval
    });

    // Reset form
    setNewTitle('');
    setNewUrl('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const handleUpdateMergedProblem = async (problem, changes) => {
    // If problem is from curated sheet, update canonical solved state
    if (problem.canonicalKey || problem.id?.startsWith('curated_') || ALL_UNIQUE_PROBLEMS.some(u => u.title?.toLowerCase() === problem.title?.toLowerCase())) {
      if (changes.status !== undefined) {
        setCanonicalSolvedMap(prev => toggleCanonicalSolvedState(problem, prev));
      }
    }

    if (problem.id?.startsWith('curated_')) {
      // If user is editing interval or notes on a curated item, persist to problem store
      if (changes.revisionInterval || changes.revisionStatus || changes.notes) {
        await addProblem({
          title: problem.title,
          platform: problem.platform,
          difficulty: problem.difficulty,
          topic: problem.topic,
          url: problem.url || problem.problemUrl,
          notes: changes.notes || problem.notes,
          revisionInterval: changes.revisionInterval || problem.revisionInterval || '7d',
          revisionStatus: changes.revisionStatus || (changes.revisionInterval === 'mastered' ? 'Mastered' : 'Done'),
          status: changes.status || problem.status || 'Solved'
        });
      }
    } else {
      updateProblem(problem.id, changes);
    }
  };

  const handleDeleteMergedProblem = async (problem) => {
    if (!problem) return;
    const canonKey = problem.canonicalKey || getCanonicalKey(problem);
    const titleKey = 'title:' + (problem.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    // Find any matching unique problem entry
    const matchingUnique = ALL_UNIQUE_PROBLEMS.find(u => 
      u.canonicalKey === canonKey || 
      getCanonicalKey(u) === canonKey ||
      (problem.title && u.title?.toLowerCase() === problem.title?.toLowerCase())
    );

    // 1. Scrub from canonical solved state across all alias keys
    setCanonicalSolvedMap(prev => {
      const next = { ...prev };
      if (canonKey) delete next[canonKey];
      if (titleKey) delete next[titleKey];
      if (problem.canonicalKey) delete next[problem.canonicalKey];
      if (problem.id) delete next[problem.id];
      if (matchingUnique) {
        delete next[matchingUnique.canonicalKey];
        delete next[matchingUnique.id];
        const refs = CANONICAL_TO_SHEETS_MAP[matchingUnique.canonicalKey] || [];
        for (const ref of refs) {
          delete next[ref.problemId];
        }
      }
      return next;
    });

    // 2. Scrub from prep_revision_added_map in localStorage if present
    try {
      const revRaw = localStorage.getItem('prep_revision_added_map');
      if (revRaw) {
        const revMap = JSON.parse(revRaw);
        delete revMap[problem.id];
        delete revMap[canonKey];
        delete revMap[titleKey];
        if (problem.canonicalKey) delete revMap[problem.canonicalKey];
        if (matchingUnique) {
          delete revMap[matchingUnique.id];
          delete revMap[matchingUnique.canonicalKey];
        }
        localStorage.setItem('prep_revision_added_map', JSON.stringify(revMap));
      }
    } catch (e) {
      // Ignore cache parse error
    }

    // 3. Remove from problem store & React state via deleteProblem
    const matchingInAll = (allProblems || []).find(p => 
      p.id === problem.id || 
      (problem.title && p.title?.toLowerCase() === problem.title?.toLowerCase()) ||
      (canonKey && getCanonicalKey(p) === canonKey)
    );

    if (matchingInAll?.id) {
      await deleteProblem(matchingInAll.id);
    } else if (problem.id) {
      await deleteProblem(problem.id);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-black font-display tracking-tight">
              DSA Preparation Suite
            </h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-black text-white font-bold">
              Codolio Architecture
            </span>
          </div>
          <p className="text-xs text-black/60 font-medium">
            Unified coding-platform aggregation, topic mastery, and spaced repetition revision.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all"
          >
            <Plus className="w-4 h-4 text-white" />
            Track New Problem
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-5 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <span className="text-[11px] font-mono text-black/50 uppercase tracking-wider block font-bold">
            Total Solved
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold font-display text-black mt-1 block">
            {Math.max(stats.totalSolved || 0, uniqueStats.solvedUnique || 0)}
          </span>
          <span className="text-[10px] text-emerald-700 font-mono font-semibold">
            {uniqueStats.solvedUnique > 0 || stats.totalSolved > 0
              ? `${uniqueStats.solvedUnique} / 365 Sheet • ${stats.totalSolved || 0} Platform`
              : 'No Solves Recorded'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <span className="text-[11px] font-mono text-black/50 uppercase tracking-wider block font-bold">
            LeetCode
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold font-display text-blue-600 mt-1 block">
            {platforms.leetcode?.connected ? platforms.leetcode.problemsSolved : 0}
          </span>
          <span className="text-[10px] text-black/50 font-mono font-medium">
            {platforms.leetcode?.connected 
              ? `Rating: ${platforms.leetcode.contestRating || 'Unrated'}`
              : 'Account Not Linked'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <span className="text-[11px] font-mono text-black/50 uppercase tracking-wider block font-bold">
            Codeforces
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold font-display text-amber-600 mt-1 block">
            {platforms.codeforces?.connected ? platforms.codeforces.problemsSolved : 0}
          </span>
          <span className="text-[10px] text-black/50 font-mono font-medium">
            {platforms.codeforces?.connected
              ? `Rating: ${platforms.codeforces.rating} (${platforms.codeforces.rank})`
              : 'Account Not Linked'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <span className="text-[11px] font-mono text-black/50 uppercase tracking-wider block font-bold">
            Revisions Due
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold font-display text-rose-600 mt-1 block">
            {dueRevisionCount}
          </span>
          <span className="text-[10px] text-black/50 font-mono font-medium">Spaced Repetition</span>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex border-b-2 border-black/10 gap-2 sm:gap-6 overflow-x-auto text-xs font-mono">
        <button
          onClick={() => setActiveTab('problems')}
          className={`pb-3 border-b-2 font-bold transition-colors whitespace-nowrap ${
            activeTab === 'problems'
              ? 'border-black text-black'
              : 'border-transparent text-black/40 hover:text-black'
          }`}
        >
          My Problems ({mergedProblems.length})
        </button>

        <button
          onClick={() => setActiveTab('platforms')}
          className={`pb-3 border-b-2 font-bold transition-colors whitespace-nowrap ${
            activeTab === 'platforms'
              ? 'border-black text-black'
              : 'border-transparent text-black/40 hover:text-black'
          }`}
        >
          Platform Analytics
        </button>

        <button
          onClick={() => setActiveTab('sheets')}
          className={`pb-3 border-b-2 font-bold transition-colors whitespace-nowrap ${
            activeTab === 'sheets'
              ? 'border-black text-black'
              : 'border-transparent text-black/40 hover:text-black'
          }`}
        >
          Curated Sheets & Roadmaps
        </button>

        <button
          onClick={() => setActiveTab('topics')}
          className={`pb-3 border-b-2 font-bold transition-colors whitespace-nowrap ${
            activeTab === 'topics'
              ? 'border-black text-black'
              : 'border-transparent text-black/40 hover:text-black'
          }`}
        >
          Topic Mastery
        </button>
      </div>

      {/* TAB 1: Problems Table & Search / Filters */}
      {activeTab === 'problems' && (
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <div className="p-4 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-black/40" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search problem title, notes, or tags..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F4F4F0] border border-black/15 text-black placeholder-black/40 focus:outline-none focus:border-black font-medium"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 font-mono">
              {/* Topic Filter */}
              <select
                value={filters.topic}
                onChange={(e) => setFilterTopic(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#F4F4F0] border border-black/15 text-black font-medium focus:outline-none focus:border-black"
              >
                <option value="All">All Topics</option>
                {dynamicTopicMastery.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>

              {/* Platform Filter */}
              <select
                value={filters.platform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#F4F4F0] border border-black/15 text-black font-medium focus:outline-none focus:border-black"
              >
                <option value="All">All Platforms</option>
                <option value="LeetCode">LeetCode</option>
                <option value="Codeforces">Codeforces</option>
                <option value="GeeksforGeeks">GeeksforGeeks</option>
                <option value="Coding Ninjas">Coding Ninjas</option>
                <option value="AtCoder">AtCoder</option>
                <option value="HackerRank">HackerRank</option>
              </select>

              {/* Difficulty Filter */}
              <select
                value={filters.difficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#F4F4F0] border border-black/15 text-black font-medium focus:outline-none focus:border-black"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#F4F4F0] border border-black/15 text-black font-medium focus:outline-none focus:border-black"
              >
                <option value="All">All Statuses</option>
                <option value="Solved">Solved</option>
                <option value="Unsolved">Unsolved</option>
                <option value="Due">Revision Due</option>
                <option value="Mastered">Mastered</option>
              </select>

              {(filters.topic !== 'All' || filters.platform !== 'All' || filters.difficulty !== 'All' || filters.status !== 'All' || filters.search) && (
                <button
                  onClick={() => {
                    setFilterTopic('All');
                    setFilterPlatform('All');
                    setFilterDifficulty('All');
                    setFilterStatus('All');
                    setSearchQuery('');
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-black/20 bg-black/5 hover:bg-black/10 text-[11px] font-bold text-black transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          {filteredMergedProblems.length === 0 ? (
            <EmptyState
              icon={Code2}
              title={mergedProblems.length === 0 ? "No problems tracked yet" : "No problems found matching criteria"}
              description={
                mergedProblems.length === 0
                  ? "Track a problem using the 'Track New Problem' button, or mark questions as solved in Curated Sheets."
                  : "Try adjusting your search query or filters, or add a new problem to your tracker."
              }
              actionText="Track New Problem"
              onAction={() => setShowAddModal(true)}
            />
          ) : (
            <div className="overflow-x-auto rounded-3xl border-2 border-black bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4F4F0] text-black/70 font-mono uppercase tracking-wider border-b-2 border-black/15">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Problem</th>
                    <th className="py-3.5 px-4 font-bold">Platform</th>
                    <th className="py-3.5 px-4 font-bold">Difficulty</th>
                    <th className="py-3.5 px-4 font-bold">Topic</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold">Revision Interval</th>
                    <th className="py-3.5 px-4 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10 font-medium text-black/80">
                  {filteredMergedProblems.map((p) => (
                    <tr key={p.id} className="hover:bg-black/5 transition-colors">
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-black hover:text-blue-600 transition-colors">
                            {p.title}
                          </span>
                          {p.url && (
                            <a
                              href={p.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-black/40 hover:text-black shrink-0"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        {p.notes && (
                          <p className="text-[11px] text-black/50 truncate mt-0.5 max-w-sm">
                            {p.notes}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-black/60 font-medium">{p.platform}</td>

                      <td className="py-3.5 px-4">
                        <DifficultyBadge difficulty={p.difficulty} />
                      </td>

                      <td className="py-3.5 px-4 text-black/70 font-medium">{p.topic}</td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() =>
                            handleUpdateMergedProblem(p, {
                              status: p.status === 'Solved' ? 'Unsolved' : 'Solved'
                            })
                          }
                          className="focus:outline-none"
                          title="Click to toggle Solved status"
                        >
                          <StatusBadge status={p.status} />
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={p.revisionInterval || '7d'}
                          onChange={(e) =>
                            handleUpdateMergedProblem(p, {
                              revisionInterval: e.target.value,
                              revisionStatus: e.target.value === 'mastered' ? 'Mastered' : 'Due'
                            })
                          }
                          className="bg-[#F4F4F0] border border-black/15 text-[11px] rounded-lg px-2 py-1 text-black focus:outline-none font-mono font-medium"
                        >
                          {REVISION_INTERVALS.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleUpdateMergedProblem(p, {
                                revisionStatus: p.revisionStatus === 'Done' ? 'Due' : 'Done'
                              })
                            }
                            className={`text-[11px] px-3 py-1 rounded-xl font-mono font-bold transition-all ${
                              p.revisionStatus === 'Done'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-black/5 hover:bg-black/10 text-black border border-black/15'
                            }`}
                          >
                            {p.revisionStatus === 'Done' ? 'Reviewed' : 'Mark Reviewed'}
                          </button>
                          <button
                            onClick={() => handleDeleteMergedProblem(p)}
                            title="Delete task from review queue"
                            className="p-1.5 rounded-xl text-black/40 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Platform Cards & Real Profiles */}
      {activeTab === 'platforms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* LeetCode Card */}
          <div className="p-6 rounded-3xl bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-blue-600 text-white font-bold shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-black font-display">LeetCode Profile</h3>
                  <span className="text-xs font-mono text-black/50">
                    {platforms.leetcode?.connected ? `@${platforms.leetcode.username}` : 'Not Linked'}
                  </span>
                </div>
              </div>
              <Badge variant={platforms.leetcode?.connected ? 'blue' : 'neutral'}>
                {platforms.leetcode?.connected ? (platforms.leetcode?.ranking || 'Active') : 'Unlinked'}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-[#F4F4F0] border border-black/10">
                <span className="text-[10px] text-emerald-700 block font-bold">Easy</span>
                <span className="text-lg font-bold text-black">{platforms.leetcode?.easy || 0}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F4F4F0] border border-black/10">
                <span className="text-[10px] text-amber-700 block font-bold">Medium</span>
                <span className="text-lg font-bold text-black">{platforms.leetcode?.medium || 0}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F4F4F0] border border-black/10">
                <span className="text-[10px] text-rose-700 block font-bold">Hard</span>
                <span className="text-lg font-bold text-black">{platforms.leetcode?.hard || 0}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-black/60 pt-2 border-t border-black/10 font-mono">
              <span>Contest Rating: <strong className="text-black">{platforms.leetcode?.contestRating || 0}</strong></span>
              <span className={platforms.leetcode?.connected ? 'text-emerald-700 font-bold flex items-center gap-1' : 'text-black/40'}>
                <CheckCircle className="w-3.5 h-3.5" /> {platforms.leetcode?.connected ? 'Synced' : 'Unlinked'}
              </span>
            </div>
          </div>

          {/* Codeforces Card */}
          <div className="p-6 rounded-3xl bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-amber-500 text-white font-bold shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-black font-display">Codeforces Profile</h3>
                  <span className="text-xs font-mono text-black/50">
                    {platforms.codeforces?.connected ? `@${platforms.codeforces.username}` : 'Not Linked'}
                  </span>
                </div>
              </div>
              <Badge variant={platforms.codeforces?.connected ? 'amber' : 'neutral'}>
                {platforms.codeforces?.connected ? (platforms.codeforces?.rank || 'Unrated') : 'Unlinked'}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-[#F4F4F0] border border-black/10">
                <span className="text-[10px] text-black/50 block font-bold">Current Rating</span>
                <span className="text-lg font-bold text-amber-700">{platforms.codeforces?.rating || 0}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F4F4F0] border border-black/10">
                <span className="text-[10px] text-black/50 block font-bold">Max Rating</span>
                <span className="text-lg font-bold text-black">{platforms.codeforces?.maxRating || 0}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F4F4F0] border border-black/10">
                <span className="text-[10px] text-black/50 block font-bold">Contests</span>
                <span className="text-lg font-bold text-blue-600">{platforms.codeforces?.contestsAttended || 0}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-black/60 pt-2 border-t border-black/10 font-mono">
              <span>Solves: <strong className="text-black">{platforms.codeforces?.problemsSolved || 0}</strong></span>
              <span className={platforms.codeforces?.connected ? 'text-emerald-700 font-bold flex items-center gap-1' : 'text-black/40'}>
                <CheckCircle className="w-3.5 h-3.5" /> {platforms.codeforces?.connected ? 'Official API' : 'Unlinked'}
              </span>
            </div>
          </div>

          {/* AtCoder Card */}
          <div className="p-6 rounded-3xl bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-emerald-600 text-white font-bold shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-black font-display">AtCoder</h3>
                  <span className="text-xs font-mono text-black/50">
                    {platforms.atcoder?.connected ? `@${platforms.atcoder.username}` : 'Not Linked'}
                  </span>
                </div>
              </div>
              <Badge variant={platforms.atcoder?.connected ? 'emerald' : 'neutral'}>
                {platforms.atcoder?.connected ? (platforms.atcoder?.rank || 'Active') : 'Unlinked'}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-[#F4F4F0] border border-black/10">
                <span className="text-[10px] text-black/50 block font-bold">Rating</span>
                <span className="text-lg font-bold text-emerald-700">
                  {platforms.atcoder?.connected ? (platforms.atcoder?.rating || 0) : 0}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F4F4F0] border border-black/10">
                <span className="text-[10px] text-black/50 block font-bold">Max Rating</span>
                <span className="text-lg font-bold text-black">
                  {platforms.atcoder?.connected ? (platforms.atcoder?.maxRating || 0) : 0}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F4F4F0] border border-black/10">
                <span className="text-[10px] text-black/50 block font-bold">Solves</span>
                <span className="text-lg font-bold text-blue-600">
                  {platforms.atcoder?.connected ? (platforms.atcoder?.problemsSolved || 0) : 0}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-black/60 pt-2 border-t border-black/10 font-mono">
              <span>Contests: <strong className="text-black">{platforms.atcoder?.connected ? (platforms.atcoder?.contestsAttended || 0) : 0}</strong></span>
              <span className={platforms.atcoder?.connected ? 'text-emerald-700 font-bold flex items-center gap-1' : 'text-black/40'}>
                <CheckCircle className="w-3.5 h-3.5" /> {platforms.atcoder?.connected ? 'Synced' : 'Unlinked'}
              </span>
            </div>
          </div>

          {/* HackerRank Card */}
          <div className="p-6 rounded-3xl bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-purple-600 text-white font-bold shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-black font-display">HackerRank</h3>
                  <span className="text-xs font-mono text-black/50">
                    {platforms.hackerrank?.connected ? `@${platforms.hackerrank.username}` : 'Not Linked'}
                  </span>
                </div>
              </div>
              <Badge variant={platforms.hackerrank?.connected ? 'purple' : 'neutral'}>
                {platforms.hackerrank?.connected ? 'Linked' : 'Unlinked'}
              </Badge>
            </div>

            {platforms.hackerrank?.connected ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-black/80 font-medium">
                  <span>Problem Solving</span>
                  <span className="text-amber-600 font-mono font-bold">★★★★★★ (Gold)</span>
                </div>
                <div className="flex items-center justify-between text-black/80 font-medium">
                  <span>Java Domain</span>
                  <span className="text-amber-600 font-mono font-bold">★★★★★ (Silver)</span>
                </div>
                <div className="flex items-center justify-between text-black/80 font-medium">
                  <span>Python Domain</span>
                  <span className="text-amber-600 font-mono font-bold">★★★★☆</span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-black/40 font-mono">
                Connect HackerRank handle to track domain badges and skill certifications.
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-black/60 pt-2 border-t border-black/10 font-mono">
              <span>Tracked Solves: <strong className="text-black">{platforms.hackerrank?.connected ? (platforms.hackerrank?.problemsSolved || 0) : 0}</strong></span>
              <span className={platforms.hackerrank?.connected ? 'text-emerald-700 font-bold flex items-center gap-1' : 'text-black/40'}>
                <CheckCircle className="w-3.5 h-3.5" /> {platforms.hackerrank?.connected ? 'Profile Synced' : 'Unlinked'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Curated Sheets & Roadmaps */}
      {activeTab === 'sheets' && (
        selectedSheetId ? (
          <CuratedSheetViewer 
            sheetId={selectedSheetId}
            onBack={() => setSelectedSheetId(null)} 
            onAddProblem={addProblem} 
            onDeleteProblem={deleteProblem}
          />
        ) : (
          <div className="space-y-4">
            {/* Unique Questions Header & Sync Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-gray-900 font-display">
                    Curated Placement Sheets & Master Roadmaps
                  </h2>
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center gap-1">
                    <Share2 className="w-3 h-3" /> Cross-Sheet Solved Sync Active
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Solving a question on one sheet automatically marks it solved on all sheets containing it.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                  ● 365 Unique Problems Total
                </span>
              </div>
            </div>

            {/* Consolidated Unique Progress Card */}
            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700 font-mono uppercase tracking-wider">
                  Consolidated Preparation Progress (Unique Questions Only)
                </span>
                <span className="font-mono font-bold text-gray-900">
                  {uniqueStats.solvedUnique} / {uniqueStats.totalUnique} Unique Solved ({uniqueStats.percent}%)
                </span>
              </div>
              <ProgressBar
                value={uniqueStats.solvedUnique}
                max={uniqueStats.totalUnique}
                color={uniqueStats.percent >= 75 ? 'emerald' : uniqueStats.percent >= 40 ? 'blue' : 'amber'}
              />
              <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono pt-1">
                <span>{uniqueStats.totalUnique - uniqueStats.solvedUnique} unique questions remaining</span>
                <span className="text-blue-600 font-semibold">102 questions shared across multiple sheets</span>
              </div>
            </div>

            {/* Global Instant Search across all 365 unique problems */}
            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={curatedSearchQuery}
                  onChange={(e) => setCuratedSearchQuery(e.target.value)}
                  placeholder="Search across all 365 unique questions (e.g. Two Sum, Kadane, Subarray, DP, Watermelon, 4A)..."
                  className="w-full pl-9 pr-9 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black font-medium transition-colors"
                />
                {curatedSearchQuery && (
                  <button
                    onClick={() => setCuratedSearchQuery('')}
                    className="absolute right-2.5 top-2.5 p-0.5 text-gray-400 hover:text-black rounded-full"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Search Results Display OR Sheet Cards */}
            {curatedSearchQuery.trim() ? (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="px-5 py-3 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-gray-700">
                    Search Results ({ALL_UNIQUE_PROBLEMS.filter(p => matchProblem(p, curatedSearchQuery)).length} matching questions)
                  </span>
                  <button 
                    onClick={() => setCuratedSearchQuery('')}
                    className="text-gray-500 hover:text-black underline text-[11px]"
                  >
                    Clear Search
                  </button>
                </div>

                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {ALL_UNIQUE_PROBLEMS.filter(p => matchProblem(p, curatedSearchQuery)).map((problem) => {
                    const isSolved = isProblemSolved(problem, canonicalSolvedMap);
                    return (
                      <div 
                        key={problem.canonicalKey}
                        className={`p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                          isSolved ? 'bg-emerald-50/20' : 'hover:bg-gray-50/50'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCanonicalSolvedMap(prev => toggleCanonicalSolvedState(problem, prev));
                            }}
                            className="mt-0.5 text-gray-300 hover:text-emerald-600 transition-colors shrink-0"
                            title={isSolved ? 'Mark as Unsolved' : 'Mark as Solved across all sheets'}
                          >
                            {isSolved ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-300 hover:text-gray-400" />
                            )}
                          </button>

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
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] font-mono">
                              <span className="px-2 py-0.5 rounded-md font-semibold border bg-gray-100 text-gray-700 border-gray-200">
                                {problem.difficulty}
                              </span>
                              {problem.rating && (
                                <span className="px-2 py-0.5 rounded-md font-bold bg-amber-50 text-amber-900 border border-amber-300">
                                  ★ {problem.rating}
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded-md font-semibold border bg-orange-50 text-orange-800 border-orange-200">
                                {problem.platform}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                                {problem.topic}
                              </span>
                              {problem.sheets?.length > 0 && (
                                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                                  In: {problem.sheets.map(s => s.sheetName).join(' • ')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center font-mono text-xs">
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
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Master Unique Question Bank Card */}
                <div 
                  onClick={() => setSelectedSheetId('all_unique')}
                  className="p-6 rounded-3xl bg-gradient-to-br from-neutral-900 to-black text-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.3)] space-y-4 cursor-pointer hover:scale-[1.01] transition-all relative group md:col-span-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-white font-display">
                          All Curated Problems (Master Question Bank)
                        </h3>
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-black">
                          365 Unique Questions
                        </span>
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-white/20 text-white">
                          Zero Duplicates
                        </span>
                      </div>
                      <p className="text-xs text-white/70 mt-1">
                        Consolidated master challenge list containing all 365 unique problems from Striver, Blind 75, NeetCode 150, and CP Essentials without duplicate repetitions.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/20 shrink-0">
                      Master Bank
                    </span>
                  </div>

                  <ProgressBar
                    value={uniqueStats.solvedUnique}
                    max={uniqueStats.totalUnique}
                    subLabel={`${uniqueStats.solvedUnique} / ${uniqueStats.totalUnique} Unique Solved`}
                    color={uniqueStats.percent >= 75 ? 'emerald' : uniqueStats.percent >= 40 ? 'blue' : 'amber'}
                  />

                  <div className="flex items-center justify-between text-xs text-white/70 pt-2 border-t border-white/10 font-mono">
                    <span>Remaining: <strong className="text-white">{uniqueStats.totalUnique - uniqueStats.solvedUnique}</strong> unique questions</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSheetId('all_unique');
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-black text-xs font-bold shadow-xs hover:bg-neutral-200 transition-all"
                    >
                      <span>Explore All Unique (365)</span>
                      <span className="text-xs">→</span>
                    </button>
                  </div>
                </div>

                {/* Individual 4 Curated Sheets Cards */}
                {sheets.map((sheet) => {
                  const completed = getSheetSolvedCountById(sheet.id);
                  const total = sheet.totalProblems;
                  const pct = Math.round((completed / total) * 100) || 0;

                  return (
                    <div 
                      key={sheet.id} 
                      onClick={() => setSelectedSheetId(sheet.id)}
                      className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-4 transition-all hover:border-black hover:shadow-md cursor-pointer relative group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-gray-900 font-display group-hover:text-blue-600 transition-colors">
                              {sheet.title}
                            </h3>
                            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                              Live Interactive
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{sheet.description}</p>
                        </div>
                        <Badge variant="blue">{sheet.category}</Badge>
                      </div>

                      <ProgressBar
                        value={completed}
                        max={total}
                        subLabel={`${completed} / ${total} Solved`}
                        color={pct >= 75 ? 'emerald' : pct >= 40 ? 'blue' : 'amber'}
                      />

                      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 font-mono">
                        <span>Remaining: <strong className="text-gray-900">{total - completed}</strong></span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSheetId(sheet.id);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black text-white text-xs font-bold shadow-xs hover:bg-neutral-800 transition-all"
                        >
                          <span>Explore & Solve ({total})</span>
                          <span className="text-xs">→</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )
      )}

      {/* TAB 4: Topic Mastery */}
      {activeTab === 'topics' && (
        <div className="space-y-6">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F4F4F0] border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-black font-display uppercase tracking-wide">
                Topic-Wise Curriculum & Mastery
              </h2>
              <p className="text-xs text-black/60 font-medium">
                Live mastery progress across 13 core DSA topics based on your verified platform solves and 365 unique curated problems.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-white border border-black/20 text-black shadow-xs">
                {uniqueStats.solvedUnique} / 365 Unique Solved ({uniqueStats.percent}%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dynamicTopicMastery.map((t) => {
              const isExpanded = expandedTopicId === t.id;
              const pct = t.percent;
              const color = pct >= 70 ? 'emerald' : pct >= 40 ? 'blue' : 'amber';
              const badgeBg = pct >= 70 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                : pct >= 40 
                ? 'bg-blue-50 text-blue-800 border-blue-300' 
                : 'bg-amber-50 text-amber-800 border-amber-300';

              return (
                <div
                  key={t.id}
                  className={`p-5 rounded-2xl bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] space-y-3.5 transition-all ${
                    isExpanded ? 'md:col-span-2 lg:col-span-3 ring-2 ring-black' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-sm font-bold text-black font-display block">{t.name}</span>
                      <span className="text-[10px] font-mono uppercase text-black/50 font-bold">
                        {t.category}
                      </span>
                    </div>
                    <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-lg border ${badgeBg}`}>
                      {t.solved} / {t.total} ({pct}%)
                    </span>
                  </div>

                  <ProgressBar
                    value={t.solved}
                    max={t.total}
                    subLabel={`${t.solved} of ${t.total} problems mastered`}
                    color={color}
                  />

                  {/* Actions: View Questions toggle & Filter in My Problems */}
                  <div className="flex items-center justify-between pt-2 border-t border-black/10 text-xs font-mono">
                    <button
                      onClick={() => setExpandedTopicId(isExpanded ? null : t.id)}
                      className="text-black/70 hover:text-black font-bold flex items-center gap-1 hover:underline"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Hide Problems</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>View {t.problems.length} Problems</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setFilterTopic(t.name);
                        setActiveTab('problems');
                      }}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-bold hover:underline flex items-center gap-1"
                    >
                      Filter in My Problems &rarr;
                    </button>
                  </div>

                  {/* Expanded Problem List for this Topic */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-black/15 space-y-2 max-h-96 overflow-y-auto pr-1">
                      <div className="text-[11px] font-mono text-black/50 font-semibold mb-2">
                        Questions in {t.name} ({t.problems.length} total • {t.solved} solved):
                      </div>
                      <div className="divide-y divide-black/10">
                        {t.problems.map((prob) => {
                          const isSolved = isProblemSolved(prob, canonicalSolvedMap);
                          return (
                            <div
                              key={prob.canonicalKey || prob.id}
                              className={`py-2 px-2.5 rounded-lg flex items-center justify-between gap-3 text-xs transition-colors ${
                                isSolved ? 'bg-emerald-50/50' : 'hover:bg-black/5'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <button
                                  onClick={() => setCanonicalSolvedMap(prev => toggleCanonicalSolvedState(prob, prev))}
                                  className="shrink-0 text-black/30 hover:text-emerald-600 transition-colors"
                                  title={isSolved ? 'Mark as Unsolved across all sheets' : 'Mark as Solved across all sheets'}
                                >
                                  {isSolved ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-black/30 hover:text-black/60" />
                                  )}
                                </button>
                                <span className={`font-medium truncate ${isSolved ? 'line-through text-black/40' : 'text-black'}`}>
                                  {prob.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 font-mono text-[10px]">
                                <DifficultyBadge difficulty={prob.difficulty} />
                                <span className="px-1.5 py-0.5 rounded bg-black/5 text-black/60">
                                  {prob.platform}
                                </span>
                                {prob.problemUrl && (
                                  <a
                                    href={prob.problemUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 rounded bg-black hover:bg-neutral-800 text-white flex items-center gap-1 font-bold px-2"
                                  >
                                    Solve <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Problem Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white border-2 border-black p-6 sm:p-7 shadow-[8px_8px_0px_rgba(0,0,0,1)] space-y-4 text-black">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <h3 className="text-sm font-bold text-black flex items-center gap-2 font-display">
                <Plus className="w-4 h-4 text-black" />
                Track Placement DSA Problem
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-black/40 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProblem} className="space-y-3 text-xs">
              <div>
                <label className="block text-black/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Problem Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Subarray Sum Equals K"
                  className="w-full px-3 py-2 rounded-xl bg-[#F4F4F0] border border-black/15 text-black focus:outline-none focus:border-black font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-black/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Platform
                  </label>
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F4F4F0] border border-black/15 text-black font-medium focus:outline-none"
                  >
                    <option value="LeetCode">LeetCode</option>
                    <option value="Codeforces">Codeforces</option>
                    <option value="AtCoder">AtCoder</option>
                    <option value="HackerRank">HackerRank</option>
                  </select>
                </div>

                <div>
                  <label className="block text-black/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Difficulty
                  </label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F4F4F0] border border-black/15 text-black font-medium focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-black/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Topic Category
                </label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="e.g. Dynamic Programming, Graphs"
                  className="w-full px-3 py-2 rounded-xl bg-[#F4F4F0] border border-black/15 text-black focus:outline-none focus:border-black font-medium"
                />
              </div>

              <div>
                <label className="block text-black/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Problem URL (Optional)
                </label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://leetcode.com/problems/..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F4F4F0] border border-black/15 text-black focus:outline-none focus:border-black font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-black/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Interview Notes / Insights
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Key edge cases, time/space complexity..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F4F4F0] border border-black/15 text-black focus:outline-none focus:border-black resize-none font-medium"
                />
              </div>

              <div>
                <label className="block text-black/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Initial Revision Spacing
                </label>
                <select
                  value={newInterval}
                  onChange={(e) => setNewInterval(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F4F4F0] border border-black/15 text-black font-medium focus:outline-none"
                >
                  <option value="3d">Review in 3 Days (Hard / Unfamiliar)</option>
                  <option value="7d">Review in 7 Days (Standard Pattern)</option>
                  <option value="30d">Review in 30 Days (High Confidence)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-black/60 hover:text-black hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
                >
                  Save Problem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
