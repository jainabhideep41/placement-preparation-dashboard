import { useState, useEffect, useCallback } from 'react';
import { useLocalCache } from './useLocalCache';

export function useProgress() {
  const [webDevCache, setWebDevCache] = useLocalCache('prep_webdev_state', null);
  const [sysDesignCache, setSysDesignCache] = useLocalCache('prep_sysdesign_state', null);

  const [webDevData, setWebDevData] = useState(webDevCache);
  const [sysDesignData, setSysDesignData] = useState(sysDesignCache);
  const [loading, setLoading] = useState(!webDevCache || !sysDesignCache);

  const fetchProgress = useCallback(async () => {
    try {
      const [wdRes, sdRes] = await Promise.all([
        fetch('/api/webdev'),
        fetch('/api/systemdesign')
      ]);

      if (wdRes.ok) {
        const wdJson = await wdRes.json();
        if (wdJson.success) {
          setWebDevData(wdJson);
          setWebDevCache(wdJson);
        }
      }

      if (sdRes.ok) {
        const sdJson = await sdRes.json();
        if (sdJson.success) {
          setSysDesignData(sdJson);
          setSysDesignCache(sdJson);
        }
      }
    } catch (e) {
      console.warn('Progress sync warning, using local state:', e);
    } finally {
      setLoading(false);
    }
  }, [setWebDevCache, setSysDesignCache]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Toggle WebDev milestone
  const toggleWebDevMilestone = async (roadmapId, milestoneId) => {
    if (!webDevData?.roadmaps) return;

    const updatedRoadmaps = webDevData.roadmaps.map(rm => {
      if (rm.id !== roadmapId) return rm;
      const updatedMilestones = rm.milestones.map(m =>
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      );
      const total = updatedMilestones.length;
      const completed = updatedMilestones.filter(m => m.completed).length;
      return {
        ...rm,
        milestones: updatedMilestones,
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    });

    const totalAll = updatedRoadmaps.reduce((acc, r) => acc + r.total, 0);
    const completedAll = updatedRoadmaps.reduce((acc, r) => acc + r.completed, 0);
    const overallPercentage = totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0;

    const newState = {
      ...webDevData,
      roadmaps: updatedRoadmaps,
      overallPercentage,
      completedAll,
      totalAll
    };

    setWebDevData(newState);
    setWebDevCache(newState);

    try {
      await fetch('/api/webdev/milestone/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roadmapId, milestoneId })
      });
    } catch (e) {
      console.warn('Milestone saved locally:', e);
    }
  };

  // Toggle System Design topic
  const toggleSysDesignTopic = async (topicId) => {
    if (!sysDesignData?.topics) return;

    const updatedTopics = sysDesignData.topics.map(t =>
      t.id === topicId ? { ...t, completed: !t.completed } : t
    );

    const totalTopics = updatedTopics.length;
    const completedTopics = updatedTopics.filter(t => t.completed).length;
    const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    const newState = {
      ...sysDesignData,
      topics: updatedTopics,
      completedTopics,
      totalTopics,
      percentage
    };

    setSysDesignData(newState);
    setSysDesignCache(newState);

    try {
      await fetch('/api/systemdesign/topic/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId })
      });
    } catch (e) {
      console.warn('System design topic saved locally:', e);
    }
  };

  // Update Case Study status
  const updateCaseStudyStatus = async (id, status) => {
    if (!sysDesignData?.caseStudies) return;

    const updatedCS = sysDesignData.caseStudies.map(cs =>
      cs.id === id ? { ...cs, status } : cs
    );

    const newState = {
      ...sysDesignData,
      caseStudies: updatedCS
    };

    setSysDesignData(newState);
    setSysDesignCache(newState);

    try {
      await fetch('/api/systemdesign/casestudy/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
    } catch (e) {
      console.warn('Case study saved locally:', e);
    }
  };

  return {
    webDevData,
    sysDesignData,
    loading,
    toggleWebDevMilestone,
    toggleSysDesignTopic,
    updateCaseStudyStatus,
    refreshProgress: fetchProgress
  };
}
