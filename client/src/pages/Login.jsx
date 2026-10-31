import React, { useState, useEffect } from 'react';
import { findUserByEmail, saveUserToRegistry } from '../utils/accountManager';
import { 
  Terminal, 
  Code2, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sparkles,
  Zap,
  CheckCircle2,
  Send,
  MailCheck,
  RefreshCw
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

export function Login({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showHandlesSection, setShowHandlesSection] = useState(false);
  const [leetcodeHandle, setLeetcodeHandle] = useState('');
  const [codeforcesHandle, setCodeforcesHandle] = useState('');
  const [githubHandle, setGithubHandle] = useState('');
  const [targetRole, setTargetRole] = useState('Software Development Engineer (SDE-1)');
  const [error, setError] = useState('');
  const [oauthLoading, setOauthLoading] = useState(false);

  // GitHub Fallback Modal (only if GitHub app not configured on server)
  const [showGhModal, setShowGhModal] = useState(false);
  const [customGhUser, setCustomGhUser] = useState('');

  // Resend Email Modal state
  const [showResendModal, setShowResendModal] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');
  const [verifyCodeInput, setVerifyCodeInput] = useState('');
  const [codeVerified, setCodeVerified] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Timer for 30s resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleResendEmail = async (e) => {
    if (e) e.preventDefault();
    const targetEmail = (resendEmail.trim() || email.trim()).toLowerCase();
    if (!targetEmail || !targetEmail.includes('@')) {
      setResendError('Please enter a valid email address');
      return;
    }

    setResendLoading(true);
    setResendError('');
    setResendMessage('');

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResendMessage(data.message || `Verification email sent to ${targetEmail}!`);
        setResendCooldown(data.cooldownSeconds || 30);
      } else {
        setResendError(data.message || 'Failed to send verification email. Try again.');
        if (data.remainingCooldown) setResendCooldown(data.remainingCooldown);
      }
    } catch (err) {
      setResendError('Could not connect to server. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    if (e) e.preventDefault();
    const targetEmail = (resendEmail.trim() || email.trim()).toLowerCase();
    if (!verifyCodeInput.trim()) {
      setResendError('Please enter the 6-digit verification code');
      return;
    }

    setVerifyLoading(true);
    setResendError('');

    try {
      const res = await fetch('/api/auth/verify-email-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          code: verifyCodeInput.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCodeVerified(true);
        setResendMessage('Email successfully verified! Signing you in...');
        setTimeout(() => {
          const user = findUserByEmail(targetEmail) || saveUserToRegistry({
            email: targetEmail,
            name: targetEmail.split('@')[0],
            provider: 'email',
            onboardingCompleted: true
          });
          setShowResendModal(false);
          onLogin(user);
        }, 1000);
      } else {
        setResendError(data.message || 'Invalid or expired code');
      }
    } catch (err) {
      setResendError('Failed to verify code. Please try again.');
    } finally {
      setVerifyLoading(false);
    }
  };

  // Handle URL errors/info
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get('oauth_error');
    const oauthInfo = params.get('oauth_info');

    if (oauthError) {
      setError(`Authentication notice: ${decodeURIComponent(oauthError)}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (oauthInfo) {
      if (oauthInfo.includes('github')) {
        setShowGhModal(true);
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Direct Google Sign In handler
  const handleGoogleClick = () => {
    setError('');
    setOauthLoading(true);
    // Directly navigate to Google OAuth endpoint
    window.location.href = '/api/auth/google';
  };

  // GitHub Sign In handler
  const handleGitHubClick = async () => {
    setError('');
    setOauthLoading(true);
    try {
      const res = await fetch('/api/auth/config');
      const data = await res.json();
      if (data?.providers?.github?.configured) {
        window.location.href = '/api/auth/github';
      } else {
        setShowGhModal(true);
      }
    } catch (e) {
      setShowGhModal(true);
    } finally {
      setOauthLoading(false);
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide a valid email address');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = findUserByEmail(cleanEmail);

    const unifiedUser = saveUserToRegistry({
      ...existing,
      name: name.trim() || existing?.name || cleanEmail.split('@')[0],
      email: cleanEmail,
      targetRole: targetRole || existing?.targetRole || 'Software Development Engineer (SDE-1)',
      provider: 'email',
      avatarUrl: existing?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || cleanEmail.split('@')[0])}&background=111&color=fff`,
      handles: {
        leetcode: leetcodeHandle.trim() || existing?.handles?.leetcode || '',
        codeforces: codeforcesHandle.trim() || existing?.handles?.codeforces || '',
        github: githubHandle.trim() || existing?.handles?.github || ''
      },
      onboardingCompleted: true
    });

    try {
      fetch('/api/auth/register-or-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: unifiedUser.email,
          name: unifiedUser.name,
          handles: unifiedUser.handles,
          targetRole: unifiedUser.targetRole,
          provider: 'email'
        })
      }).catch(() => {});
    } catch (e) {
      // offline fallback
    }

    onLogin(unifiedUser);
  };

  const handleInstantGhSubmit = async (e) => {
    e.preventDefault();
    setOauthLoading(true);
    setError('');

    try {
      const ghUser = customGhUser.trim() || 'torvalds';
      let studentUser = {
        id: `gh_${Date.now()}`,
        name: ghUser,
        email: `${ghUser}@users.noreply.github.com`,
        targetRole: 'Software Development Engineer (SDE-1)',
        provider: 'github',
        avatarUrl: `https://github.com/${encodeURIComponent(ghUser)}.png`,
        handles: {
          leetcode: '',
          codeforces: '',
          github: ghUser
        },
        loggedInAt: new Date().toISOString()
      };

      try {
        const ghRes = await fetch(`https://api.github.com/users/${encodeURIComponent(ghUser)}`);
        if (ghRes.ok) {
          const ghData = await ghRes.json();
          studentUser.name = ghData.name || ghData.login;
          studentUser.email = ghData.email || `${ghData.login}@users.noreply.github.com`;
          studentUser.avatarUrl = ghData.avatar_url;
        }
      } catch (e) {
        // use fallback
      }

      setShowGhModal(false);
      onLogin(studentUser);
    } catch (err) {
      setError(err.message);
    } finally {
      setOauthLoading(false);
    }
  };

  const handleDemoPreset = (preset) => {
    if (preset === 'fresh') {
      onLogin({
        name: 'Alex Rivera',
        email: 'alex.rivera@cs.edu',
        targetRole: 'Software Engineer',
        handles: { leetcode: '', codeforces: '', github: '' },
        loggedInAt: new Date().toISOString()
      });
    } else if (preset === 'neal') {
      onLogin({
        name: 'Neal Wu',
        email: 'neal@tech.io',
        targetRole: 'Senior SDE / Tech Lead',
        handles: { leetcode: 'neal_wu', codeforces: 'Petr', github: 'gaearon' },
        loggedInAt: new Date().toISOString()
      });
    } else {
      onLogin({
        name: 'Gennady Korotkevich',
        email: 'tourist@itmo.ru',
        targetRole: 'Algorithms & Quant Lead',
        handles: { leetcode: 'tourist', codeforces: 'tourist', github: 'torvalds' },
        loggedInAt: new Date().toISOString()
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#111827] flex flex-col items-center justify-center p-4 selection:bg-black selection:text-white font-sans antialiased">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-[420px] bg-white rounded-2xl border border-gray-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-7 sm:p-8 relative z-10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-black text-white shadow-sm mb-1">
            <Terminal className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Welcome to Prep<span className="text-blue-600">Stack</span>
          </h1>
          <p className="text-xs text-gray-500 font-normal">
            Placement readiness & developer portfolio dashboard
          </p>
        </div>

        {/* Social Authentication */}
        <div className="space-y-2.5">
          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={oauthLoading}
            className="w-full h-11 rounded-xl bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50/80 text-gray-800 text-sm font-semibold flex items-center justify-center gap-3 transition-all duration-150 shadow-xs active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            <GoogleIcon className="w-4 h-4 flex-shrink-0" />
            <span>Continue with Google</span>
          </button>

          {/* GitHub Button */}
          <button
            type="button"
            onClick={handleGitHubClick}
            disabled={oauthLoading}
            className="w-full h-11 rounded-xl bg-[#18181b] hover:bg-black text-white text-sm font-semibold flex items-center justify-center gap-3 transition-all duration-150 shadow-xs active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            <GitHubIcon className="w-4 h-4 flex-shrink-0 text-white" />
            <span>Continue with GitHub</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-gray-200" />
          <span className="absolute bg-white px-3 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
            or continue with email
          </span>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-gray-100/80 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(false);
              setError('');
            }}
            className={`py-1.5 rounded-lg transition-all ${
              !isRegistering
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegistering(true);
              setError('');
            }}
            className={`py-1.5 rounded-lg transition-all ${
              isRegistering
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3.5 text-xs">
          {isRegistering && (
            <div>
              <label className="block text-gray-700 font-medium mb-1 text-[11px]">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Abhideep Jain"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-xs focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-medium mb-1 text-[11px]">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-xs focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-gray-700 font-medium text-[11px]">
                Password
              </label>
              {!isRegistering && (
                <button
                  type="button"
                  onClick={() => {
                    setResendEmail(email || '');
                    setResendError('');
                    setResendMessage('');
                    setShowResendModal(true);
                  }}
                  className="text-[11px] text-gray-400 hover:text-black transition-colors cursor-pointer"
                >
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-xs focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
              />
            </div>
          </div>

          {/* Optional Handles Toggle for Registration */}
          {isRegistering && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowHandlesSection(!showHandlesSection)}
                className="flex items-center justify-between w-full py-1 text-[11px] text-gray-600 hover:text-gray-900 font-medium"
              >
                <span className="flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-blue-600" />
                  Connect LeetCode / Codeforces handles (Optional)
                </span>
                {showHandlesSection ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
              </button>

              {showHandlesSection && (
                <div className="mt-2 p-3 rounded-xl bg-gray-50 border border-gray-200/80 space-y-2.5">
                  <div>
                    <label className="block text-gray-600 font-medium text-[10px] mb-0.5">LeetCode Username</label>
                    <input
                      type="text"
                      value={leetcodeHandle}
                      onChange={(e) => setLeetcodeHandle(e.target.value)}
                      placeholder="e.g. neal_wu"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-900 text-xs font-mono focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium text-[10px] mb-0.5">Codeforces Handle</label>
                    <input
                      type="text"
                      value={codeforcesHandle}
                      onChange={(e) => setCodeforcesHandle(e.target.value)}
                      placeholder="e.g. tourist"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-900 text-xs font-mono focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium text-[10px] mb-0.5">GitHub Username</label>
                    <input
                      type="text"
                      value={githubHandle}
                      onChange={(e) => setGithubHandle(e.target.value)}
                      placeholder="e.g. torvalds"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-900 text-xs font-mono focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full h-11 mt-2 rounded-xl bg-black hover:bg-neutral-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-150 shadow-xs active:scale-[0.99] cursor-pointer"
          >
            <span>{isRegistering ? 'Create Profile & Continue' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Resend Verification Email Trigger */}
          <div className="flex items-center justify-center pt-1 text-[11px] text-gray-500">
            <span>Didn't receive verification email?</span>
            <button
              type="button"
              onClick={() => {
                setResendEmail(email || '');
                setResendError('');
                setResendMessage('');
                setShowResendModal(true);
              }}
              className="ml-1 text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
            >
              Resend email
            </button>
          </div>
        </form>
      </div>

      {/* Subtle Demo Presets */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500 z-10">
        <span>Quick demo accounts:</span>
        <button
          type="button"
          onClick={() => handleDemoPreset('fresh')}
          className="px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white text-gray-700 border border-gray-200/80 shadow-2xs hover:border-gray-300 font-medium transition-all"
        >
          Fresh Student
        </button>
        <button
          type="button"
          onClick={() => handleDemoPreset('neal')}
          className="px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white text-gray-700 border border-gray-200/80 shadow-2xs hover:border-gray-300 font-medium transition-all"
        >
          Neal Wu (LC #2)
        </button>
        <button
          type="button"
          onClick={() => handleDemoPreset('tourist')}
          className="px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white text-gray-700 border border-gray-200/80 shadow-2xs hover:border-gray-300 font-medium transition-all"
        >
          Tourist (CF 3300+)
        </button>
      </div>

      {/* Resend Verification Email Modal */}
      {showResendModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-gray-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <MailCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Resend Verification Email</h3>
                  <p className="text-[10px] text-gray-500">Account confirmation & login code</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowResendModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resendMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{resendMessage}</span>
              </div>
            )}

            {resendError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{resendError}</span>
              </div>
            )}

            <form onSubmit={handleResendEmail} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Student Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-black focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={resendLoading || resendCooldown > 0}
                className="w-full h-10 rounded-xl bg-black hover:bg-neutral-800 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {resendLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending email...</span>
                  </>
                ) : resendCooldown > 0 ? (
                  <span>Resend email in {resendCooldown}s</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Verification Email</span>
                  </>
                )}
              </button>
            </form>

            {/* Verification code input if sent */}
            {resendMessage && (
              <form onSubmit={handleVerifyCode} className="pt-3 border-t border-gray-100 space-y-2.5 text-xs">
                <label className="block text-[11px] font-medium text-gray-700">
                  Enter 6-digit Code from Email
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={verifyCodeInput}
                    onChange={(e) => setVerifyCodeInput(e.target.value)}
                    placeholder="e.g. 583921"
                    className="flex-1 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono tracking-widest text-center text-gray-900 focus:outline-none focus:border-black focus:bg-white"
                  />
                  <button
                    type="submit"
                    disabled={verifyLoading || codeVerified}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-xs disabled:opacity-50"
                  >
                    {verifyLoading ? 'Checking...' : codeVerified ? 'Verified!' : 'Verify & Enter'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* GitHub Fallback Modal (Clean & Minimal) */}
      {showGhModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-gray-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <GitHubIcon className="w-5 h-5 text-gray-900" />
                <h3 className="text-sm font-semibold text-gray-900">Connect GitHub Profile</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGhModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Enter your public GitHub handle to instantly sync your avatar, repositories, and developer activity.
            </p>

            <form onSubmit={handleInstantGhSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  GitHub Username
                </label>
                <input
                  type="text"
                  value={customGhUser}
                  onChange={(e) => setCustomGhUser(e.target.value)}
                  placeholder="e.g. torvalds or your_username"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono text-gray-900 focus:outline-none focus:border-black focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGhModal(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={oauthLoading}
                  className="px-4 py-1.5 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-medium shadow-xs"
                >
                  {oauthLoading ? 'Loading...' : 'Connect Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
