import { memoryCache } from '../../cache/memoryCache.js';

/**
 * LeetCode API Adapter querying official GraphQL endpoint
 */
export async function getLeetCodeStats(username = '') {
  if (!username || username === 'unlinked' || username.trim() === '') {
    return {
      platform: 'leetcode',
      username: '',
      connected: false,
      problemsSolved: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      ranking: 'Unlinked',
      contestRating: 0,
      contestsAttended: 0,
      recentSubmissions: [],
      lastUpdated: new Date().toISOString(),
      status: 'unlinked',
      source: 'unlinked'
    };
  }

  const cacheKey = `lc_${username.toLowerCase()}`;
  const cached = memoryCache.get(cacheKey);

  if (cached && !cached.isStale) {
    return { ...cached.data, source: 'cache', cachedAt: cached.cachedAt };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({
        query: `
          query getUserProfile($username: String!) {
            matchedUser(username: $username) {
              username
              profile {
                ranking
                reputation
                starRating
              }
              submitStatsGlobal {
                acSubmissionNum {
                  difficulty
                  count
                }
              }
            }
            userContestRanking(username: $username) {
              rating
              globalRanking
              totalParticipants
              topPercentage
              attendedContestsCount
              badge {
                name
              }
            }
            userContestRankingHistory(username: $username) {
              attended
              rating
              ranking
              trendDirection
              problemsSolved
              contest {
                title
                startTime
              }
            }
            recentAcSubmissionList(username: $username, limit: 15) {
              id
              title
              titleSlug
              timestamp
            }
          }
        `,
        variables: { username }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`LeetCode GraphQL returned HTTP ${res.status}`);
    }

    const data = await res.json();
    const matchedUser = data?.data?.matchedUser;

    if (!matchedUser) {
      throw new Error(`LeetCode user "${username}" not found`);
    }

    const acStats = matchedUser.submitStatsGlobal?.acSubmissionNum || [];
    let totalSolved = 0;
    let easy = 0;
    let medium = 0;
    let hard = 0;

    for (const item of acStats) {
      if (item.difficulty === 'All') totalSolved = item.count;
      else if (item.difficulty === 'Easy') easy = item.count;
      else if (item.difficulty === 'Medium') medium = item.count;
      else if (item.difficulty === 'Hard') hard = item.count;
    }

    const contest = data?.data?.userContestRanking;
    const contestRating = contest?.rating ? Math.round(contest.rating) : 0;
    const ranking = matchedUser.profile?.ranking
      ? `#${matchedUser.profile.ranking.toLocaleString()}`
      : (contest?.topPercentage ? `Top ${contest.topPercentage}%` : 'Unranked');

    const contestHistory = (data?.data?.userContestRankingHistory || [])
      .filter(h => h.attended)
      .map(h => ({
        contestName: h.contest?.title || 'Weekly Contest',
        rating: Math.round(h.rating),
        ranking: h.ranking,
        problemsSolved: h.problemsSolved,
        trendDirection: h.trendDirection,
        date: new Date(Number(h.contest?.startTime) * 1000).toISOString().split('T')[0]
      }));

    const recentSubmissions = (data?.data?.recentAcSubmissionList || []).map(s => ({
      id: `lc_${s.id}`,
      title: s.title,
      platform: 'LeetCode',
      difficulty: 'Medium',
      topic: 'Algorithms',
      url: `https://leetcode.com/problems/${s.titleSlug}/`,
      status: 'Solved',
      revisionStatus: 'Done',
      revisionInterval: '7d',
      lastReviewed: new Date(Number(s.timestamp) * 1000).toISOString().split('T')[0],
      notes: `Synced from LeetCode account @${username}`
    }));

    const normalized = {
      platform: 'leetcode',
      username,
      connected: true,
      problemsSolved: totalSolved,
      easy,
      medium,
      hard,
      ranking,
      contestRating,
      contestBadge: contest?.badge?.name || (contestRating >= 2150 ? 'Guardian' : contestRating >= 1850 ? 'Knight' : null),
      topPercentage: contest?.topPercentage || null,
      globalRanking: contest?.globalRanking || null,
      contestsAttended: contest?.attendedContestsCount || contestHistory.length || 0,
      contestHistory,
      recentSubmissions,
      lastUpdated: new Date().toISOString(),
      status: 'synced',
      source: 'live'
    };

    memoryCache.set(cacheKey, normalized, 1800);
    return normalized;
  } catch (err) {
    if (cached) {
      return { ...cached.data, source: 'stale-cache', isStale: true };
    }

    return {
      platform: 'leetcode',
      username,
      connected: false,
      problemsSolved: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      ranking: 'Unranked',
      contestRating: 0,
      contestsAttended: 0,
      recentSubmissions: [],
      lastUpdated: new Date().toISOString(),
      status: 'error',
      source: 'error',
      warning: `Unable to fetch live LeetCode for "${username}". Verify handle.`
    };
  }
}
