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
  ExternalLink,
  Share2,
  Copy,
  UserCheck,
  GraduationCap,
  Building2,
  Calendar,
  Briefcase,
  Phone,
  Mail,
  Eye,
  EyeOff,
  Shield
} from 'lucide-react';
import { useLocalCache } from '../hooks/useLocalCache';
import { Badge } from '../components/common/Badge';
import { saveUserToRegistry } from '../utils/accountManager';

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
  const [profileCopied, setProfileCopied] = useState(false);

  // Candidate Academic Profile & Target Role States
  const [usernameInput, setUsernameInput] = useState(
    currentUser?.username || currentUser?.email?.split('@')[0]?.replace(/[^a-z0-9_-]/gi, '') || ''
  );
  const [nameInput, setNameInput] = useState(currentUser?.name || '');
  const [targetRoleInput, setTargetRoleInput] = useState(
    currentUser?.targetRole || 'Software Development Engineer (SDE-1 — FAANG & Tier-1)'
  );
  const [collegeInput, setCollegeInput] = useState(currentUser?.academic?.college || 'Chandigarh University');
  const [degreeInput, setDegreeInput] = useState(currentUser?.academic?.degree || 'B.Tech Computer Science & Engineering');
  const [yearInput, setYearInput] = useState(currentUser?.academic?.year || '2026 (Final Year)');
  const [cgpaInput, setCgpaInput] = useState(currentUser?.academic?.cgpa || '8.85 / 10');
  const [dreamCompaniesInput, setDreamCompaniesInput] = useState(currentUser?.academic?.dreamCompanies || 'Google, Microsoft, Uber, Atlassian');
  const [workModeInput, setWorkModeInput] = useState(currentUser?.academic?.workMode || 'Hybrid / Remote / On-site');

  // Contact Information & Privacy Visibility States
  const [phoneInput, setPhoneInput] = useState(
    currentUser?.phone || currentUser?.academic?.phone || ''
  );
  const [emailInput, setEmailInput] = useState(
    currentUser?.email || ''
  );
  const [showEmailPublicly, setShowEmailPublicly] = useState(
    currentUser?.privacy?.showEmail !== undefined ? Boolean(currentUser.privacy.showEmail) : true
  );
  const [showPhonePublicly, setShowPhonePublicly] = useState(
    currentUser?.privacy?.showPhone !== undefined ? Boolean(currentUser.privacy.showPhone) : false
  );

  const [academicSavedSuccess, setAcademicSavedSuccess] = useState(false);
  const [academicError, setAcademicError] = useState('');

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

  React.useEffect(() => {
    if (currentUser?.username) {
      setUsernameInput(currentUser.username);
    } else if (currentUser?.email) {
      setUsernameInput(currentUser.email.split('@')[0].replace(/[^a-z0-9_-]/gi, '').toLowerCase());
    }
    if (currentUser?.name) setNameInput(currentUser.name);
    if (currentUser?.email) setEmailInput(currentUser.email);
    if (currentUser?.phone !== undefined) {
      setPhoneInput(currentUser.phone);
    } else if (currentUser?.academic?.phone) {
      setPhoneInput(currentUser.academic.phone);
    }
    if (currentUser?.privacy?.showEmail !== undefined) {
      setShowEmailPublicly(Boolean(currentUser.privacy.showEmail));
    }
    if (currentUser?.privacy?.showPhone !== undefined) {
      setShowPhonePublicly(Boolean(currentUser.privacy.showPhone));
    }
    if (currentUser?.targetRole) setTargetRoleInput(currentUser.targetRole);
    if (currentUser?.academic) {
      if (currentUser.academic.college) setCollegeInput(currentUser.academic.college);
      if (currentUser.academic.degree) setDegreeInput(currentUser.academic.degree);
      if (currentUser.academic.year) setYearInput(currentUser.academic.year);
      if (currentUser.academic.cgpa) setCgpaInput(currentUser.academic.cgpa);
      if (currentUser.academic.dreamCompanies) setDreamCompaniesInput(currentUser.academic.dreamCompanies);
      if (currentUser.academic.workMode) setWorkModeInput(currentUser.academic.workMode);
    }
  }, [currentUser]);

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

  const handleSaveAcademicProfile = async (e) => {
    if (e) e.preventDefault();
    setAcademicError('');
    setAcademicSavedSuccess(false);

    const cleanUsername = usernameInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanUsername) {
      setAcademicError('Username cannot be empty and must be alphanumeric.');
      return;
    }

    const updatedPrivacy = {
      showEmail: Boolean(showEmailPublicly),
      showPhone: Boolean(showPhonePublicly)
    };

    const updatedAcademic = {
      college: collegeInput.trim(),
      degree: degreeInput.trim(),
      year: yearInput.trim(),
      cgpa: cgpaInput.trim(),
      desiredOption: targetRoleInput,
      dreamCompanies: dreamCompaniesInput.trim(),
      workMode: workModeInput,
      phone: phoneInput.trim()
    };

    // 1. Save locally in registry & prep_auth_user
    if (currentUser?.email) {
      const currentHandles = {
        codeforces: cfInput.trim() || handles.codeforces || currentUser.handles?.codeforces || '',
        leetcode: lcInput.trim() || handles.leetcode || currentUser.handles?.leetcode || '',
        github: ghInput.trim() || handles.github || currentUser.handles?.github || ''
      };

      saveUserToRegistry({
        ...currentUser,
        email: emailInput.trim() || currentUser.email,
        phone: phoneInput.trim(),
        privacy: updatedPrivacy,
        username: cleanUsername,
        name: nameInput.trim() || currentUser.name,
        targetRole: targetRoleInput,
        handles: currentHandles,
        academic: updatedAcademic
      }, true);

      // 2. Sync to backend API
      try {
        const res = await fetch('/api/auth/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: currentUser.email,
            phone: phoneInput.trim(),
            privacy: updatedPrivacy,
            username: cleanUsername,
            name: nameInput.trim() || currentUser.name,
            targetRole: targetRoleInput,
            handles: currentHandles,
            academic: updatedAcademic
          })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to update profile on server');
        }
      } catch (err) {
        console.warn('Backend sync fallback:', err.message);
      }
    }

    setAcademicSavedSuccess(true);
    setTimeout(() => setAcademicSavedSuccess(false), 3500);
    if (onRefreshAll) onRefreshAll();
  };

  const handleSaveHandles = async (e) => {
    if (e) e.preventDefault();
    setSyncing(true);
    const newHandles = {
      codeforces: cfInput.trim(),
      leetcode: lcInput.trim(),
      github: ghInput.trim()
    };
    setHandles(newHandles);

    if (currentUser?.email) {
      const updatedUser = {
        ...currentUser,
        handles: newHandles
      };
      saveUserToRegistry(updatedUser, true);

      try {
        await Promise.all([
          fetch('/api/auth/complete-onboarding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: currentUser.email,
              handles: newHandles,
              targetRole: currentUser.targetRole
            })
          }),
          fetch('/api/auth/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: currentUser.email,
              username: currentUser.username || usernameInput,
              name: currentUser.name || nameInput,
              targetRole: currentUser.targetRole || targetRoleInput,
              handles: newHandles,
              academic: currentUser.academic
            })
          })
        ]);
      } catch (err) {
        console.warn('Backend handle sync warning:', err);
      }
    }

    setSavedSuccess(true);
    if (onRefreshAll) await onRefreshAll();
    setSyncing(false);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const applyPreset = async (cf, lc, gh) => {
    setCfInput(cf);
    setLcInput(lc);
    setGhInput(gh);
    const presetHandles = { codeforces: cf, leetcode: lc, github: gh };
    setHandles(presetHandles);

    if (currentUser?.email) {
      const updatedUser = {
        ...currentUser,
        handles: presetHandles
      };
      saveUserToRegistry(updatedUser, true);

      try {
        await Promise.all([
          fetch('/api/auth/complete-onboarding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: currentUser.email,
              handles: presetHandles,
              targetRole: currentUser.targetRole
            })
          }),
          fetch('/api/auth/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: currentUser.email,
              username: currentUser.username || usernameInput,
              name: currentUser.name || nameInput,
              targetRole: currentUser.targetRole || targetRoleInput,
              handles: presetHandles,
              academic: currentUser.academic
            })
          })
        ]);
      } catch (err) {}
    }

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

      {/* Public Developer Profile Link Card */}
      {(() => {
        const activeProfileHandle = (usernameInput || currentUser?.username || currentUser?.email?.split('@')[0] || 'me')
          .replace(/[^a-z0-9_-]/gi, '')
          .toLowerCase();
        const activeProfileUrl = typeof window !== 'undefined'
          ? `${window.location.origin}/u/${encodeURIComponent(activeProfileHandle)}`
          : `/u/${activeProfileHandle}`;

        return (
          <div className="p-5 sm:p-6 rounded-3xl bg-neutral-900 text-white border-2 border-black space-y-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-base font-extrabold font-display">
                    Public Developer Profile & Recruiter Dossier
                  </h2>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                    Public Link
                  </span>
                </div>
                <p className="text-xs text-neutral-300">
                  Share your verified placement readiness index, LeetCode/Codeforces stats, and production project portfolio with recruiters. No login required for viewers!
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`/u/${encodeURIComponent(activeProfileHandle)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-black text-xs font-mono font-bold hover:bg-neutral-100 transition-colors shadow-xs"
                >
                  <span>View Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(activeProfileUrl).then(() => {
                        setProfileCopied(true);
                        setTimeout(() => setProfileCopied(false), 2500);
                      });
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs font-mono font-bold hover:bg-neutral-700 transition-colors shadow-xs"
                >
                  {profileCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{profileCopied ? 'Copied URL!' : 'Copy Public URL'}</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between font-mono text-xs text-neutral-400 overflow-x-auto">
              <span className="truncate mr-3 text-emerald-400 font-bold">
                {activeProfileUrl}
              </span>
              <span className="text-[10px] text-emerald-400 uppercase font-bold shrink-0">
                Recruiter Ready
              </span>
            </div>
          </div>
        );
      })()}

      {/* Candidate Academic Profile & Career Track Preferences */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-black space-y-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        <div className="border-b border-black/10 pb-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-black" />
            <h2 className="text-base font-extrabold text-black font-display">
              Candidate Academic Profile & Career Preferences
            </h2>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
              Verified Candidate
            </span>
          </div>
          <p className="text-xs text-black/50 mt-0.5">
            Customize your public username handle, academic credentials (CGPA, college, graduation year), and desired job track options displayed on your recruiter portfolio.
          </p>
        </div>

        {academicSavedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-xs text-emerald-900 font-bold flex items-center justify-between shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Academic profile, public username, and career preferences saved successfully!</span>
            </div>
            <span className="font-mono text-[11px] text-emerald-700">Dossier Updated</span>
          </div>
        )}

        {academicError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-400 text-xs text-rose-900 font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{academicError}</span>
          </div>
        )}

        <form onSubmit={handleSaveAcademicProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Public Username */}
            <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-1.5">
              <label className="font-bold text-black flex items-center justify-between">
                <span>Public Vanity Username</span>
                <span className="font-mono text-[10px] text-black/50 font-semibold">Shareable URL handle</span>
              </label>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-black/40 text-xs font-bold">/u/</span>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  placeholder="e.g. rahul_dev"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-black/20 text-xs font-mono font-bold text-black focus:outline-none focus:border-black"
                />
              </div>
              <p className="font-mono text-[10px] text-black/50">
                Live URL: {typeof window !== 'undefined' ? `${window.location.origin}/u/${usernameInput || 'username'}` : `/u/${usernameInput || 'username'}`}
              </p>
            </div>

            {/* Candidate Full Name */}
            <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-1.5">
              <label className="font-bold text-black">Display Name</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Candidate Full Name"
                className="w-full px-3 py-2 rounded-xl bg-white border border-black/20 text-xs font-semibold text-black focus:outline-none focus:border-black"
              />
              <p className="text-[10px] text-black/50">Full legal or professional name shown on portfolio</p>
            </div>

            {/* College Name */}
            <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-1.5">
              <label className="font-bold text-black flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-black/60" />
                <span>College / University Name</span>
              </label>
              <input
                type="text"
                value={collegeInput}
                onChange={(e) => setCollegeInput(e.target.value)}
                placeholder="e.g. Chandigarh University, IIT Delhi"
                className="w-full px-3 py-2 rounded-xl bg-white border border-black/20 text-xs font-semibold text-black focus:outline-none focus:border-black"
              />
            </div>

            {/* Degree & Branch */}
            <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-1.5">
              <label className="font-bold text-black flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-black/60" />
                <span>Degree & Major / Branch</span>
              </label>
              <input
                type="text"
                value={degreeInput}
                onChange={(e) => setDegreeInput(e.target.value)}
                placeholder="e.g. B.Tech Computer Science & Engineering"
                className="w-full px-3 py-2 rounded-xl bg-white border border-black/20 text-xs font-semibold text-black focus:outline-none focus:border-black"
              />
            </div>

            {/* Graduation Year */}
            <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-1.5">
              <label className="font-bold text-black flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-black/60" />
                <span>Graduation / Study Year</span>
              </label>
              <select
                value={yearInput}
                onChange={(e) => setYearInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-black/20 text-xs font-semibold text-black focus:outline-none focus:border-black font-mono"
              >
                <option value="2026 (Final Year)">2026 (Final Year Student)</option>
                <option value="2027 (Pre-final Year)">2027 (Pre-final Year Student)</option>
                <option value="2028 (Sophomore)">2028 (Sophomore Year)</option>
                <option value="2025 (Fresh Graduate)">2025 (Fresh Graduate)</option>
                <option value="2024 (Experienced / Alumni)">2024 (Alumni / Experienced)</option>
              </select>
            </div>

            {/* CGPA / Percentage */}
            <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-1.5">
              <label className="font-bold text-black flex items-center justify-between">
                <span>CGPA / Academic Score</span>
                <span className="font-mono text-[10px] text-emerald-700 font-bold">Academic Verified</span>
              </label>
              <input
                type="text"
                value={cgpaInput}
                onChange={(e) => setCgpaInput(e.target.value)}
                placeholder="e.g. 8.85 / 10 CGPA or 88%"
                className="w-full px-3 py-2 rounded-xl bg-white border border-black/20 text-xs font-mono font-bold text-black focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Contact Information & Privacy Visibility Controls */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10 pb-2.5">
              <div>
                <span className="font-bold text-black text-xs sm:text-sm flex items-center gap-1.5 font-display">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Contact Details &amp; Granular Privacy Controls</span>
                </span>
                <p className="text-[11px] text-black/60 mt-0.5">
                  Save your mobile number and email. Mark each section as Public (recruiter visible) or Private according to your choice.
                </p>
              </div>
              <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full font-bold bg-white text-black border border-black/20 shrink-0 self-start sm:self-auto shadow-xs">
                Candidate Privacy
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Email Address & Privacy Toggle */}
              <div className="p-3.5 rounded-xl bg-white border border-black/20 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="font-bold text-black flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-black/60" />
                    <span>Email Address</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowEmailPublicly(prev => !prev)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border transition-all cursor-pointer ${
                      showEmailPublicly
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100 shadow-xs'
                        : 'bg-neutral-100 text-neutral-700 border-neutral-300 hover:bg-neutral-200'
                    }`}
                    title={showEmailPublicly ? 'Email is currently Public. Click to make Private.' : 'Email is currently Private. Click to make Public.'}
                  >
                    {showEmailPublicly ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Public</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Private</span>
                      </>
                    )}
                  </button>
                </div>

                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g. candidate@domain.com"
                  className="w-full px-3 py-2 rounded-xl bg-[#F9F9F7] border border-black/15 text-xs font-mono font-medium text-black focus:outline-none focus:border-black"
                />

                <div className="flex items-center justify-between text-[10.5px] leading-tight">
                  <span className={showEmailPublicly ? 'text-emerald-700 font-medium' : 'text-neutral-500 font-medium'}>
                    {showEmailPublicly
                      ? '✓ Publicly visible to recruiters on your profile & default resume.'
                      : '🔒 Private — Masked from public profile to prevent spam.'}
                  </span>
                  <span className="font-mono text-[10px] text-black/40 font-semibold shrink-0 ml-1">
                    {showEmailPublicly ? 'Recruiter Ready' : 'Hidden'}
                  </span>
                </div>
              </div>

              {/* Mobile Phone & Privacy Toggle */}
              <div className="p-3.5 rounded-xl bg-white border border-black/20 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="font-bold text-black flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-black/60" />
                    <span>Mobile Phone Number</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPhonePublicly(prev => !prev)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border transition-all cursor-pointer ${
                      showPhonePublicly
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100 shadow-xs'
                        : 'bg-neutral-100 text-neutral-700 border-neutral-300 hover:bg-neutral-200'
                    }`}
                    title={showPhonePublicly ? 'Phone is currently Public. Click to make Private.' : 'Phone is currently Private. Click to make Public.'}
                  >
                    {showPhonePublicly ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Public</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Private</span>
                      </>
                    )}
                  </button>
                </div>

                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl bg-[#F9F9F7] border border-black/15 text-xs font-mono font-medium text-black focus:outline-none focus:border-black"
                />

                <div className="flex items-center justify-between text-[10.5px] leading-tight">
                  <span className={showPhonePublicly ? 'text-emerald-700 font-medium' : 'text-neutral-500 font-medium'}>
                    {showPhonePublicly
                      ? '✓ Publicly visible for phone screenings and resume downloads.'
                      : '🔒 Private — Masked from public profile. Visible only to you.'}
                  </span>
                  <span className="font-mono text-[10px] text-black/40 font-semibold shrink-0 ml-1">
                    {showPhonePublicly ? 'Screening Ready' : 'Confidential'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Desired Career Option / Track Selection */}
          <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-2">
            <label className="font-bold text-black flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-black/60" />
                <span>Desired Placement Career Option (Calibrates Readiness Engine)</span>
              </span>
              <span className="font-mono text-[10px] text-blue-700 font-bold uppercase">
                Dynamic Benchmark
              </span>
            </label>
            <select
              value={targetRoleInput}
              onChange={(e) => setTargetRoleInput(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-black/20 text-xs font-bold text-black focus:outline-none focus:border-black font-display"
            >
              <option value="Software Development Engineer (SDE-1 — FAANG & Tier-1)">
                Software Development Engineer (SDE-1 — FAANG & Tier-1 Product) [DSA: 40%, System Design: 25%]
              </option>
              <option value="Backend & Distributed Systems Engineer">
                Backend & Distributed Systems Engineer [System Design: 30%, Backend/DB: 30%, DSA: 20%]
              </option>
              <option value="Frontend & Web Performance Engineer">
                Frontend & Web Performance Engineer [Frontend Web Dev: 40%, Projects: 25%, DSA: 15%]
              </option>
              <option value="Full-Stack Software Engineer">
                Full-Stack Software Engineer [Web Dev: 35%, Projects: 25%, DSA: 20%, System Design: 10%]
              </option>
              <option value="DevOps & Site Reliability Engineer (SRE)">
                DevOps & Site Reliability Engineer (SRE) [DevOps & Cloud: 35%, System Design: 25%, Projects: 20%]
              </option>
              <option value="Data Engineer & ML Infrastructure">
                Data Engineer & ML Infrastructure [Databases/Streaming: 35%, DSA: 25%, System Design: 20%]
              </option>
            </select>
            <p className="text-[11px] text-black/60 leading-relaxed">
              Selecting this role automatically calibrates the weightages of your Placement Readiness index and displays tailored recommendations on your dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dream Target Companies */}
            <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-1.5">
              <label className="font-bold text-black">Dream Target Companies</label>
              <input
                type="text"
                value={dreamCompaniesInput}
                onChange={(e) => setDreamCompaniesInput(e.target.value)}
                placeholder="e.g. Google, Atlassian, Uber, Microsoft, Stripe"
                className="w-full px-3 py-2 rounded-xl bg-white border border-black/20 text-xs font-semibold text-black focus:outline-none focus:border-black"
              />
            </div>

            {/* Work Mode */}
            <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-1.5">
              <label className="font-bold text-black">Preferred Work Arrangement</label>
              <select
                value={workModeInput}
                onChange={(e) => setWorkModeInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-black/20 text-xs font-semibold text-black focus:outline-none focus:border-black"
              >
                <option value="Hybrid / Remote / On-site">Hybrid / Remote / On-site (Flexible)</option>
                <option value="Remote Only">Remote Only</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-black text-white font-mono font-bold text-xs hover:bg-neutral-800 transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center gap-2 cursor-pointer active:translate-y-0.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Academic Profile & Desired Role</span>
            </button>
          </div>
        </form>
      </div>

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
