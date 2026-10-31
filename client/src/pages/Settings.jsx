import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Trash2, 
  RotateCcw, 
  Save, 
  Check, 
  User, 
  Globe, 
  ShieldAlert,
  Database,
  Code2,
  Trophy,
  GitBranch,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useLocalCache } from '../hooks/useLocalCache';
import { Badge } from '../components/common/Badge';

export function Settings({ onRefreshAll }) {
  const [currentUser] = useLocalCache('prep_auth_user', null);
  const [handles, setHandles] = useLocalCache('prep_user_handles', {
    codeforces: '',
    leetcode: '',
    github: ''
  });

  const [cfInput, setCfInput] = useState(handles.codeforces || '');
  const [lcInput, setLcInput] = useState(handles.leetcode || '');
  const [ghInput, setGhInput] = useState(handles.github || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [cacheMessage, setCacheMessage] = useState('');
  const [syncing, setSyncing] = useState(false);

  // Resend email state for settings
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendFeedback, setResendFeedback] = useState('');

  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleResendFromSettings = async () => {
    if (!currentUser?.email) return;
    setResendLoading(true);
    setResendFeedback('');
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResendCooldown(data.cooldownSeconds || 30);
        setResendFeedback(`Verification email resent to ${currentUser.email}!`);
      } else {
        setResendFeedback(data.message || 'Please wait before requesting again.');
        if (data.remainingCooldown) setResendCooldown(data.remainingCooldown);
      }
    } catch (e) {
      setResendFeedback('Could not connect to server.');
    } finally {
      setResendLoading(false);
      setTimeout(() => setResendFeedback(''), 4000);
    }
  };

  const handleSaveHandles = async (e) => {
    if (e) e.preventDefault();
    setSyncing(true);
    setHandles({
      codeforces: cfInput.trim(),
      leetcode: lcInput.trim(),
      github: ghInput.trim()
    });
    setSavedSuccess(true);
    if (onRefreshAll) await onRefreshAll();
    setSyncing(false);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const applyPreset = async (cf, lc, gh) => {
    setCfInput(cf);
    setLcInput(lc);
    setGhInput(gh);
    setHandles({ codeforces: cf, leetcode: lc, github: gh });
    setSavedSuccess(true);
    if (onRefreshAll) await onRefreshAll();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleClearCache = async () => {
    try {
      await fetch('/api/cache/clear', { method: 'POST' });
    } catch (e) {
      console.warn('Backend cache clear warning:', e);
    }
    window.localStorage.removeItem('prep_dashboard_cache');
    window.localStorage.removeItem('prep_dsa_cache');
    setCacheMessage('All browser & server in-memory caches cleared!');
    if (onRefreshAll) onRefreshAll();
    setTimeout(() => setCacheMessage(''), 3000);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all progress milestones to default clean state?')) {
      window.localStorage.removeItem('prep_webdev_state');
      window.localStorage.removeItem('prep_sysdesign_state');
      window.localStorage.removeItem('prep_dsa_cache');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-black font-display tracking-tight">
            Connected Coding Platforms & API Hub
          </h1>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-black text-white font-bold">
            Live Platform Integrations
          </span>
        </div>
        <p className="text-xs text-black/60 font-medium">
          Configure your public competitive coding handles and developer profiles to pull real-time verified data via official public APIs.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-xs text-emerald-900 font-bold flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Coding handles successfully updated and live data synchronized!</span>
          </div>
          <span className="font-mono text-[11px] text-emerald-700">Live Cached</span>
        </div>
      )}

      {/* Current Authenticated Identity */}
      {currentUser && (
        <div className="p-5 rounded-3xl bg-white border-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3.5">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-12 h-12 rounded-2xl border-2 border-black object-cover shadow-xs"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-mono font-bold text-sm shadow-xs">
                {currentUser.name ? currentUser.name.substring(0, 2).toUpperCase() : 'ST'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-black font-display">{currentUser.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md font-bold border border-black/15 bg-black/5 text-black">
                  {currentUser.provider ? (currentUser.provider === 'google' ? 'Google SSO' : currentUser.provider === 'github' ? 'GitHub SSO' : 'Local Auth') : 'Student Profile'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <span className="text-xs text-black/50 font-mono">{currentUser.email}</span>
                <span className="text-black/20">•</span>
                <button
                  type="button"
                  onClick={handleResendFromSettings}
                  disabled={resendCooldown > 0 || resendLoading}
                  className="text-[11px] font-mono font-bold text-blue-600 hover:text-blue-800 underline disabled:opacity-50 cursor-pointer"
                >
                  {resendLoading ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend verification email'}
                </button>
              </div>
              {resendFeedback && (
                <p className="text-[11px] text-emerald-700 font-medium font-mono mt-1">
                  {resendFeedback}
                </p>
              )}
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-mono text-black/40 block uppercase font-bold">Target Placement Role</span>
            <span className="text-xs font-bold text-black font-display">{currentUser.targetRole || 'SDE-1'}</span>
          </div>
        </div>
      )}

      {/* Platform Cards Hub */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-black space-y-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-black font-display flex items-center gap-2">
              <User className="w-5 h-5 text-black" />
              Your Coding Platform Accounts
            </h2>
            <p className="text-xs text-black/50 mt-0.5">
              Enter your public usernames below. No API keys or passwords required!
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-black/50 uppercase font-bold">Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset('tourist', 'tourist', 'torvalds')}
              className="px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 text-[11px] font-mono font-bold transition-all"
            >
              Tourist
            </button>
            <button
              type="button"
              onClick={() => applyPreset('Petr', 'neal_wu', 'gaearon')}
              className="px-2.5 py-1 rounded-xl bg-blue-100 hover:bg-blue-200 border border-blue-300 text-blue-900 text-[11px] font-mono font-bold transition-all"
            >
              Neal Wu
            </button>
            <button
              type="button"
              onClick={() => applyPreset('', '', '')}
              className="px-2.5 py-1 rounded-xl bg-black/5 hover:bg-black/10 border border-black/15 text-black/70 text-[11px] font-mono font-bold transition-all"
            >
              Clean (0)
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveHandles} className="space-y-4 text-xs">
          {/* 1. LeetCode Card */}
          <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 hover:border-black/30 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="font-extrabold text-sm text-black font-display">LeetCode</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold border border-amber-300">
                  GraphQL API
                </span>
              </div>
              <span className={`text-xs font-mono font-bold flex items-center gap-1 ${handles.leetcode ? 'text-emerald-700' : 'text-black/40'}`}>
                {handles.leetcode ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Linked: @{handles.leetcode}
                  </>
                ) : (
                  'Not Connected'
                )}
              </span>
            </div>

            <p className="text-[11px] text-black/60">
              Synchronizes solved count (Easy, Medium, Hard breakdown), contest rating, and rank.
            </p>

            <div className="pt-1">
              <input
                type="text"
                value={lcInput}
                onChange={(e) => setLcInput(e.target.value)}
                placeholder="e.g. neal_wu or your_leetcode_username"
                className="w-full px-3 py-2 rounded-xl bg-white border border-black/15 text-black font-mono focus:outline-none focus:border-black font-medium"
              />
            </div>
          </div>

          {/* 2. Codeforces Card */}
          <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 hover:border-black/30 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-blue-600" />
                <span className="font-extrabold text-sm text-black font-display">Codeforces</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold border border-blue-300">
                  Official REST API
                </span>
              </div>
              <span className={`text-xs font-mono font-bold flex items-center gap-1 ${handles.codeforces ? 'text-emerald-700' : 'text-black/40'}`}>
                {handles.codeforces ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Linked: @{handles.codeforces}
                  </>
                ) : (
                  'Not Connected'
                )}
              </span>
            </div>

            <p className="text-[11px] text-black/60">
              Queries <code>user.info</code> and <code>user.status</code> to count unique AC problem submissions and current contest rank.
            </p>

            <div className="pt-1">
              <input
                type="text"
                value={cfInput}
                onChange={(e) => setCfInput(e.target.value)}
                placeholder="e.g. tourist or your_codeforces_handle"
                className="w-full px-3 py-2 rounded-xl bg-white border border-black/15 text-black font-mono focus:outline-none focus:border-black font-medium"
              />
            </div>
          </div>

          {/* 3. GitHub Card */}
          <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 hover:border-black/30 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-black" />
                <span className="font-extrabold text-sm text-black font-display">GitHub</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/5 text-black font-bold border border-black/15">
                  Public REST API
                </span>
              </div>
              <span className={`text-xs font-mono font-bold flex items-center gap-1 ${handles.github ? 'text-emerald-700' : 'text-black/40'}`}>
                {handles.github ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Linked: @{handles.github}
                  </>
                ) : (
                  'Not Connected'
                )}
              </span>
            </div>

            <p className="text-[11px] text-black/60">
              Fetches public repositories, merged pull requests, and annual commit heatmap activity.
            </p>

            <div className="pt-1">
              <input
                type="text"
                value={ghInput}
                onChange={(e) => setGhInput(e.target.value)}
                placeholder="e.g. torvalds or your_github_username"
                className="w-full px-3 py-2 rounded-xl bg-white border border-black/15 text-black font-mono focus:outline-none focus:border-black font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={syncing}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-extrabold bg-black hover:bg-neutral-800 text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] active:translate-y-[1px] transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Fetching Live Data...' : 'Save Handles & Sync All Platforms'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Cache & Data Management (Section 9) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-black space-y-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between border-b border-black/10 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-black" />
            <h2 className="text-sm font-extrabold text-black font-display">
              Cache & Storage Controls (Section 9)
            </h2>
          </div>
          {cacheMessage && (
            <span className="text-xs font-mono font-bold text-emerald-700">{cacheMessage}</span>
          )}
        </div>

        <p className="text-xs text-black/60 leading-relaxed font-medium">
          The dashboard uses multi-tier caching (Level 1: React state, Level 2: Browser localStorage,
          Level 3: Node in-memory LRU cache) to avoid external API rate limits and minimize latency.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleClearCache}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-black/5 hover:bg-black/10 text-black border border-black/15 transition-all"
          >
            <Trash2 className="w-4 h-4 text-black" />
            Purge In-Memory & Browser Cache
          </button>

          <button
            onClick={handleResetData}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 transition-all"
          >
            <RotateCcw className="w-4 h-4 text-rose-600" />
            Reset Progress to Default (Clean)
          </button>
        </div>
      </div>

      {/* Viva / Academic Submission Reference */}
      <div className="p-6 rounded-3xl bg-[#F9F9F7] border-2 border-black/15 space-y-2 text-xs text-black/60 font-mono">
        <span className="text-black font-extrabold block uppercase tracking-wider font-display">
          Topic 7: Placement Preparation Dashboard
        </span>
        <p>
          Course: Lab Based Mini Projects 2026 – Full Stack Development II
        </p>
        <p className="text-black/50">
          Architecture: React 19 Components + Hooks + Node.js Express API + In-Memory Multi-Tier Cache
        </p>
      </div>
    </div>
  );
}
