import { Router } from 'express';
import { defaultDSAData, defaultWebDevData, defaultSystemDesignData } from '../data/seedData.js';
import { getStoredProblems, getDueProblems } from '../data/problemStore.js';
import { getCodeforcesStats } from '../services/dsa/codeforces.adapter.js';
import { getLeetCodeStats } from '../services/dsa/leetcode.adapter.js';
import { getAtCoderStats } from '../services/dsa/atcoder.adapter.js';
import { getHackerRankStats } from '../services/dsa/hackerrank.adapter.js';
import { getGitHubStats } from '../services/github.service.js';
import { calculateReadiness } from '../services/readiness.service.js';

const router = Router();

router.get('/', async (req, res) => {
  const { cf_user = '', lc_user = '', gh_user = '', ac_user = '', hr_user = '' } = req.query;

  try {
    // Concurrent fetch of all platform services (Section 12: Parallel API Requests)
    const [cfStats, lcStats, acStats, hrStats, ghStats] = await Promise.all([
      getCodeforcesStats(cf_user),
      getLeetCodeStats(lc_user),
      getAtCoderStats(ac_user),
      getHackerRankStats(hr_user),
      getGitHubStats(gh_user)
    ]);

    const dsaPayload = {
      ...defaultDSAData,
      platforms: {
        leetcode: lcStats,
        codeforces: cfStats,
        atcoder: acStats,
        hackerrank: hrStats
      }
    };

    const readiness = calculateReadiness({
      dsa: dsaPayload,
      webDev: defaultWebDevData,
      systemDesign: defaultSystemDesignData,
      github: ghStats
    });

    const totalSolved = (lcStats.problemsSolved || 0) + 
                        (cfStats.problemsSolved || 0) + 
                        (acStats.problemsSolved || 0) + 
                        (hrStats.problemsSolved || 0);

    const dueRevisions = getDueProblems();

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      readiness,
      metrics: {
        totalSolved,
        easy: lcStats.easy || 0,
        medium: lcStats.medium || 0,
        hard: lcStats.hard || 0,
        cfRating: cfStats.rating || 0,
        lcRating: lcStats.contestRating || 0,
        repos: ghStats.profile?.publicRepos || 0,
        commits: ghStats.profile?.totalCommitsLastYear || 0,
        prs: ghStats.profile?.mergedPullRequests || 0,
        systemTopicsCompleted: defaultSystemDesignData.topics.filter(t => t.completed).length,
        systemTopicsTotal: defaultSystemDesignData.topics.length
      },
      platforms: dsaPayload.platforms,
      dueRevisions,
      weakestArea: readiness.weakestArea,
      strongestArea: readiness.strongestArea,
      recommendations: readiness.recommendations
    });
  } catch (err) {
    console.error('Dashboard aggregation error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to aggregate dashboard metrics',
      error: err.message
    });
  }
});

export default router;
