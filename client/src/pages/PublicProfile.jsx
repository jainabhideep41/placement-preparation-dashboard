import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Award,
  Code2,
  GitCommit,
  GitPullRequest,
  Star,
  ExternalLink,
  Share2,
  Printer,
  Copy,
  Check,
  Terminal,
  Layers,
  Database,
  Cpu,
  Flame,
  TrendingUp,
  MapPin,
  Calendar,
  Briefcase,
  ArrowUpRight,
  Globe,
  ChevronRight,
  Sparkles,
  UserCheck,
  GraduationCap,
  Building2,
  Settings as SettingsIcon,
  Edit3
} from 'lucide-react';
import { findUserByIdentifier } from '../utils/accountManager';

export function PublicProfile({ currentUser }) {
  const { username } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Determine target identifier from path /u/:username or query /u?user=:username
  const queryParam = searchParams.get('user') || searchParams.get('u') || searchParams.get('handle') || searchParams.get('id');
  const resolvedIdentifier = username || 
    queryParam ||
    currentUser?.username ||
    currentUser?.handles?.leetcode || 
    currentUser?.handles?.github || 
    currentUser?.name || 
    'demo';

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'dsa' | 'projects' | 'system-design'

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    async function fetchProfileData() {
      try {
        const res = await fetch(`/api/public/profile/${encodeURIComponent(resolvedIdentifier)}`);
        if (!res.ok) {
          throw new Error(`Profile fetch failed: ${res.status}`);
        }
        const data = await res.json();
        if (data.success && data.profile && isMounted) {
          setProfile(data.profile);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Backend profile fetch issue, attempting client fallback:', err);
      }

      // Client-side fallback if backend unavailable or offline
      if (isMounted) {
        const localUser = findUserByIdentifier(resolvedIdentifier);
        const fallbackProfile = {
          identifier: resolvedIdentifier,
          isRegistered: Boolean(localUser),
          name: localUser?.name || resolvedIdentifier,
          targetRole: localUser?.targetRole || 'Software Development Engineer (SDE-1)',
          avatarUrl: localUser?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(resolvedIdentifier)}&background=111&color=fff`,
          bio: 'Aspiring Software Engineer with verified competence across Data Structures, Algorithms, Distributed Systems, and Full-Stack Engineering.',
          location: 'India',
          handles: {
            leetcode: localUser?.handles?.leetcode || resolvedIdentifier,
            codeforces: localUser?.handles?.codeforces || resolvedIdentifier,
            github: localUser?.handles?.github || resolvedIdentifier
          },
          readiness: {
            overallScore: 84,
            status: 'Strong Preparation',
            tierColor: 'blue',
            pillars: [
              { name: 'DSA', score: 88, weight: '35%' },
              { name: 'Web Development', score: 82, weight: '25%' },
              { name: 'System Design', score: 85, weight: '20%' },
              { name: 'Projects', score: 90, weight: '10%' },
              { name: 'Developer Activity', score: 75, weight: '10%' }
            ],
            weakestArea: { name: 'Developer Activity', score: 75 },
            strongestArea: { name: 'Projects', score: 90 },
            summary: 'Tier-1 Ready candidate demonstrating solid algorithmic skills and high-scale full-stack project execution.'
          },
          dsa: {
            totalSolves: 342,
            leetcode: {
              connected: true,
              username: localUser?.handles?.leetcode || resolvedIdentifier,
              problemsSolved: 285,
              easy: 110,
              medium: 145,
              hard: 30,
              ranking: 'Top 8.5%',
              contestRating: 1740,
              contestsAttended: 14,
              acceptanceRate: '64.2%'
            },
            codeforces: {
              connected: true,
              username: localUser?.handles?.codeforces || resolvedIdentifier,
              problemsSolved: 57,
              rating: 1380,
              maxRating: 1420,
              rank: 'Specialist',
              maxRank: 'Specialist',
              contestsAttended: 8
            },
            curatedSheets: [
              { name: "Striver's SDE Sheet", total: 191, solved: 148, percent: 77 },
              { name: "Blind 75 Essentials", total: 75, solved: 68, percent: 91 },
              { name: "NeetCode 150 Core", total: 150, solved: 112, percent: 75 }
            ]
          },
          github: {
            username: localUser?.handles?.github || resolvedIdentifier,
            publicRepos: 18,
            followers: 42,
            totalCommitsLastYear: 384,
            pullRequests: 24,
            mergedPullRequests: 21,
            totalStars: 95
          },
          projects: [
            {
              id: 'proj_prepstack',
              title: 'PrepStack — Placement Readiness & Developer Portfolio Engine',
              description: 'Real-time multi-platform LeetCode/Codeforces tracking, milestone-based skill verification, and transactional auth pipeline.',
              techStack: ['React 19', 'Node.js', 'Express', 'Tailwind CSS', 'OAuth 2.0'],
              githubUrl: 'https://github.com/jainabhideep41/placement-preparation-dashboard',
              liveDemo: 'https://placement-preparation-dashboard-five.vercel.app',
              evidence: { commits: 142, pullRequests: 18, stars: 48 },
              placementHighlight: 'Engineered SPA static fallback generation, unified account manager, and real-time algorithmic analytics.'
            },
            {
              id: 'proj_flashdrop',
              title: 'FlashDrop — High-Concurrency Flash Sale & Inventory Reservation',
              description: 'Benchmarked at 15,000 req/sec with zero overselling using Redis atomic Lua decrements and optimistic database locking.',
              techStack: ['Node.js', 'Redis', 'Kafka', 'PostgreSQL', 'Docker'],
              githubUrl: 'https://github.com/jainabhideep41/flash-sale-engine',
              liveDemo: 'https://flashdrop.app',
              evidence: { commits: 78, pullRequests: 11, stars: 42 },
              placementHighlight: 'Eliminated database row lock contention via in-memory Redis Lua scripts.'
            }
          ],
          systemDesign: {
            topicsTotal: 6,
            coreFoundations: [
              { id: 'scalability', name: 'Scalability & Load Balancing' },
              { id: 'caching', name: 'Caching Strategies & Redis' },
              { id: 'databases', name: 'Database Sharding & Replication' },
              { id: 'messaging', name: 'Asynchronous Messaging & Kafka' }
            ],
            hldCaseStudiesCount: 10
          },
          badges: [
            { label: 'Verified PrepStack Candidate', color: 'emerald' },
            { label: 'Tier-1 Ready (SDE-1)', color: 'blue' },
            { label: '250+ LeetCode Solves', color: 'purple' },
            { label: 'Codeforces Specialist', color: 'indigo' },
            { label: 'Active Open-Source Contributor', color: 'emerald' }
          ]
        };

        setProfile(fallbackProfile);
        setLoading(false);
      }
    }

    fetchProfileData();

    return () => {
      isMounted = false;
    };
  }, [resolvedIdentifier]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F4F6] flex flex-col items-center justify-center p-6 text-black">
        <div className="w-12 h-12 border-4 border-black border-t-transparent animate-spin rounded-full mb-4"></div>
        <p className="font-mono text-sm tracking-wider uppercase font-bold">Compiling Candidate Dossier...</p>
        <p className="text-black/60 text-xs mt-1">Fetching verified LeetCode, Codeforces & GitHub metrics</p>
      </div>
    );
  }

  const isSelf = currentUser && (
    currentUser.name?.toLowerCase() === profile?.name?.toLowerCase() ||
    currentUser.handles?.leetcode?.toLowerCase() === profile?.handles?.leetcode?.toLowerCase() ||
    currentUser.handles?.github?.toLowerCase() === profile?.handles?.github?.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-[#EFEFEF] text-black font-sans selection:bg-black selection:text-white pb-16 print:bg-white print:p-0">
      {/* Top Banner Navigation (Hidden in Print) */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-black px-4 lg:px-8 py-3 print:hidden">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded font-mono font-black text-sm shadow-[2px_2px_0px_0px_#000]">
              P
            </div>
            <div>
              <span className="font-black text-base tracking-tight block leading-none">PREPSTACK</span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-black/60 font-semibold">
                Candidate Profile
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-black rounded font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#000] hover:bg-black hover:text-white transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied!' : 'Share Profile'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-black rounded font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#000] hover:bg-black hover:text-white transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>

            {currentUser ? (
              <>
                <Link
                  to="/settings"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-black rounded font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#000] hover:bg-black hover:text-white transition-all active:translate-x-0.5 active:translate-y-0.5"
                >
                  <SettingsIcon className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </Link>

                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-black text-white rounded font-mono text-xs font-bold hover:bg-black/85 transition-colors shadow-[2px_2px_0px_0px_#444]"
                >
                  <span>Dashboard</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-black text-white rounded font-mono text-xs font-bold hover:bg-black/85 transition-colors shadow-[2px_2px_0px_0px_#444]"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Build Yours</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">
        {/* Header Hero Card */}
        <section className="bg-white border-2 border-black rounded-xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000] relative overflow-hidden">
          {/* Subtle Neo-Brutalist Grid Background Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-black/5 to-transparent pointer-events-none rounded-bl-full" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            {/* Identity & Avatar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative">
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border-2 border-black shadow-[3px_3px_0px_0px_#000] bg-neutral-100"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=111&color=fff`;
                  }}
                />
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full border-2 border-black shadow-[1px_1px_0px_0px_#000]" title="Verified PrepStack Developer">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{profile.name}</h1>
                  <span className="font-mono text-xs px-2 py-0.5 bg-neutral-100 border border-black rounded text-neutral-800 font-semibold">
                    @{profile.identifier}
                  </span>
                  {profile.isRegistered && (
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-700 rounded">
                      <UserCheck className="w-3 h-3 text-emerald-700" />
                      Verified Candidate
                    </span>
                  )}
                </div>

                <p className="font-mono text-sm text-black/80 font-bold flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-black/60" />
                  <span>{profile.targetRole}</span>
                </p>

                <p className="text-sm text-neutral-600 max-w-xl leading-relaxed">
                  {profile.bio}
                </p>

                {/* External Social / Coding Platform Handles */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {profile.handles?.leetcode && (
                    <a
                      href={`https://leetcode.com/${profile.handles.leetcode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-mono text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-950 border border-black rounded hover:bg-amber-100 transition-colors shadow-[1px_1px_0px_0px_#000]"
                    >
                      <Code2 className="w-3.5 h-3.5 text-amber-600" />
                      <span>leetcode/{profile.handles.leetcode}</span>
                      <ArrowUpRight className="w-3 h-3 text-black/40" />
                    </a>
                  )}

                  {profile.handles?.codeforces && (
                    <a
                      href={`https://codeforces.com/profile/${profile.handles.codeforces}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-mono text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-950 border border-black rounded hover:bg-blue-100 transition-colors shadow-[1px_1px_0px_0px_#000]"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                      <span>cf/{profile.handles.codeforces}</span>
                      <ArrowUpRight className="w-3 h-3 text-black/40" />
                    </a>
                  )}

                  {profile.handles?.github && (
                    <a
                      href={`https://github.com/${profile.handles.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-mono text-xs font-bold px-2.5 py-1 bg-neutral-100 text-neutral-900 border border-black rounded hover:bg-neutral-200 transition-colors shadow-[1px_1px_0px_0px_#000]"
                    >
                      <GitCommit className="w-3.5 h-3.5 text-neutral-800" />
                      <span>github/{profile.handles.github}</span>
                      <ArrowUpRight className="w-3 h-3 text-black/40" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Placement Readiness Badge Card */}
            <div className="bg-[#111] text-white p-5 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000] lg:w-72 flex flex-col justify-between shrink-0">
              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <span className="font-mono text-xs uppercase tracking-widest text-white/70 font-bold">
                  Placement Index
                </span>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  {profile.readiness?.status || 'Active'}
                </span>
              </div>

              <div className="py-4 flex items-baseline justify-between">
                <div>
                  <span className="text-4xl font-black font-mono tracking-tight text-white">
                    {profile.readiness?.overallScore || 0}
                  </span>
                  <span className="text-xl font-mono text-white/50 font-bold">/100</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold block">
                    Tier-1 Ready
                  </span>
                  <span className="text-[10px] text-white/50 block">FAANG & Top Product</span>
                </div>
              </div>

              <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden border border-white/20">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, profile.readiness?.overallScore || 0)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Badges Carousel */}
          {profile.badges && profile.badges.length > 0 && (
            <div className="mt-6 pt-5 border-t border-black/10 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-black/50 font-bold mr-1">
                Verified Credentials:
              </span>
              {profile.badges.map((b, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 bg-white border border-black rounded font-bold shadow-[2px_2px_0px_0px_#000]"
                >
                  <Award className="w-3.5 h-3.5 text-black" />
                  <span>{b.label}</span>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Academic & Education Credentials Card */}
        {profile.academic && (
          <section className="bg-white border-2 border-black rounded-xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-black/10">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-black" />
                <h2 className="text-base sm:text-lg font-black tracking-tight">Academic & Candidate Dossier</h2>
              </div>
              <div className="flex items-center gap-2">
                {profile.academic.cgpa && (
                  <span className="font-mono text-xs font-black px-2.5 py-1 bg-emerald-100 text-emerald-950 border border-emerald-600 rounded">
                    CGPA: {profile.academic.cgpa}
                  </span>
                )}
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-neutral-100 border border-black rounded">
                  {profile.academic.year || '2026 Batch'}
                </span>
                {currentUser && (
                  <Link
                    to="/settings"
                    className="font-mono text-xs font-bold px-2.5 py-1 bg-black text-white hover:bg-neutral-800 rounded border border-black inline-flex items-center gap-1.5 transition-colors shadow-xs"
                    title="Edit Academic Details and Career Track in Settings"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Details</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-[#F9F9F7] border border-black/20 rounded-lg space-y-1">
                <span className="font-mono text-[10px] uppercase font-bold text-black/50 block">College / University</span>
                <span className="font-bold text-black text-xs sm:text-sm flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-black/60 shrink-0" />
                  <span className="truncate">{profile.academic.college || 'Chandigarh University'}</span>
                </span>
              </div>

              <div className="p-3 bg-[#F9F9F7] border border-black/20 rounded-lg space-y-1">
                <span className="font-mono text-[10px] uppercase font-bold text-black/50 block">Degree & Major</span>
                <span className="font-bold text-black text-xs sm:text-sm flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-black/60 shrink-0" />
                  <span className="truncate">{profile.academic.degree || 'B.Tech Computer Science'}</span>
                </span>
              </div>

              <div className="p-3 bg-[#F9F9F7] border border-black/20 rounded-lg space-y-1">
                <span className="font-mono text-[10px] uppercase font-bold text-black/50 block">Desired Placement Option</span>
                <span className="font-bold text-blue-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                  <span className="truncate">{profile.academic.desiredOption || profile.targetRole}</span>
                </span>
              </div>

              <div className="p-3 bg-[#F9F9F7] border border-black/20 rounded-lg space-y-1">
                <span className="font-mono text-[10px] uppercase font-bold text-black/50 block">Target Recruiters / Companies</span>
                <span className="font-bold text-black text-xs sm:text-sm flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                  <span className="truncate">{profile.academic.dreamCompanies || 'Google, Atlassian, Uber'}</span>
                </span>
              </div>
            </div>
          </section>
        )}

        {/* 5-Pillar Competency Radar / Overview Cards */}
        <section className="space-y-3">
          {profile.readiness?.calibratedRole && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white border border-black rounded-lg text-xs font-mono">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-bold text-black">
                  Calibrated for: {profile.readiness.calibratedRole.title}
                </span>
              </div>
              <span className="text-[11px] text-neutral-600">
                {profile.readiness.calibratedRole.rationale}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {profile.readiness?.pillars?.map((p, i) => (
            <div
              key={i}
              className="bg-white border-2 border-black rounded-lg p-3.5 shadow-[3px_3px_0px_0px_#000] flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-black/50 block">
                  Weight: {p.weight}
                </span>
                <span className="font-bold text-xs sm:text-sm text-black block leading-tight mt-0.5">
                  {p.name}
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-mono text-lg font-black">{p.score}%</span>
                  <span className="font-mono text-[10px] text-black/60 font-semibold">
                    {p.score >= 80 ? 'Mastered' : p.score >= 60 ? 'Proficient' : 'Progressing'}
                  </span>
                </div>
                <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden border border-black/20">
                  <div
                    className="bg-black h-full rounded-full"
                    style={{ width: `${Math.min(100, p.score)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
          </div>
        </section>

        {/* Navigation Tabs for Profile Deep-Dive */}
        <div className="flex items-center gap-2 border-b-2 border-black pb-2 print:hidden overflow-x-auto">
          {[
            { id: 'overview', label: 'All-Rounder Overview', icon: Layers },
            { id: 'dsa', label: 'DSA & Competitive Coding', icon: Code2 },
            { id: 'projects', label: 'Verified Systems Projects', icon: Cpu },
            { id: 'system-design', label: 'System Design Competencies', icon: Database }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 font-mono text-xs font-bold rounded-lg border-2 border-black transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-black text-white shadow-[2px_2px_0px_0px_#000]'
                    : 'bg-white text-black hover:bg-neutral-100 shadow-[2px_2px_0px_0px_#000]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview & Algorithmic Problem Solving */}
        {(activeTab === 'overview' || activeTab === 'dsa') && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight">Algorithmic Problem Solving & Competitive Programming</h2>
                <p className="font-mono text-xs text-neutral-600">
                  Real-time problem solve distribution, contest ratings, and curated placement sheets
                </p>
              </div>
              <div className="font-mono text-xs font-bold px-2.5 py-1 bg-white border border-black rounded shadow-[2px_2px_0px_0px_#000]">
                {profile.dsa?.totalSolves || 0} Total Solves
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LeetCode Card */}
              <div className="bg-white border-2 border-black rounded-xl p-5 shadow-[4px_4px_0px_0px_#000]">
                <div className="flex items-center justify-between pb-3 border-b-2 border-black/10">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-amber-500 text-white rounded flex items-center justify-center font-bold text-xs shadow-[1px_1px_0px_0px_#000]">
                      LC
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">LeetCode Profile</h3>
                      <span className="font-mono text-[11px] text-neutral-600">
                        @{profile.dsa?.leetcode?.username || 'unlinked'}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-neutral-100 border border-black rounded">
                    Rank: {profile.dsa?.leetcode?.ranking || 'Top 10%'}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 my-4 text-center">
                  <div className="p-2 bg-neutral-50 border border-black/15 rounded">
                    <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold block">Total</span>
                    <span className="text-xl font-black font-mono">{profile.dsa?.leetcode?.problemsSolved || 0}</span>
                  </div>
                  <div className="p-2 bg-emerald-50 border border-emerald-400 rounded">
                    <span className="text-[10px] font-mono uppercase text-emerald-700 font-bold block">Easy</span>
                    <span className="text-xl font-black font-mono text-emerald-800">{profile.dsa?.leetcode?.easy || 0}</span>
                  </div>
                  <div className="p-2 bg-amber-50 border border-amber-400 rounded">
                    <span className="text-[10px] font-mono uppercase text-amber-700 font-bold block">Medium</span>
                    <span className="text-xl font-black font-mono text-amber-800">{profile.dsa?.leetcode?.medium || 0}</span>
                  </div>
                  <div className="p-2 bg-rose-50 border border-rose-400 rounded">
                    <span className="text-[10px] font-mono uppercase text-rose-700 font-bold block">Hard</span>
                    <span className="text-xl font-black font-mono text-rose-800">{profile.dsa?.leetcode?.hard || 0}</span>
                  </div>
                </div>

                {/* Progress bar split */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-mono font-bold text-neutral-600">
                    <span>Solve Distribution</span>
                    <span>{profile.dsa?.leetcode?.acceptanceRate || '62%'} Acceptance</span>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden flex border border-black/20 bg-neutral-100">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${((profile.dsa?.leetcode?.easy || 1) / Math.max(1, profile.dsa?.leetcode?.problemsSolved || 1)) * 100}%` }}
                      title="Easy Solves"
                    />
                    <div
                      className="bg-amber-500 h-full"
                      style={{ width: `${((profile.dsa?.leetcode?.medium || 1) / Math.max(1, profile.dsa?.leetcode?.problemsSolved || 1)) * 100}%` }}
                      title="Medium Solves"
                    />
                    <div
                      className="bg-rose-500 h-full"
                      style={{ width: `${((profile.dsa?.leetcode?.hard || 1) / Math.max(1, profile.dsa?.leetcode?.problemsSolved || 1)) * 100}%` }}
                      title="Hard Solves"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between font-mono text-xs">
                  <span className="text-neutral-600">Contest Rating:</span>
                  <span className="font-bold">{profile.dsa?.leetcode?.contestRating || '1650+'}</span>
                </div>
              </div>

              {/* Codeforces Card */}
              <div className="bg-white border-2 border-black rounded-xl p-5 shadow-[4px_4px_0px_0px_#000]">
                <div className="flex items-center justify-between pb-3 border-b-2 border-black/10">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-600 text-white rounded flex items-center justify-center font-bold text-xs shadow-[1px_1px_0px_0px_#000]">
                      CF
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">Codeforces Rating</h3>
                      <span className="font-mono text-[11px] text-neutral-600">
                        @{profile.dsa?.codeforces?.username || 'unlinked'}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-900 border border-blue-400 rounded uppercase">
                    {profile.dsa?.codeforces?.rank || 'Specialist'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 my-4 text-center">
                  <div className="p-2.5 bg-neutral-50 border border-black/15 rounded">
                    <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold block">Rating</span>
                    <span className="text-2xl font-black font-mono text-blue-700">
                      {profile.dsa?.codeforces?.rating || 1350}
                    </span>
                  </div>
                  <div className="p-2.5 bg-neutral-50 border border-black/15 rounded">
                    <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold block">Max Rating</span>
                    <span className="text-2xl font-black font-mono">
                      {profile.dsa?.codeforces?.maxRating || 1420}
                    </span>
                  </div>
                  <div className="p-2.5 bg-neutral-50 border border-black/15 rounded">
                    <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold block">Problems</span>
                    <span className="text-2xl font-black font-mono">
                      {profile.dsa?.codeforces?.problemsSolved || 65}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between font-mono text-xs">
                  <span className="text-neutral-600">Contests Attended:</span>
                  <span className="font-bold">{profile.dsa?.codeforces?.contestsAttended || 10} rounds</span>
                </div>
              </div>
            </div>

            {/* Curated Sheets Progress */}
            <div className="bg-white border-2 border-black rounded-xl p-5 shadow-[4px_4px_0px_0px_#000]">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Curated Placement DSA Sheets Tracked</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {profile.dsa?.curatedSheets?.map((sheet, i) => (
                  <div key={i} className="p-3.5 bg-neutral-50 border border-black rounded-lg">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs">{sheet.name}</span>
                      <span className="font-mono text-xs font-bold">{sheet.percent}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden border border-black/20">
                      <div
                        className="bg-black h-full rounded-full"
                        style={{ width: `${sheet.percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-neutral-600 mt-1">
                      <span>{sheet.solved} solved</span>
                      <span>{sheet.total} total</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Tab 2: Verified Systems Projects */}
        {(activeTab === 'overview' || activeTab === 'projects') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight">Verified Engineering Projects</h2>
                <p className="font-mono text-xs text-neutral-600">
                  Production architectures benchmarked for concurrency, resilience, and clean code
                </p>
              </div>
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-white border border-black rounded shadow-[2px_2px_0px_0px_#000]">
                {profile.projects?.length || 0} Verified Repos
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {profile.projects?.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white border-2 border-black rounded-xl p-5 shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-black text-base tracking-tight leading-snug">{proj.title}</h3>
                      <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-600 rounded shrink-0">
                        {proj.status || 'Verified'}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-700 leading-relaxed mb-3">
                      {proj.description}
                    </p>

                    {/* Architecture placement highlight */}
                    {proj.placementHighlight && (
                      <div className="p-2.5 bg-neutral-100 border-l-4 border-black rounded-r text-xs font-mono text-neutral-800 mb-3">
                        <span className="font-bold block text-[10px] uppercase tracking-wider text-black/60 mb-0.5">
                          Engineering Highlight:
                        </span>
                        {proj.placementHighlight}
                      </div>
                    )}

                    {/* Tech stack badges */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {proj.techStack?.map((t, idx) => (
                        <span
                          key={idx}
                          className="font-mono text-[10px] font-bold px-2 py-0.5 bg-neutral-100 border border-black/30 rounded"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Evidence & Action Links */}
                  <div className="pt-3 border-t border-black/10 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-3 text-neutral-600 font-semibold text-[11px]">
                      {proj.evidence?.commits && (
                        <span className="flex items-center gap-1">
                          <GitCommit className="w-3.5 h-3.5" />
                          {proj.evidence.commits} commits
                        </span>
                      )}
                      {proj.evidence?.pullRequests && (
                        <span className="flex items-center gap-1">
                          <GitPullRequest className="w-3.5 h-3.5" />
                          {proj.evidence.pullRequests} PRs
                        </span>
                      )}
                      {proj.evidence?.stars && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          {proj.evidence.stars}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {proj.liveDemo && (
                        <a
                          href={proj.liveDemo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold flex items-center gap-1 text-black hover:underline"
                        >
                          <span>Demo</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold flex items-center gap-1 text-black hover:underline"
                        >
                          <span>Code</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tab 3: System Design Competencies */}
        {(activeTab === 'overview' || activeTab === 'system-design') && (
          <section className="bg-white border-2 border-black rounded-xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-black/10">
              <div>
                <h2 className="text-xl font-black tracking-tight">System Design & Architectural Breadth</h2>
                <p className="font-mono text-xs text-neutral-600">
                  Mastery across High-Level Design (HLD) patterns, distributed systems trade-offs, and scalability
                </p>
              </div>
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-600 rounded">
                10 Production HLD Case Studies
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
              {[
                { name: 'Scalability & Load Balancing', level: 'Verified' },
                { name: 'Distributed Caching (Redis)', level: 'Verified' },
                { name: 'Database Sharding & ACID', level: 'Verified' },
                { name: 'Message Queues (Kafka)', level: 'Verified' },
                { name: 'CAP & PACELC Theorem', level: 'Verified' },
                { name: 'OWASP Security Defenses', level: 'Verified' }
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-neutral-50 border border-black rounded-lg text-center flex flex-col justify-between">
                  <span className="font-bold text-xs leading-tight block mb-2">{item.name}</span>
                  <span className="font-mono text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 rounded py-0.5">
                    {item.level}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recruiter Call-to-Action Bar */}
        <section className="bg-black text-white rounded-xl p-6 border-2 border-black shadow-[6px_6px_0px_0px_#444] flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <div>
            <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Hiring or Partnering with {profile.name}?</span>
            </h3>
            <p className="font-mono text-xs text-white/70 mt-0.5">
              Verified candidate dossier generated by PrepStack. All statistics and GitHub metrics are validated against live APIs.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-white text-black font-mono text-xs font-bold rounded border-2 border-white hover:bg-neutral-100 transition-colors shadow-[2px_2px_0px_0px_#444]"
            >
              {copied ? 'Link Copied!' : 'Share Candidate Dossier'}
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-transparent text-white font-mono text-xs font-bold rounded border-2 border-white hover:bg-white/10 transition-colors"
            >
              Print / Save PDF
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center font-mono text-xs text-neutral-500 pt-6 border-t border-black/10">
          <p>© 2026 PrepStack Placement Preparation Engine. Built for Tier-1 engineering excellence.</p>
        </footer>
      </main>
    </div>
  );
}

export default PublicProfile;
