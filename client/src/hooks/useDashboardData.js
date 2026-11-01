import { useState, useEffect, useCallback } from 'react';
import { useLocalCache } from './useLocalCache';

export function useDashboardData() {
  const [cachedDashboard, setCachedDashboard] = useLocalCache('prep_dashboard_cache', null);
  const [data, setData] = useState(cachedDashboard);
  const [loading, setLoading] = useState(!cachedDashboard);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastSynced, setLastSynced] = useState(null);

  // Stored usernames for platforms - default empty for unauthenticated / fresh students
  const [handles] = useLocalCache('prep_user_handles', {
    codeforces: '',
    leetcode: '',
    github: ''
  });

  const fetchDashboard = useCallback(async (isManualRefresh = false, overrideHandles = null, overrideRole = null, overrideWeights = null) => {
    let authUser = null;
    try {
      const raw = window.localStorage.getItem('prep_auth_user');
      if (raw) authUser = JSON.parse(raw);
    } catch (e) {
      // ignore
    }

    const effectiveHandles = {
      codeforces: overrideHandles?.codeforces !== undefined ? overrideHandles.codeforces : (handles?.codeforces || authUser?.handles?.codeforces || ''),
      leetcode: overrideHandles?.leetcode !== undefined ? overrideHandles.leetcode : (handles?.leetcode || authUser?.handles?.leetcode || ''),
      github: overrideHandles?.github !== undefined ? overrideHandles.github : (handles?.github || authUser?.handles?.github || '')
    };
    const effectiveRole = overrideRole || authUser?.targetRole || '';
    const email = authUser?.email || '';
    const effectiveWeights = overrideWeights || authUser?.customWeights || null;

    if (isManualRefresh) setRefreshing(true);
    else if (!data) setLoading(true);

    setError(null);

    try {
      const queryParams = {
        cf_user: effectiveHandles.codeforces,
        lc_user: effectiveHandles.leetcode,
        gh_user: effectiveHandles.github
      };
      if (email) queryParams.email = email;
      if (effectiveRole) queryParams.role = effectiveRole;
      if (effectiveWeights) queryParams.weights = JSON.stringify(effectiveWeights);

      const query = new URLSearchParams(queryParams).toString();

      const res = await fetch(`/api/dashboard?${query}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch dashboard data`);

      const json = await res.json();
      if (json.success) {
        setData(json);
        setCachedDashboard(json);
        setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } else {
        throw new Error(json.message || 'Error loading dashboard');
      }
    } catch (err) {
      console.warn('Dashboard fetch warning, using cache/fallback:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [handles.codeforces, handles.leetcode, handles.github, setCachedDashboard]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Listen to weight updates or dashboard refresh signals
  useEffect(() => {
    const handleRefreshSignal = (event) => {
      const weights = event.detail?.weights || null;
      fetchDashboard(true, null, null, weights);
    };

    window.addEventListener('prep_refresh_dashboard', handleRefreshSignal);
    return () => window.removeEventListener('prep_refresh_dashboard', handleRefreshSignal);
  }, [fetchDashboard]);

  const refresh = (overrideHandles = null, overrideRole = null, overrideWeights = null) => 
    fetchDashboard(true, overrideHandles, overrideRole, overrideWeights);

  return {
    data,
    loading,
    refreshing,
    error,
    lastSynced,
    refresh
  };
}
