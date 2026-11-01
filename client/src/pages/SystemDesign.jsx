import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  ServerCog, 
  CheckCircle2, 
  Circle, 
  Cpu, 
  Network, 
  Database, 
  Layers, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw,
  Sliders,
  Globe,
  HardDrive,
  Search,
  BookOpen,
  HelpCircle,
  FileText,
  Filter
} from 'lucide-react';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { StudyReaderModal } from '../components/common/StudyReaderModal';
import { systemDesignTopics, systemDesignCaseStudies } from '../data/systemDesignData';

export function SystemDesign({ progressHook }) {
  const { sysDesignData, loading, toggleSysDesignTopic, updateCaseStudyStatus } = progressHook;
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('topics'); // 'topics' | 'casestudies' | 'architecture' | 'cheatsheet'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Reader Modal State
  const [readerData, setReaderData] = useState(null);
  const [readerType, setReaderType] = useState('topic'); // 'topic' | 'casestudy'
  const [isReaderOpen, setIsReaderOpen] = useState(false);

  // Sync incoming state from Universal Search
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
    if (location.state?.search) {
      setSearchQuery(location.state.search);
    }
    if (location.state?.topicId) {
      const topic = systemDesignTopics.find(t => t.id === location.state.topicId);
      if (topic) {
        setReaderData(topic);
        setReaderType('topic');
        setIsReaderOpen(true);
      }
    } else if (location.state?.caseStudyId) {
      const cs = systemDesignCaseStudies.find(c => c.id === location.state.caseStudyId);
      if (cs) {
        setReaderData(cs);
        setReaderType('casestudy');
        setIsReaderOpen(true);
      }
    }
  }, [location.state]);

  // Interactive Architecture Simulation State
  const [simulationCacheHit, setSimulationCacheHit] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [activeNode, setActiveNode] = useState(1);

  // Merge rich static content with user's live progress state
  const enrichedTopics = useMemo(() => {
    const userTopics = sysDesignData?.topics || [];
    const completedMap = new Map(userTopics.map(t => [t.id, t.completed]));

    return systemDesignTopics.map(topic => ({
      ...topic,
      completed: Boolean(completedMap.get(topic.id))
    }));
  }, [sysDesignData]);

  const enrichedCaseStudies = useMemo(() => {
    const userCS = sysDesignData?.caseStudies || [];
    const statusMap = new Map(userCS.map(c => [c.id, c.status]));

    return systemDesignCaseStudies.map(cs => ({
      ...cs,
      status: statusMap.get(cs.id) || cs.status || 'Planned'
    }));
  }, [sysDesignData]);

  // Filter topics
  const filteredTopics = useMemo(() => {
    return enrichedTopics.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.milestones.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [enrichedTopics, searchQuery, selectedCategory]);

  // Filter case studies
  const filteredCaseStudies = useMemo(() => {
    return enrichedCaseStudies.filter(cs => {
      const matchesSearch = cs.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            cs.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            cs.keyConcepts.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || cs.category === selectedCategory || cs.difficulty === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [enrichedCaseStudies, searchQuery, selectedCategory]);

  const completedCount = enrichedTopics.filter(t => t.completed).length;
  const totalCount = enrichedTopics.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading && !sysDesignData) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton lines={6} />
        <LoadingSkeleton lines={8} />
      </div>
    );
  }

  const runSimulation = (cacheHit) => {
    setSimulating(true);
    setSimulationCacheHit(cacheHit);
    setActiveNode(Math.floor(Math.random() * 3) + 1);
    setTimeout(() => {
      setSimulating(false);
    }, 1200);
  };

  const openTopicReader = (topic) => {
    setReaderData(topic);
    setReaderType('topic');
    setIsReaderOpen(true);
  };

  const openCaseStudyReader = (cs) => {
    setReaderData(cs);
    setReaderType('casestudy');
    setIsReaderOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-black font-display tracking-tight">
              System Design &amp; Architecture Hub
            </h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-black text-white font-bold">
              FAANG Tier-1 Curriculum
            </span>
          </div>
          <p className="text-xs text-black/60 font-medium">
            Scalability patterns, distributed systems trade-offs, and 10 production-grade HLD case studies with step-by-step blueprints.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center gap-3">
          <span className="text-xs font-mono text-black/60 font-medium">Core Mastery:</span>
          <span className="text-sm font-extrabold font-display text-purple-700">{progressPercent}%</span>
          <span className="text-[11px] font-mono text-black/40">({completedCount}/{totalCount} Domains)</span>
        </div>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex border-b-2 border-black/10 gap-6 text-xs font-mono overflow-x-auto">
        <button
          onClick={() => { setActiveTab('topics'); setSelectedCategory('All'); }}
          className={`pb-3 border-b-2 font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'topics'
              ? 'border-black text-black'
              : 'border-transparent text-black/40 hover:text-black'
          }`}
        >
          Core Architectural Domains ({enrichedTopics.length})
        </button>

        <button
          onClick={() => { setActiveTab('casestudies'); setSelectedCategory('All'); }}
          className={`pb-3 border-b-2 font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'casestudies'
              ? 'border-black text-black'
              : 'border-transparent text-black/40 hover:text-black'
          }`}
        >
          High-Level Design Case Studies ({enrichedCaseStudies.length})
        </button>

        <button
          onClick={() => setActiveTab('architecture')}
          className={`pb-3 border-b-2 font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'architecture'
              ? 'border-black text-black'
              : 'border-transparent text-black/40 hover:text-black'
          }`}
        >
          Interactive Scalability Visualizer
        </button>

        <button
          onClick={() => setActiveTab('cheatsheet')}
          className={`pb-3 border-b-2 font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'cheatsheet'
              ? 'border-black text-black'
              : 'border-transparent text-black/40 hover:text-black'
          }`}
        >
          Interview Cheat Sheet &amp; Latency Math
        </button>
      </div>

      {/* Search & Category Filter Toolbar */}
      {(activeTab === 'topics' || activeTab === 'casestudies') && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-black/40 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'topics' ? "Search topics, concepts, algorithms..." : "Search case studies, scale metrics, blueprints..."}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border-2 border-black/10 text-xs text-black placeholder:text-black/40 font-medium focus:outline-none focus:border-black"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-[11px] font-mono">
            {activeTab === 'topics' ? (
              ['All', 'Core', 'Infrastructure', 'Data', 'Architecture', 'Design'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg border font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black/60 border-black/10 hover:border-black/30'
                  }`}
                >
                  {cat}
                </button>
              ))
            ) : (
              ['All', 'Web Scale', 'Real-Time', 'Infrastructure', 'Media', 'High Concurrency', 'Hard', 'Medium'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg border font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black/60 border-black/10 hover:border-black/30'
                  }`}
                >
                  {cat}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 1: Core Topics with Deep-Dive Launchers */}
      {activeTab === 'topics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTopics.map((t) => (
            <div
              key={t.id}
              className={`p-6 rounded-3xl border-2 transition-all flex flex-col justify-between space-y-4 ${
                t.completed
                  ? 'bg-purple-50/40 border-purple-400 shadow-[4px_4px_0px_rgba(147,51,234,0.15)]'
                  : 'bg-white border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-black font-display leading-tight">{t.name}</h3>
                      <Badge variant="purple" size="sm">{t.category}</Badge>
                    </div>
                    <span className="text-[10px] font-mono text-black/50 font-medium block mt-1">
                      {t.readTime} read • {t.milestones.length} Core Competencies
                    </span>
                  </div>

                  <button
                    onClick={() => toggleSysDesignTopic(t.id)}
                    title={t.completed ? "Mark Incomplete" : "Mark Complete"}
                    className="text-black/30 hover:text-purple-600 transition-colors cursor-pointer flex-shrink-0"
                  >
                    {t.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <Circle className="w-6 h-6 text-black/20" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-black/60 leading-relaxed font-medium">{t.description}</p>

                {/* Competencies Preview */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-mono text-black/50 uppercase tracking-wider block font-bold">
                    Key Competencies:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {t.milestones.slice(0, 4).map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 text-[11px] text-black/80 bg-[#F4F4F0] px-2.5 py-1.5 rounded-xl border border-black/10 font-medium"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600 flex-shrink-0" />
                        <span className="truncate">{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-black/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => openTopicReader(t)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-black hover:text-purple-700 transition-colors font-mono cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                  <span>Read Deep-Dive Guide &amp; Code</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <span className={`text-[11px] font-mono font-bold ${t.completed ? 'text-emerald-700' : 'text-black/40'}`}>
                  {t.completed ? '✓ Mastered' : 'Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: High-Level Design Case Studies */}
      {activeTab === 'casestudies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCaseStudies.map((cs) => (
            <div
              key={cs.id}
              className="p-6 rounded-3xl bg-white border-2 border-black flex flex-col justify-between space-y-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-black font-display leading-snug">{cs.title}</h3>
                    {cs.category && (
                      <Badge variant="purple" size="sm">{cs.category}</Badge>
                    )}
                  </div>
                  <Badge variant={cs.difficulty === 'Hard' ? 'rose' : 'amber'} size="sm">
                    {cs.difficulty}
                  </Badge>
                </div>

                {cs.metrics && (
                  <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200 text-[11px] font-mono text-purple-950 font-bold">
                    Scale: {cs.metrics}
                  </div>
                )}

                <p className="text-xs text-black/60 leading-relaxed font-medium">{cs.summary}</p>

                {/* Key Concepts */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono text-black/50 uppercase tracking-wider block font-bold">
                    Key Architectural Concepts:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cs.keyConcepts.map((k, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-lg bg-[#F4F4F0] border border-black/10 text-[10px] font-mono text-black font-semibold"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-4 border-t border-black/10 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => openCaseStudyReader(cs)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white font-mono shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Full System Blueprint</span>
                </button>

                <select
                  value={cs.status}
                  onChange={(e) => updateCaseStudyStatus(cs.id, e.target.value)}
                  className="bg-[#F4F4F0] border border-black/15 text-[11px] rounded-xl px-2.5 py-1 text-black font-bold focus:outline-none cursor-pointer"
                >
                  <option value="Planned">Planned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Mastered">Mastered</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Interactive Scalability Visualizer */}
      {activeTab === 'architecture' && (
        <div className="rounded-3xl bg-white border-2 border-black p-6 space-y-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-black font-display">
                  CDN &amp; Load Balancing Architecture Simulation
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-black text-white font-bold">
                  Interactive Topology
                </span>
              </div>
              <p className="text-xs text-black/60 mt-1">
                Visual demonstration of multi-tier caching, L7 reverse proxies, and horizontal backend scaling.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => runSimulation(true)}
                disabled={simulating}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white font-mono shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 cursor-pointer"
              >
                Simulate Cache Hit (12ms)
              </button>
              <button
                onClick={() => runSimulation(false)}
                disabled={simulating}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white font-mono shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 cursor-pointer"
              >
                Simulate Cache Miss (145ms)
              </button>
            </div>
          </div>

          {/* Interactive Topology Graph */}
          <div className="p-6 rounded-3xl bg-[#F9F9F7] border-2 border-black relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center text-center text-xs font-mono">
              {/* 1. Client */}
              <div className="p-4 rounded-2xl bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] flex flex-col items-center">
                <Globe className="w-6 h-6 text-blue-600 mb-2" />
                <span className="font-bold text-black font-display">Client / Browser</span>
                <span className="text-[10px] text-black/50 mt-1">React 19 + Hooks</span>
                <span className="text-[10px] text-blue-600 mt-0.5 font-bold">localStorage Cache</span>
              </div>

              {/* Arrow 1 */}
              <div className="flex justify-center items-center">
                <div className={`flex items-center gap-1 font-bold ${simulating ? 'text-black animate-pulse' : 'text-black/30'}`}>
                  <span className="text-[10px]">HTTPS</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* 2. Edge CDN */}
              <div className={`p-4 rounded-2xl border-2 flex flex-col items-center transition-all ${
                simulationCacheHit && simulating
                  ? 'bg-emerald-100 border-emerald-600 text-emerald-950 shadow-[4px_4px_0px_rgba(5,150,105,1)] scale-105'
                  : 'bg-white border-black shadow-[3px_3px_0px_rgba(0,0,0,1)]'
              }`}>
                <Zap className="w-6 h-6 text-amber-500 mb-2" />
                <span className="font-bold text-black font-display">Cloudflare Edge CDN</span>
                <span className="text-[10px] text-black/50 mt-1">Static HTML, CSS, JS</span>
                <span className={`text-[10px] mt-0.5 font-extrabold ${simulationCacheHit ? 'text-emerald-700' : 'text-black/40'}`}>
                  {simulationCacheHit ? 'HIT (12ms)' : 'BYPASS (Dynamic API)'}
                </span>
              </div>

              {/* Arrow 2 */}
              <div className="flex justify-center items-center">
                <div className={`flex items-center gap-1 font-bold ${simulating && !simulationCacheHit ? 'text-black animate-pulse' : 'text-black/30'}`}>
                  <span className="text-[10px]">L7 Proxy</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* 3. Load Balancer & Node Cluster */}
              <div className="p-4 rounded-2xl bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] flex flex-col items-center">
                <Network className="w-6 h-6 text-purple-600 mb-2" />
                <span className="font-bold text-black font-display">Load Balancer (HAProxy)</span>
                <span className="text-[10px] text-black/50 mt-1">Round Robin / Least Conn</span>

                {/* Node instances */}
                <div className="grid grid-cols-3 gap-1.5 mt-3 w-full">
                  {[1, 2, 3].map((nodeId) => (
                    <div
                      key={nodeId}
                      className={`p-1.5 rounded-lg text-[10px] border-2 font-bold transition-all ${
                        activeNode === nodeId && simulating && !simulationCacheHit
                          ? 'bg-black text-white border-black scale-105 shadow-sm'
                          : 'bg-[#F4F4F0] text-black/60 border-black/15'
                      }`}
                    >
                      Node {nodeId}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Downstream Storage Row */}
            <div className="mt-6 pt-6 border-t border-black/10 flex flex-col sm:flex-row items-center justify-center gap-8 text-xs font-mono">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <Cpu className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <span className="font-bold text-black block">In-Memory Cache (Redis)</span>
                  <span className="text-[10px] text-black/50">TTL: 15–30 min • Stale-While-Revalidate</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <HardDrive className="w-5 h-5 text-emerald-600" />
                <div className="text-left">
                  <span className="font-bold text-black block">Persistent Store (PostgreSQL / Cassandra)</span>
                  <span className="text-[10px] text-black/50">Primary Master + Read Replicas</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50 border-2 border-purple-200 text-xs text-purple-950 space-y-1.5">
            <h4 className="font-bold text-purple-900 font-mono">Placement Viva Defense Summary:</h4>
            <p className="leading-relaxed font-medium">
              "For our MVP, we deploy a streamlined lightweight server and browser caching layer. Under horizontal scaling,
              a CDN serves static assets at edge locations while an L7 Load Balancer balances traffic across multiple stateless
              Node.js instances sharing a centralized Redis cache and persistent database."
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: Interview Cheat Sheet & Latency Math */}
      {activeTab === 'cheatsheet' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Latency Numbers Table */}
            <div className="rounded-3xl bg-white border-2 border-black p-6 space-y-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 border-b border-black/10 pb-3">
                <Cpu className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-extrabold text-black font-display">Latency Numbers to Memorize</h3>
              </div>
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-black/10 text-black/50 text-[10px] uppercase">
                    <th className="text-left py-2">Operation</th>
                    <th className="text-right py-2">Latency</th>
                    <th className="text-right py-2">Comparison</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  <tr><td className="py-2 text-black/80">L1 Cache reference</td><td className="text-right font-bold text-black">0.5 ns</td><td className="text-right text-emerald-600">Base</td></tr>
                  <tr><td className="py-2 text-black/80">Branch mispredict</td><td className="text-right font-bold text-black">5 ns</td><td className="text-right text-black/50">10x</td></tr>
                  <tr><td className="py-2 text-black/80">L2 Cache reference</td><td className="text-right font-bold text-black">7 ns</td><td className="text-right text-black/50">14x</td></tr>
                  <tr><td className="py-2 text-black/80">Main Memory (RAM)</td><td className="text-right font-bold text-blue-600">100 ns</td><td className="text-right text-black/50">200x</td></tr>
                  <tr><td className="py-2 text-black/80">SSD sequential read (1MB)</td><td className="text-right font-bold text-purple-600">1 ms</td><td className="text-right text-amber-600">2,000,000x</td></tr>
                  <tr><td className="py-2 text-black/80">Disk seek (Rotational HDD)</td><td className="text-right font-bold text-rose-600">10 ms</td><td className="text-right text-rose-600">20,000,000x</td></tr>
                  <tr><td className="py-2 text-black/80">Cross-continental packet (US &rarr; EU)</td><td className="text-right font-bold text-rose-700">150 ms</td><td className="text-right text-rose-700">300,000,000x</td></tr>
                </tbody>
              </table>
            </div>

            {/* Availability / Nine's Table */}
            <div className="rounded-3xl bg-white border-2 border-black p-6 space-y-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 border-b border-black/10 pb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-black font-display">High Availability (SLA Nines)</h3>
              </div>
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-black/10 text-black/50 text-[10px] uppercase">
                    <th className="text-left py-2">Availability</th>
                    <th className="text-right py-2">Downtime / Year</th>
                    <th className="text-right py-2">Downtime / Month</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  <tr><td className="py-2 font-bold text-black">99% (Two Nines)</td><td className="text-right text-rose-600 font-bold">3.65 days</td><td className="text-right text-black/60">7.3 hours</td></tr>
                  <tr><td className="py-2 font-bold text-black">99.9% (Three Nines)</td><td className="text-right text-amber-600 font-bold">8.76 hours</td><td className="text-right text-black/60">43.8 minutes</td></tr>
                  <tr><td className="py-2 font-bold text-black">99.99% (Four Nines)</td><td className="text-right text-blue-600 font-bold">52.6 minutes</td><td className="text-right text-black/60">4.38 minutes</td></tr>
                  <tr><td className="py-2 font-bold text-black">99.999% (Five Nines)</td><td className="text-right text-emerald-600 font-bold">5.26 minutes</td><td className="text-right text-black/60">26 seconds</td></tr>
                </tbody>
              </table>
              <div className="p-3 rounded-xl bg-[#F4F4F0] border border-black/10 text-[11px] text-black/70">
                <strong>Rule of Thumb:</strong> Every additional '9' typically multiplies infrastructure operational cost by 3x–5x due to redundant active-active multi-region replication.
              </div>
            </div>
          </div>

          {/* 4-Step System Design Interview Framework */}
          <div className="rounded-3xl bg-white border-2 border-black p-6 space-y-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <h3 className="text-base font-extrabold text-black font-display">The 4-Step FAANG System Design Interview Framework</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-[#F9F9F7] border border-black/10 space-y-2">
                <span className="text-[10px] uppercase font-bold text-purple-700 block">Step 1 (3–5 min)</span>
                <strong className="text-black font-display block text-sm">Scope &amp; Requirements</strong>
                <p className="text-black/60 text-[11px] font-sans">Clarify Functional vs Non-Functional requirements. Ask clarifying questions on scale (DAU, storage, SLA).</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#F9F9F7] border border-black/10 space-y-2">
                <span className="text-[10px] uppercase font-bold text-blue-700 block">Step 2 (5 min)</span>
                <strong className="text-black font-display block text-sm">Capacity Estimations</strong>
                <p className="text-black/60 text-[11px] font-sans">Calculate Read/Write QPS, bandwidth throughput, and 5-year storage memory sizing based on the 80/20 rule.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#F9F9F7] border border-black/10 space-y-2">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Step 3 (15–20 min)</span>
                <strong className="text-black font-display block text-sm">High-Level Design</strong>
                <p className="text-black/60 text-[11px] font-sans">Draw box diagram: Client &rarr; CDN &rarr; Load Balancer &rarr; API Gateway &rarr; Services &rarr; Cache &rarr; Databases.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#F9F9F7] border border-black/10 space-y-2">
                <span className="text-[10px] uppercase font-bold text-amber-700 block">Step 4 (15 min)</span>
                <strong className="text-black font-display block text-sm">Deep Dive &amp; Bottlenecks</strong>
                <p className="text-black/60 text-[11px] font-sans">Address single points of failure, partition keys, cache invalidation, rate limiting, and database replication lag.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Study Reader Modal */}
      <StudyReaderModal
        isOpen={isReaderOpen}
        onClose={() => setIsReaderOpen(false)}
        data={readerData}
        type={readerType}
        onToggleComplete={readerType === 'topic' ? (id) => toggleSysDesignTopic(id) : null}
        isCompleted={readerData ? enrichedTopics.find(t => t.id === readerData.id)?.completed : false}
      />
    </div>
  );
}
