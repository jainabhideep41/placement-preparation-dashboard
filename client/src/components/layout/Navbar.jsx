import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  RotateCw, 
  Terminal, 
  Bell, 
  Menu, 
  X, 
  CheckCircle2, 
  Sparkles,
  LogOut,
  ExternalLink,
  Code2,
  UserCheck,
  Settings as SettingsIcon,
  ServerCog,
  Globe2,
  Briefcase,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { ALL_UNIQUE_PROBLEMS } from '../../utils/curatedSheetsManager';
import { systemDesignTopics, systemDesignCaseStudies } from '../../data/systemDesignData';
import { webDevRoadmaps, webDevProjects } from '../../data/webDevData';
import { CALIBRATED_ROLES } from '../../pages/PlacementReadiness';

// Pre-indexed Universal Multi-Tech-Stack Catalog
const UNIVERSAL_CATALOG = [
  // 1. DSA Problems (365 unique problems)
  ...ALL_UNIQUE_PROBLEMS.map(p => ({
    id: p.canonicalKey || p.id,
    type: 'dsa',
    category: 'DSA & CP',
    title: p.title,
    subtitle: `${p.platform} • ${p.difficulty}${p.rating ? ` (★ ${p.rating})` : ''} • ${p.topic}`,
    problemUrl: p.problemUrl,
    route: '/dsa',
    state: { search: p.title },
    searchTerms: `${p.title} ${p.platform} ${p.difficulty} ${p.topic} ${(p.sheets || []).map(s => s.sheetName).join(' ')}`.toLowerCase()
  })),

  // 2. System Design Core Foundations & Principles
  ...systemDesignTopics.map(t => ({
    id: t.id,
    type: 'sysdesign',
    category: 'System Design',
    title: t.name,
    subtitle: `${t.category} HLD Foundation • ${t.milestones?.length || 0} Modules • ${t.readTime}`,
    route: '/system-design',
    state: { tab: 'topics', search: t.name, topicId: t.id },
    searchTerms: `${t.name} system design hld architecture ${t.category} ${(t.milestones || []).join(' ')} ${t.description || ''}`.toLowerCase()
  })),

  // 3. System Design Real-world Case Studies
  ...systemDesignCaseStudies.map(cs => ({
    id: cs.id,
    type: 'sysdesign',
    category: 'Case Study',
    title: cs.title,
    subtitle: `FAANG System Design Architecture • Scalability & Distributed Trade-offs`,
    route: '/system-design',
    state: { tab: 'casestudies', search: cs.title, caseStudyId: cs.id },
    searchTerms: `${cs.title} case study system design hld architecture scalability distributed faang`.toLowerCase()
  })),

  // 4. Web Development Roadmaps
  ...webDevRoadmaps.map(r => ({
    id: r.id,
    type: 'webdev',
    category: 'Web Dev Roadmap',
    title: r.title,
    subtitle: `${r.badge} Architecture • ${r.milestones?.length || 0} Milestones`,
    route: '/webdev',
    state: { tab: 'roadmaps', roadmapId: r.id },
    searchTerms: `${r.title} web dev full stack roadmap frontend backend databases devops ${r.badge} ${r.description || ''}`.toLowerCase()
  })),

  // 5. Web Development Individual Core Modules
  ...webDevRoadmaps.flatMap(r => 
    r.milestones.map(m => ({
      id: m.id,
      type: 'webdev',
      category: 'Web Dev Module',
      title: m.title,
      subtitle: `${r.title} • ${m.badge} • ${m.readTime}`,
      route: '/webdev',
      state: { tab: 'roadmaps', roadmapId: r.id, search: m.title },
      searchTerms: `${m.title} ${r.title} web dev milestone ${m.badge} ${m.summary || ''}`.toLowerCase()
    }))
  ),

  // 6. Verified Production Placement Projects
  ...webDevProjects.map(proj => ({
    id: proj.id,
    type: 'webdev',
    category: 'System Project',
    title: proj.title,
    subtitle: `Verified Placement Project • ${(proj.techStack || []).join(', ') || 'Full Stack'}`,
    route: '/webdev',
    state: { tab: 'projects', search: proj.title },
    searchTerms: `${proj.title} project portfolio ${(proj.techStack || []).join(' ')} ${proj.summary || ''}`.toLowerCase()
  })),

  // 7. Target Career Tracks & Roles
  ...CALIBRATED_ROLES.map(role => ({
    id: role.id,
    type: 'career',
    category: 'Career Track',
    title: role.title,
    subtitle: `${role.badge} • ${(role.techStack || []).slice(0, 3).join(', ')}`,
    route: '/readiness',
    state: { roleId: role.id },
    searchTerms: `${role.title} career track role readiness placement ${(role.techStack || []).join(' ')} ${role.rationale || ''}`.toLowerCase()
  }))
];

export function Navbar({ 
  onRefresh, 
  isRefreshing, 
  lastSynced, 
  onToggleSidebar, 
  isSidebarOpen,
  readinessScore = 0,
  tierStatus = 'Keep Preparing',
  currentUser,
  onLogout
}) {
  const navigate = useNavigate();
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All'); // 'All' | 'dsa' | 'sysdesign' | 'webdev' | 'career'
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef(null);

  useEffect(() => {
    setSelectedIndex(0);
  }, [navSearchQuery, activeCategoryFilter]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    const q = navSearchQuery.trim().toLowerCase();
    if (!q) return [];

    const queryWords = q.split(/\s+/).filter(Boolean);

    const matches = UNIVERSAL_CATALOG.filter(item => {
      if (activeCategoryFilter !== 'All' && item.type !== activeCategoryFilter) {
        return false;
      }
      return queryWords.every(word => item.searchTerms.includes(word));
    });

    return matches.slice(0, 10);
  }, [navSearchQuery, activeCategoryFilter]);

  const handleNavigateItem = (item) => {
    setIsSearchOpen(false);
    setNavSearchQuery('');
    navigate(item.route, { state: item.state });
  };

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'dsa':
        return 'bg-amber-50 text-amber-900 border-amber-300';
      case 'sysdesign':
        return 'bg-purple-50 text-purple-900 border-purple-300';
      case 'webdev':
        return 'bg-sky-50 text-sky-900 border-sky-300';
      case 'career':
        return 'bg-emerald-50 text-emerald-900 border-emerald-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getActionBtnStyle = (type) => {
    switch (type) {
      case 'dsa':
        return 'bg-black text-white hover:bg-neutral-800';
      case 'sysdesign':
        return 'bg-purple-700 text-white hover:bg-purple-800';
      case 'webdev':
        return 'bg-sky-700 text-white hover:bg-sky-800';
      case 'career':
        return 'bg-emerald-700 text-white hover:bg-emerald-800';
      default:
        return 'bg-black text-white hover:bg-neutral-800';
    }
  };

  const getActionLabel = (type) => {
    switch (type) {
      case 'dsa':
        return 'Practice';
      case 'sysdesign':
        return 'Study HLD';
      case 'webdev':
        return 'Explore';
      case 'career':
        return 'Calibrate';
      default:
        return 'View';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-black/10 bg-white/95 px-4 lg:px-6 backdrop-blur-md">
      {/* Left branding & mobile toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-black/50 hover:text-black hover:bg-black/5 focus:outline-none"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link to="/dashboard" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
            <Terminal className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-display tracking-tight text-black">
                PREP<span className="text-blue-600">STACK</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/5 text-black/60 border border-black/10">
                Topic 7
              </span>
            </div>
            <p className="hidden sm:block text-[10px] text-black/50">
              Placement Preparation & Dev Portfolio
            </p>
          </div>
        </Link>
      </div>

      {/* Middle Universal Multi-Tech-Stack Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-xl mx-6" ref={searchRef}>
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-black/40" />
          <input
            type="text"
            value={navSearchQuery}
            onChange={(e) => {
              setNavSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (searchResults.length > 0 ? (prev + 1) % searchResults.length : 0));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (searchResults.length > 0 ? (prev - 1 + searchResults.length) % searchResults.length : 0));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                if (searchResults[selectedIndex]) {
                  handleNavigateItem(searchResults[selectedIndex]);
                } else if (searchResults.length > 0) {
                  handleNavigateItem(searchResults[0]);
                }
              } else if (e.key === 'Escape') {
                setIsSearchOpen(false);
              }
            }}
            placeholder="Search across DSA, System Design, Full-Stack Web Dev, Roadmaps..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-[#F4F4F0] border border-black/10 text-black placeholder-black/40 focus:outline-none focus:border-black transition-colors"
          />
          {navSearchQuery && (
            <button
              onClick={() => {
                setNavSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute right-2.5 top-2.5 text-black/40 hover:text-black"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Quick Dropdown Results Panel */}
          {isSearchOpen && navSearchQuery.trim() && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] overflow-hidden z-50 animate-fadeIn min-w-[320px] sm:min-w-[500px]">
              <div className="px-3.5 py-2.5 bg-[#F4F4F0] border-b border-black/10 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-black/60">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'All', label: 'All Stacks' },
                    { id: 'dsa', label: 'DSA & CP' },
                    { id: 'sysdesign', label: 'System Design' },
                    { id: 'webdev', label: 'Web Dev' },
                    { id: 'career', label: 'Career Tracks' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveCategoryFilter(tab.id)}
                      className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                        activeCategoryFilter === tab.id
                          ? 'bg-black text-white'
                          : 'bg-white border border-black/10 text-black/70 hover:text-black'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <span>{searchResults.length} {searchResults.length === 1 ? 'match' : 'matches'}</span>
              </div>

              {searchResults.length === 0 ? (
                <div className="p-6 text-center text-xs text-black/50 font-mono">
                  No items match &ldquo;{navSearchQuery}&rdquo; {activeCategoryFilter !== 'All' ? `in ${activeCategoryFilter}` : 'across any tech stack'}.
                </div>
              ) : (
                <div className="divide-y divide-black/5 max-h-96 overflow-y-auto">
                  {searchResults.map((item, idx) => (
                    <div 
                      key={`${item.type}_${item.id}`}
                      onClick={() => handleNavigateItem(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`p-3 transition-colors flex items-center justify-between gap-3 text-xs cursor-pointer group ${
                        idx === selectedIndex ? 'bg-[#ECECE6] ring-1 ring-black/15' : 'hover:bg-[#F4F4F0]'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${getBadgeStyle(item.type)}`}>
                            {item.category}
                          </span>
                          <span className="font-bold text-black truncate group-hover:text-blue-600 transition-colors">
                            {item.title}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-black/60 truncate">
                          {item.subtitle}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                        {item.type === 'dsa' && item.problemUrl && (
                          <a
                            href={item.problemUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black text-white text-[11px] font-bold shadow-xs hover:bg-neutral-800"
                            title="Open external problem link"
                          >
                            <span>Solve</span>
                            <ExternalLink className="w-3 h-3 text-white/80" />
                          </a>
                        )}
                        <button
                          onClick={() => handleNavigateItem(item)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-xs transition-all ${getActionBtnStyle(item.type)}`}
                        >
                          <span>{getActionLabel(item.type)}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Sync status */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-black/50 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{lastSynced ? `Synced ${lastSynced}` : 'Live Cached'}</span>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Synchronize platform data"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-black/70 bg-black/5 hover:bg-black/10 border border-black/10 transition-colors disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 text-black/60 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Sync</span>
        </button>

        {/* Readiness Badge */}
        <div className="flex items-center gap-1.5">
          <Badge variant={readinessScore >= 85 ? 'emerald' : readinessScore >= 70 ? 'blue' : 'amber'}>
            <Sparkles className="w-3 h-3" />
            <span className="font-bold">{readinessScore}%</span>
          </Badge>
        </div>

        {/* Public Profile View Link */}
        <Link
          to={`/u/${encodeURIComponent(currentUser?.username || currentUser?.email?.split('@')[0]?.replace(/[^a-z0-9_-]/gi, '').toLowerCase() || currentUser?.handles?.leetcode || 'demo')}`}
          title="View Your Public Developer Profile"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-white border border-black/20 hover:border-black text-black shadow-xs transition-all hover:bg-neutral-50 active:translate-y-0.5"
        >
          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Public Profile</span>
        </Link>

        {/* Settings Link */}
        <Link
          to="/settings"
          title="Account Settings, Username & Dossier"
          className="p-1.5 rounded-xl text-black/60 hover:text-black hover:bg-black/5 border border-transparent hover:border-black/10 transition-colors"
        >
          <SettingsIcon className="w-4 h-4" />
        </Link>

        {/* User profile & logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-black/10">
          <Link
            to="/settings"
            title="Edit Profile in Settings"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser?.name || 'User'}
                className="w-8 h-8 rounded-full border border-black/20 object-cover shadow-xs"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center font-mono text-xs font-bold text-white">
                {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : 'ST'}
              </div>
            )}
            <div className="hidden md:block text-left text-xs leading-tight">
              <span className="font-semibold text-black block truncate max-w-[100px]">
                {currentUser?.name || 'Student'}
              </span>
              <span className="text-[10px] text-black/40 font-mono">Logged In</span>
            </div>
          </Link>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Log Out / Switch Account"
              className="p-1.5 rounded-lg text-black/40 hover:text-rose-600 hover:bg-black/5 transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
