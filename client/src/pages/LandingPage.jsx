import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Terminal, 
  Code2, 
  Cpu, 
  Layers, 
  FileText, 
  UserCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink, 
  GitBranch, 
  Trophy, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  Star, 
  Eye, 
  Lock, 
  Globe, 
  BookOpen, 
  Check, 
  Flame, 
  Activity,
  ArrowUpRight
} from 'lucide-react';

export function LandingPage({ isLoggedIn = false }) {
  const navigate = useNavigate();
  const [activePreviewTab, setActivePreviewTab] = useState('dsa'); // 'dsa' | 'sysdesign' | 'resume' | 'dossier'

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-black font-sans antialiased selection:bg-black selection:text-white">
      
      {/* 0. TOP BRAND ANNOUNCEMENT BAR */}
      <div className="bg-black text-white text-[11px] font-mono py-1.5 px-4 text-center border-b border-black flex items-center justify-center gap-2 select-none">
        <span className="font-extrabold tracking-wide uppercase text-emerald-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
          PREPSTACK 2.0
        </span>
        <span className="text-white/30 hidden sm:inline">/</span>
        <span className="text-white/80 font-medium hidden sm:inline">The Engineering Placement Operating System</span>
        <span className="text-white/30 hidden sm:inline">•</span>
        <span className="text-white/90 font-bold">Free &amp; Open Access</span>
        <Link
          to={isLoggedIn ? "/dashboard" : "/login?mode=register"}
          className="ml-2 hidden md:inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold underline transition-colors"
        >
          <span>Explore Platform</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black font-display tracking-tight text-black">
                  PREP<span className="text-blue-600">STACK</span>
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-sm bg-black text-white font-bold">
                  v2.0
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono font-bold text-black/75">
            <a href="#dsa" className="hover:text-black hover:underline transition-colors">
              DSA Bank (365)
            </a>
            <a href="#sysdesign" className="hover:text-black hover:underline transition-colors">
              System Design
            </a>
            <a href="#webdev" className="hover:text-black hover:underline transition-colors">
              Web Roadmaps
            </a>
            <a href="#resume" className="hover:text-black hover:underline transition-colors">
              ATS Resume
            </a>
            <a href="#dossier" className="hover:text-black hover:underline transition-colors">
              Public Dossier
            </a>
            <Link to="/u/demo" className="text-blue-600 hover:text-blue-700 font-extrabold flex items-center gap-1">
              <span>Demo Profile</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white font-mono text-xs font-bold border-2 border-black shadow-[2px_2px_0px_#000] active:translate-y-0.5 transition-all"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-xl font-mono text-xs font-bold text-black hover:bg-black/5 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/login?mode=register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white font-mono text-xs font-bold border-2 border-black shadow-[2px_2px_0px_#000] active:translate-y-0.5 transition-all"
                >
                  <span>Start Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden border-b-2 border-black bg-white">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Ambient Brand Watermark in Hero Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[14vw] font-black font-display uppercase tracking-tighter text-black/[0.025] select-none pointer-events-none whitespace-nowrap z-0">
          PREPSTACK
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          
          {/* Top Brand Pill Badge */}
          <div className="inline-flex items-center gap-2 p-1 pr-3.5 rounded-full bg-white border-2 border-black text-xs font-mono font-bold tracking-tight shadow-[3px_3px_0px_#000] hover:shadow-[1px_1px_0px_#000] active:translate-y-0.5 transition-all">
            <span className="px-2.5 py-0.5 rounded-full bg-black text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
              <Terminal className="w-3 h-3 text-emerald-400" />
              <span>PREPSTACK</span>
            </span>
            <span className="text-black/85 font-semibold">The Engineering Placement Operating System</span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Free &amp; Open Access
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-black font-display tracking-tight leading-[1.08] max-w-4xl mx-auto">
            Code. Architect. Build. <br className="hidden sm:inline" />
            <span className="text-blue-600 inline-block mt-1 sm:mt-2">Get Placed in Tier-1 Tech.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-black/70 max-w-3xl mx-auto leading-relaxed font-medium">
            <strong>PrepStack</strong> is the unified platform combining <strong>365 deduplicated master DSA problems</strong> across Striver, Blind 75 &amp; NeetCode 150, FAANG High-Level System Design blueprints, live LeetCode/Codeforces tracking, and Jake&apos;s ATS Resume Generator.
          </p>

          {/* Action Button Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to={isLoggedIn ? "/dashboard" : "/login?mode=register"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-black hover:bg-neutral-800 text-white font-mono text-sm font-extrabold border-2 border-black shadow-[4px_4px_0px_#000] hover:shadow-[2px_2px_0px_#000] active:translate-y-0.5 transition-all"
            >
              <span>{isLoggedIn ? "Open Prep Dashboard" : "Start Preparing Free"}</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </Link>

            <Link
              to="/u/demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#F4F4F0] hover:bg-neutral-200 text-black font-mono text-sm font-bold border-2 border-black shadow-[3px_3px_0px_#000] hover:shadow-[1px_1px_0px_#000] active:translate-y-0.5 transition-all"
            >
              <Eye className="w-4 h-4 text-black/70" />
              <span>Explore Candidate Dossier</span>
            </Link>
          </div>

          {/* Trust badges strip */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-mono text-black/60">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              No Credit Card Required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Google &amp; GitHub Instant Sign-In
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Overleaf LaTeX Standard
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Zero-Downtime Offline Cache
            </span>
          </div>

        </div>

        {/* 3. INTERACTIVE HERO PREVIEW MOCKUP */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
          <div className="bg-[#F8F8F6] border-2 border-black rounded-3xl p-3 sm:p-5 shadow-[8px_8px_0px_0px_#000] overflow-hidden">
            
            {/* Mockup Window Header & Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-black/15">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-400 border border-black/20" />
                  <span className="w-3 h-3 rounded-full bg-amber-400 border border-black/20" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400 border border-black/20" />
                </div>
                <span className="text-xs font-mono text-black/40 font-bold ml-2">prepstack.dev/preview</span>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center gap-1 bg-[#EBEBE8] p-1 rounded-xl border border-black/15 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('dsa')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activePreviewTab === 'dsa' ? 'bg-black text-white shadow-xs' : 'text-black/60 hover:text-black'
                  }`}
                >
                  365 DSA Bank
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('sysdesign')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activePreviewTab === 'sysdesign' ? 'bg-black text-white shadow-xs' : 'text-black/60 hover:text-black'
                  }`}
                >
                  System Design
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('resume')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activePreviewTab === 'resume' ? 'bg-black text-white shadow-xs' : 'text-black/60 hover:text-black'
                  }`}
                >
                  Jake ATS Resume
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('dossier')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activePreviewTab === 'dossier' ? 'bg-black text-white shadow-xs' : 'text-black/60 hover:text-black'
                  }`}
                >
                  Public Dossier
                </button>
              </div>
            </div>

            {/* Mockup Tab Contents */}
            <div className="p-4 sm:p-6 bg-white rounded-2xl border border-black/10 mt-3 min-h-[300px]">
              
              {/* TAB 1: DSA Bank Preview */}
              {activePreviewTab === 'dsa' && (
                <div className="space-y-4 animate-fadeIn font-mono">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="font-extrabold text-sm text-black">Consolidated 365 Unique Master Question Bank</h3>
                      <p className="text-xs text-black/60">Deduplicated across Striver SDE, Blind 75, NeetCode 150 &amp; CP Essentials</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold">
                        Spaced Repetition Active
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-black/10 border border-black/15 rounded-xl overflow-hidden text-xs">
                    {[
                      { title: "Trapping Rain Water", diff: "Hard", topic: "Arrays & Two Pointers", platform: "LeetCode", sheets: ["Striver SDE", "Blind 75", "NeetCode 150"], status: "Due Today" },
                      { title: "LRU Cache Design", diff: "Medium", topic: "Data Structures", platform: "LeetCode", sheets: ["Striver SDE", "NeetCode 150"], status: "Mastered" },
                      { title: "Course Schedule (Cycle in Graph)", diff: "Medium", topic: "Graphs", platform: "LeetCode", sheets: ["Blind 75", "NeetCode 150"], status: "Due in 3d" },
                      { title: "Edit Distance (Levenshtein DP)", diff: "Hard", topic: "Dynamic Programming", platform: "LeetCode", sheets: ["Striver SDE", "Blind 75"], status: "Mastered" },
                    ].map((p, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between gap-3 bg-white hover:bg-neutral-50">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CheckCircle2 className={`w-4 h-4 shrink-0 ${p.status === 'Mastered' ? 'text-emerald-600' : 'text-amber-500'}`} />
                          <span className="font-bold truncate text-black">{p.title}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            p.diff === 'Hard' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {p.diff}
                          </span>
                        </div>
                        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                          {p.sheets.map((s, sIdx) => (
                            <span key={sIdx} className="text-[10px] px-1.5 py-0.5 rounded bg-black/5 text-black/70 border border-black/10 font-medium">
                              {s}
                            </span>
                          ))}
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {p.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: System Design Preview */}
              {activePreviewTab === 'sysdesign' && (
                <div className="space-y-4 animate-fadeIn font-mono">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="font-extrabold text-sm text-black">16 Core HLD Foundations &amp; FAANG Case Studies</h3>
                      <p className="text-xs text-black/60">Distributed Caching, Sharding, Kafka Streaming, and Architecture Checklists</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300 text-[10px] font-bold">
                      Netflix • Uber • WhatsApp
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl border border-black/15 bg-[#F9F9F7] space-y-2">
                      <div className="flex items-center justify-between">
                        <strong className="text-black font-bold">Distributed Caching (Redis)</strong>
                        <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">HLD Pillar</span>
                      </div>
                      <p className="text-[11px] text-black/60 font-sans">Cache-Aside, Write-Through, Eviction Policies (LRU/LFU), Cache Stampede Thundering Herd prevention.</p>
                      <div className="flex items-center gap-2 text-[10px] text-black/50">
                        <span>4 Sub-modules</span>
                        <span>•</span>
                        <span>12 min read</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold">Completed</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-black/15 bg-[#F9F9F7] space-y-2">
                      <div className="flex items-center justify-between">
                        <strong className="text-black font-bold">Netflix Global Video CDN</strong>
                        <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">Case Study</span>
                      </div>
                      <p className="text-[11px] text-black/60 font-sans">Open Connect CDN appliances, Adaptive Bitrate Streaming (HLS/DASH), and regional edge failover.</p>
                      <div className="flex items-center gap-2 text-[10px] text-black/50">
                        <span>High Availability</span>
                        <span>•</span>
                        <span>Multi-Region</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold">FAANG Ready</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ATS Resume Preview */}
              {activePreviewTab === 'resume' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between flex-wrap gap-2 font-mono">
                    <div>
                      <h3 className="font-extrabold text-sm text-black">Jake&apos;s ATS-Compliant Overleaf LaTeX Resume</h3>
                      <p className="text-xs text-black/60">Single-page standard optimized for automated recruiter screening systems</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold">
                        1-Click LaTeX &amp; PDF Export
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-black/15 bg-white font-serif text-xs leading-normal shadow-xs">
                    <div className="text-center pb-2 border-b border-black">
                      <h4 className="text-base font-bold uppercase tracking-wider text-black">Abhideep Jain</h4>
                      <p className="text-[10px] text-black/80 mt-0.5">
                        +91 98765 43210 &nbsp;|&nbsp; candidate@prepstack.dev &nbsp;|&nbsp; linkedin.com/in/candidate &nbsp;|&nbsp; github.com/candidate &nbsp;|&nbsp; leetcode.com/u/candidate
                      </p>
                    </div>
                    <div className="mt-2 text-[11px]">
                      <div className="font-bold uppercase tracking-wider text-[10px] border-b border-black/40 pb-0.5 text-black">Education</div>
                      <div className="flex justify-between items-baseline font-bold text-black mt-1">
                        <span>Chandigarh University Institute of Engineering</span>
                        <span className="font-normal italic text-[10px] text-black/80">India</span>
                      </div>
                      <div className="flex justify-between items-baseline italic text-black/90 text-[10px]">
                        <span>Bachelor of Technology in Computer Science &amp; Engineering (CGPA: 8.85 / 10.0)</span>
                        <span className="font-normal text-[10px] text-black/80">2022 – 2026</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Public Dossier Preview */}
              {activePreviewTab === 'dossier' && (
                <div className="space-y-4 animate-fadeIn font-mono">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="font-extrabold text-sm text-black">Shareable Public Dossier URL</h3>
                      <p className="text-xs text-black/60">Verified coding stats, LeetCode ratings, Codeforces graphs &amp; GitHub heatmaps</p>
                    </div>
                    <Link to="/u/demo" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                      <span>prepstack.dev/u/demo</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                    <div className="p-3 rounded-xl border border-black/15 bg-neutral-50">
                      <div className="text-lg font-black text-black">285+</div>
                      <div className="text-[10px] text-black/60 font-bold uppercase">LeetCode Solves</div>
                    </div>
                    <div className="p-3 rounded-xl border border-black/15 bg-neutral-50">
                      <div className="text-lg font-black text-amber-600">1740</div>
                      <div className="text-[10px] text-black/60 font-bold uppercase">Contest Rating</div>
                    </div>
                    <div className="p-3 rounded-xl border border-black/15 bg-neutral-50">
                      <div className="text-lg font-black text-indigo-600">Specialist</div>
                      <div className="text-[10px] text-black/60 font-bold uppercase">Codeforces Rank</div>
                    </div>
                    <div className="p-3 rounded-xl border border-black/15 bg-neutral-50">
                      <div className="text-lg font-black text-emerald-600">384+</div>
                      <div className="text-[10px] text-black/60 font-bold uppercase">GitHub Commits</div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* 4. KEY FEATURE PILLARS SECTION */}
      <section className="py-20 border-b-2 border-black bg-[#F8F8F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase px-2.5 py-1 rounded-md bg-black text-white font-bold">
              Engineering Architecture
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-black font-display tracking-tight">
              Everything You Need to Clear Tier-1 Software Rounds.
            </h2>
            <p className="text-sm sm:text-base text-black/70 font-medium">
              Designed specifically for engineering students and self-taught developers who demand rigor, structure, and verified proof of work.
            </p>
          </div>

          {/* 6 Feature Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1: Master DSA Bank */}
            <div id="dsa" className="bg-white border-2 border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_#000] space-y-4 hover:translate-y-[-2px] transition-transform">
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 font-bold">
                <Code2 className="w-5 h-5 text-amber-700" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-black font-display">365 Master Question Bank</h3>
                <p className="text-xs text-black/65 leading-relaxed">
                  Canonical deduplication across <strong>Striver SDE Sheet (191)</strong>, <strong>Blind 75</strong>, <strong>NeetCode 150</strong>, and <strong>CP Essentials</strong>. Practice algorithmic patterns without solving duplicates.
                </p>
              </div>
              <ul className="text-xs font-mono space-y-1.5 text-black/80 pt-1">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Spaced Repetition Review (Day 1, 3, 7, 14, 30)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Pattern tags (Two Pointers, DP, Graphs)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Direct LeetCode &amp; Codeforces Problem Links
                </li>
              </ul>
            </div>

            {/* Card 2: System Design */}
            <div id="sysdesign" className="bg-white border-2 border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_#000] space-y-4 hover:translate-y-[-2px] transition-transform">
              <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-900 font-bold">
                <Cpu className="w-5 h-5 text-purple-700" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-black font-display">FAANG System Design &amp; HLD</h3>
                <p className="text-xs text-black/65 leading-relaxed">
                  16 fundamental architectural building blocks and in-depth FAANG case studies. Learn caching hierarchies, database replication, and consensus algorithms.
                </p>
              </div>
              <ul className="text-xs font-mono space-y-1.5 text-black/80 pt-1">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-600" />
                  Redis Caching, Kafka, &amp; Token Bucket Rate Limiting
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-600" />
                  Netflix CDN &amp; Uber Geospatial Architecture
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-600" />
                  Interactive Study Reader with Checklists
                </li>
              </ul>
            </div>

            {/* Card 3: Multi-Platform Analytics */}
            <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_#000] space-y-4 hover:translate-y-[-2px] transition-transform">
              <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-900 font-bold">
                <TrendingUp className="w-5 h-5 text-blue-700" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-black font-display">Live Coding Platform Sync</h3>
                <p className="text-xs text-black/65 leading-relaxed">
                  No manual copy-pasting. Connect your LeetCode, Codeforces, and GitHub accounts for real-time tracking of ratings, problems solved, and commit frequency.
                </p>
              </div>
              <ul className="text-xs font-mono space-y-1.5 text-black/80 pt-1">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  LeetCode Contest Rating &amp; Difficulty Breakdown
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  Codeforces Division Rating Graphs
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  Verified 365-Day GitHub Contribution Heatmap
                </li>
              </ul>
            </div>

            {/* Card 4: Web Dev Roadmaps */}
            <div id="webdev" className="bg-white border-2 border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_#000] space-y-4 hover:translate-y-[-2px] transition-transform">
              <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-900 font-bold">
                <Layers className="w-5 h-5 text-sky-700" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-black font-display">Full-Stack Roadmaps &amp; Projects</h3>
                <p className="text-xs text-black/65 leading-relaxed">
                  Step-by-step milestones for Frontend, Backend, and DevOps tracks paired with production-ready software project specifications.
                </p>
              </div>
              <ul className="text-xs font-mono space-y-1.5 text-black/80 pt-1">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-600" />
                  Interactive milestone progress tracking
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-600" />
                  FlashDrop: High-concurrency Flash Sale Engine
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-600" />
                  Developer Cheat Sheets &amp; API References
                </li>
              </ul>
            </div>

            {/* Card 5: Jake's ATS Resume */}
            <div id="resume" className="bg-white border-2 border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_#000] space-y-4 hover:translate-y-[-2px] transition-transform">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-900 font-bold">
                <FileText className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-black font-display">Jake&apos;s ATS Resume Generator</h3>
                <p className="text-xs text-black/65 leading-relaxed">
                  Export an ATS-optimized, single-page software engineering resume built on Jake Gutierrez&apos;s celebrated Overleaf LaTeX format.
                </p>
              </div>
              <ul className="text-xs font-mono space-y-1.5 text-black/80 pt-1">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Direct Download as PDF or copy .tex for Overleaf
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Populates verified solves &amp; academic credentials
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Email &amp; phone privacy toggle switches
                </li>
              </ul>
            </div>

            {/* Card 6: Public Candidate Dossier */}
            <div id="dossier" className="bg-white border-2 border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_#000] space-y-4 hover:translate-y-[-2px] transition-transform">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-black/20 flex items-center justify-center text-black font-bold">
                <UserCheck className="w-5 h-5 text-black" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-black font-display">Shareable Public Dossier</h3>
                <p className="text-xs text-black/65 leading-relaxed">
                  Share a verified, professional developer profile with recruiters (<code className="bg-neutral-100 px-1 py-0.5 rounded text-[11px]">/u/your_username</code>) highlighting your coding ratings and open-source contributions.
                </p>
              </div>
              <ul className="text-xs font-mono space-y-1.5 text-black/80 pt-1">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-black" />
                  Unified email primary key across all login providers
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-black" />
                  Custom clean username with 1-click sharing
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-black" />
                  Recruiter-ready dossier with direct resume access
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* 5. COMPARISON SECTION: PREPSTACK VS SCATTERED PREPARATION */}
      <section className="py-20 border-b-2 border-black bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase px-2.5 py-1 rounded-md bg-blue-100 text-blue-900 border border-blue-300 font-bold">
              The PrepStack Advantage
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-black font-display tracking-tight">
              Scattered Worksheets vs. A Unified Operating System
            </h2>
            <p className="text-xs sm:text-sm text-black/60 font-medium max-w-2xl mx-auto">
              Most students waste dozens of hours managing scattered spreadsheets, multiple profiles, and outdated resume templates.
            </p>
          </div>

          <div className="bg-[#F8F8F6] border-2 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_#000]">
            <div className="grid grid-cols-2 divide-x-2 divide-black text-xs font-mono font-bold">
              <div className="p-4 bg-neutral-100 text-black/60 uppercase tracking-wider text-[11px]">
                Conventional Prep Workflow
              </div>
              <div className="p-4 bg-black text-white uppercase tracking-wider text-[11px] flex items-center justify-between">
                <span>The PrepStack Way</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-black text-[10px]">Recommended</span>
              </div>
            </div>

            <div className="divide-y divide-black/15 text-xs font-mono">
              {[
                { oldWay: "Duplicate problem solving across Striver, Blind 75, & NeetCode spreadsheets", newWay: "Deduplicated 365 Master Question Bank with consolidated pattern grouping" },
                { oldWay: "Forgotten algorithms days before interview due to zero revision schedule", newWay: "Algorithmic Spaced Repetition queue (Day 1, 3, 7, 14, 30) ensuring long-term retention" },
                { oldWay: "Separate bookmarks for LeetCode, Codeforces, GitHub, and academic grades", newWay: "Live synchronized candidate profile pulling verified stats automatically" },
                { oldWay: "Uncalibrated guesswork on whether you are ready for FAANG or SDE-1 roles", newWay: "Calibrated Placement Diagnostic Engine with spider radar charts across 5 pillars" },
                { oldWay: "Manually reformatting MS Word resumes that fail automated ATS parsing", newWay: "1-Click Jake's ATS Resume Generator exporting single-page Overleaf LaTeX & PDF" },
              ].map((row, idx) => (
                <div key={idx} className="grid grid-cols-2 divide-x-2 divide-black">
                  <div className="p-4 text-black/60 bg-white flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>{row.oldWay}</span>
                  </div>
                  <div className="p-4 text-black font-bold bg-[#F4FDF7] flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{row.newWay}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="py-20 bg-black text-white relative overflow-hidden border-b-2 border-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-mono font-bold border border-white/20">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Placement Season Preparation 2025–2026</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white leading-tight">
            Stop Guessing. <br />
            Start Preparing With Verified Precision.
          </h2>

          <p className="text-sm sm:text-base text-white/70 max-w-2xl mx-auto leading-relaxed">
            Join thousands of ambitious students mastering algorithmic thinking, distributed system architectures, and landing offers at top product firms.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isLoggedIn ? "/dashboard" : "/login?mode=register"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white hover:bg-neutral-100 text-black font-mono text-sm font-extrabold shadow-[4px_4px_0px_#444] active:translate-y-0.5 transition-all"
            >
              <span>{isLoggedIn ? "Access Dashboard" : "Create Free Account"}</span>
              <ArrowRight className="w-4 h-4 text-emerald-600" />
            </Link>

            <Link
              to="/u/demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-transparent hover:bg-white/10 text-white font-mono text-sm font-bold border border-white/30 transition-all"
            >
              <span>View Sample Candidate Dossier &rarr;</span>
            </Link>
          </div>

        </div>
      </section>

      {/* 7. CLEAN PROFESSIONAL FOOTER */}
      <footer className="bg-white py-12 text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center">
              <Terminal className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-extrabold font-display text-sm tracking-tight text-black">
              PREP<span className="text-blue-600">STACK</span>
            </span>
            <span className="text-xs text-black/50 font-mono">
              — All-in-One Placement Preparation Engine
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs font-mono text-black/60">
            <a href="#dsa" className="hover:text-black hover:underline">DSA</a>
            <a href="#sysdesign" className="hover:text-black hover:underline">System Design</a>
            <a href="#resume" className="hover:text-black hover:underline">Overleaf Resume</a>
            <Link to="/u/demo" className="hover:text-black hover:underline">Demo Dossier</Link>
            <Link to="/login" className="hover:text-black hover:underline font-bold text-black">Sign In</Link>
          </div>

          <div className="text-xs font-mono text-black/40">
            &copy; 2026 PrepStack Platform. Free &amp; Open Source.
          </div>
        </div>
      </footer>

    </div>
  );
}

export default LandingPage;
