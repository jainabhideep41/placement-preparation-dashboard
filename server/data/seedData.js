/**
 * Seed & Initial Baseline Data for PREPSTACK Dashboard
 * Initial state is pristine and unlinked for incoming students.
 * Progress and stats populate dynamically as real accounts are linked or milestones completed.
 */

export const defaultDSAData = {
  platforms: {
    leetcode: {
      platform: "leetcode",
      username: "",
      connected: false,
      problemsSolved: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      contestRating: 0,
      ranking: "Unlinked",
      contestsAttended: 0,
      lastUpdated: null,
      status: "unlinked"
    },
    codeforces: {
      platform: "codeforces",
      username: "",
      connected: false,
      problemsSolved: 0,
      rating: 0,
      maxRating: 0,
      rank: "unranked",
      maxRank: "unranked",
      contestsAttended: 0,
      lastUpdated: null,
      status: "unlinked"
    },
    atcoder: {
      platform: "atcoder",
      username: "",
      connected: false,
      problemsSolved: 0,
      rating: 0,
      maxRating: 0,
      rank: "unranked",
      contestsAttended: 0,
      lastUpdated: null,
      status: "unlinked"
    },
    hackerrank: {
      platform: "hackerrank",
      username: "",
      connected: false,
      problemsSolved: 0,
      badges: [],
      score: 0,
      lastUpdated: null,
      status: "unlinked"
    }
  },
  topics: [
    { id: "arrays", name: "Arrays & Two Pointers", solved: 0, total: 55, category: "Foundation" },
    { id: "strings", name: "Strings & Hashing", solved: 0, total: 45, category: "Foundation" },
    { id: "binary_search", name: "Binary Search", solved: 0, total: 35, category: "Foundation" },
    { id: "linked_list", name: "Linked List", solved: 0, total: 25, category: "Data Structures" },
    { id: "stack_queue", name: "Stack & Queue", solved: 0, total: 30, category: "Data Structures" },
    { id: "trees", name: "Binary Trees & BST", solved: 0, total: 50, category: "Data Structures" },
    { id: "heaps", name: "Heaps & Priority Queues", solved: 0, total: 25, category: "Data Structures" },
    { id: "graphs", name: "Graphs (BFS, DFS, Dijkstra)", solved: 0, total: 45, category: "Advanced" },
    { id: "dp", name: "Dynamic Programming", solved: 0, total: 60, category: "Advanced" },
    { id: "greedy", name: "Greedy Algorithms", solved: 0, total: 30, category: "Advanced" },
    { id: "backtracking", name: "Backtracking & Recursion", solved: 0, total: 25, category: "Advanced" },
    { id: "trie", name: "Trie & Bit Manipulation", solved: 0, total: 20, category: "Advanced" }
  ],
  sheets: [
    {
      id: "striver_sde",
      title: "Striver's SDE Sheet (180)",
      description: "Standard 180 curated problems asked in top-tier tech placement interviews.",
      totalProblems: 180,
      completedProblems: 0,
      category: "Interview Preparation"
    },
    {
      id: "blind_75",
      title: "Blind 75 Essential DSA",
      description: "The core 75 LeetCode problems covering all fundamental patterns.",
      totalProblems: 75,
      completedProblems: 0,
      category: "Patterns"
    },
    {
      id: "neetcode_150",
      title: "NeetCode 150 Roadmap",
      description: "Structured progressive list grouped by pattern and algorithmic difficulty.",
      totalProblems: 150,
      completedProblems: 0,
      category: "Patterns"
    },
    {
      id: "cp_essentials",
      title: "Codeforces Edu & CP Essentials",
      description: "Speed, greedy heuristics, number theory, and contest-specific problem solving.",
      totalProblems: 100,
      completedProblems: 0,
      category: "Competitive Programming"
    }
  ],
  problems: []
};

export const defaultWebDevData = {
  roadmaps: [
    {
      id: "frontend",
      title: "Frontend Engineering",
      icon: "Layout",
      description: "Modern client-side development with React, TypeScript, and state architecture.",
      milestones: [
        { id: "fe_1", title: "Semantic HTML5 & Accessibility (WCAG)", completed: false },
        { id: "fe_2", title: "CSS3 Flexbox, Grid & Responsive Design", completed: false },
        { id: "fe_3", title: "JavaScript ES6+ (Closures, Promises, Event Loop)", completed: false },
        { id: "fe_4", title: "React Component Architecture & Custom Hooks", completed: false },
        { id: "fe_5", title: "Global State Management (Context API / Redux Toolkit)", completed: false },
        { id: "fe_6", title: "TypeScript Types, Generics & Interfaces", completed: false },
        { id: "fe_7", title: "Web Performance & Core Web Vitals (LCP, FID, CLS)", completed: false },
        { id: "fe_8", title: "Client-Side Unit & Integration Testing (Vitest/Jest)", completed: false }
      ]
    },
    {
      id: "backend",
      title: "Backend & Systems API",
      icon: "Server",
      description: "Scalable server architectures, RESTful design, authentication and caching.",
      milestones: [
        { id: "be_1", title: "Node.js Runtime & Asynchronous Event Loop", completed: false },
        { id: "be_2", title: "Express.js Routing, Middleware & Error Handlers", completed: false },
        { id: "be_3", title: "RESTful API Design & Status Code Standards", completed: false },
        { id: "be_4", title: "Authentication (JWT, HTTP-Only Cookies & OAuth2)", completed: false },
        { id: "be_5", title: "Rate Limiting, Security Headers (Helmet, CORS)", completed: false },
        { id: "be_6", title: "Message Queues & Background Workers (BullMQ)", completed: false },
        { id: "be_7", title: "WebSockets & Real-time Bidirectional Streaming", completed: false }
      ]
    },
    {
      id: "databases",
      title: "Database Engineering",
      icon: "Database",
      description: "Relational modeling, NoSQL document design, indexing and transactions.",
      milestones: [
        { id: "db_1", title: "Relational Schema Design & Normalization (1NF–3NF)", completed: false },
        { id: "db_2", title: "PostgreSQL / MySQL Joins, Aggregations & Subqueries", completed: false },
        { id: "db_3", title: "ACID Properties & Transaction Isolation Levels", completed: false },
        { id: "db_4", title: "B-Tree Indexing Strategies & Query Optimization", completed: false },
        { id: "db_5", title: "MongoDB Document Schema & Aggregation Pipelines", completed: false },
        { id: "db_6", title: "Redis In-Memory Key-Value Caching & TTL Expiry", completed: false }
      ]
    },
    {
      id: "devops",
      title: "DevOps, CI/CD & Deployment",
      icon: "Terminal",
      description: "Production readiness, containerization, pipelines and monitoring.",
      milestones: [
        { id: "do_1", title: "Git Branching Workflows (Git Flow, Trunk Based)", completed: false },
        { id: "do_2", title: "GitHub Actions CI/CD Automated Pipelines", completed: false },
        { id: "do_3", title: "Docker Containerization & Multi-stage Builds", completed: false },
        { id: "do_4", title: "Cloud Deployment (Vercel, Render, Railway, AWS)", completed: false },
        { id: "do_5", title: "Environment Configuration & Secret Management", completed: false },
        { id: "do_6", title: "Logging, Observability & Health Check Probes", completed: false }
      ]
    }
  ],
  projects: [
    {
      id: "proj_prepstack",
      title: "PrepStack — Technical Placement Readiness & Developer Portfolio Engine",
      description: "Single-page dashboard with real-time LeetCode/Codeforces tracking, milestone-based skill verification, and transactional auth pipeline.",
      techStack: ["React 19", "Node.js", "Express", "Tailwind CSS", "Nodemailer", "Resend API", "OAuth 2.0"],
      githubUrl: "https://github.com/jainabhideep41/placement-preparation-dashboard",
      liveDemo: "https://placement-preparation-dashboard-five.vercel.app",
      evidence: { commits: 142, pullRequests: 18, issuesResolved: 12, stars: 48, forks: 14 },
      status: "Production",
      placementHighlight: "Engineered SPA route generation for zero 404s, unified multi-provider authentication, and real-time algorithmic solve analytics."
    },
    {
      id: "proj_synccanvas",
      title: "SyncCanvas — Real-Time Collaborative Whiteboard & Vector Engine",
      description: "High-frequency real-time drawing synchronization supporting 50+ concurrent users per room with sub-30ms latency using Conflict-Free Replicated Data Types (CRDTs).",
      techStack: ["React", "HTML5 Canvas", "WebSockets", "Node.js", "Redis Pub/Sub", "CRDT (Yjs)"],
      githubUrl: "https://github.com/jainabhideep41/collaborative-whiteboard",
      liveDemo: "https://synccanvas.dev",
      evidence: { commits: 86, pullRequests: 9, issuesResolved: 7, stars: 34, forks: 8 },
      status: "Completed",
      placementHighlight: "Resolved concurrent stroke conflicts using Yjs CRDTs, eliminating server-side locking bottlenecks."
    },
    {
      id: "proj_pulsequeue",
      title: "PulseQueue — Distributed Fault-Tolerant Task Scheduler & Worker Pool",
      description: "Robust background job processing engine handling 10,000+ jobs/minute with exponential backoff retries, priority queues, and dead-letter queue (DLQ) alerts.",
      techStack: ["Node.js", "Redis", "BullMQ", "PostgreSQL", "Docker", "Prometheus"],
      githubUrl: "https://github.com/jainabhideep41/distributed-job-queue",
      liveDemo: "https://pulsequeue.io",
      evidence: { commits: 64, pullRequests: 8, issuesResolved: 5, stars: 29, forks: 6 },
      status: "Completed",
      placementHighlight: "Implemented distributed worker heartbeats with auto-recovery for abandoned tasks and idempotent job handlers."
    },
    {
      id: "proj_flashdrop",
      title: "FlashDrop — High-Concurrency Flash Sale & Inventory Reservation Engine",
      description: "Benchmarked at 15,000 requests/sec with zero inventory overselling using Redis atomic Lua decrements, Kafka event buffering, and optimistic database locking.",
      techStack: ["Node.js", "Express", "Redis", "Apache Kafka", "PostgreSQL", "Tailwind CSS"],
      githubUrl: "https://github.com/jainabhideep41/flash-sale-engine",
      liveDemo: "https://flashdrop.app",
      evidence: { commits: 78, pullRequests: 11, issuesResolved: 9, stars: 42, forks: 11 },
      status: "Completed",
      placementHighlight: "Eliminated database row-lock contention by decoupling stock verification into in-memory Redis Lua scripts."
    }
  ]
};

export const defaultSystemDesignData = {
  topics: [
    {
      id: "fundamentals",
      name: "System Fundamentals",
      category: "Core",
      description: "Latency vs Throughput, Availability (99.99%), CAP Theorem, PACELC Theorem.",
      completed: false,
      milestones: ["Latency vs Throughput", "CAP Theorem trade-offs", "SLA / SLO / Error Budgets", "Horizontal vs Vertical Scaling"]
    },
    {
      id: "networking",
      name: "Networking & Protocols",
      category: "Infrastructure",
      description: "DNS resolution flow, TCP 3-way handshake, HTTP/1.1 vs HTTP/2 vs HTTP/3, WebSockets, gRPC.",
      completed: false,
      milestones: ["DNS & Anycast Routing", "TCP / UDP & TLS Handshake", "HTTP/2 Multiplexing & HTTP/3 QUIC", "WebSockets vs Server-Sent Events"]
    },
    {
      id: "scalability",
      name: "Scalability & Load Balancing",
      category: "Infrastructure",
      description: "L4 vs L7 Load Balancers, Round Robin, Least Connections, Consistent Hashing, CDN Edge Caching.",
      completed: false,
      milestones: ["L4 vs L7 Reverse Proxies (Nginx/HAProxy)", "Consistent Hashing algorithm", "CDN dynamic vs static edge caching", "Cache-Aside, Write-Through, Write-Behind"]
    },
    {
      id: "databases_storage",
      name: "Databases & Storage Engines",
      category: "Data",
      description: "SQL vs NoSQL, Master-Slave Replication, Sharding, Read Replicas, Partitioning strategies.",
      completed: false,
      milestones: ["Database Sharding & Partition Keys", "Replication lag & Read Replicas", "LSM-Trees vs B-Trees", "Eventual Consistency vs Strong Consistency"]
    },
    {
      id: "distributed_systems",
      name: "Distributed Systems Patterns",
      category: "Architecture",
      description: "Idempotency keys, Saga pattern, Distributed locks, Message queues, Rate limiting algorithms.",
      completed: false,
      milestones: ["Token Bucket & Leaky Bucket Rate Limiting", "Distributed Transactions (2PC vs Saga)", "Distributed Locks with Redis Redlock", "Message Brokers (Kafka event logs vs RabbitMQ)"]
    },
    {
      id: "lld_design_patterns",
      name: "Low-Level Design (LLD)",
      category: "Design",
      description: "SOLID principles, Factory, Singleton, Strategy, Observer, Decorator, State pattern.",
      completed: false,
      milestones: ["SOLID Principles in Practice", "Creational: Factory & Builder Pattern", "Behavioral: Observer & Strategy Pattern", "Structural: Adapter & Facade Pattern"]
    }
  ],
  caseStudies: [
    {
      id: "cs_url_shortener",
      title: "Design a High-Throughput URL Shortener (TinyURL)",
      difficulty: "Medium",
      status: "Planned",
      summary: "100M URLs created/day, read-to-write ratio 10:1. Base62 encoding, distributed ID generation (Snowflake), Redis LRU caching, and 301 vs 302 redirect trade-offs.",
      keyConcepts: ["Base62 encoding", "KGS (Key Generation Service)", "Redis Cache-Aside", "301 Permanent vs 302 Temporary Redirects"]
    },
    {
      id: "cs_chat_system",
      title: "Design a Real-Time Chat Application (WhatsApp/Slack)",
      difficulty: "Hard",
      status: "Planned",
      summary: "Millions of concurrent active connections. WebSocket gateways, Redis Pub/Sub, Cassandra for append-only message history, and message delivery status (sent, delivered, read).",
      keyConcepts: ["Persistent WebSockets", "Redis Pub/Sub broker", "Cassandra wide-column storage", "Presence indicator heartbeat"]
    },
    {
      id: "cs_rate_limiter",
      title: "Design a Distributed API Rate Limiter",
      difficulty: "Medium",
      status: "Planned",
      summary: "Prevent abuse across distributed cluster. Token Bucket algorithm using Redis Lua scripts for atomicity, Sliding Window Counter, and HTTP 429 Too Many Requests.",
      keyConcepts: ["Token Bucket vs Sliding Window", "Redis Lua script atomicity", "Memory-efficient counters", "Graceful client throttling"]
    },
    {
      id: "cs_video_streaming",
      title: "Design a Global Video Streaming Platform (YouTube/Netflix)",
      difficulty: "Hard",
      status: "Planned",
      summary: "Transcoding pipeline (DASH / HLS adaptive bitrate), CDN edge distribution, metadata storage in distributed SQL, and video chunking.",
      keyConcepts: ["Adaptive Bitrate Streaming (HLS/DASH)", "CDN Edge caching", "Blob storage (AWS S3)", "Video encoding DAG pipeline"]
    },
    {
      id: "cs_twitter_feed",
      title: "Design a Scalable News Feed & Notification Engine (Twitter/X)",
      difficulty: "Hard",
      status: "Planned",
      summary: "Fan-out on write vs fan-out on read trade-offs, celebrity problem mitigation, and sub-100ms timeline rendering using Redis lists.",
      keyConcepts: ["Fan-Out On Write vs Read", "Celebrity / Hotspot Hybrid", "Redis Timeline Cache", "Push vs Pull Architecture"]
    },
    {
      id: "cs_uber_ride",
      title: "Design a Real-Time Ride Matching & Location Engine (Uber/Lyft)",
      difficulty: "Hard",
      status: "Planned",
      summary: "Geospatial indexing with Uber H3 hexagonal hierarchical spatial index, dynamic driver location tracking via WebSockets, and distributed matching dispatch.",
      keyConcepts: ["Uber H3 Hexagonal Grid", "QuadTree / Geohash", "WebSocket Driver Ping", "Distributed Ride Dispatch"]
    },
    {
      id: "cs_flash_sale",
      title: "Design a High-Concurrency Flash Sale System (Hotstar/Amazon)",
      difficulty: "Hard",
      status: "Planned",
      summary: "Prevent overselling under 100,000 QPS burst traffic using Redis atomic Lua decrements, Kafka event streaming, and optimistic DB locking.",
      keyConcepts: ["Redis Lua Atomic Decrement", "Kafka Async Buffering", "Optimistic Locking", "Idempotent Orders"]
    },
    {
      id: "cs_web_crawler",
      title: "Design a Distributed Web Crawler (Google Search)",
      difficulty: "Hard",
      status: "Planned",
      summary: "Crawl 1 billion web pages per month. URL frontier with politeness constraints, HTML parser, duplicate URL elimination using Bloom Filters.",
      keyConcepts: ["URL Frontier", "Bloom Filters for Deduplication", "Robots.txt parser", "Politeness per Hostname"]
    },
    {
      id: "cs_dropbox_sync",
      title: "Design a Cloud File Storage & Synchronization Engine (Dropbox/Drive)",
      difficulty: "Hard",
      status: "Planned",
      summary: "Chunking files into 4MB blocks, deduplication using SHA-256 hashes, delta synchronization, and cross-device conflict resolution using vector clocks.",
      keyConcepts: ["4MB Block Chunking", "Content-Addressed Storage", "Delta Synchronization", "Vector Clocks & Versioning"]
    },
    {
      id: "cs_code_judge",
      title: "Design a Scalable Online Code Judge (LeetCode/Codeforces)",
      difficulty: "Hard",
      status: "Planned",
      summary: "Secure sandboxed untrusted code execution using Linux Docker/cgroups/seccomp, Redis worker queues, and real-time execution result streaming.",
      keyConcepts: ["Linux cgroups & namespaces", "Seccomp syscall filtering", "Redis Worker Pool", "Server-Sent Events / WebSockets"]
    }
  ]
};

export const defaultGitHubData = {
  profile: {
    username: "",
    name: "Student",
    avatarUrl: "",
    bio: "Link your GitHub account to track repositories, commits, and open-source contributions.",
    publicRepos: 0,
    followers: 0,
    following: 0,
    joinedYear: 2026,
    location: "College Campus",
    totalStars: 0,
    totalCommitsLastYear: 0,
    pullRequests: 0,
    mergedPullRequests: 0,
    issuesResolved: 0,
    codeReviews: 0
  },
  fossContributions: [],
  repositories: []
};
