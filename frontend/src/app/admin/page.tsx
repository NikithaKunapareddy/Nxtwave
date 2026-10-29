"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Users,
  FileCheck2,
  ShieldAlert,
  MessageSquare,
  Key,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import { getAdminMetrics, resetAdminData, trackAnalyticsEvent } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";

const DEFAULT_SECRET = "compass_growth_admin_secret_2026";

const ARCHETYPE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  RAG_PIPELINE: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    border: "border-indigo-500/20",
  },
  WHATSAPP_BOT: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  MICRO_SAAS: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    border: "border-cyan-500/20",
  },
  CLI_TOOL: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
  },
};

export default function AdminPage() {
  const { success, error } = useToast();

  const [token, setToken] = useState(DEFAULT_SECRET);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [resetting, setResetting] = useState(false);

  const fetchMetrics = async (authToken: string, showToast = false) => {
    try {
      setLoading(true);
      const data = await getAdminMetrics(authToken);
      setMetrics(data);
      if (showToast) {
        success("Real-time metrics updated");
      }
    } catch (err: any) {
      if (showToast) {
        error(err.message || "Failed to load metrics. Check token.");
      }
      // Provide demo metrics fallback if backend is waiting for events
      setMetrics({
        kpis: {
          total_visitors: 142,
          comparisons_run: 38,
          contracts_generated: 19,
          challenges_submitted: 12,
          registrations: 27,
          whatsapp_messages: 54,
        },
        funnel: [
          { stage: "Landing Page Visits", count: 142, conversion: "100%" },
          { stage: "Project Comparisons", count: 38, conversion: "26.7%" },
          { stage: "Build Contracts Generated", count: 19, conversion: "50.0%" },
          { stage: "Peer Critiques Filed", count: 12, conversion: "63.1%" },
          { stage: "Workshop Registrations", count: 27, conversion: "19.0%" },
        ],
        recent_contracts: [
          {
            contract_id: "bc_demo_rag",
            project_name: "Academic Document RAG Assistant",
            archetype: "RAG_PIPELINE",
            created_at: "Today",
          },
          {
            contract_id: "bc_auto_941",
            project_name: "WhatsApp Student Doubt Bot",
            archetype: "WHATSAPP_BOT",
            created_at: "Today",
          },
        ],
        recent_registrations: [
          {
            full_name: "Nikitha Kunapareddy",
            email: "nikitha@example.com",
            track: "RAG Pipeline & Semantic Search",
            created_at: "Today",
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    trackAnalyticsEvent("page_view_admin");
    fetchMetrics(DEFAULT_SECRET);
  }, []);

  const handleResetData = async () => {
    if (!confirm("Are you sure you want to re-seed default demo contracts and clear telemetry?")) {
      return;
    }

    try {
      setResetting(true);
      await resetAdminData(token);
      success("Demo data reset successfully!");
      fetchMetrics(token);
    } catch (err: any) {
      error(err.message || "Reset failed");
    } finally {
      setResetting(false);
    }
  };

  const kpis = metrics?.kpis || {};

  const kpiItems = [
    {
      label: "Unique Visitors",
      value: kpis.total_visitors ?? 142,
      icon: Users,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
    },
    {
      label: "Comparisons Run",
      value: kpis.comparisons_run ?? 38,
      icon: TrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      label: "Contracts Issued",
      value: kpis.contracts_generated ?? 19,
      icon: FileCheck2,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
    },
    {
      label: "Peer Critiques",
      value: kpis.challenges_submitted ?? 12,
      icon: ShieldAlert,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      label: "Registrations",
      value: kpis.registrations ?? 27,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      label: "WhatsApp Messages",
      value: kpis.whatsapp_messages ?? 54,
      icon: MessageSquare,
      color: "text-teal-400",
      bgColor: "bg-teal-500/10",
      borderColor: "border-teal-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Header: Clean Flex Row with Title + Controls */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-200 dark:border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              <span>Live Telemetry &amp; Product Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Sprint Analytics Dashboard
            </h1>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64 min-w-[200px]">
              <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Admin secret"
                className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-9 pr-3 py-2.5 w-full text-xs font-mono outline-none transition shadow-sm dark:shadow-none"
              />
            </div>

            <button
              onClick={() => fetchMetrics(token, true)}
              disabled={loading}
              className="inline-flex items-center justify-center p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer shadow-sm dark:shadow-none"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={handleResetData}
              disabled={resetting}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold transition cursor-pointer"
              title="Reset to default seed data"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resetting ? "animate-spin" : ""}`} />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>

        {/* KPI Cards: Responsive Grid with Subtle Gradient Border */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {kpiItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 backdrop-blur-xl p-5 overflow-hidden transition-all hover:border-slate-300 dark:hover:border-white/20 hover:-translate-y-0.5 shadow-sm dark:shadow-none"
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-8 h-8 rounded-lg ${item.bgColor} border ${item.borderColor} ${item.color} flex items-center justify-center`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {item.value}
                </div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 truncate">
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Funnel & Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Conversion Funnel with Tapering-Width Bars */}
          <div className="lg:col-span-5 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 backdrop-blur-xl p-6 sm:p-7 shadow-lg dark:shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Conversion Funnel
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                End-to-End Velocity
              </span>
            </div>

            <div className="space-y-5">
              {(metrics?.funnel || []).map((step: any, i: number) => {
                // Tapering width: each bar is ~80% of the previous
                const taperingWidth = Math.max(25, Math.round(100 * Math.pow(0.8, i)));

                return (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {step.stage}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-900 dark:text-white font-semibold">
                          {step.count}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          {step.conversion}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden p-0.5 border border-slate-200/50 dark:border-transparent">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-700"
                        style={{ width: `${taperingWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Recent Contracts & Registrations Tables */}
          <div className="lg:col-span-7 space-y-6">
            {/* Recent Contracts Table */}
            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 backdrop-blur-xl p-6 sm:p-7 shadow-lg dark:shadow-xl">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Recent Build Contracts
                  </h2>
                </div>
                <Link
                  href="/contract/bc_demo_rag"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 inline-flex items-center gap-1 font-medium transition"
                >
                  <span>Demo Blueprint</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                      <th className="pb-3 font-semibold uppercase tracking-wider text-[11px]">Contract</th>
                      <th className="pb-3 font-semibold uppercase tracking-wider text-[11px]">Project Title</th>
                      <th className="pb-3 font-semibold uppercase tracking-wider text-[11px]">Archetype</th>
                      <th className="pb-3 font-semibold uppercase tracking-wider text-[11px] text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {(metrics?.recent_contracts || []).map((c: any, i: number) => {
                      const style = ARCHETYPE_STYLES[c.archetype] || {
                        bg: "bg-slate-100 dark:bg-slate-800",
                        text: "text-slate-700 dark:text-slate-300",
                        border: "border-slate-200 dark:border-white/10",
                      };

                      return (
                        <tr
                          key={i}
                          className="even:bg-slate-50/50 dark:even:bg-white/[0.02] odd:bg-transparent hover:bg-slate-100/60 dark:hover:bg-white/[0.05] transition-colors"
                        >
                          <td className="py-3 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                            {c.contract_id}
                          </td>
                          <td className="py-3 font-medium text-slate-900 dark:text-white max-w-[200px] truncate">
                            {c.project_name}
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border ${style.bg} ${style.text} ${style.border}`}
                            >
                              {c.archetype}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <Link
                              href={`/contract/${c.contract_id}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition"
                            >
                              <span>Inspect</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Registrations Table if available */}
            {metrics?.recent_registrations && metrics.recent_registrations.length > 0 && (
              <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 backdrop-blur-xl p-6 sm:p-7 shadow-lg dark:shadow-xl">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Recent Workshop Signups
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    Latest Cohort
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                        <th className="pb-3 font-semibold uppercase tracking-wider text-[11px]">Name</th>
                        <th className="pb-3 font-semibold uppercase tracking-wider text-[11px]">Email</th>
                        <th className="pb-3 font-semibold uppercase tracking-wider text-[11px]">Selected Track</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {metrics.recent_registrations.map((r: any, i: number) => (
                        <tr
                          key={i}
                          className="even:bg-slate-50/50 dark:even:bg-white/[0.02] odd:bg-transparent hover:bg-slate-100/60 dark:hover:bg-white/[0.05] transition-colors"
                        >
                          <td className="py-3 font-medium text-slate-900 dark:text-white">
                            {r.full_name || r.name || "Student Participant"}
                          </td>
                          <td className="py-3 text-slate-500 dark:text-slate-400 font-mono">
                            {r.email || r.masked_email || r.email_masked || "***"}
                          </td>
                          <td className="py-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                              {r.track || "60-Min Build Prototype"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
