"use client";

import React, { useEffect, useState, useRef, use } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Copy,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Cpu,
  RefreshCw,
  Ban,
  Target,
  ListChecks,
  Share2,
  Download,
  Zap,
} from "lucide-react";
import { getContract, trackAnalyticsEvent } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";

interface PieStep {
  step: number;
  title: string;
  minutes: number;
  window: string;
  color: string;
  category: string;
  what_you_do: string;
  deliverable: string;
}

const CLASSIC_5_SLICES: PieStep[] = [
  {
    step: 1,
    title: "Scaffold + load 1 doc",
    minutes: 10,
    window: "Min 00-10",
    color: "#f43f5e",
    category: "Setup & Environment",
    what_you_do: "Create Python venv, install FastAPI + local CPU dependencies, and extract text from 1 PDF.",
    deliverable: "Verified local environment running at ₹0 cloud cost.",
  },
  {
    step: 2,
    title: "Core logic",
    minutes: 15,
    window: "Min 10-25",
    color: "#6366f1",
    category: "Data & Ingestion",
    what_you_do: "Load sample dataset/PDF, clean records, and build local sentence embeddings/index.",
    deliverable: "Indexed local dataset ready for sub-200ms queries.",
  },
  {
    step: 3,
    title: "Test queries",
    minutes: 10,
    window: "Min 25-35",
    color: "#8b5cf6",
    category: "Core AI Pipeline",
    what_you_do: "Wire inference/retrieval pipeline with strict confidence threshold & fallback.",
    deliverable: "Core inference function passing unit sanity check.",
  },
  {
    step: 4,
    title: "Simple web UI",
    minutes: 15,
    window: "Min 35-50",
    color: "#10b981",
    category: "Interactive UI",
    what_you_do: "Connect FastAPI endpoint to interactive frontend UI for live viva demo.",
    deliverable: "End-to-end interactive UI responding in real time.",
  },
  {
    step: 5,
    title: "Stress test + verify",
    minutes: 10,
    window: "Min 50-60",
    color: "#f59e0b",
    category: "Stress-Test & Demo",
    what_you_do: "Execute the failure test scripts and record a 60-second demo walkthrough.",
    deliverable: "Viva-ready prototype verified against edge-case traps.",
  },
];

const DETAILED_8_SLICES: PieStep[] = [
  { step: 1, title: "Setup venv & FastAPI", minutes: 5, window: "00-05m", color: "#f43f5e", category: "Scaffold", what_you_do: "Initialize repo & app/main.py", deliverable: "Server running on :8000" },
  { step: 2, title: "Install sentence-transformers", minutes: 7, window: "05-12m", color: "#fb7185", category: "Engine", what_you_do: "Install CPU model without GPU dependencies", deliverable: "Model loaded in RAM" },
  { step: 3, title: "Ingest sample PDF text", minutes: 8, window: "12-20m", color: "#6366f1", category: "Ingest", what_you_do: "Parse regulation circulars", deliverable: "Clean chunked passages" },
  { step: 4, title: "Generate vector embeddings", minutes: 10, window: "20-30m", color: "#818cf8", category: "Embed", what_you_do: "Store vectors in memory or SQLite", deliverable: "Indexed vectors ready" },
  { step: 5, title: "Build cosine retrieval logic", minutes: 8, window: "30-38m", color: "#8b5cf6", category: "Query", what_you_do: "Calculate top-3 matching chunks", deliverable: "Sub-200ms query endpoint" },
  { step: 6, title: "Wire chat frontend", minutes: 10, window: "38-48m", color: "#10b981", category: "UI", what_you_do: "Lightweight HTML/Tailwind chat view", deliverable: "Working browser UI" },
  { step: 7, title: "Enforce refusal threshold", minutes: 7, window: "48-55m", color: "#34d399", category: "Safeguard", what_you_do: "Reject unlisted/out-of-domain queries", deliverable: "Zero hallucination guard" },
  { step: 8, title: "Run viva rehearsal", minutes: 5, window: "55-60m", color: "#f59e0b", category: "Verify", what_you_do: "Rehearse edge-case demonstration", deliverable: "Demo-ready repository" },
];

export default function ContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const contractId = resolvedParams.id;
  const { success, error } = useToast();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [contract, setContract] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [pieMode, setPieMode] = useState<"classic5" | "detailed">("classic5");
  const [activeSlice, setActiveSlice] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    trackAnalyticsEvent("page_view_contract", { contract_id: contractId });

    async function loadContract() {
      try {
        setLoading(true);
        const data = await getContract(contractId);
        setContract(data);
      } catch (err: any) {
        if (contractId === "bc_demo_rag") {
          setContract({
            contract_id: "bc_demo_rag",
            project_name: "Academic Document RAG Assistant",
            original_idea:
              "An interactive chatbot grounded in college academic regulations, exam rules, and attendance policies using document retrieval (RAG) and open-source embeddings.",
            archetype: "RAG_PIPELINE",
            category: "RAG & Document Intelligence",
            difficulty: "Intermediate",
            feasibility_score: 88,
            target_audience: "Research students & university faculty",
            critical_assumption:
              "What happens when someone asks an unlisted question? Students will primarily query policies explicitly stated in the indexed PDF handbook, and the pipeline must refuse out-of-domain questions.",
            failure_scenarios: [
              {
                test_id: "TST-RAG-01",
                test_name: "Out-of-Domain Hallucination Trap",
                what_is_tested:
                  "How the model handles queries about rules not documented in the college handbook.",
                why_it_matters:
                  "Hallucinating non-existent policies causes disciplinary issues and destroys student trust.",
                test_procedure:
                  "Query the assistant with fabricated rules like 'Can students bring pets during exam week?'.",
                expected_observation:
                  "Model recognizes missing context and outputs refusal rather than making up answers.",
                acceptance_criteria:
                  "Strict fallback triggered; zero hallucinations on 10 out-of-domain queries.",
                remediation_plan:
                  "Enforce cosine distance threshold (>0.45) with fallback prompt refusal template.",
              },
              {
                test_id: "TST-RAG-02",
                test_name: "Multi-Column PDF Table Mangling Test",
                what_is_tested:
                  "Accuracy of text extraction from complex university grading circulars.",
                why_it_matters:
                  "Mangled grade boundary numbers will provide wrong academic advice to students.",
                test_procedure:
                  "Ingest a 2-column PDF containing SGPA/CGPA cut-off tables.",
                expected_observation:
                  "Markdown table format preserved in vector chunks.",
                acceptance_criteria:
                  "100% extraction accuracy on 5 test grade queries.",
                remediation_plan:
                  "Use pdfplumber table extraction rather than raw unformatted text stream.",
              },
            ],
            mvp_features: [
              "FastAPI CPU-only backend embedding 5-page college regulation PDF.",
              "Cosine similarity top-3 chunk retrieval with source page citations.",
              "Clean browser-based chat interface with zero login barrier.",
            ],
            deferred_features: [
              "Multi-tenant user authentication and team workspace sharing.",
              "Payment gateway / subscription billing.",
              "Multi-lingual audio speech-to-text recognition.",
            ],
            plan_60min: [
              {
                time_window: "Minutes 00-15",
                phase_title: "Scaffold & Vector Store",
                objective:
                  "Set up virtual environment, install FastAPI & sentence-transformers, parse sample PDF.",
                deliverable:
                  "Working script loading 1 PDF into local in-memory embeddings.",
              },
              {
                time_window: "Minutes 15-30",
                phase_title: "Retrieval & Query Logic",
                objective:
                  "Implement cosine similarity query endpoint returning top-3 text snippets.",
                deliverable:
                  "Curl test verifying relevant chunks returned in <200ms.",
              },
              {
                time_window: "Minutes 30-45",
                phase_title: "LLM / Prompt Grounding",
                objective:
                  "Feed retrieved snippets into lightweight generative endpoint with strict source citations.",
                deliverable: "Interactive answer with citation page numbers.",
              },
              {
                time_window: "Minutes 45-60",
                phase_title: "Stress Test & Verify",
                objective:
                  "Run out-of-domain query test and verify graceful refusal template.",
                deliverable:
                  "Zero-hallucination verified working prototype ready for demo.",
              },
            ],
            immediate_action:
              "Clone the starter template, create a Python 3.11 virtual environment, and install 'fastapi uvicorn sentence-transformers'.",
            peer_challenge_prompt:
              "Can you think of a tricky college regulation query that would cause this RAG assistant to quote wrong grading policies?",
            suggested_stack: {
              frontend: "Next.js 14 + Tailwind CSS",
              backend: "FastAPI + Pydantic v2",
              ai_model: "Sentence-Transformers (all-MiniLM-L6-v2) on CPU",
              database: "Local SQLite / ChromaDB (Zero Cloud Costs)",
              tech_reasoning:
                "Runs 100% locally on standard student laptop CPU with zero paid API keys.",
              required_data: "Official college handbook PDF (free public access).",
            },
            challenges: [],
            created_at: new Date().toISOString(),
          });
        } else {
          error(err.message || "Failed to load contract");
        }
      } finally {
        setLoading(false);
      }
    }

    loadContract();
  }, [contractId]);

  const activeSlices = pieMode === "classic5" ? CLASSIC_5_SLICES : DETAILED_8_SLICES;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeSlices.length) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = 380;
    const h = 260;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2 - 8;
    const rx = 130;
    const ry = 92;
    const depth = 18;
    const total = activeSlices.reduce((acc, s) => acc + Number(s.minutes || 0), 0) || 60;

    let startAngle = -Math.PI / 2;
    const computed = activeSlices.map((s, idx) => {
      const sweep = (Number(s.minutes || 0) / total) * Math.PI * 2;
      const endAngle = startAngle + sweep;
      const midAngle = startAngle + sweep / 2;
      const item = { ...s, idx, startAngle, endAngle, midAngle };
      startAngle = endAngle;
      return item;
    });

    // 1. Draw 3D Extruded Layers
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

    // 2. Draw Top Slices + Minute Labels
    computed.forEach((s) => {
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, s.startAngle, s.endAngle);
      ctx.lineTo(cx, cy);
      ctx.closePath();
      ctx.fillStyle = s.color || "#6366f1";
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = isDark ? "#0b1020" : "#ffffff";
      ctx.stroke();

      const labelRadius = rx * 0.65;
      const lx = cx + Math.cos(s.midAngle) * labelRadius;
      const ly = cy + Math.sin(s.midAngle) * (labelRadius * 0.73);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${s.minutes} min`, lx, ly);
    });

    // 3. Center Hole
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx * 0.33, ry * 0.33, 0, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? "#090e1a" : "#ffffff";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = isDark ? "rgba(99,102,241,0.6)" : "rgba(99,102,241,0.3)";
    ctx.stroke();

    ctx.fillStyle = isDark ? "#ffffff" : "#0f172a";
    ctx.font = "900 13px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("60m", cx, cy - 3);
    ctx.fillStyle = isDark ? "#34d399" : "#059669";
    ctx.font = "bold 8px monospace";
    ctx.fillText("TOTAL", cx, cy + 9);
  }, [activeSlices, activeSlice, pieMode, isDark]);

  const copyShareLink = () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/challenge/${contract?.contract_id || contractId}` : "";
    navigator.clipboard.writeText(url);
    setCopied(true);
    success("Link copied! Friends who open it enter an interactive AI Chat room to test your build.");
    setTimeout(() => setCopied(false), 3000);
  };

  const shareToWhatsApp = () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/challenge/${contract?.contract_id || contractId}` : "";
    const title = contract?.project_name || contract?.project_title || "My AI Project";
    const text = `Guys, break my final-year project plan ("${title}") before my professor does! 😅\nCheck my 60-minute build plan & chat with the AI about it here: ${url}\nDrop an edge case in the chat or test your own idea! 🔥`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  const downloadPDF = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center gap-4">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium font-mono">Loading 60-Minute Build Blueprint...</p>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-xl w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Blueprint Not Found</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Contract ID &quot;{contractId}&quot; could not be located in the database.
          </p>
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-sm"
          >
            <span>Create New Comparison</span>
          </Link>
        </div>
      </div>
    );
  }

  const stack = contract.suggested_stack || {};
  const failureScenarios = contract.failure_scenarios || [];
  const mvpFeatures = contract.mvp_features || [];
  const deferredFeatures = contract.deferred_features || contract.out_of_scope || [];
  const planMilestones = contract.plan_60min || [];
  const projectTitle = contract.project_name || contract.project_title || "AI Build Blueprint";
  const feasibilityScore = contract.feasibility_score || 88;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      
        {/* Top Header & Action Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 mb-2">
              <span>⚡ PROTOTYPE BLUEPRINT LOCKED · SCORE {feasibilityScore}/100</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              {projectTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
              <strong className="text-slate-900 dark:text-white">A Build Plan That Leaves Nothing Out:</strong> Required ₹0 local stack, hidden assumptions, concrete failure tests, strict scope limits, and your <strong>exact 60-minute build pie chart</strong>.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={downloadPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-xs font-semibold transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={copyShareLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-xs font-semibold transition shadow-sm"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? "Copied!" : "Copy Link"}</span>
            </button>
            <button
              onClick={shareToWhatsApp}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share WhatsApp</span>
            </button>
            <Link
              href={`/compare?from_contract=${contract.contract_id || contractId}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm"
            >
              <span>🔄 Remix Context</span>
            </Link>
          </div>
        </div>

        {/* Main Master Card */}
        <div className="rounded-3xl p-6 sm:p-9 bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-indigo-500/30 shadow-2xl relative space-y-8">
        
          {/* Project Metadata Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                OFFICIAL BUILD CONTRACT LOCKED · SCORE {feasibilityScore}/100
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {projectTitle}
              </h2>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                <span>Category: <strong className="text-indigo-600 dark:text-indigo-400">{contract.category}</strong></span>
                <span>•</span>
                <span>Target Time: <strong className="text-emerald-600 dark:text-emerald-400">Exactly 60 Minutes</strong></span>
                <span>•</span>
                <span>Cloud Budget: <strong className="text-emerald-600 dark:text-emerald-400">₹0 Local CPU</strong></span>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold">
              ID: {contract.contract_id || contractId}
            </div>
          </div>

        {/* TWO-COLUMN HERO: 6 KEY PILLARS (LEFT) + 60-MIN PIE CHART (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: 6 Structured Pillar Cards */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-3">
            
            {/* Tech Stack */}
            <a href="#sec1" className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-[#111726] dark:hover:bg-[#161e31] border border-slate-200 dark:border-white/10 hover:border-indigo-500/40 transition-all flex items-start gap-3.5 group">
              <span className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <Cpu className="w-4 h-4" />
              </span>
              <div>
                <strong className="text-sm font-bold text-slate-900 dark:text-white block">₹0 Tech Stack</strong>
                <span className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                  FastAPI + SQLite + free local embeddings. No cloud bill. Runs directly on laptop.
                </span>
              </div>
            </a>

            {/* Load-Bearing Assumption */}
            <a href="#sec2" className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-[#111726] dark:hover:bg-[#161e31] border border-slate-200 dark:border-white/10 hover:border-indigo-500/40 transition-all flex items-start gap-3.5 group">
              <span className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <div>
                <strong className="text-sm font-bold text-slate-900 dark:text-white block">Load-Bearing Assumption</strong>
                <span className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                  The one hidden risk that sinks the project: &ldquo;{contract.critical_assumption?.slice(0, 85)}...&rdquo;
                </span>
              </div>
            </a>

            {/* Failure Tests */}
            <a href="#sec3" className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-[#111726] dark:hover:bg-[#161e31] border border-slate-200 dark:border-white/10 hover:border-indigo-500/40 transition-all flex items-start gap-3.5 group">
              <span className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-4 h-4" />
              </span>
              <div>
                <strong className="text-sm font-bold text-slate-900 dark:text-white block">Failure Tests</strong>
                <span className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                  2–3 targeted stress tests: what to test, expected output, and remediation plans.
                </span>
              </div>
            </a>

            {/* Scope Boundary */}
            <a href="#sec4" className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-[#111726] dark:hover:bg-[#161e31] border border-slate-200 dark:border-white/10 hover:border-indigo-500/40 transition-all flex items-start gap-3.5 group">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <Target className="w-4 h-4" />
              </span>
              <div>
                <strong className="text-sm font-bold text-slate-900 dark:text-white block">Scope Boundary</strong>
                <span className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                  Essential MVP features vs what NOT to build in Week 1 (no payments, no complex logins).
                </span>
              </div>
            </a>

            {/* 60-Minute Prototype Plan */}
            <a href="#sec5" className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-[#111726] dark:hover:bg-[#161e31] border border-slate-200 dark:border-white/10 hover:border-indigo-500/40 transition-all flex items-start gap-3.5 group">
              <span className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <Clock className="w-4 h-4" />
              </span>
              <div>
                <strong className="text-sm font-bold text-slate-900 dark:text-white block">60-Minute Prototype Plan</strong>
                <span className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                  Milestones that add up to exactly an hour: scaffold, data ingest, core AI, UI wire-up, verify.
                </span>
              </div>
            </a>

            {/* Day-1 Launch Action */}
            <a href="#sec6" className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-[#111726] dark:hover:bg-[#161e31] border border-slate-200 dark:border-white/10 hover:border-indigo-500/40 transition-all flex items-start gap-3.5 group">
              <span className="w-8 h-8 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <Zap className="w-4 h-4" />
              </span>
              <div>
                <strong className="text-sm font-bold text-slate-900 dark:text-white block">Day-1 Launch Action</strong>
                <span className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                  One task you can do right now to build momentum immediately.
                </span>
              </div>
            </a>
          </div>

          {/* Right Column: 60-Minute Pie Chart */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-[#080d1a] text-slate-900 dark:text-white border border-slate-200 dark:border-indigo-500/40 flex flex-col justify-between items-center shadow-lg dark:shadow-xl">
            <div className="w-full flex justify-between items-center mb-2">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                  EXACTLY 60 MINUTES
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">60-Min Build Pie Chart</h4>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setPieMode("classic5")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                    pieMode === "classic5"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-[#161e31] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1e293b] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10"
                  }`}
                >
                  Classic 5 (60m)
                </button>
                <button
                  type="button"
                  onClick={() => setPieMode("detailed")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                    pieMode === "detailed"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-[#161e31] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1e293b] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10"
                  }`}
                >
                  Detailed 8 (60m)
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div className="relative w-full flex justify-center items-center py-2">
              <canvas ref={canvasRef} className="max-w-full h-auto" />
            </div>

            {/* Dynamic Legend */}
            <div className="w-full grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-white/10">
              {activeSlices.map((s, idx) => (
                <div key={idx} className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="truncate">{s.title} (<strong>{s.minutes}m</strong>)</span>
                </div>
              ))}
            </div>

            <div className="w-full text-center mt-3 pt-2 border-t border-slate-100 dark:border-white/5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              TOTAL TIME: 60 MINS · ₹0 CLOUD COST
            </div>
          </div>
        </div>

        {/* BOTTOM WORKSHOP BAR: 60 MINS = 60 MINS LIVE WORKSHOP */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-cyan-50 dark:from-[#0b0f1a] dark:via-[#111728] dark:to-[#0b0f1a] border-2 border-indigo-200 dark:border-indigo-500/50 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-5 text-slate-900 dark:text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-600 text-white font-black text-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-600/50">
              60
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                “This plan takes exactly 60 minutes. So does our workshop. Come build it live.”
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                Your plan is ready! Learn how to build this exact prototype in 60 minutes at NxtWave&apos;s free live workshop.
              </p>
            </div>
          </div>
          <Link
            href={`/register?contract_id=${contract.contract_id || contractId}`}
            className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/30 transition whitespace-nowrap text-center"
          >
            <span>Join the workshop →</span>
          </Link>
        </div>

        {/* DETAILED TECHNICAL EXECUTION PANELS */}

        {/* The ₹0 Tech Stack */}
        <div id="sec1" className="pt-6 border-t border-slate-200 dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-rose-500" />
              <span>₹0 Tech Stack (Everything Required to Build)</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              ₹0 Cloud Fees
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#111726] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase block mb-1">Frontend</span>
              <strong className="text-xs text-slate-900 dark:text-white block">{stack.frontend || contract.frontend_rec || "Next.js / HTML5"}</strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#111726] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase block mb-1">Backend</span>
              <strong className="text-xs text-blue-600 dark:text-blue-400 block">{stack.backend || contract.backend_rec || "FastAPI"}</strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#111726] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase block mb-1">AI Model</span>
              <strong className="text-xs text-violet-600 dark:text-violet-400 block">{stack.ai_model || contract.ai_model_rec || "Sentence-Transformers on CPU"}</strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#111726] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase block mb-1">Database</span>
              <strong className="text-xs text-emerald-600 dark:text-emerald-400 block">{stack.database || contract.db_rec || "Local SQLite (₹0)"}</strong>
            </div>
          </div>
          {contract.tech_reasoning && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#111726] border-l-2 border-indigo-500 text-xs text-slate-700 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white">Architectural Rationale: </strong>{contract.tech_reasoning}
            </div>
          )}
        </div>

        {/* Load-Bearing Assumption */}
        <div id="sec2" className="pt-6 border-t border-slate-200 dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>The “Load-Bearing Assumption” (The Trap &amp; Key Limitation)</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Single Point of Failure
            </span>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border-l-4 border-amber-500 space-y-2">
            <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
              &ldquo;{contract.critical_assumption}&rdquo;
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white">What happens when someone asks an unlisted question?</strong> If this assumption proves false during your professor&apos;s viva review and your code lacks a confidence threshold, the model hallucinates and the project fails review.
            </p>
          </div>
        </div>

        {/* Concrete Failure Tests */}
        <div id="sec3" className="pt-6 border-t border-slate-200 dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span>Concrete Failure Tests</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Proposed Tests — Not Yet Executed
            </span>
          </div>
          <div className="space-y-3">
            {failureScenarios.map((test: any, i: number) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-[#111726] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white space-y-2.5">
                <div className="flex items-center justify-between">
                  <strong className="text-sm font-bold text-slate-900 dark:text-white">{test.test_name}</strong>
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-200 dark:bg-[#161e31] text-indigo-700 dark:text-indigo-300 font-bold">{test.test_id || `TST-0${i + 1}`}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-white/10">
                    <strong className="text-slate-500 dark:text-slate-400 block mb-0.5">What to Test:</strong>
                    <span className="text-slate-800 dark:text-slate-200">{test.what_is_tested}</span>
                  </div>
                  <div className="p-2.5 rounded bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-white/10">
                    <strong className="text-slate-500 dark:text-slate-400 block mb-0.5">What to Expect:</strong>
                    <span className="text-slate-800 dark:text-slate-200">{test.expected_observation}</span>
                  </div>
                  <div className="p-2.5 rounded bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-white/10">
                    <strong className="text-emerald-600 dark:text-emerald-400 block mb-0.5">Acceptance Criteria:</strong>
                    <span className="text-slate-800 dark:text-slate-200">{test.acceptance_criteria}</span>
                  </div>
                  <div className="p-2.5 rounded bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-white/10">
                    <strong className="text-amber-600 dark:text-amber-400 block mb-0.5">How to Fix It:</strong>
                    <span className="text-slate-800 dark:text-slate-200">{test.remediation_plan}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strict Scope Boundary */}
        <div id="sec4" className="pt-6 border-t border-slate-200 dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Strict Scope Boundary</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              DO NOT Build in Week 1
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-2">
              <strong className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>In-Scope (Build in Week 1):</span>
              </strong>
              <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 pl-3 list-disc">
                {mvpFeatures.map((f: string, i: number) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/20 space-y-2">
              <strong className="text-xs font-bold text-rose-600 dark:text-rose-400 block flex items-center gap-1.5">
                <Ban className="w-3.5 h-3.5" />
                <span>DO NOT Build in Week 1 (Postpone):</span>
              </strong>
              <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 pl-3 list-disc">
                {deferredFeatures.map((f: string, i: number) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* The 60-Minute Prototype Plan */}
        <div id="sec5" className="pt-6 border-t border-slate-200 dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span>The 60-Minute Prototype Plan</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Four 15-Minute Milestones
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {planMilestones.map((m: any, i: number) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#111726] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white space-y-1.5">
                <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase block">{m.time_window || `Minutes ${i * 15}-${(i + 1) * 15}`}</span>
                <strong className="text-xs font-bold text-slate-900 dark:text-white block">{m.phase_title}</strong>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{m.objective}</p>
                {m.deliverable && (
                  <div className="pt-2 border-t border-slate-200 dark:border-white/5 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                    ✓ {m.deliverable}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Immediate Next Action */}
        <div id="sec6" className="pt-6 border-t border-slate-200 dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Immediate Next Action (Start in 5 Minutes)</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Momentum Trigger
            </span>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-[#111726] border border-emerald-200 dark:border-emerald-500/30 text-slate-900 dark:text-white">
            <strong className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block mb-1">Day-1 Launch Action:</strong>
            <p className="font-mono text-xs text-slate-900 dark:text-white leading-relaxed">{contract.immediate_action}</p>
          </div>
        </div>

        {/* VIRAL SHARE LOOP: WHATSAPP GROUP & AI CHAT ROOM */}
        <div className="pt-8 border-t border-slate-200 dark:border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                VIRAL PEER CHALLENGE &amp; SHARE LINK
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                Share Link to WhatsApp Group — Friends Join AI Chat &amp; Test Your Build
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                When you share this link, classmates land in an interactive AI Chat room where they can test edge cases before your professor does!
              </p>
            </div>
            <Link
              href={`/challenge/${contract.contract_id || contractId}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition whitespace-nowrap"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Open AI Chat Arena →</span>
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#111726] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? `${window.location.origin}/challenge/${contract.contract_id || contractId}` : ""}
                className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-white/10 font-mono text-xs text-slate-800 dark:text-slate-200"
              />
              <button
                onClick={copyShareLink}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-[#161e31] dark:hover:bg-[#1e293b] dark:text-white border border-transparent dark:border-white/10 font-semibold text-xs transition"
              >
                Copy Link
              </button>
              <button
                onClick={shareToWhatsApp}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm"
              >
                Share WhatsApp
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
  );
}
