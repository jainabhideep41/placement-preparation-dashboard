/**
 * Comprehensive System Design & Architecture Hub Data
 * Designed for FAANG and Tier-1 Product Company Placement Preparation (SDE-1 & SDE-2)
 */

export const systemDesignTopics = [
  {
    id: "fundamentals",
    name: "System Fundamentals & Distributed Principles",
    category: "Core",
    badge: "Foundation",
    readTime: "12 min",
    description: "Latency numbers every engineer must know, CAP Theorem in real life, PACELC Theorem, and high-availability math.",
    milestones: [
      "Latency Numbers Every Programmer Should Know",
      "CAP Theorem Trade-Offs & Real-world Database Matrix",
      "PACELC Theorem (Partition vs Latency trade-offs)",
      "High Availability Math (99.9% vs 99.99% SLAs)",
      "Horizontal vs Vertical Scaling & SPOF Mitigation"
    ],
    theory: `### 1. Latency Numbers Every Programmer Must Know
In system design interviews, scale estimations require understanding physical computer architecture bottlenecks:
- **L1 CPU Cache Reference:** ~0.5 ns
- **Branch mispredict:** ~5 ns
- **L2 CPU Cache Reference:** ~7 ns
- **Mutex lock / unlock:** ~25 ns
- **Main Memory (RAM) Reference:** ~100 ns
- **Compress 1KB with Snappy:** ~3,000 ns (3 µs)
- **Send 2KB over 1 Gbps network:** ~20,000 ns (20 µs)
- **Read 1 MB sequentially from SSD:** ~1,000,000 ns (1 ms)
- **Disk seek (Rotational HDD):** ~10,000,000 ns (10 ms)
- **Send packet US East to US West (California):** ~150 ms
- **Round trip packet CA to Netherlands:** ~150 ms

*Key Takeaway:* Memory is ~100,000x faster than disk seeks. Caching in RAM (Redis/Memcached) is the primary technique to protect disk-bound databases.

---

### 2. CAP Theorem in Practice
In any asynchronous distributed network prone to network partitions (**P**), you can only guarantee **Consistency (C)** OR **Availability (A)**, never both:
- **CP (Consistency + Partition Tolerance):** If a network split occurs, reject writes or block to prevent stale data. Examples: *Google Spanner, HBase, ZooKeeper, Redis Sentinel (with min-replicas-to-write).*
- **AP (Availability + Partition Tolerance):** System accepts writes on both sides of partition; data reconciles later via eventual consistency. Examples: *Apache Cassandra, AWS DynamoDB, CouchDB.*
- **CA (Consistency + Availability):** Only possible in single-node systems where partitions cannot physically happen (e.g., single-node PostgreSQL or MySQL).

---

### 3. PACELC Theorem
CAP only considers behavior **during a partition**. PACELC extends this:
- **If Partition (P):** Trade-off between Availability (**A**) and Consistency (**C**).
- **Else (E):** Trade-off between Latency (**L**) and Consistency (**C**).
- *Example:* MongoDB is **PC/EC** (prefers consistency in partitions, consistency under normal operations). DynamoDB/Cassandra are **PA/EL** (prefers availability during partitions, lowest latency under normal operations).

---

### 4. Availability Math (The Nines)
- **99% ("Two Nines"):** 3.65 days downtime/year.
- **99.9% ("Three Nines"):** 8.76 hours downtime/year (Standard SaaS target).
- **99.99% ("Four Nines"):** 52.56 minutes downtime/year (Enterprise Tier-1 target).
- **99.999% ("Five Nines"):** 5.26 minutes downtime/year (Telecom / Core Financial Systems).`,
    codeSnippet: `// Example: Calculating availability of serial vs parallel services
// Serial dependencies multiply availability: A_total = A1 * A2 * A3
const authService = 0.999;     // 99.9%
const dbService = 0.999;       // 99.9%
const serialAvailability = authService * dbService; // 99.8% (Worse than individual!)

// Parallel redundant services (Active-Passive failover):
// A_parallel = 1 - (1 - A1) * (1 - A2)
const primaryDb = 0.999;
const replicaDb = 0.999;
const redundantAvailability = 1 - (1 - primaryDb) * (1 - replicaDb); 
// Result: 0.999999 (Six 9s!)`,
    interviewQA: [
      {
        q: "How would you explain the CAP theorem to an interviewer without sounding like a textbook?",
        a: "In any real-world distributed network, cables will get cut and switches will drop packets—meaning network partitions are inevitable. Therefore, you don't choose between Consistency and Availability; you choose what your system should do WHEN a partition happens: do you want to show users an error or wait for sync (Consistency), or do you want to accept writes and return potentially stale data to keep the system working (Availability)?"
      },
      {
        q: "What is an Error Budget and how does it relate to SLAs?",
        a: "An SLA (Service Level Agreement) is the contract with customers (e.g., 99.9% uptime). The Error Budget is the inverse: 100% - 99.9% = 0.1% downtime permitted (~43 minutes/month). If an engineering team burns their error budget through outages, new feature deployments are frozen until stability is restored."
      }
    ]
  },
  {
    id: "networking",
    name: "Networking, Protocols & API Paradigms",
    category: "Infrastructure",
    badge: "Transport",
    readTime: "15 min",
    description: "Complete HTTPS request lifecycle, HTTP/2 multiplexing vs HTTP/3 QUIC, WebSockets vs SSE vs gRPC.",
    milestones: [
      "DNS Hierarchical Resolution & Anycast Routing",
      "TCP 3-Way Handshake & TLS 1.3 Negotiation",
      "HTTP/1.1 vs HTTP/2 Multiplexing vs HTTP/3 QUIC",
      "Real-Time Transport: WebSockets vs SSE vs Long Polling",
      "API Paradigms: REST vs GraphQL vs gRPC & Protobufs"
    ],
    theory: `### 1. What Happens When You Type a URL in Browser?
1. **URL Parsing & HSTS Check:** Browser parses scheme, domain, port, and checks HTTP Strict Transport Security (HSTS) cache.
2. **DNS Resolution:**
   - Checks Browser DNS Cache &rarr; OS Hosts file & DNS Cache &rarr; Local Resolver (ISP/Router).
   - If miss: Root Name Servers (\`.\`) &rarr; TLD Name Server (\`.com\`) &rarr; Authoritative Name Server (e.g., Route53/Cloudflare).
3. **TCP Connection (3-Way Handshake):**
   - Client sends \`SYN\` &rarr; Server responds \`SYN-ACK\` &rarr; Client responds \`ACK\`.
4. **TLS 1.3 Handshake (1-RTT or 0-RTT with Session Resumption):**
   - Client Hello (supported ciphers, key share) &rarr; Server Hello (chosen cipher, server cert, public key).
   - Symmetric session keys generated (AES-GCM/ChaCha20).
5. **HTTP Request & Response:** Browser transmits HTTP GET request with headers (User-Agent, Cookies, Accept-Encoding).
6. **Browser Rendering Pipeline:** HTML tokenization &rarr; DOM Tree &rarr; CSSOM Tree &rarr; Render Tree &rarr; Layout (Reflow) &rarr; Paint &rarr; Compositing.

---

### 2. Transport Protocol Comparison
- **HTTP/1.1:** Head-of-line (HOL) blocking at application level. Separate TCP connection required per concurrent request (browsers limit to 6 connections per domain).
- **HTTP/2:** Single TCP connection with binary framing. Multiplexes concurrent streams. Server Push and HPACK header compression. Still suffers from TCP-level packet-loss HOL blocking.
- **HTTP/3 (QUIC over UDP):** Eliminates TCP HOL blocking completely. Uses UDP with built-in encryption. Independent streams mean losing packet in stream A does not stall stream B. Zero-RTT connection resumption on mobile network switches (WiFi &rarr; 5G).

---

### 3. Real-Time Protocols Matrix
- **WebSockets:** Full-duplex bidirectional TCP connection over \`ws://\` or \`wss://\`. Best for multiplayer gaming, live chat, interactive canvas, high-frequency bidirectional updates.
- **Server-Sent Events (SSE):** Unidirectional server-to-client streaming over standard HTTP. Built-in auto-reconnection and event IDs. Best for LLM token streaming (ChatGPT), live stock tickers, system monitoring.
- **Long Polling:** Client opens HTTP request; server holds connection until new data is ready. High overhead, used only as legacy fallback.`,
    codeSnippet: `// Example: Node.js Server-Sent Events (SSE) Stream
import express from 'express';
const app = express();

app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const intervalId = setInterval(() => {
    const payload = JSON.stringify({ timestamp: Date.now(), status: 'HEALTHY' });
    res.write(\`data: \${payload}\\n\\n\`);
  }, 1000);

  req.on('close', () => clearInterval(intervalId));
});`,
    interviewQA: [
      {
        q: "When would you choose gRPC over REST for an enterprise system?",
        a: "gRPC is ideal for internal microservice-to-microservice communication where extreme throughput, low latency, and strict type safety are critical. Because gRPC uses Protocol Buffers (compact binary encoding) and HTTP/2 multiplexing, payloads are 5-10x smaller and serialization is 10x faster than JSON REST. However, REST remains superior for public public-facing APIs due to broad browser compatibility and easy debugging."
      },
      {
        q: "Why does HTTP/2 still suffer from Head-of-Line (HOL) blocking?",
        a: "HTTP/2 solves application-layer HOL blocking by multiplexing streams over a single TCP connection. However, TCP is a byte-stream protocol that guarantees in-order packet delivery. If a single TCP packet drops on the network, the OS TCP stack pauses delivery of all subsequent packets to the application until the dropped packet is retransmitted—stalling all HTTP/2 streams on that connection. HTTP/3 solves this by replacing TCP with QUIC over UDP."
      }
    ]
  },
  {
    id: "scalability",
    name: "Scalability, Caching & Traffic Management",
    category: "Infrastructure",
    badge: "Scale",
    readTime: "16 min",
    description: "Layer 4 vs Layer 7 load balancers, Consistent Hashing algorithms, multi-tier caching, and stampede prevention.",
    milestones: [
      "Layer 4 (Transport) vs Layer 7 (Application) Load Balancing",
      "Consistent Hashing & Virtual Nodes Algorithm",
      "Caching Strategies: Cache-Aside vs Write-Through vs Write-Behind",
      "Cache Invalidation & Thundering Herd Prevention",
      "CDN Dynamic Acceleration & Edge Worker Caching"
    ],
    theory: `### 1. Load Balancing: Layer 4 vs Layer 7
- **Layer 4 (Transport Layer - IP & Port):**
  - Routes packets without inspecting HTTP payload (does not decrypt SSL).
  - Extremely fast (millions of packets/sec per node).
  - Software: *HAProxy (TCP mode), Linux Virtual Server (LVS), AWS NLB.*
- **Layer 7 (Application Layer - HTTP/HTTPS):**
  - Terminates SSL/TLS, reads URL paths, headers, cookies, and JSON body.
  - Enables intelligent routing: \`/api/orders\` &rarr; Order Service; \`/api/users\` &rarr; User Service.
  - Can inspect cookies for session stickiness and inject security headers.
  - Software: *Nginx, Envoy, AWS ALB, Traefik.*

---

### 2. Consistent Hashing Explained
Standard modulo hashing (\`server_index = hash(key) % N\`) is disastrous for distributed caches: when $N$ changes (server added or crashes), almost 100% of keys map to new servers, causing a massive cache miss avalanche.

**Consistent Hashing Solution:**
1. Map both servers and keys to a 360° circular hash ring ($0$ to $2^{32}-1$).
2. A key is assigned to the first server encountered moving clockwise.
3. **Adding/Removing a server:** Only $K/N$ keys are relocated (where $K$ = keys, $N$ = servers).
4. **Hotspots & Uneven Distribution:** Solved using **Virtual Nodes (Vnodes)**. Each physical server is assigned 100–300 virtual points on the ring (\`ServerA-1\`, \`ServerA-2\`, etc.), ensuring uniform key distribution.

---

### 3. Caching Strategies Matrix
- **Cache-Aside (Lazy Loading):** Application queries Cache. On miss, queries DB, populates cache, returns. *Best for read-heavy workloads with intermittent reads.*
- **Write-Through:** Application writes to Cache; Cache synchronously writes to DB before acknowledging. *Zero data loss risk, but higher write latency.*
- **Write-Behind (Write-Back):** Application writes to Cache; Cache returns immediately and writes to DB asynchronously in batches. *Sub-millisecond writes, risk of data loss on power failure.*
- **Refresh-Ahead:** Cache automatically re-queries backend for hot keys before TTL expires.

---

### 4. Cache Failure Modes & Defenses
- **Cache Stampede (Thundering Herd):** Millions of requests for hot key arrive when key expires simultaneously, overwhelming database.
  *Defense:* Mutex locks (only 1 thread queries DB; others wait), or probabilistic early expiration (XFetch algorithm).
- **Cache Penetration:** Requests query for non-existent keys (e.g., \`user_id = -9999\`) bypassing cache and hitting DB directly.
  *Defense:* Cache null values with short TTL, or use a **Bloom Filter** at the gateway.
- **Cache Avalanche:** Many cached items expire at the same exact timestamp.
  *Defense:* Add random jitter to TTLs (\`TTL = 3600 + Math.random() * 300\`).`,
    codeSnippet: `// Example: Consistent Hashing Implementation with Virtual Nodes
import crypto from 'crypto';

class ConsistentHashRing {
  constructor(replicas = 100) {
    this.replicas = replicas;
    this.ring = new Map(); // hash -> server
    this.sortedKeys = [];
  }

  hash(key) {
    return parseInt(crypto.createHash('md5').update(key).digest('hex').substring(0, 8), 16);
  }

  addServer(server) {
    for (let i = 0; i < this.replicas; i++) {
      const vNodeKey = \`\${server}#vnode\${i}\`;
      const hashVal = this.hash(vNodeKey);
      this.ring.set(hashVal, server);
      this.sortedKeys.push(hashVal);
    }
    this.sortedKeys.sort((a, b) => a - b);
  }

  getServer(key) {
    if (this.ring.size === 0) return null;
    const hashVal = this.hash(key);
    // Binary search clockwise on hash ring
    let low = 0, high = this.sortedKeys.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (this.sortedKeys[mid] >= hashVal) high = mid - 1;
      else low = mid + 1;
    }
    const idx = low === this.sortedKeys.length ? 0 : low;
    return this.ring.get(this.sortedKeys[idx]);
  }
}`,
    interviewQA: [
      {
        q: "What is the difference between Cache-Aside and Read-Through caching?",
        a: "In Cache-Aside, the application code itself is responsible for orchestrating the cache: checking cache, querying DB on miss, and updating cache. In Read-Through, the application treats the cache as the primary data store; the cache library/plugin transparently queries the DB under the hood on a cache miss."
      },
      {
        q: "How does a Bloom Filter prevent Cache Penetration?",
        a: "A Bloom Filter is a space-efficient probabilistic data structure that can check set membership. It has zero false negatives (if it says an element does not exist, it definitely does not exist), but has a small tunable false positive rate. By placing a Bloom filter in front of the cache containing all valid IDs, any query for non-existent IDs is immediately rejected at the network edge without touching cache or database."
      }
    ]
  },
  {
    id: "databases_storage",
    name: "Databases, Storage Engines & Partitioning",
    category: "Data",
    badge: "Storage",
    readTime: "18 min",
    description: "B+Trees vs LSM-Trees, replication lag, sharding architectures, and ACID vs BASE.",
    milestones: [
      "SQL (RDBMS) vs NoSQL Decision Framework",
      "B+Tree (PostgreSQL/InnoDB) vs LSM-Tree (Cassandra/RocksDB)",
      "Database Replication: Master-Slave vs Multi-Master",
      "Horizontal Sharding & Partition Key Selection",
      "ACID Isolation Levels (Dirty Read to Serializable)"
    ],
    theory: `### 1. Storage Engine Internals: B+Tree vs LSM-Tree
- **B+Tree (Read-Optimized, Standard in PostgreSQL & MySQL):**
  - Balanced tree with branching factor of 100–1000.
  - All data resides in leaf nodes connected by a linked list (fast range scans).
  - In-place page overwrites. Disk writes require random I/O.
  - Excellent for reads ($O(\\log N)$), but high write amplification for heavy ingestion.
- **LSM-Tree (Log-Structured Merge-Tree, Write-Optimized in Cassandra, RocksDB, ScyllaDB):**
  - Writes append sequentially to in-memory **MemTable** and a disk **Commit Log (WAL)** ($O(1)$ sequential I/O).
  - When MemTable reaches threshold, it is flushed to disk as an immutable **SSTable (Sorted String Table)**.
  - Background compaction merges duplicate keys and deletes tombstones.
  - Blazing fast writes, slightly slower reads compensated with Bloom Filters.

---

### 2. Sharding Architectures
When a database outgrows a single server (storage capacity or IOPS limit), data must be partitioned across nodes:
- **Range-Based Sharding:** Shard 1 holds IDs 1–10M, Shard 2 holds 10M–20M. Simple, but creates hot shards for monotonically increasing IDs.
- **Hash-Based Sharding:** Apply hash function to partition key: \`shard = hash(user_id) % num_shards\`. Uniformly balances load, but range queries require scatter-gather across all shards.
- **Directory-Based Sharding:** Central lookup service maps partition keys to physical shards. Provides ultimate flexibility for re-sharding, but introduces lookup latency and SPOF risk.

---

### 3. ACID Isolation Levels
From weakest to strongest:
1. **Read Uncommitted:** Allows Dirty Reads (reading uncommitted changes from other transactions).
2. **Read Committed (Postgres Default):** Prevents Dirty Reads. Only reads committed data. Still vulnerable to Non-Repeatable Reads.
3. **Repeatable Read (MySQL Default):** Prevents Non-Repeatable Reads (reading same row twice in a transaction yields identical data using MVCC snapshot). Still vulnerable to Phantom Reads in raw SQL.
4. **Serializable:** Highest isolation level. Guarantees transactions execute as if strictly serial. Employs Two-Phase Locking (2PL) or Serializable Snapshot Isolation (SSI).`,
    codeSnippet: `// Example: PostgreSQL Connection Pool with Retries and Transaction Isolation
import pg from 'pg';
const pool = new pg.Pool({ max: 20, idleTimeoutMillis: 30000 });

async function executeSerializableTransaction(client, callback) {
  try {
    await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    // Error 40001: serialization_failure (retryable)
    if (err.code === '40001') {
      console.warn('Serialization conflict, retrying...');
      return executeSerializableTransaction(client, callback);
    }
    throw err;
  }
}`,
    interviewQA: [
      {
        q: "What is Replication Lag and how do you handle it in a Read-Heavy system?",
        a: "Replication lag is the delay between a write committed to the primary master and its asynchronous replication to read replicas. If a user updates their profile and immediately refreshes, they might query a lagging replica and see outdated data. Solutions: 1) Read-your-own-writes consistency: route reads from the user who just wrote to the Master for 5–10 seconds. 2) Track replication log position (LSN) in the user's session token and only route to replicas that have caught up to that LSN."
      },
      {
        q: "Why do we avoid using Auto-Incrementing IDs as Database Sharding Keys?",
        a: "Auto-incrementing IDs create severe write hotspots: all newest writes constantly hit the single shard responsible for the latest ID range, starving other shards. Instead, distributed systems use uniformly distributed keys like UUIDv4, or custom composite IDs (like Twitter Snowflake: timestamp + worker ID + sequence) combined with hash partitioning."
      }
    ]
  },
  {
    id: "distributed_systems",
    name: "Distributed Systems, Messaging & Consensus",
    category: "Architecture",
    badge: "Distributed",
    readTime: "20 min",
    description: "Distributed transactions (2PC vs Saga), Kafka event streams vs RabbitMQ, Redis Redlock, and circuit breakers.",
    milestones: [
      "Distributed Transactions: 2-Phase Commit vs Saga Pattern",
      "Message Brokers: Log-Based (Kafka) vs Queue-Based (RabbitMQ)",
      "Distributed Locking: Redis Redlock & Fencing Tokens",
      "Rate Limiting Algorithms (Token Bucket, Sliding Window)",
      "Fault Tolerance: Circuit Breaker, Exponential Backoff & Jitter"
    ],
    theory: `### 1. Distributed Transactions: 2PC vs Saga
- **Two-Phase Commit (2PC):**
  - Phase 1 (Prepare): Coordinator asks all resource managers to prepare to commit.
  - Phase 2 (Commit): If all say yes, coordinator sends commit; otherwise abort.
  - *Major Flaw:* Synchronous and blocking. If coordinator crashes during Phase 2, resources remain locked indefinitely. Not recommended for modern microservices.
- **Saga Pattern (Eventual Consistency with Compensating Actions):**
  - Breaks transaction into local ACID transactions across services.
  - If Step 3 fails, the Saga executes **Compensating Transactions** in reverse order (e.g., Refund Payment &rarr; Release Seat).
  - Two implementations:
    1. **Choreography:** Services publish events and listen to other services' events (Decentralized, simpler for small workflows).
    2. **Orchestration:** Central orchestrator service coordinates workflow state machine (Clean, traceable, best for complex workflows).

---

### 2. Message Brokers: Kafka vs RabbitMQ
- **RabbitMQ (AMQP Queue-Based):**
  - Messages pushed to consumer.
  - Once consumer acknowledges (\`ACK\`), message is deleted from queue.
  - Granular routing (Topic, Direct, Fanout, Headers exchange).
  - Best for discrete transactional background jobs with complex routing.
- **Apache Kafka (Distributed Commit Log):**
  - Messages appended to immutable partitioned logs.
  - Persisted to disk for configurable retention (e.g., 7 days).
  - Consumers pull messages at their own offset.
  - Multiple consumer groups can read the same stream independently.
  - Best for event sourcing, telemetry, metrics streaming, high-throughput pipelines (>1M msgs/sec).

---

### 3. Rate Limiting Algorithms
1. **Token Bucket:** Bucket holds up to $B$ tokens. Refilled at rate $R$ tokens/sec. Request consumes 1 token. Allows burst traffic up to bucket capacity.
2. **Leaky Bucket:** Requests enter FIFO queue and leak out at constant steady rate. Smooths out traffic spikes.
3. **Sliding Window Counter:** Divides time into slices. Computes weighted sum of previous slice and current slice:
   $$\\text{Requests} = \\text{CurrentCount} + \\text{PrevCount} \\times (1 - \\text{elapsedPercent})$$
   Accurate and memory-efficient with Redis.`,
    codeSnippet: `// Example: Sliding Window Rate Limiter using Redis Lua Script for Atomicity
const slidingWindowLua = \`
  local key = KEYS[1]
  local now = tonumber(ARGV[1])
  local windowSize = tonumber(ARGV[2])
  local limit = tonumber(ARGV[3])
  local clearBefore = now - windowSize

  -- Remove timestamps older than window
  redis.call('ZREMRANGEBYSCORE', key, 0, clearBefore)
  local currentCount = redis.call('ZCARD', key)

  if currentCount < limit then
    redis.call('ZADD', key, now, now)
    redis.call('EXPIRE', key, math.ceil(windowSize / 1000))
    return 1 -- Allowed
  else
    return 0 -- Throttled
  end
\`;`,
    interviewQA: [
      {
        q: "What is the problem with using a simple Redis SETNX for distributed locking?",
        a: "A simple SETNX with TTL suffers from timing bugs: If Process A acquires the lock with a 10s TTL, encounters a long garbage collection pause taking 12s, the lock expires. Process B then acquires the lock. Process A wakes up and calls DEL, accidentally releasing Process B's lock! Solution: Store a unique random UUID as the value and only release if the value matches via an atomic Lua script, combined with fencing tokens (monotonically increasing sequence numbers) checked by the database."
      },
      {
        q: "How does the Circuit Breaker pattern prevent cascading system failures?",
        a: "A circuit breaker wraps service calls with a state machine: Closed (normal operation), Open (threshold of errors reached; calls fail immediately without touching downstream service), and Half-Open (after timeout, send small probe traffic to test recovery). This prevents resource exhaustion (thread pools, socket exhaustion) across upstream microservices when a downstream service degrades."
      }
    ]
  },
  {
    id: "lld_design_patterns",
    name: "Low-Level Design (LLD) & Object-Oriented Patterns",
    category: "Design",
    badge: "OOP",
    readTime: "15 min",
    description: "SOLID principles in practice, GoF design patterns (Factory, Strategy, Observer, Decorator), and class diagrams.",
    milestones: [
      "SOLID Principles with Clean TypeScript Implementations",
      "Creational: Factory Method, Builder & Thread-Safe Singleton",
      "Behavioral: Strategy Pattern (Pluggable Algorithms)",
      "Behavioral: Observer Pattern (Event Pub/Sub)",
      "Structural: Decorator Pattern & Adapter Pattern"
    ],
    theory: `### 1. SOLID Principles Explained
- **Single Responsibility (SRP):** A class should have only one reason to change. Separate business logic from logging, persistence, and presentation.
- **Open/Closed (OCP):** Software entities should be open for extension, but closed for modification. Use interfaces and polymorphism instead of branching \`if/else\`.
- **Liskov Substitution (LSP):** Subtypes must be substitutable for their base types without altering program correctness (e.g., a Square inheriting from Rectangle breaks area calculations if width/height are set independently).
- **Interface Segregation (ISP):** Clients should not be forced to depend upon interfaces they do not use. Split fat interfaces into fine-grained role interfaces.
- **Dependency Inversion (DIP):** High-level modules should not depend on low-level modules; both should depend on abstractions (interfaces).

---

### 2. Essential GoF Design Patterns
- **Strategy Pattern (Behavioral):** Defines a family of algorithms, encapsulates each one, and makes them interchangeable at runtime. *Example: PaymentGateway with StripeStrategy, PayPalStrategy, CryptoStrategy.*
- **Observer Pattern (Behavioral):** One-to-many dependency where state changes notify all observers automatically. *Example: StockTicker notifying live display widgets.*
- **Decorator Pattern (Structural):** Dynamically attaches additional responsibilities to an object without subclassing. *Example: Wrapping HTTP handlers with logging, authentication, and rate limiting.*
- **Builder Pattern (Creational):** Separates the construction of a complex object from its representation, supporting step-by-step assembly.`,
    codeSnippet: `// Example: Strategy Pattern in TypeScript for Payment Processing
interface PaymentStrategy {
  pay(amount: number): Promise<{ success: boolean; txId: string }>;
}

class StripeStrategy implements PaymentStrategy {
  async pay(amount: number) {
    return { success: true, txId: \`stripe_\${Date.now()}\` };
  }
}

class PayPalStrategy implements PaymentStrategy {
  async pay(amount: number) {
    return { success: true, txId: \`paypal_\${Date.now()}\` };
  }
}

class CheckoutService {
  private strategy: PaymentStrategy;
  constructor(strategy: PaymentStrategy) {
    this.strategy = strategy;
  }
  setStrategy(strategy: PaymentStrategy) {
    this.strategy = strategy;
  }
  async processOrder(amount: number) {
    return this.strategy.pay(amount);
  }
}`,
    interviewQA: [
      {
        q: "What is the difference between Strategy Pattern and State Pattern?",
        a: "Both share an identical UML class diagram (composition of an interface), but have opposite intents. In Strategy, the client actively chooses and injects an algorithm from outside (e.g., choosing Stripe vs PayPal). In State, the context object automatically transitions its own internal state machine, altering its behavior when its internal state changes (e.g., an Order transitioning from Placed to Paid to Shipped)."
      },
      {
        q: "How do you implement a thread-safe Singleton in multi-threaded runtimes?",
        a: "Use Double-Checked Locking with a volatile instance variable. The first check avoids synchronization overhead once initialized. If null, synchronize on the class object and check null a second time before instantiation to prevent multiple threads from instantiating duplicates concurrently."
      }
    ]
  }
];

export const systemDesignCaseStudies = [
  {
    id: "cs_url_shortener",
    title: "Design a High-Throughput URL Shortener (TinyURL / Bitly)",
    difficulty: "Medium",
    status: "Planned",
    category: "Web Scale",
    metrics: "100M URLs created/day • 1 Billion reads/day (10:1 ratio) • Write QPS: 1,160 • Read QPS: 11,600",
    summary: "High-throughput, low-latency URL shortening service. Base62 encoding, distributed ID generation, Redis caching, and 301 vs 302 redirect analytics trade-offs.",
    keyConcepts: ["Base62 encoding", "Snowflake ID Generator", "Redis Cache-Aside", "301 vs 302 Redirects", "Bloom Filter"],
    requirements: {
      functional: [
        "Given a long URL, generate a short, unique 7-character alias.",
        "When a user accesses the short URL, redirect to the original long URL with sub-10ms latency.",
        "Users can optionally specify custom aliases and expiration dates.",
        "Analytics: Click counts, referrers, and geo-location tracking."
      ],
      nonFunctional: [
        "High availability (99.99%) — redirect service must never fail.",
        "Low latency redirect: < 15ms p99 response time.",
        "Short links must not be guessable or enumerable (security)."
      ]
    },
    estimations: `### Capacity Estimation:
- **Writes:** 100M new URLs / day = ~1,160 writes/sec (Peak: 2,500 writes/sec)
- **Reads:** 1 Billion clicks / day = ~11,600 reads/sec (Peak: 25,000 reads/sec)
- **Storage:** 100M URLs * 500 bytes per record = 50 GB / day = 18.25 TB / year.
- **Cache Size:** 80-20 Pareto principle (20% of URLs generate 80% of traffic). 1B reads * 20% * 500 bytes = ~100 GB RAM needed in Redis.`,
    apiDesign: `POST /api/v1/shorten
Request:  { "longUrl": "https://example.com/very/long/path", "customAlias": "custom", "expireAt": 1793448266 }
Response: { "shortUrl": "https://tiny.url/s7k9d2a", "shortCode": "s7k9d2a", "createdAt": 1793448266 }

GET /{shortCode}
Response: HTTP 302 Found (or 301 Moved Permanently)
Header:   Location: https://example.com/very/long/path`,
    databaseSchema: `Table: urls (RDBMS or NoSQL Document)
- short_code: VARCHAR(7) [PRIMARY KEY] -- Base62 indexed
- original_url: VARCHAR(2048) [NOT NULL]
- user_id: VARCHAR(64)
- created_at: TIMESTAMP
- expires_at: TIMESTAMP

Table: clicks_analytics (Cassandra / ClickHouse for append-only time-series)
- short_code: VARCHAR(7) [PARTITION KEY]
- click_timestamp: TIMESTAMP [CLUSTERING KEY]
- ip_address: VARCHAR(45)
- user_agent: VARCHAR(256)
- referrer: VARCHAR(256)`,
    architecture: `1. **User Client** issues request &rarr; **Cloudflare Edge CDN** handles SSL and checks edge cache.
2. **Reverse Proxy (Nginx)** routes \`/api/shorten\` to **Write Service** and \`/{shortCode}\` to **Redirect Service**.
3. **Redirect Service:**
   - Checks **Redis Cluster** for \`shortCode\`. On hit (90%+ hit rate), returns HTTP 302 redirect immediately.
   - On cache miss, queries **PostgreSQL (Sharded by shortCode)**, writes to Redis, returns redirect.
   - Dispatches click event asynchronously to **Kafka Topic (\`url-clicks\`)**.
4. **Analytics Pipeline:** Spark / Flink consumer reads Kafka topic, aggregates click counts, and writes to ClickHouse / Cassandra.
5. **Write Service:**
   - Obtains unique 64-bit ID from **Twitter Snowflake Service**.
   - Encodes ID using **Base62** ($62^7 \\approx 3.5 \\text{ Trillion}$ combinations).
   - Writes to Primary Database and seeds Redis.`,
    deepDives: [
      {
        title: "301 Permanent Redirect vs 302 Temporary Redirect",
        content: "A 301 redirect is cached by the client's browser; subsequent requests bypass TinyURL servers entirely and go directly to destination. This lowers server load, but PREVENTS analytics collection. A 302 redirect forces the browser to query TinyURL every time, enabling 100% accurate click tracking at the cost of handling all redirect traffic."
      },
      {
        title: "Why Base62 instead of MD5/SHA-256 Hashing?",
        content: "MD5 produces 128 bits (32 hex characters), which is too long for a short link. Taking the first 7 characters causes severe hash collisions requiring expensive collision resolution queries. Generating a unique 64-bit integer (Snowflake) and converting to Base62 [0-9a-zA-Z] guarantees zero collisions and exactly 7 characters."
      }
    ]
  },
  {
    id: "cs_chat_system",
    title: "Design a Real-Time Chat System (WhatsApp / Slack / Discord)",
    difficulty: "Hard",
    status: "Planned",
    category: "Real-Time",
    metrics: "500 Million DAU • 10 Billion messages/day • Peak Connection: 50M concurrent WebSockets",
    summary: "Massive scale real-time bidirectional messaging engine. WebSocket connection gateways, Redis Pub/Sub, Cassandra append-only storage, and offline push notifications.",
    keyConcepts: ["Persistent WebSockets", "Redis Pub/Sub", "Apache Cassandra", "Push Notification Gateway", "Heartbeat Presence"],
    requirements: {
      functional: [
        "1-on-1 private messaging and group chats (up to 500 members).",
        "Online/offline presence indicators.",
        "Message delivery receipts (Sent, Delivered, Read).",
        "Offline message storage and sync upon reconnection."
      ],
      nonFunctional: [
        "Ultra-low latency (< 100ms end-to-end delivery).",
        "Zero message loss guarantee (at-least-once delivery with client deduplication).",
        "End-to-end encryption support."
      ]
    },
    estimations: `### Capacity Estimation:
- **Messages/day:** 10 Billion messages / 86,400s = ~115,000 msgs/sec (Peak: 300,000 msgs/sec).
- **Storage:** 10B msgs * 200 bytes average = 2 TB / day = 730 TB / year.
- **Concurrent Connections:** 50M users online simultaneously. A single Node.js/Go server with ephemeral port tuning can hold 50,000 concurrent WebSockets &rarr; 1,000 WebSocket Gateway servers required.`,
    apiDesign: `WebSocket Protocol Frames:
- SEND_MESSAGE: { "toUserId": "u_992", "msgId": "m_112", "content": "Hello", "type": "TEXT" }
- ACK_DELIVERY: { "msgId": "m_112", "status": "DELIVERED", "timestamp": 1793448266 }
- HEARTBEAT:     { "userId": "u_123", "status": "ONLINE" }

REST Endpoints:
- GET /api/v1/channels/{channelId}/messages?before={msgId}&limit=50
- POST /api/v1/users/{userId}/block`,
    databaseSchema: `Table: messages (Cassandra - Partitioned by conversation_id)
- conversation_id: UUID [PARTITION KEY]
- message_id: TIMEUUID [CLUSTERING KEY DESC] -- auto-sorted by time!
- sender_id: UUID
- content: TEXT
- status: INT (1: Sent, 2: Delivered, 3: Read)

Table: user_sessions (Redis Hash)
- key: user:session:{userId}
- field: gateway_server_id ("ws-gw-node-42")
- field: last_heartbeat (timestamp)`,
    architecture: `1. **Client** establishes persistent **WSS (WebSocket Secure)** connection through **AWS NLB (Layer 4)** to a **WebSocket Gateway Node**.
2. **Session Service:** Stores mapping of \`userId -> gateway_server_ip\` in **Redis Cluster**.
3. **Message Flow:**
   - User A sends message to User B over WebSocket.
   - Gateway Node validates token, assigns Snowflake ID, and publishes to **Kafka Topic (\`chat-messages\`)**.
   - **Message Writer Service** pulls from Kafka and writes to **Cassandra**.
   - Gateway checks Redis for User B's active server:
     - **If User B is Online:** Message routed via **Redis Pub/Sub** to User B's Gateway node, then pushed down WebSocket to User B.
     - **If User B is Offline:** Message forwarded to **Apple APNs / Google FCM Push Notification Service**.
4. **Presence Service:** Clients send heartbeat ping every 30s. If heartbeat not refreshed after 60s, marked offline.`,
    deepDives: [
      {
        title: "Why Cassandra instead of MongoDB or SQL for Chat?",
        content: "Chat messages are write-heavy and append-only; existing messages are rarely updated. Cassandra uses LSM-Trees that append to sequential logs with zero read-before-write penalties. Furthermore, clustering keys allow Cassandra to store messages partitioned by conversation_id pre-sorted chronologically on disk, making historical scroll queries blisteringly fast."
      },
      {
        title: "Handling Group Chats at Scale (Fan-Out Explosion)",
        content: "For small groups (< 500 members), fan-out on write is acceptable (dispatch message to all members' gateway connections). For massive public channels (Discord 100k members), fan-out on write exhausts network bandwidth. Instead, use a single shared channel queue where clients pull active messages or subscribe to a shared pub/sub partition."
      }
    ]
  },
  {
    id: "cs_rate_limiter",
    title: "Design a Distributed API Rate Limiter (Cloudflare / Stripe)",
    difficulty: "Medium",
    status: "Planned",
    category: "Infrastructure",
    metrics: "1 Million API calls/sec • Sub-millisecond evaluation (< 2ms) • Zero false denials",
    summary: "Prevent malicious DDoS and API abuse across distributed clusters. Sliding Window Counter algorithm using Redis Lua scripts for atomic thread-safety.",
    keyConcepts: ["Sliding Window Counter", "Redis Lua Script Atomicity", "HTTP 429 Headers", "Token Bucket", "Local In-Memory Cache Filter"],
    requirements: {
      functional: [
        "Limit requests per client IP, authenticated User ID, or API Key (e.g., 100 req/min).",
        "Return HTTP 429 Too Many Requests with descriptive headers when threshold exceeded.",
        "Support tiered plans (Free: 10 req/s, Pro: 500 req/s, Enterprise: Unlimited)."
      ],
      nonFunctional: [
        "Sub-2ms evaluation latency overhead per API call.",
        "Distributed consistency across multiple gateway nodes.",
        "Memory-efficient storage."
      ]
    },
    estimations: `### Capacity Estimation:
- **Throughput:** 1,000,000 requests/sec.
- **Active IP/Keys:** 10M active API keys in a day.
- **Memory per key:** User ID (8 bytes) + Count (4 bytes) + Timestamp (8 bytes) = ~20 bytes per key.
- **Total Redis RAM:** 10M * 20 bytes = 200 MB (Easily fits in a single Redis instance; replicated for high availability).`,
    apiDesign: `Headers returned on every response:
- X-RateLimit-Limit: 100
- X-RateLimit-Remaining: 42
- X-RateLimit-Reset: 1793448300 (Unix timestamp)

On Rate Limit Exceeded:
HTTP/1.1 429 Too Many Requests
Retry-After: 18
Content-Type: application/json
{ "error": "rate_limit_exceeded", "message": "Exceeded 100 requests per minute." }`,
    databaseSchema: `Redis Data Structure:
Option A (Sliding Window Log): Sorted Set ZSET (key = api_key, score = timestamp)
Option B (Sliding Window Counter): Hash Map with current_window and prev_window counters.`,
    architecture: `1. Incoming HTTP Request hits **API Gateway (Envoy / Kong)**.
2. Gateway extracts client identity (API Key from \`Authorization\` header or client IP).
3. Gateway invokes **Rate Limiter Middleware**:
   - Checks local **LRU In-Memory Cache** (if client is currently hard-blocked, reject immediately in 0.1ms).
   - Executes **Redis Lua Script** against Redis cluster with pipeline.
   - Script performs atomic sliding window calculation.
4. If allowed: Request proceeds to internal Microservices.
5. If denied: Gateway short-circuits and immediately returns **HTTP 429 Too Many Requests** with \`Retry-After\` header.`,
    deepDives: [
      {
        title: "Why is a Lua Script mandatory in Redis for Rate Limiting?",
        content: "Without Lua, checking the count (\`GET\`) and incrementing (\`INCR\`) are two separate network round-trips. In high concurrency, a race condition occurs where 10 requests arrive simultaneously, all see count = 99, and all pass, allowing 109 requests through. A Lua script executes inside Redis single-threaded engine atomically with zero race conditions."
      }
    ]
  },
  {
    id: "cs_video_streaming",
    title: "Design a Global Video Streaming Platform (Netflix / YouTube)",
    difficulty: "Hard",
    status: "Planned",
    category: "Media",
    metrics: "2 Billion Monthly Users • 500 Hours uploaded/minute • 100 Gbps egress bandwidth",
    summary: "Large-scale media ingestion, distributed DAG transcoding pipeline (HLS/DASH adaptive bitrate), edge CDN chunk caching, and recommendation feeds.",
    keyConcepts: ["HLS / DASH Adaptive Bitrate", "Video Chunking", "Transcoding DAG Pipeline", "Edge CDN Caching", "Blob Storage (S3)"],
    requirements: {
      functional: [
        "Upload videos up to 4K resolution.",
        "Stream videos smoothly without buffering across fluctuating network speeds.",
        "View count tracking, comments, search, and user subscriptions."
      ],
      nonFunctional: [
        "High availability (99.99%).",
        "Low playback startup latency (< 1 second).",
        "Cost-effective bandwidth distribution."
      ]
    },
    estimations: `### Capacity Estimation:
- **Video Storage:** 500 hours/min * 60 min * 24 hr = 720,000 hours/day. At 1 GB/hour compressed = 720 TB/day.
- **Egress Bandwidth:** Average user streams at 3 Mbps (1080p). 10M concurrent streams = 30 Tbps peak bandwidth. CDN edge distribution is mandatory.`,
    apiDesign: `POST /api/v1/videos/upload-ticket
Response: { "uploadUrl": "https://s3.aws.com/raw-bucket/uuid?signed", "videoId": "v_881" }

GET /api/v1/videos/{videoId}/master.m3u8 (HLS Manifest)
Returns playlist manifest with variant streams: 1080p, 720p, 480p, 360p.`,
    databaseSchema: `Table: videos (Metadata in PostgreSQL)
- id: UUID [PRIMARY KEY]
- title: VARCHAR(255)
- uploader_id: UUID
- duration_seconds: INT
- s3_master_manifest_url: VARCHAR(512)
- status: ENUM ('UPLOADING', 'PROCESSING', 'READY')

Table: video_chunks (Distributed Object Storage - AWS S3)
- Path: /videos/{videoId}/{resolution}/{chunk_index}.ts (10s segments)`,
    architecture: `1. **Upload Pipeline:** Client uploads chunked raw video directly to **AWS S3 / Cloud Storage** via Pre-Signed URLs.
2. **Transcoding Queue:** S3 Event triggers **Kafka Queue**. Distributed workers (FFmpeg on GPU nodes) transcode raw video into **HLS / DASH** chunks (240p, 360p, 720p, 1080p, 4K) and generate \`master.m3u8\` manifest.
3. **Playback Pipeline:**
   - Client requests \`master.m3u8\` via **CloudFront / Fastly CDN**.
   - Client Video Player inspects device screen and bandwidth speed, dynamically requesting 10-second \`.ts\` chunks matching its current connection (Adaptive Bitrate).
   - 95%+ of video chunk traffic is served from Edge CDN caches without touching the origin.`,
    deepDives: [
      {
        title: "How Adaptive Bitrate Streaming (HLS) Works",
        content: "A master manifest file links to sub-playlists for each resolution. If a mobile user drives into a tunnel and their cellular bandwidth drops from 20 Mbps to 2 Mbps, the client video player detects the buffer draining and smoothly requests the next 10-second chunk in 360p instead of 1080p, preventing video freezes."
      }
    ]
  },
  {
    id: "cs_twitter_feed",
    title: "Design Twitter / X Newsfeed & Social Graph System",
    difficulty: "Hard",
    status: "Planned",
    category: "Social Graph",
    metrics: "300 Million DAU • 500 Million Tweets/day • Fanout Read QPS: 300,000",
    summary: "High-scale timeline generation combining Fan-out on Write for standard users and Fan-out on Read for celebrities to eliminate write amplification.",
    keyConcepts: ["Fan-out on Write vs Read", "Celebrity / Hotspot Problem", "Redis Sorted Sets (ZSET)", "Social Graph Sharding"],
    requirements: {
      functional: [
        "Post tweets (text, images, links).",
        "Follow / unfollow users.",
        "Home Timeline: View chronological feed of tweets from followed users.",
        "User Timeline: View tweets posted by a specific user."
      ],
      nonFunctional: [
        "Feed load time < 200ms.",
        "Posting tweet should become visible to followers within 5 seconds.",
        "High availability for reads over strict consistency."
      ]
    },
    estimations: `### Capacity Estimation:
- 500M tweets/day = ~5,800 tweets/sec average (Peak: 20,000 tweets/sec).
- 300M DAU checking feed 5 times/day = 1.5B feed reads/day = ~17,500 reads/sec.
- **Fanout Problem:** If a user with 50M followers (e.g. Elon Musk) tweets, a pure fan-out on write requires 50,000,000 writes to individual timeline queues for a single tweet!`,
    apiDesign: `POST /api/v1/tweets
Request:  { "content": "Hello World!" }
Response: { "tweetId": "t_9912", "createdAt": 1793448266 }

GET /api/v1/timeline/home?cursor={timestamp}&limit=20
Response: { "tweets": [...], "nextCursor": 1793448100 }`,
    databaseSchema: `Table: tweets (Distributed NoSQL - Cassandra)
- tweet_id: BIGINT [PARTITION KEY] -- Snowflake ID
- user_id: BIGINT
- content: TEXT
- created_at: TIMESTAMP

Table: followers (Graph / Relational)
- user_id: BIGINT [INDEX]
- follower_id: BIGINT [INDEX]`,
    architecture: `1. **Hybrid Fanout Engine:**
   - **Regular Users (< 25,000 followers):** Use **Fan-out on Write (Push)**. When posting, a background worker queries followers list and pushes \`tweet_id\` into each follower's **Redis Timeline ZSET** (\`ZADD home:{follower_id} timestamp tweet_id\`).
   - **Celebrities (> 25,000 followers):** Use **Fan-out on Read (Pull)**. When a celebrity tweets, it is NOT pushed to millions of followers. Instead, when a follower loads their feed, their timeline service merges their pre-computed Redis timeline with recent tweets from celebrities they follow.
2. Timeline cache keeps only the latest 800 tweet IDs per active user in Redis.`,
    deepDives: [
      {
        title: "Solving the Celebrity Fan-Out Problem",
        content: "Pushing a tweet to 100M followers takes minutes and clogs background worker queues. The hybrid model solves this: 99% of normal users enjoy instant sub-10ms feed reads from pre-computed Redis ZSETs, while the top 0.1% celebrity tweets are dynamically blended at read time using a fast multi-way merge sort."
      }
    ]
  },
  {
    id: "cs_uber_matching",
    title: "Design Uber / Grab Ride-Matching & Geospatial Engine",
    difficulty: "Hard",
    status: "Planned",
    category: "Geospatial",
    metrics: "100 Million Active Users • 5 Million Drivers • Driver location ping every 4s",
    summary: "Real-time geospatial indexing using Uber H3 hexagonal cells and Google S2, dynamic surge pricing, and driver-rider matching.",
    keyConcepts: ["Uber H3 Hexagonal Grid", "Google S2 / GeoHash", "WebSockets / gRPC location pings", "Surge Pricing", "Distributed Lock on Match"],
    requirements: {
      functional: [
        "Drivers stream live GPS locations every 4 seconds.",
        "Riders request a ride: Find the top 5 nearest available drivers.",
        "Trip lifecycle: Request &rarr; Match &rarr; Accept &rarr; Pickup &rarr; Complete."
      ],
      nonFunctional: [
        "Sub-second driver matching.",
        "High availability and resilience against driver disconnects."
      ]
    },
    estimations: `### Capacity Estimation:
- 5M drivers * 1 ping / 4s = 1.25M location updates/sec.
- Updating traditional SQL database at 1.25M writes/sec will instantly crash disk I/O. In-memory spatial index (Redis / Memory Grid) is essential.`,
    apiDesign: `WebSocket (Driver &rarr; Server):
LOCATION_PING: { "driverId": "d_11", "lat": 37.7749, "lng": -122.4194, "status": "AVAILABLE" }

REST:
POST /api/v1/rides/request
Request:  { "riderId": "r_92", "pickup": { "lat": 37.77, "lng": -122.41 }, "destination": { "lat": 37.79, "lng": -122.40 } }
Response: { "rideId": "ride_55", "matchedDriver": { "id": "d_11", "etaMinutes": 3 } }`,
    databaseSchema: `Redis In-Memory Spatial Store:
- Geospatial index using Redis GEO (\`GEOADD drivers:available lng lat driver_id\`) or H3 Hex ID hash map (\`HSET h3:8828308281fffff driver_id timestamp\`).`,
    architecture: `1. **Driver Location Streaming:** Drivers send GPS coordinates every 4s over persistent WebSocket / gRPC to **Location Ingestion Service**.
2. **Geospatial Indexing:** Ingestion service converts coordinates to **Uber H3 Index** (hexagonal spatial hierarchy) and updates **Redis In-Memory Cluster**.
3. **Ride Matching Engine:**
   - Rider requests pickup at coordinate $(lat, lng)$.
   - Matcher maps coordinate to H3 cell and queries surrounding ring cells.
   - Filters nearest available drivers and calculates ETA using routing service.
   - Acquires distributed lock (Redis Redlock) on chosen driver to prevent race conditions (double matching).
   - Dispatches ride offer to driver's device with 15-second countdown.`,
    deepDives: [
      {
        title: "Why Hexagons (Uber H3) over Squares or GeoHash?",
        content: "Squares have two different neighbor distances (diagonal neighbors are $\\sqrt{2}$ times farther than adjacent neighbors). Hexagons have identical distance between the center and all 6 adjacent neighbors, making radius searches and continuous geospatial movement calculations mathematically clean and accurate."
      }
    ]
  },
  {
    id: "cs_ecommerce_flash_sale",
    title: "Design an E-Commerce Flash Sale System (Amazon / Flipkart)",
    difficulty: "Hard",
    status: "Planned",
    category: "High Concurrency",
    metrics: "100,000 items in stock • 10 Million users clicking 'Buy Now' in first 5 seconds",
    summary: "Prevent inventory overselling and database lock contention under extreme concurrency. Redis distributed inventory, Kafka order queue, and idempotency keys.",
    keyConcepts: ["Inventory Overselling Prevention", "Redis Atomic Inventory Decr", "Kafka Order Pipeline", "Idempotency Keys", "Optimistic Locking"],
    requirements: {
      functional: [
        "Users can view product details and stock status in real-time.",
        "Users click 'Buy Now' to place an order during a flash sale.",
        "System guarantees exactly zero overselling (inventory can never go negative)."
      ],
      nonFunctional: [
        "Sub-second checkout response.",
        "High resilience: Database must not crash under 100k writes/sec."
      ]
    },
    estimations: `### Capacity Estimation:
- 10M users clicking 'Buy Now' across 5 seconds = 2,000,000 requests/sec.
- Traditional database locks (\`SELECT FOR UPDATE\`) will deadlock and fail immediately at this scale.`,
    apiDesign: `POST /api/v1/orders/checkout
Header:  Idempotency-Key: "uuid-v4-client-generated"
Request: { "itemId": "item_ps5", "quantity": 1, "userId": "u_91" }
Response: { "status": "ORDER_RESERVED", "reservationId": "res_88", "expiresIn": 900 }`,
    databaseSchema: `Table: inventory (PostgreSQL)
- item_id: VARCHAR(64) [PRIMARY KEY]
- total_stock: INT
- reserved_stock: INT
- version: INT -- For optimistic locking

Table: orders (PostgreSQL)
- order_id: VARCHAR(64) [PRIMARY KEY]
- user_id: VARCHAR(64)
- item_id: VARCHAR(64)
- status: ENUM ('RESERVED', 'PAID', 'EXPIRED', 'CANCELLED')`,
    architecture: `1. **Static Caching:** Product details page is cached 100% on **Cloudflare CDN** and browser cache.
2. **Flash Sale Gateway:**
   - Incoming \`/checkout\` requests pass through **Rate Limiter & Bot Detection**.
   - **Redis Atomic Decrement:** Inventory is stored in Redis (\`stock:item_ps5\`). Lua script checks \`if stock >= qty then stock = stock - qty; return 1 else return 0\`.
   - If stock is depleted, user gets instant 'Sold Out' response in 2ms without touching database!
3. **Asynchronous Order Processing:**
   - If stock reservation succeeds, order payload is published to **Apache Kafka**.
   - Background order workers read from Kafka at a controlled rate (e.g., 2,000 orders/sec) and execute batched transactional writes into PostgreSQL.
4. **Payment Window:** User has 10 minutes to pay. If payment fails, Redis inventory is incremented and stock released back to queue.`,
    deepDives: [
      {
        title: "How Idempotency Keys Prevent Double Charging",
        content: "If network drops after payment submission, users frantically click 'Submit' multiple times. The client generates a unique UUID Idempotency-Key. The payment gateway stores this key in Redis with a 5-minute TTL. Duplicate submissions with identical keys are deduplicated and return the original cached response."
      }
    ]
  },
  {
    id: "cs_web_crawler",
    title: "Design a Distributed Web Crawler (Google Search Engine)",
    difficulty: "Hard",
    status: "Planned",
    category: "Distributed Compute",
    metrics: "1 Billion Webpages / month • 400 pages/sec continuous crawl",
    summary: "Large-scale distributed web crawler. URL Frontier with politeness queues, robots.txt caching, content deduplication with Bloom filters, and DNS resolution caching.",
    keyConcepts: ["URL Frontier", "Politeness vs Priority Queues", "MurmurHash & Bloom Filter", "Robots.txt Cache", "HTML Parser & Extraction"],
    requirements: {
      functional: [
        "Crawl web pages starting from seed URLs.",
        "Extract hyperlinks and enqueue new URLs.",
        "Store crawled HTML documents in cold object storage."
      ],
      nonFunctional: [
        "Politeness: Never overwhelm a target web server with rapid requests.",
        "Robots.txt compliance.",
        "Extensible: Support future extractors (images, PDF, audio)."
      ]
    },
    estimations: `### Capacity Estimation:
- 1 Billion pages / month = ~400 pages/sec.
- Average page size: 500 KB &rarr; 500 TB storage per month.`,
    apiDesign: `Internal Worker Queue Messages:
{ "url": "https://en.wikipedia.org/wiki/Algorithm", "depth": 3, "priority": 1 }`,
    databaseSchema: `Metadata Storage (Bigtable / HBase):
- Row Key: reversed_url ("com.example.www/path")
- Content Hash: SHA-256
- Last Crawled: TIMESTAMP
- Status Code: 200`,
    architecture: `1. **URL Frontier:**
   - **Priority Queue:** Categorizes URLs by PageRank and freshness.
   - **Politeness Queue:** Dedicates a queue per hostname with delay timer (e.g. wait 500ms between requests to the same domain).
2. **Fetcher Cluster:**
   - Downloads web page via asynchronous HTTP client with custom DNS cache.
   - Respects cached \`robots.txt\`.
3. **Content Deduplication:**
   - Computes MurmurHash / SimHash of page text.
   - Checks **Bloom Filter**; if duplicate content exists, discard page.
4. **Storage:** Raw HTML saved into **HDFS / AWS S3**.
5. **Link Extractor:** Parses HTML tags, extracts \`<a href>\`, canonicalizes URLs, and feeds new links back into URL Frontier.`,
    deepDives: [
      {
        title: "Avoiding Spider Traps",
        content: "Spider traps are websites designed to trap crawlers in infinite loops (e.g. \`/calendar?year=2026&month=12&day=31...\` or recursive directories). Crawlers protect themselves by enforcing maximum URL depth, tracking URL length limits, and applying heuristic anomaly detection on repetitive path segments."
      }
    ]
  },
  {
    id: "cs_dropbox_storage",
    title: "Design Dropbox / Google Drive Distributed File Sync",
    difficulty: "Hard",
    status: "Planned",
    category: "Storage",
    metrics: "100 Million Users • 50M uploads/day • 100 Petabytes Storage",
    summary: "Reliable distributed file synchronization. Content-addressable 4MB chunking, delta sync (rsync algorithm), metadata database, and conflict resolution.",
    keyConcepts: ["Chunking Engine (4MB)", "Content-Addressed Storage", "Delta Sync Algorithm", "File Versioning", "Conflict Resolution"],
    requirements: {
      functional: [
        "Upload, download, and sync files across desktop and mobile devices.",
        "Fast incremental file sync (only upload modified chunks).",
        "File revision history and rollback."
      ],
      nonFunctional: [
        "100% data integrity & zero data loss.",
        "High availability and efficient bandwidth usage."
      ]
    },
    estimations: `### Capacity Estimation:
- 100M users * 100 files average = 10 Billion files.
- Total storage: 100 Petabytes across distributed block storage.`,
    apiDesign: `POST /api/v1/files/chunks/upload
Request: Raw binary chunk (4MB) with SHA-256 header.

POST /api/v1/files/commit
Request: { "filePath": "/notes.txt", "chunkHashes": ["hash_1", "hash_2", "hash_3"], "version": 4 }`,
    databaseSchema: `Table: file_metadata (PostgreSQL / CockroachDB)
- file_id: UUID [PRIMARY KEY]
- path: VARCHAR(1024)
- user_id: UUID
- current_version: INT

Table: file_chunks (Relational)
- file_id: UUID
- version: INT
- chunk_index: INT
- chunk_hash: CHAR(64) -- SHA-256 key into S3 Block Store`,
    architecture: `1. **Client Chunking Engine:**
   - Splits files into **4MB chunks**.
   - Computes **SHA-256 hash** for each chunk.
   - Compares hashes with local metadata cache: Only modified chunks are transmitted (Delta Sync).
2. **Block Storage Service:**
   - Saves 4MB chunks into **AWS S3 / Distributed Object Store** indexed by \`chunk_hash\`.
   - Global Deduplication: If two users upload the same exact file, the chunk hash matches and the block is stored only once!
3. **Metadata Service:**
   - Stores folder hierarchy and file-to-chunk mappings in **PostgreSQL**.
4. **Notification Service:**
   - Uses WebSockets / Long-Polling to broadcast file change events to all linked devices of the user.`,
    deepDives: [
      {
        title: "Resolving Conflicting Edits (Offline Editing)",
        content: "If User A and User B edit the same file simultaneously while offline, the first device to sync commits Version 2. When the second device syncs, the server rejects Version 2 with a conflict error. The client creates a separate conflicted file: \`document (User B's conflicted copy 2026-11-01).txt\` so zero work is overwritten."
      }
    ]
  },
  {
    id: "cs_code_judge",
    title: "Design a Distributed Code Execution Judge (LeetCode / Codeforces)",
    difficulty: "Hard",
    status: "Planned",
    category: "Sandbox Compute",
    metrics: "10,000 code submissions / minute • Execution timeout: 2.0s • Memory limit: 256MB",
    summary: "Sandboxed remote code execution system. Docker & Linux cgroups/seccomp security isolation, Redis priority queue, and deterministic grading.",
    keyConcepts: ["Linux cgroups & namespaces", "Seccomp System Call Filtering", "Docker Container Sandbox", "Redis Priority Queue", "Judge Worker Pool"],
    requirements: {
      functional: [
        "Submit code in C++, Java, Python, JavaScript, Go.",
        "Execute code against hidden test cases.",
        "Return verdict: Accepted, Wrong Answer, Time Limit Exceeded (TLE), Memory Limit Exceeded (MLE), Runtime Error."
      ],
      nonFunctional: [
        "Security & Isolation: Prevent malicious code from deleting files or opening botnet connections.",
        "Fairness & Determinism: CPU execution time must be consistent."
      ]
    },
    estimations: `### Capacity Estimation:
- 10,000 submissions/min = ~166 submissions/sec.
- Average execution time: 1.5 seconds.
- Concurrent active executions: 166 * 1.5 = 250 parallel sandboxed runners.`,
    apiDesign: `POST /api/v1/submissions
Request:  { "problemId": 1, "language": "cpp", "code": "int main() { ... }" }
Response: { "submissionId": "sub_441", "status": "QUEUED" }

GET /api/v1/submissions/{submissionId}
Response: { "status": "COMPLETED", "verdict": "ACCEPTED", "timeMs": 42, "memoryKb": 12400 }`,
    databaseSchema: `Table: test_cases (Stored in S3 / Fast Local NVMe SSD)
- problem_id: INT
- input_file_path: VARCHAR(256)
- expected_output_file_path: VARCHAR(256)

Table: submissions (PostgreSQL)
- submission_id: UUID [PRIMARY KEY]
- user_id: UUID
- problem_id: INT
- verdict: VARCHAR(32)
- execution_time_ms: INT
- memory_used_bytes: BIGINT`,
    architecture: `1. **Client** submits code &rarr; **API Gateway** saves submission to PostgreSQL as \`QUEUED\`.
2. Gateway pushes submission ID to **Redis Priority Queue (BullMQ)**.
3. **Worker Pool (Judge Nodes):**
   - Autonomous judge workers poll queue.
   - Worker fetches problem test cases from local SSD cache.
   - Spawns an isolated **Linux Container** configured with:
     - **cgroups:** Hard limits CPU to 1 core, Memory to 256 MB.
     - **seccomp filter:** Blocks malicious system calls (\`fork()\` bomb, \`socket()\` network calls, \`execve()\`).
     - **Network namespace:** Completely disabled (zero internet access).
   - Feeds \`stdin\`, captures \`stdout\`, compares against expected output.
4. Updates database with verdict and broadcasts result via WebSocket to user.`,
    deepDives: [
      {
        title: "Preventing Fork Bombs and System Hacking in Code Judges",
        content: "Malicious users often submit code like \`while(1) fork();\` to crash the host server. A secure judge enforces a strict Linux cgroup \`pids.max = 30\` limit and drops Linux capabilities using \`seccomp\` so the process cannot spawn infinite sub-processes or access host network interfaces."
      }
    ]
  }
];
