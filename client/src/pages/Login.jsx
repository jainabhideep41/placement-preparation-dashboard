import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Code2, 
  GitBranch, 
  Sparkles, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Trophy,
  ShieldCheck,
  Globe,
  X,
  ExternalLink,
  KeyRound,
  Zap,
  Info
} from 'lucide-react';
import { Badge } from '../components/common/Badge';

function GoogleIcon({ className = "w-4 h-4" }) {
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

function GitHubIcon({ className = "w-4 h-4" }) {
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

export function Login({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [leetcodeHandle, setLeetcodeHandle] = useState('');
  const [codeforcesHandle, setCodeforcesHandle] = useState('');
  const [githubHandle, setGithubHandle] = useState('');
  const [targetRole, setTargetRole] = useState('Software Development Engineer (SDE-1)');
  const [error, setError] = useState('');
  
  // OAuth modal state
  const [showOAuthModal, setShowOAuthModal] = useState(false);
  const [oauthProvider, setOauthProvider] = useState('github'); // 'github' | 'google'
  const [oauthLoading, setOauthLoading] = useState(false);
  const [customGhUser, setCustomGhUser] = useState('');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [activeModalTab, setActiveModalTab] = useState('instant'); // 'instant' | 'setup'

  // Detect OAuth error or info from URL search params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get('oauth_error');
    const oauthInfo = params.get('oauth_info');

    if (oauthError) {
      setError(`OAuth Error: ${decodeURIComponent(oauthError)}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (oauthInfo) {
      if (oauthInfo.includes('github')) {
        setOauthProvider('github');
        setShowOAuthModal(true);
      } else if (oauthInfo.includes('google')) {
        setOauthProvider('google');
        setShowOAuthModal(true);
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleOAuthClick = async (provider) => {
    setError('');
    setOauthLoading(true);

    try {
      // Check if provider has live credentials configured on server
      const res = await fetch('/api/auth/config');
      const data = await res.json();

      if (data?.providers?.[provider]?.configured) {
        // Live OAuth credentials exist -> redirect to live OAuth provider
        window.location.href = `/api/auth/${provider}`;
      } else {
        // No live keys in .env -> open clean instant OAuth demo modal
        setOauthProvider(provider);
        setShowOAuthModal(true);
      }
    } catch (e) {
      // Fallback to interactive modal
      setOauthProvider(provider);
      setShowOAuthModal(true);
    } finally {
      setOauthLoading(false);
    }
  };

  const handleInstantOAuthSubmit = async (e) => {
    e.preventDefault();
    setOauthLoading(true);
    setError('');

    try {
      const payload = {
        provider: oauthProvider,
        username: oauthProvider === 'github' ? (customGhUser.trim() || 'torvalds') : undefined,
        email: oauthProvider === 'google' ? (customGoogleEmail.trim() || 'student@gmail.com') : undefined,
        name: oauthProvider === 'google' ? (customGoogleName.trim() || 'Google Student') : undefined
      };

      const res = await fetch('/api/auth/instant-oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success && data.user) {
        setShowOAuthModal(false);
        onLogin(data.user);
      } else {
        setError(data.message || 'Failed to authenticate via OAuth');
      }
    } catch (err) {
      setError(`Authentication failed: ${err.message}`);
    } finally {
      setOauthLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email or student roll number');
      return;
    }

    const studentUser = {
      name: name.trim() || email.split('@')[0] || 'Student',
      email: email.trim(),
      targetRole,
      handles: {
        leetcode: leetcodeHandle.trim(),
        codeforces: codeforcesHandle.trim(),
        github: githubHandle.trim()
      },
      loggedInAt: new Date().toISOString()
    };

    onLogin(studentUser);
  };

  const handleQuickDemo = (type) => {
    if (type === 'grandmaster') {
      onLogin({
        name: 'Gennady (Tourist)',
        email: 'tourist@itmo.ru',
        targetRole: 'Competitive Programmer & Systems Architect',
        handles: {
          leetcode: 'tourist',
          codeforces: 'tourist',
          github: 'torvalds'
        },
        loggedInAt: new Date().toISOString()
      });
    } else if (type === 'fresh') {
      onLogin({
        name: 'New Student',
        email: 'student@college.edu',
        targetRole: 'SDE Placement Aspirant',
        handles: {
          leetcode: '',
          codeforces: '',
          github: ''
        },
        loggedInAt: new Date().toISOString()
      });
    } else {
      onLogin({
        name: 'Neal Wu',
        email: 'neal@tech.io',
        targetRole: 'Tier 1 Tech Lead',
        handles: {
          leetcode: 'neal_wu',
          codeforces: 'Petr',
          github: 'gaearon'
        },
        loggedInAt: new Date().toISOString()
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#EAEAEA] text-black flex flex-col items-center justify-center p-4 selection:bg-black selection:text-white relative">
      {/* Neo-brutalist Main Container */}
      <div className="w-full max-w-xl rounded-3xl bg-white border-2 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 sm:p-8 relative z-10 space-y-6">
        {/* Branding header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-black text-white shadow-[3px_3px_0px_rgba(0,0,0,0.3)] mb-1">
            <Terminal className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-black">
              PREP<span className="text-blue-600">STACK</span>
            </h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-black text-white font-bold">
              Topic 7
            </span>
          </div>
          <p className="text-xs text-black/60 font-medium">
            Unified Placement Readiness & Developer Portfolio Engine
          </p>
        </div>

        {/* SOCIAL OAUTH SIGN IN BUTTONS */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Google Sign In */}
            <button
              type="button"
              onClick={() => handleOAuthClick('google')}
              disabled={oauthLoading}
              className="w-full py-2.5 px-4 rounded-2xl bg-white border-2 border-black font-display font-bold text-xs flex items-center justify-center gap-2.5 shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] active:translate-y-[1px] transition-all disabled:opacity-50"
            >
              <GoogleIcon className="w-4 h-4 flex-shrink-0" />
              <span>Continue with Google</span>
            </button>

            {/* GitHub Sign In */}
            <button
              type="button"
              onClick={() => handleOAuthClick('github')}
              disabled={oauthLoading}
              className="w-full py-2.5 px-4 rounded-2xl bg-[#1e2327] text-white border-2 border-black font-display font-bold text-xs flex items-center justify-center gap-2.5 shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-black hover:translate-y-[-1px] active:translate-y-[1px] transition-all disabled:opacity-50"
            >
              <GitHubIcon className="w-4 h-4 flex-shrink-0 text-white" />
              <span>Continue with GitHub</span>
            </button>
          </div>

          <div className="flex items-center gap-3 py-0.5">
            <div className="h-px bg-black/15 flex-1" />
            <span className="text-[10px] font-mono text-black/40 uppercase tracking-widest font-bold">
              or continue with student email
            </span>
            <div className="h-px bg-black/15 flex-1" />
          </div>
        </div>

        {/* Tab switcher: Setup Profile vs Sign In */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#F4F4F0] border border-black/10 text-xs font-mono">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(true);
              setError('');
            }}
            className={`py-2 rounded-xl font-bold transition-all ${
              isRegistering
                ? 'bg-black text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                : 'text-black/60 hover:text-black'
            }`}
          >
            Create Student Profile
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegistering(false);
              setError('');
            }}
            className={`py-2 rounded-xl font-bold transition-all ${
              !isRegistering
                ? 'bg-black text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                : 'text-black/60 hover:text-black'
            }`}
          >
            Student Sign In
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border-2 border-rose-500 text-xs text-rose-700 flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegistering && (
            <div>
              <label className="block text-black/70 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                Your Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-black/40" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Abhideep"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F4F4F0] border border-black/15 text-black placeholder-black/40 focus:outline-none focus:border-black focus:bg-white transition-all font-medium"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-black/70 font-semibold mb-1 uppercase tracking-wider text-[11px]">
              Student Email or College Roll Number *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-black/40" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu or 22CS014"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F4F4F0] border border-black/15 text-black placeholder-black/40 focus:outline-none focus:border-black focus:bg-white transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-black/70 font-semibold mb-1 uppercase tracking-wider text-[11px]">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-black/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F4F4F0] border border-black/15 text-black placeholder-black/40 focus:outline-none focus:border-black focus:bg-white transition-all"
              />
            </div>
          </div>

          {isRegistering && (
            <>
              {/* Prominent Platform Handles Connection Section */}
              <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-3">
                <div className="flex items-center justify-between border-b border-black/10 pb-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-black flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-blue-600" />
                    Connect Coding Profiles (Live Sync)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                    Auto-Fetch Solves
                  </span>
                </div>
                
                <p className="text-[11px] text-black/60 leading-relaxed">
                  Enter your public handles below. Our backend adapters query public GraphQL & REST APIs to automatically fetch your real problems solved and contest ratings. <em>(No passwords needed, leave blank if not created yet)</em>.
                </p>

                <div className="space-y-3 pt-1">
                  {/* LeetCode Input Tile */}
                  <div className="p-2.5 rounded-xl bg-white border border-black/10 flex flex-col sm:flex-row sm:items-center gap-2 hover:border-black/30 transition-all">
                    <div className="flex items-center gap-2 sm:w-36 flex-shrink-0">
                      <span className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="font-semibold text-xs text-black">LeetCode</span>
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={leetcodeHandle}
                        onChange={(e) => setLeetcodeHandle(e.target.value)}
                        placeholder="e.g. neal_wu or your_username"
                        className="w-full px-3 py-1.5 rounded-lg bg-[#F4F4F0] border border-black/10 text-black font-mono text-xs focus:outline-none focus:border-black focus:bg-white"
                      />
                    </div>
                    {leetcodeHandle.trim() && (
                      <span className="text-[10px] font-mono font-bold text-emerald-600 flex items-center gap-1 self-end sm:self-auto">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    )}
                  </div>

                  {/* Codeforces Input Tile */}
                  <div className="p-2.5 rounded-xl bg-white border border-black/10 flex flex-col sm:flex-row sm:items-center gap-2 hover:border-black/30 transition-all">
                    <div className="flex items-center gap-2 sm:w-36 flex-shrink-0">
                      <span className="w-3 h-3 rounded-full bg-blue-600" />
                      <span className="font-semibold text-xs text-black">Codeforces</span>
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={codeforcesHandle}
                        onChange={(e) => setCodeforcesHandle(e.target.value)}
                        placeholder="e.g. tourist or your_handle"
                        className="w-full px-3 py-1.5 rounded-lg bg-[#F4F4F0] border border-black/10 text-black font-mono text-xs focus:outline-none focus:border-black focus:bg-white"
                      />
                    </div>
                    {codeforcesHandle.trim() && (
                      <span className="text-[10px] font-mono font-bold text-emerald-600 flex items-center gap-1 self-end sm:self-auto">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    )}
                  </div>

                  {/* GitHub Input Tile */}
                  <div className="p-2.5 rounded-xl bg-white border border-black/10 flex flex-col sm:flex-row sm:items-center gap-2 hover:border-black/30 transition-all">
                    <div className="flex items-center gap-2 sm:w-36 flex-shrink-0">
                      <span className="w-3 h-3 rounded-full bg-black" />
                      <span className="font-semibold text-xs text-black">GitHub</span>
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={githubHandle}
                        onChange={(e) => setGithubHandle(e.target.value)}
                        placeholder="e.g. torvalds or your_username"
                        className="w-full px-3 py-1.5 rounded-lg bg-[#F4F4F0] border border-black/10 text-black font-mono text-xs focus:outline-none focus:border-black focus:bg-white"
                      />
                    </div>
                    {githubHandle.trim() && (
                      <span className="text-[10px] font-mono font-bold text-emerald-600 flex items-center gap-1 self-end sm:self-auto">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-black/70 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                  Target Placement Goal
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F4F4F0] border border-black/15 text-black font-medium focus:outline-none focus:border-black"
                >
                  <option value="Tier 1 Product Companies (FAANG / Big Tech)">
                    Tier 1 Product Companies (FAANG / Big Tech)
                  </option>
                  <option value="High-Growth Tech Startups">High-Growth Tech Startups</option>
                  <option value="FinTech & Quant Firms">FinTech & Quant Firms</option>
                  <option value="Full Stack Web Engineering">Full Stack Web Engineering</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-black hover:bg-neutral-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] active:translate-y-[1px] transition-all"
          >
            <span>{isRegistering ? 'Save Profile & Launch Dashboard' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick evaluation / viva presets for professor/evaluators */}
        <div className="pt-4 border-t border-black/10 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-black/60">
            <span className="font-semibold">Quick Viva / Examiner Access:</span>
            <span>1-Click Load</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
            <button
              type="button"
              onClick={() => handleQuickDemo('fresh')}
              className="p-2.5 rounded-xl bg-white border-2 border-black/20 hover:border-black text-black shadow-[2px_2px_0px_rgba(0,0,0,0.2)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
            >
              <span className="block font-bold text-black">Fresh Student</span>
              <span className="text-black/50">0 Solves (Clean)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('neal')}
              className="p-2.5 rounded-xl bg-white border-2 border-black/20 hover:border-black text-black shadow-[2px_2px_0px_rgba(0,0,0,0.2)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
            >
              <span className="block font-bold text-blue-600">Neal Wu</span>
              <span className="text-black/50">LC #2 (253 Solves)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('grandmaster')}
              className="p-2.5 rounded-xl bg-white border-2 border-black/20 hover:border-black text-black shadow-[2px_2px_0px_rgba(0,0,0,0.2)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
            >
              <span className="block font-bold text-amber-600">Tourist</span>
              <span className="text-black/50">CF 3300+ / Torvalds</span>
            </button>
          </div>
        </div>
      </div>

      {/* INTERACTIVE OAUTH MODAL (Instant sign-in + live setup guide) */}
      {showOAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white border-2 border-black p-6 sm:p-7 shadow-[8px_8px_0px_rgba(0,0,0,1)] space-y-5 text-black">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <div className="flex items-center gap-2.5">
                {oauthProvider === 'github' ? (
                  <div className="p-2 rounded-xl bg-black text-white">
                    <GitHubIcon className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-white border border-black/20 shadow-xs">
                    <GoogleIcon className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold font-display text-black">
                    {oauthProvider === 'github' ? 'GitHub Authentication' : 'Google Authentication'}
                  </h3>
                  <p className="text-[11px] text-black/50 font-mono">
                    Single Sign-On & Profile Ingestion
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOAuthModal(false)}
                className="p-1 rounded-lg text-black/40 hover:text-black hover:bg-black/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Subtabs */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#F4F4F0] border border-black/10 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveModalTab('instant')}
                className={`py-1.5 rounded-lg font-bold transition-all ${
                  activeModalTab === 'instant'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-black/60 hover:text-black'
                }`}
              >
                Instant Sign In (Viva Mode)
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('setup')}
                className={`py-1.5 rounded-lg font-bold transition-all ${
                  activeModalTab === 'setup'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-black/60 hover:text-black'
                }`}
              >
                Live OAuth Keys Setup
              </button>
            </div>

            {activeModalTab === 'instant' && (
              <form onSubmit={handleInstantOAuthSubmit} className="space-y-4 text-xs">
                {oauthProvider === 'github' ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl bg-[#F9F9F7] border border-black/10 space-y-1">
                      <span className="font-bold text-black flex items-center gap-1.5 font-display text-xs">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        Live Profile Auto-Detection
                      </span>
                      <p className="text-[11px] text-black/60 leading-relaxed">
                        Enter your actual GitHub username below. We query GitHub's public API to automatically fetch your real avatar, name, bio, and repositories!
                      </p>
                    </div>

                    <div>
                      <label className="block text-black/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                        GitHub Username *
                      </label>
                      <input
                        type="text"
                        value={customGhUser}
                        onChange={(e) => setCustomGhUser(e.target.value)}
                        placeholder="e.g. torvalds or gaearon or your username"
                        className="w-full px-3 py-2 rounded-xl bg-[#F4F4F0] border border-black/15 text-black font-mono text-xs focus:outline-none focus:border-black font-medium"
                      />
                    </div>

                    {/* Quick Demo Pickers */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[10px] font-mono text-black/40 uppercase font-bold">Quick handles:</span>
                      {['torvalds', 'gaearon', 'sindresorhus'].map((user) => (
                        <button
                          key={user}
                          type="button"
                          onClick={() => setCustomGhUser(user)}
                          className="px-2 py-0.5 rounded-lg bg-black/5 hover:bg-black/10 text-black font-mono text-[10px] font-bold border border-black/10"
                        >
                          @{user}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl bg-[#F9F9F7] border border-black/10 space-y-1">
                      <span className="font-bold text-black flex items-center gap-1.5 font-display text-xs">
                        <GoogleIcon className="w-3.5 h-3.5" />
                        Google Identity Simulation
                      </span>
                      <p className="text-[11px] text-black/60 leading-relaxed">
                        Sign in instantly with a Google student identity or specify your college email address.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-black/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                          Your Name
                        </label>
                        <input
                          type="text"
                          value={customGoogleName}
                          onChange={(e) => setCustomGoogleName(e.target.value)}
                          placeholder="e.g. Aryan Sharma"
                          className="w-full px-3 py-2 rounded-xl bg-[#F4F4F0] border border-black/15 text-black text-xs focus:outline-none focus:border-black font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-black/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                          Google Email
                        </label>
                        <input
                          type="email"
                          value={customGoogleEmail}
                          onChange={(e) => setCustomGoogleEmail(e.target.value)}
                          placeholder="student@college.edu"
                          className="w-full px-3 py-2 rounded-xl bg-[#F4F4F0] border border-black/15 text-black font-mono text-xs focus:outline-none focus:border-black font-medium"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[10px] font-mono text-black/40 uppercase font-bold">Presets:</span>
                      {[
                        { name: 'Aditya Verma', email: 'aditya.placement@gmail.com' },
                        { name: 'Priya Patel', email: 'priya.cs2026@college.edu' }
                      ].map((preset, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setCustomGoogleName(preset.name);
                            setCustomGoogleEmail(preset.email);
                          }}
                          className="px-2 py-0.5 rounded-lg bg-black/5 hover:bg-black/10 text-black font-mono text-[10px] font-bold border border-black/10"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/10">
                  <button
                    type="button"
                    onClick={() => setShowOAuthModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-black/60 hover:text-black"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={oauthLoading}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {oauthLoading ? 'Authenticating...' : `Sign in with ${oauthProvider === 'github' ? 'GitHub' : 'Google'}`}
                  </button>
                </div>
              </form>
            )}

            {activeModalTab === 'setup' && (
              <div className="space-y-3 text-xs leading-relaxed">
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 space-y-1">
                  <span className="font-bold flex items-center gap-1.5 font-display text-xs text-blue-900">
                    <KeyRound className="w-3.5 h-3.5 text-blue-700" />
                    How to enable Live Production OAuth 2.0
                  </span>
                  <p className="text-[11px] text-blue-900/80">
                    To make the buttons trigger official Google / GitHub consent screens on localhost, add credentials to <code className="bg-white px-1 py-0.5 rounded border border-blue-200 text-black font-mono">server/.env</code>:
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#F4F4F0] border border-black/15 font-mono text-[11px] space-y-2">
                  <span className="font-bold text-black block">For GitHub OAuth App:</span>
                  <p className="text-black/70">
                    1. Go to <strong>GitHub &rarr; Settings &rarr; Developer settings &rarr; OAuth Apps</strong><br />
                    2. Callback URL: <code className="text-blue-700 bg-white px-1 rounded">http://localhost:5000/api/auth/github/callback</code><br />
                    3. Set <code className="text-black font-bold">GITHUB_CLIENT_ID</code> and <code className="text-black font-bold">GITHUB_CLIENT_SECRET</code> in <code className="text-black font-bold">server/.env</code>.
                  </p>

                  <div className="h-px bg-black/10 my-1" />

                  <span className="font-bold text-black block">For Google OAuth 2.0:</span>
                  <p className="text-black/70">
                    1. Go to <strong>Google Cloud Console &rarr; Credentials &rarr; OAuth 2.0 Client ID</strong><br />
                    2. Authorized redirect URI: <code className="text-blue-700 bg-white px-1 rounded">http://localhost:5000/api/auth/google/callback</code><br />
                    3. Set <code className="text-black font-bold">GOOGLE_CLIENT_ID</code> and <code className="text-black font-bold">GOOGLE_CLIENT_SECRET</code> in <code className="text-black font-bold">server/.env</code>.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalTab('instant')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white shadow-xs"
                  >
                    Got it, back to Instant Sign In
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
