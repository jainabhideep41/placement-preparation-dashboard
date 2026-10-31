import { Router } from 'express';
import { defaultDSAData } from '../data/seedData.js';
import { getStoredProblems, addProblemToStore, updateProblemInStore } from '../data/problemStore.js';
import { getCodeforcesStats } from '../services/dsa/codeforces.adapter.js';
import { getLeetCodeStats } from '../services/dsa/leetcode.adapter.js';
import { getAtCoderStats } from '../services/dsa/atcoder.adapter.js';
import { getHackerRankStats } from '../services/dsa/hackerrank.adapter.js';

const router = Router();

router.get('/', async (req, res) => {
  const { cf_user = '', lc_user = '', ac_user = '', hr_user = '' } = req.query;

  try {
    const [cf, lc, ac, hr] = await Promise.all([
      getCodeforcesStats(cf_user),
      getLeetCodeStats(lc_user),
      getAtCoderStats(ac_user),
      getHackerRankStats(hr_user)
    ]);

    const totalSolved = (lc.problemsSolved || 0) + 
                        (cf.problemsSolved || 0) + 
                        (ac.problemsSolved || 0) + 
                        (hr.problemsSolved || 0);

    const storedProblems = getStoredProblems();
    // Merge live extracted submissions with stored problems (deduping by title)
    const combinedProblems = [...storedProblems];
    const existingTitles = new Set(storedProblems.map(p => p.title.toLowerCase()));

    const liveSubs = [...(cf.recentSubmissions || []), ...(lc.recentSubmissions || [])];
    for (const sub of liveSubs) {
      if (!existingTitles.has(sub.title.toLowerCase())) {
        existingTitles.add(sub.title.toLowerCase());
        combinedProblems.unshift(sub);
      }
    }

    // Dynamic difficulty calculation
    const easy = lc.easy || 0;
    const medium = lc.medium || 0;
    const hard = lc.hard || 0;

    res.json({
      success: true,
      platforms: {
        leetcode: lc,
        codeforces: cf,
        atcoder: ac,
        hackerrank: hr
      },
      stats: {
        totalSolved,
        easy,
        medium,
        hard
      },
      topics: defaultDSAData.topics,
      sheets: defaultDSAData.sheets,
      problems: combinedProblems
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/codeforces/:username', async (req, res) => {
  const stats = await getCodeforcesStats(req.params.username);
  res.json({ success: true, data: stats });
});

router.get('/leetcode/:username', async (req, res) => {
  const stats = await getLeetCodeStats(req.params.username);
  res.json({ success: true, data: stats });
});

router.post('/problems', (req, res) => {
  const { title, platform, difficulty, topic, url, notes, revisionInterval = '7d' } = req.body;
  if (!title || !platform) {
    return res.status(400).json({ success: false, message: 'Title and platform are required' });
  }

  const newProblem = {
    id: `p_${Date.now()}`,
    title,
    platform,
    difficulty: difficulty || 'Medium',
    topic: topic || 'General',
    url: url || '',
    status: 'Solved',
    revisionStatus: 'Due',
    revisionInterval,
    lastReviewed: new Date().toISOString().split('T')[0],
    notes: notes || ''
  };

  const saved = addProblemToStore(newProblem);
  res.status(201).json({ success: true, problem: saved });
});

router.patch('/problems/:id', (req, res) => {
  const { id } = req.params;
  const updated = updateProblemInStore(id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Problem not found' });
  }

  res.json({ success: true, problem: updated });
});

export default router;
