import React, { useState } from 'react';
import { 
  Award, 
  Sparkles, 
  Sliders, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { RadarChart } from '../components/common/Charts';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';

export function PlacementReadiness({ dashboardData, onNavigate }) {
  const readiness = dashboardData?.readiness || {};
  const breakdown = readiness.breakdown || {};

  // Interactive weights state (Section 34)
  const [weights, setWeights] = useState({
    dsa: 35,
    webDev: 25,
    systemDesign: 20,
    projects: 10,
    devActivity: 10
  });

  const dsaScore = breakdown.dsa?.score ?? 0;
  const webDevScore = breakdown.webDevelopment?.score ?? 0;
  const sysScore = breakdown.systemDesign?.score ?? 0;
  const projScore = breakdown.projects?.score ?? 0;
  const devScore = breakdown.developerActivity?.score ?? 0;

  // Dynamically calculate overall score with custom weights
  const totalWeight = weights.dsa + weights.webDev + weights.systemDesign + weights.projects + weights.devActivity || 100;
  const dynamicOverallScore = Math.round(
    (dsaScore * weights.dsa +
      webDevScore * weights.webDev +
      sysScore * weights.systemDesign +
      projScore * weights.projects +
      devScore * weights.devActivity) / totalWeight
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
              Section 34–36
            </span>
          </div>
          <p className="text-xs text-black/60 font-medium">
            Multi-pillar competency synthesis, radar skill balance, and actionable sprint recommendations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={dynamicOverallScore >= 85 ? 'emerald' : dynamicOverallScore >= 70 ? 'blue' : 'amber'} size="lg">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-extrabold">{dynamicOverallScore}% Readiness Index</span>
          </Badge>
        </div>
      </div>

      {/* Top Grid: Radar Chart + Pillar Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Balance Chart (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-white border-2 border-black p-6 flex flex-col items-center justify-between shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <div className="text-center w-full mb-4">
            <h3 className="text-sm font-bold text-black font-display">Technical Balance Spider Graph</h3>
            <p className="text-xs text-black/50 mt-0.5">Symmetry indicates well-rounded preparation</p>
          </div>

          <RadarChart pillars={radarPillars} size={270} />

          <div className="w-full pt-4 border-t border-black/10 text-[11px] text-black/50 text-center font-mono font-medium">
            Aim for polygon perimeter coverage &gt; 70% in all directions.
          </div>
        </div>

        {/* Pillar Breakdown & Dynamic Weight Adjuster (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-white border-2 border-black p-6 space-y-5 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between border-b border-black/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-black font-display">Pillar Scoring Breakdown</h3>
              <p className="text-xs text-black/50">Interactive weights allow tailoring for specific company profiles</p>
            </div>
            <button
              onClick={() =>
                setWeights({ dsa: 35, webDev: 25, systemDesign: 20, projects: 10, devActivity: 10 })
              }
              className="text-xs font-mono font-bold text-blue-600 hover:underline"
            >
              Reset Weights
            </button>
          </div>

          {/* 1. DSA */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-black">1. Data Structures & Algorithms</span>
              <span className="font-mono text-blue-600 font-extrabold">{dsaScore}% (Weight: {weights.dsa}%)</span>
            </div>
            <ProgressBar value={dsaScore} max={100} showPercentage={false} color="blue" height="h-2.5" />
            <input
              type="range"
              min="10"
              max="60"
              value={weights.dsa}
              onChange={(e) => setWeights({ ...weights, dsa: Number(e.target.value) })}
              className="w-full accent-blue-600 h-1.5 bg-black/10 rounded cursor-pointer"
            />
          </div>

          {/* 2. Web Dev */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-black">2. Web Development Engineering</span>
              <span className="font-mono text-cyan-600 font-extrabold">{webDevScore}% (Weight: {weights.webDev}%)</span>
            </div>
            <ProgressBar value={webDevScore} max={100} showPercentage={false} color="cyan" height="h-2.5" />
            <input
              type="range"
              min="10"
              max="50"
              value={weights.webDev}
              onChange={(e) => setWeights({ ...weights, webDev: Number(e.target.value) })}
              className="w-full accent-cyan-600 h-1.5 bg-black/10 rounded cursor-pointer"
            />
          </div>

          {/* 3. System Design */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-black">3. System Design & Scalability</span>
              <span className="font-mono text-purple-600 font-extrabold">{sysScore}% (Weight: {weights.systemDesign}%)</span>
            </div>
            <ProgressBar value={sysScore} max={100} showPercentage={false} color="purple" height="h-2.5" />
            <input
              type="range"
              min="5"
              max="40"
              value={weights.systemDesign}
              onChange={(e) => setWeights({ ...weights, systemDesign: Number(e.target.value) })}
              className="w-full accent-purple-600 h-1.5 bg-black/10 rounded cursor-pointer"
            />
          </div>

          {/* 4. Projects */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-black">4. Project Portfolio Evidence</span>
              <span className="font-mono text-emerald-700 font-extrabold">{projScore}% (Weight: {weights.projects}%)</span>
            </div>
            <ProgressBar value={projScore} max={100} showPercentage={false} color="emerald" height="h-2.5" />
            <input
              type="range"
              min="5"
              max="30"
              value={weights.projects}
              onChange={(e) => setWeights({ ...weights, projects: Number(e.target.value) })}
              className="w-full accent-emerald-600 h-1.5 bg-black/10 rounded cursor-pointer"
            />
          </div>

          {/* 5. GitHub / FOSS */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-black">5. GitHub & FOSS Developer Activity</span>
              <span className="font-mono text-amber-700 font-extrabold">{devScore}% (Weight: {weights.devActivity}%)</span>
            </div>
            <ProgressBar value={devScore} max={100} showPercentage={false} color="amber" height="h-2.5" />
            <input
              type="range"
              min="5"
              max="30"
              value={weights.devActivity}
              onChange={(e) => setWeights({ ...weights, devActivity: Number(e.target.value) })}
              className="w-full accent-amber-500 h-1.5 bg-black/10 rounded cursor-pointer"
            />
          </div>
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
                Generated dynamically to address weakest areas before campus recruitment rounds
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-lg bg-black/5 border border-black/15 text-black font-bold">
            Sprint Schedule
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-2">
            <span className="text-[10px] font-mono uppercase text-blue-600 font-bold block">
              Week 1: Core Fundamentals
            </span>
            <p className="text-xs font-extrabold text-black font-display">System Design Scalability</p>
            <ul className="text-[11px] text-black/70 space-y-1 list-disc list-inside font-medium">
              <li>Master Consistent Hashing</li>
              <li>Complete Rate Limiter case study</li>
              <li>Solve 5 Graph DP problems</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-2">
            <span className="text-[10px] font-mono uppercase text-cyan-700 font-bold block">
              Week 2: High-Frequency Patterns
            </span>
            <p className="text-xs font-extrabold text-black font-display">Advanced DSA & Top Sheets</p>
            <ul className="text-[11px] text-black/70 space-y-1 list-disc list-inside font-medium">
              <li>Complete Blind 75 missing items</li>
              <li>Study Trie & Bit manipulation</li>
              <li>Mock Contest on Codeforces</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-2">
            <span className="text-[10px] font-mono uppercase text-purple-700 font-bold block">
              Week 3: High-Level Architecture
            </span>
            <p className="text-xs font-extrabold text-black font-display">Design Patterns & Case Studies</p>
            <ul className="text-[11px] text-black/70 space-y-1 list-disc list-inside font-medium">
              <li>Design Real-Time Chat (WebSockets)</li>
              <li>Implement Strategy & Factory Pattern</li>
              <li>Review Database Sharding keys</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-2">
            <span className="text-[10px] font-mono uppercase text-emerald-700 font-bold block">
              Week 4: Portfolio Defense
            </span>
            <p className="text-xs font-extrabold text-black font-display">Full Stack Project Evidence</p>
            <ul className="text-[11px] text-black/70 space-y-1 list-disc list-inside font-medium">
              <li>Polish GitHub READMEs & diagrams</li>
              <li>Verify deployed production demo</li>
              <li>Review Viva short explanations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
