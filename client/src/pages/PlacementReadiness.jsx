import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2,
  Calendar,
  ArrowRight,
  Briefcase,
  Save,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Minus,
  Plus
} from 'lucide-react';
import { RadarChart } from '../components/common/Charts';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';
import { useLocalCache } from '../hooks/useLocalCache';
import { saveUserToRegistry } from '../utils/accountManager';

export const CALIBRATED_ROLES = [
  {
    id: 'sde_tier1',
    title: 'Software Development Engineer (SDE-1 — FAANG & Tier-1)',
    badge: 'DSA Heavy (40%)',
    weights: { dsa: 40, systemDesign: 25, webDev: 15, projects: 10, devActivity: 10 },
    techStack: ['C++ / Java', 'Graph & DP Algorithms', 'System Scalability', 'Distributed Caching', 'Microservices'],
    rationale: 'Top-tier tech placement interviews heavily prioritize algorithmic problem solving (40%) and system design foundations (25%).'
  },
  {
    id: 'backend',
    title: 'Backend & Distributed Systems Engineer',
    badge: 'Systems & APIs (30%)',
    weights: { dsa: 20, systemDesign: 30, webDev: 30, projects: 15, devActivity: 5 },
    techStack: ['Node.js / Go', 'PostgreSQL', 'Redis Caching', 'Apache Kafka', 'Docker', 'REST / gRPC'],
    rationale: 'Backend positions demand scalable API architecture, ACID database transactions, caching strategies, and event streaming.'
  },
  {
    id: 'frontend',
    title: 'Frontend & Web Performance Engineer',
    badge: 'Web Performance (40%)',
    weights: { dsa: 15, systemDesign: 10, webDev: 40, projects: 25, devActivity: 10 },
    techStack: ['React 19', 'TypeScript', 'Next.js', 'Core Web Vitals', 'Tailwind CSS', 'State Architecture'],
    rationale: 'Frontend positions prioritize component design systems, client-side rendering performance, and high-quality UI execution.'
  },
  {
    id: 'fullstack',
    title: 'Full-Stack Software Engineer',
    badge: 'Balanced End-to-End',
    weights: { dsa: 20, systemDesign: 10, webDev: 35, projects: 25, devActivity: 10 },
    techStack: ['React', 'Node.js / Express', 'PostgreSQL / MongoDB', 'Redis', 'WebSockets', 'CI/CD Pipelines'],
    rationale: 'Full-stack engineering demands balanced delivery from database modeling to responsive interactive web clients.'
  },
  {
    id: 'devops',
    title: 'DevOps & Site Reliability Engineer (SRE)',
    badge: 'Cloud & Infra (35%)',
    weights: { dsa: 10, systemDesign: 25, webDev: 35, projects: 20, devActivity: 10 },
    techStack: ['Docker', 'Kubernetes', 'GitHub Actions', 'Prometheus / Grafana', 'AWS / Cloud', 'Linux'],
    rationale: 'DevOps & SRE roles focus on infrastructure automation, container orchestration, CI/CD pipelines, and observability.'
  },
  {
    id: 'data_ml',
    title: 'Data Engineer & ML Infrastructure',
    badge: 'Databases & Algo',
    weights: { dsa: 25, systemDesign: 20, webDev: 35, projects: 15, devActivity: 5 },
    techStack: ['Python', 'SQL & B-Tree Indexing', 'Kafka Streaming', 'ETL Pipelines', 'Distributed Processing'],
    rationale: 'Data engineering emphasizes database indexing, streaming event architectures, query tuning, and algorithmic data manipulation.'
  }
];

export function PlacementReadiness({ dashboardData, onNavigate, onRefreshDashboard }) {
  const [currentUser, setCurrentUser] = useLocalCache('prep_auth_user', null);
  const location = useLocation();
  const readiness = dashboardData?.readiness || {};
  const breakdown = readiness.breakdown || {};

  // Find matching initial role
  const initialRole = CALIBRATED_ROLES.find(r => 
    r.title.toLowerCase() === currentUser?.targetRole?.toLowerCase() ||
    currentUser?.targetRole?.toLowerCase()?.includes(r.id)
  ) || CALIBRATED_ROLES[0];

  const [selectedRole, setSelectedRole] = useState(initialRole.id);
  const [roleSavedSuccess, setRoleSavedSuccess] = useState(false);

  // Initialize weights: prioritize saved custom weights from profile > role default weights
  const getInitialWeights = () => {
    if (currentUser?.customWeights) {
      return {
        dsa: currentUser.customWeights.dsa ?? 40,
        webDev: currentUser.customWeights.webDev ?? 15,
        systemDesign: currentUser.customWeights.systemDesign ?? 25,
        projects: currentUser.customWeights.projects ?? 10,
        devActivity: currentUser.customWeights.devActivity !== undefined 
          ? currentUser.customWeights.devActivity 
          : (currentUser.customWeights.developerActivity ?? 10)
      };
    }
    return initialRole.weights;
  };

  const [weights, setWeights] = useState(getInitialWeights);
  const [weightsSavedSuccess, setWeightsSavedSuccess] = useState(false);
  const [savingWeights, setSavingWeights] = useState(false);

  // Sync incoming role from Universal Search
  useEffect(() => {
    if (location.state?.roleId) {
      const match = CALIBRATED_ROLES.find(r => r.id === location.state.roleId);
      if (match) {
        setSelectedRole(match.id);
        setWeights(match.weights);
      }
    }
  }, [location.state]);

  // Keep weights in sync if user changes or loads from cache
  useEffect(() => {
    if (currentUser?.customWeights) {
      setWeights({
        dsa: currentUser.customWeights.dsa ?? 40,
        webDev: currentUser.customWeights.webDev ?? 15,
        systemDesign: currentUser.customWeights.systemDesign ?? 25,
        projects: currentUser.customWeights.projects ?? 10,
        devActivity: currentUser.customWeights.devActivity !== undefined 
          ? currentUser.customWeights.devActivity 
          : (currentUser.customWeights.developerActivity ?? 10)
      });
    }
  }, [currentUser?.email]);

  const activeRoleConfig = CALIBRATED_ROLES.find(r => r.id === selectedRole) || CALIBRATED_ROLES[0];

  const handleSelectRole = (role) => {
    setSelectedRole(role.id);
    setWeights(role.weights);
  };

  const handleResetWeights = () => {
    setWeights(activeRoleConfig.weights);
  };

  const handleNormalizeWeights = () => {
    const rawTotal = (weights.dsa || 0) + (weights.webDev || 0) + (weights.systemDesign || 0) + (weights.projects || 0) + (weights.devActivity || 10);
    if (!rawTotal) return;
    const factor = 100 / rawTotal;
    const normDsa = Math.round((weights.dsa || 0) * factor);
    const normWeb = Math.round((weights.webDev || 0) * factor);
    const normSys = Math.round((weights.systemDesign || 0) * factor);
    const normProj = Math.round((weights.projects || 0) * factor);
    const normDev = Math.max(5, 100 - (normDsa + normWeb + normSys + normProj));

    setWeights({
      dsa: normDsa,
      webDev: normWeb,
      systemDesign: normSys,
      projects: normProj,
      devActivity: normDev
    });
  };

  const handleSaveWeights = async () => {
    if (!currentUser?.email) return;
    setSavingWeights(true);

    const devW = Number(weights.devActivity !== undefined ? weights.devActivity : (weights.developerActivity || 10));
    const normalizedWeights = {
      dsa: Number(weights.dsa || 40),
      webDev: Number(weights.webDev || 15),
      systemDesign: Number(weights.systemDesign || 25),
      projects: Number(weights.projects || 10),
      devActivity: devW,
      developerActivity: devW
    };

    // 1. Update localStorage registry & auth user
    const updated = saveUserToRegistry({
      ...currentUser,
      customWeights: normalizedWeights
    }, true);
    setCurrentUser(updated);

    // 2. Invalidate stale dashboard cache
    window.localStorage.removeItem('prep_dashboard_cache');

    // 3. Persist to server backend
    try {
      await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          customWeights: normalizedWeights
        })
      });
    } catch (e) {
      console.warn('Backend custom weights persistence warning:', e);
    }

    // 4. Trigger live sync across dashboard and components
    if (onRefreshDashboard) {
      await onRefreshDashboard(null, null, normalizedWeights);
    }
    window.dispatchEvent(new CustomEvent('prep_refresh_dashboard', { detail: { weights: normalizedWeights } }));

    setSavingWeights(false);
    setWeightsSavedSuccess(true);
    setTimeout(() => setWeightsSavedSuccess(false), 3500);
  };

  const handleSaveRoleToProfile = async () => {
    if (!currentUser?.email) return;
    const updated = saveUserToRegistry({
      ...currentUser,
      targetRole: activeRoleConfig.title
    }, true);
    setCurrentUser(updated);

    try {
      await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          targetRole: activeRoleConfig.title
        })
      });
    } catch (e) {
      // offline fallback
    }

    setRoleSavedSuccess(true);
    setTimeout(() => setRoleSavedSuccess(false), 3000);
  };

  const dsaScore = breakdown.dsa?.score ?? 0;
  const webDevScore = breakdown.webDevelopment?.score ?? 0;
  const sysScore = breakdown.systemDesign?.score ?? 0;
  const projScore = breakdown.projects?.score ?? 0;
  const devScore = breakdown.developerActivity?.score ?? 0;

  // Dynamically calculate overall score with calibrated weights
  const devWeight = weights.devActivity !== undefined ? weights.devActivity : (weights.developerActivity || 0);
  const totalWeight = (weights.dsa || 0) + (weights.webDev || 0) + (weights.systemDesign || 0) + (weights.projects || 0) + devWeight || 100;
  const dynamicOverallScore = Math.round(
    (dsaScore * (weights.dsa || 0) +
      webDevScore * (weights.webDev || 0) +
      sysScore * (weights.systemDesign || 0) +
      projScore * (weights.projects || 0) +
      devScore * devWeight) / totalWeight
  );

  const radarPillars = [
    { label: 'DSA', score: dsaScore },
    { label: 'Web Dev', score: webDevScore },
    { label: 'Sys Design', score: sysScore },
    { label: 'Projects', score: projScore },
    { label: 'GitHub', score: devScore }
  ];

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-black font-display tracking-tight">
              Placement Readiness Diagnostic Engine
            </h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-black text-white font-bold">
              Job-Calibrated Tech Stacks
            </span>
          </div>
          <p className="text-xs text-black/60 font-medium">
            Multi-pillar competency synthesis calibrated to specific job role expectations, radar skill balance, and actionable sprint recommendations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={dynamicOverallScore >= 85 ? 'emerald' : dynamicOverallScore >= 70 ? 'blue' : 'amber'} size="lg">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-extrabold">{dynamicOverallScore}% Calibrated Readiness</span>
          </Badge>
        </div>
      </div>

      {/* Role Calibration Selector Card */}
      <div className="p-6 rounded-3xl bg-white border-2 border-black space-y-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 pb-3">
          <div className="space-y-0.5">
            <h2 className="text-base font-extrabold font-display text-black flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-black" />
              <span>Job Role Tech Stack Calibration</span>
            </h2>
            <p className="text-xs text-black/60">
              Select your target placement track. The readiness engine dynamically adjusts weightages according to actual company interview rounds.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveRoleToProfile}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black text-white font-mono text-xs font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-neutral-800 transition-all cursor-pointer"
            >
              {roleSavedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
              <span>{roleSavedSuccess ? 'Role Saved!' : 'Set as My Target Role'}</span>
            </button>
          </div>
        </div>

        {/* Roles Grid Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {CALIBRATED_ROLES.map((role) => {
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => handleSelectRole(role)}
                className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-black bg-black text-white shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                    : 'border-black/20 bg-[#F9F9F7] text-black hover:border-black/50'
                }`}
              >
                <div>
                  <span className={`text-[10px] font-mono uppercase font-bold block mb-1 ${
                    isSelected ? 'text-amber-300' : 'text-blue-700'
                  }`}>
                    {role.badge}
                  </span>
                  <span className="font-extrabold text-xs block leading-tight">
                    {role.title.split('—')[0].replace('Software Development Engineer', 'SDE-1')}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-black/10 text-[10px] font-mono">
                  {role.weights.dsa}% DSA · {role.weights.systemDesign || role.weights.webDev}% Primary
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Role Tech Stack Explanation Card */}
        <div className="p-4 rounded-2xl bg-[#F4F4F0] border border-black/15 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-black font-display text-sm">{activeRoleConfig.title}</span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-black text-white font-bold">
                Active Benchmark
              </span>
            </div>
            <p className="text-black/70 leading-relaxed max-w-2xl">
              {activeRoleConfig.rationale}
            </p>
          </div>

          <div className="shrink-0 space-y-1">
            <span className="font-mono text-[10px] uppercase font-bold text-black/50 block">
              Core Tech Stack Focus:
            </span>
            <div className="flex flex-wrap gap-1">
              {activeRoleConfig.techStack.map((tech, i) => (
                <span
                  key={i}
                  className="font-mono text-[10px] font-bold px-2 py-0.5 bg-white border border-black/20 rounded shadow-xs"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Grid: Radar Chart + Pillar Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Balance Chart (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-white border-2 border-black p-6 flex flex-col items-center justify-between shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <div className="text-center w-full mb-4">
            <h3 className="text-sm font-bold text-black font-display">Technical Balance Spider Graph</h3>
            <p className="text-xs text-black/50 mt-0.5">Calibrated against {activeRoleConfig.title.split('—')[0]}</p>
          </div>

          <RadarChart pillars={radarPillars} size={270} />

          <div className="w-full pt-4 border-t border-black/10 text-[11px] text-black/50 text-center font-mono font-medium">
            Aim for polygon perimeter coverage &gt; 70% in all directions.
          </div>
        </div>

        {/* Pillar Breakdown & Dynamic Weight Adjuster (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-white border-2 border-black p-6 space-y-5 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-black font-display">Pillar Scoring Breakdown</h3>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  totalWeight === 100 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  Total: {totalWeight}%
                </span>
                {totalWeight !== 100 && (
                  <button
                    type="button"
                    onClick={handleNormalizeWeights}
                    className="text-[10px] font-mono font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                    title="Scale weights proportionally so they sum to exactly 100%"
                  >
                    Auto-scale to 100%
                  </button>
                )}
              </div>
              <p className="text-xs text-black/50 mt-0.5">
                Calibrated specifically for {activeRoleConfig.title.split('—')[0]}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleResetWeights}
                className="inline-flex items-center gap-1 text-xs font-mono font-bold text-black/60 hover:text-black hover:underline cursor-pointer transition-colors px-2 py-1 rounded-lg hover:bg-black/5"
                title="Reset sliders back to company role benchmark weights"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Defaults</span>
              </button>

              <button
                type="button"
                onClick={handleSaveWeights}
                disabled={savingWeights}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-mono text-xs font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-60"
                title="Save your custom weights to your account so they persist every time you sign in"
              >
                {weightsSavedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Weightage Saved!</span>
                  </>
                ) : savingWeights ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-white" />
                    <span>Save Weightage</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 1. DSA */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-[#F9F9F7] border border-black/10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-black">1. Data Structures &amp; Algorithms</span>
              <span className="font-mono text-blue-600 font-extrabold">{dsaScore}% (Weight: {weights.dsa}%)</span>
            </div>
            <ProgressBar value={dsaScore} max={100} showPercentage={false} color="blue" height="h-2.5" />
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setWeights(prev => ({ ...prev, dsa: Math.max(5, (prev.dsa || 0) - 5) }))}
                className="w-6 h-6 rounded-md bg-white border border-black/20 hover:border-black flex items-center justify-center text-xs font-mono font-bold text-black shadow-2xs hover:bg-neutral-50"
                title="Decrease by 5%"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="range"
                min="5"
                max="65"
                value={weights.dsa}
                onChange={(e) => setWeights({ ...weights, dsa: Number(e.target.value) })}
                className="flex-1 accent-blue-600 h-1.5 bg-black/10 rounded cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setWeights(prev => ({ ...prev, dsa: Math.min(65, (prev.dsa || 0) + 5) }))}
                className="w-6 h-6 rounded-md bg-white border border-black/20 hover:border-black flex items-center justify-center text-xs font-mono font-bold text-black shadow-2xs hover:bg-neutral-50"
                title="Increase by 5%"
              >
                <Plus className="w-3 h-3" />
              </button>
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded min-w-[42px] text-center">
                {weights.dsa}%
              </span>
            </div>
          </div>

          {/* 2. Web Dev */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-[#F9F9F7] border border-black/10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-black">2. Web Development Engineering</span>
              <span className="font-mono text-cyan-600 font-extrabold">{webDevScore}% (Weight: {weights.webDev}%)</span>
            </div>
            <ProgressBar value={webDevScore} max={100} showPercentage={false} color="cyan" height="h-2.5" />
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setWeights(prev => ({ ...prev, webDev: Math.max(5, (prev.webDev || 0) - 5) }))}
                className="w-6 h-6 rounded-md bg-white border border-black/20 hover:border-black flex items-center justify-center text-xs font-mono font-bold text-black shadow-2xs hover:bg-neutral-50"
                title="Decrease by 5%"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="range"
                min="5"
                max="55"
                value={weights.webDev}
                onChange={(e) => setWeights({ ...weights, webDev: Number(e.target.value) })}
                className="flex-1 accent-cyan-600 h-1.5 bg-black/10 rounded cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setWeights(prev => ({ ...prev, webDev: Math.min(55, (prev.webDev || 0) + 5) }))}
                className="w-6 h-6 rounded-md bg-white border border-black/20 hover:border-black flex items-center justify-center text-xs font-mono font-bold text-black shadow-2xs hover:bg-neutral-50"
                title="Increase by 5%"
              >
                <Plus className="w-3 h-3" />
              </button>
              <span className="font-mono text-xs font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded min-w-[42px] text-center">
                {weights.webDev}%
              </span>
            </div>
          </div>

          {/* 3. System Design */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-[#F9F9F7] border border-black/10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-black">3. System Design &amp; Scalability</span>
              <span className="font-mono text-purple-600 font-extrabold">{sysScore}% (Weight: {weights.systemDesign}%)</span>
            </div>
            <ProgressBar value={sysScore} max={100} showPercentage={false} color="purple" height="h-2.5" />
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setWeights(prev => ({ ...prev, systemDesign: Math.max(5, (prev.systemDesign || 0) - 5) }))}
                className="w-6 h-6 rounded-md bg-white border border-black/20 hover:border-black flex items-center justify-center text-xs font-mono font-bold text-black shadow-2xs hover:bg-neutral-50"
                title="Decrease by 5%"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="range"
                min="5"
                max="50"
                value={weights.systemDesign}
                onChange={(e) => setWeights({ ...weights, systemDesign: Number(e.target.value) })}
                className="flex-1 accent-purple-600 h-1.5 bg-black/10 rounded cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setWeights(prev => ({ ...prev, systemDesign: Math.min(50, (prev.systemDesign || 0) + 5) }))}
                className="w-6 h-6 rounded-md bg-white border border-black/20 hover:border-black flex items-center justify-center text-xs font-mono font-bold text-black shadow-2xs hover:bg-neutral-50"
                title="Increase by 5%"
              >
                <Plus className="w-3 h-3" />
              </button>
              <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded min-w-[42px] text-center">
                {weights.systemDesign}%
              </span>
            </div>
          </div>

          {/* 4. Projects */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-[#F9F9F7] border border-black/10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-black">4. Project Portfolio Evidence</span>
              <span className="font-mono text-emerald-700 font-extrabold">{projScore}% (Weight: {weights.projects}%)</span>
            </div>
            <ProgressBar value={projScore} max={100} showPercentage={false} color="emerald" height="h-2.5" />
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setWeights(prev => ({ ...prev, projects: Math.max(5, (prev.projects || 0) - 5) }))}
                className="w-6 h-6 rounded-md bg-white border border-black/20 hover:border-black flex items-center justify-center text-xs font-mono font-bold text-black shadow-2xs hover:bg-neutral-50"
                title="Decrease by 5%"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="range"
                min="5"
                max="40"
                value={weights.projects}
                onChange={(e) => setWeights({ ...weights, projects: Number(e.target.value) })}
                className="flex-1 accent-emerald-600 h-1.5 bg-black/10 rounded cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setWeights(prev => ({ ...prev, projects: Math.min(40, (prev.projects || 0) + 5) }))}
                className="w-6 h-6 rounded-md bg-white border border-black/20 hover:border-black flex items-center justify-center text-xs font-mono font-bold text-black shadow-2xs hover:bg-neutral-50"
                title="Increase by 5%"
              >
                <Plus className="w-3 h-3" />
              </button>
              <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded min-w-[42px] text-center">
                {weights.projects}%
              </span>
            </div>
          </div>

          {/* 5. GitHub / FOSS */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-[#F9F9F7] border border-black/10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-black">5. GitHub &amp; FOSS Developer Activity</span>
              <span className="font-mono text-amber-700 font-extrabold">{devScore}% (Weight: {weights.devActivity}%)</span>
            </div>
            <ProgressBar value={devScore} max={100} showPercentage={false} color="amber" height="h-2.5" />
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setWeights(prev => ({ ...prev, devActivity: Math.max(5, (prev.devActivity || 0) - 5) }))}
                className="w-6 h-6 rounded-md bg-white border border-black/20 hover:border-black flex items-center justify-center text-xs font-mono font-bold text-black shadow-2xs hover:bg-neutral-50"
                title="Decrease by 5%"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="range"
                min="5"
                max="35"
                value={weights.devActivity}
                onChange={(e) => setWeights({ ...weights, devActivity: Number(e.target.value) })}
                className="flex-1 accent-amber-500 h-1.5 bg-black/10 rounded cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setWeights(prev => ({ ...prev, devActivity: Math.min(35, (prev.devActivity || 0) + 5) }))}
                className="w-6 h-6 rounded-md bg-white border border-black/20 hover:border-black flex items-center justify-center text-xs font-mono font-bold text-black shadow-2xs hover:bg-neutral-50"
                title="Increase by 5%"
              >
                <Plus className="w-3 h-3" />
              </button>
              <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded min-w-[42px] text-center">
                {weights.devActivity}%
              </span>
            </div>
          </div>

          {/* Bottom Action Footer with Live Score and Persistent Save */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-black/10">
            <div className="flex items-center gap-2">
              <span className="text-xs text-black/60 font-mono">Calibrated Diagnostic:</span>
              <span className="font-mono text-sm font-extrabold text-black">{dynamicOverallScore}%</span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                dynamicOverallScore >= 80 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : dynamicOverallScore >= 60 
                    ? 'bg-blue-50 text-blue-800 border-blue-200' 
                    : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {dynamicOverallScore >= 85 ? 'FAANG Ready' : dynamicOverallScore >= 70 ? 'Competitive Track' : 'Needs Preparation'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSaveWeights}
              disabled={savingWeights}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white font-mono text-xs font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-60"
            >
              {weightsSavedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Weightage Saved to Profile!</span>
                </>
              ) : savingWeights ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Weightage...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-white" />
                  <span>Save Weightage to Profile</span>
                </>
              )}
            </button>
          </div>

          {/* Confirmation Alert */}
          {weightsSavedSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Weightage saved to profile! The updated weightage is now active across Dashboard KPI cards, Navbar, and Sprint queues.</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded shrink-0">Saved</span>
            </div>
          )}
        </div>
      </div>

      {/* 4-Week Placement Action Sprint Roadmap */}
      <div className="rounded-3xl bg-white border-2 border-black p-6 space-y-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between border-b border-black/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-black text-white">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-black font-display">
                Automated 4-Week Placement Sprint Roadmap
              </h3>
              <p className="text-xs text-black/50">
                Calibrated for {activeRoleConfig.title} to address weaknesses before campus recruitment rounds
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-lg bg-black/5 border border-black/15 text-black font-bold">
            Sprint Schedule
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
          {[
            {
              week: 'Week 1',
              title: 'Algorithmic Drills',
              focus: `${weights.dsa}% Weight Focus`,
              tasks: ['Solve 15 LeetCode Medium/Hard DP problems', 'Practice Binary Search on Answer', 'Review Striver SDE sheet patterns'],
              status: dsaScore >= 70 ? 'On Track' : 'Needs Focus'
            },
            {
              week: 'Week 2',
              title: 'System Foundations',
              focus: `${weights.systemDesign}% Weight Focus`,
              tasks: ['Master L4 vs L7 Load Balancing', 'Study Consistent Hashing & Caching', 'Read High-Concurrency Flash Sale Case Study'],
              status: sysScore >= 70 ? 'On Track' : 'Needs Focus'
            },
            {
              week: 'Week 3',
              title: 'Production Tech Stack',
              focus: `${weights.webDev}% Weight Focus`,
              tasks: [`Build with ${activeRoleConfig.techStack.slice(0, 2).join(', ')}`, 'Implement Redis Token Bucket Rate Limiting', 'Refactor code for WCAG & Web Vitals'],
              status: webDevScore >= 70 ? 'On Track' : 'Needs Focus'
            },
            {
              week: 'Week 4',
              title: 'Portfolio & Evidence',
              focus: `${weights.projects + weights.devActivity}% Weight Focus`,
              tasks: ['Deploy project with production README', 'Push 3 GitHub open-source PRs', 'Simulate mock technical interview round'],
              status: projScore >= 70 ? 'On Track' : 'Needs Focus'
            }
          ].map((sprint, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#F9F9F7] border border-black/15 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-black/50">{sprint.week}</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    sprint.status === 'On Track' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {sprint.status}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-black font-display">{sprint.title}</h4>
                <span className="text-[10px] font-mono text-blue-600 font-semibold block mt-0.5">{sprint.focus}</span>
                <ul className="mt-2.5 space-y-1.5 text-xs text-black/70">
                  {sprint.tasks.map((task, tIdx) => (
                    <li key={tIdx} className="flex items-start gap-1.5">
                      <span className="text-black/30 font-bold mt-0.5">•</span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PlacementReadiness;
