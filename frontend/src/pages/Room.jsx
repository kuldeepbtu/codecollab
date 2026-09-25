import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import toast from "react-hot-toast";
import {
  Users,
  Copy,
  Check,
  ArrowLeft,
  Sparkles,
  BookOpen,
  Code2,
  Github,
  Send,
  X,
  Loader2,
  Upload,
  Link,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import socketService from "../services/socketService";
import { getRoom } from "../services/roomService";
import { SOCKET_EVENTS } from "../../../shared/socketEvents";
import { DSA_TEMPLATES } from "../constants/dsaTemplates";
import { AI_MODES, streamAiResponse } from "../services/aiChatService";
import {
  testGithubConnection,
  pushToGithub,
} from "../services/githubService";

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [room, setRoom] = useState(null);
  const [code, setCode] = useState(DSA_TEMPLATES.javascript.defaultCode);
  const [language, setLanguage] = useState("javascript");
  const [participants, setParticipants] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  // ─── AI Assistant State ────────────────────────────────────────
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiMode, setAiMode] = useState("ask");
  const [aiMessage, setAiMessage] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiStreaming, setAiStreaming] = useState(false);
  const aiControllerRef = useRef(null);
  const aiResponseRef = useRef(null);

  // ─── GitHub Panel State ────────────────────────────────────────
  const [githubPanelOpen, setGithubPanelOpen] = useState(false);
  const [ghToken, setGhToken] = useState("");
  const [ghOwner, setGhOwner] = useState("");
  const [ghRepo, setGhRepo] = useState("");
  const [ghBranch, setGhBranch] = useState("main");
  const [ghPath, setGhPath] = useState("solution.js");
  const [ghCommitMsg, setGhCommitMsg] = useState("");
  const [ghConnected, setGhConnected] = useState(false);
  const [ghLoading, setGhLoading] = useState(false);

  const editorRef = useRef(null);
  const isRemoteChange = useRef(false);

  // ─── Fetch Room & Connect Socket ───────────────────────────────
  useEffect(() => {
    let socket = null;

    const initRoom = async () => {
      try {
        const token = localStorage.getItem("token");
        const data = await getRoom(roomId);
        setRoom(data.room);

        const initialLang = data.room.language || "javascript";
        setLanguage(initialLang);
        if (data.room.code) {
          setCode(data.room.code);
        } else if (DSA_TEMPLATES[initialLang]) {
          setCode(DSA_TEMPLATES[initialLang].defaultCode);
        }

        socket = socketService.connect(token);

        socket.emit(SOCKET_EVENTS.JOIN_ROOM, {
          roomId,
          username: user?.name || "Anonymous SDE",
        });

        socket.on(SOCKET_EVENTS.PARTICIPANTS_UPDATED, (users) => {
          setParticipants(users);
        });

        socket.on(SOCKET_EVENTS.USER_JOINED, ({ username }) => {
          toast.success(`${username} joined room`);
        });

        socket.on(SOCKET_EVENTS.USER_LEFT, ({ username }) => {
          toast(`${username} left room`, { icon: "👋" });
        });

        socket.on(SOCKET_EVENTS.SYNC_ROOM_STATE, (state) => {
          if (state.code) {
            isRemoteChange.current = true;
            setCode(state.code);
          }
          if (state.language) {
            setLanguage(state.language);
          }
        });

        socket.on(SOCKET_EVENTS.CODE_CHANGE, (newCode) => {
          isRemoteChange.current = true;
          setCode(newCode);
        });

        socket.on(SOCKET_EVENTS.LANGUAGE_CHANGE, (newLang) => {
          setLanguage(newLang);
          toast(`Language switched to ${newLang.toUpperCase()}`, {
            icon: "⚙️",
          });
        });

        socket.on("join-error", ({ message }) => {
          toast.error(message);
          navigate("/dashboard");
        });
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load room");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    initRoom();

    return () => {
      if (socket) {
        socket.emit(SOCKET_EVENTS.LEAVE_ROOM, {
          roomId,
          username: user?.name,
        });
        socket.off(SOCKET_EVENTS.PARTICIPANTS_UPDATED);
        socket.off(SOCKET_EVENTS.USER_JOINED);
        socket.off(SOCKET_EVENTS.USER_LEFT);
        socket.off(SOCKET_EVENTS.SYNC_ROOM_STATE);
        socket.off(SOCKET_EVENTS.CODE_CHANGE);
        socket.off(SOCKET_EVENTS.LANGUAGE_CHANGE);
        socket.off("join-error");
      }
      // Abort any ongoing AI stream
      aiControllerRef.current?.abort();
    };
  }, [roomId, user, navigate]);

  // ─── Code Editor Handlers ──────────────────────────────────────
  const handleEditorChange = (value) => {
    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      return;
    }
    setCode(value);
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit(SOCKET_EVENTS.CODE_CHANGE, { roomId, code: value });
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (DSA_TEMPLATES[newLang]) {
      setCode(DSA_TEMPLATES[newLang].defaultCode);
    }
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit(SOCKET_EVENTS.LANGUAGE_CHANGE, {
        roomId,
        language: newLang,
      });
      socket.emit(SOCKET_EVENTS.CODE_CHANGE, {
        roomId,
        code: DSA_TEMPLATES[newLang]
          ? DSA_TEMPLATES[newLang].defaultCode
          : code,
      });
    }
  };

  const copyRoomLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Room invite link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  // ─── AI Assistant Handlers ─────────────────────────────────────
  const getSelectedCode = () => {
    const editor = editorRef.current;
    if (!editor) return "";
    const selection = editor.getSelection();
    if (!selection || selection.isEmpty()) return "";
    return editor.getModel().getValueInRange(selection);
  };

  const handleAiSubmit = (e) => {
    e?.preventDefault();
    if (!aiMessage.trim() || aiStreaming) return;

    setAiStreaming(true);
    setAiResponse("");

    const selectedCode = getSelectedCode();

    const controller = streamAiResponse({
      roomId,
      mode: aiMode,
      message: aiMessage,
      code,
      language,
      selection: selectedCode,
      userName: user?.name,
      onToken: (delta) => {
        setAiResponse((prev) => prev + delta);
        // Auto-scroll
        if (aiResponseRef.current) {
          aiResponseRef.current.scrollTop =
            aiResponseRef.current.scrollHeight;
        }
      },
      onDone: () => {
        setAiStreaming(false);
      },
      onError: (err) => {
        setAiStreaming(false);
        toast.error(err);
      },
    });

    aiControllerRef.current = controller;
  };

  const handleAiCancel = () => {
    aiControllerRef.current?.abort();
    setAiStreaming(false);
  };

  // ─── GitHub Handlers ───────────────────────────────────────────
  const handleGithubConnect = async () => {
    if (!ghToken || !ghOwner || !ghRepo) {
      toast.error("Please fill all GitHub fields");
      return;
    }
    setGhLoading(true);
    try {
      const result = await testGithubConnection({
        token: ghToken,
        owner: ghOwner,
        repo: ghRepo,
        branch: ghBranch,
      });
      setGhConnected(true);
      toast.success(
        `Connected to ${result.fullName} (${result.canPush ? "push ✓" : "read-only"})`
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
    setGhLoading(false);
  };

  const handleGithubPush = async () => {
    if (!ghConnected) {
      toast.error("Connect to GitHub first");
      return;
    }
    setGhLoading(true);
    try {
      // Auto-detect file extension from language
      const extMap = {
        javascript: ".js",
        java: ".java",
        cpp: ".cpp",
        python: ".py",
      };
      const ext = extMap[language] || ".txt";
      const finalPath = ghPath.includes(".") ? ghPath : `${ghPath}${ext}`;

      const result = await pushToGithub({
        token: ghToken,
        owner: ghOwner,
        repo: ghRepo,
        branch: ghBranch,
        path: finalPath,
        content: code,
        message:
          ghCommitMsg || `Update ${finalPath} via CodeCollab [${language}]`,
      });
      toast.success(`Pushed to GitHub! SHA: ${result.commitSha?.slice(0, 7)}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
    setGhLoading(false);
  };

  // ─── Loading State ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        <div className="text-center">
          <Code2 className="mx-auto mb-3 h-10 w-10 animate-spin text-blue-500" />
          <p className="text-lg font-medium">
            Entering Collaborative Code Room...
          </p>
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-100">
      {/* ═══════ Top Navigation Bar ═══════ */}
      <header className="flex h-14 items-center justify-between border-b border-slate-800 bg-slate-900/90 px-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:bg-slate-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-white">
                Room: {roomId}
              </h1>
              <button
                onClick={copyRoomLink}
                className="flex items-center gap-1 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-white"
                title="Copy Invite Link"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              Role:{" "}
              {room?.adminUserId === user?.id ? "Admin (Host)" : "Member"}
            </p>
          </div>
        </div>

        {/* Center: Language + Tool Buttons */}
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="java">☕ Java</option>
            <option value="javascript">⚡ JavaScript</option>
            <option value="cpp">⚙️ C++</option>
            <option value="python">🐍 Python</option>
          </select>

          <button
            onClick={() => {
              setAiPanelOpen(!aiPanelOpen);
              setGithubPanelOpen(false);
            }}
            className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold transition ${
              aiPanelOpen
                ? "bg-indigo-600 text-white"
                : "bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-500 hover:to-blue-500"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Assistant
          </button>

          <button
            onClick={() => {
              setGithubPanelOpen(!githubPanelOpen);
              setAiPanelOpen(false);
            }}
            className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold transition ${
              githubPanelOpen
                ? "bg-emerald-600 text-white"
                : "border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Github className="h-3.5 w-3.5" />
            GitHub
          </button>
        </div>

        {/* Right: Participants */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/60 px-2.5 py-1 text-[10px] text-slate-300">
            <Users className="h-3 w-3 text-emerald-400" />
            <span>{participants.length} Active</span>
          </div>

          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
        </div>
      </header>

      {/* ═══════ Main Workspace ═══════ */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Monaco Editor */}
        <div className="flex-1 h-full">
          <Editor
            height="100%"
            theme="vs-dark"
            language={DSA_TEMPLATES[language]?.monacoLang || language}
            value={code}
            onChange={handleEditorChange}
            onMount={(editor) => {
              editorRef.current = editor;
            }}
            options={{
              fontSize: 14,
              fontFamily:
                "'Fira Code', 'Cascadia Code', Consolas, monospace",
              minimap: { enabled: true },
              automaticLayout: true,
              scrollBeyondLastLine: false,
              wordWrap: "on",
              tabSize: 4,
            }}
          />
        </div>

        {/* ═══════ AI Assistant Panel ═══════ */}
        {aiPanelOpen && (
          <aside className="w-[380px] flex flex-col border-l border-slate-800 bg-slate-900/95 shadow-2xl backdrop-blur-md">
            {/* Panel Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">
                  AI Code Assistant
                </h3>
              </div>
              <button
                onClick={() => setAiPanelOpen(false)}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mode Selector */}
            <div className="flex flex-wrap gap-1.5 border-b border-slate-800 p-3">
              {AI_MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setAiMode(m.id)}
                  title={m.description}
                  className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition ${
                    aiMode === m.id
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* AI Response Area */}
            <div
              ref={aiResponseRef}
              className="flex-1 overflow-y-auto p-4 text-xs leading-relaxed text-slate-300"
            >
              {aiResponse ? (
                <div className="whitespace-pre-wrap font-mono">
                  {aiResponse}
                  {aiStreaming && (
                    <span className="inline-block animate-pulse text-indigo-400">
                      ▊
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-center text-slate-500">
                  <div>
                    <BookOpen className="mx-auto mb-2 h-8 w-8 opacity-30" />
                    <p className="text-xs">
                      Select a mode above and ask a question.
                    </p>
                    <p className="mt-1 text-[10px] text-slate-600">
                      Tip: Select code in the editor for targeted analysis
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleAiSubmit}
              className="border-t border-slate-800 p-3"
            >
              <div className="flex gap-2">
                <input
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  placeholder={`${AI_MODES.find((m) => m.id === aiMode)?.description || "Ask anything"}...`}
                  disabled={aiStreaming}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                />
                {aiStreaming ? (
                  <button
                    type="button"
                    onClick={handleAiCancel}
                    className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!aiMessage.trim()}
                    className="rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-40"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-[10px] text-slate-600">
                Mode: <span className="text-indigo-400">{aiMode.toUpperCase()}</span>{" "}
                • Powered by Gemini / OpenAI
              </p>
            </form>
          </aside>
        )}

        {/* ═══════ GitHub Panel ═══════ */}
        {githubPanelOpen && (
          <aside className="w-[340px] flex flex-col border-l border-slate-800 bg-slate-900/95 shadow-2xl backdrop-blur-md">
            {/* Panel Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <div className="flex items-center gap-2">
                <Github className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">
                  GitHub Integration
                </h3>
              </div>
              <button
                onClick={() => setGithubPanelOpen(false)}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Connection Form */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div>
                <label className="mb-1 block text-[10px] font-medium text-slate-400">
                  Personal Access Token
                </label>
                <input
                  type="password"
                  value={ghToken}
                  onChange={(e) => setGhToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-slate-400">
                    Owner
                  </label>
                  <input
                    value={ghOwner}
                    onChange={(e) => setGhOwner(e.target.value)}
                    placeholder="username"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-slate-400">
                    Repository
                  </label>
                  <input
                    value={ghRepo}
                    onChange={(e) => setGhRepo(e.target.value)}
                    placeholder="my-repo"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-slate-400">
                    Branch
                  </label>
                  <input
                    value={ghBranch}
                    onChange={(e) => setGhBranch(e.target.value)}
                    placeholder="main"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-slate-400">
                    File Path
                  </label>
                  <input
                    value={ghPath}
                    onChange={(e) => setGhPath(e.target.value)}
                    placeholder="solution.js"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                onClick={handleGithubConnect}
                disabled={ghLoading || !ghToken || !ghOwner || !ghRepo}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-700 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-600 disabled:opacity-50"
              >
                {ghLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Link className="h-3.5 w-3.5" />
                )}
                {ghConnected ? "Reconnect" : "Test Connection"}
              </button>

              {ghConnected && (
                <>
                  <div className="rounded-lg border border-emerald-800 bg-emerald-950/50 p-2.5">
                    <p className="text-[10px] font-medium text-emerald-400">
                      ✓ Connected to {ghOwner}/{ghRepo} ({ghBranch})
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-medium text-slate-400">
                      Commit Message (optional)
                    </label>
                    <input
                      value={ghCommitMsg}
                      onChange={(e) => setGhCommitMsg(e.target.value)}
                      placeholder={`Update ${ghPath} via CodeCollab`}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <button
                    onClick={handleGithubPush}
                    disabled={ghLoading}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {ghLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    Push Code to GitHub
                  </button>
                </>
              )}
            </div>

            <div className="border-t border-slate-800 px-4 py-2.5 text-[10px] text-slate-500">
              💡 Your token stays in your browser — never stored on the server.
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}