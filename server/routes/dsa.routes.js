import { Router } from 'express';
import { defaultDSAData } from '../data/seedData.js';
import { striverSdeSheet } from '../data/striverSdeSheet.js';
import { blind75Sheet } from '../data/blind75Sheet.js';
import { neetcode150Sheet } from '../data/neetcode150Sheet.js';
import { cpEssentialsSheet } from '../data/cpEssentialsSheet.js';
import { getStoredProblems, addProblemToStore, updateProblemInStore } from '../data/problemStore.js';
import { getCodeforcesStats } from '../services/dsa/codeforces.adapter.js';
import { getLeetCodeStats } from '../services/dsa/leetcode.adapter.js';
import { getAtCoderStats } from '../services/dsa/atcoder.adapter.js';
import { getHackerRankStats } from '../services/dsa/hackerrank.adapter.js';

const router = Router();

const SHEET_REGISTRY = {
  striver_sde: {
    sheet: {
      id: 'striver_sde',
      title: "Striver's SDE Sheet (180)",
      description: "Standard 180 curated problems asked in top-tier tech placement interviews.",
      totalProblems: 180,
      category: "Interview Preparation"
    },
    problems: striverSdeSheet
  },
  striver: {
    sheet: {
      id: 'striver_sde',
      title: "Striver's SDE Sheet (180)",
      description: "Standard 180 curated problems asked in top-tier tech placement interviews.",
      totalProblems: 180,
      category: "Interview Preparation"
    },
    problems: striverSdeSheet
  },
  blind_75: {
    sheet: {
      id: 'blind_75',
      title: "Blind 75 Essential DSA",
      description: "The core 75 LeetCode problems covering all fundamental patterns.",
      totalProblems: 75,
      category: "Patterns"
    },
    problems: blind75Sheet
  },
  neetcode_150: {
    sheet: {
      id: 'neetcode_150',
      title: "NeetCode 150 Roadmap",
      description: "Structured progressive list grouped by pattern and algorithmic difficulty.",
      totalProblems: 150,
      category: "Patterns"
    },
    problems: neetcode150Sheet
  },
  cp_essentials: {
    sheet: {
      id: 'cp_essentials',
      title: "Codeforces Edu & CP Essentials",
      description: "Speed, greedy heuristics, number theory, and contest-specific problem solving.",
      totalProblems: 100,
      category: "Competitive Programming"
    },
    problems: cpEssentialsSheet
  }
};

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

router.get('/sheets', (req, res) => {
  const list = Object.values(SHEET_REGISTRY)
    .filter((v, i, arr) => arr.findIndex(x => x.sheet.id === v.sheet.id) === i)
    .map(v => v.sheet);
  res.json({ success: true, sheets: list });
});

router.get('/sheets/striver', (req, res) => {
  res.json({
    success: true,
    ...SHEET_REGISTRY.striver_sde
  });
});

router.get('/sheets/:sheetId', (req, res) => {
  const { sheetId } = req.params;
  const match = SHEET_REGISTRY[sheetId];
  if (match) {
    return res.json({
      success: true,
      ...match
    });
  }
  res.status(404).json({ success: false, message: 'Sheet not found' });
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
