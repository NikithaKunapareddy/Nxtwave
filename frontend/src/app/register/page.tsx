"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  UserCheck,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Terminal,
  Zap,
  Award,
  Calendar,
  Users,
} from "lucide-react";
import confetti from "canvas-confetti";
import { registerWorkshop, trackAnalyticsEvent } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";

const TRACKS = [
  "RAG Pipeline & Semantic Search",
  "WhatsApp Conversational Agent",
  "Micro-SaaS & Workflow Automation",
  "Developer CLI & Code Tooling",
  "Real-Time Collaborative WebSockets",
  "Browser Extensions & AI Copilots",
];

export default function RegisterPage() {
  const { success, error } = useToast();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+91");
  const [github, setGithub] = useState("");
  const [track, setTrack] = useState(TRACKS[0]);

  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState<any | null>(null);
  const [contractId, setContractId] = useState<string | null>(null);

  useEffect(() => {
    trackAnalyticsEvent("page_view_register");
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cid = params.get("contract_id");
      if (cid) setContractId(cid);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim()) {
      error("Please provide both your name and email.");
      return;
    }

    try {
      setLoading(true);
      const res = await registerWorkshop({
        full_name: fullName.trim(),
        email: email.trim(),
        phone_whatsapp: phone.trim() !== "+91" ? phone.trim() : undefined,
        track,
        github_handle: github.trim() || undefined,
      });

      setRegistered(res);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      success("Registration complete! Welcome to the 48-Hour Sprint.");
      trackAnalyticsEvent("workshop_registered", { email: email.trim(), track });
    } catch (err: any) {
      error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-4 backdrop-blur-sm">
            <UserCheck className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>Interactive Engineering Sprint</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 dark:from-white dark:via-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              Build Your First AI Project
            </span>
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Turn your 60-Minute Build Contract into a fully functional, deployed prototype alongside
            senior NxtWave engineers at zero cloud cost.
          </p>
        </div>

        {registered ? (
          /* Full Page Success Card */
          <div className="max-w-2xl mx-auto animate-in zoom-in-95 fade-in-50 duration-400">
            <div className="rounded-3xl border border-emerald-500/30 bg-white dark:bg-slate-900/70 backdrop-blur-2xl p-8 sm:p-12 text-center shadow-xl dark:shadow-2xl relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-emerald-500 before:via-cyan-400 before:to-indigo-500">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-6 border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                Seat Confirmed
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
                You&apos;re Officially Registered!
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto leading-relaxed">
                Welcome to the cohort, <strong className="text-slate-900 dark:text-white">{fullName}</strong>. Your workshop seat
                and build contract have been recorded.
              </p>

              {/* Confirmation Details Card */}
              <div className="rounded-2xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 p-5 text-left space-y-3 mb-8">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400">Builder</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{fullName}</span>
                </div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400">Email Address</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{email}</span>
                </div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400">Track Chosen</span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">{track}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Registration ID</span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {registered.registration_id || "REG_" + Math.random().toString(36).substring(2, 8).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Next steps checklist */}
              <div className="text-left space-y-2 mb-8 bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 p-4 rounded-xl">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                  What Happens Next
                </span>
                <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Calendar invite and session link emailed to your inbox.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>WhatsApp sprint broadcast link sent 24h before kickoff.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Prerequisites: Modern browser, GitHub account, Node 18+ or Python 3.10+.</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/compare"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/25"
                >
                  Start Project Comparison
                </Link>
                <Link
                  href="/contract/bc_demo_rag"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200 font-semibold text-sm transition"
                >
                  Inspect Reference Blueprint
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Two-Column Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8 shadow-xl dark:shadow-2xl relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-indigo-500 before:via-purple-500 before:to-cyan-400">
                
                {/* Linked Plan Pill */}
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3 flex-wrap mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      Build Readiness: 88/100 · 60-Minute Blueprint Ready
                    </span>
                  </div>
                  {contractId && (
                    <Link
                      href={`/contract/${contractId}`}
                      className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 underline"
                    >
                      View Blueprint ({contractId})
                    </Link>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Chen"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 w-full text-sm outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="name@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 w-full text-sm outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                        WhatsApp Phone
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 w-full text-sm outline-none transition font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                        GitHub Profile
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. username or profile URL"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 w-full text-sm outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                        Sprint Track
                      </label>
                      <select
                        value={track}
                        onChange={(e) => setTrack(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 w-full text-sm outline-none transition cursor-pointer"
                      >
                        {TRACKS.map((t) => (
                          <option key={t} value={t} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Securing Your Spot...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-indigo-200" />
                          <span>Confirm My Registration</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 text-center pt-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    <span>No spam guarantee. Meta Cloud API compliant communication only.</span>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Benefits & Social Proof */}
            <div className="lg:col-span-5 space-y-4">
              {/* Benefit Card 1 */}
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 backdrop-blur-xl p-5 transition hover:border-slate-300 dark:hover:border-white/20 shadow-sm dark:shadow-none">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                      Live 60-Minute Build Session
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Follow structured milestones to take your selected architecture from blank slate
                      to verifiable API endpoints without stalling on setup.
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefit Card 2 */}
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 backdrop-blur-xl p-5 transition hover:border-slate-300 dark:hover:border-white/20 shadow-sm dark:shadow-none">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                      Zero-Cost Cloud &amp; Sandboxes
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Pre-wired LLM sandboxes and temporary database environments let you build, test,
                      and demo without personal credit cards or cloud bills.
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefit Card 3 */}
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 backdrop-blur-xl p-5 transition hover:border-slate-300 dark:hover:border-white/20 shadow-sm dark:shadow-none">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                      Verified Proof of Work
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Earn a cryptographically signed Build Certificate and clean GitHub proof-of-work
                      to feature on your engineering portfolio.
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Proof Mini Panel */}
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-indigo-50/70 to-white dark:from-indigo-950/20 dark:to-slate-900/60 backdrop-blur-xl p-5 shadow-sm dark:shadow-none">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">Cohort Status</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    Active Registration
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Join hundreds of engineers who chose, benchmarked, and verified their architectures
                  before writing code.
                </p>
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Next Sprint Kickoff: This Weekend</span>
                  </span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">Free Access</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
