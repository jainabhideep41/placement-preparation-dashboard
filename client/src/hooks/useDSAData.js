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

  const fetchDSA = useCallback(async () => {
    try {
      const query = new URLSearchParams({
        cf_user: handles.codeforces || '',
        lc_user: handles.leetcode || ''
      }).toString();

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
    try {
      const res = await fetch('/api/dsa/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProblem)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.problem) {
          setProblems(prev => [json.problem, ...prev]);
          return json.problem;
        }
      }
    } catch (e) {
      // Offline fallback
      const localProb = {
        ...newProblem,
        id: `p_${Date.now()}`,
        status: 'Solved',
        revisionStatus: 'Due',
        lastReviewed: new Date().toISOString().split('T')[0]
      };
      setProblems(prev => [localProb, ...prev]);
      return localProb;
    }
  };

  const updateProblem = async (id, updates) => {
    setProblems(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    );

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
    setProblems(prev => prev.filter(p => p.id !== id));

    try {
      await fetch(`/api/dsa/problems/${id}`, {
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
    refresh: fetchDSA
  };
}
