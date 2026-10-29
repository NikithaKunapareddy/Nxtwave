import React from "react";
import Link from "next/link";
import { Compass, ExternalLink, Heart, ShieldCheck, Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#070a12]/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Compass className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                Project <span className="gradient-text">Compass</span>
              </span>
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              The deterministic decision matrix for software engineering. Choose, test, and prove your engineering ideas before committing to a 48-hour build.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>FastAPI 8000 Engine Active</span>
              </div>
            </div>
          </div>

          {/* Sprints & Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-4">
              Sprint Tools
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/compare" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Idea Comparison Matrix
                </Link>
              </li>
              <li>
                <Link href="/contract/bc_demo_rag" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  60-Minute Build Contract
                </Link>
              </li>
              <li>
                <Link href="/challenge/bc_demo_rag" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Break My Build Challenge
                </Link>
              </li>
              <li>
                <Link href="/whatsapp" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  WhatsApp Bot Simulator
                </Link>
              </li>
            </ul>
          </div>

          {/* Developers & APIs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-4">
              Engine & API
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href={process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "")}/docs` : "/docs"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  <span>FastAPI Swagger</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href={process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "")}/redoc` : "/redoc"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  <span>API ReDoc</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <Link href="/admin" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Growth & Analytics
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Privacy & Data Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Challenge Track */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-4">
              NxtWave Growth 2026
            </h4>
            <div className="flex flex-col gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>48-Hour Build Spec</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                  Built for the NxtWave Growth Intern Challenge. 54 tests passing.
                </p>
              </div>
              <Link
                href="/register"
                className="w-full text-center py-2 px-3 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition border border-indigo-200/60 dark:border-indigo-800/60"
              >
                Register for Workshop
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© 2026 Project Compass. Open-source under MIT License.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Strict Privacy Guard</span>
            </span>
            <span>•</span>
            <span>Zero Unsolicited WhatsApp Messages</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
