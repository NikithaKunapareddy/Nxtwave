import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, EyeOff, MessageSquare, ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-8 transition group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Home</span>
        </Link>

        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 backdrop-blur-xl shadow-xl dark:shadow-2xl overflow-hidden">
          {/* Header with subtle gradient background */}
          <div className="p-8 sm:p-12 border-b border-slate-200 dark:border-white/10 bg-gradient-to-br from-indigo-50/70 via-white to-transparent dark:from-indigo-950/40 dark:via-slate-900/50 dark:to-transparent relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Data Transparency Guarantee</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
              Privacy &amp; Messaging Policy
            </h1>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Last updated: October 2026 • NxtWave 48-Hour Engineering Sprint
            </p>
          </div>

          {/* Policy Sections */}
          <div className="p-8 sm:p-12 space-y-10 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {/* Section 1 */}
            <section className="space-y-3">
              <div className="border-l-2 border-emerald-500 dark:border-emerald-400 pl-4 py-0.5">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <span>WhatsApp Cloud API Policy</span>
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm pl-4">
                Project Compass adheres strictly to Meta&apos;s Business Messaging guidelines.
                Our sandbox and production instances operate under the following rules:
              </p>
              <ul className="list-disc pl-9 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <strong className="text-slate-900 dark:text-slate-200">Zero Unsolicited Outreach:</strong> We will never send unprompted marketing or cold
                  outreach messages. Messages are sent solely in direct response to user-initiated queries.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-slate-200">Allowed Recipients Whitelist:</strong> While in developer test mode, messages are
                  exclusively sent to verified test numbers registered in the Meta Developer Console.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-slate-200">24-Hour Messaging Window:</strong> All automated interactions respect the standard
                  24-hour customer service window mandated by Meta.
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <div className="border-l-2 border-indigo-500 dark:border-indigo-400 pl-4 py-0.5">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <span>Telemetry &amp; Data Storage</span>
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm pl-4">
                When you submit candidate project concepts, generate contracts, or file peer critiques:
              </p>
              <ul className="list-disc pl-9 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <strong className="text-slate-900 dark:text-slate-200">No Proprietary Code Is Stored:</strong> Project Compass only accepts high-level concept
                  summaries, target audiences, and tech stacks. We never request or store source code.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-slate-200">Local / Encrypted Persistence:</strong> Contracts and evaluations are stored in our SQLite
                  database instance or Supabase Postgres instance protected by environment credentials.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-slate-200">Anonymized Growth Metrics:</strong> Funnel conversions and telemetry are tracked for
                  sprint evaluation purposes without third-party ad tracker pixels.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <div className="border-l-2 border-cyan-500 dark:border-cyan-400 pl-4 py-0.5">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <EyeOff className="w-3.5 h-3.5" />
                  </div>
                  <span>Open Source &amp; Rights</span>
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm pl-4">
                Project Compass is released under the permissive MIT Open Source license.
                You retain 100% intellectual property rights over any project concept, build blueprint,
                or product created using this platform.
              </p>
            </section>
          </div>

          {/* Footer Bar */}
          <div className="px-8 sm:px-12 py-5 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>Project Compass • Built with Next.js, TypeScript &amp; FastAPI</span>
            <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-semibold transition">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
