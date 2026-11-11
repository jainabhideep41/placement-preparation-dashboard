/**
 * Jake's Resume Generator (Overleaf LaTeX & ATS Compatible)
 * 
 * Generates an ATS-optimized software engineering resume based on Jake Gutierrez's 
 * acclaimed Overleaf LaTeX template, dynamically populated from the candidate's public profile.
 */

export function escapeLatex(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([&%$#_{}])/g, '\\$1')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

export function sanitizeHandle(handle) {
  if (!handle) return '';
  let str = String(handle).trim();
  str = str.replace(/^https?:\/\/[^/]+\/(?:u\/|profile\/|in\/)?/i, '');
  str = str.replace(/^(?:u\/|@)/i, '');
  str = str.replace(/\/+$/, '');
  return str;
}

/**
 * Normalizes and extracts structured resume data from a candidate profile
 */
export function getResumeStructuredData(profile, options = {}) {
  const academic = profile?.academic || {};
  const handles = profile?.handles || {};
  const dsa = profile?.dsa || {};
  const lc = dsa?.leetcode || {};
  const cf = dsa?.codeforces || {};
  const gh = profile?.github || {};
  const rawProjects = profile?.projects || [];

  const name = profile?.name || profile?.identifier || 'Candidate Name';
  const role = profile?.targetRole || academic.desiredOption || 'Software Development Engineer (SDE-1)';
  const college = academic.college || 'Indian Institute of Information Technology';
  const degree = academic.degree || 'Bachelor of Technology in Computer Science & Engineering';
  const year = academic.year || '2022 -- 2026';
  const cgpa = academic.cgpa || '8.85 / 10.0';
  const location = profile?.location || academic.location || 'India';

  // Email with privacy resolution
  const rawEmail = profile?.email || profile?.userEmail || (profile?.identifier ? `${profile.identifier.toLowerCase()}@prepstack.dev` : 'candidate@prepstack.dev');
  const showEmail = options.includeEmail !== undefined
    ? Boolean(options.includeEmail)
    : (profile?.privacy?.showEmail !== false);
  const email = showEmail ? rawEmail : null;

  // Phone with privacy resolution
  const rawPhone = profile?.phone || academic.phone || '+91 98765 43210';
  const showPhone = options.includePhone !== undefined
    ? Boolean(options.includePhone)
    : (profile?.privacy?.showPhone ?? false);
  const phone = showPhone ? rawPhone : null;

  // Construct sanitized links
  const linkedinHandle = sanitizeHandle(handles.linkedin || profile?.identifier || 'candidate');
  const githubHandle = sanitizeHandle(handles.github || gh.username || profile?.identifier || 'github-user');
  const leetcodeHandle = sanitizeHandle(handles.leetcode || lc.username || profile?.identifier || 'leetcode-user');
  const codeforcesHandle = sanitizeHandle(handles.codeforces || cf.username || '');

  // Education details for 12th and 10th
  const class12 = academic.class12 || profile?.class12 || null;
  const class10 = academic.class10 || profile?.class10 || null;

  // Work Experience & Internships
  const rawExperience = Array.isArray(profile?.experience) ? profile.experience : [];
  const experience = rawExperience.map((exp, idx) => ({
    id: exp.id || `exp_${idx}`,
    role: exp.role || 'Software Engineering Intern',
    company: exp.company || 'Tech Company',
    location: exp.location || 'India',
    duration: exp.duration || '2024 -- 2025',
    bullets: Array.isArray(exp.bullets)
      ? exp.bullets
      : (typeof exp.bullets === 'string'
        ? exp.bullets.split('\n').map(s => s.trim().replace(/^[-*•]\s*/, '')).filter(Boolean)
        : [exp.description || 'Engineered production software features and collaborated with cross-functional teams.'])
  }));

  // Standardize projects (minimum 2 high-impact software projects)
  const defaultProjects = [
    {
      id: 'proj_prepstack',
      title: 'PrepStack — Placement Readiness & Developer Portfolio Engine',
      techStack: 'React 19, Node.js, Express, Tailwind CSS, Redis',
      githubUrl: `https://github.com/${githubHandle}/placement-preparation-dashboard`,
      liveDemo: 'https://prepstack.dev',
      date: '2024 -- Present',
      bullets: [
        'Engineered an enterprise-grade placement readiness dashboard unifying multi-platform coding analytics across LeetCode, Codeforces, and GitHub.',
        'Architected an in-memory canonical resolver and universal search index covering 365+ DSA problems, 16 System Design topics, and Full-Stack roadmaps.',
        'Implemented resilient local cache synchronization with zero-downtime offline fallbacks and sub-500ms Vite SPA builds.'
      ]
    },
    {
      id: 'proj_flashdrop',
      title: 'FlashDrop — High-Concurrency Flash Sale & Inventory Engine',
      techStack: 'Node.js, Redis, Apache Kafka, PostgreSQL, Docker',
      githubUrl: `https://github.com/${githubHandle}/flashdrop-inventory`,
      liveDemo: 'https://flashdrop.app',
      date: '2023 -- 2024',
      bullets: [
        'Benchmarked at 15,000+ orders/sec with zero overselling using Redis atomic Lua decrements and optimistic database locking.',
        'Decoupled order ingestion from database persistence using Apache Kafka streaming, reducing peak latency by 72%.',
        'Containerized multi-service architecture using Docker Compose and orchestrated automated CI/CD deployment pipelines.'
      ]
    }
  ];

  const candidateProjects = (Array.isArray(profile?.projects) && profile.projects.length > 0)
    ? profile.projects
    : (rawProjects.length > 0 ? rawProjects : defaultProjects);

  const standardizedProjects = candidateProjects.map((p, idx) => ({
    id: p.id || `proj_${idx}`,
    title: p.title || `Project ${idx + 1}`,
    techStack: Array.isArray(p.techStack) ? p.techStack.join(', ') : (p.techStack || 'React, Node.js, Express, PostgreSQL'),
    githubUrl: p.githubUrl || `https://github.com/${githubHandle}`,
    liveDemo: p.liveDemo || '',
    date: p.date || '2023 -- 2024',
    bullets: p.bullets || [
      p.description || 'Engineered high-performance web service with RESTful APIs and modern frontend design.',
      p.placementHighlight || 'Designed scalable schema with ACID transaction isolation and responsive UI architecture.',
      `Tracked verified open-source contributions with ${p.evidence?.commits || 40}+ commits and ${p.evidence?.pullRequests || 10}+ pull requests.`
    ]
  }));

  // Selected projects ticked by the user for resume
  const selectedResumeProjectIds = (options.selectedResumeProjectIds !== undefined && options.selectedResumeProjectIds !== null)
    ? options.selectedResumeProjectIds
    : (profile?.selectedResumeProjectIds || null);
  let projects = (Array.isArray(selectedResumeProjectIds) && selectedResumeProjectIds.length > 0)
    ? standardizedProjects.filter(p => selectedResumeProjectIds.includes(p.id))
    : standardizedProjects.slice(0, 2);
  if (projects.length === 0 && standardizedProjects.length > 0) {
    projects = standardizedProjects.slice(0, 2);
  }

  // Technical Skills (Modifiable with defaults)
  const defaultTechnicalSkills = {
    languages: 'C/C++, Java, Python, JavaScript (ES6+), TypeScript, SQL, HTML5/CSS3',
    frameworks: 'React 19, Next.js, Node.js, Express.js, Tailwind CSS, RESTful APIs, WebSockets',
    developerTools: 'Git, GitHub Actions, Docker, Linux/Unix, Postman, Vite, Vercel',
    databases: 'PostgreSQL, Redis (In-Memory Caching), MongoDB, MySQL',
    coreConcepts: 'Data Structures & Algorithms, High-Level System Design (HLD), Low-Level Design (LLD), Microservices, Concurrency'
  };

  const technicalSkills = {
    languages: profile?.technicalSkills?.languages || defaultTechnicalSkills.languages,
    frameworks: profile?.technicalSkills?.frameworks || defaultTechnicalSkills.frameworks,
    databases: profile?.technicalSkills?.databases || defaultTechnicalSkills.databases,
    developerTools: profile?.technicalSkills?.developerTools || defaultTechnicalSkills.developerTools,
    coreConcepts: profile?.technicalSkills?.coreConcepts || defaultTechnicalSkills.coreConcepts
  };

  // Competitive Programming, Achievements & Honors
  const totalSolves = dsa.totalSolves || 342;
  const lcSolves = lc.problemsSolved || 285;
  const lcRating = lc.contestRating || 1740;
  const lcRank = lc.ranking || 'Top 8.5%';
  const cfRating = cf.rating || 1380;
  const cfRank = cf.rank || 'Specialist';
  const ghCommits = gh.totalCommitsLastYear || 384;
  const ghPRs = gh.pullRequests || 24;
  const ghStars = gh.totalStars || 48;

  const parseBulletList = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(s => String(s).trim().replace(/^[-*•]\s*/, '')).filter(Boolean);
    if (typeof val === 'string') return val.split('\n').map(s => s.trim().replace(/^[-*•]\s*/, '')).filter(Boolean);
    return [];
  };

  const customAchievements = parseBulletList(profile.achievements || profile.academic?.achievements);
  const defaultAchievements = [
    `LeetCode: Solved ${lcSolves}+ algorithmic problems with contest rating of ${lcRating} (${lcRank} global); completed Striver's SDE Sheet & Blind 75.`,
    codeforcesHandle ? `Codeforces: Rated ${cfRating} (${cfRank}) under handle @${codeforcesHandle}; active participant in rated Division 2/3 rounds.` : `Codeforces: Rated ${cfRating} (${cfRank}); consistently active across division contests.`,
    `Open Source: Authored ${ghCommits}+ commits and ${ghPRs} pull requests with ${ghStars}+ stars across distributed systems & web dev repositories.`,
    `System Design & HLD: Verified mastery in distributed caching (Redis), horizontal scaling, rate limiting algorithms, and database sharding.`
  ];
  const achievements = customAchievements.length > 0 ? customAchievements : defaultAchievements;

  // Co-curricular & Extracurricular Activities
  const customExtracurriculars = parseBulletList(profile.extracurriculars || profile.academic?.extracurriculars);
  const defaultExtracurriculars = [
    'Technical Club Lead: Organized college hackathons, technical symposiums, and mentored junior engineering peers in DSA.',
    'Hackathon Finalist: Secured top 5 placement among 150+ teams in National Level Smart India Hackathon internal round.',
    'Competitive Programming Mentor: Led weekly problem-solving workshops and peer code reviews on data structures.'
  ];
  const extracurriculars = customExtracurriculars.length > 0 ? customExtracurriculars : defaultExtracurriculars;

  return {
    name,
    role,
    college,
    degree,
    year,
    cgpa,
    location,
    class12,
    class10,
    email,
    phone,
    linkedinHandle,
    githubHandle,
    leetcodeHandle,
    codeforcesHandle,
    experience,
    projects,
    allProjects: standardizedProjects,
    selectedResumeProjectIds,
    technicalSkills,
    achievements,
    extracurriculars,
    totalSolves
  };
}

/**
 * Generates exact Overleaf-compliant Jake's Resume LaTeX Code
 */
export function generateJakeResumeLatex(profile, options = {}) {
  const data = getResumeStructuredData(profile, options);

  const contactItems = [];
  if (data.phone) {
    contactItems.push(escapeLatex(data.phone));
  }
  if (data.email) {
    contactItems.push(`\\href{mailto:${data.email}}{\\underline{${escapeLatex(data.email)}}}`);
  }
  if (data.linkedinHandle) {
    contactItems.push(`\\href{https://linkedin.com/in/${data.linkedinHandle}}{\\underline{linkedin.com/in/${escapeLatex(data.linkedinHandle)}}}`);
  }
  if (data.githubHandle) {
    contactItems.push(`\\href{https://github.com/${data.githubHandle}}{\\underline{github.com/${escapeLatex(data.githubHandle)}}}`);
  }
  if (data.leetcodeHandle) {
    contactItems.push(`\\href{https://leetcode.com/u/${data.leetcodeHandle}}{\\underline{leetcode.com/u/${escapeLatex(data.leetcodeHandle)}}}`);
  }

  const contactLine = contactItems.join(' $|$ ');

  // Class 12 & Class 10 Education LaTeX
  let class12Latex = '';
  if (data.class12 && (data.class12.school || data.class12.score)) {
    const scoreStr = data.class12.score ? `; Aggregate: ${escapeLatex(data.class12.score)}` : '';
    class12Latex = `    \\resumeSubheading
      {${escapeLatex(data.class12.school || 'Senior Secondary School')}}{${escapeLatex(data.class12.board || 'CBSE')}}
      {Class XII (Senior Secondary)${scoreStr}}{${escapeLatex(data.class12.year || '2022')}}`;
  }

  let class10Latex = '';
  if (data.class10 && (data.class10.school || data.class10.score)) {
    const scoreStr = data.class10.score ? `; Aggregate: ${escapeLatex(data.class10.score)}` : '';
    class10Latex = `    \\resumeSubheading
      {${escapeLatex(data.class10.school || 'Secondary School')}}{${escapeLatex(data.class10.board || 'CBSE')}}
      {Class X (Secondary)${scoreStr}}{${escapeLatex(data.class10.year || '2020')}}`;
  }

  // Experience LaTeX
  const experienceLatex = (data.experience || []).map(exp => {
    const bulletsLatex = exp.bullets.map(b => `          \\resumeItem{${escapeLatex(b)}}`).join('\n');
    return `    \\resumeSubheading
      {${escapeLatex(exp.role)}}{${escapeLatex(exp.duration)}}
      {${escapeLatex(exp.company)}}{${escapeLatex(exp.location)}}
      \\resumeItemListStart
${bulletsLatex}
      \\resumeItemListEnd`;
  }).join('\n');

  const projectsLatex = data.projects.map(p => {
    const linkStr = p.githubUrl ? `\\href{${p.githubUrl}}{\\underline{GitHub}}` : '';
    const heading = `\\textbf{${escapeLatex(p.title)}} $|$ \\emph{${escapeLatex(p.techStack)}}`;
    const rightSide = `${escapeLatex(p.date)}${linkStr ? ` $|$ ${linkStr}` : ''}`;
    
    const bulletsLatex = p.bullets.map(b => `          \\resumeItem{${escapeLatex(b)}}`).join('\n');

    return `    \\resumeProjectHeading
        {${heading}}{${rightSide}}
        \\resumeItemListStart
${bulletsLatex}
        \\resumeItemListEnd`;
  }).join('\n');

  const achievementsLatex = data.achievements.map(a => `    \\resumeItem{${escapeLatex(a)}}`).join('\n');
  const extracurricularsLatex = (data.extracurriculars || []).length > 0
    ? data.extracurriculars.map(e => `    \\resumeItem{${escapeLatex(e)}}`).join('\n')
    : '';

  return `%-------------------------
% Resume in Latex
% Format : Jake Gutierrez Overleaf Template
% Generated by: PrepStack Platform (https://prepstack.dev)
% License : MIT
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

% Set font and page options
\\pagestyle{fancy}
\\fancyhf{} % clear all header and footer fields
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins to fit 1-page ATS standard
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

% Ensure that generated pdf is machine readable/ATS parsable
\\pdfgentounicode=1

%-------------------------
% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\begin{document}

%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge \\scshape ${escapeLatex(data.name)}} \\\\ \\vspace{2pt}
    \\small ${contactLine}
\\end{center}

%-----------EDUCATION-----------
\\section{Education}
  \\resumeSubHeadingListStart
    \\resumeSubheading
      {${escapeLatex(data.college)}}{${escapeLatex(data.location)}}
      {${escapeLatex(data.degree)}; CGPA: ${escapeLatex(data.cgpa)}}{${escapeLatex(data.year)}}
${class12Latex ? `${class12Latex}\n` : ''}${class10Latex ? `${class10Latex}\n` : ''}  \\resumeSubHeadingListEnd
${experienceLatex ? `
%-----------EXPERIENCE-----------
\\section{Experience}
  \\resumeSubHeadingListStart
${experienceLatex}
  \\resumeSubHeadingListEnd
` : ''}

%-----------TECHNICAL SKILLS-----------
\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
     \\textbf{Languages}{: ${escapeLatex(data.technicalSkills.languages)}} \\\\
     \\textbf{Frameworks \\& Libraries}{: ${escapeLatex(data.technicalSkills.frameworks)}} \\\\
     \\textbf{Databases \\& Caching}{: ${escapeLatex(data.technicalSkills.databases)}} \\\\
     \\textbf{Cloud \\& Developer Tools}{: ${escapeLatex(data.technicalSkills.developerTools)}} \\\\
     \\textbf{Core Competencies}{: ${escapeLatex(data.technicalSkills.coreConcepts)}}
    }}
 \\end{itemize}

%-----------PROJECTS-----------
\\section{Projects}
  \\resumeSubHeadingListStart
${projectsLatex}
  \\resumeSubHeadingListEnd

%-----------ACHIEVEMENTS & HONORS-----------
\\section{Achievements \\& Honors}
  \\resumeItemListStart
${achievementsLatex}
  \\resumeItemListEnd
${extracurricularsLatex ? `
%-----------CO-CURRICULAR & EXTRACURRICULAR ACTIVITIES-----------
\\section{Co-curricular \\& Extracurricular Activities}
  \\resumeItemListStart
${extracurricularsLatex}
  \\resumeItemListEnd` : ''}

\\end{document}
`;
}

/**
 * Triggers a direct browser download of the Jake's Resume .tex file
 */
export function downloadLatexFile(profile, filenameOverride = null, options = {}) {
  const latexContent = generateJakeResumeLatex(profile, options);
  const data = getResumeStructuredData(profile, options);
  const cleanName = data.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = filenameOverride || `${cleanName}_Jake_Resume.tex`;

  const blob = new Blob([latexContent], { type: 'text/x-tex;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
