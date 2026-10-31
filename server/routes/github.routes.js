import { Router } from 'express';
import { getGitHubStats } from '../services/github.service.js';

const router = Router();

router.get('/:username?', async (req, res) => {
  const username = req.params.username || req.query.user || 'alex-dev';
  try {
    const stats = await getGitHubStats(username);
    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
