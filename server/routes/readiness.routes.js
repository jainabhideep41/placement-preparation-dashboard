import { Router } from 'express';
import { defaultDSAData, defaultWebDevData, defaultSystemDesignData } from '../data/seedData.js';
import { getUserByEmail } from '../data/userStore.js';
import { getCodeforcesStats } from '../services/dsa/codeforces.adapter.js';
import { getLeetCodeStats } from '../services/dsa/leetcode.adapter.js';
import { getGitHubStats } from '../services/github.service.js';
import { calculateReadiness } from '../services/readiness.service.js';

const router = Router();

router.get('/', async (req, res) => {
  let { cf_user = '', lc_user = '', gh_user = '', role = '', targetRole = '', email = '' } = req.query;

  if (email) {
    const regUser = getUserByEmail(email);
    if (regUser) {
      if (!cf_user && regUser.handles?.codeforces) cf_user = regUser.handles.codeforces;
      if (!lc_user && regUser.handles?.leetcode) lc_user = regUser.handles.leetcode;
      if (!gh_user && regUser.handles?.github) gh_user = regUser.handles.github;
      if (!role && !targetRole && regUser.targetRole) role = regUser.targetRole;
    }
  }

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
