import { Router } from 'express';
import { defaultDSAData, defaultWebDevData, defaultSystemDesignData } from '../data/seedData.js';
import { getCodeforcesStats } from '../services/dsa/codeforces.adapter.js';
import { getLeetCodeStats } from '../services/dsa/leetcode.adapter.js';
import { getGitHubStats } from '../services/github.service.js';
import { calculateReadiness } from '../services/readiness.service.js';

const router = Router();

router.get('/', async (req, res) => {
  const { cf_user = '', lc_user = '', gh_user = '', role = '', targetRole = '' } = req.query;

  try {
    const [cf, lc, gh] = await Promise.all([
      getCodeforcesStats(cf_user),
      getLeetCodeStats(lc_user),
      getGitHubStats(gh_user)
    ]);

    const dsaPayload = {
      ...defaultDSAData,
      platforms: {
        ...defaultDSAData.platforms,
        leetcode: lc,
        codeforces: cf
      }
    };

    const readiness = calculateReadiness({
      dsa: dsaPayload,
      webDev: defaultWebDevData,
      systemDesign: defaultSystemDesignData,
      github: gh,
      targetRole: role || targetRole || 'Software Development Engineer (SDE-1)'
    });

    res.json({
      success: true,
      readiness
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
