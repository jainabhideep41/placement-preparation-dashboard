import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { DSA } from './pages/DSA';
import { WebDevelopment } from './pages/WebDevelopment';
import { SystemDesign } from './pages/SystemDesign';
import { GitHubFOSS } from './pages/GitHubFOSS';
import { PlacementReadiness } from './pages/PlacementReadiness';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { PublicProfile } from './pages/PublicProfile';
import { OnboardingModal } from './components/common/OnboardingModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { findUserByEmail, saveUserToRegistry } from './utils/accountManager';

import { useDashboardData } from './hooks/useDashboardData';
import { useDSAData } from './hooks/useDSAData';
import { useProgress } from './hooks/useProgress';
import { useLocalCache } from './hooks/useLocalCache';

export function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useLocalCache('prep_auth_user', null);
  const [handles, setHandles] = useLocalCache('prep_user_handles', {
    codeforces: '',
    leetcode: '',
    github: ''
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [onboardingUser, setOnboardingUser] = useState(null);

  // Custom Hooks (Directly fulfills React Hooks requirement)
  const dashboardHook = useDashboardData();
  const dsaHook = useDSAData();
  const progressHook = useProgress();

  const handleRefreshAll = () => {
    dashboardHook.refresh();
    dsaHook.refresh();
    progressHook.refreshProgress();
  };

  const handleLogin = (user) => {
    // Unify user record in registry
    const unified = saveUserToRegistry(user);
    setCurrentUser(unified);

    if (unified.handles) {
      setHandles({
        leetcode: unified.handles.leetcode || '',
        codeforces: unified.handles.codeforces || '',
        github: unified.handles.github || ''
      });
    }

    // Clear stale caches so dashboard loads the student's fresh profile
    window.localStorage.removeItem('prep_dashboard_cache');
    window.localStorage.removeItem('prep_dsa_cache');
    setTimeout(() => {
      handleRefreshAll();
      navigate('/dashboard');
    }, 100);
  };

  // Detect OAuth redirect response from Google/GitHub
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthSuccess = params.get('oauth_success');
    const userParam = params.get('user');

    if (oauthSuccess === 'true' && userParam) {
      try {
        const authenticatedUser = JSON.parse(decodeURIComponent(userParam));
        const email = authenticatedUser.email;
        const existingRegistryUser = findUserByEmail(email);

        // Check if user has already completed onboarding
        const hasCompletedOnboarding = existingRegistryUser?.onboardingCompleted;

        // If it's a first time OAuth user who has not completed onboarding
        if (authenticatedUser.isNewUser && !hasCompletedOnboarding) {
          setOnboardingUser(authenticatedUser);
        } else {
          // Unified account: merge with existing account and log in directly
          const unifiedUser = saveUserToRegistry({
            ...existingRegistryUser,
            ...authenticatedUser,
            handles: {
              leetcode: existingRegistryUser?.handles?.leetcode || authenticatedUser.handles?.leetcode || '',
              codeforces: existingRegistryUser?.handles?.codeforces || authenticatedUser.handles?.codeforces || '',
              github: authenticatedUser.handles?.github || existingRegistryUser?.handles?.github || ''
            },
            onboardingCompleted: true
          });
          handleLogin(unifiedUser);
        }
      } catch (e) {
        console.error('Failed to parse OAuth user:', e);
      } finally {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const handleCompleteOnboarding = async (handles, targetRole) => {
    if (!onboardingUser) return;

    const email = onboardingUser.email;
    const existing = findUserByEmail(email);

    const unifiedUser = saveUserToRegistry({
      ...existing,
      ...onboardingUser,
      handles: {
        leetcode: handles.leetcode || existing?.handles?.leetcode || '',
        codeforces: handles.codeforces || existing?.handles?.codeforces || '',
        github: handles.github || onboardingUser.handles?.github || existing?.handles?.github || ''
      },
      targetRole: targetRole || existing?.targetRole || onboardingUser.targetRole,
      onboardingCompleted: true
    });

    try {
      fetch('/api/auth/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: unifiedUser.email,
          handles: unifiedUser.handles,
          targetRole: unifiedUser.targetRole
        })
      }).catch(() => {});
    } catch (e) {
      // offline fallback
    }

    setOnboardingUser(null);
    handleLogin(unifiedUser);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    window.localStorage.removeItem('prep_auth_user');
    window.localStorage.removeItem('prep_user_handles');
    window.localStorage.removeItem('prep_dashboard_cache');
    window.localStorage.removeItem('prep_dsa_cache');
    window.localStorage.removeItem('prep_webdev_state');
    window.localStorage.removeItem('prep_sysdesign_state');
    navigate('/login');
  };

  const handleNavigate = (pageOrPath) => {
    const pathMap = {
      dashboard: '/dashboard',
      dsa: '/dsa',
      webdev: '/webdev',
      systemdesign: '/system-design',
      'system-design': '/system-design',
      github: '/github',
      readiness: '/readiness',
      settings: '/settings'
    };
    const target = pathMap[pageOrPath] || (pageOrPath.startsWith('/') ? pageOrPath : `/${pageOrPath}`);
    navigate(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If first-time OAuth onboarding is active, show the OnboardingModal
  if (onboardingUser) {
    return <OnboardingModal user={onboardingUser} onComplete={handleCompleteOnboarding} />;
  }

  // Ensure currentUser has a valid sanitized username at all times
  useEffect(() => {
    if (currentUser && !currentUser.username && currentUser.email) {
      const fallbackUsername = currentUser.email.split('@')[0].replace(/[^a-z0-9_-]/gi, '').toLowerCase() || 'candidate';
      const updatedUser = { ...currentUser, username: fallbackUsername };
      setCurrentUser(updatedUser);
      saveUserToRegistry(updatedUser);
    }
  }, [currentUser, setCurrentUser]);

  // Check if viewing a standalone public profile route
  const isProfileRoute = location.pathname.startsWith('/u') || location.pathname.startsWith('/profile');
  const userHandle = currentUser?.username || 
    currentUser?.email?.split('@')[0]?.replace(/[^a-z0-9_-]/gi, '').toLowerCase() || 
    currentUser?.handles?.leetcode || 
    'demo';

  // If student is not logged in, permit public profile viewing or show Login
  if (!currentUser) {
    return (
      <Routes>
        <Route path="/u/:username" element={<PublicProfile currentUser={null} />} />
        <Route path="/profile/:username" element={<PublicProfile currentUser={null} />} />
        <Route path="/u" element={<Navigate to="/u/demo" replace />} />
        <Route path="/profile" element={<Navigate to="/u/demo" replace />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="*" element={<Login onLogin={handleLogin} />} />
      </Routes>
    );
  }

  // Standalone public profile view for logged-in user or external visitor
  if (isProfileRoute) {
    return (
      <Routes>
        <Route path="/u/:username" element={<PublicProfile currentUser={currentUser} />} />
        <Route path="/profile/:username" element={<PublicProfile currentUser={currentUser} />} />
        <Route path="/u" element={<Navigate to={`/u/${encodeURIComponent(userHandle)}`} replace />} />
        <Route path="/profile" element={<Navigate to={`/u/${encodeURIComponent(userHandle)}`} replace />} />
      </Routes>
    );
  }

  const readinessScore = dashboardHook.data?.readiness?.overallScore || 0;
  const statusTier = dashboardHook.data?.readiness?.status || 'Keep Preparing';

  return (
    <div className="min-h-screen bg-[#EAEAEA] text-black flex flex-col font-sans selection:bg-black selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        onRefresh={handleRefreshAll}
        isRefreshing={dashboardHook.refreshing}
        lastSynced={dashboardHook.lastSynced}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        isSidebarOpen={sidebarOpen}
        readinessScore={readinessScore}
        tierStatus={statusTier}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <div className="flex flex-1 relative">
        {/* Navigation Sidebar with Real Router Links */}
        <Sidebar
          onNavigate={handleNavigate}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          revisionDueCount={dsaHook.dueRevisionCount}
          currentUser={currentUser}
        />

        {/* Main Content Area with Real URL Routes */}
        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/dashboard"
                element={
                  <Dashboard
                    dashboardData={dashboardHook.data}
                    loading={dashboardHook.loading}
                    onNavigate={handleNavigate}
                    onRefreshAll={handleRefreshAll}
                  />
                }
              />
              <Route path="/dsa" element={<DSA dsaHook={dsaHook} />} />
              <Route path="/webdev" element={<WebDevelopment progressHook={progressHook} />} />
              <Route path="/web-development" element={<Navigate to="/webdev" replace />} />
              <Route path="/system-design" element={<SystemDesign progressHook={progressHook} />} />
              <Route path="/systemdesign" element={<Navigate to="/system-design" replace />} />
              <Route path="/github" element={<GitHubFOSS />} />
              <Route path="/github-foss" element={<Navigate to="/github" replace />} />
              <Route
                path="/readiness"
                element={
                  <PlacementReadiness
                    dashboardData={dashboardHook.data}
                    onNavigate={handleNavigate}
                  />
                }
              />
              <Route path="/placement-readiness" element={<Navigate to="/readiness" replace />} />
              <Route path="/settings" element={<Settings onRefreshAll={handleRefreshAll} />} />
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default App;
