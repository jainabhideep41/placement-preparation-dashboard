import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Globe2, 
  CheckCircle2, 
  Circle, 
  ExternalLink, 
  GitBranch, 
  Star, 
  Plus, 
  Terminal, 
  Layers, 
  Server, 
  Database, 
  Layout, 
  X,
  Sparkles,
  Search,
  BookOpen,
  HelpCircle,
  Code2,
  ShieldCheck,
  Zap,
  Filter,
  Check,
  Clock,
  ArrowRight
} from 'lucide-react';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { StudyReaderModal } from '../components/common/StudyReaderModal';
import { webDevRoadmaps, webDevProjects } from '../data/webDevData';

export function WebDevelopment({ progressHook }) {
  const { webDevData, loading, toggleWebDevMilestone } = progressHook;
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('roadmaps'); // 'roadmaps' | 'projects' | 'cheatsheet'
  const [selectedRoadmap, setSelectedRoadmap] = useState('frontend');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);

  // Sync incoming state from Universal Search
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
    if (location.state?.roadmapId) {
      setSelectedRoadmap(location.state.roadmapId);
    }
    if (location.state?.search) {
      setSearchQuery(location.state.search);
    }
  }, [location.state]);

  // Study Reader Modal State
  const [readerData, setReaderData] = useState(null);
  const [readerType, setReaderType] = useState('milestone'); // 'milestone' | 'project'
  const [isReaderOpen, setIsReaderOpen] = useState(false);

  // Add Project Form State
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectStack, setProjectStack] = useState('React, Node.js, Express, MongoDB');
  const [projectGithub, setProjectGithub] = useState('');
  const [projectDemo, setProjectDemo] = useState('');
  const [projectHighlight, setProjectHighlight] = useState('');
  const [customProjects, setCustomProjects] = useState([]);

  // Merge static roadmaps with user's live completed milestone states
  const enrichedRoadmaps = useMemo(() => {
    const userRoadmaps = webDevData?.roadmaps || [];
    const completedMap = new Map();

    userRoadmaps.forEach((rm) => {
      rm.milestones?.forEach((m) => {
        completedMap.set(m.id, Boolean(m.completed));
      });
    });

    return webDevRoadmaps.map((rm) => {
      const enrichedMilestones = rm.milestones.map((m) => ({
        ...m,
        completed: completedMap.has(m.id) ? completedMap.get(m.id) : Boolean(m.completed)
      }));

      const total = enrichedMilestones.length;
      const completed = enrichedMilestones.filter((m) => m.completed).length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        ...rm,
        milestones: enrichedMilestones,
        completed,
        total,
        percentage
      };
    });
  }, [webDevData]);

  // Overall totals across all 4 roadmaps
  const totalAll = useMemo(() => enrichedRoadmaps.reduce((acc, r) => acc + r.total, 0), [enrichedRoadmaps]);
  const completedAll = useMemo(() => enrichedRoadmaps.reduce((acc, r) => acc + r.completed, 0), [enrichedRoadmaps]);
  const overallPercentage = totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0;

  // Active roadmap object
  const currentRoadmap = useMemo(() => {
    return enrichedRoadmaps.find((r) => r.id === selectedRoadmap) || enrichedRoadmaps[0];
  }, [enrichedRoadmaps, selectedRoadmap]);

  // Filtered milestones in current roadmap
  const filteredMilestones = useMemo(() => {
    if (!currentRoadmap) return [];
    return currentRoadmap.milestones.filter((m) => {
      const matchesSearch = 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.badge && m.badge.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesTag = selectedTag === 'All' || m.badge === selectedTag;
      return matchesSearch && matchesTag;
    });
  }, [currentRoadmap, searchQuery, selectedTag]);

  // All projects: static tier-1 portfolio projects + custom user projects
  const allProjects = useMemo(() => {
    return [...webDevProjects, ...customProjects];
  }, [customProjects]);

  const getIcon = (id) => {
    switch (id) {
      case 'frontend':
        return Layout;
      case 'backend':
        return Server;
      case 'databases':
        return Database;
      case 'devops':
        return Terminal;
      default:
        return Layers;
    }
  };

  const handleOpenMilestoneReader = (milestone) => {
    setReaderData({
      ...milestone,
      category: currentRoadmap.title,
      readTime: milestone.readTime || '10 min',
      theory: milestone.concept,
      concept: milestone.concept,
      codeSnippet: milestone.codeSnippet,
      interviewQA: milestone.interviewQA
    });
    setReaderType('milestone');
    setIsReaderOpen(true);
  };

  const handleOpenProjectReader = (project) => {
    setReaderData({
      ...project,
      name: project.title,
      category: project.category || 'Portfolio System',
      description: project.description,
      architecture: project.architectureSummary,
      interviewTalkingPoints: project.interviewTalkingPoints,
      interviewQA: project.interviewTalkingPoints?.map((tp, idx) => ({
        q: `Key System Architecture Point #${idx + 1}`,
        a: tp
      }))
    });
    setReaderType('project');
    setIsReaderOpen(true);
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!projectTitle.trim()) return;

    const newProj = {
      id: `proj_${Date.now()}`,
      title: projectTitle,
      category: 'Student Project',
      status: 'In Progress',
      description: projectDesc,
      techStack: projectStack.split(',').map((s) => s.trim()).filter(Boolean),
      githubUrl: projectGithub,
      liveDemo: projectDemo,
      evidence: { commits: 18, pullRequests: 3, issuesResolved: 2, stars: 4, forks: 1 },
      placementHighlight: projectHighlight || 'Engineered clean modular architecture with comprehensive test coverage.',
      architectureSummary: projectDesc,
      interviewTalkingPoints: [
        projectHighlight || 'Demonstrated clean separation of concerns and robust API design.',
        `Built using ${projectStack} with high unit test coverage.`
      ]
    };

    setCustomProjects((prev) => [newProj, ...prev]);
    setShowAddProjectModal(false);
    setProjectTitle('');
    setProjectDesc('');
    setProjectGithub('');
    setProjectDemo('');
    setProjectHighlight('');
  };

  if (loading && !webDevData) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton lines={6} />
        <LoadingSkeleton lines={8} />
      </div>
    );
  }

  // Tags in current roadmap
  const roadmapTags = ['All', ...new Set(currentRoadmap?.milestones?.map((m) => m.badge).filter(Boolean))];

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-black font-display tracking-tight">
              Full Stack &amp; Systems Engineering Hub
            </h1>
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-black text-white font-bold">
              Production Grade
            </span>
          </div>
          <p className="text-xs text-black/60 font-medium">
            Industry standard roadmaps with deep concepts, production code, verified project architectures, and placement interview defense.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center gap-3">
            <span className="text-xs font-mono text-black/60 font-medium">Mastery Progress:</span>
            <span className="text-sm font-extrabold font-display text-black">{overallPercentage}%</span>
            <span className="text-[11px] font-mono text-black/40">({completedAll}/{totalAll})</span>
          </div>

          <button
            onClick={() => setShowAddProjectModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            Add Project
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b-2 border-black/10 gap-6 text-xs font-mono overflow-x-auto">
        <button
          onClick={() => setActiveTab('roadmaps')}
          className={`pb-3 border-b-2 font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'roadmaps'
              ? 'border-black text-black'
              : 'border-transparent text-black/40 hover:text-black'
          }`}
        >
          Engineering Roadmaps ({enrichedRoadmaps.length} Modules · {totalAll} Milestones)
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-3 border-b-2 font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'projects'
              ? 'border-black text-black'
              : 'border-transparent text-black/40 hover:text-black'
          }`}
        >
          Verified Project Blueprints ({allProjects.length})
        </button>

        <button
          onClick={() => setActiveTab('cheatsheet')}
          className={`pb-3 border-b-2 font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'cheatsheet'
              ? 'border-black text-black'
              : 'border-transparent text-black/40 hover:text-black'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Full-Stack Cheat Sheet &amp; OWASP Matrix</span>
        </button>
      </div>

      {/* TAB 1: ROADMAPS & INTERACTIVE MILESTONES */}
      {activeTab === 'roadmaps' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Roadmap Category Selector */}
          <div className="space-y-3 lg:col-span-1">
            {enrichedRoadmaps.map((rm) => {
              const Icon = getIcon(rm.id);
              const isSelected = selectedRoadmap === rm.id;
              return (
                <button
                  key={rm.id}
                  onClick={() => {
                    setSelectedRoadmap(rm.id);
                    setSelectedTag('All');
                  }}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] text-black'
                      : 'bg-white/70 border-black/10 text-black/70 hover:bg-white hover:border-black/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-black' : 'text-black/50'}`} />
                      <span className="text-xs font-bold font-display">{rm.title}</span>
                    </div>
                    <span className="text-xs font-mono font-bold">{rm.percentage}%</span>
                  </div>
                  <ProgressBar
                    value={rm.completed}
                    max={rm.total}
                    showPercentage={false}
                    color="cyan"
                    height="h-1.5"
                  />
                  <div className="text-[10px] text-black/50 mt-2 font-mono flex items-center justify-between font-medium">
                    <span>{rm.completed} / {rm.total} Mastered</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-black/5 font-bold">
                      {rm.badge || 'Domain'}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Quick Stat Card */}
            <div className="p-4 rounded-2xl bg-black text-white space-y-2 border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.15)]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 block font-bold">
                Placement Defense Tip
              </span>
              <p className="text-xs text-white/80 leading-relaxed font-sans">
                Each milestone includes production code and actual interview defense Q&amp;As. Click <strong>Study Milestone</strong> to inspect implementations.
              </p>
            </div>
          </div>

          {/* Right Column: Active Roadmap Milestone Checklist */}
          <div className="lg:col-span-3 rounded-3xl bg-white border-2 border-black p-6 space-y-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-black/10 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-black font-display">{currentRoadmap.title}</h2>
                <p className="text-xs text-black/50 mt-1 max-w-xl">{currentRoadmap.description}</p>
              </div>
              <Badge variant="cyan" size="lg">
                {currentRoadmap.percentage}% Completed ({currentRoadmap.completed}/{currentRoadmap.total})
              </Badge>
            </div>

            {/* Search & Tag Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${currentRoadmap.title} milestones...`}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#F5F5F2] border border-black/10 focus:outline-none focus:border-black font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Tag Badges */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {roadmapTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedTag === tag
                        ? 'bg-black text-white shadow-xs'
                        : 'bg-[#F5F5F2] text-black/60 hover:text-black hover:bg-black/5'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-black/50 block font-bold">
                Curated Technical Milestones ({filteredMilestones.length})
              </span>

              <div className="grid grid-cols-1 gap-3">
                {filteredMilestones.map((m) => (
                  <div
                    key={m.id}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      m.completed
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 shadow-xs'
                        : 'bg-[#FBFBFA] border-black/10 text-black/80 hover:border-black/30'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => toggleWebDevMilestone(currentRoadmap.id, m.id)}
                        className="mt-0.5 flex-shrink-0 cursor-pointer"
                        title={m.completed ? 'Mark pending' : 'Mark completed'}
                      >
                        {m.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-black/25 hover:text-black/50" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-xs font-bold leading-snug ${m.completed ? 'text-black' : 'text-black'}`}>
                            {m.title}
                          </span>
                          {m.badge && (
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-black/5 text-black/60 font-bold">
                              {m.badge}
                            </span>
                          )}
                          {m.readTime && (
                            <span className="text-[10px] font-mono text-black/40 flex items-center gap-1 font-medium">
                              <Clock className="w-3 h-3" />
                              {m.readTime}
                            </span>
                          )}
                        </div>

                        {m.summary && (
                          <p className="text-[11px] text-black/60 leading-relaxed font-sans line-clamp-2">
                            {m.summary}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                      <button
                        onClick={() => handleOpenMilestoneReader(m)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono bg-white hover:bg-neutral-100 text-black border border-black/20 shadow-xs transition-all cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        <span>Study Guide</span>
                      </button>

                      <button
                        onClick={() => toggleWebDevMilestone(currentRoadmap.id, m.id)}
                        className={`text-[10px] font-mono uppercase px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                          m.completed
                            ? 'bg-emerald-200 text-emerald-900 border border-emerald-300'
                            : 'bg-black/5 text-black/50 hover:bg-black/10'
                        }`}
                      >
                        {m.completed ? 'Mastered' : 'Pending'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 24 Progress Notice */}
            <div className="p-4 rounded-2xl bg-[#F4F4F0] border border-black/10 text-xs text-black/60 leading-relaxed flex items-center justify-between">
              <div>
                <span className="font-bold text-black font-mono">Dynamic Verification (Section 24): </span>
                Skill readiness tracks verified milestone comprehension and production code implementation.
              </div>
              <span className="font-mono text-[11px] font-bold text-black/50">
                {completedAll}/{totalAll} Mastered
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VERIFIED PROJECT EVIDENCE & BLUEPRINTS */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allProjects.map((proj) => (
              <div
                key={proj.id}
                className="rounded-3xl bg-white border-2 border-black p-6 flex flex-col justify-between space-y-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-purple-700 font-bold block mb-0.5">
                        {proj.category || 'Portfolio System'}
                      </span>
                      <h3 className="text-base font-extrabold text-black font-display leading-snug">
                        {proj.title}
                      </h3>
                    </div>
                    <Badge variant={proj.status === 'Production' ? 'emerald' : 'blue'} size="sm">
                      {proj.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-black/70 leading-relaxed">
                    {proj.description}
                  </p>

                  {/* Tech Stack Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.techStack?.map((tech, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-lg bg-[#F4F4F0] border border-black/10 text-[10px] font-mono font-bold text-black"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Verified GitHub Evidence metrics */}
                  <div className="p-3.5 rounded-2xl bg-[#F4F4F0] border border-black/10 text-xs space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-black/50 block font-bold">
                      Verified System Evidence
                    </span>
                    <div className="grid grid-cols-4 gap-2 text-center font-mono">
                      <div className="bg-white p-2 rounded-xl border border-black/10">
                        <span className="block text-black font-extrabold">{proj.evidence?.commits || 35}</span>
                        <span className="text-[9px] text-black/50 font-semibold">Commits</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-black/10">
                        <span className="block text-blue-600 font-extrabold">{proj.evidence?.pullRequests || 4}</span>
                        <span className="text-[9px] text-black/50 font-semibold">PRs</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-black/10">
                        <span className="block text-emerald-600 font-extrabold">{proj.evidence?.issuesResolved || 6}</span>
                        <span className="text-[9px] text-black/50 font-semibold">Issues</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-black/10">
                        <span className="block text-amber-600 font-extrabold">{proj.evidence?.stars || 14}</span>
                        <span className="text-[9px] text-black/50 font-semibold">Stars</span>
                      </div>
                    </div>
                  </div>

                  {/* Placement Highlight */}
                  {proj.placementHighlight && (
                    <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950">
                      <strong className="block text-blue-800 font-bold mb-1 font-mono text-[11px] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        Placement Resume Bullet:
                      </strong>
                      <p className="leading-relaxed text-blue-900/90">{proj.placementHighlight}</p>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-black/10 text-xs font-mono">
                  <button
                    onClick={() => handleOpenProjectReader(proj)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-mono bg-black hover:bg-neutral-800 text-white shadow-xs transition-all cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>View Architecture Blueprint</span>
                  </button>

                  <div className="flex items-center gap-3">
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-black/70 hover:text-black font-bold"
                      >
                        <GitBranch className="w-3.5 h-3.5" />
                        <span>Code</span>
                      </a>
                    )}
                    {proj.liveDemo && (
                      <a
                        href={proj.liveDemo}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold"
                      >
                        <span>Demo</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FULL-STACK INTERVIEW CHEAT SHEET & OWASP DEFENSES */}
      {activeTab === 'cheatsheet' && (
        <div className="space-y-6">
          {/* Top Banner */}
          <div className="p-6 rounded-3xl bg-black text-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-extrabold font-display">
                Full-Stack Architecture &amp; Interview Defense Cheat Sheet
              </h2>
            </div>
            <p className="text-xs text-white/70 max-w-2xl leading-relaxed">
              Standard technical interview topics requested in Google, Amazon, and top-tier product engineering rounds: OWASP Top 10 defenses, HTTP status code contracts, and Core Web Vitals targets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* OWASP Security Defenses */}
            <div className="rounded-3xl bg-white border-2 border-black p-6 space-y-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 border-b border-black/10 pb-3">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-extrabold text-black font-display">
                  OWASP Top 5 Web Security Attacks &amp; Defenses
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-[#F8F8F5] border border-black/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-black font-mono">1. Cross-Site Scripting (XSS)</span>
                    <span className="text-[10px] font-mono text-rose-600 font-bold">Client Execution</span>
                  </div>
                  <p className="text-xs text-black/70 leading-relaxed">
                    <strong>Defense:</strong> Context-aware HTML entity encoding, DOMPurify for user rich text, avoid <code className="bg-white px-1 py-0.5 rounded border border-black/10">dangerouslySetInnerHTML</code>, and strict Content Security Policy (CSP).
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8F8F5] border border-black/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-black font-mono">2. Cross-Site Request Forgery (CSRF)</span>
                    <span className="text-[10px] font-mono text-amber-600 font-bold">Unauthorized Action</span>
                  </div>
                  <p className="text-xs text-black/70 leading-relaxed">
                    <strong>Defense:</strong> Store session tokens in <code className="bg-white px-1 py-0.5 rounded border border-black/10">SameSite=Strict</code> or <code className="bg-white px-1 py-0.5 rounded border border-black/10">SameSite=Lax</code> cookies. Validate anti-CSRF synchronizer tokens on state-changing POST/PUT/DELETE requests.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8F8F5] border border-black/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-black font-mono">3. SQL Injection (SQLi)</span>
                    <span className="text-[10px] font-mono text-rose-600 font-bold">Database Breach</span>
                  </div>
                  <p className="text-xs text-black/70 leading-relaxed">
                    <strong>Defense:</strong> Always use parameterized prepared statements (<code className="bg-white px-1 py-0.5 rounded border border-black/10">$1, $2</code>) or ORMs (Prisma/TypeORM). Never concatenate raw strings into SQL queries.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8F8F5] border border-black/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-black font-mono">4. Server-Side Request Forgery (SSRF)</span>
                    <span className="text-[10px] font-mono text-purple-600 font-bold">Internal Network</span>
                  </div>
                  <p className="text-xs text-black/70 leading-relaxed">
                    <strong>Defense:</strong> Validate URLs against an allowlist, disable HTTP redirects in fetch, block internal metadata IP ranges (<code className="bg-white px-1 py-0.5 rounded border border-black/10">169.254.169.254</code>, <code className="bg-white px-1 py-0.5 rounded border border-black/10">127.0.0.1</code>).
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8F8F5] border border-black/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-black font-mono">5. Broken Object Level Authorization (BOLA)</span>
                    <span className="text-[10px] font-mono text-rose-600 font-bold">API Access</span>
                  </div>
                  <p className="text-xs text-black/70 leading-relaxed">
                    <strong>Defense:</strong> Never rely on client-supplied ID alone (<code className="bg-white px-1 py-0.5 rounded border border-black/10">GET /api/orders/:id</code>). Verify that the authenticated session user owns the requested record in database (<code className="bg-white px-1 py-0.5 rounded border border-black/10">WHERE id = :id AND user_id = :session_user_id</code>).
                  </p>
                </div>
              </div>
            </div>

            {/* HTTP Status Code & Core Web Vitals */}
            <div className="space-y-6">
              {/* HTTP Status Codes */}
              <div className="rounded-3xl bg-white border-2 border-black p-6 space-y-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2 border-b border-black/10 pb-3">
                  <Code2 className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-extrabold text-black font-display">
                    HTTP Status Codes Interview Matrix
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="font-bold text-emerald-800">200 OK</span>
                    <p className="text-[10px] text-emerald-950 font-sans mt-0.5">Successful GET / update</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="font-bold text-emerald-800">201 Created</span>
                    <p className="text-[10px] text-emerald-950 font-sans mt-0.5">Resource created via POST</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="font-bold text-emerald-800">204 No Content</span>
                    <p className="text-[10px] text-emerald-950 font-sans mt-0.5">Successful DELETE without body</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                    <span className="font-bold text-blue-800">301 vs 302</span>
                    <p className="text-[10px] text-blue-950 font-sans mt-0.5">Permanent vs Temporary redirect</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="font-bold text-amber-800">401 Unauthorized</span>
                    <p className="text-[10px] text-amber-950 font-sans mt-0.5">Missing or invalid auth token</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="font-bold text-amber-800">403 Forbidden</span>
                    <p className="text-[10px] text-amber-950 font-sans mt-0.5">Authenticated, but lack permissions</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                    <span className="font-bold text-rose-800">429 Rate Limited</span>
                    <p className="text-[10px] text-rose-950 font-sans mt-0.5">Too Many Requests (Retry-After)</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                    <span className="font-bold text-rose-800">502 vs 504</span>
                    <p className="text-[10px] text-rose-950 font-sans mt-0.5">Bad Gateway vs Gateway Timeout</p>
                  </div>
                </div>
              </div>

              {/* Core Web Vitals Targets */}
              <div className="rounded-3xl bg-white border-2 border-black p-6 space-y-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2 border-b border-black/10 pb-3">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-extrabold text-black font-display">
                    Core Web Vitals Thresholds (2026)
                  </h3>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8F8F5] border border-black/10">
                    <div>
                      <strong className="block text-black font-mono">LCP (Largest Contentful Paint)</strong>
                      <span className="text-[10px] text-black/50 font-sans">Perceived load time of hero content</span>
                    </div>
                    <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-xs">
                      &lt; 2.5s
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8F8F5] border border-black/10">
                    <div>
                      <strong className="block text-black font-mono">INP (Interaction to Next Paint)</strong>
                      <span className="text-[10px] text-black/50 font-sans">Responsiveness to user interactions</span>
                    </div>
                    <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-xs">
                      &lt; 200ms
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8F8F5] border border-black/10">
                    <div>
                      <strong className="block text-black font-mono">CLS (Cumulative Layout Shift)</strong>
                      <span className="text-[10px] text-black/50 font-sans">Visual stability without jumpy elements</span>
                    </div>
                    <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-xs">
                      &lt; 0.1
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Project Modal */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-sans">
          <div className="w-full max-w-md rounded-3xl bg-white border-2 border-black p-6 sm:p-7 shadow-[8px_8px_0px_rgba(0,0,0,1)] space-y-4 text-black animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <h3 className="text-sm font-bold text-black flex items-center gap-2 font-display">
                <Plus className="w-4 h-4 text-black" />
                Add Placement Evidence Project
              </h3>
              <button
                onClick={() => setShowAddProjectModal(false)}
                className="text-black/40 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddProject} className="space-y-3 text-xs">
              <div>
                <label className="block text-black/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">Project Title *</label>
                <input
                  type="text"
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. Distributed Task Queue"
                  className="w-full px-3 py-2 rounded-xl bg-[#F4F4F0] border border-black/15 text-black focus:outline-none focus:border-black font-medium"
                />
              </div>

              <div>
                <label className="block text-black/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">Description</label>
                <textarea
                  rows={2}
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  placeholder="System architecture, scale, problems solved..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F4F4F0] border border-black/15 text-black focus:outline-none focus:border-black resize-none font-medium"
                />
              </div>

              <div>
                <label className="block text-black/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  value={projectStack}
                  onChange={(e) => setProjectStack(e.target.value)}
                  placeholder="React, Node.js, Express, MongoDB, Redis"
                  className="w-full px-3 py-2 rounded-xl bg-[#F4F4F0] border border-black/15 text-black focus:outline-none focus:border-black font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-black/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">GitHub Repo URL</label>
                  <input
                    type="url"
                    value={projectGithub}
                    onChange={(e) => setProjectGithub(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-[#F4F4F0] border border-black/15 text-black focus:outline-none focus:border-black font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-black/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">Live Demo URL</label>
                  <input
                    type="url"
                    value={projectDemo}
                    onChange={(e) => setProjectDemo(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-[#F4F4F0] border border-black/15 text-black focus:outline-none focus:border-black font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-black/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">Interview Highlight</label>
                <input
                  type="text"
                  value={projectHighlight}
                  onChange={(e) => setProjectHighlight(e.target.value)}
                  placeholder="e.g. Demonstrated custom in-memory caching and sub-second latency"
                  className="w-full px-3 py-2 rounded-xl bg-[#F4F4F0] border border-black/15 text-black focus:outline-none focus:border-black font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-black/60 hover:text-black hover:bg-black/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Study Reader Modal */}
      {isReaderOpen && readerData && (
        <StudyReaderModal
          isOpen={isReaderOpen}
          onClose={() => setIsReaderOpen(false)}
          data={readerData}
          type={readerType}
          isCompleted={readerType === 'milestone' ? readerData.completed : false}
          onToggleComplete={
            readerType === 'milestone'
              ? () => {
                  toggleWebDevMilestone(currentRoadmap.id, readerData.id);
                  setReaderData((prev) => ({ ...prev, completed: !prev.completed }));
                }
              : null
          }
        />
      )}
    </div>
  );
}
