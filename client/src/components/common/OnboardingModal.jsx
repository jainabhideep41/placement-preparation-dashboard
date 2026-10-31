import React, { useState } from 'react';
import { 
  Terminal, 
  Code2, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

function GoogleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
      />
    </svg>
  );
}

function GitHubIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function OnboardingModal({ user, onComplete }) {
  const isGitHubAuth = user?.provider === 'github' || user?.oauthProvider === 'github';
  const initialGithub = user?.handles?.github || '';

  const [leetcode, setLeetcode] = useState(user?.handles?.leetcode || '');
  const [codeforces, setCodeforces] = useState(user?.handles?.codeforces || '');
  const [github, setGithub] = useState(initialGithub);
  const [targetRole, setTargetRole] = useState(user?.targetRole || 'Software Development Engineer (SDE-1)');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    const handles = {
      leetcode: leetcode.trim(),
      codeforces: codeforces.trim(),
      github: isGitHubAuth ? (initialGithub || github.trim()) : github.trim()
    };

    onComplete(handles, targetRole);
  };

  const handleSkip = () => {
    const handles = {
      leetcode: '',
      codeforces: '',
      github: isGitHubAuth ? initialGithub : ''
    };
    onComplete(handles, targetRole);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200/80 shadow-2xl p-7 sm:p-8 space-y-6 relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-sm">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            {isGitHubAuth ? (
              <span className="p-2 rounded-xl bg-gray-100 text-gray-900 flex items-center gap-1.5 text-xs font-semibold">
                <GitHubIcon className="w-4 h-4" />
                GitHub Connected
              </span>
            ) : (
              <span className="p-2 rounded-xl bg-blue-50 text-blue-700 flex items-center gap-1.5 text-xs font-semibold">
                <GoogleIcon className="w-4 h-4" />
                Google Connected
              </span>
            )}
          </div>

          <h2 className="text-xl font-bold tracking-tight text-gray-900 pt-1">
            Complete Your Student Profile
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            {isGitHubAuth
              ? `Welcome ${user?.name || ''}! We linked your GitHub account (@${initialGithub}). Add your LeetCode and Codeforces handles to auto-track your solves.`
              : `Welcome ${user?.name || ''}! Add your coding handles below so PrepStack can automatically sync your contest ratings and solve counts.`}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* LeetCode Input */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1 text-[11px] flex items-center justify-between">
              <span>LeetCode Username</span>
              <span className="text-[10px] text-gray-400 font-normal">Optional</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 w-3.5 h-3.5 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center text-[10px] font-bold">
                LC
              </span>
              <input
                type="text"
                value={leetcode}
                onChange={(e) => setLeetcode(e.target.value)}
                placeholder="e.g. neal_wu or your_username"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 font-mono text-xs focus:outline-none focus:border-black focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Codeforces Input */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1 text-[11px] flex items-center justify-between">
              <span>Codeforces Handle</span>
              <span className="text-[10px] text-gray-400 font-normal">Optional</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 w-3.5 h-3.5 rounded-full bg-blue-500/20 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                CF
              </span>
              <input
                type="text"
                value={codeforces}
                onChange={(e) => setCodeforces(e.target.value)}
                placeholder="e.g. tourist or your_handle"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 font-mono text-xs focus:outline-none focus:border-black focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* GitHub Input (Only shown if signed in via Google) */}
          {!isGitHubAuth && (
            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-[11px] flex items-center justify-between">
                <span>GitHub Username</span>
                <span className="text-[10px] text-gray-400 font-normal">Optional</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 w-3.5 h-3.5 rounded-full bg-gray-900/10 text-gray-800 flex items-center justify-center text-[10px] font-bold">
                  GH
                </span>
                <input
                  type="text"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="e.g. torvalds or your_username"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 font-mono text-xs focus:outline-none focus:border-black focus:bg-white transition-all"
                />
              </div>
            </div>
          )}

          {/* Target Role Selector */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1 text-[11px]">
              Target Placement Goal
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs font-medium focus:outline-none focus:border-black focus:bg-white"
            >
              <option value="Software Development Engineer (SDE-1)">
                Software Development Engineer (SDE-1)
              </option>
              <option value="Tier 1 Product Companies (FAANG / Big Tech)">
                Tier 1 Product Companies (FAANG / Big Tech)
              </option>
              <option value="High-Growth Tech Startups">High-Growth Tech Startups</option>
              <option value="FinTech & Quant Lead">FinTech & Quant Firms</option>
              <option value="Full Stack Web Engineering">Full Stack Web Engineering</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-black hover:bg-neutral-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99] cursor-pointer"
            >
              <span>{loading ? 'Saving Profile...' : 'Save Profile & Launch Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className="w-full py-2 text-center text-xs text-gray-500 hover:text-gray-900 font-medium transition-colors"
            >
              Skip for now (I will configure in Settings later)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
