import { Router } from 'express';
import { defaultWebDevData } from '../data/seedData.js';

const router = Router();

// In-memory state for web dev roadmaps and projects
let webDevState = JSON.parse(JSON.stringify(defaultWebDevData));

router.get('/', (req, res) => {
  // Calculate dynamic progress per roadmap
  const enrichedRoadmaps = webDevState.roadmaps.map(rm => {
    const total = rm.milestones.length;
    const completed = rm.milestones.filter(m => m.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      ...rm,
      total,
      completed,
      percentage
    };
  });

  const totalAll = enrichedRoadmaps.reduce((acc, r) => acc + r.total, 0);
  const completedAll = enrichedRoadmaps.reduce((acc, r) => acc + r.completed, 0);
  const overallPercentage = totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0;

  res.json({
    success: true,
    overallPercentage,
    completedAll,
    totalAll,
    roadmaps: enrichedRoadmaps,
    projects: webDevState.projects
  });
});

router.post('/milestone/toggle', (req, res) => {
  const { roadmapId, milestoneId } = req.body;
  const roadmap = webDevState.roadmaps.find(r => r.id === roadmapId);
  if (!roadmap) {
    return res.status(404).json({ success: false, message: 'Roadmap not found' });
  }

  const milestone = roadmap.milestones.find(m => m.id === milestoneId);
  if (!milestone) {
    return res.status(404).json({ success: false, message: 'Milestone not found' });
  }

  milestone.completed = !milestone.completed;
  res.json({ success: true, milestone, roadmapId });
});

router.post('/projects', (req, res) => {
  const { title, description, techStack, githubUrl, liveDemo, placementHighlight } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, message: 'Project title is required' });
  }

  const newProject = {
    id: `proj_${Date.now()}`,
    title,
    description: description || '',
    techStack: Array.isArray(techStack) ? techStack : (techStack ? techStack.split(',').map(s => s.trim()) : []),
    githubUrl: githubUrl || '',
    liveDemo: liveDemo || '',
    status: 'In Progress',
    evidence: {
      commits: 1,
      pullRequests: 0,
      issuesResolved: 0,
      stars: 0,
      forks: 0
    },
    placementHighlight: placementHighlight || 'Custom project evidence showcase.'
  };

  webDevState.projects.unshift(newProject);
  res.status(201).json({ success: true, project: newProject });
});

export default router;
