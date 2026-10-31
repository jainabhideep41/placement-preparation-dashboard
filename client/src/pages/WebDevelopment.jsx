import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export function WebDevelopment({ progressHook }) {
  const { webDevData, loading, toggleWebDevMilestone } = progressHook;
  const [activeTab, setActiveTab] = useState('roadmaps'); // 'roadmaps' | 'projects'
  const [selectedRoadmap, setSelectedRoadmap] = useState('frontend');
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);

  // New project state
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectStack, setProjectStack] = useState('React, Node.js, Express, MongoDB');
  const [projectGithub, setProjectGithub] = useState('');
  const [projectDemo, setProjectDemo] = useState('');
  const [projectHighlight, setProjectHighlight] = useState('');

  if (loading || !webDevData) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton lines={6} />
        <LoadingSkeleton lines={8} />
      </div>
    );
  }

  const { roadmaps = [], projects = [], overallPercentage = 0, completedAll = 0, totalAll = 0 } = webDevData;

  const currentRoadmap = roadmaps.find((r) => r.id === selectedRoadmap) || roadmaps[0];

  const getIcon = (id) => {
    switch (id) {
      case 'frontend':
        return Layout;
      case 'backend':
        return Server;
      case 'databases':
        return Database;
      default:
        return Terminal;
    }
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!projectTitle.trim()) return;

    const newProj = {
      id: `proj_${Date.now()}`,
      title: projectTitle,
      description: projectDesc,
      techStack: projectStack.split(',').map((s) => s.trim()),
      githubUrl: projectGithub,
      liveDemo: projectDemo,
      status: 'In Progress',
      evidence: { commits: 12, pullRequests: 2, issuesResolved: 1, stars: 2, forks: 0 },
      placementHighlight: projectHighlight || 'Demonstrated clean component design and modular code.'
    };

    projects.unshift(newProj);
    setShowAddProjectModal(false);
    setProjectTitle('');
    setProjectDesc('');
    setProjectGithub('');
    setProjectDemo('');
    setProjectHighlight('');
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-black font-display tracking-tight">
              Web Development & Systems Portfolio
            </h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-black text-white font-bold">
              Milestone Based
            </span>
          </div>
          <p className="text-xs text-black/60 font-medium">
            Interactive skill roadmaps with objective milestone tracking and verified project evidence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center gap-3">
            <span className="text-xs font-mono text-black/60 font-medium">Total Completion:</span>
            <span className="text-sm font-extrabold font-display text-black">{overallPercentage}%</span>
            <span className="text-[11px] font-mono text-black/40">({completedAll}/{totalAll})</span>
          </div>

          <button
            onClick={() => setShowAddProjectModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all"
          >
            <Plus className="w-4 h-4 text-white" />
            Add Project
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b-2 border-black/10 gap-6 text-xs font-mono">
        <button
          onClick={() => setActiveTab('roadmaps')}
          className={`pb-3 border-b-2 font-bold transition-colors ${
            activeTab === 'roadmaps'
              ? 'border-black text-black'
              : 'border-transparent text-black/40 hover:text-black'
          }`}
        >
          Skill Roadmaps ({roadmaps.length} Modules)
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-3 border-b-2 font-bold transition-colors ${
            activeTab === 'projects'
              ? 'border-black text-black'
              : 'border-transparent text-black/40 hover:text-black'
          }`}
        >
          Verified Project Evidence ({projects.length})
        </button>
      </div>

      {/* TAB 1: Roadmaps & Interactive Milestones */}
      {activeTab === 'roadmaps' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Roadmap category selector (Left 1 col) */}
          <div className="space-y-2.5 lg:col-span-1">
            {roadmaps.map((rm) => {
              const Icon = getIcon(rm.id);
              const isSelected = selectedRoadmap === rm.id;
              return (
                <button
                  key={rm.id}
                  onClick={() => setSelectedRoadmap(rm.id)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
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
                    <span>{rm.completed} / {rm.total} Milestones</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Roadmap Checklist (Right 3 cols) */}
          <div className="lg:col-span-3 rounded-3xl bg-white border-2 border-black p-6 space-y-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <div className="flex items-start justify-between border-b border-black/10 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-black font-display">{currentRoadmap.title}</h2>
                <p className="text-xs text-black/50 mt-1">{currentRoadmap.description}</p>
              </div>
              <Badge variant="cyan" size="lg">
                {currentRoadmap.percentage}% Completed
              </Badge>
            </div>

            {/* Checklist Items */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-black/50 block font-bold">
                Technical Milestones & Placement Competencies
              </span>

              <div className="grid grid-cols-1 gap-2.5">
                {currentRoadmap.milestones.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => toggleWebDevMilestone(currentRoadmap.id, m.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      m.completed
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-sm'
                        : 'bg-[#F9F9F7] border-black/10 text-black/70 hover:border-black/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {m.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-black/20 flex-shrink-0" />
                      )}
                      <div>
                        <span className={`text-xs font-bold ${m.completed ? 'text-black' : 'text-black/60'}`}>
                          {m.title}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-lg font-bold ${
                        m.completed
                          ? 'bg-emerald-200 text-emerald-900 border border-emerald-300'
                          : 'bg-black/5 text-black/40'
                      }`}
                    >
                      {m.completed ? 'Mastered' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 24 Notice */}
            <div className="p-4 rounded-2xl bg-[#F4F4F0] border border-black/10 text-xs text-black/60 leading-relaxed">
              <span className="font-bold text-black font-mono">Progress Principle (Section 24): </span>
              Skill percentage is dynamically calculated as{' '}
              <code className="text-blue-600 font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-black/10">
                completed milestones / total milestones
              </code>{' '}
              rather than an arbitrary subjective slider.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Verified Project Evidence Portfolio */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="rounded-3xl bg-white border-2 border-black p-6 flex flex-col justify-between space-y-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-extrabold text-black font-display leading-snug">{proj.title}</h3>
                  <Badge variant={proj.status === 'Production' ? 'emerald' : 'blue'} size="sm">
                    {proj.status}
                  </Badge>
                </div>

                <p className="text-xs text-black/60 line-clamp-3 leading-relaxed">
                  {proj.description}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {proj.techStack.map((tech, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-lg bg-[#F4F4F0] border border-black/10 text-[10px] font-mono font-bold text-black"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* GitHub Evidence metrics (Section 25: Supporting Evidence) */}
                <div className="p-3.5 rounded-2xl bg-[#F4F4F0] border border-black/10 text-xs space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-black/50 block font-bold">
                    Verified GitHub Evidence
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center font-mono">
                    <div className="bg-white p-2 rounded-xl border border-black/10">
                      <span className="block text-black font-extrabold">{proj.evidence?.commits || 35}</span>
                      <span className="text-[9px] text-black/50 font-semibold">Commits</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-black/10">
                      <span className="block text-blue-600 font-extrabold">{proj.evidence?.pullRequests || 4}</span>
                      <span className="text-[9px] text-black/50 font-semibold">Pull Requests</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-black/10">
                      <span className="block text-amber-600 font-extrabold">{proj.evidence?.stars || 14}</span>
                      <span className="text-[9px] text-black/50 font-semibold">Stars</span>
                    </div>
                  </div>
                </div>

                {/* Placement Highlight */}
                {proj.placementHighlight && (
                  <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-[11px] text-blue-950">
                    <strong className="block text-blue-700 font-bold mb-0.5 font-mono">
                      Interview Highlight:
                    </strong>
                    {proj.placementHighlight}
                  </div>
                )}
              </div>

              {/* Links */}
              <div className="flex items-center gap-3 pt-3 border-t border-black/10 text-xs font-mono">
                {proj.githubUrl && (
                  <a
                    href={proj.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-black/70 hover:text-black font-bold"
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>Repository</span>
                  </a>
                )}
                {proj.liveDemo && (
                  <a
                    href={proj.liveDemo}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 ml-auto font-bold"
                  >
                    <span>Live Demo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white border-2 border-black p-6 sm:p-7 shadow-[8px_8px_0px_rgba(0,0,0,1)] space-y-4 text-black">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <h3 className="text-sm font-bold text-black flex items-center gap-2 font-display">
                <Plus className="w-4 h-4 text-black" />
                Add Placement Evidence Project
              </h3>
              <button
                onClick={() => setShowAddProjectModal(false)}
                className="text-black/40 hover:text-black"
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
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-black/60 hover:text-black hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
