import { Router } from 'express';
import { defaultSystemDesignData } from '../data/seedData.js';

const router = Router();

let sysDesignState = JSON.parse(JSON.stringify(defaultSystemDesignData));

router.get('/', (req, res) => {
  const totalTopics = sysDesignState.topics.length;
  const completedTopics = sysDesignState.topics.filter(t => t.completed).length;
  const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const payload = {
    percentage,
    completedTopics,
    totalTopics,
    topics: sysDesignState.topics,
    caseStudies: sysDesignState.caseStudies
  };

  res.json({
    success: true,
    ...payload,
    data: payload
  });
});

router.post('/topic/toggle', (req, res) => {
  const { topicId } = req.body;
  const topic = sysDesignState.topics.find(t => t.id === topicId);
  if (!topic) {
    return res.status(404).json({ success: false, message: 'Topic not found' });
  }

  topic.completed = !topic.completed;
  res.json({ success: true, topic });
});

router.post('/casestudy/status', (req, res) => {
  const { id, status } = req.body;
  const cs = sysDesignState.caseStudies.find(c => c.id === id);
  if (!cs) {
    return res.status(404).json({ success: false, message: 'Case study not found' });
  }

  cs.status = status;
  res.json({ success: true, caseStudy: cs });
});

export default router;
