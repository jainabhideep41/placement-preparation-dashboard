/**
 * Placement Readiness Engine
 * Implements weighted multi-pillar calculation, weak-area detection, and recommendations.
 */
export function calculateReadiness({
  dsa = {},
  webDev = {},
  systemDesign = {},
  projects = [],
  github = {}
}) {
  // 1. DSA Score (35% weight)
  // Evaluates total solves (benchmark ~450+), difficulty distribution, and contest rating
  const lc = dsa.platforms?.leetcode || {};
  const cf = dsa.platforms?.codeforces || {};
  const totalSolves = (lc.problemsSolved || 0) + (cf.problemsSolved || 0);
  const solvesScore = Math.min(100, Math.round((totalSolves / 500) * 100));
  const ratingScore = cf.rating > 0 ? Math.min(100, Math.round((cf.rating / 1600) * 100)) : 0;
  const dsaScore = totalSolves > 0 ? Math.round(solvesScore * 0.7 + ratingScore * 0.3) : 0;

  // 2. Web Development Score (25% weight)
  // Evaluates milestone completions across Frontend, Backend, Databases, DevOps
  let totalMilestones = 0;
  let completedMilestones = 0;
  if (webDev.roadmaps && Array.isArray(webDev.roadmaps)) {
    for (const r of webDev.roadmaps) {
      if (r.milestones) {
        totalMilestones += r.milestones.length;
        completedMilestones += r.milestones.filter(m => m.completed).length;
      }
    }
  }
  const webDevScore = totalMilestones > 0 
    ? Math.round((completedMilestones / totalMilestones) * 100) 
    : 0;

  // 3. System Design Score (20% weight)
  // Evaluates topic milestones and case studies
  let sysTopicsTotal = 0;
  let sysTopicsCompleted = 0;
  if (systemDesign.topics && Array.isArray(systemDesign.topics)) {
    sysTopicsTotal = systemDesign.topics.length;
    sysTopicsCompleted = systemDesign.topics.filter(t => t.completed).length;
  }
  const sysScore = sysTopicsTotal > 0
    ? Math.round((sysTopicsCompleted / sysTopicsTotal) * 100)
    : 0;

  // 4. Projects Score (10% weight)
  // Evaluates completed projects with GitHub links and evidence
  const projectList = Array.isArray(projects) ? projects : (webDev.projects || []);
  const completedProjects = projectList.filter(p => p.status === 'Completed' || p.status === 'Production').length;
  const projectScore = Math.min(100, Math.round((completedProjects / 3) * 100));

  // 5. Developer Activity / GitHub (10% weight)
  const ghProfile = github.profile || {};
  const prs = ghProfile.mergedPullRequests || 0;
  const commits = ghProfile.totalCommitsLastYear || 0;
  const devScore = ghProfile.username 
    ? Math.min(100, Math.round((Math.min(prs, 15) / 15) * 50 + (Math.min(commits, 400) / 400) * 50))
    : 0;

  // Overall Weighted Score
  // Weights: DSA: 35%, WebDev: 25%, SysDesign: 20%, Projects: 10%, DeveloperActivity: 10%
  const overallScore = Math.round(
    dsaScore * 0.35 +
    webDevScore * 0.25 +
    sysScore * 0.20 +
    projectScore * 0.10 +
    devScore * 0.10
  );

  // Determine readiness status tier
  let status = 'Keep Preparing';
  let tierColor = 'amber';
  if (overallScore >= 85) {
    status = 'Highly Prepared';
    tierColor = 'emerald';
  } else if (overallScore >= 70) {
    status = 'Strong Preparation';
    tierColor = 'blue';
  } else if (overallScore < 50) {
    status = 'Needs Significant Preparation';
    tierColor = 'rose';
  }

  // Weak Area Engine
  const pillars = [
    { name: 'System Design', score: sysScore, weight: '20%' },
    { name: 'Developer Activity', score: devScore, weight: '10%' },
    { name: 'Web Development', score: webDevScore, weight: '25%' },
    { name: 'Projects', score: projectScore, weight: '10%' },
    { name: 'DSA', score: dsaScore, weight: '35%' }
  ];

  // Sort ascending to get weakest
  pillars.sort((a, b) => a.score - b.score);
  const weakestArea = pillars[0];
  const strongestArea = pillars[pillars.length - 1];

  // Actionable recommendations based on weaknesses
  const recommendations = [];
  if (sysScore < 70) {
    recommendations.push({
      pillar: 'System Design',
      action: 'Complete Distributed Systems Patterns & Token Bucket Rate Limiting case study',
      priority: 'High'
    });
    recommendations.push({
      pillar: 'System Design',
      action: 'Study L4 vs L7 Load Balancing and Consistent Hashing architecture',
      priority: 'Medium'
    });
  }
  if (dsaScore < 80 || (lc.hard || 0) < 50) {
    recommendations.push({
      pillar: 'DSA',
      action: 'Solve 10 Hard dynamic programming and graph problems on LeetCode',
      priority: 'High'
    });
  }
  if (webDevScore < 80) {
    recommendations.push({
      pillar: 'Web Development',
      action: 'Complete TypeScript Generics and Redis In-Memory Caching milestones',
      priority: 'Medium'
    });
  }
  if (devScore < 75) {
    recommendations.push({
      pillar: 'GitHub / FOSS',
      action: 'Submit 2 merged pull requests to open-source developer repositories',
      priority: 'Medium'
    });
  }

  return {
    overallScore,
    status,
    tierColor,
    weights: {
      dsa: 35,
      webDev: 25,
      systemDesign: 20,
      projects: 10,
      developerActivity: 10
    },
    breakdown: {
      dsa: { score: dsaScore, label: 'DSA Preparation', totalSolves },
      webDevelopment: { score: webDevScore, label: 'Web Development', completedMilestones, totalMilestones },
      systemDesign: { score: sysScore, label: 'System Design', completedTopics: sysTopicsCompleted, totalTopics: sysTopicsTotal },
      projects: { score: projectScore, label: 'Project Portfolio', completedProjects },
      developerActivity: { score: devScore, label: 'GitHub & FOSS Contributions', prs, commits }
    },
    weakestArea,
    strongestArea,
    recommendations: recommendations.slice(0, 4),
    calculatedAt: new Date().toISOString()
  };
}
