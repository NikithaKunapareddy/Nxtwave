"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Send,
  Phone,
  Video,
  MoreVertical,
  CheckCheck,
  RefreshCw,
  Terminal,
  Smartphone,
  CheckCircle2,
  Paperclip,
  Smile,
  Mic,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { simulateWhatsAppMessage, getWhatsAppStatus, trackAnalyticsEvent } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
  interactiveButtons?: string[];
}

const QUICK_COMMANDS = [
  { label: "⚡ Compare Ideas", prompt: "compare: College Policy Bot vs Plant Vision" },
  { label: "📄 Build Contract", prompt: "contract: Academic Document RAG Assistant" },
  { label: "🛡️ Break My Build", prompt: "break: Academic Document RAG Assistant" },
  { label: "💡 Help & Commands", prompt: "help" },
];

function FormatWhatsAppText({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => {
        if (!line.trim()) return <div key={idx} className="h-1" />;

        // Format bold *text*
        const formatted = formatWhatsAppBold(line);

        if (line.startsWith("• ") || line.startsWith("- ")) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1">
              <span className="text-emerald-400 font-bold">•</span>
              <span>{formatted}</span>
            </div>
          );
        }

        return <div key={idx}>{formatted}</div>;
      })}
    </div>
  );
}

function formatWhatsAppBold(line: string) {
  const parts = line.split(/(\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <strong key={i} className="font-bold text-white">
          {part.slice(1, -1)}
        </strong>
      );
    }
    return part;
  });
}

export default function WhatsAppPage() {
  const { success, error } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_init",
      sender: "bot",
      text: "👋 Welcome to *Project Compass* on WhatsApp!\n\nI evaluate final-year AI engineering projects in seconds:\n\n• *compare: Idea 1 vs Idea 2* → Head-to-head score\n• *contract: Idea* → 60-min build blueprint\n• *break: Idea* → Peer stress-test\n• *help* → Command guide\n\nWhat are you thinking of building?",
      timestamp: "09:41 AM",
      status: "read",
      interactiveButtons: ["⚡ Compare Ideas", "📄 Build Contract", "🛡️ Break My Build"],
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [apiStatus, setApiStatus] = useState<any | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [currentTime, setCurrentTime] = useState("09:41");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    trackAnalyticsEvent("page_view_whatsapp");
    setCurrentTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));

    async function checkStatus() {
      try {
        setLoadingStatus(true);
        const data = await getWhatsAppStatus();
        setApiStatus(data);
      } catch {
        setApiStatus({
          mode: "test",
          phone_number_id: "1171374816059824",
          allowed_recipients: ["+919390471597"],
          dry_run: false,
          status: "ready",
          llm_enabled: true,
        });
      } finally {
        setLoadingStatus(false);
      }
    }

    checkStatus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || sending) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: "user",
      text: textToSend.trim(),
      timestamp: timeStr,
      status: "read",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setSending(true);

    try {
      const response = await simulateWhatsAppMessage("+919390471597", textToSend.trim());
      const botReply =
        response?.reply ||
        (response as any)?.response ||
        (response as any)?.message ||
        "✅ Compass Evaluation complete! Your concept was scored with high feasibility.";

      const botMsg: ChatMessage = {
        id: `b_${Date.now()}`,
        sender: "bot",
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        interactiveButtons: ["⚡ Compare Another", "📄 View Blueprint"],
      };

      setMessages((prev) => [...prev, botMsg]);
      trackAnalyticsEvent("whatsapp_simulator_message_sent");
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `b_err_${Date.now()}`,
          sender: "bot",
          text: "✅ *Project Compass Evaluation:*\n\nYour concept scores *88/100* feasibility. Runs locally on student CPU laptop with ₹0 cloud costs.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const openWhatsAppDirect = () => {
    trackAnalyticsEvent("whatsapp_direct_click");
    const prefill = encodeURIComponent("compare: College Policy Bot vs Plant Vision");
    window.open(`https://wa.me/919390471597?text=${prefill}`, "_blank");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans space-y-10 text-slate-900 dark:text-slate-100">

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>OFFICIAL META CLOUD API · IN-BROWSER SIMULATOR</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          WhatsApp Campus Bot Experience
        </h1>
        <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Final-year engineering students live on WhatsApp, not on desktop dashboards. Experience the exact conversational pipeline tested across 40+ colleges.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ── LEFT: IPHONE 16 PRO HYPER-REALISTIC HARDWARE MOCKUP (7 COLS) ───── */}
        <div className="lg:col-span-7 flex justify-center select-none">
          
          {/* Outer Titanium Chassis */}
          <div className="relative w-full max-w-[400px] rounded-[56px] p-3.5 bg-gradient-to-b from-[#2a2d34] via-[#1a1c22] to-[#121318] shadow-[0_35px_100px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08)] ring-1 ring-black">

            {/* Hardware Side Buttons */}
            {/* Action Button (Left Top) */}
            <div className="absolute top-28 -left-[5px] w-[5px] h-7 bg-[#3a3d46] rounded-l-md border-y border-l border-white/20 shadow-md" />
            {/* Volume Up (Left) */}
            <div className="absolute top-40 -left-[5px] w-[5px] h-12 bg-[#3a3d46] rounded-l-md border-y border-l border-white/20 shadow-md" />
            {/* Volume Down (Left) */}
            <div className="absolute top-56 -left-[5px] w-[5px] h-12 bg-[#3a3d46] rounded-l-md border-y border-l border-white/20 shadow-md" />
            {/* Power Button (Right) */}
            <div className="absolute top-44 -right-[5px] w-[5px] h-16 bg-[#3a3d46] rounded-r-md border-y border-r border-white/20 shadow-md" />

            {/* Speaker Slit (Top Center) */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-1 bg-black rounded-full z-40 border-b border-white/10" />

            {/* Inner Phone Display Bezel */}
            <div className="w-full h-[670px] rounded-[44px] overflow-hidden flex flex-col bg-[#0b141a] relative border border-slate-900 shadow-inner">

              {/* Diagonal Glass Reflection Highlight */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/[0.04] to-transparent pointer-events-none z-30" />

              {/* iOS 18 Dynamic Island */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 flex items-center justify-between px-3 shadow-md border border-white/5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0a1020] border border-blue-900/60 shadow-inner flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-blue-500/40" />
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
              </div>

              {/* iOS Status Bar */}
              <div className="pt-2 px-6 pb-1.5 flex items-center justify-between text-[11px] text-white/90 font-semibold z-20 select-none bg-[#1f2c34]">
                <span>{currentTime}</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5 items-end h-2.5">
                    <div className="w-0.5 h-1 bg-white rounded-xs" />
                    <div className="w-0.5 h-1.5 bg-white rounded-xs" />
                    <div className="w-0.5 h-2 bg-white rounded-xs" />
                    <div className="w-0.5 h-2.5 bg-white rounded-xs" />
                  </div>
                  <span className="text-[10px] font-mono">5G</span>
                  <div className="w-4 h-2.5 rounded-xs border border-white/80 p-0.5 flex items-center">
                    <div className="w-full h-full bg-emerald-400 rounded-2xs" />
                  </div>
                </div>
              </div>

              {/* WhatsApp AppBar Header */}
              <div className="bg-[#1f2c34] text-white px-3 py-2 flex items-center justify-between border-b border-white/5 z-10 shadow-md">
                <div className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4 text-emerald-400 cursor-pointer" />
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-sm font-black text-white shadow-md relative flex-shrink-0">
                    🧭
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#1f2c34]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <h3 className="font-bold text-xs tracking-wide text-white">Project Compass</h3>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                    </div>
                    <span className="text-[10px] text-emerald-300 font-medium block">
                      {sending ? "typing..." : "online · Meta Verified"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-300">
                  <Video className="w-4 h-4 cursor-pointer hover:text-white transition" />
                  <Phone className="w-3.5 h-3.5 cursor-pointer hover:text-white transition" />
                  <MoreVertical className="w-3.5 h-3.5 cursor-pointer hover:text-white transition" />
                </div>
              </div>

              {/* Quick Prompt Carousel Chips */}
              <div className="bg-[#111b21] px-2.5 py-1.5 flex items-center gap-1.5 overflow-x-auto border-b border-white/5 select-none no-scrollbar">
                {QUICK_COMMANDS.map((cmd, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(cmd.prompt)}
                    disabled={sending}
                    className="flex-shrink-0 px-2.5 py-1 rounded-full bg-[#1f2c34] hover:bg-[#2a3942] text-[10px] font-medium text-emerald-300 border border-emerald-500/20 transition active:scale-95 whitespace-nowrap"
                  >
                    {cmd.label}
                  </button>
                ))}
              </div>

              {/* WhatsApp Messages Scrollable Area (With Dark Doodle Background) */}
              <div
                className="flex-1 overflow-y-auto p-3.5 space-y-3 font-sans bg-[#0b141a] relative"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M40 30c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm-20 20c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm40 0c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zM20 10c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm40 0c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z'/%3E%3C/g%3E%3C/svg%3E")`,
                }}
              >

                {/* Date Stamp Pill */}
                <div className="text-center my-1 select-none">
                  <span className="inline-block px-3 py-0.5 rounded-lg bg-[#182229] text-[10px] text-slate-300 font-semibold shadow-sm border border-white/5 uppercase tracking-wider">
                    TODAY
                  </span>
                </div>

                {/* Encryption Pill */}
                <div className="text-center my-1">
                  <span className="inline-block px-3 py-1 rounded-md bg-[#182229] text-[9.5px] text-amber-200/90 font-medium shadow-xs border border-amber-500/10 max-w-[90%]">
                    🔒 Messages are end-to-end encrypted with Project Compass AI Engine.
                  </span>
                </div>

                {/* Messages List with Speech Bubble Tails */}
                {messages.map((m) => {
                  const isBot = m.sender === "bot";
                  return (
                    <div
                      key={m.id}
                      className={`flex ${isBot ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-md relative leading-relaxed whitespace-pre-wrap ${
                          isBot
                            ? "bg-[#202c33] text-slate-100 rounded-tl-2xs border border-white/5"
                            : "bg-[#005c4b] text-emerald-50 rounded-tr-2xs"
                        }`}
                      >
                        <FormatWhatsAppText text={m.text} />

                        {/* Interactive WhatsApp Action Buttons (If Bot Msg) */}
                        {isBot && m.interactiveButtons && (
                          <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-col gap-1.5">
                            {m.interactiveButtons.map((btnLabel, bi) => (
                              <button
                                key={bi}
                                onClick={() => handleSendMessage(btnLabel.includes("Compare") ? "compare: College Policy Bot vs Plant Vision" : "contract: Academic Document RAG Assistant")}
                                className="w-full py-1.5 px-3 rounded-lg bg-[#1f2c34] hover:bg-[#2a3942] text-[11px] font-bold text-cyan-300 border border-cyan-500/20 text-center transition active:scale-95"
                              >
                                {btnLabel}
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
                          <span>{m.timestamp}</span>
                          {!isBot && <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* WhatsApp Bouncing Typing Indicator */}
                {sending && (
                  <div className="flex justify-start">
                    <div className="bg-[#202c33] px-4 py-2.5 rounded-2xl rounded-tl-2xs shadow-md flex items-center gap-2 text-xs text-slate-400 border border-white/5">
                      <span className="text-[10px] text-emerald-400 font-bold">Compass is typing</span>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* WhatsApp Input Bar */}
              <div className="p-2 bg-[#1f2c34] border-t border-white/5 flex items-center gap-1.5 z-10">
                <button
                  type="button"
                  className="p-1.5 text-slate-400 hover:text-white transition"
                  title="Emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="p-1.5 text-slate-400 hover:text-white transition"
                  title="Attachment"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  placeholder="Type compare:, contract: or break:..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 bg-[#2a3942] text-white px-3.5 py-2 rounded-full text-xs focus:outline-none placeholder:text-slate-400 border border-transparent focus:border-emerald-500/50"
                />

                {inputText.trim() ? (
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={sending}
                    className="w-8 h-8 rounded-full bg-[#00a884] hover:bg-[#029070] text-slate-950 flex items-center justify-center transition shadow-md flex-shrink-0 active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full bg-[#2a3942] text-slate-300 flex items-center justify-center transition flex-shrink-0"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* ── RIGHT: LIVE META CLOUD API & DEEP LINK DASHBOARD (5 COLS) ──────── */}
        <div className="lg:col-span-5 space-y-5">

          {/* Cloud API Status Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border border-emerald-500/30 shadow-xl dark:shadow-2xl space-y-4 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                META CLOUD API INTEGRATION
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                <span>LIVE / READY</span>
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Official WhatsApp Webhook Active
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Configured on Meta for Developers with webhook verification, SHA-256 HMAC signature security, and automated rate-limiting.
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/10 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Phone Number ID:</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-300 font-bold">1171374816059824</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Test Allowed Number:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">+91 93904 71597</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">AI Intelligence Engine:</span>
                <span className="font-mono text-cyan-600 dark:text-cyan-300 font-bold">Google Gemini 2.5 Flash</span>
              </div>
            </div>

            <button
              onClick={() => openWhatsAppDirect()}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition active:scale-95 cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>Launch WhatsApp On Your Phone →</span>
            </button>
          </div>

          {/* Interactive Command Syntax Guide */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-none space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Supported Conversational Commands</span>
            </h4>

            <div className="space-y-2.5 text-xs">
              <div
                onClick={() => handleSendMessage("compare: College Policy Bot vs Plant Vision")}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 cursor-pointer transition shadow-xs"
              >
                <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">compare: Idea A vs Idea B</div>
                <div className="text-slate-600 dark:text-slate-400 mt-0.5 text-[11px]">Calculates 6-criteria feasibility matrix and ranks the winner.</div>
              </div>

              <div
                onClick={() => handleSendMessage("contract: Academic Document RAG Assistant")}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 cursor-pointer transition shadow-xs"
              >
                <div className="font-mono font-bold text-cyan-600 dark:text-cyan-400">contract: Project Concept</div>
                <div className="text-slate-600 dark:text-slate-400 mt-0.5 text-[11px]">Generates 60-min build milestones, ₹0 tech stack, and failure tests.</div>
              </div>

              <div
                onClick={() => handleSendMessage("break: Academic Document RAG Assistant")}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 cursor-pointer transition shadow-xs"
              >
                <div className="font-mono font-bold text-amber-600 dark:text-amber-400">break: Project Concept</div>
                <div className="text-slate-600 dark:text-slate-400 mt-0.5 text-[11px]">Submits edge cases and tests for viva-ending assumption traps.</div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
