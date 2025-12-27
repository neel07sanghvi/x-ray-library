# X-Ray Debugger

A debugging system for multi-step, non-deterministic algorithmic processes.

Loom Video - https://www.loom.com/share/8d5fb5184eea4bbdb5a1a8fd94e2411c

## Overview

X-Ray provides transparency into complex decision pipelines by capturing not just *what* happened, but *why* each decision was made. Unlike traditional logging or tracing, X-Ray records the reasoning behind every step, making it easy to pinpoint exactly where things went wrong.

## Project Structure

```
xray-debugger/
├── xray-lib/         # Core X-Ray library (TypeScript)
├── backend/          # Express API + Demo workflow
└── dashboard/        # React+Vite+Tailwind UI
```

## Quick Start

### Option 1: Using Docker (Recommended)

```bash
# Start everything with one command
docker-compose up --build

# Access the application
# Dashboard: http://localhost:5173
# Backend API: http://localhost:3001
```

### Option 2: Manual Setup

```bash
# 1. Build the X-Ray library
cd xray-lib
npm install
npm run build

# 2. Start the backend
cd ../backend
npm install
npm run dev
# Backend runs on http://localhost:3001

# 3. Start the dashboard (in a new terminal)
cd ../dashboard
npm install
npm run dev
# Dashboard runs on http://localhost:5173
```

### Testing the Demo

1. Open the dashboard at `http://localhost:5173`
2. Click the **"Run Demo"** button
3. A new trace will appear in the sidebar
4. Click on the trace to view the complete decision trail
5. Expand each step to see inputs, outputs, reasoning, and detailed evaluations

## My Approach

### 1. Library Design

**X-Ray Library** (`xray-lib/`):
- Simple TypeScript SDK with 3 core methods: `startTrace()`, `logStep()`, `endTrace()`
- Framework-agnostic - works in Node.js, browsers, anywhere JavaScript runs
- Captures five key pieces per step: name, input, output, reasoning, and metadata
- The `reasoning` field is the differentiator - it explains *why* each decision was made

### 2. Demo Application

**Backend** (`backend/`):
- Express.js API with in-memory trace storage
- 4-step competitor product selection workflow using mock data
- Demonstrates X-Ray's value through:
  - **Step 1**: Keyword generation (simulated LLM call)
  - **Step 2**: Candidate search (mock API returning 10 products)
  - **Step 3**: Filter application (most important - shows detailed pass/fail reasons)
  - **Step 4**: Ranking & selection (transparent scoring with breakdowns)
- **Properly imports xray-lib** - no code duplication, demonstrating true library reuse

### 3. Dashboard Visualization

**Dashboard** (`dashboard/`):
- React + Vite + Tailwind CSS for professional styling
- Two-panel layout: trace list (sidebar) + trace details (main)
- **Custom visualizations** for key steps:
  - **Filter step**: Color-coded cards (green for passed, red for failed) with detailed per-product evaluations
  - **Ranking step**: Blue highlight for winner, score breakdowns for all candidates
- Collapsible steps with "Expand All" / "Collapse All" controls
- **Download JSON button** - Export any trace as a JSON file for sharing or analysis
- Internal scrolling for long traces (keeps header visible)

### 4. Key Design Decisions

- **Prioritized clarity**: Each visualization answers "why did this happen?"
- **Color coding**: Green (passed), Red (failed), Blue (selected) for instant understanding
- **Detailed per-item evaluations**: For filters, you see exactly which products failed which criteria
- **General-purpose library**: Not tied to competitor selection - works for any multi-step workflow
- **Docker support**: Single-command setup for easy evaluation

## What Makes This Different From Tracing

| Traditional Tracing | X-Ray |
|---------------------|-------|
| "What functions ran?" | "Why this decision?" |
| Performance metrics | Decision reasoning |
| Service-level view | Business logic view |
| Function calls | Candidate evaluations |

**Example**: Traditional tracing tells you "selected product B0COMP01". X-Ray tells you "selected B0COMP01 because it had the highest score (0.82) based on review count (8932), rating (4.5★), and price proximity - and here's why 3 other products were eliminated."

## Technical Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Express.js, Node.js
- **X-Ray Library**: TypeScript (compiled to JavaScript)
- **Storage**: In-memory
- **Containerization**: Docker + Docker Compose

## API Endpoints

```bash
GET  /api/traces          # List all traces
GET  /api/traces/:id      # Get specific trace
POST /api/traces          # Store a trace
POST /api/demo/run        # Run demo workflow
GET  /health              # Health check
```

## Known Limitations & Future Improvements

### Current Limitations

1. **Storage**: In-memory only - traces lost on server restart
2. **No persistence**: Can't save traces long-term or share links
3. **No search**: Can't filter or search across traces
4. **No real-time**: Dashboard requires manual refresh
5. **No pagination**: Could be slow with hundreds of traces
6. **Desktop-only**: Not optimized for mobile devices

### Future Improvements

**Short-term** (1-2 weeks):
- **Persistent storage**: Add SQLite or JSON file storage
- **Search & filter**: Full-text search across traces, filter by date/status
- **Better error handling**: Graceful failures with retry logic

**Medium-term** (1-2 months):
- **Real-time updates**: WebSocket support for live trace streaming
- **Trace comparison**: Side-by-side comparison of two traces
- **Performance metrics**: Add timing data for each step
- **Mobile responsive**: Optimize for tablet/mobile debugging

**Long-term** (3+ months):
- **Time-travel debugging**: Replay state at each step
- **Plugin system**: Custom visualizations without code changes
- **Trace aggregation**: Pattern detection across multiple executions
- **Integration with monitoring**: Connect to DataDog, Splunk, etc.
- **Multi-language SDKs**: Python, Java, Go implementations

## Integration Example

```javascript
// Any workflow can use X-Ray
const xray = createXRay();

xray.startTrace('unique-id', { workflow: 'my-process' });

xray.logStep(
  'filter_candidates',
  { count: 100 },                    // Input
  { passed: 12, failed: 88 },        // Output
  'Filtered by price and rating',    // WHY ← This is key!
  { filter_type: 'business_rules' }  // Metadata
);

const trace = xray.endTrace();
await sendToBackend(trace);
```

## License

MIT
