/**
 * Placement Readiness Engine
 * Calibrated for specific target job roles and tech stack weightages.
 */

export const JOB_ROLES = {
  sde_tier1: {
    id: 'sde_tier1',
    title: 'Software Development Engineer (SDE-1 — FAANG & Tier-1)',
    aliases: ['sde-1', 'sde 1', 'faang', 'software engineer', 'tier-1', 'general'],
    weights: { dsa: 40, systemDesign: 25, webDev: 15, projects: 10, developerActivity: 10 },
    coreTechStack: ['C++ / Java', 'Dynamic Programming', 'Graph Algorithms', 'Microservices', 'Distributed Caching', 'Concurrency'],
    rationale: 'Top-tier tech placement interviews heavily prioritize algorithmic problem solving (40%) and system design foundations (25%).'
  },
  backend: {
    id: 'backend',
    title: 'Backend & Distributed Systems Engineer',
    aliases: ['backend', 'systems engineer', 'api engineer', 'distributed systems'],
    weights: { systemDesign: 30, webDev: 30, dsa: 20, projects: 15, developerActivity: 5 },
    coreTechStack: ['Node.js / Go', 'PostgreSQL / MySQL', 'Redis Caching', 'Apache Kafka', 'Docker', 'REST / gRPC APIs'],
    rationale: 'Backend roles require deep competency in scalable APIs, ACID database transactions, caching, and message broker architectures.'
  },
  frontend: {
    id: 'frontend',
    title: 'Frontend & Web Performance Engineer',
    aliases: ['frontend', 'ui engineer', 'react developer', 'web performance'],
    weights: { webDev: 40, projects: 25, dsa: 15, developerActivity: 10, systemDesign: 10 },
    coreTechStack: ['React 19', 'TypeScript', 'Next.js', 'Core Web Vitals (LCP/FID/CLS)', 'Tailwind CSS', 'State Architecture'],
    rationale: 'Frontend positions benchmark responsive component architecture, client performance, and production UI project execution.'
  },
  fullstack: {
    id: 'fullstack',
    title: 'Full-Stack Software Engineer',
    aliases: ['fullstack', 'full stack', 'full-stack', 'mern', 'web developer'],
    weights: { webDev: 35, projects: 25, dsa: 20, systemDesign: 10, developerActivity: 10 },
    coreTechStack: ['React', 'Node.js / Express', 'PostgreSQL / MongoDB', 'Redis', 'WebSockets', 'CI/CD Pipelines'],
    rationale: 'Full-stack engineering demands balanced end-to-end delivery from database modeling to responsive frontend interfaces.'
  },
  devops: {
    id: 'devops',
    title: 'DevOps & Site Reliability Engineer (SRE)',
    aliases: ['devops', 'sre', 'cloud engineer', 'infrastructure', 'platform engineer'],
    weights: { webDev: 35, systemDesign: 25, projects: 20, developerActivity: 10, dsa: 10 },
    coreTechStack: ['Docker Containerization', 'Kubernetes', 'GitHub Actions CI/CD', 'Prometheus / Grafana', 'AWS / Cloud', 'Linux'],
    rationale: 'DevOps roles prioritize infrastructure automation, container orchestration, CI/CD pipelines, and high-availability systems.'
  },
  data_ml: {
    id: 'data_ml',
    title: 'Data Engineer & ML Infrastructure',
    aliases: ['data', 'data engineer', 'machine learning', 'ml', 'analytics'],
    weights: { webDev: 35, dsa: 25, systemDesign: 20, projects: 15, developerActivity: 5 },
    coreTechStack: ['Python', 'PostgreSQL / B-Tree Indexing', 'Kafka Streaming', 'ETL Pipelines', 'Redis', 'Distributed Data Processing'],
    rationale: 'Data engineering emphasizes query optimization, streaming event architectures, database indexing, and algorithmic data manipulation.'
  }
};

export function getCalibratedRoleConfig(roleInput = '') {
  if (!roleInput) return JOB_ROLES.sde_tier1;
  const clean = roleInput.toLowerCase().trim();
  for (const role of Object.values(JOB_ROLES)) {
    if (role.id === clean || role.title.toLowerCase() === clean) return role;
    if (role.aliases?.some(alias => clean.includes(alias))) return role;
  }
  return JOB_ROLES.sde_tier1;
}

export function calculateReadiness({
  dsa = {},
  webDev = {},
  systemDesign = {},
  projects = [],
  github = {},
  targetRole = 'Software Development Engineer (SDE-1)',
  customWeights = null
}) {
  const calibratedRole = getCalibratedRoleConfig(targetRole);
  const W = customWeights || calibratedRole.weights;

  // 1. DSA Score (Benchmark: ~500 total solves, contest rating)
  const lc = dsa.platforms?.leetcode || {};
  const cf = dsa.platforms?.codeforces || {};
  const totalSolves = (lc.problemsSolved || 0) + (cf.problemsSolved || 0);
  const solvesScore = Math.min(100, Math.round((totalSolves / 500) * 100));
  const ratingScore = cf.rating > 0 ? Math.min(100, Math.round((cf.rating / 1600) * 100)) : 0;
  const dsaScore = totalSolves > 0 ? Math.round(solvesScore * 0.7 + ratingScore * 0.3) : 0;

  // 2. Web Development Score with Domain Role Calibration
  let totalMilestones = 0;
  let completedMilestones = 0;
  const roadmapScores = {};

  if (webDev.roadmaps && Array.isArray(webDev.roadmaps)) {
    for (const r of webDev.roadmaps) {
      if (r.milestones) {
        const total = r.milestones.length;
        const done = r.milestones.filter(m => m.completed).length;
        totalMilestones += total;
        completedMilestones += done;
        roadmapScores[r.id] = total > 0 ? Math.round((done / total) * 100) : 0;
      }
    }
  }

  // Weight webDev milestones according to job role
  let webDevScore = 0;
  if (calibratedRole.id === 'frontend') {
    webDevScore = Math.round((roadmapScores.frontend || 0) * 0.6 + (roadmapScores.devops || 0) * 0.2 + (roadmapScores.backend || 0) * 0.2);
  } else if (calibratedRole.id === 'backend') {
    webDevScore = Math.round((roadmapScores.backend || 0) * 0.45 + (roadmapScores.databases || 0) * 0.40 + (roadmapScores.devops || 0) * 0.15);
  } else if (calibratedRole.id === 'devops') {
    webDevScore = Math.round((roadmapScores.devops || 0) * 0.55 + (roadmapScores.backend || 0) * 0.25 + (roadmapScores.databases || 0) * 0.20);
  } else if (calibratedRole.id === 'data_ml') {
    webDevScore = Math.round((roadmapScores.databases || 0) * 0.60 + (roadmapScores.backend || 0) * 0.25 + (roadmapScores.devops || 0) * 0.15);
  } else {
    // Default balanced
    webDevScore = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
  }

  // 3. System Design Score
  let sysTopicsTotal = 0;
  let sysTopicsCompleted = 0;
  if (systemDesign.topics && Array.isArray(systemDesign.topics)) {
    sysTopicsTotal = systemDesign.topics.length;
    sysTopicsCompleted = systemDesign.topics.filter(t => t.completed).length;
  }
  const sysScore = sysTopicsTotal > 0
    ? Math.round((sysTopicsCompleted / sysTopicsTotal) * 100)
    : 0;

  // 4. Projects Score
  const projectList = Array.isArray(projects) ? projects : (webDev.projects || []);
  const completedProjects = projectList.filter(p => p.status === 'Completed' || p.status === 'Production').length;
  const projectScore = Math.min(100, Math.round((completedProjects / 3) * 100));

  // 5. Developer Activity / GitHub Score
  const ghProfile = github.profile || {};
  const prs = ghProfile.mergedPullRequests || 0;
  const commits = ghProfile.totalCommitsLastYear || 0;
  const devScore = ghProfile.username 
    ? Math.min(100, Math.round((Math.min(prs, 15) / 15) * 50 + (Math.min(commits, 400) / 400) * 50))
    : 0;

  // Calibrated Overall Score calculation using dynamic weights
  const devWeight = W.developerActivity !== undefined ? W.developerActivity : (W.devActivity || 0);
  const totalWeight = (W.dsa || 0) + (W.webDev || 0) + (W.systemDesign || 0) + (W.projects || 0) + devWeight || 100;
  const overallScore = Math.round(
    ((dsaScore * (W.dsa || 0)) +
     (webDevScore * (W.webDev || 0)) +
     (sysScore * (W.systemDesign || 0)) +
     (projectScore * (W.projects || 0)) +
     (devScore * devWeight)) / totalWeight
  );

  // Determine readiness status tier
  let status = 'Keep Preparing';
  let tierColor = 'amber';
  if (overallScore >= 85) {
    status = 'Highly Prepared (Tier-1)';
    tierColor = 'emerald';
  } else if (overallScore >= 70) {
    status = 'Strong Preparation';
    tierColor = 'blue';
  } else if (overallScore < 50) {
    status = 'Needs Significant Preparation';
    tierColor = 'rose';
  }

  // Multi-pillar breakdown
  const pillars = [
    { name: 'System Design', score: sysScore, weight: `${W.systemDesign}%` },
    { name: 'Developer Activity', score: devScore, weight: `${devWeight}%` },
    { name: 'Web Development', score: webDevScore, weight: `${W.webDev}%` },
    { name: 'Projects', score: projectScore, weight: `${W.projects}%` },
    { name: 'DSA', score: dsaScore, weight: `${W.dsa}%` }
  ];

  pillars.sort((a, b) => a.score - b.score);
  const weakestArea = pillars[0];
  const strongestArea = pillars[pillars.length - 1];

  // Role-calibrated targeted recommendations
  const recommendations = [];
  if (calibratedRole.id === 'backend' && sysScore < 80) {
    recommendations.push({
      pillar: 'System Design',
      action: 'Implement Distributed Caching with Redis and Kafka Message Queue idempotency',
      priority: 'High'
    });
  } else if (calibratedRole.id === 'frontend' && webDevScore < 80) {
    recommendations.push({
      pillar: 'Web Development',
      action: 'Benchmark Core Web Vitals (LCP < 2.5s, CLS < 0.1) and implement React code-splitting',
      priority: 'High'
    });
  } else if (calibratedRole.id === 'sde_tier1' && dsaScore < 85) {
    recommendations.push({
      pillar: 'DSA',
      action: 'Solve 15 Hard Dynamic Programming & Graph problems on LeetCode',
      priority: 'High'
    });
  }

  if (projectScore < 80) {
    recommendations.push({
      pillar: 'Projects',
      action: `Deploy a production ${calibratedRole.title} project with live demo and verified GitHub commits`,
      priority: 'High'
    });
  }

  if (sysScore < 70) {
    recommendations.push({
      pillar: 'System Design',
      action: 'Master Distributed Caching, B-Tree Sharding, and CAP Theorem trade-offs',
      priority: 'Medium'
    });
  }

  if (devScore < 70) {
    recommendations.push({
      pillar: 'GitHub / FOSS',
      action: 'Contribute 2 merged pull requests to open-source developer repositories',
      priority: 'Medium'
    });
  }

  return {
    overallScore,
    status,
    tierColor,
    calibratedRole: {
      id: calibratedRole.id,
      title: calibratedRole.title,
      weights: W,
      coreTechStack: calibratedRole.coreTechStack,
      rationale: calibratedRole.rationale
    },
    availableRoles: Object.values(JOB_ROLES).map(r => ({
      id: r.id,
      title: r.title,
      weights: r.weights,
      coreTechStack: r.coreTechStack
    })),
    weights: W,
    breakdown: {
      dsa: { score: dsaScore, label: 'DSA Preparation', totalSolves },
      webDevelopment: { score: webDevScore, label: 'Web Development', completedMilestones, totalMilestones, roadmapScores },
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
