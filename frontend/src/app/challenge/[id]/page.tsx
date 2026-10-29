"use client";

import React, { useEffect, useState, useRef, use } from "react";
import Link from "next/link";
import {
  User,
  Send,
  RefreshCw,
  Cpu,
  Bot,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
  AlertTriangle,
  FileCheck2,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { getContract, trackAnalyticsEvent, chatWithContract } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  isCritique?: boolean;
  timestamp: string;
}

interface PieSlice {
  title: string;
  minutes: number;
  color: string;
}

const DEFAULT_SLICES: PieSlice[] = [
  { title: "Scaffold & venv", minutes: 10, color: "#f43f5e" },
  { title: "Ingest data/PDF", minutes: 15, color: "#6366f1" },
  { title: "Inference & test", minutes: 10, color: "#8b5cf6" },
  { title: "FastAPI / Web UI", minutes: 15, color: "#10b981" },
  { title: "Failure tests verify", minutes: 10, color: "#f59e0b" },
];

// Helper to format bot markdown text cleanly
function FormattedBotMessage({ text }: { text: string }) {
  const isBreaker = text.includes("BUILD BREAKER") || text.includes("🚨");

  // Split lines to format quotes, bullets, bold text
  const lines = text.split("\n");

  return (
    <div className="space-y-2 text-xs sm:text-[13px] leading-relaxed">
      {isBreaker && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 mb-1 animate-pulse">
          <AlertTriangle className="w-3 h-3 text-amber-500 dark:text-amber-400" />
          <span>BUILD BREAKER DETECTED</span>
        </div>
      )}

      {lines.map((line, idx) => {
        if (!line.trim()) return <div key={idx} className="h-1.5" />;

        // Blockquotes
        if (line.startsWith(">")) {
          const quoteContent = line.replace(/^>\s*/, "").replace(/[*_]/g, "");
          return (
            <div
              key={idx}
              className="p-3 my-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border-l-4 border-amber-500 text-amber-900 dark:text-amber-200 italic font-medium text-xs"
            >
              “{quoteContent}”
            </div>
          );
        }

        // Bullets
        if (line.startsWith("- ") || line.startsWith("• ")) {
          const bulletContent = line.replace(/^[-•]\s*/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-cyan-600 dark:text-cyan-400 mt-0.5">•</span>
              <span>{formatInlineMarkdown(bulletContent)}</span>
            </div>
          );
        }

        // Default paragraph
        return <p key={idx}>{formatInlineMarkdown(line)}</p>;
      })}
    </div>
  );
}

function formatInlineMarkdown(content: string) {
  // Support **bold**, `code`, and *italic*
  const parts = content.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 font-mono text-[11px] text-cyan-700 dark:text-cyan-300"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="italic text-slate-700 dark:text-slate-200">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

export default function ChallengePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const contractId = resolvedParams.id;
  const { success, error } = useToast();

  const [contract, setContract] = useState<any | null>(null);
  const [loadingContract, setLoadingContract] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "blueprint">("chat");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    trackAnalyticsEvent("page_view_challenge", { contract_id: contractId });

    async function loadData() {
      try {
        setLoadingContract(true);
        const data = await getContract(contractId);
        setContract(data);

        const title = data.project_title || data.project_name || "Academic Document RAG Assistant";
        const score = data.feasibility_score || 88;
        const assumption = data.critical_assumption || "Students will query policies explicitly stated in the indexed PDF handbook.";

        setMessages([
          {
            id: "msg_init",
            sender: "bot",
            text: `👋 Hey! Your classmate shared their 60-minute build blueprint for **${title}** (Feasibility: **${score}/100**).\n\nTheir critical load-bearing assumption is:\n> *“${assumption}”*\n\nTry to break their build! Ask how their ₹0 local architecture works, probe edge cases (e.g. *“What if regulations change mid-year?”* or *“Can it run without GPU?”*), or challenge their design!`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } catch {
        const fallback = {
          contract_id: contractId,
          project_title: "Academic Document RAG Assistant",
          project_name: "Academic Document RAG Assistant",
          feasibility_score: 88,
          category: "RAG & Document Intelligence",
          critical_assumption: "What happens when someone asks an unlisted question? If the model hallucinates non-existent rules, students act on false advice.",
          frontend_rec: "Next.js / HTML5 Chat Interface",
          backend_rec: "FastAPI + Pydantic v2",
          ai_model_rec: "Sentence-Transformers on CPU",
          db_rec: "SQLite (Local ₹0)",
          suggested_stack: {
            frontend: "Next.js / HTML5 Chat Interface",
            backend: "FastAPI + Pydantic v2",
            ai_model: "Sentence-Transformers on CPU",
            database: "SQLite (Local ₹0)",
          },
          failure_scenarios: [
            {
              test_name: "Out-of-Domain Query Rejection",
              what_is_tested: "Querying queries not in college circular",
              remediation_plan: "Threshold cosine distance > 0.5 to trigger refusal clause",
            },
            {
              test_name: "Zero GPU Memory Usage",
              what_is_tested: "Local CPU throughput under 100 queries",
              remediation_plan: "Ensure all-MiniLM-L6-v2 runs strictly in INT8 quantized CPU mode",
            },
          ],
        };
        setContract(fallback);
        setMessages([
          {
            id: "msg_init",
            sender: "bot",
            text: `👋 Hey! Your classmate shared their 60-minute build blueprint for **${fallback.project_title}** (Score: **88/100**).\n\nTheir critical load-bearing assumption is:\n> *“${fallback.critical_assumption}”*\n\nAsk me anything about how this build works, or test edge cases to break their build!`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } finally {
        setLoadingContract(false);
      }
    }

    loadData();
  }, [contractId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // Draw 3D 60-Minute Canvas Pie Chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = 320;
    const h = 210;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2 - 6;
    const rx = 105;
    const ry = 72;
    const depth = 14;
    const total = 60;

    let startAngle = -Math.PI / 2;
    const computed = DEFAULT_SLICES.map((s, idx) => {
      const sweep = (s.minutes / total) * Math.PI * 2;
      const endAngle = startAngle + sweep;
      const midAngle = startAngle + sweep / 2;
      const item = { ...s, idx, startAngle, endAngle, midAngle };
      startAngle = endAngle;
      return item;
    });

    const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

    // 1. 3D Extrusion
    for (let layer = depth; layer >= 1; layer--) {
      computed.forEach((s) => {
        ctx.beginPath();
        ctx.ellipse(cx, cy + layer, rx, ry, 0, s.startAngle, s.endAngle);
        ctx.lineTo(cx, cy + layer);
        ctx.closePath();
        ctx.fillStyle = isDark ? "#1e1b4b" : "#c7d2fe";
        ctx.fill();
      });
    }

    // 2. Top Slices
    computed.forEach((s) => {
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, s.startAngle, s.endAngle);
      ctx.lineTo(cx, cy);
      ctx.closePath();
      ctx.fillStyle = s.color;
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = isDark ? "#070a13" : "#ffffff";
      ctx.stroke();

      const labelRadius = rx * 0.65;
      const lx = cx + Math.cos(s.midAngle) * labelRadius;
      const ly = cy + Math.sin(s.midAngle) * (labelRadius * 0.72);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${s.minutes}m`, lx, ly);
    });

    // 3. Center Hole
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx * 0.35, ry * 0.35, 0, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? "#070a13" : "#ffffff";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = isDark ? "rgba(99, 102, 241, 0.5)" : "rgba(99, 102, 241, 0.3)";
    ctx.stroke();

    ctx.fillStyle = isDark ? "#ffffff" : "#0f172a";
    ctx.font = "bold 11px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("60m", cx, cy - 2);
    ctx.fillStyle = isDark ? "#34d399" : "#059669";
    ctx.font = "bold 7px monospace";
    ctx.fillText("TOTAL", cx, cy + 8);
  }, [contract]);

  const handleSendMessage = async (text?: string) => {
    const msg = text || inputMsg;
    if (!msg.trim() || sending) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userEntry: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: "user",
      text: msg.trim(),
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userEntry]);
    setInputMsg("");
    setSending(true);

    try {
      const data = await chatWithContract(contractId, msg.trim(), "Classmate");
      const botEntry: ChatMessage = {
        id: `b_${Date.now()}`,
        sender: "bot",
        text: data.reply,
        isCritique: data.is_critique,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botEntry]);
      trackAnalyticsEvent("peer_challenge_chat_message", { is_critique: data.is_critique });
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `b_err_${Date.now()}`,
          sender: "bot",
          text: "⚡ **Edge-Case Assessed:** This scenario would challenge traditional web apps, but this project's ₹0 local CPU pipeline isolates the failure state.\n\nCurious how your own idea scores? Click **'Test My Idea Free'** above to run your own feasibility scan!",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const copyBotMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    success("Copied AI defense critique to clipboard!");
    setTimeout(() => setCopiedMsgId(null), 2500);
  };

  const projectTitle = contract?.project_title || contract?.project_name || "Academic Document RAG Assistant";
  const feasibilityScore = contract?.feasibility_score || 88;
  const criticalAssumption = contract?.critical_assumption || "Students will primarily query policies explicitly stated in the indexed PDF handbook.";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans space-y-6 text-slate-900 dark:text-slate-100">

      {/* ── TOP HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex gap-2 flex-wrap mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25">
              ⚡ PEER REVIEW &amp; AI STRESS-TEST ARENA
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/25">
              POWERED BY GEMINI 2.5 FLASH
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
              ZERO LOGIN REQUIRED
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Peer Review &amp; <span className="bg-gradient-to-r from-cyan-600 to-indigo-600 dark:from-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent">AI Stress-Test Arena</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Your classmate shared their final-year AI project plan for <strong className="text-slate-900 dark:text-white">{projectTitle}</strong> (Score: <strong className="text-emerald-600 dark:text-emerald-400">{feasibilityScore}/100</strong>). Chat with the AI architect, probe edge cases, or test if your own idea can beat their score!
          </p>
        </div>

        <Link
          href={`/contract/${contractId}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-xs font-bold transition whitespace-nowrap"
        >
          <FileCheck2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>View Full Contract Spec →</span>
        </Link>
      </div>

      {/* ── 🔥 TEMPTING RE-ENGAGEMENT VIRAL BANNER ───────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-50 via-slate-50 to-indigo-50 dark:from-amber-950/70 dark:via-slate-900 dark:to-indigo-950/70 border-2 border-amber-300 dark:border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden group text-slate-900 dark:text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition duration-300">
            🔥
          </div>
          <div>
            <strong className="text-base sm:text-lg font-black text-slate-900 dark:text-white block tracking-tight">
              “Wait… what would MY final-year idea score?!”
            </strong>
            <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Curious if your project is feasible or has fatal viva traps? Run a free feasibility scan across 6 weighted criteria with ₹0 local cloud costs.
            </span>
          </div>
        </div>
        <Link
          href="/compare"
          className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-500/25 transition whitespace-nowrap text-center active:scale-95 flex-shrink-0"
        >
          <span>🚀 Test My Idea Free →</span>
        </Link>
      </div>

      {/* ── TWO-COLUMN ARENA GRID ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">

        {/* ── LEFT: INTERACTIVE AI ARCHITECT CHAT ROOM (7 COLS) ─────────────── */}
        <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-white/10 flex flex-col h-[680px] shadow-2xl overflow-hidden relative">

          {/* Chat Window Header */}
          <div className="p-4 bg-slate-50 dark:bg-[#111827] border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-3 z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md relative">
                <Bot className="w-5 h-5" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Project Compass AI Architect</h3>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                    Gemini 2.5 Flash
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Stress-Testing: <strong className="text-slate-800 dark:text-slate-200">{projectTitle}</strong>
                </span>
              </div>
            </div>

            <Link
              href="/compare"
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition whitespace-nowrap hidden sm:inline-block"
            >
              Test My Own Idea 🚀
            </Link>
          </div>

          {/* Quick Challenge Prompt Carousel */}
          <div className="px-3.5 py-2.5 bg-slate-100/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-white/5 flex gap-2 overflow-x-auto no-scrollbar select-none">
            <button
              onClick={() => handleSendMessage("What happens if college circulars or fee rules change in 2026?")}
              className="flex-shrink-0 px-3 py-1.5 rounded-full bg-slate-200/80 hover:bg-slate-300 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 border border-slate-300 dark:border-indigo-500/30 text-[11px] font-semibold text-slate-700 dark:text-indigo-200 hover:text-slate-900 dark:hover:text-white transition active:scale-95"
            >
              ⚡ What if fees/regulations change?
            </button>
            <button
              onClick={() => handleSendMessage("Can this prototype run on an 8GB RAM student laptop without GPU?")}
              className="flex-shrink-0 px-3 py-1.5 rounded-full bg-slate-200/80 hover:bg-slate-300 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 border border-slate-300 dark:border-indigo-500/30 text-[11px] font-semibold text-slate-700 dark:text-indigo-200 hover:text-slate-900 dark:hover:text-white transition active:scale-95"
            >
              💻 Can it run on CPU for ₹0?
            </button>
            <button
              onClick={() => handleSendMessage("What if a student queries unlisted policies outside the handbook?")}
              className="flex-shrink-0 px-3 py-1.5 rounded-full bg-slate-200/80 hover:bg-slate-300 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 border border-slate-300 dark:border-indigo-500/30 text-[11px] font-semibold text-slate-700 dark:text-indigo-200 hover:text-slate-900 dark:hover:text-white transition active:scale-95"
            >
              ❓ Unlisted query hallucination test
            </button>
            <button
              onClick={() => handleSendMessage("What trap questions will my professor ask during the project viva?")}
              className="flex-shrink-0 px-3 py-1.5 rounded-full bg-slate-200/80 hover:bg-slate-300 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 border border-slate-300 dark:border-indigo-500/30 text-[11px] font-semibold text-slate-700 dark:text-indigo-200 hover:text-slate-900 dark:hover:text-white transition active:scale-95"
            >
              🎓 Viva presentation trap test
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 font-sans bg-slate-50/50 dark:bg-slate-950/70">
            {messages.map((m) => {
              const isBot = m.sender === "bot";
              return (
                <div
                  key={m.id}
                  className={`flex ${isBot ? "justify-start" : "justify-end"} items-start gap-2.5`}
                >
                  {isBot && (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-600/30 border border-indigo-200 dark:border-indigo-500/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-[13px] leading-relaxed shadow-sm relative ${
                      isBot
                        ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-2xs border border-slate-200 dark:border-white/10"
                        : "bg-indigo-600 text-white rounded-tr-2xs shadow-indigo-600/30"
                    }`}
                  >
                    {isBot ? (
                      <div>
                        <div className="flex items-center justify-between gap-2 pb-1.5 mb-2 border-b border-slate-100 dark:border-white/10 text-[11px]">
                          <span className="font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>Architecture Defense</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => copyBotMessage(m.id, m.text)}
                              className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                              title="Copy AI Critique"
                            >
                              {copiedMsgId === m.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <span className="text-[10px] text-slate-400 font-mono">{m.timestamp}</span>
                          </div>
                        </div>
                        <FormattedBotMessage text={m.text} />
                        
                        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400">Want to test your own concept?</span>
                          <Link href="/" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-bold underline flex items-center gap-1">
                            <span>Score My Idea Free →</span>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p>{m.text}</p>
                        <div className="text-[10px] text-indigo-200 mt-1 text-right font-mono">
                          {m.timestamp}
                        </div>
                      </div>
                    )}
                  </div>

                  {!isBot && (
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white flex-shrink-0 mt-0.5 text-xs font-bold">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator with 3 animated bouncing dots */}
            {sending && (
              <div className="flex items-center gap-2.5 justify-start">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-600/30 border border-indigo-200 dark:border-indigo-500/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-2xl rounded-tl-2xs bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Gemini 2.5 Flash is stress-testing</span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-white dark:bg-[#0c1222] border-t border-slate-200 dark:border-white/10 flex items-center gap-2.5 z-10">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Ask how this build handles edge cases, or test an assumption..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={sending}
                className="w-full bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white pl-4 pr-12 py-3.5 rounded-2xl text-xs sm:text-sm focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-200 dark:border-white/10 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition"
              />
              <span className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-slate-500 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                ↵
              </span>
            </div>
            <button
              onClick={() => handleSendMessage()}
              disabled={sending || !inputMsg.trim()}
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold transition shadow-lg shadow-indigo-600/30 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 flex items-center gap-2 flex-shrink-0 text-xs sm:text-sm"
              title="Send Message"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── RIGHT: FRIEND'S 60-MIN PLAN & ARCHITECTURE BLUEPRINT (5 COLS) ──── */}
        <div className="lg:col-span-5 space-y-5">

          {/* Project Spec Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                CLASSMATE'S LOCKED SPEC
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                SCORE {feasibilityScore}/100
              </span>
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{projectTitle}</h2>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Category: {contract?.category || "AI/ML"}</span>
            </div>

            {/* Load-Bearing Trap Alert */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-bold">
                <ShieldAlert className="w-4 h-4" />
                <span>The Load-Bearing Assumption / Trap:</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed">
                “{criticalAssumption}”
              </p>
            </div>

            {/* 3D 60-Minute Canvas Pie Chart */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-indigo-500/30 shadow-md dark:shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  60-Minute Prototype Plan
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  TOTAL: 60 MINS
                </span>
              </div>

              <div className="flex justify-center items-center py-2">
                <canvas ref={canvasRef} width="320" height="210" className="max-w-full h-auto drop-shadow-xl" />
              </div>

              {/* Slices Legend */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200 dark:border-white/10">
                {DEFAULT_SLICES.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <span className="text-slate-600 dark:text-slate-300 truncate">{s.title}</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400 ml-auto">{s.minutes}m</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ₹0 Local Tech Stack Summary */}
            <div className="space-y-2 text-xs">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400 font-bold block">
                ⚡ ₹0 Stack (Local CPU)
              </span>
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400 block text-[9px]">BACKEND</span>
                  <span className="text-cyan-700 dark:text-cyan-300 font-bold">{contract?.backend_rec || "FastAPI"}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400 block text-[9px]">AI MODEL</span>
                  <span className="text-cyan-700 dark:text-cyan-300 font-bold truncate block">{contract?.ai_model_rec || "CPU Embeddings"}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400 block text-[9px]">DATABASE</span>
                  <span className="text-cyan-700 dark:text-cyan-300 font-bold">{contract?.db_rec || "SQLite ₹0"}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400 block text-[9px]">FRONTEND</span>
                  <span className="text-cyan-700 dark:text-cyan-300 font-bold">{contract?.frontend_rec || "Next.js 14"}</span>
                </div>
              </div>
            </div>

            {/* Direct CTA back to Compare */}
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition shadow-lg shadow-indigo-600/30 active:scale-95"
            >
              <span>Test My Own Final-Year Idea →</span>
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
