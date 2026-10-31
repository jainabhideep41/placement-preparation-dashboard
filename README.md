# PREPSTACK — Placement Preparation & Developer Portfolio Platform

> **Academic Basis:** Topic 7: *Placement Preparation Dashboard*  
> **Course:** Lab Based Mini Projects 2026 – Full Stack Development II  
> **Required Technologies:** Computer, VS Code, Node.js, React.js, React Hooks  
> **Core Objectives:** Component-based dashboard design, progress tracking, and conditional rendering.

---

## 1. Project Overview

PREPSTACK is a developer-centric placement preparation platform answering the core question:
> **"How prepared is a student for software development placements, and what evidence supports that assessment?"**

Rather than a generic attendance counter or subjective slider, PREPSTACK combines **four technical pillars** into an objective, weighted **Placement Readiness Index**:

1. **Data Structures & Algorithms (35% Weight)**
   - Normalized metrics across **LeetCode**, **Codeforces**, **AtCoder**, and **HackerRank**.
   - Topic progress tracking (Arrays, Trees, Graphs, DP, etc.).
   - Curated sheets (Striver SDE 180, Blind 75, NeetCode 150, CP Essentials).
   - "My Problems" tracker with search, multi-axis filtering, status toggling, and spaced repetition intervals (3-day, 7-day, 30-day, Mastered).

2. **Web Development Engineering (25% Weight)**
   - Progressive roadmaps across Frontend, Backend & Systems, Databases, and DevOps/CI-CD.
   - Objective percentage calculation based on verified completed milestones (`completed / total`).
   - Project Evidence showcase linking repositories, commits, PRs, and interview highlights.

3. **System Design & Scalability (20% Weight)**
   - Core topic mastery: Fundamentals, Networking, Scalability, Databases, Distributed Systems, and LLD design patterns.
   - High-Level Design Case Studies (URL Shortener, Chat System, Rate Limiter, Video Streaming).
   - Interactive Scalability & Edge CDN / Load Balancer visualizer demonstrating low-latency cache hits vs dynamic database bypass.

4. **GitHub & FOSS Developer Contributions (10% + 10% Projects)**
   - Quantified developer evidence: commits, public repos, merged pull requests, issues, and code reviews.
   - FOSS classification (Tier 1 upstream vs community open source).
   - Annual contribution heatmap grid.

5. **Placement Readiness Engine & Weak Area Detection**
   - Synthesizes all 4 pillars into a single 0–100 score.
   - Assigns conditional status tiers: *Highly Prepared* (≥85%), *Strong Preparation* (70–84%), *Keep Preparing* (50–69%), *Needs Significant Preparation* (<50%).
   - Identifies weakest preparation areas and outputs prioritized 4-week sprint recommendations.

---

## 2. Visual & Architectural Design

- **Visual Direction:** Inspired by **CP Companion** (dark technical aesthetic, high information density, clean typography, responsive layout).
- **DSA Architecture:** Inspired by **Codolio** (unified coding-platform tracking, sheets, topic-wise progress, difficulty distribution).

---

## 3. Technology Stack & Demonstrations

| Requirement | Implementation in PREPSTACK |
|---|---|
| **React Components** | Modular architecture (`Navbar`, `Sidebar`, `MetricCard`, `ProgressBar`, `Badge`, `Charts`, `LoadingSkeleton`, `EmptyState`) |
| **React Hooks** | `useState`, `useEffect`, `useCallback`, plus custom hooks: `useDashboardData`, `useDSAData`, `useProgress`, `useLocalCache` |
| **State Management** | Multi-tier state: Active React State + Browser `localStorage` persistence + Backend In-Memory LRU Cache |
| **Conditional Rendering** | Loading skeletons, error boundaries, empty states, status badges, readiness tier chips, tab switching |
| **Node.js API** | Express.js REST server normalizing external APIs, caching responses with stale-while-revalidate TTLs |
| **Performance** | Concurrent platform fetching via `Promise.all`, lightweight SVG charts, zero heavy runtime dependencies |

---

## 4. Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)

### Quick Start (Concurrent)
```bash
# 1. Install dependencies for both client and server
npm run install:all

# 2. Start both backend (port 5000) and frontend (port 5173)
npm run dev
```

### Manual Individual Commands
```bash
# Start backend server
cd server
npm install
npm run dev

# Start frontend client (in separate terminal)
cd client
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 5. Viva Defense / Examiner Q&A Guide (Section 64)

### Q1: "What is your project?"
> A placement preparation platform that synthesizes competitive programming metrics, web development roadmaps, system design concepts, and GitHub open-source contributions into a unified, actionable readiness score.

### Q2: "Why React.js and Hooks?"
> The project sheet specifically required React and Hooks. A dashboard is inherently component-based. Reusable cards, progress bars, and custom hooks (`useDashboardData`, `useDSAData`, `useProgress`) allow modular code, reactive state updates, and clean conditional rendering without page reloads.

### Q3: "How does the caching architecture work?"
> We implement a 3-tier caching model:
> 1. Level 1: Active React component state for instant user interactions.
> 2. Level 2: Browser `localStorage` for cross-session offline persistence.
> 3. Level 3: Node.js server in-memory cache with configurable TTLs (15–30 min) to avoid rate limiting and reduce external API latency.

### Q4: "How does the system avoid double-counting problems?"
> The tracker separates *platform solves* (e.g. 482 on LeetCode + 326 on Codeforces) from *unique tracked problems*. Canonical problems are indexed by title/pattern so practice on multiple platforms does not distort the unique problem metric.

### Q5: "How does it scale to production?"
> In a production deployment, static frontend assets are served globally via an Edge CDN. The Node.js API instances run statelessly behind an L7 Load Balancer, backed by a shared Redis distributed cache and persistent database.
