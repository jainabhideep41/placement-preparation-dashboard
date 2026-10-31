import { defaultDSAData } from '../../data/seedData.js';

export async function getHackerRankStats(username = '') {
  if (!username || username === 'unlinked' || username.trim() === '') {
    return {
      platform: 'hackerrank',
      username: '',
      connected: false,
      problemsSolved: 0,
      badges: [],
      score: 0,
      lastUpdated: new Date().toISOString(),
      status: 'unlinked',
      source: 'unlinked'
    };
  }

  return {
    ...defaultDSAData.platforms.hackerrank,
    username,
    source: 'normalized-profile',
    lastUpdated: new Date().toISOString()
  };
}
