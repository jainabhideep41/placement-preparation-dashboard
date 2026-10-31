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

  const fetchDashboard = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else if (!data) setLoading(true);

    setError(null);

    try {
      const query = new URLSearchParams({
        cf_user: handles.codeforces || '',
        lc_user: handles.leetcode || '',
        gh_user: handles.github || ''
      }).toString();

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

  const refresh = () => fetchDashboard(true);

  return {
    data,
    loading,
    refreshing,
    error,
    lastSynced,
    refresh
  };
}
