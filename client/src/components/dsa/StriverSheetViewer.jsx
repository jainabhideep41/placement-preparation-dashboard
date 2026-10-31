import React, { useState, useMemo } from 'react';
import { 
  ExternalLink, 
  CheckCircle2, 
  Circle, 
  Search, 
  Filter, 
  ArrowLeft, 
  BookOpen, 
  Sparkles, 
  ChevronDown, 
  ChevronRight, 
  RotateCw,
  Plus,
  Check,
  ListFilter
} from 'lucide-react';
import { striverSdeSheet } from '../../data/striverSdeSheet';
import { useLocalCache } from '../../hooks/useLocalCache';
import { ProgressBar } from '../common/ProgressBar';

export function StriverSheetViewer({ onBack, onAddProblem }) {
  // Solved problems map: { [problemId]: boolean }
  const [solvedMap, setSolvedMap] = useLocalCache('prep_striver_solved_map', {});
  const [revisionAddedMap, setRevisionAddedMap] = useState({});

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Solved' | 'Unsolved'
  const [expandedDays, setExpandedDays] = useState({ 1: true, 2: true });

  // Toggle solved status
  const toggleSolved = (problemId, e) => {
    e?.stopPropagation();
    setSolvedMap(prev => {
      const updated = { ...prev };
      if (updated[problemId]) {
        delete updated[problemId];
      } else {
        updated[problemId] = true;
      }
      return updated;
    });
  };

  // Add to spaced repetition revision queue
  const handleAddToRevision = async (problem, e) => {
    e?.stopPropagation();
    if (onAddProblem) {
      await onAddProblem({
        title: problem.title,
        platform: problem.platform,
        difficulty: problem.difficulty,
        topic: problem.topic,
        url: problem.problemUrl,
        notes: `Imported from Striver SDE Sheet (Day ${problem.day})`,
        revisionInterval: '7d'
      });
      setRevisionAddedMap(prev => ({ ...prev, [problem.id]: true }));
    }
  };

  // Compute metrics
  const totalCount = striverSdeSheet.length;
  const solvedCount = Object.keys(solvedMap).filter(id => solvedMap[id]).length;
  const progressPct = Math.round((solvedCount / totalCount) * 100) || 0;

  const easySolved = striverSdeSheet.filter(p => p.difficulty === 'Easy' && solvedMap[p.id]).length;
  const mediumSolved = striverSdeSheet.filter(p => p.difficulty === 'Medium' && solvedMap[p.id]).length;
  const hardSolved = striverSdeSheet.filter(p => p.difficulty === 'Hard' && solvedMap[p.id]).length;

  const easyTotal = striverSdeSheet.filter(p => p.difficulty === 'Easy').length;
  const mediumTotal = striverSdeSheet.filter(p => p.difficulty === 'Medium').length;
  const hardTotal = striverSdeSheet.filter(p => p.difficulty === 'Hard').length;

  // Unique topics and days
  const topicsList = useMemo(() => {
    const set = new Set(striverSdeSheet.map(p => p.topic));
    return Array.from(set).sort();
  }, []);

  const daysList = useMemo(() => {
    const map = new Map();
    for (const p of striverSdeSheet) {
      if (!map.has(p.day)) {
        map.set(p.day, p.topic);
      }
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, []);

  // Filter problems
  const filteredProblems = useMemo(() => {
    return striverSdeSheet.filter(p => {
      if (selectedDay !== 'All' && p.day !== Number(selectedDay)) return false;
      if (selectedTopic !== 'All' && p.topic !== selectedTopic) return false;
      if (selectedDifficulty !== 'All' && p.difficulty !== selectedDifficulty) return false;
      if (selectedPlatform !== 'All' && p.platform !== selectedPlatform) return false;
      
      const isSolved = Boolean(solvedMap[p.id]);
      if (statusFilter === 'Solved' && !isSolved) return false;
      if (statusFilter === 'Unsolved' && isSolved) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(query);
        const matchTopic = p.topic.toLowerCase().includes(query);
        const matchPattern = p.pattern ? p.pattern.toLowerCase().includes(query) : false;
        if (!matchTitle && !matchTopic && !matchPattern) return false;
      }

      return true;
    });
  }, [selectedDay, selectedTopic, selectedDifficulty, selectedPlatform, statusFilter, searchQuery, solvedMap]);

  // Group filtered problems by Day
  const groupedByDay = useMemo(() => {
    const groups = {};
    for (const p of filteredProblems) {
      if (!groups[p.day]) {
        groups[p.day] = {
          day: p.day,
          topic: p.topic,
          problems: []
        };
      }
      groups[p.day].problems.push(p);
    }
    return Object.values(groups).sort((a, b) => a.day - b.day);
  }, [filteredProblems]);

  const toggleDayExpansion = (day) => {
    setExpandedDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const expandAll = () => {
    const all = {};
    daysList.forEach(([day]) => { all[day] = true; });
    setExpandedDays(all);
  };

  const collapseAll = () => {
    setExpandedDays({});
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
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight font-display">
                Striver's SDE Sheet
              </h1>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-black text-white font-bold">
                180 Questions
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              The gold-standard curated 180 questions for top-tier product interview preparation.
            </p>
          </div>
        </div>

        {/* Action button to solve on platform or toggle expand */}
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:text-black hover:bg-gray-50"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:text-black hover:bg-gray-50"
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
              Total Progress
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
            {totalCount - solvedCount} problems remaining to complete sheet
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
            {Math.round((easySolved / easyTotal) * 100) || 0}% Solved
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
            {Math.round((mediumSolved / mediumTotal) * 100) || 0}% Solved
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
            {Math.round((hardSolved / hardTotal) * 100) || 0}% Solved
          </span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by problem name or topic (e.g. Set Matrix, Two Sum, DP)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black font-medium"
            />
          </div>

          {/* Quick status filter pills */}
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

        {/* Detailed Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100 text-xs font-mono">
          {/* Day Dropdown */}
          <div>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 font-medium focus:outline-none focus:border-black"
            >
              <option value="All">All 27 Days</option>
              {daysList.map(([day, topic]) => (
                <option key={day} value={day}>
                  Day {day}: {topic}
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
              <option value="All">All Topics</option>
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
              <option value="LeetCode">LeetCode (122)</option>
              <option value="GeeksforGeeks">GeeksforGeeks (50)</option>
              <option value="InterviewBit">InterviewBit (6)</option>
              <option value="Coding Ninjas">Coding Ninjas (2)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Problem List Display */}
      {filteredProblems.length === 0 ? (
        <div className="py-12 text-center bg-white border border-gray-200 rounded-3xl p-6">
          <p className="text-sm font-semibold text-gray-700">No problems match your current filters</p>
          <p className="text-xs text-gray-400 mt-1">Try resetting search keywords or dropdown selections.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDay('All');
              setSelectedTopic('All');
              setSelectedDifficulty('All');
              setSelectedPlatform('All');
              setStatusFilter('All');
            }}
            className="mt-3 px-4 py-2 rounded-xl bg-black text-white text-xs font-semibold shadow-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByDay.map((group) => {
            const isExpanded = expandedDays[group.day] ?? true;
            const daySolvedCount = group.problems.filter(p => solvedMap[p.id]).length;
            const isDayCompleted = daySolvedCount === group.problems.length && group.problems.length > 0;

            return (
              <div 
                key={group.day} 
                className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden transition-all"
              >
                {/* Day Accordion Header */}
                <div
                  onClick={() => toggleDayExpansion(group.day)}
                  className="px-5 py-3.5 bg-gray-50/70 hover:bg-gray-100/70 border-b border-gray-200 cursor-pointer flex items-center justify-between transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 hover:text-gray-600 transition-colors">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-black text-white">
                        Day {group.day}
                      </span>
                      <h2 className="text-sm font-bold text-gray-900 font-display">
                        {group.topic}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                      isDayCompleted 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-white text-gray-600 border-gray-200'
                    }`}>
                      {daySolvedCount} / {group.problems.length} Solved
                    </span>
                  </div>
                </div>

                {/* Day Problems Table / Rows */}
                {isExpanded && (
                  <div className="divide-y divide-gray-100">
                    {group.problems.map((problem) => {
                      const isSolved = Boolean(solvedMap[problem.id]);
                      const isRevAdded = Boolean(revisionAddedMap[problem.id]);
                      const platInfo = getPlatformBadge(problem.platform);

                      return (
                        <div
                          key={problem.id}
                          className={`p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                            isSolved ? 'bg-emerald-50/20' : 'hover:bg-gray-50/50'
                          }`}
                        >
                          {/* Left: Checkbox + Title + Badges */}
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            {/* Solved Checkbox */}
                            <button
                              onClick={(e) => toggleSolved(problem.id, e)}
                              className="mt-0.5 text-gray-300 hover:text-emerald-600 transition-colors shrink-0"
                              title={isSolved ? 'Mark as Unsolved' : 'Mark as Solved'}
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
                                  #{problem.id.replace('sde_', '')}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] font-mono">
                                {/* Difficulty Pill */}
                                <span className={`px-2 py-0.5 rounded-md font-semibold border ${getDifficultyBadge(problem.difficulty)}`}>
                                  {problem.difficulty}
                                </span>

                                {/* Platform Pill */}
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold border ${platInfo.pill}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${platInfo.dot}`} />
                                  {problem.platform}
                                </span>

                                {/* Topic Tag */}
                                <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                                  {problem.topic}
                                </span>
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
                                title="View TakeUForward Editorial & Solution"
                              >
                                <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                                <span>Guide</span>
                              </a>
                            )}

                            {/* Add to Revision */}
                            <button
                              onClick={(e) => handleAddToRevision(problem, e)}
                              disabled={isRevAdded}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-colors ${
                                isRevAdded
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
                                  : 'bg-white hover:bg-gray-50 text-gray-600 hover:text-black border-gray-200'
                              }`}
                              title="Add problem to Spaced Repetition Revision queue"
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
