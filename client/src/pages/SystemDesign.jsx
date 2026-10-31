import React, { useState } from 'react';
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
  HardDrive
} from 'lucide-react';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export function SystemDesign({ progressHook }) {
  const { sysDesignData, loading, toggleSysDesignTopic, updateCaseStudyStatus } = progressHook;
  const [activeTab, setActiveTab] = useState('topics'); // 'topics' | 'architecture' | 'casestudies'

  // Interactive Architecture Simulation State (Section 28)
  const [simulationCacheHit, setSimulationCacheHit] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [activeNode, setActiveNode] = useState(1);

  if (loading || !sysDesignData) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton lines={6} />
        <LoadingSkeleton lines={8} />
      </div>
    );
  }

  const { topics = [], caseStudies = [], percentage = 0, completedTopics = 0, totalTopics = 0 } = sysDesignData;

  const runSimulation = (cacheHit) => {
    setSimulating(true);
    setSimulationCacheHit(cacheHit);
    setActiveNode(Math.floor(Math.random() * 3) + 1);
    setTimeout(() => {
      setSimulating(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-black font-display tracking-tight">
              System Design & Architecture Hub
            </h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-black text-white font-bold">
              HLD & LLD Preparation
            </span>
          </div>
          <p className="text-xs text-black/60 font-medium">
            Scalability patterns, distributed systems trade-offs, and production architecture case studies.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center gap-3">
          <span className="text-xs font-mono text-black/60 font-medium">Core Progress:</span>
          <span className="text-sm font-extrabold font-display text-purple-700">{percentage}%</span>
          <span className="text-[11px] font-mono text-black/40">({completedTopics}/{totalTopics} Domains)</span>
        </div>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex border-b-2 border-black/10 gap-6 text-xs font-mono">
        <button
          onClick={() => setActiveTab('topics')}
          className={`pb-3 border-b-2 font-bold transition-colors ${
            activeTab === 'topics'
              ? 'border-black text-black'
              : 'border-transparent text-black/40 hover:text-black'
          }`}
        >
          Preparation Topics ({topics.length})
        </button>

        <button
          onClick={() => setActiveTab('architecture')}
          className={`pb-3 border-b-2 font-bold transition-colors ${
            activeTab === 'architecture'
              ? 'border-black text-black'
              : 'border-transparent text-black/40 hover:text-black'
          }`}
        >
          Interactive Scalability Visualizer (Section 28)
        </button>

        <button
          onClick={() => setActiveTab('casestudies')}
          className={`pb-3 border-b-2 font-bold transition-colors ${
            activeTab === 'casestudies'
              ? 'border-black text-black'
              : 'border-transparent text-black/40 hover:text-black'
          }`}
        >
          High-Level Design Case Studies ({caseStudies.length})
        </button>
      </div>

      {/* TAB 1: Topics & Milestones */}
      {activeTab === 'topics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topics.map((t) => (
            <div
              key={t.id}
              className={`p-6 rounded-3xl border-2 transition-all ${
                t.completed
                  ? 'bg-purple-50/50 border-purple-400 shadow-[4px_4px_0px_rgba(147,51,234,0.2)]'
                  : 'bg-white border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-black font-display">{t.name}</h3>
                    <Badge variant="purple" size="sm">{t.category}</Badge>
                  </div>
                  <p className="text-xs text-black/60 mt-1">{t.description}</p>
                </div>
                <button
                  onClick={() => toggleSysDesignTopic(t.id)}
                  className="text-black/30 hover:text-purple-600 transition-colors"
                >
                  {t.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-black/20" />
                  )}
                </button>
              </div>

              {/* Milestones in topic */}
              <div className="space-y-1.5 pt-3 border-t border-black/10">
                <span className="text-[10px] font-mono text-black/50 uppercase tracking-wider block font-bold">
                  Key Interview Competencies:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {t.milestones.map((m, idx) => (
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
          ))}
        </div>
      )}

      {/* TAB 2: Interactive Scalability Visualizer (Section 28) */}
      {activeTab === 'architecture' && (
        <div className="rounded-3xl bg-white border-2 border-black p-6 space-y-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-black font-display">
                  CDN & Load Balancing Architecture Simulation
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-black text-white font-bold">
                  Section 28
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
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white font-mono shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
              >
                Simulate Cache Hit (12ms)
              </button>
              <button
                onClick={() => runSimulation(false)}
                disabled={simulating}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white font-mono shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
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
                  {simulationCacheHit ? 'HIT (Low Latency)' : 'BYPASS (Dynamic)'}
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
                  <span className="font-bold text-black block">In-Memory Cache (LRU / Redis)</span>
                  <span className="text-[10px] text-black/50">TTL: 15–30 min • Stale-While-Revalidate</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <HardDrive className="w-5 h-5 text-emerald-600" />
                <div className="text-left">
                  <span className="font-bold text-black block">Normalized Materialized Store</span>
                  <span className="text-[10px] text-black/50">Relational & Document Structured Store</span>
                </div>
              </div>
            </div>
          </div>

          {/* Educational Callout from Section 28 */}
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

      {/* TAB 3: High-Level Design Case Studies */}
      {activeTab === 'casestudies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {caseStudies.map((cs) => (
            <div
              key={cs.id}
              className="p-6 rounded-3xl bg-white border-2 border-black flex flex-col justify-between space-y-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-extrabold text-black font-display">{cs.title}</h3>
                  <Badge variant={cs.difficulty === 'Hard' ? 'rose' : 'amber'} size="sm">
                    {cs.difficulty}
                  </Badge>
                </div>

                <p className="text-xs text-black/60 leading-relaxed">{cs.summary}</p>

                {/* Key Concepts */}
                <div className="space-y-1.5 pt-2">
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

              <div className="flex items-center justify-between pt-3 border-t border-black/10 text-xs font-mono">
                <span className="text-black/60 font-medium">
                  Status: <strong className="text-black">{cs.status}</strong>
                </span>

                <select
                  value={cs.status}
                  onChange={(e) => updateCaseStudyStatus(cs.id, e.target.value)}
                  className="bg-[#F4F4F0] border border-black/15 text-[11px] rounded-xl px-3 py-1 text-black font-bold focus:outline-none"
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
    </div>
  );
}
