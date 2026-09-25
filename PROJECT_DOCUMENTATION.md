# 📘 CodeCollab — Complete Project Documentation & Technical Report

---

## 📑 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement & Motivation](#2-problem-statement--motivation)
3. [Key Features & Capabilities](#3-key-features--capabilities)
4. [Technology Stack & Architectural Decisions](#4-technology-stack--architectural-decisions)
5. [System Architecture & Data Flow](#5-system-architecture--data-flow)
6. [Database Schema & Data Models](#6-database-schema--data-models)
7. [Real-Time WebSocket Protocol](#7-real-time-websocket-protocol)
8. [REST API Specification](#8-rest-api-specification)
9. [AI Assistant Integration (Gemini & OpenAI)](#9-ai-assistant-integration-gemini--openai)
10. [GitHub Integration Workflow](#10-github-integration-workflow)
11. [Security, Authentication & Authorization](#11-security-authentication--authorization)
12. [Testing, CI/CD & Deployment](#12-testing-cicd--deployment)
13. [Installation & Setup Guide](#13-installation--setup-guide)
14. [Software Engineering (SDE) & Viva Talking Points](#14-software-engineering-sde--viva-talking-points)

---

## 1. Project Overview

**CodeCollab** is a full-stack real-time collaborative code editor and interview preparation platform built on the **MERN (MongoDB, Express, React, Node.js)** stack. It enables developers, interviewers, and students to write, analyze, discuss, and persist code collaboratively in real-time across four major programming languages: **Java, JavaScript, C++, and Python**.

### Core Value Proposition
- **Seamless Pair Programming:** Zero-latency synchronized multi-user code editing powered by Socket.IO and Microsoft Monaco Editor.
- **AI-Powered Intelligent Assistant:** 6 specialized modes (*Ask, Explain, Debug, Review, Test Generator, Refactor*) with streaming responses via Server-Sent Events (SSE).
- **Direct GitHub Synchronization:** Export and commit code directly into GitHub repositories from within the collaborative room.
- **Developer-Centric DSA Support:** Pre-configured boilerplate solutions and templates tailored for technical interview preparation.
- **Zero-Friction Local Execution:** Automatic fallback to in-memory MongoDB (`mongodb-memory-server`) when a local MongoDB instance is not detected.

---

## 2. Problem Statement & Motivation

| Traditional Collaboration Tools | CodeCollab Solution |
| :--- | :--- |
| Screen-sharing tools consume heavy bandwidth and lack interactive dual-typing capabilities. | Direct character-level synchronization over lightweight WebSockets. |
| Generic text editors lack language-specific intelligence and syntax tooling. | Industry-standard Monaco Editor with AST-aware syntax highlighting for Java, JS, C++, and Python. |
| Context switching between editor, AI tools (ChatGPT/Gemini), and GitHub repositories slows workflow. | Unified workspace with integrated AI assistant and direct GitHub commit tools. |
| Complicated onboarding requiring external database configurations. | Dual-mode database engine: connects to MongoDB URI or initializes an instant in-memory instance. |

---

## 3. Key Features & Capabilities

### 👥 Real-Time Room Collaboration
- **Dynamic Room Creation:** Create private or public rooms with custom titles and language defaults.
- **Access Control Modes:** 
  - `Open`: Instant entry for all authenticated participants.
  - `Approval Required`: Host approves/rejects incoming join requests via real-time notifications.
- **Presence & Participant Management:** Live participant list showing active online status, roles (Host vs. Participant), and join timestamps.

### 💻 Code Editor & Multi-Language Support
- **Monaco Editor Integration:** Code folding, minimap, line numbers, brackets matching, and keyboard shortcuts.
- **Language Switcher:** Instant runtime language switching across **Java**, **JavaScript**, **C++**, and **Python** with starter DSA templates.
- **Code Synchronization:** Real-time bi-directional code diff broadcasting with debounce optimization.

### 🤖 AI Engineering Copilot
- **6 Domain-Specific Modes:**
  1. `Ask`: General interactive technical Q&A with full code context.
  2. `Explain`: Step-by-step logic breakdown with Time and Space Complexity ($O(N)$ analysis).
  3. `Debug`: Root cause analysis for syntax, runtime, and edge-case errors.
  4. `Review`: Clean code audit (SOLID principles, readability, naming conventions).
  5. `Tests`: Unit test generation (JUnit for Java, Jest for JS, PyTest for Python, GoogleTest for C++).
  6. `Refactor`: Performance and memory optimization suggestions.
- **Selection Awareness:** Highlight specific lines to restrict AI evaluation solely to that snippet.
- **Streaming UI:** Token-by-token rendering with markdown code block formatting.

### 🐙 GitHub Direct Sync
- **Repository Integration:** Connect via personal access tokens (PAT) kept securely client-side.
- **Commit & Push:** Specify target repo, branch, commit message, and file path.
- **Language Detection:** Auto-resolves correct file extensions (`.java`, `.js`, `.cpp`, `.py`).

---

## 4. Technology Stack & Architectural Decisions

### Frontend
- **Library/Framework:** React 19 + Vite 6
- **Language:** JavaScript (ES Modules)
- **Styling:** Tailwind CSS + Lucide React Icons
- **Code Editor:** `@monaco-editor/react` (Microsoft Monaco engine)
- **Routing:** React Router DOM v7
- **Networking:** Axios (HTTP client) + Socket.IO Client + EventSource (SSE)

### Backend
- **Runtime:** Node.js (v18+ / v20+)
- **Framework:** Express.js (MVC modular architecture)
- **Real-Time Engine:** Socket.IO v4 (WebSocket + long-polling fallback)
- **Database ORM:** Mongoose v8
- **Authentication:** JSON Web Tokens (`jsonwebtoken`) + Password Hashing (`bcryptjs`)
- **AI Integrations:** Google Generative AI (`@google/generative-ai`) / OpenAI API
- **Testing Suite:** Vitest + Supertest + MongoDB Memory Server

### Infrastructure & DevOps
- **CI/CD Pipeline:** GitHub Actions (Automated linting, testing matrix on Node 18 & 20, and production build)
- **Cloud Deployment:** Render (`render.yaml` infrastructure-as-code configuration)

---

## 5. System Architecture & Data Flow

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           CLIENT BROWSER (React)                          │
│                                                                           │
│  ┌──────────────┐   ┌───────────────┐   ┌────────────┐   ┌─────────────┐  │
│  │ Auth Context │   │ Monaco Editor │   │ AI Drawer  │   │ GitHub Modal│  │
│  └──────┬───────┘   └───────┬───────┘   └─────┬──────┘   └──────┬──────┘  │
│         │                   │                 │                 │         │
│         └─────────────┬─────┴─────────────────┴─────────────────┘         │
│                       │ Axios REST + Socket.IO + SSE Stream               │
└───────────────────────┼───────────────────────────────────────────────────┘
                        │
┌───────────────────────┼───────────────────────────────────────────────────┐
│                       ▼     BACKEND SERVER (Express + Node)               │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                        Express Middleware Layer                     │  │
│  │       CORS Policy │ Helmet │ JSON Body Parser │ JWT Auth Guard      │  │
│  └────────────────────┬─────────────────────────┬──────────────────────┘  │
│                       │                         │                         │
│  ┌────────────────────▼───────┐        ┌────────▼──────────────────────┐  │
│  │       REST API Routers     │        │     Socket.IO Event Engine    │  │
│  │  /api/auth    /api/rooms   │        │  JOIN_ROOM     LEAVE_ROOM     │  │
│  │  /api/ai      /api/github  │        │  CODE_CHANGE   LANGUAGE_CHANGE│  │
│  └────────────┬───────────────┘        └────────┬──────────────────────┘  │
│               │                                 │                         │
│  ┌────────────▼───────────────┐                 │ Broadcast to Room peers │
│  │      Service Layer         │                 └─────────────────────────┘
│  │  AuthService │ RoomService │                                           │
│  │  AIService   │ GitHubService                                           │
│  └────────────┬───────────────┘                                           │
│               │                                                           │
│  ┌────────────▼────────────────────────────────────────────────────────┐  │
│  │                     Data Layer (Mongoose ODM)                       │  │
│  │      Primary: MongoDB Atlas / Local MongoDB (port 27017)            │  │
│  │      Fallback: Embedded In-Memory MongoDB Server                    │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Database Schema & Data Models

### 1. User Model (`User.js`)
```javascript
{
  username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 }, // bcrypt hashed
  avatar:   { type: String, default: "" },
  createdAt:{ type: Date, default: Date.now }
}
```

### 2. Room Model (`Room.js`)
```javascript
{
  name:         { type: String, required: true, trim: true },
  description:  { type: String, default: "" },
  host:         { type: Schema.Types.ObjectId, ref: "User", required: true },
  language:     { type: String, enum: ["java", "javascript", "cpp", "python"], default: "javascript" },
  code:         { type: String, default: "" },
  isPrivate:    { type: Boolean, default: false },
  requiresApproval: { type: Boolean, default: false },
  participants: [{
    user:     { type: Schema.Types.ObjectId, ref: "User" },
    role:     { type: String, enum: ["host", "editor", "viewer"], default: "editor" },
    joinedAt: { type: Date, default: Date.now }
  }],
  pendingRequests: [{
    user:        { type: Schema.Types.ObjectId, ref: "User" },
    requestedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

---

## 7. Real-Time WebSocket Protocol

Socket.IO handles state synchronization across connected clients in individual rooms:

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `join-room` | Client ➔ Server | `{ roomId, user }` | Authenticates socket connection and joins room channel. |
| `user-joined` | Server ➔ Client | `{ user, participants }` | Broadcasts new user entry and updated roster. |
| `code-change` | Client ➔ Server | `{ roomId, code }` | Emits updated editor buffer content. |
| `code-update` | Server ➔ Client (Broadcast) | `{ code, updatedBy }` | Synchronizes code buffer to all peers in the room. |
| `language-change` | Client ➔ Server | `{ roomId, language, defaultCode }` | Host requests language change. |
| `language-update` | Server ➔ Client (Broadcast) | `{ language, code }` | Switches Monaco language mode and starter template. |
| `leave-room` | Client ➔ Server | `{ roomId }` | Explicit departure from room. |
| `user-left` | Server ➔ Client | `{ userId, participants }` | Updates peer roster on disconnect or departure. |
| `join-request` | Client ➔ Server | `{ roomId, user }` | Sends pending admission request to host. |
| `join-response` | Server ➔ Client | `{ approved, roomId }` | Informs waiting user of host decision. |

---

## 8. REST API Specification

### Authentication Endpoints (`/api/auth`)
- `POST /api/auth/register` — Registers new account.
  - **Body:** `{ username, email, password }`
  - **Response (201):** `{ token, user: { id, username, email } }`
- `POST /api/auth/login` — Authenticates user credentials.
  - **Body:** `{ email, password }`
  - **Response (200):** `{ token, user: { id, username, email } }`
- `GET /api/auth/me` — Returns current authenticated profile.
  - **Headers:** `Authorization: Bearer <JWT>`
  - **Response (200):** `{ user: { id, username, email, createdAt } }`

### Room Management Endpoints (`/api/rooms`)
- `GET /api/rooms` — Retrieves public room directory.
- `POST /api/rooms` — Creates a new collaboration room.
  - **Body:** `{ name, description, language, isPrivate, requiresApproval }`
- `GET /api/rooms/:id` — Fetches room metadata, code snapshot, and participants.
- `PUT /api/rooms/:id` — Updates room configuration/code (Host only).
- `DELETE /api/rooms/:id` — Closes room session (Host only).

### AI Assistant Endpoints (`/api/ai`)
- `POST /api/ai/stream` — Streams AI response via SSE.
  - **Body:** `{ prompt, mode, code, language, selectedCode }`
  - **Modes:** `"ask" | "explain" | "debug" | "review" | "tests" | "refactor"`
- `GET /api/ai/status` — Checks AI engine provider status (`gemini` or `openai`).

### GitHub Integration Endpoints (`/api/github`)
- `POST /api/github/push` — Commits and pushes room code to GitHub repo.
  - **Headers:** `Authorization: Bearer <JWT>`
  - **Body:** `{ repoUrl, branch, commitMessage, filePath, code, githubToken }`

---

## 9. AI Assistant Integration (Gemini & OpenAI)

```
┌─────────────────┐       ┌─────────────────┐       ┌──────────────────┐
│  React Client   │       │ Express Backend │       │ AI Provider API  │
│ (SSE Listener)  │       │ (AIService.js)  │       │ (Gemini/OpenAI)  │
└────────┬────────┘       └────────┬────────┘       └────────┬─────────┘
         │                         │                         │
         │  POST /api/ai/stream    │                         │
         ├────────────────────────►│  Construct Prompt with  │
         │  (mode, code, language) │  Context & Constraints  │
         │                         ├────────────────────────►│
         │                         │                         │
         │  HTTP 200 (text/event-stream)                     │
         │◄────────────────────────┤                         │
         │                         │  Stream chunks          │
         │  data: {"chunk": "..."} │◄────────────────────────┤
         │◄────────────────────────┤                         │
         │  data: {"chunk": "..."} │                         │
         │◄────────────────────────┤                         │
         │  data: [DONE]           │                         │
         │◄────────────────────────┤                         │
```

### Prompt Engineering Strategies
- **Context Injection:** Injects current programming language, whole file buffer, and explicit user cursor selections.
- **Deterministic Formatting:** Enforces Markdown output with language-tagged fenced code blocks for clean syntax highlighting in the client UI.
- **Budgeting & Rate Limiting:** Enforces input size restrictions to protect tokens and backend bandwidth.

---

## 10. GitHub Integration Workflow

1. **Token Input:** User enters their GitHub Personal Access Token (with `repo` scope).
2. **Client-Side Security:** Token is kept in React state or ephemeral session storage—**never persisted to database**.
3. **Repository Resolution:** The backend interacts with the GitHub REST API (`/repos/{owner}/{repo}/contents/{path}`):
   - Queries if the file already exists on the specified branch to fetch its latest `SHA`.
   - Creates or updates the file buffer using Base64 encoding.
   - Creates an atomic commit on the designated branch.
4. **Instant Verification:** Returns direct commit URL for one-click verification in GitHub.

---

## 11. Security, Authentication & Authorization

| Security Concern | Implementation Strategy |
| :--- | :--- |
| **Password Storage** | One-way hashing with `bcryptjs` using 10 salt rounds. |
| **Session Integrity** | Stateless signed JWTs with configurable expiration (`JWT_EXPIRES_IN=7d`). |
| **Route Protection** | Express authentication middleware validates `Bearer <token>` headers. |
| **Room Authorization** | Granular role verification: only room hosts can delete rooms or update access rules. |
| **API Abuse Prevention** | Per-IP and per-room rate limiting on AI streaming endpoints. |
| **Third-Party Credentials**| GitHub PATs transmitted via secure HTTPS and processed in-memory without logging or persistence. |

---

## 12. Testing, CI/CD & Deployment

### Automated Backend Testing Suite
- **Framework:** Vitest + Supertest
- **Coverage:**
  - `POST /api/auth/register` (success, duplicate email, missing fields)
  - `POST /api/auth/login` (success, invalid password, non-existent user)
  - `GET /api/auth/me` (authenticated vs. unauthenticated)
  - `GET /api/rooms` (retrieval)
  - `POST /api/rooms` (room lifecycle)
  - `GET /api/ai/status` & `POST /api/ai/stream` (AI health & mode verification)
  - `GET /health` (system uptime status)

### GitHub Actions CI Workflow (`.github/workflows/ci.yml`)
```yaml
name: CI Pipeline
on: [push, pull_request]
jobs:
  test-and-build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - name: Install dependencies
        run: npm run install:all
      - name: Run Backend Tests
        run: cd backend && npm test
      - name: Build Frontend
        run: cd frontend && npm run build
```

---

## 13. Installation & Setup Guide

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- *(Optional)* Local MongoDB or MongoDB Atlas URI

### Quick Start (All-in-One Command)

1. **Clone repository:**
   ```bash
   git clone https://github.com/your-username/codecollab.git
   cd codecollab-Final
   ```

2. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

3. **Configure environment variables:**
   ```bash
   # In backend/.env
   PORT=5000
   CLIENT_URL=http://localhost:5173
   JWT_SECRET=super_secret_development_key
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Launch development servers (Frontend + Backend concurrently):**
   ```bash
   npm run dev
   ```
   - **Frontend:** `http://localhost:5173`
   - **Backend API:** `http://localhost:5000`

---

## 14. Software Engineering (SDE) & Viva Talking Points

When presenting or interviewing about this project, highlight these core engineering concepts:

### 1. Concurrency & Real-Time State Sync
> *"We implemented WebSockets via Socket.IO with room-level channel isolation. To prevent race conditions and network saturation during rapid typing, the frontend debounces editor update broadcasts while maintaining instant local optimism."*

### 2. Zero-Config Database Architecture
> *"To ensure seamless developer evaluation without demanding local MongoDB installation, we designed a dual-tier database connector: it first attempts connection to the configured MongoDB URI, and automatically boots an embedded `mongodb-memory-server` if unreachable."*

### 3. Streaming AI with Server-Sent Events (SSE)
> *"Instead of waiting for full LLM generation which degrades UX on large codebases, we utilized HTTP Server-Sent Events to stream token chunks progressively, delivering immediate visual feedback and time-to-first-byte under 300ms."*

### 4. Modular Separation of Concerns (MVC)
> *"The backend adheres to clean MVC architecture separating Route Handlers, Service Business Logic, and Data Access Layers (Mongoose Models), facilitating unit and integration testing via Supertest."*

---

*Authored for portfolio presentations, technical viva examinations, and production MERN reference.*
