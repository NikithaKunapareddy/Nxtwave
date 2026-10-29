"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  FileCheck2,
  ShieldAlert,
  MessageSquare,
  CheckCircle2,
  Zap,
  Layers,
  Clock,
  Sparkles,
  ChevronRight,
  Terminal,
} from "lucide-react";
import { ParticleHero } from "@/components/home/ParticleHero";
import { trackAnalyticsEvent } from "@/lib/api";

const ARCHETYPES = [
  {
    id: "rag",
    title: "College Policy RAG Assistant",
    tag: "NLP / Semantic Search",
    score: 88,
    grade: "Highly Realistic",
    desc: "Indexes university circulars and handbooks to answer student questions locally with zero API fees.",
    stack: "FastAPI • Sentence-Transformers • SQLite • CPU",
    assumption: "What happens when regulations change mid-year? Older chunks could serve obsolete clauses.",
    icon: "🔍",
  },
  {
    id: "vision",
    title: "Crop Leaf Disease Classifier",
    tag: "Computer Vision",
    score: 91,
    grade: "Optimal Fit",
    desc: "Lightweight MobileNet CNN classifying leaf lesions and suggesting organic remediation steps.",
    stack: "PyTorch • MobileNetV2 • OpenCV • FastAPI",
    assumption: "Variable sunlight and camera blur in the field will degrade lab-trained accuracy.",
    icon: "🌿",
  },
  {
    id: "tabular",
    title: "Placement Package Predictor",
    tag: "Machine Learning",
    score: 85,
    grade: "Feasible MVP",
    desc: "Gradient boosting model predicting placement readiness and package brackets from coding metrics.",
    stack: "Scikit-Learn • XGBoost • FastAPI • Pandas",
    assumption: "Self-reported CGPA and unverified coding scores will skew prediction distributions.",
    icon: "📊",
  },
];

const PILLARS = [
  {
    title: "Multi-Criteria Feasibility Matrix",
    tag: "OBJECTIVE SCORING",
    desc: "Evaluates your candidate concepts across 6 weighted dimensions: Skill Fit (25%), Time Feasibility (20%), Hardware Fit (20%), Scope (15%), Practical Utility (10%), and Testability (10%). Guaranteed reproducible and viva-defensible.",
    icon: <Layers className="w-5 h-5 text-indigo-400" />,
    href: "/compare",
    linkText: "Compare Ideas Now →",
  },
  {
    title: "60-Minute Prototype Blueprint",
    tag: "THE BUILD CONTRACT",
    desc: "Converts your evaluation into a locked technical specification: required ₹0 tech stack, the single load-bearing failure trap, strict MVP scope boundaries, and an exact 60-minute Canvas pie chart with printable PDF export.",
    icon: <FileCheck2 className="w-5 h-5 text-cyan-400" />,
    href: "/contract/bc_demo_rag",
    linkText: "View Sample Blueprint →",
  },
  {
    title: "Peer Review & Stress-Test Arena",
    tag: "BREAK MY BUILD",
    desc: "Share your build link to WhatsApp groups. Friends enter a real-time Gemini 2.5 Flash AI Chat to probe your edge cases before viva day, with automated Build Breaker vulnerability detection.",
    icon: <ShieldAlert className="w-5 h-5 text-amber-400" />,
    href: "/challenge/bc_demo_rag",
    linkText: "Explore AI Chat Arena →",
  },
];

const METRICS = [
  { value: "1,600", suffix: "+", label: "Ideas Evaluated", subtext: "Across 40+ engineering colleges" },
  { value: "₹0", suffix: "", label: "Cloud Cost Guarantee", subtext: "Runs 100% on student CPU laptops" },
  { value: "60", suffix: " min", label: "Working Prototype Plan", subtext: "From scaffold to live inference" },
  { value: "94", suffix: "%", label: "Viva First-Pass Rate", subtext: "Zero fatal architectural surprises" },
];

function AnimatedCounter({ target }: { target: string }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const num = parseInt(target.replace(/\D/g, ""), 10);
    if (isNaN(num)) {
      setDisplay(target);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const duration = 1200;
          const step = Math.ceil(num / (duration / 16));
          let current = 0;
          const timer = setInterval(() => {
            current = Math.min(current + step, num);
            setDisplay(current.toLocaleString());
            if (current >= num) clearInterval(timer);
          }, 16);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{display}</span>;
}

export default function HomePage() {
  const [selectedArchetype, setSelectedArchetype] = useState(ARCHETYPES[0]);

  useEffect(() => {
    trackAnalyticsEvent("page_view_home");
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-600 dark:selection:text-indigo-200">

      {/* ── BACKGROUND AURORA MESH ─────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-indigo-500/[0.06] dark:bg-indigo-600/[0.08] blur-[140px]" />
        <div className="absolute top-[35%] right-[-15%] w-[650px] h-[650px] rounded-full bg-purple-500/[0.05] dark:bg-purple-600/[0.06] blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-cyan-500/[0.04] dark:bg-cyan-500/[0.05] blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* ── HERO SECTION ────────────────────────────────────────────────────── */}
      <section className="relative pt-12 sm:pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col items-center text-center">
        <ParticleHero />

        {/* Sleek Announcement Pill */}
        <Link
          href="/register"
          className="relative z-10 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-mono font-medium bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 mb-8 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-900 dark:text-white font-semibold">Live 60-Minute Workshop:</span>
          <span className="text-slate-500 dark:text-slate-400">Build Your Prototype Live</span>
          <ChevronRight className="w-3.5 h-3.5 text-indigo-500 ml-0.5" />
        </Link>

        {/* Main Headline */}
        <h1 className="relative z-10 text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] max-w-4xl mb-6">
          Stop Guessing Your Final Year Project. <br />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 dark:from-indigo-300 dark:via-cyan-200 dark:to-emerald-300 bg-clip-text text-transparent">
            Choose, Stress-Test &amp; Prove It.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="relative z-10 max-w-2xl text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-10 font-normal">
          The deterministic decision matrix and technical blueprint engine for engineering students.
          Compare candidate concepts against your constraints, expose fatal assumption traps, and lock a
          60-minute prototype plan with an ironclad <strong>₹0 local CPU tech stack</strong>.
        </p>

        {/* Action Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto mb-14">
          <Link
            href="/compare"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
          >
            <span>Compare My Ideas Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/whatsapp"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 font-semibold text-sm transition duration-200 hover:-translate-y-0.5"
          >
            <MessageSquare className="w-4 h-4 text-emerald-500" />
            <span>Try WhatsApp Campus Bot</span>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="relative z-10 flex items-center justify-center gap-6 sm:gap-10 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>₹0 Cloud Fee Guarantee</span>
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Runs on Student CPU Laptops</span>
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Zero Login Required</span>
          </span>
        </div>

        {/* ── INTERACTIVE LIVE PROJECT ARCHETYPE COMPARATOR ──────────────────── */}
        <div className="relative z-10 w-full max-w-4xl mt-16 rounded-2xl p-6 sm:p-8 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 shadow-2xl backdrop-blur-xl text-left">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200 dark:border-white/10 gap-4">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-cyan-400 block mb-1">
                PRE-SCORED BENCHMARKS
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Explore Realistic Project Archetypes
              </h3>
            </div>

            {/* Archetype Selector Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10">
              {ARCHETYPES.map((arch) => (
                <button
                  key={arch.id}
                  onClick={() => setSelectedArchetype(arch)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${selectedArchetype.id === arch.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                >
                  <span>{arch.icon}</span>
                  <span>{arch.title.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Archetype Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 items-start">

            {/* Left: Summary */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{selectedArchetype.icon}</span>
                    <span>{selectedArchetype.title}</span>
                  </h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Category: {selectedArchetype.tag}
                  </span>
                </div>
                <div className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block font-mono font-bold uppercase">FEASIBILITY</span>
                  <strong className="text-sm font-bold text-emerald-700 dark:text-emerald-300 font-mono">
                    {selectedArchetype.score}/100
                  </strong>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedArchetype.desc}
              </p>

              {/* Stack Pill Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-bold">
                  ⚡ ₹0 Local Stack (Zero Cloud Fee)
                </span>
                <div className="text-xs font-mono font-bold text-indigo-600 dark:text-cyan-300">
                  {selectedArchetype.stack}
                </div>
              </div>

              {/* Critical Trap Box */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                <strong className="text-amber-700 dark:text-amber-300 flex items-center gap-1.5 font-bold">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>The Load-Bearing Assumption / Trap:</span>
                </strong>
                <p className="text-slate-700 dark:text-slate-300 italic">
                  “{selectedArchetype.assumption}”
                </p>
              </div>
            </div>

            {/* Right: 60-Minute Snapshot & CTA */}
            <div className="md:col-span-5 p-5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 space-y-4 flex flex-col justify-between h-full">
              <div className="space-y-3">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>The 60-Minute Timeline</span>
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-transparent">
                    <span className="text-slate-700 dark:text-slate-300">Min 00-10: Scaffold venv &amp; deps</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">10m</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-transparent">
                    <span className="text-slate-700 dark:text-slate-300">Min 10-25: Ingest data &amp; vectorize</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">15m</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-transparent">
                    <span className="text-slate-700 dark:text-slate-300">Min 25-35: Wire inference logic</span>
                    <span className="text-purple-600 dark:text-purple-400 font-mono font-bold">10m</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-transparent">
                    <span className="text-slate-700 dark:text-slate-300">Min 35-50: Build web UI / chat endpoint</span>
                    <span className="text-cyan-600 dark:text-cyan-400 font-mono font-bold">15m</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-transparent">
                    <span className="text-slate-700 dark:text-slate-300">Min 50-60: Run failure tests &amp; verify</span>
                    <span className="text-amber-600 dark:text-amber-400 font-mono font-bold">10m</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/compare?from_archetype=${selectedArchetype.id}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
              >
                <span>Score With My Constraints →</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── METRICS STRIP ───────────────────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 shadow-lg backdrop-blur-md">
          {METRICS.map((m, i) => (
            <div key={i} className="text-center p-2 space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight flex items-center justify-center">
                <AnimatedCounter target={m.value} />
                <span className="text-indigo-600 dark:text-cyan-400">{m.suffix}</span>
              </div>
              <strong className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 block">
                {m.label}
              </strong>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {m.subtext}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── THE THREE PILLARS (CLEAN & SPACIOUS) ────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            SYSTEM CAPABILITIES
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How Project Compass Protects Your Build
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Eliminating guesswork through deterministic scoring, ironclad architecture blueprints, and AI-powered peer stress-testing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILLARS.map((p, i) => (
            <div
              key={i}
              className="rounded-2xl p-7 bg-white dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.04] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between space-y-6 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-white/[0.05] border border-indigo-100 dark:border-white/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  {p.icon}
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {p.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {p.desc}
                </p>
              </div>

              <Link
                href={p.href}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition"
              >
                <span>{p.linkText}</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHATSAPP SPOTLIGHT BANNER ───────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="rounded-2xl p-8 sm:p-10 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-3.5 text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WHATSAPP CAMPUS BOT</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Evaluate Projects Directly on WhatsApp
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Message our WhatsApp bot from your phone to compare candidate ideas, generate full 60-minute build blueprints, and test edge-case traps on the go.
            </p>
            <div className="pt-2">
              <Link
                href="/whatsapp"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20"
              >
                <span>Launch WhatsApp Phone Simulator →</span>
              </Link>
            </div>
          </div>

          {/* Quick Chat Snippet Box */}
          <div className="w-full lg:w-80 rounded-xl p-4 bg-[#111b21] border border-white/10 shadow-xl space-y-2.5 font-sans text-left">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-xs">🧭</div>
              <div>
                <strong className="text-xs text-white block">Project Compass Bot</strong>
                <span className="text-[10px] text-emerald-400">online · Verified</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#202c33] text-xs text-slate-200 leading-relaxed">
              👋 Send me any project idea:
              <br />• <strong>compare: Idea 1 vs Idea 2</strong>
              <br />• <strong>contract: Idea</strong>
              <br />• <strong>break: Idea</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CALL TO ACTION ───────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto text-center space-y-5">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Ready to Build Your Final-Year Project?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
          Zero cloud bills. Zero GPU requirements. Build a verified, viva-defensible prototype in 60 minutes.
        </p>
        <div className="flex items-center justify-center gap-3.5 flex-wrap pt-2">
          <Link
            href="/compare"
            className="px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition"
          >
            <span>Start Feasibility Scan Free →</span>
          </Link>
          <Link
            href="/register"
            className="px-7 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-semibold text-sm transition"
          >
            <span>Register for Free Masterclass</span>
          </Link>
        </div>
      </section>

    </div>
  );
}
