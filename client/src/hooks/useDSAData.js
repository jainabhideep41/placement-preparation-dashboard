import { useState, useEffect, useCallback } from 'react';
import { useLocalCache } from './useLocalCache';

export function useDSAData() {
  const [handles] = useLocalCache('prep_user_handles', {
    codeforces: '',
    leetcode: '',
    github: ''
  });

  const [cachedDSA, setCachedDSA] = useLocalCache('prep_dsa_cache', null);
  const [data, setData] = useState(cachedDSA);
  const [loading, setLoading] = useState(!cachedDSA);
  const [problems, setProblems] = useState(cachedDSA?.problems || []);
  const [filterTopic, setFilterTopic] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [filterPlatform, setFilterPlatform] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDSA = useCallback(async (overrideHandles = null) => {
    let authUser = null;
    try {
      const raw = window.localStorage.getItem('prep_auth_user');
      if (raw) authUser = JSON.parse(raw);
    } catch (e) {
      // ignore
    }

    const effectiveHandles = {
      codeforces: overrideHandles?.codeforces !== undefined ? overrideHandles.codeforces : (handles?.codeforces || authUser?.handles?.codeforces || ''),
      leetcode: overrideHandles?.leetcode !== undefined ? overrideHandles.leetcode : (handles?.leetcode || authUser?.handles?.leetcode || '')
    };
    const email = authUser?.email || '';

    try {
      const queryParams = {
        cf_user: effectiveHandles.codeforces || '',
        lc_user: effectiveHandles.leetcode || ''
      };
      if (email) queryParams.email = email;

      const query = new URLSearchParams(queryParams).toString();

      const res = await fetch(`/api/dsa?${query}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json);
          setCachedDSA(json);
          setProblems(json.problems || []);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch DSA data from backend, using local state:', e);
    } finally {
      setLoading(false);
    }
  }, [handles.codeforces, handles.leetcode, setCachedDSA]);

  useEffect(() => {
    fetchDSA();
  }, [fetchDSA]);

  const addProblem = async (newProblem) => {
    let createdProb = null;
    try {
      const res = await fetch('/api/dsa/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProblem)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.problem) {
          createdProb = json.problem;
        }
      }
    } catch (e) {
      // Offline fallback
    }

    if (!createdProb) {
      createdProb = {
        ...newProblem,
        id: `p_${Date.now()}`,
        status: 'Solved',
        revisionStatus: 'Due',
        lastReviewed: new Date().toISOString().split('T')[0]
      };
    }

    setProblems(prev => {
      const updated = [createdProb, ...prev.filter(p => p.id !== createdProb.id)];
      setCachedDSA(prevCached => prevCached ? { ...prevCached, problems: updated } : { success: true, problems: updated });
      return updated;
    });

    return createdProb;
  };

  const updateProblem = async (id, updates) => {
    setProblems(prev => {
      const updated = prev.map(p => (p.id === id ? { ...p, ...updates } : p));
      setCachedDSA(prevCached => prevCached ? { ...prevCached, problems: updated } : null);
      return updated;
    });

    try {
      await fetch(`/api/dsa/problems/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (e) {
      console.warn('Problem update synced locally only:', e);
    }
  };

  const deleteProblem = async (id) => {
    const idLower = String(id).toLowerCase();
    setProblems(prev => {
      const updated = prev.filter(p => 
        p.id !== id && 
        p.canonicalKey !== id && 
        p.title?.toLowerCase() !== idLower
      );
      setCachedDSA(prevCached => prevCached ? { ...prevCached, problems: updated } : null);
      return updated;
    });

    try {
      await fetch(`/api/dsa/problems/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn('Problem deletion synced locally only:', e);
    }
  };

  // Filtered problems list
  const filteredProblems = problems.filter(p => {
    if (filterTopic !== 'All' && p.topic !== filterTopic) return false;
    if (filterDifficulty !== 'All' && p.difficulty !== filterDifficulty) return false;
    if (filterPlatform !== 'All' && p.platform !== filterPlatform) return false;
    if (filterStatus !== 'All' && p.status !== filterStatus && p.revisionStatus !== filterStatus) return false;
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(query);
      const matchTopic = p.topic?.toLowerCase().includes(query);
      const matchNotes = p.notes?.toLowerCase().includes(query);
      if (!matchTitle && !matchTopic && !matchNotes) return false;
    }
    return true;
  });

  const dueRevisionCount = problems.filter(p => p.revisionStatus === 'Due').length;

  return {
    data,
    loading,
    problems: filteredProblems,
    allProblems: problems,
    dueRevisionCount,
    filters: {
      topic: filterTopic,
      difficulty: filterDifficulty,
      platform: filterPlatform,
      status: filterStatus,
      search: searchQuery
    },
    setFilterTopic,
    setFilterDifficulty,
    setFilterPlatform,
    setFilterStatus,
    setSearchQuery,
    addProblem,
    updateProblem,
    deleteProblem,
    refresh: (overrideHandles = null) => fetchDSA(overrideHandles)
  };
}
