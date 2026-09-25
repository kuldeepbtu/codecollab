# 🚀 CodeCollab — Real-Time Collaborative Coding & DSA Platform (MERN Stack)

[![Node.js](https://img.shields.io/badge/Node.js-18%2B%20%7C%2020%2B-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen?logo=mongodb)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-v4-black?logo=socket.io)](https://socket.io/)
[![CI Pipeline](https://img.shields.io/badge/CI-GitHub_Actions-blue?logo=githubactions)](https://github.com/)
[![Tests](https://img.shields.io/badge/Tests-14%20Passing-success)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-purple)](#)

A production-ready full-stack **MERN (MongoDB, Express, React, Node.js)** collaborative code execution and interview preparation platform designed for technical interviews, pair programming, and DSA preparation across **Java, JavaScript, C++, and Python**.

Built with modern software engineering practices, clean MVC architecture, real-time WebSockets, AI-powered code assistance (Gemini / OpenAI), direct GitHub synchronization, and automated CI/CD.

---

## 📑 Table of Contents

1. [🏗️ System Architecture](#-system-architecture)
2. [🌟 Key Engineering Highlights (SDE & MERN)](#-key-engineering-highlights-sde--mern)
3. [🎯 Problem Statement & Motivation](#-problem-statement--motivation)
4. [🚀 Comprehensive Feature Breakdown](#-comprehensive-feature-breakdown)
5. [📂 Directory & Project Structure](#-directory--project-structure)
6. [🗄️ Database Schemas & Data Models](#️-database-schemas--data-models)
7. [⚡ Real-Time WebSocket Protocol](#-real-time-websocket-protocol)
8. [🔌 REST API Specification](#-rest-api-specification)
9. [🤖 AI Copilot Architecture (Gemini & OpenAI)](#-ai-copilot-architecture-gemini--openai)
10. [🐙 GitHub Integration Workflow](#-github-integration-workflow)
11. [🛡️ Security, Authentication & Authorization](#️-security-authentication--authorization)
12. [🧪 Testing, CI/CD & Deployment](#-testing-cicd--deployment)
13. [💻 Installation & Setup Guide](#-installation--setup-guide)
14. [🎓 SDE Interview & Viva Talking Points](#-sde-interview--viva-talking-points)

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 19 + Vite)                │
│  ┌───────────┐  ┌────────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Auth     │  │ Dashboard  │  │  Monaco  │  │ AI Assistant │  │
│  │  Pages    │  │ (Rooms)    │  │  Editor  │  │ (6 Modes)    │  │
│  └─────┬─────┘  └──────┬─────┘  └────┬─────┘  └──────┬───────┘  │
│        │               │             │               │           │
│  ┌─────┴───────────────┴─────────────┴───────────────┴─────┐     │
│  │              Services (Axios + Socket.IO Client)        │     │
│  │    authService │ roomService │ aiService │ githubService │     │
│  └─────────────────────┬───────────────────────────────────┘     │
└────────────────────────┼─────────────────────────────────────────┘
                         │ HTTP REST + WebSocket + SSE
┌────────────────────────┼─────────────────────────────────────────┐
│                        │       BACKEND (Node.js + Express)       │
│  ┌─────────────────────┴───────────────────────────────────┐     │
│  │                    Express Routes                        │     │
│  │  /api/auth │ /api/rooms │ /api/ai │ /api/github │ health│     │
│  └───────┬──────────┬──────────┬──────────┬────────────────┘     │
│          │          │          │          │                       │
│  ┌───────┴──┐ ┌─────┴────┐ ┌──┴───────┐ ┌┴──────────────┐      │
│  │ Auth     │ │ Room     │ │ AI       │ │ GitHub        │      │
│  │ Service  │ │ Service  │ │ Service  │ │ Service       │      │
│  │ (bcrypt) │ │ (CRUD)   │ │ (Gemini/ │ │ (Connect/Push)│      │
│  │          │ │          │ │ OpenAI)  │ │               │      │
│  └───────┬──┘ └─────┬────┘ └──────────┘ └───────────────┘      │
│          │          │                                            │
│  ┌───────┴──────────┴──────────────────────────────────────┐     │
│  │           MongoDB (Mongoose) / Memory Fallback          │     │
│  │       User │ Room │ JoinRequest │ Participants           │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │              Socket.IO (Real-Time Layer)                  │    │
│  │  CODE_CHANGE │ LANGUAGE_CHANGE │ PARTICIPANTS │ PRESENCE  │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🌟 Key Engineering Highlights (SDE & MERN)

- **Pure MERN Stack Architecture**:
  - **M**ongoDB & Mongoose with schema validation, indexes, and automatic fallback to `mongodb-memory-server` (zero-config local evaluation!).
  - **E**xpress.js with modular MVC routing, centralized error handlers, and JWT authentication middleware.
  - **R**eact 19 with Vite, Tailwind CSS, React Router v7, and VS Code's core **Monaco Editor**.
  - **N**ode.js + Socket.IO with multi-room broadcast, heartbeat ping/pong, and disconnect cleanup.

- **AI-Powered Code Assistance** (Gemini / OpenAI):
  - 6 modes: **Ask**, **Explain**, **Debug**, **Review**, **Tests**, **Refactor**.
  - Server-Sent Events (SSE) streaming for real-time token-by-token responses.
  - Per-room rate limiting, input budgeting, and editor selection awareness.

- **GitHub Direct Integration**:
  - Connect to any GitHub repository using a Personal Access Token (PAT).
  - Push code directly from the editor to any branch with auto-detected file extensions.
  - Zero server persistence: tokens stay strictly client-side.

- **Multi-Language DSA & Software Development Support**:
  - Real-time syntax highlighting & starter DSA templates for **☕ Java**, **⚡ JavaScript**, **⚙️ C++**, and **🐍 Python**.

- **Enterprise Security & Auth Flow**:
  - Secure password hashing with multi-round `bcryptjs`.
  - Stateless authentication with signed JWT tokens.
  - Protected API routes & Socket.IO handshake authentication.

- **Room Access Control**:
  - Admin/Host controls with `Open` vs `Approval Required` collaboration modes.
  - Live participant tracking, role assignment, and session management.

- **Testing & CI/CD**:
  - Backend API tests with **Vitest** + **Supertest** + In-memory MongoDB (14 passing tests).
  - GitHub Actions CI pipeline matrix (Node 18 & 20: lint + test + build).
  - Render.com deployment configuration (`render.yaml`).

---

## 🎯 Problem Statement & Motivation

| Traditional Collaboration Tools | CodeCollab Solution |
| :--- | :--- |
| Screen-sharing consumes heavy network bandwidth and lacks dual-typing capabilities. | Character-level real-time synchronization over lightweight WebSockets. |
| Generic text editors lack language-specific intelligence and syntax tooling. | Industry-standard Monaco Editor with AST-aware syntax highlighting for Java, JS, C++, and Python. |
| Frequent context switching between editor, AI tools (ChatGPT/Gemini), and GitHub repositories. | Unified workspace with integrated AI assistant and direct GitHub commit tools. |
| Complicated onboarding requiring local database setup and external service dependencies. | Dual-mode database engine: connects to MongoDB URI or auto-initializes an instant in-memory instance. |

---

## 🚀 Comprehensive Feature Breakdown

### 1. 👥 Real-Time Room Collaboration
- **Dynamic Rooms:** Create private or public rooms with custom names, descriptions, and default languages.
- **Access Control Modes:** 
  - `Open`: Instant entry for all authenticated participants.
  - `Approval Required`: Host approves or rejects incoming join requests in real time.
- **Presence & Participant Tracking:** Live sidebar showing connected users, roles (*Host*, *Editor*, *Viewer*), and join timestamps.

### 2. 💻 Multi-Language Code Editor
- **Monaco Editor Engine:** VS Code core editor with code folding, minimap, line numbers, brackets matching, and keyboard shortcuts.
- **Language Switcher:** Instant runtime switching between **Java**, **JavaScript**, **C++**, and **Python**.
- **DSA Starter Templates:** Automatically populates idiomatic boilerplates (e.g. `public class Solution` for Java, standard I/O for C++).
- **Bi-directional Sync:** Instant broadcast of code changes to all peers with debounce optimization.

### 3. 🤖 AI Assistant (Gemini & OpenAI)
- **6 Domain Modes:**
  1. `Ask`: Interactive technical Q&A with full code context.
  2. `Explain`: Step-by-step logic breakdown with Time ($O$) and Space complexity analysis.
  3. `Debug`: Identifies root causes for syntax, runtime, or logical bugs and suggests fixes.
  4. `Review`: Code quality audit following SOLID principles and best practices.
  5. `Tests`: Unit test generation (JUnit for Java, Jest for JS, PyTest for Python, GoogleTest for C++).
  6. `Refactor`: Performance, readability, and memory optimization suggestions.
- **Selection Awareness:** Highlight specific lines to restrict AI evaluation solely to that snippet.
- **SSE Streaming:** Real-time token streaming for zero waiting time.

### 4. 🐙 Direct GitHub Integration
- **Connect Repository:** Authenticate via Personal Access Token (PAT).
- **Push & Commit:** Specify repository, target branch, commit message, and file path.
- **Automatic Extension Resolution:** Automatically appends `.java`, `.js`, `.cpp`, or `.py` based on active language.
- **Direct Commit Link:** Provides one-click verification link to GitHub commit.

---

## 📂 Directory & Project Structure

```txt
codecollab-Final/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI pipeline (Node 18 & 20)
├── backend/
│   ├── src/
│   │   ├── config/             # MongoDB connection & fallback configuration
│   │   ├── controllers/        # Route controllers (AuthController, RoomController)
│   │   ├── middleware/         # JWT auth middleware & validation
│   │   ├── models/             # Mongoose Schemas (User, Room)
│   │   ├── routes/             # REST API routes (auth, rooms, AI, GitHub)
│   │   ├── services/           # Business logic (auth, room, AI provider, GitHub)
│   │   ├── sockets/            # Socket.IO room & code synchronization handlers
│   │   ├── utils/              # Token generation & helper utilities
│   │   ├── app.js              # Express application setup
│   │   └── server.js           # Server & Socket.IO entry point
│   ├── test/
│   │   └── api.test.js         # Vitest + Supertest integration tests (14 tests)
│   ├── .env.example            # Environment template
│   └── package.json            # Backend dependencies & scripts
├── frontend/
│   ├── src/
│   │   ├── components/         # UI components (Navbar, Editor, AI Assistant, Modals)
│   │   ├── context/            # AuthContext & global state providers
│   │   ├── pages/              # Views (Home, Login, Register, Dashboard, Room)
│   │   ├── services/           # API clients (authService, roomService, aiService, githubService)
│   │   ├── App.jsx             # React Router configuration
│   │   ├── main.jsx            # React root entry
│   │   └── index.css           # Tailwind CSS styles
│   ├── index.html              # HTML5 entry
│   ├── vite.config.js          # Vite build config
│   └── package.json            # Frontend dependencies & scripts
├── render.yaml                 # Infrastructure-as-Code deployment blueprint
├── package.json                # Root orchestration package.json
└── README.md                   # Master project documentation
```

---

## 🗄️ Database Schemas & Data Models

### User Schema (`backend/src/models/User.js`)
```javascript
{
  username:  { type: String, required: true, unique: true, trim: true, minlength: 3 },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true, minlength: 6 }, // bcrypt hashed
  avatar:    { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
}
```

### Room Schema (`backend/src/models/Room.js`)
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

## ⚡ Real-Time WebSocket Protocol

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `join-room` | Client ➔ Server | `{ roomId, user }` | Authenticates socket connection and joins room channel. |
| `user-joined` | Server ➔ Client | `{ user, participants }` | Broadcasts new user arrival and updated participant list. |
| `code-change` | Client ➔ Server | `{ roomId, code }` | Emits updated editor buffer content. |
| `code-update` | Server ➔ Client | `{ code, updatedBy }` | Synchronizes code buffer to all peers in the room. |
| `language-change` | Client ➔ Server | `{ roomId, language, defaultCode }` | Host requests language change. |
| `language-update` | Server ➔ Client | `{ language, code }` | Switches Monaco language mode and starter template. |
| `leave-room` | Client ➔ Server | `{ roomId }` | Explicit departure from room. |
| `user-left` | Server ➔ Client | `{ userId, participants }` | Updates peer roster on disconnect or departure. |
| `join-request` | Client ➔ Server | `{ roomId, user }` | Sends pending admission request to host. |
| `join-response` | Server ➔ Client | `{ approved, roomId }` | Informs waiting user of host decision. |

---

## 🔌 REST API Specification

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

### Room Endpoints (`/api/rooms`)
- `GET /api/rooms` — Retrieves public room directory.
- `POST /api/rooms` — Creates a new collaboration room.
  - **Body:** `{ name, description, language, isPrivate, requiresApproval }`
- `GET /api/rooms/:id` — Fetches room metadata, code snapshot, and participants.
- `PUT /api/rooms/:id` — Updates room configuration/code (Host only).
- `DELETE /api/rooms/:id` — Closes room session (Host only).

### AI Assistant Endpoints (`/api/ai`)
- `POST /api/ai/stream` — Streams AI response via Server-Sent Events (SSE).
  - **Body:** `{ prompt, mode, code, language, selectedCode }`
  - **Modes:** `"ask" | "explain" | "debug" | "review" | "tests" | "refactor"`
- `GET /api/ai/status` — Checks AI engine provider status (`gemini` or `openai`).

### GitHub Integration Endpoints (`/api/github`)
- `POST /api/github/push` — Commits and pushes room code to GitHub repo.
  - **Headers:** `Authorization: Bearer <JWT>`
  - **Body:** `{ repoUrl, branch, commitMessage, filePath, code, githubToken }`

### System Health
- `GET /health` — Returns server uptime and status (`{ status: "ok", timestamp }`).

---

## 🤖 AI Copilot Architecture (Gemini & OpenAI)

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

- **Prompt Engineering:** Enforces Markdown output with language-tagged code blocks.
- **Context Injection:** Sends active language, complete buffer, and user cursor selections.
- **Token Budgeting & Security:** Rate limited per room to prevent abuse and API exhaustion.

---

## 🐙 GitHub Integration Workflow

1. **Token Input:** User provides GitHub Personal Access Token (PAT) with `repo` scope.
2. **Client-Side Security:** Token is held in React state/ephemeral memory — **never written to the database**.
3. **Repository Resolution:** The backend interacts with the GitHub REST API (`/repos/{owner}/{repo}/contents/{path}`):
   - Queries if the file exists on the branch to fetch its current `SHA`.
   - Creates or updates the file buffer using Base64 encoding.
   - Creates an atomic commit on the designated branch.
4. **Verification:** Returns direct commit URL for one-click verification in GitHub.

---

## 🛡️ Security, Authentication & Authorization

| Concern | Implementation Strategy |
| :--- | :--- |
| **Password Storage** | One-way hashing with `bcryptjs` using 10 salt rounds. |
| **Session Integrity** | Stateless signed JWTs with configurable expiration (`JWT_EXPIRES_IN=7d`). |
| **Route Protection** | Express authentication middleware validates `Bearer <token>` headers. |
| **Room Authorization** | Granular role verification: only room hosts can delete rooms or update access rules. |
| **API Abuse Prevention** | Per-IP and per-room rate limiting on AI streaming endpoints. |
| **Third-Party Credentials**| GitHub PATs transmitted via secure HTTPS and processed in-memory without logging or persistence. |

---

## 🧪 Testing, CI/CD & Deployment

### Automated Backend Tests (Vitest + Supertest)
Run all 14 integration test cases:
```bash
cd backend
npm test
```

Test coverage includes:
- ✅ `POST /api/auth/register` (Success, Duplicate email, Missing fields)
- ✅ `POST /api/auth/login` (Success, Invalid password, Non-existent user)
- ✅ `GET /api/auth/me` (Authenticated vs. Unauthenticated)
- ✅ `GET /api/rooms` (Room listing)
- ✅ `POST /api/rooms` (Room creation with validation)
- ✅ `GET /api/ai/status` & `POST /api/ai/stream` (AI health check & streaming)
- ✅ `GET /health` (Server uptime and health status)

### GitHub Actions CI Pipeline (`.github/workflows/ci.yml`)
- Runs on every `push` and `pull_request`.
- Test matrix across **Node.js 18.x** and **Node.js 20.x**.
- Automated steps: install all dependencies ➔ run backend tests ➔ build frontend production bundle.

### Render Cloud Deployment (`render.yaml`)
- **Backend Web Service**: Node.js environment, automatic memory fallback if MongoDB URI not provided.
- **Frontend Static Site**: Vite build output (`frontend/dist`), client-side routing rewrites.

---

## 💻 Installation & Setup Guide

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- *(Optional)* Local MongoDB or MongoDB Atlas URI (falls back to memory server automatically if omitted)

### Quick Start (All-in-One Command)

1. **Clone the repository:**
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
   # Copy template in backend/
   cp backend/.env.example backend/.env
   ```
   Edit `backend/.env`:
   ```env
   PORT=5000
   CLIENT_URL=http://localhost:5173
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d

   # AI Configuration (Gemini or OpenAI)
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development servers (Backend + Frontend concurrently):**
   ```bash
   npm run dev
   ```

5. **Open in Browser:**
   - **Frontend:** [http://localhost:5173](http://localhost:5173)
   - **Backend API:** [http://localhost:5000](http://localhost:5000)
   - **Health Check:** [http://localhost:5000/health](http://localhost:5000/health)

---

## 🎓 SDE Interview & Viva Talking Points

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

## 📜 License

This project is licensed under the MIT License — feel free to use it for personal projects, academic submissions, and portfolio showcases.
