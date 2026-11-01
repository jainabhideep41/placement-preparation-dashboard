import { Router } from 'express';
import { findUserByIdentifier, getUserByEmail } from '../data/userStore.js';
import { getLeetCodeStats } from '../services/dsa/leetcode.adapter.js';
import { getCodeforcesStats } from '../services/dsa/codeforces.adapter.js';
import { getGitHubStats } from '../services/github.service.js';
import { calculateReadiness } from '../services/readiness.service.js';
import { defaultDSAData, defaultWebDevData, defaultSystemDesignData } from '../data/seedData.js';

const router = Router();

router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Identifier is required' });
    }

    const matchedUser = findUserByIdentifier(identifier) || (req.query.email ? getUserByEmail(req.query.email) : null);

    // Determine coding handles from registered user or query overrides
    let lcUser = matchedUser?.handles?.leetcode || req.query.lc || '';
    let cfUser = matchedUser?.handles?.codeforces || req.query.cf || '';
    let ghUser = matchedUser?.handles?.github || req.query.gh || '';
    let displayName = matchedUser?.name || req.query.name || '';
    let targetRole = matchedUser?.targetRole || 'Software Development Engineer (SDE-1)';
    let avatarUrl = matchedUser?.avatarUrl || '';
    let isRegistered = Boolean(matchedUser);

    // If identifier is not registered and no specific handles were passed, treat identifier as CP handle
    if (!matchedUser && !lcUser && !cfUser && !ghUser) {
      lcUser = identifier;
      cfUser = identifier;
      ghUser = identifier;
      displayName = identifier;
    } else if (!displayName) {
      displayName = identifier;
    }

    // Fetch live statistics in parallel with graceful error fallbacks
    const [lcStats, cfStats, ghStats] = await Promise.all([
      lcUser ? getLeetCodeStats(lcUser).catch(() => ({ connected: false, platform: 'leetcode' })) : Promise.resolve({ connected: false, platform: 'leetcode' }),
      cfUser ? getCodeforcesStats(cfUser).catch(() => ({ connected: false, platform: 'codeforces' })) : Promise.resolve({ connected: false, platform: 'codeforces' }),
      ghUser ? getGitHubStats(ghUser).catch(() => ({ profile: {} })) : Promise.resolve({ profile: {} })
    ]);

    // Use GitHub avatar if student doesn't have a custom avatar
    if (ghStats?.profile?.avatarUrl && (!avatarUrl || avatarUrl.includes('ui-avatars.com'))) {
      avatarUrl = ghStats.profile.avatarUrl;
    }
    if (!displayName && ghStats?.profile?.name) {
      displayName = ghStats.profile.name;
    }
    if (!displayName) {
      displayName = identifier.charAt(0).toUpperCase() + identifier.slice(1);
    }
    if (!avatarUrl) {
      avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=111&color=fff`;
    }

    // Calculate dynamic readiness score
    const dsaPayload = {
      ...defaultDSAData,
      platforms: {
        ...defaultDSAData.platforms,
        leetcode: lcStats,
        codeforces: cfStats
      }
    };

    const readiness = calculateReadiness({
      dsa: dsaPayload,
      webDev: defaultWebDevData,
      systemDesign: defaultSystemDesignData,
      github: ghStats,
      targetRole: targetRole || req.query.role || 'Software Development Engineer (SDE-1)',
      customWeights: matchedUser?.customWeights || null
    });

    const showEmail = matchedUser?.privacy?.showEmail !== undefined ? Boolean(matchedUser.privacy.showEmail) : true;
    const showPhone = matchedUser?.privacy?.showPhone !== undefined ? Boolean(matchedUser.privacy.showPhone) : false;

    const publicProfile = {
      identifier,
      username: matchedUser?.username || identifier,
      isRegistered,
      name: displayName,
      targetRole,
      avatarUrl,
      email: showEmail ? (matchedUser?.email || null) : null,
      phone: showPhone ? (matchedUser?.phone || matchedUser?.academic?.phone || null) : null,
      privacy: {
        showEmail,
        showPhone
      },
      academic: matchedUser?.academic || {
        college: 'Chandigarh University',
        degree: 'B.Tech Computer Science & Engineering',
        branch: 'Computer Science',
        year: '2026 (Final Year)',
        cgpa: '8.85 / 10',
        desiredOption: targetRole,
        dreamCompanies: 'Google, Microsoft, Uber, Atlassian',
        workMode: 'Hybrid / Remote / On-site'
      },
      achievements: matchedUser?.achievements || matchedUser?.academic?.achievements || [],
      extracurriculars: matchedUser?.extracurriculars || matchedUser?.academic?.extracurriculars || [],
      class12: matchedUser?.class12 || matchedUser?.academic?.class12 || null,
      class10: matchedUser?.class10 || matchedUser?.academic?.class10 || null,
      bio: ghStats?.profile?.bio || `Aspiring ${targetRole} with verified competency across Data Structures, Algorithms, Distributed Systems, and Full-Stack Engineering.`,
      location: ghStats?.profile?.location || 'India',
      handles: {
        leetcode: lcUser || (lcStats.connected ? lcStats.username : ''),
        codeforces: cfUser || (cfStats.connected ? cfStats.username : ''),
        github: ghUser || (ghStats.profile?.username ? ghStats.profile.username : '')
      },
      readiness: {
        overallScore: readiness.overallScore,
        status: readiness.status,
        tierColor: readiness.tierColor,
        calibratedRole: readiness.calibratedRole,
        availableRoles: readiness.availableRoles,
        pillars: readiness.pillars,
        weakestArea: readiness.weakestArea,
        strongestArea: readiness.strongestArea,
        summary: readiness.summary
      },
      dsa: {
        totalSolves: (lcStats.problemsSolved || 0) + (cfStats.problemsSolved || 0),
        leetcode: {
          connected: lcStats.connected || false,
          username: lcStats.username || lcUser,
          problemsSolved: lcStats.problemsSolved || 0,
          easy: lcStats.easy || 0,
          medium: lcStats.medium || 0,
          hard: lcStats.hard || 0,
          ranking: lcStats.ranking || 'N/A',
          contestRating: lcStats.contestRating || 0,
          contestsAttended: lcStats.contestsAttended || 0,
          acceptanceRate: lcStats.acceptanceRate || 'N/A'
        },
        codeforces: {
          connected: cfStats.connected || false,
          username: cfStats.username || cfUser,
          problemsSolved: cfStats.problemsSolved || 0,
          rating: cfStats.rating || 0,
          maxRating: cfStats.maxRating || 0,
          rank: cfStats.rank || 'Unranked',
          maxRank: cfStats.maxRank || 'Unranked',
          contestsAttended: cfStats.contestsAttended || 0
        },
        curatedSheets: [
          { name: "Striver's SDE Sheet", total: 191, solved: Math.min(191, Math.round((lcStats.problemsSolved || 0) * 0.45)), percent: Math.min(100, Math.round((Math.min(191, Math.round((lcStats.problemsSolved || 0) * 0.45)) / 191) * 100)) },
          { name: "Blind 75 Essentials", total: 75, solved: Math.min(75, Math.round((lcStats.problemsSolved || 0) * 0.35)), percent: Math.min(100, Math.round((Math.min(75, Math.round((lcStats.problemsSolved || 0) * 0.35)) / 75) * 100)) },
          { name: "NeetCode 150 Core", total: 150, solved: Math.min(150, Math.round((lcStats.problemsSolved || 0) * 0.4)), percent: Math.min(100, Math.round((Math.min(150, Math.round((lcStats.problemsSolved || 0) * 0.4)) / 150) * 100)) }
        ]
      },
      github: {
        username: ghStats?.profile?.username || ghUser,
        publicRepos: ghStats?.profile?.publicRepos || 0,
        followers: ghStats?.profile?.followers || 0,
        totalCommitsLastYear: ghStats?.profile?.totalCommitsLastYear || 0,
        pullRequests: ghStats?.profile?.pullRequests || 0,
        mergedPullRequests: ghStats?.profile?.mergedPullRequests || 0,
        totalStars: ghStats?.profile?.totalStars || 0,
        calendar: ghStats?.calendar || null
      },
      projects: matchedUser?.projects || defaultWebDevData.projects,
      selectedResumeProjectIds: matchedUser?.selectedResumeProjectIds || null,
      experience: matchedUser?.experience || [],
      technicalSkills: matchedUser?.technicalSkills || null,
      systemDesign: {
        topicsTotal: defaultSystemDesignData.topics.length,
        coreFoundations: defaultSystemDesignData.topics.slice(0, 6).map(t => ({ id: t.id, name: t.name, category: t.category })),
        hldCaseStudiesCount: 10
      },
      webDevRoadmaps: defaultWebDevData.roadmaps.map(r => ({
        id: r.id,
        title: r.title,
        milestonesCount: r.milestones.length
      })),
      badges: [
        { label: "Verified PrepStack Candidate", icon: "ShieldCheck", color: "emerald" },
        { label: readiness.overallScore >= 80 ? "Tier-1 Ready (FAANG/Fintech)" : "Actively Preparing", icon: "Award", color: readiness.overallScore >= 80 ? "amber" : "blue" },
        ...(lcStats.problemsSolved > 100 ? [{ label: `${lcStats.problemsSolved}+ LeetCode Solves`, icon: "Code2", color: "purple" }] : []),
        ...(cfStats.rating > 0 ? [{ label: `CF Rating: ${cfStats.rating} (${cfStats.rank})`, icon: "TrendingUp", color: "indigo" }] : []),
        ...(ghStats?.profile?.totalCommitsLastYear > 50 ? [{ label: "Active Open-Source Contributor", icon: "GitCommit", color: "emerald" }] : [])
      ],
      canonicalUrl: `https://placement-preparation-dashboard-five.vercel.app/u/${encodeURIComponent(matchedUser?.username || identifier)}`,
      lastUpdated: new Date().toISOString()
    };

    return res.json({
      success: true,
      profile: publicProfile
    });
  } catch (error) {
    console.error('Error in profile route:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
