export async function getAtCoderStats(username = '') {
  if (!username || username === 'unlinked' || username.trim() === '') {
    return {
      platform: 'atcoder',
      username: '',
      connected: false,
      problemsSolved: 0,
      rating: 0,
      maxRating: 0,
      rank: 'unranked',
      contestsAttended: 0,
      lastUpdated: new Date().toISOString(),
      status: 'unlinked',
      source: 'unlinked'
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`https://kenkoooo.com/atcoder/atcoder-api/v3/user/info?user=${encodeURIComponent(username)}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        platform: 'atcoder',
        username,
        connected: true,
        problemsSolved: data.accepted_count || 0,
        rating: data.rating || 0,
        maxRating: data.highest_rating || 0,
        rank: data.rating >= 1200 ? 'Cyan' : data.rating >= 800 ? 'Green' : 'Brown',
        contestsAttended: data.rated_matches || 0,
        lastUpdated: new Date().toISOString(),
        status: 'synced',
        source: 'live'
      };
    }
  } catch (e) {
    // Ignore and fallback gracefully
  }

  return {
    platform: 'atcoder',
    username,
    connected: false,
    problemsSolved: 0,
    rating: 0,
    maxRating: 0,
    rank: 'unranked',
    contestsAttended: 0,
    lastUpdated: new Date().toISOString(),
    status: 'unlinked',
    source: 'unlinked'
  };
}
