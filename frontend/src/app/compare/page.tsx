"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Layers,
  Sparkles,
  Trophy,
  ArrowRight,
  Plus,
  Trash2,
  CheckCircle2,
  Lightbulb,
  RefreshCw,
  FileCheck2,
  Target,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";
import { compareIdeas, generateContract, trackAnalyticsEvent } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";

interface IdeaInput {
  name: string;
  description: string;
  target_audience: string;
  tech_stack: string;
}

const PRESETS = [
  {
    label: "RAG Support Bot vs Crypto Arbitrage",
    ideas: [
      {
        name: "AI Customer Support Agent",
        description: "RAG pipeline answering student doubts from university knowledge base with semantic search.",
        target_audience: "College students and faculty",
        tech_stack: "FastAPI, ChromaDB, OpenAI, React",
      },
      {
        name: "Algorithmic Crypto Arbitrage Bot",
        description: "High-frequency triangular arbitrage trading bot across Binance, Coinbase, and Kraken.",
        target_audience: "DeFi algorithmic traders",
        tech_stack: "Rust, WebSockets, Redis, PostgreSQL",
      },
    ],
  },
  {
    label: "WhatsApp Expense Bot vs Whiteboard",
    ideas: [
      {
        name: "WhatsApp Smart Expense Tracker",
        description: "Parse receipt photos and text logs over WhatsApp, categorize spending automatically with OCR.",
        target_audience: "Freelancers and students on tight budgets",
        tech_stack: "WhatsApp Cloud API, FastAPI, Tesseract OCR, SQLite",
      },
      {
        name: "Real-Time Collaborative Whiteboard",
        description: "Infinite collaborative canvas with WebSockets, multiplayer cursor tracking, and freehand drawing.",
        target_audience: "Remote software product teams",
        tech_stack: "React, WebSockets, Canvas API, Node.js",
      },
    ],
  },
];

const CARD_BADGES = ["A", "B", "C"];

const ARCHETYPE_PAIRS: Record<string, IdeaInput[]> = {
  rag: [
    {
      name: "College Policy RAG Assistant",
      description: "Indexes university circulars and handbooks to answer student questions locally with zero API fees.",
      target_audience: "College students and faculty",
      tech_stack: "FastAPI, Sentence-Transformers, SQLite, CPU",
    },
    {
      name: "Generic Web Search FAQ Scraper",
      description: "Scrapes public college websites on-the-fly and runs unstructured keyword search over HTML.",
      target_audience: "Prospective applicants and visitors",
      tech_stack: "Python, BeautifulSoup, Flask, SQLite",
    },
  ],
  vision: [
    {
      name: "Crop Leaf Disease Classifier",
      description: "Lightweight MobileNet CNN classifying leaf lesions and suggesting organic remediation steps.",
      target_audience: "Smallholder farmers and agronomists",
      tech_stack: "PyTorch, MobileNetV2, OpenCV, FastAPI",
    },
    {
      name: "Manual Farm Inspection Spreadsheet",
      description: "Manual mobile form logging crop symptoms for delayed offline expert manual review.",
      target_audience: "Agricultural field workers",
      tech_stack: "React, Google Sheets API, Node.js",
    },
  ],
  tabular: [
    {
      name: "Placement Package Predictor",
      description: "Gradient boosting model predicting placement readiness and package brackets from coding metrics.",
      target_audience: "Final-year college job applicants",
      tech_stack: "Scikit-Learn, XGBoost, FastAPI, Pandas",
    },
    {
      name: "Manual Resume Word Cloud Highlighter",
      description: "Basic regex keyword counter matching resume text against generic job descriptions.",
      target_audience: "Campus placement coordinators",
      tech_stack: "Python, NLTK, Streamlit",
    },
  ],
};

export default function ComparePage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [ideas, setIdeas] = useState<IdeaInput[]>([
    {
      name: "",
      description: "",
      target_audience: "",
      tech_stack: "",
    },
    {
      name: "",
      description: "",
      target_audience: "",
      tech_stack: "",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [generatingContract, setGeneratingContract] = useState(false);
  const [sourceContractId, setSourceContractId] = useState<string | null>(null);

  useEffect(() => {
    trackAnalyticsEvent("page_view_compare");
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const fc = params.get("from_contract");
      const fa = params.get("from_archetype");

      if (fa && ARCHETYPE_PAIRS[fa]) {
        setIdeas(ARCHETYPE_PAIRS[fa]);
        success(`Loaded benchmark pair for ${ARCHETYPE_PAIRS[fa][0].name}`);
      } else if (fc) {
        setSourceContractId(fc);
        import("@/lib/api").then(({ getContract }) => {
          getContract(fc)
            .then((data: any) => {
              if (data) {
                setIdeas((prev) => [
                  {
                    name: data.project_title || data.project_name || "Friend's Project",
                    description: data.original_idea || "",
                    target_audience: data.target_audience || "College students",
                    tech_stack: data.suggested_stack?.backend || "FastAPI, Python",
                  },
                  prev[1] || { name: "", description: "", target_audience: "", tech_stack: "" },
                ]);
                success(`Loaded friend's project context: "${data.project_title || data.project_name}"`);
              }
            })
            .catch(() => {});
        });
      }
    }
  }, []);

  const handleIdeaChange = (index: number, field: keyof IdeaInput, value: string) => {
    setIdeas((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addThirdIdea = () => {
    if (ideas.length < 3) {
      setIdeas((prev) => [
        ...prev,
        { name: "", description: "", target_audience: "", tech_stack: "" },
      ]);
    }
  };

  const removeThirdIdea = () => {
    if (ideas.length > 2) {
      setIdeas((prev) => [prev[0], prev[1]]);
    }
  };

  const loadPreset = (preset: typeof PRESETS[0]) => {
    setIdeas(
      preset.ideas.map((item) => ({
        ...item,
      }))
    );
    setResult(null);
    success(`Loaded preset: "${preset.label}"`);
  };

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    for (let i = 0; i < ideas.length; i++) {
      if (!ideas[i].name.trim() || !ideas[i].description.trim()) {
        error(`Please fill in both name and description for Idea ${CARD_BADGES[i]}`);
        return;
      }
      if (ideas[i].description.trim().length < 10) {
        error(`Description for Idea ${CARD_BADGES[i]} must be at least 10 characters long`);
        return;
      }
    }

    try {
      setLoading(true);
      const payload = ideas.map((idea) => ({
        name: idea.name.trim(),
        description: idea.description.trim(),
        target_audience: idea.target_audience.trim() || "General developers",
        tech_stack: idea.tech_stack
          ? idea.tech_stack.split(",").map((s) => s.trim()).filter(Boolean)
          : ["Python", "FastAPI"],
      }));

      const res = await compareIdeas(payload);
      setResult(res);

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      success("Comparison matrix evaluated successfully!");
      trackAnalyticsEvent("compare_submitted", { winner: res.winner?.name });
    } catch (err: any) {
      error(err.message || "Failed to compare ideas");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContract = async () => {
    if (!result?.winner) return;

    try {
      setGeneratingContract(true);
      const winner = result.winner;
      const contractPayload = {
        project_name: winner.name,
        archetype: winner.archetype || "RAG_PIPELINE",
        target_audience: winner.target_audience || "Engineering teams",
        key_assumptions: [
          `Assumption 1: Core value can be demonstrated within 3 user interactions.`,
          `Assumption 2: Third-party API quotas and latency will stay under 1.5s.`,
          `Assumption 3: The database schema will not require migrations after hour 2.`,
        ],
        first_hour_milestone: `Verifiable ping: working backend route returning seeded payload with test passing.`,
        out_of_scope: [
          "Custom authentication system (use mock token or Supabase)",
          "Production billing and multi-currency billing integration",
          "Complex dark-mode themes for non-essential subpages",
        ],
        suggested_stack: {
          frontend: "Next.js 14 + Tailwind CSS",
          backend: "FastAPI + Pydantic v2",
          database: "SQLite / Supabase Postgres",
        },
        comparison_id: result.comparison_id,
      };

      const newContract = await generateContract(contractPayload);
      success("Build Contract generated!");
      router.push(`/contract/${newContract.contract_id || newContract.id}`);
    } catch (err: any) {
      error(err.message || "Failed to generate build contract");
    } finally {
      setGeneratingContract(false);
    }
  };

  const winnerScore = result?.winner?.overall_score || result?.winner?.score || 89;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-4 backdrop-blur-sm">
            <Layers className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>Deterministic Decision Engine</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">
            Compare Project Concepts
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Benchmark candidate architectures side-by-side. Objectively scored across
            Feasibility, 48-Hour Scope Viability, and Market Traction.
          </p>
        </div>

        {/* Friend Context Loaded Banner */}
        {sourceContractId && (
          <div className="relative overflow-hidden rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-gradient-to-r from-purple-50 via-indigo-50 to-cyan-50 dark:from-purple-500/10 dark:via-indigo-500/10 dark:to-cyan-500/10 p-5 mb-8 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-1">
                  Shared Blueprint Context ({sourceContractId})
                </span>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Friend&apos;s project seeded into Idea A
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Refine their parameters or enter your own concept in Idea B to determine the superior build.
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <Link
                  href={`/contract/${sourceContractId}`}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/15 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 transition whitespace-nowrap shadow-sm"
                >
                  View Blueprint
                </Link>
                <Link
                  href={`/challenge/${sourceContractId}`}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/30 transition whitespace-nowrap"
                >
                  Peer Critique
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Preset Quick Fill Bar */}
        <div className="glass-panel rounded-2xl p-3 sm:p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
            <Lightbulb className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>Preset Scenarios:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => loadPreset(p)}
                className="text-xs px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-white hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800/80 hover:border-indigo-500/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white font-medium transition cursor-pointer shadow-sm"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleCompare} className="space-y-8">
          <div className={`grid grid-cols-1 ${ideas.length === 3 ? "lg:grid-cols-3" : "md:grid-cols-2"} gap-6`}>
            {ideas.map((idea, idx) => (
              <div
                key={idx}
                className="relative rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 backdrop-blur-xl p-6 sm:p-7 flex flex-col justify-between overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-indigo-500/50 before:via-purple-500/40 before:to-cyan-500/50 transition-all hover:border-indigo-400/50 dark:hover:border-white/20"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold font-mono">
                        {CARD_BADGES[idx]}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        Concept {CARD_BADGES[idx]}
                      </span>
                    </div>

                    {idx === 2 && (
                      <button
                        type="button"
                        onClick={removeThirdIdea}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-400/10 transition"
                        title="Remove Idea C"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Project Name */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                        Project Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. AI Customer Support Agent"
                        value={idea.name}
                        onChange={(e) => handleIdeaChange(idx, "name", e.target.value)}
                        className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 rounded-xl px-4 py-3 w-full text-sm outline-none transition"
                      />
                    </div>

                    {/* Concept Description */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                        Mechanism & Architecture *
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="What problem does it solve and what is the primary technical workflow?"
                        value={idea.description}
                        onChange={(e) => handleIdeaChange(idx, "description", e.target.value)}
                        className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 rounded-xl px-4 py-3 w-full text-sm outline-none transition resize-none"
                      />
                    </div>

                    {/* Target Audience */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                        Target Audience
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. CS students, B2B sales teams"
                        value={idea.target_audience}
                        onChange={(e) => handleIdeaChange(idx, "target_audience", e.target.value)}
                        className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 rounded-xl px-4 py-3 w-full text-sm outline-none transition"
                      />
                    </div>

                    {/* Tech Stack */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                        Tech Stack
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Next.js, FastAPI, SQLite, OpenAI"
                        value={idea.tech_stack}
                        onChange={(e) => handleIdeaChange(idx, "tech_stack", e.target.value)}
                        className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 rounded-xl px-4 py-3 w-full text-sm outline-none transition"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            {ideas.length < 3 ? (
              <button
                type="button"
                onClick={addThirdIdea}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4 text-indigo-500" />
                <span>Add Candidate Idea C</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Evaluating Matrix...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>Run Comparison Matrix</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* RESULTS SECTION */}
        {result && (
          <div className="mt-16 space-y-8 animate-in fade-in-50 duration-500">
            {/* Winner Banner */}
            <div className="rounded-3xl border border-emerald-300 dark:border-emerald-500/30 bg-gradient-to-br from-emerald-50 via-teal-50 to-indigo-50 dark:from-emerald-950/20 dark:via-slate-900/80 dark:to-indigo-950/30 backdrop-blur-2xl p-8 sm:p-10 relative overflow-hidden shadow-2xl">
              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                <div className="space-y-3 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    <Trophy className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    <span>RECOMMENDED BUILD ARCHETYPE</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {result.winner?.name}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                    {result.winner?.reasoning ||
                      "Optimal balance of technical feasibility, tight 48-hour execution scope, and high market demand."}
                  </p>
                </div>

                {/* Score Circular Badge */}
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-center min-w-[160px] shadow-sm">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-200 dark:text-white/10"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-emerald-500 dark:text-emerald-400"
                        strokeDasharray={`${winnerScore}, 100`}
                        strokeWidth="3"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">{winnerScore}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">/ 100</span>
                    </div>
                  </div>
                  <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 mt-2">
                    Overall Index
                  </span>
                </div>
              </div>

              {/* Action Banner inside Winner Box */}
              <div className="relative z-10 mt-8 pt-6 border-t border-emerald-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Lock in this winner as a formal 60-Minute Build Contract with milestones.</span>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateContract}
                  disabled={generatingContract}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {generatingContract ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating Blueprint...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck2 className="w-4 h-4" />
                      <span>Generate Build Contract</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Evaluation Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(result.evaluations || []).map((ev: any, i: number) => {
                const isWinner = ev.name === result.winner?.name;
                const feasibility = ev.feasibility_score || ev.feasibility || 85;
                const uniqueness = ev.uniqueness_score || ev.uniqueness || 80;
                const market = ev.market_score || ev.market || 88;

                return (
                  <div
                    key={i}
                    className={`rounded-2xl border p-6 flex flex-col justify-between backdrop-blur-xl transition ${
                      isWinner
                        ? "border-emerald-400 dark:border-emerald-500/40 bg-white dark:bg-slate-900/80 shadow-lg shadow-emerald-500/5"
                        : "border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 shadow-md dark:shadow-none"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase">
                          Concept {CARD_BADGES[i] || `${i + 1}`}
                        </span>
                        {isWinner && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                            WINNER
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5 line-clamp-2">
                        {ev.name}
                      </h3>

                      {/* Clean Metric Bars */}
                      <div className="space-y-3.5 mb-6">
                        <div>
                          <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            <span className="flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                              <span>Feasibility (48h)</span>
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-white">{feasibility}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                              style={{ width: `${feasibility}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                              <span>Uniqueness</span>
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-white">{uniqueness}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-purple-500 rounded-full transition-all duration-700"
                              style={{ width: `${uniqueness}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            <span className="flex items-center gap-1.5">
                              <Target className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                              <span>Market Demand</span>
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-white">{market}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-cyan-500 rounded-full transition-all duration-700"
                              style={{ width: `${market}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Strengths and Blindspots */}
                      <div className="space-y-2.5 text-xs">
                        {ev.strengths && (
                          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                            <span className="font-semibold block mb-0.5 text-emerald-700 dark:text-emerald-400">Core Strength:</span>
                            {Array.isArray(ev.strengths) ? ev.strengths[0] : ev.strengths}
                          </div>
                        )}

                        {ev.blindspots && (
                          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300">
                            <span className="font-semibold block mb-0.5 text-amber-700 dark:text-amber-400">Critical Risk:</span>
                            {Array.isArray(ev.blindspots) ? ev.blindspots[0] : ev.blindspots}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
