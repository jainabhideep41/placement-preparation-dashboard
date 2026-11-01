/**
 * Curated Sheets Manager & Canonical Problem Resolver
 * 
 * Provides:
 * 1. Canonical key resolution to identify identical problems across Striver, Blind 75, NeetCode 150, and CP Essentials.
 * 2. Cross-sheet synchronized solved state management.
 * 3. Deduplicated unique problem bank (365 unique problems across 4 sheets).
 * 4. Backward-compatible migration from legacy per-sheet storage keys.
 * 5. Fuzzy & intelligent search matching across titles, topics, platforms, and sheets.
 */

import { striverSdeSheet } from '../data/striverSdeSheet.js';
import { blind75Sheet } from '../data/blind75Sheet.js';
import { neetcode150Sheet } from '../data/neetcode150Sheet.js';
import { cpEssentialsSheet } from '../data/cpEssentialsSheet.js';

export const CANONICAL_STORAGE_KEY = 'prep_curated_canonical_solved_map';

/**
 * Normalizes URL and title to produce a canonical problem identifier.
 * e.g., "https://leetcode.com/problems/two-sum/" -> "lc:two-sum"
 *       "https://codeforces.com/problemset/problem/4/A" -> "cf:4-a"
 */
export function getCanonicalKey(p) {
  if (!p) return '';
  const url = p.problemUrl || p.url;
  if (url) {
    const lcMatch = url.match(/leetcode\.com\/problems\/([^/?#]+)/i);
    if (lcMatch) return 'lc:' + lcMatch[1].toLowerCase().replace(/\/$/, '');

    const cfMatch = url.match(/codeforces\.com\/problemset\/problem\/([0-9]+)\/([A-Za-z0-9]+)/i);
    if (cfMatch) return 'cf:' + cfMatch[1] + '-' + cfMatch[2].toLowerCase();

    const cnMatch = url.match(/codingninjas\.com\/.*\/([a-z0-9-]+)(?:_|\?|$)/i);
    if (cnMatch) return 'cn:' + cnMatch[1].toLowerCase();

    const gfgMatch = url.match(/geeksforgeeks\.org\/problems\/([^/?#]+)/i);
    if (gfgMatch) return 'gfg:' + gfgMatch[1].toLowerCase();
  }
  // Fallback to normalized alphanumeric title
  return 'title:' + (p.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

export const RAW_SHEETS = [
  { id: 'striver_sde', name: "Striver's SDE", problems: striverSdeSheet },
  { id: 'blind_75', name: 'Blind 75', problems: blind75Sheet },
  { id: 'neetcode_150', name: 'NeetCode 150', problems: neetcode150Sheet },
  { id: 'cp_essentials', name: 'CP Essentials', problems: cpEssentialsSheet }
];

// Mapping from problem.id -> canonicalKey
export const ID_TO_CANONICAL_MAP = {};
// Mapping from canonicalKey -> list of sheet references
export const CANONICAL_TO_SHEETS_MAP = {};

// Build canonical lookups
const uniqueMap = new Map();

for (const sheet of RAW_SHEETS) {
  for (const problem of sheet.problems) {
    const key = getCanonicalKey(problem);
    ID_TO_CANONICAL_MAP[problem.id] = key;

    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, {
        canonicalKey: key,
        id: problem.id,
        title: problem.title,
        difficulty: problem.difficulty,
        topic: problem.topic,
        platform: problem.platform,
        problemUrl: problem.problemUrl,
        solutionUrl: problem.solutionUrl,
        rating: problem.rating,
        day: problem.day,
        sheets: []
      });
    }

    const uniqueEntry = uniqueMap.get(key);
    uniqueEntry.sheets.push({
      sheetId: sheet.id,
      sheetName: sheet.name,
      problemId: problem.id,
      day: problem.day
    });

    if (!CANONICAL_TO_SHEETS_MAP[key]) {
      CANONICAL_TO_SHEETS_MAP[key] = [];
    }
    CANONICAL_TO_SHEETS_MAP[key].push({
      sheetId: sheet.id,
      sheetName: sheet.name,
      problemId: problem.id
    });
  }
}

/**
 * Array of all 365 deduplicated unique problems across all sheets
 */
export const ALL_UNIQUE_PROBLEMS = Array.from(uniqueMap.values());

/**
 * Returns whether a problem is solved given the canonical solved map
 */
export function isProblemSolved(problem, canonicalSolvedMap = {}) {
  if (!problem) return false;
  const key = getCanonicalKey(problem);
  if (canonicalSolvedMap[key]) return true;
  if (problem.id && canonicalSolvedMap[problem.id]) return true;
  return false;
}

/**
 * Toggles a problem's solved state across all sheets.
 * Returns the new canonical solved map.
 */
export function toggleCanonicalSolvedState(problem, currentSolvedMap = {}) {
  const key = getCanonicalKey(problem);
  const isCurrentlySolved = isProblemSolved(problem, currentSolvedMap);

  const updated = { ...currentSolvedMap };

  if (isCurrentlySolved) {
    delete updated[key];
    if (problem.id) delete updated[problem.id];
    // Also remove from any other IDs matching this canonical key
    const refs = CANONICAL_TO_SHEETS_MAP[key] || [];
    for (const ref of refs) {
      delete updated[ref.problemId];
    }
  } else {
    updated[key] = true;
    if (problem.id) updated[problem.id] = true;
    const refs = CANONICAL_TO_SHEETS_MAP[key] || [];
    for (const ref of refs) {
      updated[ref.problemId] = true;
    }
  }

  return updated;
}

/**
 * Counts how many unique problems are solved across all sheets
 */
export function getUniqueSolvedStats(canonicalSolvedMap = {}) {
  let solvedCount = 0;
  for (const prob of ALL_UNIQUE_PROBLEMS) {
    if (isProblemSolved(prob, canonicalSolvedMap)) {
      solvedCount++;
    }
  }
  const total = ALL_UNIQUE_PROBLEMS.length;
  const percent = total > 0 ? Math.round((solvedCount / total) * 100) : 0;
  return {
    totalUnique: total,
    solvedUnique: solvedCount,
    percent
  };
}

/**
 * Counts how many problems are solved for a specific sheet
 */
export function getSheetSolvedCount(sheetProblems = [], canonicalSolvedMap = {}) {
  return sheetProblems.filter(p => isProblemSolved(p, canonicalSolvedMap)).length;
}

/**
 * Auto-migrates legacy localStorage maps (prep_striver_solved_map, etc.) into the canonical map
 */
export function migrateLegacySolvedMaps() {
  if (typeof window === 'undefined') return {};
  try {
    const existingCanonicalRaw = localStorage.getItem(CANONICAL_STORAGE_KEY);
    const canonicalMap = existingCanonicalRaw ? JSON.parse(existingCanonicalRaw) : {};

    const legacyKeys = [
      'prep_striver_solved_map',
      'prep_blind75_solved_map',
      'prep_neetcode150_solved_map',
      'prep_cp_essentials_solved_map'
    ];

    let migratedAny = false;

    for (const lk of legacyKeys) {
      const raw = localStorage.getItem(lk);
      if (raw) {
        try {
          const map = JSON.parse(raw);
          for (const probId of Object.keys(map)) {
            if (map[probId]) {
              const canonKey = ID_TO_CANONICAL_MAP[probId] || probId;
              if (!canonicalMap[canonKey]) {
                canonicalMap[canonKey] = true;
                migratedAny = true;
              }
              // Also preserve probId
              canonicalMap[probId] = true;
            }
          }
        } catch (e) {
          // ignore
        }
      }
    }

    if (migratedAny || !existingCanonicalRaw) {
      localStorage.setItem(CANONICAL_STORAGE_KEY, JSON.stringify(canonicalMap));
    }

    return canonicalMap;
  } catch (e) {
    console.warn('Migration error for curated solved maps:', e);
    return {};
  }
}

/**
 * Smart search matcher for problem queries
 */
export function matchProblem(problem, rawQuery) {
  if (!rawQuery || !rawQuery.trim()) return true;
  const q = rawQuery.trim().toLowerCase();

  // Direct normalized text
  const normTitle = (problem.title || '').toLowerCase();
  const normTopic = (problem.topic || '').toLowerCase();
  const normPlatform = (problem.platform || '').toLowerCase();
  const normDiff = (problem.difficulty || '').toLowerCase();
  const normRating = problem.rating ? String(problem.rating) : '';
  const normKey = (problem.canonicalKey || getCanonicalKey(problem)).toLowerCase();
  const normDay = problem.day ? `day ${problem.day}` : '';

  if (normTitle.includes(q)) return true;
  if (normTopic.includes(q)) return true;
  if (normPlatform.includes(q)) return true;
  if (normDiff.includes(q)) return true;
  if (normRating.includes(q)) return true;
  if (normKey.includes(q)) return true;
  if (normDay.includes(q)) return true;

  // Clean alphanumeric check (handles "2 sum" vs "2-sum" vs "twosum")
  const cleanQ = q.replace(/[^a-z0-9]/g, '');
  const cleanTitle = normTitle.replace(/[^a-z0-9]/g, '');
  if (cleanQ && cleanTitle.includes(cleanQ)) return true;

  // Number substitution (2 <-> two, 3 <-> three)
  const numberWordMap = {
    '2': 'two',
    'two': '2',
    '3': 'three',
    'three': '3',
    '4': 'four',
    'four': '4'
  };
  for (const [digit, word] of Object.entries(numberWordMap)) {
    if (q.includes(digit)) {
      const swapped = q.replace(digit, word);
      if (normTitle.includes(swapped) || cleanTitle.includes(swapped.replace(/[^a-z0-9]/g, ''))) return true;
    }
    if (q.includes(word)) {
      const swapped = q.replace(word, digit);
      if (normTitle.includes(swapped) || cleanTitle.includes(swapped.replace(/[^a-z0-9]/g, ''))) return true;
    }
  }

  // Check sheet names
  const sheets = CANONICAL_TO_SHEETS_MAP[problem.canonicalKey || getCanonicalKey(problem)] || [];
  for (const s of sheets) {
    if (s.sheetName.toLowerCase().includes(q)) return true;
  }

  return false;
}

export const TOPIC_DEFINITIONS = [
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

export function matchProblemToTopic(probTopic, topicName) {
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

export function getTopicMasteryStats(canonicalSolvedMap = {}, customProblems = []) {
  return TOPIC_DEFINITIONS.map(def => {
    const topicProblems = ALL_UNIQUE_PROBLEMS.filter(p => matchProblemToTopic(p.topic, def.name));
    const seenKeys = new Set();
    let solvedCount = 0;

    for (const p of topicProblems) {
      if (isProblemSolved(p, canonicalSolvedMap)) {
        seenKeys.add(p.canonicalKey);
        solvedCount++;
      }
    }

    for (const p of customProblems) {
      if (matchProblemToTopic(p.topic, def.name) && p.status === 'Solved') {
        const key = getCanonicalKey(p) || p.title?.toLowerCase();
        if (key && !seenKeys.has(key)) {
          seenKeys.add(key);
          solvedCount++;
        }
      }
    }

    const total = topicProblems.length > 0 ? topicProblems.length : 25;
    const percent = Math.round((solvedCount / total) * 100) || 0;

    return {
      id: def.id,
      name: def.name,
      category: def.category,
      total,
      solved: solvedCount,
      percent,
      problems: topicProblems
    };
  });
}

