import { memoryCache } from '../../cache/memoryCache.js';

/**
 * Codeforces API Adapter with In-Memory Cache and Real Solved Problem Extraction
 */
export async function getCodeforcesStats(username = '') {
  if (!username || username === 'unlinked' || username.trim() === '') {
    return {
      platform: 'codeforces',
      username: '',
      connected: false,
      problemsSolved: 0,
      rating: 0,
      maxRating: 0,
      rank: 'unranked',
      maxRank: 'unranked',
      contestsAttended: 0,
      recentSubmissions: [],
      lastUpdated: new Date().toISOString(),
      status: 'unlinked',
      source: 'unlinked'
    };
  }

  const cacheKey = `cf_${username.toLowerCase()}`;
  const cached = memoryCache.get(cacheKey);

  if (cached && !cached.isStale) {
    return { ...cached.data, source: 'cache', cachedAt: cached.cachedAt };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const [userInfoRes, userStatusRes, userRatingRes] = await Promise.all([
      fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(username)}`, {
        signal: controller.signal
      }),
      fetch(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(username)}&from=1&count=200`, {
        signal: controller.signal
      }),
      fetch(`https://codeforces.com/api/user.rating?handle=${encodeURIComponent(username)}`, {
        signal: controller.signal
      }).catch(() => null)
    ]);

    clearTimeout(timeoutId);

    if (!userInfoRes.ok || !userStatusRes.ok) {
      throw new Error(`Codeforces API responded with HTTP error`);
    }

    const userInfo = await userInfoRes.json();
    const userStatus = await userStatusRes.json();
    let ratingHistory = [];

    function safeIsoDate(ts) {
      if (!ts) return new Date().toISOString().split('T')[0];
      const num = Number(ts);
      if (isNaN(num) || num <= 0) return new Date().toISOString().split('T')[0];
      const ms = num < 1e11 ? num * 1000 : num;
      const d = new Date(ms);
      return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0];
    }

    if (userRatingRes && userRatingRes.ok) {
      try {
        const ratingData = await userRatingRes.json();
        if (ratingData.status === 'OK' && Array.isArray(ratingData.result)) {
          ratingHistory = ratingData.result.map(r => ({
            contestId: r.contestId,
            contestName: r.contestName,
            rank: r.rank,
            rating: r.newRating,
            oldRating: r.oldRating,
            delta: r.newRating - r.oldRating,
            date: safeIsoDate(r.ratingUpdateTimeSeconds)
          }));
        }
      } catch (e) {
        // non-blocking
      }
    }

    if (userInfo.status !== 'OK' || !userInfo.result?.[0]) {
      throw new Error(`Codeforces user "${username}" not found`);
    }

    const user = userInfo.result[0];

    // Calculate unique solved problems and extract problem details
    const solvedSet = new Set();
    const recentSubmissions = [];
    const submissions = userStatus.result || [];

    for (const sub of submissions) {
      if (sub.verdict === 'OK' && sub.problem) {
        const id = `${sub.problem.contestId || 'gym'}_${sub.problem.index}`;
        if (!solvedSet.has(id)) {
          solvedSet.add(id);
          const rating = sub.problem.rating || 1200;
          const difficulty = rating < 1300 ? 'Easy' : rating <= 1700 ? 'Medium' : 'Hard';
          const topic = sub.problem.tags?.[0]
            ? sub.problem.tags[0].charAt(0).toUpperCase() + sub.problem.tags[0].slice(1)
            : 'Algorithms';

          if (recentSubmissions.length < 15) {
            recentSubmissions.push({
              id: `cf_${id}`,
              title: sub.problem.name,
              platform: 'Codeforces',
              difficulty,
              topic,
              url: sub.problem.contestId
                ? `https://codeforces.com/problemset/problem/${sub.problem.contestId}/${sub.problem.index}`
                : `https://codeforces.com/problemsets/acmsguru/problem/99999/${sub.problem.index}`,
              status: 'Solved',
              revisionStatus: 'Done',
              revisionInterval: difficulty === 'Hard' ? '3d' : '7d',
              lastReviewed: safeIsoDate(sub.creationTimeSeconds),
              notes: `Rating: ${rating} | Tags: ${sub.problem.tags?.join(', ') || 'None'}`
            });
          }
        }
      }
    }

    const normalized = {
      platform: 'codeforces',
      username: user.handle,
      connected: true,
      problemsSolved: solvedSet.size,
      rating: user.rating || 0,
      maxRating: user.maxRating || user.rating || 0,
      rank: user.rank || 'unranked',
      maxRank: user.maxRank || user.rank || 'unranked',
      contestsAttended: ratingHistory.length || Math.max(user.rating ? 1 : 0, Math.round(solvedSet.size / 15)),
      ratingHistory,
      recentSubmissions,
      lastUpdated: new Date().toISOString(),
      status: 'synced',
      source: 'live'
    };

    memoryCache.set(cacheKey, normalized, 1800); // 30 min TTL
    return normalized;
  } catch (err) {
    if (cached) {
      return { ...cached.data, source: 'stale-cache', isStale: true };
    }

    return {
      platform: 'codeforces',
      username,
      connected: false,
      problemsSolved: 0,
      rating: 0,
      maxRating: 0,
      rank: 'unranked',
      maxRank: 'unranked',
      contestsAttended: 0,
      recentSubmissions: [],
      lastUpdated: new Date().toISOString(),
      status: 'error',
      source: 'error',
      warning: `Unable to fetch live Codeforces for "${username}". Verify handle.`
    };
  }
}
