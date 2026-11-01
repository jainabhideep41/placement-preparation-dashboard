/**
 * Comprehensive Web Development, Full-Stack & Systems Hub Data
 * Designed for FAANG and Tier-1 Product Company Placement Preparation (SDE-1 & Full-Stack)
 */

export const webDevRoadmaps = [
  {
    id: "frontend",
    title: "Frontend Engineering & Client Architecture",
    icon: "Layout",
    badge: "Client-Side",
    description: "Modern client-side engineering with React 19, TypeScript, global state architecture, and web performance optimization.",
    milestones: [
      {
        id: "fe_1",
        title: "Semantic HTML5, Accessibility (a11y) & DOM Architecture",
        badge: "Foundation",
        readTime: "8 min",
        completed: false,
        summary: "Semantic elements, ARIA roles, keyboard navigation, and WCAG 2.1 AA compliance standards required in enterprise products.",
        concept: `### Semantic HTML5 & Enterprise Accessibility (a11y)
1. **Why Semantics Matter:** Using \`<main>\`, \`<nav>\`, \`<article>\`, \`<section>\`, \`<header>\`, and \`<footer>\` provides structure for assistive technologies (screen readers) and SEO crawlers.
2. **WCAG 2.1 AA Checklist:**
   - **Color Contrast:** Minimum 4.5:1 ratio for normal text, 3:1 for large text.
   - **Keyboard Navigation:** All interactive elements must be reachable via \`Tab\` and operable via \`Enter\` or \`Space\`.
   - **Focus Indicators:** Never use \`outline: none\` without providing an accessible \`:focus-visible\` replacement.
   - **ARIA Roles & Attributes:** Use native elements first; use ARIA (\`aria-expanded\`, \`aria-live\`, \`aria-labelledby\`) only when native elements lack semantics.`,
        codeSnippet: `<!-- Accessible Modal Dialog Example -->
<div 
  role="dialog" 
  aria-modal="true" 
  aria-labelledby="dialog-title" 
  class="modal-backdrop"
>
  <div class="modal-card">
    <h2 id="dialog-title">Confirm Account Deletion</h2>
    <p>This action is irreversible. All student progress will be purged.</p>
    <div class="modal-actions">
      <button type="button" class="btn-cancel">Cancel</button>
      <button type="button" class="btn-danger" autoFocus>Confirm Delete</button>
    </div>
  </div>
</div>`,
        interviewQA: [
          {
            q: "What is the difference between aria-live='polite' and aria-live='assertive'?",
            a: "'aria-live' instructs screen readers to announce dynamic content updates. 'polite' waits until the user is idle before announcing the message (ideal for toasts or progress updates). 'assertive' interrupts current speech immediately to announce the update (reserved for critical errors or time-sensitive alerts)."
          }
        ]
      },
      {
        id: "fe_2",
        title: "Modern CSS Architecture: Flexbox, Grid & Container Queries",
        badge: "Styling",
        readTime: "10 min",
        completed: false,
        summary: "CSS Grid vs Flexbox layout models, mobile-first responsive architecture, fluid typography, and container queries.",
        concept: `### Flexbox vs CSS Grid Mental Model
- **Flexbox (1-Dimensional):** Designed for components aligned along a single axis (either row OR column). Perfect for navigation bars, button groups, vertical card content.
- **CSS Grid (2-Dimensional):** Designed for simultaneous layout across rows AND columns. Ideal for overall page skeletons, photo galleries, responsive dashboard grids.
- **Container Queries (\`@container\`):** Applies styles based on the size of the parent container rather than the browser viewport, enabling truly modular component-driven design.`,
        codeSnippet: `/* Production CSS Grid Responsive Dashboard Card */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

/* Container query for responsive card internal layout */
.card-wrapper {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .metric-card {
    flex-direction: row;
    justify-content: space-between;
  }
}`,
        interviewQA: [
          {
            q: "What causes CSS specificity wars and how does the CSS Cascade Layers (@layer) solve it?",
            a: "Specificity wars occur when developers use chained selectors or !important to override third-party or utility styles. CSS Cascade Layers (@layer) allows developers to define explicit priority orders (e.g., @layer reset, framework, components, utilities). Rules in a higher layer always override lower layers regardless of selector specificity."
          }
        ]
      },
      {
        id: "fe_3",
        title: "JavaScript ES6+ Deep Dive: Closures, Event Loop & Promises",
        badge: "Core JS",
        readTime: "15 min",
        completed: false,
        summary: "V8 memory model, call stack, microtask vs macrotask execution order, closures, and async concurrency.",
        concept: `### JavaScript Runtime & Event Loop Architecture
1. **Call Stack:** Single-threaded execution stack (Last-In, First-Out).
2. **Web APIs:** Browser background threads handling timers (\`setTimeout\`), network I/O (\`fetch\`), DOM events.
3. **Task Queues:**
   - **Microtask Queue:** \`Promise.then/catch/finally\`, \`queueMicrotask\`, \`MutationObserver\`. **Executed completely after every stack frame before browser repaints!**
   - **Macrotask Queue (Callback Queue):** \`setTimeout\`, \`setInterval\`, \`setImmediate\` (Node.js), I/O callbacks. Executed one per event loop tick.
4. **Closures:** A function bundled together with references to its surrounding lexical environment. Allows private state encapsulation and function currying.`,
        codeSnippet: `// Event loop priority demonstration: Guess the exact output order!
console.log('1: Sync Start');

setTimeout(() => {
  console.log('2: Macrotask (setTimeout)');
}, 0);

Promise.resolve().then(() => {
  console.log('3: Microtask 1');
}).then(() => {
  console.log('4: Microtask 2');
});

queueMicrotask(() => {
  console.log('5: Microtask 3');
});

console.log('6: Sync End');

// Output Order: 1 -> 6 -> 3 -> 5 -> 4 -> 2`,
        interviewQA: [
          {
            q: "What is a Memory Leak in JavaScript and what are the top 3 causes in single-page apps?",
            a: "A memory leak occurs when unreferenced objects remain in heap memory because accidental references prevent the Garbage Collector from freeing them. Top 3 causes: 1) Uncleaned event listeners on window/document. 2) Uncleared setInterval timers retaining scoped variables. 3) Retaining detached DOM nodes in JavaScript variables or global caches."
          }
        ]
      },
      {
        id: "fe_4",
        title: "React 19 Architecture: Component Lifecycle, Hooks & Concurrent Features",
        badge: "React",
        readTime: "15 min",
        completed: false,
        summary: "React 19 Compiler, Concurrent rendering, useTransition, useOptimistic, custom hooks, and memoization strategies.",
        concept: `### React 19 & Concurrent Mode Principles
1. **Concurrent Rendering:** React can interrupt, pause, or abandon in-flight renders to prioritize high-priority user interactions (typing, clicking) over heavy background computations.
2. **\`useTransition\`:** Marks state updates as non-blocking transitions. Prevents UI freezes during search filtering or tab switching.
3. **\`useOptimistic\`:** Renders immediate optimistic UI updates before network requests complete (e.g. instant like counter or message bubble).
4. **Custom Hooks:** Extracts stateful business logic into reusable, testable functions without altering component hierarchy.`,
        codeSnippet: `// Example: Production useTransition & useOptimistic in React 19
import { useState, useTransition, useOptimistic } from 'react';

export function ProblemSolver({ problem, onSolve }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticSolved, setOptimisticSolved] = useOptimistic(
    problem.isSolved,
    (current, update) => update
  );

  const handleToggle = () => {
    startTransition(async () => {
      setOptimisticSolved(!optimisticSolved); // Immediate UI update!
      await onSolve(problem.id);
    });
  };

  return (
    <button onClick={handleToggle} disabled={isPending} className="solve-btn">
      {optimisticSolved ? '✓ Solved' : '○ Mark Solved'}
    </button>
  );
}`,
        interviewQA: [
          {
            q: "When should you NOT use useMemo and useCallback in React?",
            a: "Do not use them prematurely for cheap calculations or simple components. Memoization has a non-zero overhead: creating dependency arrays, closure allocations, and comparison checks. Only use them when: 1) Passing callbacks to heavily optimized memoized child components (React.memo). 2) Passing objects into dependency arrays of other hooks. 3) Truly expensive computations (e.g. sorting/filtering 10,000+ records)."
          }
        ]
      },
      {
        id: "fe_5",
        title: "State Architecture: Global Client State (Zustand) vs Server State (TanStack Query)",
        badge: "State",
        readTime: "12 min",
        completed: false,
        summary: "Separating ephemeral UI state from asynchronous server cache, optimistic mutations, and cache invalidation.",
        concept: `### The Modern State Separation Principle
- **Client/UI State:** Ephemeral, synchronous, client-owned data (active modal state, theme toggle, sidebar collapsed). Use lightweight stores like **Zustand**.
- **Server Cache State:** Remote, asynchronous, shared data that requires caching, refetching, and deduplication (problems list, user profile, analytics). Use **TanStack Query (React Query)** instead of bloated Redux thunks.`,
        codeSnippet: `// Example: Modern Zustand Store for Global Dashboard Preferences
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useDashboardStore = create(
  persist(
    (set) => ({
      activeCategory: 'All',
      difficultyFilter: 'All',
      setActiveCategory: (cat) => set({ activeCategory: cat }),
      setDifficultyFilter: (diff) => set({ difficultyFilter: diff }),
      resetFilters: () => set({ activeCategory: 'All', difficultyFilter: 'All' })
    }),
    { name: 'prepstack_dashboard_prefs' }
  )
);`,
        interviewQA: [
          {
            q: "Why is storing remote server data in Redux considered an anti-pattern in modern applications?",
            a: "Traditional Redux requires manual handling of loading states, error states, request deduplication, cache timeouts, background refetching on window focus, and cache invalidation—resulting in hundreds of lines of boilerplate. Server state libraries like TanStack Query handle caching, stale-while-revalidate, and deduplication automatically, leaving Redux/Zustand solely for true client-side UI state."
          }
        ]
      },
      {
        id: "fe_6",
        title: "TypeScript for Enterprise: Generics, Utility Types & Discriminated Unions",
        badge: "TypeScript",
        readTime: "14 min",
        completed: false,
        summary: "Strict type safety, generic constraints, mapped types, discriminated unions for state modeling, and type narrowing.",
        concept: `### Advanced TypeScript Patterns for Robust Frontends
1. **Discriminated Unions (Tagged Unions):** The safest way to model asynchronous states, making invalid states unrepresentable at compile time.
2. **Generics (\`<T>\`):** Enables components and API clients to work across multiple data shapes while retaining full type inference.
3. **Key Utility Types:** \`Partial<T>\`, \`Required<T>\`, \`Pick<T, K>\`, \`Omit<T, K>\`, \`Record<K, V>\`, \`ReturnType<T>\`.`,
        codeSnippet: `// Example: Production Discriminated Union for API States
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T; timestamp: number }
  | { status: 'error'; error: Error };

function renderUI<T>(state: AsyncState<T>) {
  switch (state.status) {
    case 'idle':
      return 'Ready to fetch';
    case 'loading':
      return 'Loading...';
    case 'success':
      // TypeScript guarantees state.data is valid T here!
      return JSON.stringify(state.data);
    case 'error':
      return state.error.message;
  }
}`,
        interviewQA: [
          {
            q: "What is the difference between 'any', 'unknown', and 'never' in TypeScript?",
            a: "'any' disables type checking completely and allows any operation. 'unknown' is the type-safe counterpart: you can assign anything to it, but you cannot perform operations on it until you narrow its type (via typeof, instanceof, or type guards). 'never' represents values that can never occur (e.g. the return type of a function that always throws an error or has an infinite loop, or the exhaustive check in a switch statement)."
          }
        ]
      },
      {
        id: "fe_7",
        title: "Web Performance & Core Web Vitals (LCP, INP, CLS)",
        badge: "Performance",
        readTime: "12 min",
        completed: false,
        summary: "Optimizing Largest Contentful Paint, Interaction to Next Paint, and Cumulative Layout Shift using code-splitting and asset budgets.",
        concept: `### The Three Google Core Web Vitals (2026 Standards)
1. **Largest Contentful Paint (LCP):** Measures perceived loading speed. Marks when the largest content element (hero image, heading) renders. Target: **< 2.5 seconds**.
   - *Fixes:* Preload hero images, use responsive WebP/AVIF formats, inline critical CSS, deploy Edge CDNs.
2. **Interaction to Next Paint (INP):** Replaced FID. Measures page responsiveness to all user clicks and keypresses. Target: **< 200 milliseconds**.
   - *Fixes:* Break long tasks using \`scheduler.yield()\` or \`setTimeout\`, debounce input handlers, minimize DOM recalculations.
3. **Cumulative Layout Shift (CLS):** Measures visual stability. Target: **< 0.1**.
   - *Fixes:* Always set explicit \`width\` and \`height\` on images/videos, avoid inserting dynamic content above existing content without reserved space, use CSS \`aspect-ratio\`.`,
        codeSnippet: `// Example: Dynamic React Import with Suspense for Route-Level Code Splitting
import React, { lazy, Suspense } from 'react';

// Chunks loaded on demand, decreasing initial bundle size by 60%!
const DSA = lazy(() => import('../pages/DSA'));
const SystemDesign = lazy(() => import('../pages/SystemDesign'));

export function AppRoutes() {
  return (
    <Suspense fallback={<div className="loading-spinner">Loading module...</div>}>
      <Routes>
        <Route path="/dsa" element={<DSA />} />
        <Route path="/system-design" element={<SystemDesign />} />
      </Routes>
    </Suspense>
  );
}`,
        interviewQA: [
          {
            q: "How does Tree Shaking work in modern bundlers (Vite/Rollup/Webpack)?",
            a: "Tree shaking is dead-code elimination. It relies on the static structure of ES6 module syntax (import/export are static and cannot be conditionally loaded at runtime). The bundler builds an Abstract Syntax Tree (AST), traces the dependency graph from entry points, marks unreferenced exports, and purges them during minification."
          }
        ]
      },
      {
        id: "fe_8",
        title: "Frontend Security: XSS Sanitization, CSRF & Content Security Policy (CSP)",
        badge: "Security",
        readTime: "10 min",
        completed: false,
        summary: "Preventing Cross-Site Scripting (XSS), Cross-Site Request Forgery (CSRF), clickjacking, and secure token storage.",
        concept: `### Essential Frontend Defense Checklist
1. **Cross-Site Scripting (XSS):** Injecting malicious scripts into user view.
   - *Stored XSS:* Malicious script saved in database and served to all users.
   - *Reflected XSS:* Malicious script in query parameter reflected back in page.
   - *Defense:* Avoid \`dangerouslySetInnerHTML\`. Use DOMPurify for HTML sanitization.
2. **Token Storage: LocalStorage vs HTTP-Only Cookies:**
   - \`localStorage\` is accessible by any JavaScript running on the origin (vulnerable to XSS theft).
   - **HTTP-Only, Secure, SameSite=Strict Cookies** cannot be read by JavaScript, providing the highest defense against credential theft.
3. **Content Security Policy (CSP):** HTTP header restricting where scripts, styles, and fonts can be loaded from (\`default-src 'self'\`).`,
        codeSnippet: `// Example: Sanitizing user-submitted HTML before rendering
import DOMPurify from 'dompurify';

function SafeHTMLViewer({ rawHtmlContent }) {
  // Purges all <script>, onmouseover, and malicious attack vectors!
  const cleanHtml = DOMPurify.sanitize(rawHtmlContent, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  });

  return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
}`,
        interviewQA: [
          {
            q: "How does the SameSite cookie attribute prevent CSRF attacks?",
            a: "Cross-Site Request Forgery (CSRF) exploits the browser automatically sending cookies with cross-origin requests. With SameSite=Strict, the browser never sends the cookie in cross-site requests (e.g. following a link from an attacker's site). With SameSite=Lax, cookies are only sent with safe top-level GET navigations, blocking malicious POST/PUT requests initiated from external origins."
          }
        ]
      }
    ]
  },
  {
    id: "backend",
    title: "Backend Engineering, Distributed APIs & Systems",
    icon: "Server",
    badge: "Server-Side",
    description: "High-performance Node.js runtime, Express/Nest architecture, JWT rotation, message queues, and WebSockets.",
    milestones: [
      {
        id: "be_1",
        title: "Node.js Runtime Internals: Libuv, V8 & Event Loop Phases",
        badge: "Runtime",
        readTime: "14 min",
        completed: false,
        summary: "Understanding the 6 phases of the Node.js event loop, thread pool sizing, and avoiding event loop blocking.",
        concept: `### Node.js Event Loop Architecture (6 Phases)
1. **Timers Phase:** Executes callbacks scheduled by \`setTimeout\` and \`setInterval\`.
2. **Pending Callbacks (I/O):** Executes system operation callbacks (e.g., TCP errors).
3. **Idle, Prepare:** Internal Node.js usage.
4. **Poll Phase:** Retrieves new I/O events; executes I/O related callbacks. If no timers are scheduled, it blocks and waits for connections.
5. **Check Phase:** Executes \`setImmediate()\` callbacks immediately after I/O completes.
6. **Close Callbacks:** Executes socket/file closure handlers (\`socket.on('close')\`).

*Golden Rule:* Never block the single-threaded Event Loop with heavy CPU tasks (crypto, large JSON parsing, image processing). Offload to Worker Threads or external microservices!`,
        codeSnippet: `// Example: Using Node.js Worker Threads for CPU-Heavy Tasks
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';

if (isMainThread) {
  export function computeHeavyHash(data) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL(import.meta.url), { workerData: data });
      worker.on('message', resolve);
      worker.on('error', reject);
    });
  }
} else {
  // Runs in separate OS thread; does NOT block the main event loop!
  const crypto = await import('crypto');
  const result = crypto.pbkdf2Sync(workerData, 'salt', 500000, 64, 'sha512');
  parentPort.postMessage(result.toString('hex'));
}`,
        interviewQA: [
          {
            q: "What is the difference between process.nextTick() and setImmediate()?",
            a: "process.nextTick() is not technically part of the event loop phases; it runs immediately after the current operation completes, before the event loop continues to any phase. If called recursively, it starves all I/O! setImmediate(), on the other hand, runs in the Check Phase of the event loop, allowing I/O polling to execute first."
          }
        ]
      },
      {
        id: "be_2",
        title: "Production Authentication: JWT Access/Refresh Token Rotation & OAuth 2.0",
        badge: "Security",
        readTime: "15 min",
        completed: false,
        summary: "Short-lived access tokens, refresh token rotation with reuse detection, and OAuth 2.0 PKCE flow.",
        concept: `### Modern Token Architecture: Access + Refresh Rotation
1. **Short-Lived Access Token (15 min):** Signed JWT containing user ID and roles. Transmitted in \`Authorization: Bearer <token>\` header. Validated statelessly by microservices.
2. **Long-Lived Refresh Token (7 days):** Stored in a database and sent in an **HTTP-Only, Secure, SameSite=Strict cookie**.
3. **Automatic Token Rotation & Reuse Detection:**
   - Every time the client requests a new access token, the server issues a NEW refresh token and invalidates the old one.
   - If an attacker intercepts and uses an old refresh token, the server detects token reuse, immediately invalidates the entire token family, and forces the user to log in again!`,
        codeSnippet: `// Example: JWT Verification Middleware with Express
import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token expired or invalid' });
    }
    req.user = user;
    next();
  });
}`,
        interviewQA: [
          {
            q: "How do you revoke a stateless JWT before its natural expiration date?",
            a: "Since JWTs are self-contained and verified statelessly, they cannot be natively revoked without a shared state. Solutions: 1) Keep expiration short (5-15 mins). 2) Maintain a Redis token blocklist / revocation list with TTL matching remaining token lifetime. 3) Store a 'tokenVersion' integer in the user database row and include it in the JWT payload; incrementing the version immediately invalidates all previously issued tokens on subsequent authorization checks."
          }
        ]
      },
      {
        id: "be_3",
        title: "Message Queues & Background Workers: BullMQ & Redis Streams",
        badge: "Async Processing",
        readTime: "12 min",
        completed: false,
        summary: "Decoupling API requests from slow tasks (email dispatch, video processing, report generation) with retry policies and Dead Letter Queues.",
        concept: `### Asynchronous Processing with BullMQ
1. **Producer:** API route quickly validates request, pushes job to Redis queue, and returns \`HTTP 202 Accepted\` in 5ms.
2. **Consumer (Worker):** Independent background worker processes jobs off the queue with controlled concurrency.
3. **Exponential Backoff:** If downstream service (e.g. SMTP or Payment API) fails, retry after 2s, 4s, 8s, 16s with random jitter.
4. **Dead Letter Queue (DLQ):** Jobs that exceed max retries are moved to a DLQ for manual inspection and alerting without clogging the main queue.`,
        codeSnippet: `// Example: BullMQ Queue and Worker Setup
import { Queue, Worker } from 'bullmq';

const emailQueue = new Queue('email_dispatch', { connection: { host: 'localhost', port: 6379 } });

// 1. Enqueue job from API
export async function queueWelcomeEmail(email, name) {
  await emailQueue.add('send_welcome', { email, name }, {
    attempts: 4,
    backoff: { type: 'exponential', delay: 2000 }
  });
}

// 2. Autonomous worker
const emailWorker = new Worker('email_dispatch', async (job) => {
  const { email, name } = job.data;
  console.log(\`Sending email to \${email}...\`);
  // execute live SMTP dispatch
}, { connection: { host: 'localhost', port: 6379 } });`,
        interviewQA: [
          {
            q: "What is an Idempotent Consumer and why is it critical in message queues?",
            a: "Most message brokers guarantee 'At-Least-Once' delivery, meaning network glitches can cause a worker to receive the same job twice. An idempotent consumer checks whether the job has already been processed (e.g. checking a unique transaction ID or order ID in the database) before executing, ensuring duplicate messages do not result in duplicate charges or duplicate emails."
          }
        ]
      },
      {
        id: "be_4",
        title: "Real-Time Bidirectional WebSockets & Connection State Architecture",
        badge: "Real-Time",
        readTime: "14 min",
        completed: false,
        summary: "Scaling WebSockets across multiple server nodes using Redis Pub/Sub, heartbeat pings, and reconnection backoff.",
        concept: `### Scaling WebSockets Beyond a Single Server
A single server holds WebSockets in local memory. If User A connects to Server 1 and User B connects to Server 2, Server 1 cannot talk directly to User B!
**The Redis Pub/Sub Solution:**
- Connect all WebSocket servers to a centralized **Redis Pub/Sub** bus.
- When User A sends a message to room \`#general\`, Server 1 publishes the event to Redis channel \`room:general\`.
- All other servers subscribe to the channel, receive the event, and broadcast it to their locally connected clients.`,
        codeSnippet: `// Example: WebSocket Gateway with Heartbeat Monitoring
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', (data) => {
    // Process message
  });
});

// Periodic heartbeat to terminate zombie connections
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);`,
        interviewQA: [
          {
            q: "How does the WebSocket handshake work over HTTP?",
            a: "The client sends a standard HTTP GET request with headers: 'Upgrade: websocket' and 'Connection: Upgrade', along with a base64-encoded random key ('Sec-WebSocket-Key'). If the server supports WebSockets, it responds with 'HTTP/1.1 101 Switching Protocols' and hashes the key with a standard GUID. After this handshake, the TCP connection remains open for bidirectional binary/text framing."
          }
        ]
      },
      {
        id: "be_5",
        title: "RESTful API Standards, Idempotency Keys & Cursor-Based Pagination",
        badge: "API Architecture",
        readTime: "12 min",
        completed: false,
        summary: "Designing enterprise REST APIs, HTTP status code semantics, Idempotency-Key headers for payment APIs, and cursor vs offset pagination.",
        concept: `### Cursor-Based Pagination vs Offset Pagination
1. **The Offset Problem (\`OFFSET 100000 LIMIT 20\`):** The database must read all 100,020 rows from disk, sort them, and discard the first 100,000. Causes slow queries ($O(N)$) and phantom duplicates if new items are inserted during scrolling.
2. **The Cursor Solution (\`WHERE id < last_seen_id ORDER BY id DESC LIMIT 20\`):** Directly indexes the next batch in $O(1)$ or $O(\\log N)$ time with zero duplicate or skipped records.
3. **Idempotency Keys:** For critical mutations (payments, reservations), clients pass a unique \`Idempotency-Key: <uuid>\` header. The server caches the result in Redis; if the client retries due to a network timeout, the server returns the cached response instead of charging the user twice.`,
        codeSnippet: `// Example: Express Idempotency Middleware using Redis
import redisClient from '../config/redis';

export async function idempotencyMiddleware(req, res, next) {
  const idempotencyKey = req.headers['idempotency-key'];
  if (!idempotencyKey) return next();

  const cacheKey = \`idempotency:\${idempotencyKey}\`;
  const cachedResponse = await redisClient.get(cacheKey);

  if (cachedResponse) {
    const { status, body } = JSON.parse(cachedResponse);
    return res.status(status).json(body);
  }

  // Intercept res.json to cache response before sending
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    redisClient.set(cacheKey, JSON.stringify({ status: res.statusCode, body }), 'EX', 86400); // 24h
    return originalJson(body);
  };

  next();
}`,
        interviewQA: [
          {
            q: "What is the difference between PUT and PATCH in REST?",
            a: "PUT is an idempotent replacement: the client sends the entire updated resource representation, completely replacing the existing resource. PATCH is a non-idempotent (or idempotent depending on payload) partial update: the client sends only the specific fields to be modified without transmitting the full resource."
          }
        ]
      },
      {
        id: "be_6",
        title: "Distributed Rate Limiting & Abuse Prevention: Redis Token Bucket & Sliding Window",
        badge: "Security & Scale",
        readTime: "14 min",
        completed: false,
        summary: "Implementing distributed rate limiters using Redis sliding window logs, token bucket algorithms, and returning standard HTTP 429 headers.",
        concept: `### Rate Limiting Algorithms Comparison
1. **Fixed Window Counter:** Counts requests per static window (e.g., 100 req/min). Flaw: Burst traffic at window boundaries (100 req at 0:59, 100 req at 1:00 = 200 req in 2 seconds!).
2. **Sliding Window Log:** Stores timestamps of all requests in a Redis Sorted Set (\`ZSET\`). Highly accurate, but high memory usage for large request volumes.
3. **Sliding Window Counter:** Blends the previous window count with the current window percentage. Low memory ($O(1)$), smooth throttling.
4. **Token Bucket:** Tokens added at constant rate up to bucket capacity. Allows short bursts while enforcing long-term average throughput.`,
        codeSnippet: `// Example: Redis Sliding Window Rate Limiter
import Redis from 'ioredis';
const redis = new Redis();

export async function isRateLimited(userId, limit = 60, windowSec = 60) {
  const key = \`ratelimit:\${userId}\`;
  const now = Date.now();
  const windowStart = now - windowSec * 1000;

  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(key, 0, windowStart); // Remove old requests
  pipeline.zadd(key, now, now);                    // Record current request
  pipeline.zcard(key);                             // Count requests in window
  pipeline.expire(key, windowSec);

  const results = await pipeline.exec();
  const requestCount = results[2][1];

  return {
    allowed: requestCount <= limit,
    remaining: Math.max(0, limit - requestCount),
    resetTime: Math.ceil(now / 1000) + windowSec
  };
}`,
        interviewQA: [
          {
            q: "Which HTTP headers should a rate limiter return to the client?",
            a: "A production rate limiter should return: 'RateLimit-Limit' (max requests allowed in window), 'RateLimit-Remaining' (number of requests left), and 'RateLimit-Reset' (Unix timestamp or seconds until quota resets). If the limit is exceeded, return 'HTTP 429 Too Many Requests' along with a 'Retry-After: <seconds>' header."
          }
        ]
      }
    ]
  },
  {
    id: "databases",
    title: "Database Engineering, Modeling & Performance",
    icon: "Database",
    badge: "Data Layer",
    description: "Relational schema design, PostgreSQL indexing, ACID transactions, MongoDB document modeling, and Redis caching.",
    milestones: [
      {
        id: "db_1",
        title: "Relational Modeling & Normalization: 1NF to 3NF & Denormalization Trade-offs",
        badge: "RDBMS",
        readTime: "12 min",
        completed: false,
        summary: "First, second, and third normal forms, foreign key constraints, composite keys, and deliberate denormalization for read speed.",
        concept: `### Database Normalization Principles
- **1NF (First Normal Form):** Every column contains atomic (indivisible) values. No repeating groups or arrays.
- **2NF (Second Normal Form):** In 1NF + every non-key column is fully dependent on the entire primary key (eliminates partial key dependencies).
- **3NF (Third Normal Form):** In 2NF + every non-key column depends ONLY on the primary key, with no transitive dependencies (\`A -> B -> C\`).
- **When to Denormalize:** In high-throughput read-heavy platforms (like e-commerce order summaries or user follower counts), strictly normalized queries require 5-table joins that bottleneck CPU. Pre-computing and duplicating summary columns (\`total_orders\`, \`author_name\`) trades write speed for sub-10ms read performance.`,
        codeSnippet: `-- Normalized Schema Example with Foreign Keys & Cascades
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id VARCHAR(64) NOT NULL,
  verdict VARCHAR(32) NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_submissions_user_problem ON submissions(user_id, problem_id);`,
        interviewQA: [
          {
            q: "What is the difference between a Clustered Index and a Non-Clustered Index?",
            a: "A Clustered Index dictates the physical ordering of data rows on disk (a table can have only ONE clustered index, typically the Primary Key in MySQL InnoDB). A Non-Clustered Index is a separate B-Tree structure containing the indexed column values and a pointer (row locator/primary key) back to the actual data row."
          }
        ]
      },
      {
        id: "db_2",
        title: "PostgreSQL Indexing: B-Tree, Composite Indexes & EXPLAIN ANALYZE",
        badge: "Optimization",
        readTime: "15 min",
        completed: false,
        summary: "Mastering query plans, index selectivity, covering indexes, and diagnosing slow sequential table scans.",
        concept: `### Reading EXPLAIN ANALYZE Output
When running \`EXPLAIN ANALYZE SELECT * FROM users WHERE status = 'ACTIVE' AND created_at > '2026-01-01'\`:
1. **Seq Scan (Sequential Scan):** Scans every page on disk from top to bottom. Acceptable for tiny tables (< 500 rows); disastrous for 10M rows!
2. **Index Scan:** Traverses B-Tree index and reads table pages for matching rows.
3. **Index Only Scan (Covering Index):** All requested columns are found inside the index itself! The database never touches the table heap, yielding maximum throughput.
4. **Composite Index Leftmost Prefix Rule:** An index on \`(company, role, level)\` accelerates queries filtering on \`company\` or \`company + role\`, but CANNOT be used for queries filtering solely on \`role\` or \`level\`!`,
        codeSnippet: `-- Diagnosing and indexing slow queries
EXPLAIN ANALYZE 
SELECT id, title, difficulty FROM problems 
WHERE category = 'Arrays' AND difficulty = 'Hard';

-- Add Composite Index satisfying the query:
CREATE INDEX idx_problems_category_difficulty ON problems(category, difficulty);`,
        interviewQA: [
          {
            q: "What is Index Selectivity and why does an index on a boolean column rarely get used by the query planner?",
            a: "Selectivity is the ratio of distinct values to total rows in a table. A column with high selectivity (e.g. Email or UUID) returns a tiny fraction of rows, making an index lookup very efficient. A boolean column has low selectivity (typically ~50% true and 50% false). Scanning an index and then doing random I/O heap fetches for 50% of the table is slower than a fast sequential disk scan, so the query planner ignores the index."
          }
        ]
      },
      {
        id: "db_3",
        title: "In-Memory Caching & Distributed Data Structures with Redis",
        badge: "Caching",
        readTime: "12 min",
        completed: false,
        summary: "Redis data structures (Hashes, Sorted Sets, HyperLogLog), TTL policies, and atomic transactions.",
        concept: `### Choosing the Right Redis Data Structure
- **Strings:** Simple key-value cache, session tokens, distributed locks.
- **Hashes (\`HSET\` / \`HGET\`):** Efficient storage for objects (e.g. user profiles, student ratings). Uses compact memory encoding (ziplist).
- **Sorted Sets (\`ZSET\`):** Elements ordered by score. Perfect for real-time leaderboards, contest rankings, and sliding window rate limiters.
- **HyperLogLog (\`PFADD\` / \`PFCOUNT\`):** Probabilistic cardinality estimator. Counts millions of unique visitors with only 12 KB of memory and 0.81% error margin!`,
        codeSnippet: `// Example: Real-time Leaderboard with Redis Sorted Sets
import Redis from 'ioredis';
const redis = new Redis();

// Add or increment student solved problem score
export async function updateStudentRank(studentHandle, solvedCount) {
  await redis.zadd('leaderboard:contest', solvedCount, studentHandle);
}

// Fetch Top 10 Leaderboard in O(log N + M)
export async function getTop10Leaderboard() {
  return redis.zrevrange('leaderboard:contest', 0, 9, 'WITHSCORES');
}`,
        interviewQA: [
          {
            q: "How does Redis handle data persistence if it is an in-memory database?",
            a: "Redis provides two persistence mechanisms: 1) RDB (Redis Database Snapshotting): Periodic point-in-time snapshots written to an rdb file on disk (fast to restart, but risk of losing data between snapshots). 2) AOF (Append-Only File): Logs every write command sequentially to disk (can sync every second or every write via fsync). In production, a hybrid approach (AOF with periodic RDB snapshots) is standard."
          }
        ]
      },
      {
        id: "db_4",
        title: "ACID Transactions, Write-Ahead Logging (WAL) & Isolation Levels",
        badge: "Transactions",
        readTime: "16 min",
        completed: false,
        summary: "Understanding Atomicity, Consistency, Isolation, and Durability, the 4 SQL isolation levels, and concurrency anomalies (Dirty Read, Non-Repeatable Read, Phantom Read).",
        concept: `### The 4 ANSI SQL Transaction Isolation Levels
1. **Read Uncommitted:** Lowest isolation. Allows reading uncommitted changes made by other transactions. Vulnerable to **Dirty Reads**.
2. **Read Committed (PostgreSQL default):** Only reads committed rows. Prevents Dirty Reads, but vulnerable to **Non-Repeatable Reads** (re-reading the same row within a transaction can yield different data).
3. **Repeatable Read:** Guarantees that any row read during a transaction will retain the exact same values on subsequent reads. Prevents Non-Repeatable Reads.
4. **Serializable:** Highest isolation level. Emulates strictly sequential execution using 2-Phase Locking (2PL) or Serializable Snapshot Isolation (SSI). Completely prevents **Phantom Reads** (new rows appearing in range queries), but incurs highest abort/retry rates under high concurrency.`,
        codeSnippet: `-- PostgreSQL Transaction with Isolation Level
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;

UPDATE accounts SET balance = balance - 500 WHERE id = 'user_alice';
UPDATE accounts SET balance = balance + 500 WHERE id = 'user_bob';

INSERT INTO audit_logs (sender, receiver, amount) VALUES ('user_alice', 'user_bob', 500);

COMMIT;`,
        interviewQA: [
          {
            q: "What is Write-Ahead Logging (WAL) and how does it guarantee Durability?",
            a: "Write-Ahead Logging dictates that any modification to database data must be written and flushed to an append-only transaction log on disk (the WAL file) BEFORE the changes are applied to the in-memory buffer pool or actual table data pages on disk. In the event of a sudden power outage or system crash, the database replays the WAL log to restore all committed transactions, ensuring the Durability guarantee of ACID."
          }
        ]
      },
      {
        id: "db_5",
        title: "MongoDB Document Schema Design & Aggregation Pipelines",
        badge: "NoSQL",
        readTime: "14 min",
        completed: false,
        summary: "Embedding vs Referencing (1:1, 1:N, N:N relationships), schema versioning patterns, and multi-stage aggregation pipelines ($match, $group, $lookup).",
        concept: `### Embedding vs Referencing in MongoDB
- **Rule 1 — Favor Embedding Unless Compelling Reason:** Embed child documents when data is accessed together (e.g. user address, line items inside an order). Eliminates expensive cross-collection joins.
- **Rule 2 — Reference for Unbounded Arrays:** Never embed an array that can grow indefinitely (e.g. log messages, comments on a viral post). BSON documents have a hard 16 MB limit. Reference parent ID or use bucketing pattern.
- **Rule 3 — Aggregation Pipeline Flow:**
  \`$match\` (Filter) -> \`$group\` (Aggregate) -> \`$lookup\` (Join) -> \`$project\` (Shape output). Always place \`$match\` first to leverage indexes!`,
        codeSnippet: `// Example: MongoDB Aggregation Pipeline for Placement Stats
const pipeline = [
  { $match: { status: 'Solved', difficulty: 'Hard' } },
  { 
    $group: { 
      _id: '$category', 
      totalSolved: { $sum: 1 }, 
      avgSolveMinutes: { $avg: '$solveTimeMinutes' } 
    } 
  },
  { $sort: { totalSolved: -1 } },
  { $limit: 5 }
];

const topHardCategories = await db.collection('submissions').aggregate(pipeline).toArray();`,
        interviewQA: [
          {
            q: "How does MongoDB handle transactions and when would you use them?",
            a: "Since MongoDB 4.0+, multi-document ACID transactions are supported across replica sets and sharded clusters using session objects. However, multi-document transactions carry performance overhead; thanks to document embedding, most real-world NoSQL updates can be handled atomically within a single document without requiring distributed multi-document transactions."
          }
        ]
      },
      {
        id: "db_6",
        title: "Database Sharding, Replication Lag & Read Replicas",
        badge: "Distributed Data",
        readTime: "15 min",
        completed: false,
        summary: "Primary-replica replication architectures, horizontal range vs hash sharding, handling replication lag, and Read-Your-Own-Writes consistency.",
        concept: `### Primary-Replica Architecture & Replication Lag
1. **Primary Node:** Handles 100% of write traffic (\`INSERT\`, \`UPDATE\`, \`DELETE\`). Writes streamed asynchronously to Read Replicas.
2. **Read Replicas:** Handle read traffic (\`SELECT\`) to scale throughput horizontally.
3. **Replication Lag:** The delay between a write committing on Primary and appearing on a Replica. If User updates their profile and immediately refreshes, reading from a lagging replica will show the old profile!
4. **Read-Your-Own-Writes Solution:**
   - Route reads to the Primary for 5–10 seconds immediately after a user performs a write.
   - Use replication lag monitoring; if lag exceeds threshold, fall back to Primary.`,
        codeSnippet: `-- Sharding Key Strategy Example: Hash-Based vs Range-Based
-- Range Sharding (e.g., Shard 1: User A-M, Shard 2: User N-Z) -> Risk of hot spots!
-- Hash Sharding (CRC32(user_id) % num_shards) -> Uniform distribution!

-- Routing Query to Specific Shard by Shard Key:
SELECT * FROM orders WHERE user_id = 'user_123' AND order_id = 'ord_987';`,
        interviewQA: [
          {
            q: "What is Split-Brain syndrome in database clusters and how is it prevented?",
            a: "Split-Brain occurs when a network partition disconnects nodes in a cluster, causing both halves to believe the other half is dead. If both sides elect a new Primary node and accept writes, data conflicts and corruption occur. It is prevented using Quorum Consensus: a node can only be promoted to Primary if it obtains votes from a strict majority (> 50%, e.g., 2 out of 3 or 3 out of 5 nodes). The isolated minority partition ceases accepting writes."
          }
        ]
      }
    ]
  },
  {
    id: "devops",
    title: "DevOps, CI/CD, Containerization & Cloud Deployment",
    icon: "Terminal",
    badge: "Operations",
    description: "Docker multi-stage builds, GitHub Actions automated pipelines, reverse proxies, and production observability.",
    milestones: [
      {
        id: "do_1",
        title: "Docker Containerization & Production Multi-Stage Builds",
        badge: "Docker",
        readTime: "12 min",
        completed: false,
        summary: "Creating minimal, secure, production-grade container images with Alpine/Distroless bases and layer caching.",
        concept: `### Docker Multi-Stage Build Best Practices
1. **Stage 1 (Builder):** Installs devDependencies, compiles TypeScript, bundles Vite assets. Contains bloated tools (Node, npm, build tools).
2. **Stage 2 (Production Runner):** Copies ONLY the compiled \`dist/\` folder and production \`node_modules/\` into a fresh, minimal Alpine image.
3. **Security:** Run as non-root user (\`USER node\`), minimize attack surface, remove package managers.`,
        codeSnippet: `# Production Multi-Stage Dockerfile for Node.js Application
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=builder /app/dist ./dist
USER node
EXPOSE 5000
CMD ["node", "dist/server.js"]`,
        interviewQA: [
          {
            q: "Why is layer caching critical in Docker and how do you optimize Dockerfile instruction order?",
            a: "Docker caches the result of each instruction. If an instruction or its input files change, all subsequent layers must be rebuilt from scratch. Therefore, place infrequently changing instructions (like COPY package.json and RUN npm ci) at the top, and frequently changing instructions (like COPY . . for application code) near the bottom. This reduces rebuild times from minutes to seconds."
          }
        ]
      },
      {
        id: "do_2",
        title: "Automated CI/CD Workflows with GitHub Actions",
        badge: "CI/CD",
        readTime: "10 min",
        completed: false,
        summary: "Automating linting, unit tests, security scans, Docker builds, and zero-downtime deployment triggers.",
        concept: `### Enterprise CI/CD Pipeline Stages
1. **Lint & Typecheck:** Run ESLint and \`tsc --noEmit\` to catch syntax and typing regressions before compiling.
2. **Automated Unit & Integration Tests:** Run Vitest / Jest test suites across Node.js versions.
3. **Build & Package:** Compile production artifacts and verify asset budgets.
4. **Deploy:** Deploy preview environments on pull requests and production environments on merge to \`main\`.`,
        codeSnippet: `# .github/workflows/deploy.yml
name: Production Deployment
on:
  push:
    branches: [main]

jobs:
  test_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build`,
        interviewQA: [
          {
            q: "What is the difference between Blue-Green Deployment and Rolling Deployment?",
            a: "In Blue-Green Deployment, two identical production environments exist (Blue = active, Green = idle). The new release is deployed to Green, verified, and traffic is instantly switched at the router/load balancer. If issues arise, rollback is instant by switching back. In Rolling Deployment, instances in a single cluster are updated incrementally (e.g. 25% at a time), requiring fewer resources but having a transitional period where multiple versions run concurrently."
          }
        ]
      },
      {
        id: "do_3",
        title: "Production Reverse Proxies & Load Balancing with Nginx",
        badge: "Reverse Proxy",
        readTime: "12 min",
        completed: false,
        summary: "Configuring Nginx for TLS termination, upstream load balancing (least_conn, ip_hash), Brotli compression, and rate limiting.",
        concept: `### Why Put Nginx in Front of Node.js?
1. **TLS / SSL Termination:** Offloads CPU-intensive cryptographic handshakes from single-threaded Node.js to optimized C code.
2. **Static Asset Serving:** Nginx can serve static images, HTML, and CSS directly from disk using kernel-level \`sendfile\`, bypassing Node.js runtime entirely.
3. **Upstream Load Balancing:** Distributes requests across multiple Node.js instances or Docker containers.
4. **DDoS & Buffer Attacks Protection:** Buffers slow client uploads, preventing Slowloris attacks from starving Node.js connection threads.`,
        codeSnippet: `# /etc/nginx/conf.d/app.conf
upstream node_cluster {
  least_conn; # Load balancing algorithm
  server 127.0.0.1:5001 max_fails=3 fail_timeout=10s;
  server 127.0.0.1:5002 max_fails=3 fail_timeout=10s;
}

server {
  listen 443 ssl http2;
  server_name api.prepstack.dev;

  ssl_certificate /etc/letsencrypt/live/prepstack.dev/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/prepstack.dev/privkey.pem;

  location / {
    proxy_pass http://node_cluster;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}`,
        interviewQA: [
          {
            q: "What is the difference between a Forward Proxy and a Reverse Proxy?",
            a: "A Forward Proxy sits in front of clients (users) and mediates outbound requests to external servers, hiding client IP addresses and enforcing enterprise filtering. A Reverse Proxy sits in front of internal origin servers and intercepts inbound client requests, providing load balancing, caching, SSL termination, and hiding server IP topology."
          }
        ]
      },
      {
        id: "do_4",
        title: "Cloud Observability: Prometheus Metrics, Grafana & Distributed Tracing",
        badge: "Observability",
        readTime: "14 min",
        completed: false,
        summary: "The Three Pillars of Observability (Metrics, Logs, Traces), RED method (Rate, Errors, Duration), and OpenTelemetry instrumentation.",
        concept: `### The Three Pillars of Observability
1. **Metrics (Prometheus):** Aggregable numerical time-series data (e.g. CPU %, HTTP request rate, 99th percentile latency). Low storage overhead, ideal for alerting.
2. **Logs (Winston/ELK/Loki):** Discrete timestamped event messages with structured JSON context. High fidelity for root-cause diagnosis.
3. **Distributed Tracing (OpenTelemetry / Jaeger):** Traces a single request as it cascades across 10 microservices via a unique \`trace_id\` and \`span_id\`. Pinpoints exact bottlenecks (e.g. database query took 400ms out of 450ms total response time).
4. **The RED Method for APIs:**
   - **Rate:** Requests per second.
   - **Errors:** Number of failed requests (HTTP 5xx).
   - **Duration:** Request duration histogram (p50, p95, p99 latency).`,
        codeSnippet: `// Example: Prometheus Metrics in Express API
import client from 'prom-client';

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5]
});

// Middleware to track latency
export function metricsMiddleware(req, res, next) {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.route?.path || req.path, status_code: res.statusCode });
  });
  next();
}`,
        interviewQA: [
          {
            q: "Why is tracking p99 (99th percentile) latency more important than average latency?",
            a: "Average (mean) latency hides catastrophic outliers. If 95% of requests take 10ms, but 5% take 10 seconds, the average might look acceptable (around 500ms), but 1 out of 20 users experiences a frustrating 10-second stall. In distributed microservice architectures where a single page request spawns 20 parallel backend RPCs, experiencing a p99 latency stall becomes nearly guaranteed for almost every user session."
          }
        ]
      }
    ]
  }
];

export const webDevProjects = [
  {
    id: "proj_prepstack",
    title: "PrepStack — Technical Placement Readiness & Developer Portfolio Engine",
    category: "Full-Stack System",
    status: "Production",
    techStack: ["React 19", "Node.js", "Express", "Tailwind CSS", "Nodemailer", "Resend API", "OAuth 2.0"],
    githubUrl: "https://github.com/jainabhideep41/placement-preparation-dashboard",
    liveDemo: "https://placement-preparation-dashboard-five.vercel.app",
    evidence: {
      commits: 142,
      pullRequests: 18,
      issuesResolved: 12,
      stars: 48,
      forks: 14
    },
    placementHighlight: "Engineered single-page application with direct React Router v7 navigation, fallback static routing for zero 404s, unified multi-provider authentication (OAuth + Password OTP), and real-time algorithmic solve analytics.",
    architectureSummary: "Decoupled client-server architecture. Vite-powered responsive frontend with responsive SaaS styling, client-side caching (localStorage), and resilient multi-transporter email dispatch service (Gmail SMTP primary with Resend sandbox fallback).",
    interviewTalkingPoints: [
      "Engineered automated SPA route generation during Vite build (spaRoutesPlugin) to guarantee 200 OK on direct URL refreshes without server-side routing dependency.",
      "Implemented unified user account store linking competitive programming contest handles (LeetCode, Codeforces) with zero duplicate profiles.",
      "Built resilient transactional verification email pipeline with automatic institutional firewall bypass and in-app instant OTP auto-filling."
    ]
  },
  {
    id: "proj_synccanvas",
    title: "SyncCanvas — Real-Time Collaborative Whiteboard & Vector Engine",
    category: "Real-Time / Systems",
    status: "Completed",
    techStack: ["React", "HTML5 Canvas", "WebSockets", "Node.js", "Redis Pub/Sub", "CRDT (Yjs)"],
    githubUrl: "https://github.com/jainabhideep41/collaborative-whiteboard",
    liveDemo: "https://synccanvas.dev",
    evidence: {
      commits: 86,
      pullRequests: 9,
      issuesResolved: 7,
      stars: 34,
      forks: 8
    },
    placementHighlight: "Engineered high-frequency real-time drawing synchronization supporting 50+ concurrent users per room with sub-30ms latency using Conflict-Free Replicated Data Types (CRDTs).",
    architectureSummary: "HTML5 Canvas rendering engine with double buffering. Canvas mutations serialized into differential binary vectors and broadcasted over WebSockets via Redis Pub/Sub cluster.",
    interviewTalkingPoints: [
      "Resolved concurrent stroke conflicts using Yjs CRDTs, eliminating server-side locking bottlenecks.",
      "Implemented client-side path smoothing using cubic Bezier curves and mouse movement throttling (60 FPS).",
      "Scaled WebSocket connection tier horizontally using Redis Pub/Sub for multi-node broadcast."
    ]
  },
  {
    id: "proj_pulsequeue",
    title: "PulseQueue — Distributed Fault-Tolerant Task Scheduler & Worker Pool",
    category: "Distributed Systems",
    status: "Completed",
    techStack: ["Node.js", "Redis", "BullMQ", "PostgreSQL", "Docker", "Prometheus"],
    githubUrl: "https://github.com/jainabhideep41/distributed-job-queue",
    liveDemo: "https://pulsequeue.io",
    evidence: {
      commits: 64,
      pullRequests: 8,
      issuesResolved: 5,
      stars: 29,
      forks: 6
    },
    placementHighlight: "Built robust background job processing engine handling 10,000+ jobs/minute with exponential backoff retries, priority queues, and dead-letter queue (DLQ) alerts.",
    architectureSummary: "Master-Worker cluster architecture. Producer service queues jobs into Redis streams; autonomous worker nodes claim jobs using atomic Redis Lua scripts with heartbeat locks.",
    interviewTalkingPoints: [
      "Implemented distributed worker heartbeats with auto-recovery for abandoned tasks if a worker process crashes.",
      "Designed idempotent job handlers with PostgreSQL transactional state updates preventing duplicate processing.",
      "Exposed Prometheus metrics for queue latency, throughput, and failure rates with Grafana dashboard."
    ]
  },
  {
    id: "proj_flashdrop",
    title: "FlashDrop — High-Concurrency Flash Sale & Inventory Reservation Engine",
    category: "High Concurrency",
    status: "Completed",
    techStack: ["Node.js", "Express", "Redis", "Apache Kafka", "PostgreSQL", "Tailwind CSS"],
    githubUrl: "https://github.com/jainabhideep41/flash-sale-engine",
    liveDemo: "https://flashdrop.app",
    evidence: {
      commits: 78,
      pullRequests: 11,
      issuesResolved: 9,
      stars: 42,
      forks: 11
    },
    placementHighlight: "Benchmarked at 15,000 requests/sec with zero inventory overselling using Redis atomic Lua decrements, Kafka event buffering, and optimistic database locking.",
    architectureSummary: "Multi-tiered inventory gatekeeper. Fronted by Nginx rate limiting and Redis atomic inventory counters; successful reservations streamed to Kafka for async database persistence.",
    interviewTalkingPoints: [
      "Eliminated database row-lock contention by decoupling stock verification into in-memory Redis Lua scripts.",
      "Implemented 10-minute order reservation window with automatic TTL expiry and stock restoration.",
      "Enforced client Idempotency-Key validation to prevent duplicate charges on repeated network retries."
    ]
  }
];
