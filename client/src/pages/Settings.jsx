import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Trash2, 
  RotateCcw, 
  Save, 
  Check, 
  User, 
  Globe, 
  ShieldAlert,
  Database,
  Code2,
  Trophy,
  GitBranch,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Share2,
  Copy,
  UserCheck,
  GraduationCap,
  Building2,
  Calendar,
  Briefcase,
  Phone,
  Mail,
  Eye,
  EyeOff,
  Shield,
  Users,
  Plus,
  FileText,
  Layers,
  Cpu,
  FolderGit2,
  BookmarkCheck
} from 'lucide-react';
import { useLocalCache } from '../hooks/useLocalCache';
import { saveUserToRegistry } from '../utils/accountManager';

const DEFAULT_TECHNICAL_SKILLS = {
  languages: 'C/C++, Java, Python, JavaScript (ES6+), TypeScript, SQL, HTML5/CSS3',
  frameworks: 'React 19, Next.js, Node.js, Express.js, Tailwind CSS, RESTful APIs, WebSockets',
  developerTools: 'Git, GitHub Actions, Docker, Linux/Unix, Postman, Vite, Vercel',
  databases: 'PostgreSQL, Redis (In-Memory Caching), MongoDB, MySQL',
  coreConcepts: 'Data Structures & Algorithms, High-Level System Design (HLD), Low-Level Design (LLD), Microservices, Concurrency'
};

const DEFAULT_PLATFORM_PROJECTS = [
  {
    id: 'proj_prepstack',
    title: 'PrepStack — Placement Readiness & Developer Portfolio Engine',
    techStack: 'React 19, Node.js, Express, Tailwind CSS, Redis',
    githubUrl: 'https://github.com/jainabhideep41/placement-preparation-dashboard',
    liveDemo: 'https://prepstack.dev',
    date: '2024 -- Present',
    bulletsText: 'Engineered an enterprise-grade placement readiness dashboard unifying multi-platform coding analytics across LeetCode, Codeforces, and GitHub.\nArchitected an in-memory canonical resolver and universal search index covering 365+ DSA problems, 16 System Design topics, and Full-Stack roadmaps.\nImplemented resilient local cache synchronization with zero-downtime offline fallbacks and sub-500ms Vite SPA builds.'
  },
  {
    id: 'proj_flashdrop',
    title: 'FlashDrop — High-Concurrency Flash Sale & Inventory Engine',
    techStack: 'Node.js, Redis, Apache Kafka, PostgreSQL, Docker',
    githubUrl: 'https://github.com/jainabhideep41/flash-sale-engine',
    liveDemo: 'https://flashdrop.app',
    date: '2023 -- 2024',
    bulletsText: 'Benchmarked at 15,000+ orders/sec with zero overselling using Redis atomic Lua decrements and optimistic database locking.\nDecoupled order ingestion from database persistence using Apache Kafka streaming, reducing peak latency by 72%.\nContainerized multi-service architecture using Docker Compose and orchestrated automated CI/CD deployment pipelines.'
  },
  {
    id: 'proj_algostream',
    title: 'AlgoStream — Real-Time Collaborative Coding & Sandbox',
    techStack: 'TypeScript, WebSockets, WebRTC, Docker, Node.js',
    githubUrl: 'https://github.com/jainabhideep41/algostream-sandbox',
    liveDemo: 'https://algostream.dev',
    date: '2023 -- 2023',
    bulletsText: 'Constructed isolated containerized sandbox workers to securely compile and execute user-submitted C++, Python, and Java code under 250ms.\nSynchronized operational transformation (OT) for simultaneous multi-user code editing with sub-50ms peer latency using WebSockets.\nDesigned real-time test runner with automated edge-case assertion harness and memory-limit protection.'
  },
  {
    id: 'proj_distributed_cache',
    title: 'Distributed KV-Store — Raft Consensus & Persistent Log Storage',
    techStack: 'Go, gRPC, Protocol Buffers, Raft Consensus, LevelDB',
    githubUrl: 'https://github.com/jainabhideep41/raft-kv-store',
    liveDemo: '',
    date: '2023 -- 2023',
    bulletsText: 'Implemented Raft consensus algorithm from scratch with leader election, log replication, and heartbeat fault tolerance.\nEngineered high-throughput persistent key-value engine using Log-Structured Merge (LSM) trees and bloom filters for O(1) reads.\nAchieved linearizable read/write consistency validated against Jepsen network partition test suites.'
  }
];

export function Settings({ onRefreshAll }) {
  const [currentUser] = useLocalCache('prep_auth_user', null);
  const [handles, setHandles] = useLocalCache('prep_user_handles', {
    codeforces: '',
    leetcode: '',
    github: ''
  });

  const [cfInput, setCfInput] = useState(handles.codeforces || '');
  const [lcInput, setLcInput] = useState(handles.leetcode || '');
  const [ghInput, setGhInput] = useState(handles.github || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [cacheMessage, setCacheMessage] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [profileCopied, setProfileCopied] = useState(false);

  // Candidate Academic Profile & Target Role States
  const [usernameInput, setUsernameInput] = useState(
    currentUser?.username || currentUser?.email?.split('@')[0]?.replace(/[^a-z0-9_-]/gi, '') || ''
  );
  const [nameInput, setNameInput] = useState(currentUser?.name || '');
  const [targetRoleInput, setTargetRoleInput] = useState(
    currentUser?.targetRole || 'Software Development Engineer (SDE-1 — FAANG & Tier-1)'
  );
  const [collegeInput, setCollegeInput] = useState(currentUser?.academic?.college || 'Chandigarh University');
  const [degreeInput, setDegreeInput] = useState(currentUser?.academic?.degree || 'B.Tech Computer Science & Engineering');
  const [yearInput, setYearInput] = useState(currentUser?.academic?.year || '2026 (Final Year)');
  const [cgpaInput, setCgpaInput] = useState(currentUser?.academic?.cgpa || '8.85 / 10');
  const [dreamCompaniesInput, setDreamCompaniesInput] = useState(currentUser?.academic?.dreamCompanies || 'Google, Microsoft, Uber, Atlassian');
  const [workModeInput, setWorkModeInput] = useState(currentUser?.academic?.workMode || 'Hybrid / Remote / On-site');

  // Contact Information & Privacy Visibility States
  const [phoneInput, setPhoneInput] = useState(
    currentUser?.phone || currentUser?.academic?.phone || ''
  );
  const [emailInput, setEmailInput] = useState(
    currentUser?.email || ''
  );
  const [showEmailPublicly, setShowEmailPublicly] = useState(
    currentUser?.privacy?.showEmail !== undefined ? Boolean(currentUser.privacy.showEmail) : true
  );
  const [showPhonePublicly, setShowPhonePublicly] = useState(
    currentUser?.privacy?.showPhone !== undefined ? Boolean(currentUser.privacy.showPhone) : false
  );

  // Resume Sections: Achievements & Extracurriculars
  const [achievementsInput, setAchievementsInput] = useState(() => {
    const ach = currentUser?.achievements || currentUser?.academic?.achievements;
    if (Array.isArray(ach)) return ach.join('\n');
    return ach || '';
  });
  const [extracurricularsInput, setExtracurricularsInput] = useState(() => {
    const extra = currentUser?.extracurriculars || currentUser?.academic?.extracurriculars;
    if (Array.isArray(extra)) return extra.join('\n');
    return extra || '';
  });

  // Secondary & Higher Secondary Education (10th & 12th)
  const [class12School, setClass12School] = useState(
    currentUser?.class12?.school || currentUser?.academic?.class12?.school || ''
  );
  const [class12Board, setClass12Board] = useState(
    currentUser?.class12?.board || currentUser?.academic?.class12?.board || 'CBSE'
  );
  const [class12Year, setClass12Year] = useState(
    currentUser?.class12?.year || currentUser?.academic?.class12?.year || '2022'
  );
  const [class12Score, setClass12Score] = useState(
    currentUser?.class12?.score || currentUser?.academic?.class12?.score || '92.4%'
  );

  const [class10School, setClass10School] = useState(
    currentUser?.class10?.school || currentUser?.academic?.class10?.school || ''
  );
  const [class10Board, setClass10Board] = useState(
    currentUser?.class10?.board || currentUser?.academic?.class10?.board || 'CBSE'
  );
  const [class10Year, setClass10Year] = useState(
    currentUser?.class10?.year || currentUser?.academic?.class10?.year || '2020'
  );
  const [class10Score, setClass10Score] = useState(
    currentUser?.class10?.score || currentUser?.academic?.class10?.score || '94.8%'
  );

  // Work Experience & Internships
  const [experiences, setExperiences] = useState(() => {
    if (Array.isArray(currentUser?.experience) && currentUser.experience.length > 0) {
      return currentUser.experience.map(exp => ({
        ...exp,
        bulletsText: Array.isArray(exp.bullets) ? exp.bullets.join('\n') : (exp.bullets || '')
      }));
    }
    return [
      {
        id: 'exp_default_1',
        role: 'Software Development Engineer Intern',
        company: 'InnovateTech Labs',
        location: 'Bengaluru, India (Hybrid)',
        duration: 'June 2024 -- Aug 2024',
        bulletsText: `Engineered high-throughput REST API endpoints in Node.js & PostgreSQL, handling 2.5M+ requests/day\nOptimized query execution paths and added Redis caching layer, slashing p99 latency from 320ms to 48ms\nIntegrated CI/CD testing workflows using GitHub Actions and containerized microservices with Docker`
      }
    ];
  });

  // Technical Skills Pillars
  const [techLanguages, setTechLanguages] = useState(
    currentUser?.technicalSkills?.languages || DEFAULT_TECHNICAL_SKILLS.languages
  );
  const [techFrameworks, setTechFrameworks] = useState(
    currentUser?.technicalSkills?.frameworks || DEFAULT_TECHNICAL_SKILLS.frameworks
  );
  const [techDatabases, setTechDatabases] = useState(
    currentUser?.technicalSkills?.databases || DEFAULT_TECHNICAL_SKILLS.databases
  );
  const [techTools, setTechTools] = useState(
    currentUser?.technicalSkills?.developerTools || DEFAULT_TECHNICAL_SKILLS.developerTools
  );
  const [techCoreConcepts, setTechCoreConcepts] = useState(
    currentUser?.technicalSkills?.coreConcepts || DEFAULT_TECHNICAL_SKILLS.coreConcepts
  );

  // Projects Hub & Resume Selection
  const [projectsList, setProjectsList] = useState(() => {
    if (Array.isArray(currentUser?.projects) && currentUser.projects.length > 0) {
      return currentUser.projects.map(p => ({
        ...p,
        bulletsText: Array.isArray(p.bullets) ? p.bullets.join('\n') : (p.bullets || p.bulletsText || '')
      }));
    }
    return DEFAULT_PLATFORM_PROJECTS;
  });

  const [selectedResumeProjectIds, setSelectedResumeProjectIds] = useState(() => {
    if (Array.isArray(currentUser?.selectedResumeProjectIds) && currentUser.selectedResumeProjectIds.length > 0) {
      return currentUser.selectedResumeProjectIds;
    }
    return ['proj_prepstack', 'proj_flashdrop'];
  });

  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    techStack: '',
    githubUrl: '',
    liveDemo: '',
    date: '2024 -- Present',
    bulletsText: ''
  });

  const [academicSavedSuccess, setAcademicSavedSuccess] = useState(false);
  const [academicError, setAcademicError] = useState('');

  // Resend email state for settings
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendFeedback, setResendFeedback] = useState('');

  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  React.useEffect(() => {
    if (currentUser?.username) {
      setUsernameInput(currentUser.username);
    } else if (currentUser?.email) {
      setUsernameInput(currentUser.email.split('@')[0].replace(/[^a-z0-9_-]/gi, '').toLowerCase());
    }
    if (currentUser?.name) setNameInput(currentUser.name);
    if (currentUser?.email) setEmailInput(currentUser.email);
    if (currentUser?.phone !== undefined) {
      setPhoneInput(currentUser.phone);
    } else if (currentUser?.academic?.phone) {
      setPhoneInput(currentUser.academic.phone);
    }
    if (currentUser?.privacy?.showEmail !== undefined) {
      setShowEmailPublicly(Boolean(currentUser.privacy.showEmail));
    }
    if (currentUser?.privacy?.showPhone !== undefined) {
      setShowPhonePublicly(Boolean(currentUser.privacy.showPhone));
    }
    if (currentUser?.targetRole) setTargetRoleInput(currentUser.targetRole);
    if (currentUser?.academic) {
      if (currentUser.academic.college) setCollegeInput(currentUser.academic.college);
      if (currentUser.academic.degree) setDegreeInput(currentUser.academic.degree);
      if (currentUser.academic.year) setYearInput(currentUser.academic.year);
      if (currentUser.academic.cgpa) setCgpaInput(currentUser.academic.cgpa);
      if (currentUser.academic.dreamCompanies) setDreamCompaniesInput(currentUser.academic.dreamCompanies);
      if (currentUser.academic.workMode) setWorkModeInput(currentUser.academic.workMode);
    }
    const ach = currentUser?.achievements || currentUser?.academic?.achievements;
    if (ach !== undefined) {
      setAchievementsInput(Array.isArray(ach) ? ach.join('\n') : (ach || ''));
    }
    const extra = currentUser?.extracurriculars || currentUser?.academic?.extracurriculars;
    if (extra !== undefined) {
      setExtracurricularsInput(Array.isArray(extra) ? extra.join('\n') : (extra || ''));
    }

    // Synchronize Class 12 & 10
    const c12 = currentUser?.class12 || currentUser?.academic?.class12;
    if (c12) {
      if (c12.school !== undefined) setClass12School(c12.school);
      if (c12.board !== undefined) setClass12Board(c12.board);
      if (c12.year !== undefined) setClass12Year(c12.year);
      if (c12.score !== undefined) setClass12Score(c12.score);
    }
    const c10 = currentUser?.class10 || currentUser?.academic?.class10;
    if (c10) {
      if (c10.school !== undefined) setClass10School(c10.school);
      if (c10.board !== undefined) setClass10Board(c10.board);
      if (c10.year !== undefined) setClass10Year(c10.year);
      if (c10.score !== undefined) setClass10Score(c10.score);
    }

    // Synchronize Experience
    if (Array.isArray(currentUser?.experience) && currentUser.experience.length > 0) {
      setExperiences(currentUser.experience.map(exp => ({
        ...exp,
        bulletsText: Array.isArray(exp.bullets) ? exp.bullets.join('\n') : (exp.bullets || '')
      })));
    }

    // Synchronize Technical Skills
    if (currentUser?.technicalSkills) {
      if (currentUser.technicalSkills.languages) setTechLanguages(currentUser.technicalSkills.languages);
      if (currentUser.technicalSkills.frameworks) setTechFrameworks(currentUser.technicalSkills.frameworks);
      if (currentUser.technicalSkills.databases) setTechDatabases(currentUser.technicalSkills.databases);
      if (currentUser.technicalSkills.developerTools) setTechTools(currentUser.technicalSkills.developerTools);
      if (currentUser.technicalSkills.coreConcepts) setTechCoreConcepts(currentUser.technicalSkills.coreConcepts);
    }

    // Synchronize Projects & Selection
    if (Array.isArray(currentUser?.projects) && currentUser.projects.length > 0) {
      setProjectsList(currentUser.projects.map(p => ({
        ...p,
        bulletsText: Array.isArray(p.bullets) ? p.bullets.join('\n') : (p.bullets || p.bulletsText || '')
      })));
    }
    if (Array.isArray(currentUser?.selectedResumeProjectIds) && currentUser.selectedResumeProjectIds.length > 0) {
      setSelectedResumeProjectIds(currentUser.selectedResumeProjectIds);
    }
  }, [currentUser]);

  // Experience Handlers
  const handleAddExperience = () => {
    const newId = `exp_${Date.now()}`;
    setExperiences(prev => [
      ...prev,
      {
        id: newId,
        role: '',
        company: '',
        location: '',
        duration: '',
        bulletsText: ''
      }
    ]);
  };

  const handleRemoveExperience = (id) => {
    setExperiences(prev => prev.filter(e => e.id !== id));
  };

  const handleUpdateExperience = (id, field, value) => {
    setExperiences(prev => prev.map(e => (e.id === id ? { ...e, [field]: value } : e)));
  };

  // Technical Skills Handlers
  const handleResetSkills = () => {
    setTechLanguages(DEFAULT_TECHNICAL_SKILLS.languages);
    setTechFrameworks(DEFAULT_TECHNICAL_SKILLS.frameworks);
    setTechDatabases(DEFAULT_TECHNICAL_SKILLS.databases);
    setTechTools(DEFAULT_TECHNICAL_SKILLS.developerTools);
    setTechCoreConcepts(DEFAULT_TECHNICAL_SKILLS.coreConcepts);
  };

  // Projects Handlers
  const handleToggleResumeProject = (id) => {
    setSelectedResumeProjectIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(pId => pId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleAddCustomProject = () => {
    if (!newProject.title.trim()) {
      alert('Please enter a project title.');
      return;
    }
    const newId = `proj_custom_${Date.now()}`;
    const createdProject = {
      id: newId,
      title: newProject.title.trim(),
      techStack: newProject.techStack.trim() || 'React, Node.js, Express',
      githubUrl: newProject.githubUrl.trim(),
      liveDemo: newProject.liveDemo.trim(),
      date: newProject.date.trim() || '2024',
      bulletsText: newProject.bulletsText.trim() || 'Engineered responsive web application with modular component architecture and RESTful APIs.'
    };
    setProjectsList(prev => [createdProject, ...prev]);
    setSelectedResumeProjectIds(prev => [...prev, newId]);
    setNewProject({
      title: '',
      techStack: '',
      githubUrl: '',
      liveDemo: '',
      date: '2024 -- Present',
      bulletsText: ''
    });
    setIsAddingProject(false);
  };

  const handleRemoveProject = (id) => {
    setProjectsList(prev => prev.filter(p => p.id !== id));
    setSelectedResumeProjectIds(prev => prev.filter(pId => pId !== id));
  };

  const handleUpdateProject = (id, field, value) => {
    setProjectsList(prev => prev.map(p => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleResetProjects = () => {
    setProjectsList(DEFAULT_PLATFORM_PROJECTS);
    setSelectedResumeProjectIds(['proj_prepstack', 'proj_flashdrop']);
  };

  const handleResendFromSettings = async () => {
    if (!currentUser?.email) return;
    setResendLoading(true);
    setResendFeedback('');
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResendCooldown(data.cooldownSeconds || 30);
        setResendFeedback(`Verification email resent to ${currentUser.email}!`);
      } else {
        setResendFeedback(data.message || 'Please wait before requesting again.');
        if (data.remainingCooldown) setResendCooldown(data.remainingCooldown);
      }
    } catch (e) {
      setResendFeedback('Could not connect to server.');
    } finally {
      setResendLoading(false);
      setTimeout(() => setResendFeedback(''), 4000);
    }
  };

  const handleSaveAcademicProfile = async (e) => {
    if (e) e.preventDefault();
    setAcademicError('');
    setAcademicSavedSuccess(false);

    const cleanUsername = usernameInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanUsername) {
      setAcademicError('Username cannot be empty and must be alphanumeric.');
      return;
    }

    const updatedPrivacy = {
      showEmail: Boolean(showEmailPublicly),
      showPhone: Boolean(showPhonePublicly)
    };

    const achievementsList = achievementsInput
      .split('\n')
      .map(s => s.trim().replace(/^[-*•]\s*/, ''))
      .filter(Boolean);

    const extracurricularsList = extracurricularsInput
      .split('\n')
      .map(s => s.trim().replace(/^[-*•]\s*/, ''))
      .filter(Boolean);

    const class12Obj = (class12School.trim() || class12Score.trim()) ? {
      school: class12School.trim(),
      board: class12Board.trim(),
      year: class12Year.trim(),
      score: class12Score.trim()
    } : null;

    const class10Obj = (class10School.trim() || class10Score.trim()) ? {
      school: class10School.trim(),
      board: class10Board.trim(),
      year: class10Year.trim(),
      score: class10Score.trim()
    } : null;

    const formattedExperience = experiences.map(exp => ({
      id: exp.id || `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      role: (exp.role || '').trim(),
      company: (exp.company || '').trim(),
      location: (exp.location || '').trim(),
      duration: (exp.duration || '').trim(),
      bullets: (exp.bulletsText || '').split('\n').map(s => s.trim().replace(/^[-*•]\s*/, '')).filter(Boolean)
    })).filter(exp => exp.role || exp.company);

    const formattedTechnicalSkills = {
      languages: techLanguages.trim(),
      frameworks: techFrameworks.trim(),
      databases: techDatabases.trim(),
      developerTools: techTools.trim(),
      coreConcepts: techCoreConcepts.trim()
    };

    const formattedProjects = projectsList.map(p => ({
      id: p.id || `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: (p.title || '').trim(),
      techStack: (p.techStack || '').trim(),
      githubUrl: (p.githubUrl || '').trim(),
      liveDemo: (p.liveDemo || '').trim(),
      date: (p.date || '').trim(),
      bullets: (p.bulletsText || '').split('\n').map(s => s.trim().replace(/^[-*•]\s*/, '')).filter(Boolean)
    })).filter(p => p.title);

    const updatedAcademic = {
      college: collegeInput.trim(),
      degree: degreeInput.trim(),
      year: yearInput.trim(),
      cgpa: cgpaInput.trim(),
      desiredOption: targetRoleInput,
      dreamCompanies: dreamCompaniesInput.trim(),
      workMode: workModeInput,
      phone: phoneInput.trim(),
      achievements: achievementsList,
      extracurriculars: extracurricularsList,
      class12: class12Obj,
      class10: class10Obj
    };

    // 1. Save locally in registry & prep_auth_user
    if (currentUser?.email) {
      const currentHandles = {
        codeforces: cfInput.trim() || handles.codeforces || currentUser.handles?.codeforces || '',
        leetcode: lcInput.trim() || handles.leetcode || currentUser.handles?.leetcode || '',
        github: ghInput.trim() || handles.github || currentUser.handles?.github || ''
      };

      saveUserToRegistry({
        ...currentUser,
        email: emailInput.trim() || currentUser.email,
        phone: phoneInput.trim(),
        privacy: updatedPrivacy,
        username: cleanUsername,
        name: nameInput.trim() || currentUser.name,
        targetRole: targetRoleInput,
        handles: currentHandles,
        academic: updatedAcademic,
        achievements: achievementsList,
        extracurriculars: extracurricularsList,
        class12: class12Obj,
        class10: class10Obj,
        experience: formattedExperience,
        technicalSkills: formattedTechnicalSkills,
        projects: formattedProjects,
        selectedResumeProjectIds: selectedResumeProjectIds
      }, true);

      // 2. Sync to backend API
      try {
        const res = await fetch('/api/auth/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: currentUser.email,
            phone: phoneInput.trim(),
            privacy: updatedPrivacy,
            username: cleanUsername,
            name: nameInput.trim() || currentUser.name,
            targetRole: targetRoleInput,
            handles: currentHandles,
            academic: updatedAcademic,
            achievements: achievementsList,
            extracurriculars: extracurricularsList,
            class12: class12Obj,
            class10: class10Obj,
            experience: formattedExperience,
            technicalSkills: formattedTechnicalSkills,
            projects: formattedProjects,
            selectedResumeProjectIds: selectedResumeProjectIds
          })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to update profile on server');
        }
      } catch (err) {
        console.warn('Backend sync fallback:', err.message);
      }
    }

    setAcademicSavedSuccess(true);
    setTimeout(() => setAcademicSavedSuccess(false), 3500);
    if (onRefreshAll) onRefreshAll();
  };

  const handleSaveHandles = async (e) => {
    if (e) e.preventDefault();
    setSyncing(true);
    const newHandles = {
      codeforces: cfInput.trim(),
      leetcode: lcInput.trim(),
      github: ghInput.trim()
    };
    setHandles(newHandles);

    if (currentUser?.email) {
      const updatedUser = {
        ...currentUser,
        handles: newHandles
      };
      saveUserToRegistry(updatedUser, true);

      try {
        await Promise.all([
          fetch('/api/auth/complete-onboarding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: currentUser.email,
              handles: newHandles,
              targetRole: currentUser.targetRole
            })
          }),
          fetch('/api/auth/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: currentUser.email,
              username: currentUser.username || usernameInput,
              name: currentUser.name || nameInput,
              targetRole: currentUser.targetRole || targetRoleInput,
              handles: newHandles,
              academic: currentUser.academic
            })
          })
        ]);
      } catch (err) {
        console.warn('Backend handle sync warning:', err);
      }
    }

    setSavedSuccess(true);
    if (onRefreshAll) await onRefreshAll();
    setSyncing(false);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const applyPreset = async (cf, lc, gh) => {
    setCfInput(cf);
    setLcInput(lc);
    setGhInput(gh);
    const presetHandles = { codeforces: cf, leetcode: lc, github: gh };
    setHandles(presetHandles);

    if (currentUser?.email) {
      const updatedUser = {
        ...currentUser,
        handles: presetHandles
      };
      saveUserToRegistry(updatedUser, true);

      try {
        await Promise.all([
          fetch('/api/auth/complete-onboarding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: currentUser.email,
              handles: presetHandles,
              targetRole: currentUser.targetRole
            })
          }),
          fetch('/api/auth/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: currentUser.email,
              username: currentUser.username || usernameInput,
              name: currentUser.name || nameInput,
              targetRole: currentUser.targetRole || targetRoleInput,
              handles: presetHandles,
              academic: currentUser.academic
            })
          })
        ]);
      } catch (err) {}
    }

    setSavedSuccess(true);
    if (onRefreshAll) await onRefreshAll();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleClearCache = async () => {
    try {
      await fetch('/api/cache/clear', { method: 'POST' });
    } catch (e) {
      console.warn('Backend cache clear warning:', e);
    }
    window.localStorage.removeItem('prep_dashboard_cache');
    window.localStorage.removeItem('prep_dsa_cache');
    setCacheMessage('All browser & server in-memory caches cleared!');
    if (onRefreshAll) onRefreshAll();
    setTimeout(() => setCacheMessage(''), 3000);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all progress milestones to default clean state?')) {
      window.localStorage.removeItem('prep_webdev_state');
      window.localStorage.removeItem('prep_sysdesign_state');
      window.localStorage.removeItem('prep_dsa_cache');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-black font-display tracking-tight">
            Connected Coding Platforms & API Hub
          </h1>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-black text-white font-bold">
            Live Platform Integrations
          </span>
        </div>
        <p className="text-xs text-black/60 font-medium">
          Configure your public competitive coding handles and developer profiles to pull real-time verified data via official public APIs.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-xs text-emerald-900 font-bold flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Coding handles successfully updated and live data synchronized!</span>
          </div>
          <span className="font-mono text-[11px] text-emerald-700">Live Cached</span>
        </div>
      )}

      {/* Current Authenticated Identity */}
      {currentUser && (
        <div className="p-5 rounded-3xl bg-white border-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3.5">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-12 h-12 rounded-2xl border-2 border-black object-cover shadow-xs"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-mono font-bold text-sm shadow-xs">
                {currentUser.name ? currentUser.name.substring(0, 2).toUpperCase() : 'ST'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-black font-display">{currentUser.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md font-bold border border-black/15 bg-black/5 text-black">
                  {currentUser.provider ? (currentUser.provider === 'google' ? 'Google SSO' : currentUser.provider === 'github' ? 'GitHub SSO' : 'Local Auth') : 'Student Profile'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <span className="text-xs text-black/50 font-mono">{currentUser.email}</span>
                <span className="text-black/20">•</span>
                <button
                  type="button"
                  onClick={handleResendFromSettings}
                  disabled={resendCooldown > 0 || resendLoading}
                  className="text-[11px] font-mono font-bold text-blue-600 hover:text-blue-800 underline disabled:opacity-50 cursor-pointer"
                >
                  {resendLoading ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend verification email'}
                </button>
              </div>
              {resendFeedback && (
                <p className="text-[11px] text-emerald-700 font-medium font-mono mt-1">
                  {resendFeedback}
                </p>
              )}
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-mono text-black/40 block uppercase font-bold">Target Placement Role</span>
            <span className="text-xs font-bold text-black font-display">{currentUser.targetRole || 'SDE-1'}</span>
          </div>
        </div>
      )}

      {/* Public Developer Profile Link Card */}
      {(() => {
        const activeProfileHandle = (usernameInput || currentUser?.username || currentUser?.email?.split('@')[0] || 'me')
          .replace(/[^a-z0-9_-]/gi, '')
          .toLowerCase();
        const activeProfileUrl = typeof window !== 'undefined'
          ? `${window.location.origin}/u/${encodeURIComponent(activeProfileHandle)}`
          : `/u/${activeProfileHandle}`;

        return (
          <div className="p-5 sm:p-6 rounded-3xl bg-neutral-900 text-white border-2 border-black space-y-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-base font-extrabold font-display">
                    Public Developer Profile & Recruiter Dossier
                  </h2>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                    Public Link
                  </span>
                </div>
                <p className="text-xs text-neutral-300">
                  Share your verified placement readiness index, LeetCode/Codeforces stats, and production project portfolio with recruiters. No login required for viewers!
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`/u/${encodeURIComponent(activeProfileHandle)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-black text-xs font-mono font-bold hover:bg-neutral-100 transition-colors shadow-xs"
                >
                  <span>View Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(activeProfileUrl).then(() => {
                        setProfileCopied(true);
                        setTimeout(() => setProfileCopied(false), 2500);
                      });
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs font-mono font-bold hover:bg-neutral-700 transition-colors shadow-xs"
                >
                  {profileCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{profileCopied ? 'Copied URL!' : 'Copy Public URL'}</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between font-mono text-xs text-neutral-400 overflow-x-auto">
              <span className="truncate mr-3 text-emerald-400 font-bold">
                {activeProfileUrl}
              </span>
              <span className="text-[10px] text-emerald-400 uppercase font-bold shrink-0">
                Recruiter Ready
              </span>
            </div>
          </div>
        );
      })()}

      {/* Candidate Academic Profile & Career Track Preferences */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-black space-y-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        <div className="border-b border-black/10 pb-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-black" />
            <h2 className="text-base font-extrabold text-black font-display">
              Candidate Academic Profile & Career Preferences
            </h2>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
              Verified Candidate
            </span>
          </div>
          <p className="text-xs text-black/50 mt-0.5">
            Customize your public username handle, academic credentials (CGPA, college, graduation year), and desired job track options displayed on your recruiter portfolio.
          </p>
        </div>

        {academicSavedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-xs text-emerald-900 font-bold flex items-center justify-between shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Academic profile, public username, and career preferences saved successfully!</span>
            </div>
            <span className="font-mono text-[11px] text-emerald-700">Dossier Updated</span>
          </div>
        )}

        {academicError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-400 text-xs text-rose-900 font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{academicError}</span>
          </div>
        )}

        <form onSubmit={handleSaveAcademicProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Public Username */}
            <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-1.5">
              <label className="font-bold text-black flex items-center justify-between">
                <span>Public Vanity Username</span>
                <span className="font-mono text-[10px] text-black/50 font-semibold">Shareable URL handle</span>
              </label>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-black/40 text-xs font-bold">/u/</span>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  placeholder="e.g. rahul_dev"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-black/20 text-xs font-mono font-bold text-black focus:outline-none focus:border-black"
                />
              </div>
              <p className="font-mono text-[10px] text-black/50">
                Live URL: {typeof window !== 'undefined' ? `${window.location.origin}/u/${usernameInput || 'username'}` : `/u/${usernameInput || 'username'}`}
              </p>
            </div>

            {/* Candidate Full Name */}
            <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-1.5">
              <label className="font-bold text-black">Display Name</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Candidate Full Name"
                className="w-full px-3 py-2 rounded-xl bg-white border border-black/20 text-xs font-semibold text-black focus:outline-none focus:border-black"
              />
              <p className="text-[10px] text-black/50">Full legal or professional name shown on portfolio</p>
            </div>

            {/* College Name */}
            <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-1.5">
              <label className="font-bold text-black flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-black/60" />
                <span>College / University Name</span>
              </label>
              <input
                type="text"
                value={collegeInput}
                onChange={(e) => setCollegeInput(e.target.value)}
                placeholder="e.g. Chandigarh University, IIT Delhi"
                className="w-full px-3 py-2 rounded-xl bg-white border border-black/20 text-xs font-semibold text-black focus:outline-none focus:border-black"
              />
            </div>

            {/* Degree & Branch */}
            <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-1.5">
              <label className="font-bold text-black flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-black/60" />
                <span>Degree & Major / Branch</span>
              </label>
              <input
                type="text"
                value={degreeInput}
                onChange={(e) => setDegreeInput(e.target.value)}
                placeholder="e.g. B.Tech Computer Science & Engineering"
                className="w-full px-3 py-2 rounded-xl bg-white border border-black/20 text-xs font-semibold text-black focus:outline-none focus:border-black"
              />
            </div>

            {/* Graduation Year */}
            <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-1.5">
              <label className="font-bold text-black flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-black/60" />
                <span>Graduation / Study Year</span>
              </label>
              <select
                value={yearInput}
                onChange={(e) => setYearInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-black/20 text-xs font-semibold text-black focus:outline-none focus:border-black font-mono"
              >
                <option value="2026 (Final Year)">2026 (Final Year Student)</option>
                <option value="2027 (Pre-final Year)">2027 (Pre-final Year Student)</option>
                <option value="2028 (Sophomore)">2028 (Sophomore Year)</option>
                <option value="2025 (Fresh Graduate)">2025 (Fresh Graduate)</option>
                <option value="2024 (Experienced / Alumni)">2024 (Alumni / Experienced)</option>
              </select>
            </div>

            {/* CGPA / Percentage */}
            <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-1.5">
              <label className="font-bold text-black flex items-center justify-between">
                <span>CGPA / Academic Score</span>
                <span className="font-mono text-[10px] text-emerald-700 font-bold">Academic Verified</span>
              </label>
              <input
                type="text"
                value={cgpaInput}
                onChange={(e) => setCgpaInput(e.target.value)}
                placeholder="e.g. 8.85 / 10 CGPA or 88%"
                className="w-full px-3 py-2 rounded-xl bg-white border border-black/20 text-xs font-mono font-bold text-black focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Secondary & Higher Secondary Education (10th & 12th) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10 pb-2.5">
              <div>
                <span className="font-bold text-black text-xs sm:text-sm flex items-center gap-1.5 font-display">
                  <GraduationCap className="w-4 h-4 text-black" />
                  <span>Secondary &amp; Senior Secondary Education (Class 10th &amp; 12th)</span>
                </span>
                <p className="text-[11px] text-black/60 mt-0.5">
                  Populates the Education section on Jake&apos;s ATS Resume and verified Recruiter Dossier.
                </p>
              </div>
              <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full font-bold bg-white text-black border border-black/20 shrink-0 self-start sm:self-auto shadow-xs">
                Overleaf Section 1
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Class 12th (Senior Secondary) */}
              <div className="p-3.5 rounded-xl bg-white border border-black/20 space-y-2.5">
                <div className="flex items-center justify-between border-b border-black/10 pb-1.5">
                  <span className="font-bold text-xs text-black flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Class XII / Senior Secondary
                  </span>
                  <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                    High School
                  </span>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-black/80">School / Junior College Name</label>
                  <input
                    type="text"
                    value={class12School}
                    onChange={(e) => setClass12School(e.target.value)}
                    placeholder="e.g. Delhi Public School, R.K. Puram"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#F9F9F7] border border-black/15 text-xs text-black font-semibold focus:outline-none focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-black/80">Board</label>
                    <input
                      type="text"
                      value={class12Board}
                      onChange={(e) => setClass12Board(e.target.value)}
                      placeholder="CBSE / ISC / State"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#F9F9F7] border border-black/15 text-xs text-black font-mono font-bold focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-black/80">Year</label>
                    <input
                      type="text"
                      value={class12Year}
                      onChange={(e) => setClass12Year(e.target.value)}
                      placeholder="2022"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#F9F9F7] border border-black/15 text-xs text-black font-mono font-bold focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-black/80">Aggregate Score</label>
                    <input
                      type="text"
                      value={class12Score}
                      onChange={(e) => setClass12Score(e.target.value)}
                      placeholder="e.g. 92.4% or 9.2"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#F9F9F7] border border-black/15 text-xs text-emerald-800 font-mono font-bold focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* Class 10th (Secondary) */}
              <div className="p-3.5 rounded-xl bg-white border border-black/20 space-y-2.5">
                <div className="flex items-center justify-between border-b border-black/10 pb-1.5">
                  <span className="font-bold text-xs text-black flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Class X / Secondary School
                  </span>
                  <span className="text-[10px] font-mono text-blue-800 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-300">
                    Matriculation
                  </span>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-black/80">School Name</label>
                  <input
                    type="text"
                    value={class10School}
                    onChange={(e) => setClass10School(e.target.value)}
                    placeholder="e.g. St. Xavier's High School"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#F9F9F7] border border-black/15 text-xs text-black font-semibold focus:outline-none focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-black/80">Board</label>
                    <input
                      type="text"
                      value={class10Board}
                      onChange={(e) => setClass10Board(e.target.value)}
                      placeholder="CBSE / ICSE / State"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#F9F9F7] border border-black/15 text-xs text-black font-mono font-bold focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-black/80">Year</label>
                    <input
                      type="text"
                      value={class10Year}
                      onChange={(e) => setClass10Year(e.target.value)}
                      placeholder="2020"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#F9F9F7] border border-black/15 text-xs text-black font-mono font-bold focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-black/80">Aggregate Score</label>
                    <input
                      type="text"
                      value={class10Score}
                      onChange={(e) => setClass10Score(e.target.value)}
                      placeholder="e.g. 95.8% or 10.0"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#F9F9F7] border border-black/15 text-xs text-blue-800 font-mono font-bold focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information & Privacy Visibility Controls */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10 pb-2.5">
              <div>
                <span className="font-bold text-black text-xs sm:text-sm flex items-center gap-1.5 font-display">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Contact Details &amp; Granular Privacy Controls</span>
                </span>
                <p className="text-[11px] text-black/60 mt-0.5">
                  Save your mobile number and email. Mark each section as Public (recruiter visible) or Private according to your choice.
                </p>
              </div>
              <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full font-bold bg-white text-black border border-black/20 shrink-0 self-start sm:self-auto shadow-xs">
                Candidate Privacy
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Email Address & Privacy Toggle */}
              <div className="p-3.5 rounded-xl bg-white border border-black/20 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="font-bold text-black flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-black/60" />
                    <span>Email Address</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowEmailPublicly(prev => !prev)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border transition-all cursor-pointer ${
                      showEmailPublicly
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100 shadow-xs'
                        : 'bg-neutral-100 text-neutral-700 border-neutral-300 hover:bg-neutral-200'
                    }`}
                    title={showEmailPublicly ? 'Email is currently Public. Click to make Private.' : 'Email is currently Private. Click to make Public.'}
                  >
                    {showEmailPublicly ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Public</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Private</span>
                      </>
                    )}
                  </button>
                </div>

                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g. candidate@domain.com"
                  className="w-full px-3 py-2 rounded-xl bg-[#F9F9F7] border border-black/15 text-xs font-mono font-medium text-black focus:outline-none focus:border-black"
                />

                <div className="flex items-center justify-between text-[10.5px] leading-tight">
                  <span className={showEmailPublicly ? 'text-emerald-700 font-medium' : 'text-neutral-500 font-medium'}>
                    {showEmailPublicly
                      ? '✓ Publicly visible to recruiters on your profile & default resume.'
                      : '🔒 Private — Masked from public profile to prevent spam.'}
                  </span>
                  <span className="font-mono text-[10px] text-black/40 font-semibold shrink-0 ml-1">
                    {showEmailPublicly ? 'Recruiter Ready' : 'Hidden'}
                  </span>
                </div>
              </div>

              {/* Mobile Phone & Privacy Toggle */}
              <div className="p-3.5 rounded-xl bg-white border border-black/20 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="font-bold text-black flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-black/60" />
                    <span>Mobile Phone Number</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPhonePublicly(prev => !prev)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border transition-all cursor-pointer ${
                      showPhonePublicly
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100 shadow-xs'
                        : 'bg-neutral-100 text-neutral-700 border-neutral-300 hover:bg-neutral-200'
                    }`}
                    title={showPhonePublicly ? 'Phone is currently Public. Click to make Private.' : 'Phone is currently Private. Click to make Public.'}
                  >
                    {showPhonePublicly ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Public</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Private</span>
                      </>
                    )}
                  </button>
                </div>

                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl bg-[#F9F9F7] border border-black/15 text-xs font-mono font-medium text-black focus:outline-none focus:border-black"
                />

                <div className="flex items-center justify-between text-[10.5px] leading-tight">
                  <span className={showPhonePublicly ? 'text-emerald-700 font-medium' : 'text-neutral-500 font-medium'}>
                    {showPhonePublicly
                      ? '✓ Publicly visible for phone screenings and resume downloads.'
                      : '🔒 Private — Masked from public profile. Visible only to you.'}
                  </span>
                  <span className="font-mono text-[10px] text-black/40 font-semibold shrink-0 ml-1">
                    {showPhonePublicly ? 'Screening Ready' : 'Confidential'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Desired Career Option / Track Selection */}
          <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-2">
            <label className="font-bold text-black flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-black/60" />
                <span>Desired Placement Career Option (Calibrates Readiness Engine)</span>
              </span>
              <span className="font-mono text-[10px] text-blue-700 font-bold uppercase">
                Dynamic Benchmark
              </span>
            </label>
            <select
              value={targetRoleInput}
              onChange={(e) => setTargetRoleInput(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-black/20 text-xs font-bold text-black focus:outline-none focus:border-black font-display"
            >
              <option value="Software Development Engineer (SDE-1 — FAANG & Tier-1)">
                Software Development Engineer (SDE-1 — FAANG & Tier-1 Product) [DSA: 40%, System Design: 25%]
              </option>
              <option value="Backend & Distributed Systems Engineer">
                Backend & Distributed Systems Engineer [System Design: 30%, Backend/DB: 30%, DSA: 20%]
              </option>
              <option value="Frontend & Web Performance Engineer">
                Frontend & Web Performance Engineer [Frontend Web Dev: 40%, Projects: 25%, DSA: 15%]
              </option>
              <option value="Full-Stack Software Engineer">
                Full-Stack Software Engineer [Web Dev: 35%, Projects: 25%, DSA: 20%, System Design: 10%]
              </option>
              <option value="DevOps & Site Reliability Engineer (SRE)">
                DevOps & Site Reliability Engineer (SRE) [DevOps & Cloud: 35%, System Design: 25%, Projects: 20%]
              </option>
              <option value="Data Engineer & ML Infrastructure">
                Data Engineer & ML Infrastructure [Databases/Streaming: 35%, DSA: 25%, System Design: 20%]
              </option>
            </select>
            <p className="text-[11px] text-black/60 leading-relaxed">
              Selecting this role automatically calibrates the weightages of your Placement Readiness index and displays tailored recommendations on your dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dream Target Companies */}
            <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-1.5">
              <label className="font-bold text-black">Dream Target Companies</label>
              <input
                type="text"
                value={dreamCompaniesInput}
                onChange={(e) => setDreamCompaniesInput(e.target.value)}
                placeholder="e.g. Google, Atlassian, Uber, Microsoft, Stripe"
                className="w-full px-3 py-2 rounded-xl bg-white border border-black/20 text-xs font-semibold text-black focus:outline-none focus:border-black"
              />
            </div>

            {/* Work Mode */}
            <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-1.5">
              <label className="font-bold text-black">Preferred Work Arrangement</label>
              <select
                value={workModeInput}
                onChange={(e) => setWorkModeInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-black/20 text-xs font-semibold text-black focus:outline-none focus:border-black"
              >
                <option value="Hybrid / Remote / On-site">Hybrid / Remote / On-site (Flexible)</option>
                <option value="Remote Only">Remote Only</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
          </div>

          {/* Resume Sections: Achievements & Honors and Co-curricular & Extracurricular Activities */}
          <div className="pt-3 border-t-2 border-dashed border-black/15 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-black flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Resume Builder: Achievements &amp; Extracurriculars</span>
                </h3>
                <p className="text-[11px] text-black/60 mt-0.5">
                  These headings populate your verified Public Dossier and Jake&apos;s ATS Resume template. Enter one bullet point per line.
                </p>
              </div>
              <span className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg bg-black text-white uppercase tracking-wider shrink-0 self-start sm:self-auto shadow-xs">
                Overleaf ATS Compliant
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Heading 1: Achievements & Honors */}
              <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-black flex items-center gap-1.5 text-xs">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      <span>Achievements &amp; Honors</span>
                    </label>
                    <span className="font-mono text-[10px] text-black/50 font-bold uppercase">
                      One bullet per line
                    </span>
                  </div>
                  <p className="text-[11px] text-black/60 leading-relaxed mb-2">
                    Highlight hackathon victories, scholarships, competitive programming ranks, or academic honors. If left empty, platform automatically inserts your verified LeetCode &amp; Codeforces metrics.
                  </p>
                  <textarea
                    rows={4}
                    value={achievementsInput}
                    onChange={(e) => setAchievementsInput(e.target.value)}
                    placeholder={`Winner at HackCBS 6.0 among 400+ national engineering teams\nSecured Global Rank 45 in LeetCode Weekly Contest 390\nRecipient of Academic Merit Scholarship (Top 1% of CS department)`}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-black/20 text-xs font-mono font-medium text-black focus:outline-none focus:border-black resize-y leading-relaxed"
                  />
                </div>
                <div className="text-[10.5px] font-mono text-black/50 flex items-center justify-between pt-1">
                  <span>{achievementsInput.split('\n').filter(s => s.trim()).length} bullet point(s)</span>
                  <span className="text-emerald-700 font-bold">✓ Formatted as ATS \resumeItem</span>
                </div>
              </div>

              {/* Heading 2: Co-curricular & Extracurricular Activities */}
              <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-black flex items-center gap-1.5 text-xs">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>Co-curricular &amp; Extracurricular Activities</span>
                    </label>
                    <span className="font-mono text-[10px] text-black/50 font-bold uppercase">
                      One bullet per line
                    </span>
                  </div>
                  <p className="text-[11px] text-black/60 leading-relaxed mb-2">
                    Showcase engineering club leads, hackathon organizing committees, tech symposiums, mentoring juniors, or open-source community leadership to demonstrate proactive teamwork.
                  </p>
                  <textarea
                    rows={4}
                    value={extracurricularsInput}
                    onChange={(e) => setExtracurricularsInput(e.target.value)}
                    placeholder={`Lead Organizer of Annual National Hackathon with 800+ attendees\nStudent Mentor for Data Structures & Algorithms Club (mentored 80+ juniors)\nActive Core Contributor to open-source developer tooling`}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-black/20 text-xs font-mono font-medium text-black focus:outline-none focus:border-black resize-y leading-relaxed"
                  />
                </div>
                <div className="text-[10.5px] font-mono text-black/50 flex items-center justify-between pt-1">
                  <span>{extracurricularsInput.split('\n').filter(s => s.trim()).length} bullet point(s)</span>
                  <span className="text-emerald-700 font-bold">✓ Formatted as ATS \resumeItem</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-black text-white font-mono font-bold text-xs hover:bg-neutral-800 transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center gap-2 cursor-pointer active:translate-y-0.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Academic Profile & Desired Role</span>
            </button>
          </div>
        </form>
      </div>

      {/* Work Experience & Internships Hub (ATS Section 2) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-black space-y-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-black" />
              <h2 className="text-base font-extrabold text-black font-display">
                Work Experience &amp; Internships
              </h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300 font-bold">
                ATS Section 2
              </span>
            </div>
            <p className="text-xs text-black/50 mt-0.5">
              Add internships, software engineering roles, or freelance work. Entries render as standard Jake Gutierrez Overleaf LaTeX items with bullet points.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddExperience}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white font-mono text-xs font-bold transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Experience</span>
          </button>
        </div>

        {experiences.length === 0 ? (
          <div className="p-6 rounded-2xl border-2 border-dashed border-black/20 bg-[#F9F9F7] text-center space-y-2">
            <p className="text-xs font-mono text-black/60">
              No work experience or internships added yet. Click &quot;+ Add Experience&quot; to list your industrial exposure.
            </p>
            <button
              type="button"
              onClick={handleAddExperience}
              className="px-4 py-2 bg-white text-black border border-black/30 rounded-xl font-mono text-xs font-bold hover:bg-neutral-100 shadow-xs cursor-pointer"
            >
              + Add First Internship Entry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {experiences.map((exp, idx) => (
              <div key={exp.id || idx} className="p-4 sm:p-5 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-3">
                <div className="flex items-center justify-between border-b border-black/10 pb-2.5">
                  <span className="font-extrabold text-xs text-black font-mono flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-black text-white font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{exp.role || 'New Role'} — {exp.company || 'Company'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(exp.id)}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 border border-transparent hover:border-rose-300 transition-colors cursor-pointer"
                    title="Remove this experience"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-black/80 text-[11px]">Role / Job Title</label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => handleUpdateExperience(exp.id, 'role', e.target.value)}
                      placeholder="e.g. Software Engineering Intern"
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-black/20 text-xs font-semibold text-black focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-black/80 text-[11px]">Company / Organization</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleUpdateExperience(exp.id, 'company', e.target.value)}
                      placeholder="e.g. Google or FinTech Startup"
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-black/20 text-xs font-semibold text-black focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-black/80 text-[11px]">Location</label>
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) => handleUpdateExperience(exp.id, 'location', e.target.value)}
                      placeholder="e.g. Bengaluru, India (Hybrid)"
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-black/20 text-xs font-semibold text-black focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-black/80 text-[11px]">Duration / Dates</label>
                    <input
                      type="text"
                      value={exp.duration}
                      onChange={(e) => handleUpdateExperience(exp.id, 'duration', e.target.value)}
                      placeholder="e.g. May 2024 -- July 2024"
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-black/20 text-xs font-mono font-bold text-black focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-black/80 text-[11px]">
                      Impact Bullet Points (One per line — Formatted as ATS \resumeItem)
                    </label>
                    <span className="font-mono text-[10px] text-black/50">
                      {(exp.bulletsText || '').split('\n').filter(s => s.trim()).length} bullet(s)
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={exp.bulletsText}
                    onChange={(e) => handleUpdateExperience(exp.id, 'bulletsText', e.target.value)}
                    placeholder="Built high-throughput backend APIs handling 10,000+ requests/sec\nReduced p95 response time by 40% via Redis caching layer\nCollaborated with distributed engineering teams across sprint cycles"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-black/20 text-xs font-mono font-medium text-black focus:outline-none focus:border-black resize-y leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleSaveAcademicProfile}
            className="px-5 py-2.5 rounded-2xl bg-black text-white font-mono font-bold text-xs hover:bg-neutral-800 transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center gap-2 cursor-pointer active:translate-y-0.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Work Experience</span>
          </button>
        </div>
      </div>

      {/* Technical Skills Customizer (5 Pillars - ATS Section 5) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-black space-y-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-black" />
              <h2 className="text-base font-extrabold text-black font-display">
                Technical Skills Pillars (Jake&apos;s ATS Resume)
              </h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">
                ATS Section 5
              </span>
            </div>
            <p className="text-xs text-black/50 mt-0.5">
              Customize the 5 skill pillars shown in Section 5 of your Jake Gutierrez resume and Recruiter Dossier. Separate technologies with commas.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetSkills}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black font-mono text-xs font-bold border border-black/20 transition-all shrink-0 cursor-pointer"
            title="Reset to recommended industry skill sets"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Recommended</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Pillar 1: Languages */}
          <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-2">
            <label className="font-bold text-black flex items-center justify-between">
              <span>Programming Languages</span>
              <span className="font-mono text-[10px] text-black/50 font-semibold">C++, Java, Python...</span>
            </label>
            <textarea
              rows={2}
              value={techLanguages}
              onChange={(e) => setTechLanguages(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-black/20 text-xs font-mono font-medium text-black focus:outline-none focus:border-black resize-y"
            />
          </div>

          {/* Pillar 2: Frameworks */}
          <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-2">
            <label className="font-bold text-black flex items-center justify-between">
              <span>Frameworks &amp; Libraries</span>
              <span className="font-mono text-[10px] text-black/50 font-semibold">React, Node, Express...</span>
            </label>
            <textarea
              rows={2}
              value={techFrameworks}
              onChange={(e) => setTechFrameworks(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-black/20 text-xs font-mono font-medium text-black focus:outline-none focus:border-black resize-y"
            />
          </div>

          {/* Pillar 3: Databases */}
          <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-2">
            <label className="font-bold text-black flex items-center justify-between">
              <span>Databases &amp; In-Memory Caching</span>
              <span className="font-mono text-[10px] text-black/50 font-semibold">PostgreSQL, Redis, Mongo...</span>
            </label>
            <textarea
              rows={2}
              value={techDatabases}
              onChange={(e) => setTechDatabases(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-black/20 text-xs font-mono font-medium text-black focus:outline-none focus:border-black resize-y"
            />
          </div>

          {/* Pillar 4: Developer Tools */}
          <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-2">
            <label className="font-bold text-black flex items-center justify-between">
              <span>Developer Tools &amp; Cloud</span>
              <span className="font-mono text-[10px] text-black/50 font-semibold">Git, Docker, Linux, CI/CD...</span>
            </label>
            <textarea
              rows={2}
              value={techTools}
              onChange={(e) => setTechTools(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-black/20 text-xs font-mono font-medium text-black focus:outline-none focus:border-black resize-y"
            />
          </div>

          {/* Pillar 5: Core Concepts (Full width) */}
          <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 space-y-2 md:col-span-2">
            <label className="font-bold text-black flex items-center justify-between">
              <span>Core Computer Science &amp; Engineering Competencies</span>
              <span className="font-mono text-[10px] text-blue-700 font-bold uppercase">System Design &amp; DSA</span>
            </label>
            <textarea
              rows={2}
              value={techCoreConcepts}
              onChange={(e) => setTechCoreConcepts(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-black/20 text-xs font-mono font-medium text-black focus:outline-none focus:border-black resize-y"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleSaveAcademicProfile}
            className="px-5 py-2.5 rounded-2xl bg-black text-white font-mono font-bold text-xs hover:bg-neutral-800 transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center gap-2 cursor-pointer active:translate-y-0.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Technical Skills</span>
          </button>
        </div>
      </div>

      {/* Projects Hub & Jake's ATS Resume Checkbox Selector (ATS Section 3) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-black space-y-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-black" />
              <h2 className="text-base font-extrabold text-black font-display">
                Engineering Projects &amp; Resume Selection
              </h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                ATS Section 3
              </span>
            </div>
            <p className="text-xs text-black/50 mt-0.5">
              Out of all projects in your portfolio, <strong>tick the checkboxes</strong> for the projects you want listed on your 1-page ATS Resume. You can also modify details or add custom projects.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsAddingProject(prev => !prev)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white font-mono text-xs font-bold transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingProject ? 'Cancel' : '+ Add Custom Project'}</span>
            </button>
            <button
              type="button"
              onClick={handleResetProjects}
              className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-black/20 text-black transition-colors cursor-pointer"
              title="Reset projects to standard platform defaults"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Resume Selection Counter Banner */}
        <div className="p-3.5 rounded-2xl bg-black text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-mono text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>{selectedResumeProjectIds.length} Projects Ticked for Resume</strong> (Recommended: 2 -- 3 for standard 1-page ATS length)
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold text-emerald-400">
            {selectedResumeProjectIds.length >= 2 && selectedResumeProjectIds.length <= 3 ? '✓ Optimal 1-Page Length' : 'Adjust Ticks as Desired'}
          </span>
        </div>

        {/* Add Project Form (Expandable) */}
        {isAddingProject && (
          <div className="p-5 rounded-2xl bg-amber-50/70 border-2 border-amber-400 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-amber-300 pb-2">
              <span className="font-extrabold text-xs text-amber-950 font-display flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-amber-700" />
                Add New Project to Portfolio &amp; Resume
              </span>
              <span className="text-[10px] font-mono text-amber-800 uppercase font-bold">New Entry</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-black/80 text-[11px]">Project Title &amp; Subtitle</label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. CloudScale — Distributed Cache & Load Balancer"
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-black/20 text-xs font-semibold text-black focus:outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black/80 text-[11px]">Duration / Date</label>
                <input
                  type="text"
                  value={newProject.date}
                  onChange={(e) => setNewProject(p => ({ ...p, date: e.target.value }))}
                  placeholder="e.g. 2024 -- Present"
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-black/20 text-xs font-mono font-bold text-black focus:outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1 sm:col-span-3">
                <label className="font-bold text-black/80 text-[11px]">Tech Stack (Comma-separated)</label>
                <input
                  type="text"
                  value={newProject.techStack}
                  onChange={(e) => setNewProject(p => ({ ...p, techStack: e.target.value }))}
                  placeholder="e.g. Go, gRPC, Redis, Docker, Kubernetes"
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-black/20 text-xs font-semibold text-black focus:outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1 sm:col-span-1">
                <label className="font-bold text-black/80 text-[11px]">GitHub Repository URL</label>
                <input
                  type="url"
                  value={newProject.githubUrl}
                  onChange={(e) => setNewProject(p => ({ ...p, githubUrl: e.target.value }))}
                  placeholder="https://github.com/username/project"
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-black/20 text-xs font-mono text-black focus:outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-black/80 text-[11px]">Live Demo URL (Optional)</label>
                <input
                  type="url"
                  value={newProject.liveDemo}
                  onChange={(e) => setNewProject(p => ({ ...p, liveDemo: e.target.value }))}
                  placeholder="https://myproject.dev"
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-black/20 text-xs font-mono text-black focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-black/80 text-[11px]">
                Impact Bullet Points (One per line — Overleaf ATS \resumeItem)
              </label>
              <textarea
                rows={3}
                value={newProject.bulletsText}
                onChange={(e) => setNewProject(p => ({ ...p, bulletsText: e.target.value }))}
                placeholder="Architected concurrent data ingestion pipeline handling 5,000 req/sec with sub-20ms latency\nImplemented distributed caching with Redis cluster, reducing primary database load by 65%\nDeployed automated CI/CD workflows and containerized microservices using Docker"
                className="w-full px-3 py-2 rounded-xl bg-white border border-black/20 text-xs font-mono font-medium text-black focus:outline-none focus:border-black resize-y leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingProject(false)}
                className="px-4 py-2 rounded-xl bg-white text-black font-mono text-xs font-bold border border-black/20 hover:bg-neutral-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCustomProject}
                className="px-4 py-2 rounded-xl bg-black text-white font-mono text-xs font-bold hover:bg-neutral-800 shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer"
              >
                + Add Project to List
              </button>
            </div>
          </div>
        )}

        {/* Existing Projects List */}
        <div className="space-y-4">
          {projectsList.map((proj, idx) => {
            const isTicked = selectedResumeProjectIds.includes(proj.id);
            return (
              <div
                key={proj.id || idx}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all space-y-3 ${
                  isTicked 
                    ? 'bg-white border-black shadow-[3px_3px_0px_rgba(0,0,0,1)]' 
                    : 'bg-[#F9F9F7] border-black/15 opacity-85'
                }`}
              >
                {/* Project Header with Checkbox */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-black/10 pb-3">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isTicked}
                        onChange={() => handleToggleResumeProject(proj.id)}
                        className="w-4 h-4 rounded border-2 border-black text-black focus:ring-0 cursor-pointer"
                      />
                      <span className="font-extrabold text-sm text-black font-display">
                        {proj.title || 'Untitled Project'}
                      </span>
                    </label>

                    <span
                      className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold border ${
                        isTicked
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                          : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                      }`}
                    >
                      {isTicked ? '✓ Featured in Resume' : 'Dossier Only'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(proj.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 border border-transparent hover:border-rose-300 transition-colors cursor-pointer"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Project Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-black/80 text-[11px]">Title</label>
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => handleUpdateProject(proj.id, 'title', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-[#F9F9F7] border border-black/15 text-xs font-semibold text-black focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-black/80 text-[11px]">Date / Period</label>
                    <input
                      type="text"
                      value={proj.date}
                      onChange={(e) => handleUpdateProject(proj.id, 'date', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-[#F9F9F7] border border-black/15 text-xs font-mono font-bold text-black focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-3">
                    <label className="font-bold text-black/80 text-[11px]">Tech Stack</label>
                    <input
                      type="text"
                      value={proj.techStack}
                      onChange={(e) => handleUpdateProject(proj.id, 'techStack', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-[#F9F9F7] border border-black/15 text-xs font-semibold text-black focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-1">
                    <label className="font-bold text-black/80 text-[11px]">GitHub URL</label>
                    <input
                      type="text"
                      value={proj.githubUrl}
                      onChange={(e) => handleUpdateProject(proj.id, 'githubUrl', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-[#F9F9F7] border border-black/15 text-xs font-mono text-black focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-black/80 text-[11px]">Live Demo URL</label>
                    <input
                      type="text"
                      value={proj.liveDemo}
                      onChange={(e) => handleUpdateProject(proj.id, 'liveDemo', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-[#F9F9F7] border border-black/15 text-xs font-mono text-black focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-black/80 text-[11px]">
                      Impact Bullet Points (One per line — ATS \resumeItem)
                    </label>
                    <span className="font-mono text-[10px] text-black/50">
                      {(proj.bulletsText || '').split('\n').filter(s => s.trim()).length} bullet(s)
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={proj.bulletsText}
                    onChange={(e) => handleUpdateProject(proj.id, 'bulletsText', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F9F9F7] border border-black/15 text-xs font-mono font-medium text-black focus:outline-none focus:border-black resize-y leading-relaxed"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleSaveAcademicProfile}
            className="px-5 py-2.5 rounded-2xl bg-black text-white font-mono font-bold text-xs hover:bg-neutral-800 transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center gap-2 cursor-pointer active:translate-y-0.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Projects &amp; Resume Selection</span>
          </button>
        </div>
      </div>

      {/* Platform Cards Hub */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-black space-y-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-black font-display flex items-center gap-2">
              <User className="w-5 h-5 text-black" />
              Your Coding Platform Accounts
            </h2>
            <p className="text-xs text-black/50 mt-0.5">
              Enter your public usernames below. No API keys or passwords required!
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-black/50 uppercase font-bold">Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset('tourist', 'tourist', 'torvalds')}
              className="px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 text-[11px] font-mono font-bold transition-all"
            >
              Tourist
            </button>
            <button
              type="button"
              onClick={() => applyPreset('Petr', 'neal_wu', 'gaearon')}
              className="px-2.5 py-1 rounded-xl bg-blue-100 hover:bg-blue-200 border border-blue-300 text-blue-900 text-[11px] font-mono font-bold transition-all"
            >
              Neal Wu
            </button>
            <button
              type="button"
              onClick={() => applyPreset('', '', '')}
              className="px-2.5 py-1 rounded-xl bg-black/5 hover:bg-black/10 border border-black/15 text-black/70 text-[11px] font-mono font-bold transition-all"
            >
              Clean (0)
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveHandles} className="space-y-4 text-xs">
          {/* 1. LeetCode Card */}
          <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 hover:border-black/30 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="font-extrabold text-sm text-black font-display">LeetCode</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold border border-amber-300">
                  GraphQL API
                </span>
              </div>
              <span className={`text-xs font-mono font-bold flex items-center gap-1 ${handles.leetcode ? 'text-emerald-700' : 'text-black/40'}`}>
                {handles.leetcode ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Linked: @{handles.leetcode}
                  </>
                ) : (
                  'Not Connected'
                )}
              </span>
            </div>

            <p className="text-[11px] text-black/60">
              Synchronizes solved count (Easy, Medium, Hard breakdown), contest rating, and rank.
            </p>

            <div className="pt-1">
              <input
                type="text"
                value={lcInput}
                onChange={(e) => setLcInput(e.target.value)}
                placeholder="e.g. neal_wu or your_leetcode_username"
                className="w-full px-3 py-2 rounded-xl bg-white border border-black/15 text-black font-mono focus:outline-none focus:border-black font-medium"
              />
            </div>
          </div>

          {/* 2. Codeforces Card */}
          <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 hover:border-black/30 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-blue-600" />
                <span className="font-extrabold text-sm text-black font-display">Codeforces</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold border border-blue-300">
                  Official REST API
                </span>
              </div>
              <span className={`text-xs font-mono font-bold flex items-center gap-1 ${handles.codeforces ? 'text-emerald-700' : 'text-black/40'}`}>
                {handles.codeforces ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Linked: @{handles.codeforces}
                  </>
                ) : (
                  'Not Connected'
                )}
              </span>
            </div>

            <p className="text-[11px] text-black/60">
              Queries <code>user.info</code> and <code>user.status</code> to count unique AC problem submissions and current contest rank.
            </p>

            <div className="pt-1">
              <input
                type="text"
                value={cfInput}
                onChange={(e) => setCfInput(e.target.value)}
                placeholder="e.g. tourist or your_codeforces_handle"
                className="w-full px-3 py-2 rounded-xl bg-white border border-black/15 text-black font-mono focus:outline-none focus:border-black font-medium"
              />
            </div>
          </div>

          {/* 3. GitHub Card */}
          <div className="p-4 rounded-2xl bg-[#F9F9F7] border-2 border-black/15 hover:border-black/30 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-black" />
                <span className="font-extrabold text-sm text-black font-display">GitHub</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/5 text-black font-bold border border-black/15">
                  Public REST API
                </span>
              </div>
              <span className={`text-xs font-mono font-bold flex items-center gap-1 ${handles.github ? 'text-emerald-700' : 'text-black/40'}`}>
                {handles.github ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Linked: @{handles.github}
                  </>
                ) : (
                  'Not Connected'
                )}
              </span>
            </div>

            <p className="text-[11px] text-black/60">
              Fetches public repositories, merged pull requests, and annual commit heatmap activity.
            </p>

            <div className="pt-1">
              <input
                type="text"
                value={ghInput}
                onChange={(e) => setGhInput(e.target.value)}
                placeholder="e.g. torvalds or your_github_username"
                className="w-full px-3 py-2 rounded-xl bg-white border border-black/15 text-black font-mono focus:outline-none focus:border-black font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={syncing}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-extrabold bg-black hover:bg-neutral-800 text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] active:translate-y-[1px] transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Fetching Live Data...' : 'Save Handles & Sync All Platforms'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Cache & Data Management (Section 9) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-black space-y-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between border-b border-black/10 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-black" />
            <h2 className="text-sm font-extrabold text-black font-display">
              Cache & Storage Controls (Section 9)
            </h2>
          </div>
          {cacheMessage && (
            <span className="text-xs font-mono font-bold text-emerald-700">{cacheMessage}</span>
          )}
        </div>

        <p className="text-xs text-black/60 leading-relaxed font-medium">
          The dashboard uses multi-tier caching (Level 1: React state, Level 2: Browser localStorage,
          Level 3: Node in-memory LRU cache) to avoid external API rate limits and minimize latency.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleClearCache}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-black/5 hover:bg-black/10 text-black border border-black/15 transition-all"
          >
            <Trash2 className="w-4 h-4 text-black" />
            Purge In-Memory & Browser Cache
          </button>

          <button
            onClick={handleResetData}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 transition-all"
          >
            <RotateCcw className="w-4 h-4 text-rose-600" />
            Reset Progress to Default (Clean)
          </button>
        </div>
      </div>

      {/* Viva / Academic Submission Reference */}
      <div className="p-6 rounded-3xl bg-[#F9F9F7] border-2 border-black/15 space-y-2 text-xs text-black/60 font-mono">
        <span className="text-black font-extrabold block uppercase tracking-wider font-display">
          Topic 7: Placement Preparation Dashboard
        </span>
        <p>
          Course: Lab Based Mini Projects 2026 – Full Stack Development II
        </p>
        <p className="text-black/50">
          Architecture: React 19 Components + Hooks + Node.js Express API + In-Memory Multi-Tier Cache
        </p>
      </div>
    </div>
  );
}
