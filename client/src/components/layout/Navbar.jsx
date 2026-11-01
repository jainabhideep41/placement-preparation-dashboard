import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
  UserCheck
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { ALL_UNIQUE_PROBLEMS, matchProblem } from '../../utils/curatedSheetsManager';

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
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);

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
    if (!navSearchQuery.trim()) return [];
    return ALL_UNIQUE_PROBLEMS.filter(p => matchProblem(p, navSearchQuery)).slice(0, 6);
  }, [navSearchQuery]);
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

      {/* Middle search bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6" ref={searchRef}>
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
            placeholder="Search all 365 questions, topics, patterns..."
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl bg-[#F4F4F0] border border-black/10 text-black placeholder-black/40 focus:outline-none focus:border-black transition-colors"
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
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] overflow-hidden z-50 animate-fadeIn">
              <div className="px-3.5 py-2 bg-[#F4F4F0] border-b border-black/10 flex items-center justify-between text-[11px] font-mono text-black/60">
                <span>Matched Questions ({searchResults.length})</span>
                <span>Press ESC or click outside to dismiss</span>
              </div>

              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-black/50 font-mono">
                  No questions match &ldquo;{navSearchQuery}&rdquo;
                </div>
              ) : (
                <div className="divide-y divide-black/5 max-h-80 overflow-y-auto">
                  {searchResults.map((item) => (
                    <div 
                      key={item.canonicalKey}
                      className="p-3 hover:bg-[#F4F4F0] transition-colors flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-black truncate hover:underline">
                          <a href={item.problemUrl} target="_blank" rel="noopener noreferrer">
                            {item.title}
                          </a>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono text-black/60">
                          <span className="font-semibold text-black">{item.platform}</span>
                          <span>•</span>
                          <span className={item.difficulty === 'Easy' ? 'text-emerald-700' : item.difficulty === 'Medium' ? 'text-amber-700' : 'text-rose-700'}>
                            {item.difficulty}
                          </span>
                          {item.rating && (
                            <>
                              <span>•</span>
                              <span className="text-amber-700 font-bold">★ {item.rating}</span>
                            </>
                          )}
                          <span>•</span>
                          <span className="truncate">{item.topic}</span>
                        </div>
                      </div>

                      <a
                        href={item.problemUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsSearchOpen(false)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black text-white text-[11px] font-bold shadow-xs hover:bg-neutral-800 shrink-0"
                      >
                        <span>Solve</span>
                        <ExternalLink className="w-3 h-3 text-white/80" />
                      </a>
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
          to="/u"
          title="View Your Public Developer Profile"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-white border border-black/20 hover:border-black text-black shadow-xs transition-all hover:bg-neutral-50 active:translate-y-0.5"
        >
          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Public Profile</span>
        </Link>

        {/* User profile & logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-black/10">
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
