import React, { useState } from 'react';
import { 
  Code2, 
  Search, 
  Plus, 
  Filter, 
  ExternalLink, 
  RotateCw, 
  CheckCircle, 
  Clock, 
  Layers, 
  Sparkles,
  Trophy,
  Activity,
  X
} from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge, DifficultyBadge, StatusBadge } from '../components/common/Badge';
import { LoadingSkeleton, EmptyState } from '../components/common/LoadingSkeleton';
import { REVISION_INTERVALS } from '../utils/constants';
import { StriverSheetViewer } from '../components/dsa/StriverSheetViewer';
import { useLocalCache } from '../hooks/useLocalCache';

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
    updateProblem
  } = dsaHook;

  const [activeTab, setActiveTab] = useState('problems'); // 'problems' | 'platforms' | 'sheets' | 'topics'
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSheetId, setSelectedSheetId] = useState(null); // 'striver_sde' | null
  const [striverSolvedMap] = useLocalCache('prep_striver_solved_map', {});
  const striverSolvedCount = Object.keys(striverSolvedMap).filter(k => striverSolvedMap[k]).length;

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
            {stats.totalSolved ?? 0}
          </span>
          <span className="text-[10px] text-emerald-700 font-mono font-semibold">
            {stats.totalSolved > 0 ? 'Verified Platform Solves' : 'No Solves Recorded'}
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
          My Problems ({problems.length})
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
              {/* Platform Filter */}
              <select
                value={filters.platform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#F4F4F0] border border-black/15 text-black font-medium focus:outline-none focus:border-black"
              >
                <option value="All">All Platforms</option>
                <option value="LeetCode">LeetCode</option>
                <option value="Codeforces">Codeforces</option>
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
            </div>
          </div>

          {/* Table */}
          {problems.length === 0 ? (
            <EmptyState
              icon={Code2}
              title={allProblems.length === 0 ? "No problems tracked yet" : "No problems found matching criteria"}
              description={
                allProblems.length === 0
                  ? "Track a problem using the 'Track New Problem' button, or link your LeetCode / Codeforces handle to import recent submissions."
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
                  {problems.map((p) => (
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
                              className="text-black/40 hover:text-black"
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
                            updateProblem(p.id, {
                              status: p.status === 'Solved' ? 'Unsolved' : 'Solved'
                            })
                          }
                          className="focus:outline-none"
                        >
                          <StatusBadge status={p.status} />
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={p.revisionInterval || '7d'}
                          onChange={(e) =>
                            updateProblem(p.id, {
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
                        <button
                          onClick={() =>
                            updateProblem(p.id, {
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
        selectedSheetId === 'striver_sde' ? (
          <StriverSheetViewer 
            onBack={() => setSelectedSheetId(null)} 
            onAddProblem={addProblem} 
          />
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
              <div>
                <h2 className="text-sm font-bold text-gray-900 font-display">
                  Placement Interview Sheets & Curated Roadmaps
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Select a curated challenge sheet to practice topic-wise questions with direct redirects to solve on LeetCode, GFG, and Coding Ninjas.
                </p>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold self-start sm:self-auto">
                ● 1 Live Interactive Sheet
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sheets.map((sheet) => {
                const isStriver = sheet.id === 'striver_sde';
                const completed = isStriver ? striverSolvedCount : sheet.completedProblems;
                const total = sheet.totalProblems;
                const pct = Math.round((completed / total) * 100);

                return (
                  <div 
                    key={sheet.id} 
                    onClick={() => isStriver && setSelectedSheetId('striver_sde')}
                    className={`p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-4 transition-all ${
                      isStriver 
                        ? 'hover:border-black hover:shadow-md cursor-pointer relative group' 
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-gray-900 font-display group-hover:text-blue-600 transition-colors">
                            {sheet.title}
                          </h3>
                          {isStriver && (
                            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                              Live Interactive
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{sheet.description}</p>
                      </div>
                      <Badge variant={isStriver ? 'blue' : 'neutral'}>{sheet.category}</Badge>
                    </div>

                    <ProgressBar
                      value={completed}
                      max={total}
                      subLabel={`${completed} / ${total} Solved`}
                      color={pct >= 75 ? 'emerald' : pct >= 40 ? 'blue' : 'amber'}
                    />

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 font-mono">
                      <span>Remaining: <strong className="text-gray-900">{total - completed}</strong></span>
                      {isStriver ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSheetId('striver_sde');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black text-white text-xs font-bold shadow-xs hover:bg-neutral-800 transition-all"
                        >
                          <span>Explore & Solve Sheet (180)</span>
                          <span className="text-xs">→</span>
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">Coming Soon</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}

      {/* TAB 4: Topic Mastery */}
      {activeTab === 'topics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((t) => (
            <div key={t.id} className="p-5 rounded-2xl bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-black font-display">{t.name}</span>
                <span className="text-[10px] font-mono uppercase text-black/60 px-2 py-0.5 rounded-lg bg-[#F4F4F0] border border-black/10 font-bold">
                  {t.category}
                </span>
              </div>
              <ProgressBar
                value={t.solved}
                max={t.total}
                subLabel={`${t.solved} / ${t.total}`}
                color={
                  Math.round((t.solved / t.total) * 100) >= 70
                    ? 'emerald'
                    : Math.round((t.solved / t.total) * 100) >= 45
                    ? 'blue'
                    : 'amber'
                }
              />
            </div>
          ))}
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
