import React from 'react';
import { 
  Search, 
  RotateCw, 
  Terminal, 
  Bell, 
  Menu, 
  X, 
  CheckCircle2, 
  Sparkles,
  LogOut
} from 'lucide-react';
import { Badge } from '../common/Badge';

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

        <div className="flex items-center gap-2.5">
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
        </div>
      </div>

      {/* Middle search bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-black/40" />
          <input
            type="text"
            placeholder="Search problems, topics, system design case studies..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-[#F4F4F0] border border-black/10 text-black placeholder-black/40 focus:outline-none focus:border-black transition-colors"
          />
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
