import { Router } from 'express';
import { defaultDSAData } from '../data/seedData.js';
import { striverSdeSheet } from '../data/striverSdeSheet.js';
import { blind75Sheet } from '../data/blind75Sheet.js';
import { neetcode150Sheet } from '../data/neetcode150Sheet.js';
import { cpEssentialsSheet } from '../data/cpEssentialsSheet.js';
import { getStoredProblems, addProblemToStore, updateProblemInStore, deleteProblemFromStore } from '../data/problemStore.js';
import { getCodeforcesStats } from '../services/dsa/codeforces.adapter.js';
import { getLeetCodeStats } from '../services/dsa/leetcode.adapter.js';
import { getAtCoderStats } from '../services/dsa/atcoder.adapter.js';
import { getHackerRankStats } from '../services/dsa/hackerrank.adapter.js';

const router = Router();

function getCanonicalKey(p) {
  if (!p) return '';
  if (p.problemUrl) {
    const lcMatch = p.problemUrl.match(/leetcode\.com\/problems\/([^/?#]+)/i);
    if (lcMatch) return 'lc:' + lcMatch[1].toLowerCase().replace(/\/$/, '');

    const cfMatch = p.problemUrl.match(/codeforces\.com\/problemset\/problem\/([0-9]+)\/([A-Za-z0-9]+)/i);
    if (cfMatch) return 'cf:' + cfMatch[1] + '-' + cfMatch[2].toLowerCase();

    const cnMatch = p.problemUrl.match(/codingninjas\.com\/.*\/([a-z0-9-]+)(?:_|\?|$)/i);
    if (cnMatch) return 'cn:' + cnMatch[1].toLowerCase();

    const gfgMatch = p.problemUrl.match(/geeksforgeeks\.org\/problems\/([^/?#]+)/i);
    if (gfgMatch) return 'gfg:' + gfgMatch[1].toLowerCase();
  }
  return 'title:' + (p.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

const uniqueMap = new Map();
for (const list of [striverSdeSheet, blind75Sheet, neetcode150Sheet, cpEssentialsSheet]) {
  for (const p of list) {
    const key = getCanonicalKey(p);
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, { ...p, canonicalKey: key });
    }
  }
}
const allUniqueSheet = Array.from(uniqueMap.values());

const SHEET_REGISTRY = {
  all_unique: {
    sheet: {
      id: 'all_unique',
      title: "All Curated Problems (Master Question Bank)",
      description: "Consolidated 365 unique problems deduplicated across Striver, Blind 75, NeetCode 150, and CP Essentials.",
      totalProblems: allUniqueSheet.length,
      category: "Master Question Bank"
    },
    problems: allUniqueSheet
  },
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

const SERVER_TOPIC_DEFINITIONS = [
  { id: "arrays", name: "Arrays & Two Pointers", category: "Foundation" },
  { id: "strings", name: "Strings & Hashing", category: "Foundation" },
  { id: "binary_search", name: "Binary Search", category: "Foundation" },
  { id: "math", name: "Implementation & Math", category: "Foundation" },
  { id: "linked_list", name: "Linked List", category: "Data Structures" },
  { id: "stack_queue", name: "Stack & Queue", category: "Data Structures" },
  { id: "trees", name: "Binary Trees & BST", category: "Data Structures" },
  { id: "heaps", name: "Heaps & Priority Queues", category: "Data Structures" },
  { id: "graphs", name: "Graphs (BFS, DFS, Dijkstra)", category: "Advanced" },
  { id: "dp", name: "Dynamic Programming", category: "Advanced" },
  { id: "greedy", name: "Greedy Algorithms", category: "Advanced" },
  { id: "backtracking", name: "Backtracking & Recursion", category: "Advanced" },
  { id: "trie", name: "Trie & Bit Manipulation", category: "Advanced" }
];

function matchServerProblemToTopic(probTopic, topicName) {
  if (!probTopic) return false;
  if (probTopic === topicName) return true;
  if (topicName.startsWith('Graphs') && (probTopic === 'Graphs' || probTopic.includes('Graph'))) return true;
  if (topicName.includes('Arrays') && (probTopic.includes('Array') || probTopic.includes('Two Pointer'))) return true;
  if (topicName.includes('Trees') && (probTopic.includes('Tree') || probTopic.includes('BST'))) return true;
  if (topicName.includes('Trie') && (probTopic.includes('Trie') || probTopic.includes('Bit'))) return true;
  if (topicName.includes('Strings') && (probTopic.includes('String') || probTopic.includes('Hash'))) return true;
  if (topicName.includes('Math') && (probTopic.includes('Math') || probTopic.includes('Implementation'))) return true;
  if (topicName.includes('Dynamic Programming') && (probTopic.includes('Dynamic Programming') || probTopic === 'DP')) return true;
  if (topicName.includes('Linked List') && probTopic.includes('Linked List')) return true;
  if (topicName.includes('Stack & Queue') && (probTopic.includes('Stack') || probTopic.includes('Queue'))) return true;
  if (topicName.includes('Binary Search') && probTopic.includes('Binary Search')) return true;
  if (topicName.includes('Heaps') && (probTopic.includes('Heap') || probTopic.includes('Priority Queue'))) return true;
  if (topicName.includes('Greedy') && probTopic.includes('Greedy')) return true;
  if (topicName.includes('Backtracking') && (probTopic.includes('Backtracking') || probTopic.includes('Recursion'))) return true;
  return false;
}

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
      const canonKey = getCanonicalKey(sub);
      const matchedUnique = allUniqueSheet.find(u => u.canonicalKey === canonKey || u.title.toLowerCase() === sub.title.toLowerCase());
      if (matchedUnique) {
        sub.topic = matchedUnique.topic;
        sub.difficulty = matchedUnique.difficulty;
        sub.canonicalKey = canonKey;
      }
      if (!existingTitles.has(sub.title.toLowerCase())) {
        existingTitles.add(sub.title.toLowerCase());
        combinedProblems.unshift(sub);
      }
    }

    // Dynamic Topic stats calculated from allUniqueSheet & combinedProblems
    const dynamicTopics = SERVER_TOPIC_DEFINITIONS.map(def => {
      const topicProblems = allUniqueSheet.filter(p => matchServerProblemToTopic(p.topic, def.name));
      const seenKeys = new Set();
      let solvedCount = 0;

      for (const p of combinedProblems) {
        if (p.status === 'Solved' && matchServerProblemToTopic(p.topic, def.name)) {
          const key = p.canonicalKey || getCanonicalKey(p) || p.title?.toLowerCase();
          if (key && !seenKeys.has(key)) {
            seenKeys.add(key);
            solvedCount++;
          }
        }
      }

      const total = topicProblems.length > 0 ? topicProblems.length : 25;
      return {
        id: def.id,
        name: def.name,
        category: def.category,
        total,
        solved: solvedCount
      };
    });

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
      topics: dynamicTopics,
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

router.delete('/problems/:id', (req, res) => {
  const { id } = req.params;
  const deleted = deleteProblemFromStore(id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Problem not found in review queue' });
  }

  res.json({ success: true, message: 'Problem successfully removed from review queue', id });
});

export default router;
