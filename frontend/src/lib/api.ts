// Frontend API Client for Project Compass

const LIVE_RENDER_BACKEND = "https://nxtwave-ttys.onrender.com";

export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.trim().replace(/\/+$/, "");
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    // In production or on Vercel preview/production, connect directly to live Render backend
    if (host !== "localhost" && host !== "127.0.0.1") {
      return LIVE_RENDER_BACKEND;
    }
  }
  return "";
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const baseUrl = getApiBaseUrl();
  const url = endpoint.startsWith("http")
    ? endpoint
    : baseUrl
    ? `${baseUrl}${path}`
    : path;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let errorDetail = "An unexpected error occurred";
    try {
      const errorJson = await response.json();
      if (typeof errorJson.detail === "string") {
        errorDetail = errorJson.detail;
      } else if (Array.isArray(errorJson.detail)) {
        errorDetail = errorJson.detail.map((d: any) => d.msg || JSON.stringify(d)).join(", ");
      } else {
        errorDetail = errorJson.message || JSON.stringify(errorJson);
      }
    } catch {
      errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

// Compare 2-3 project ideas
export async function compareIdeas(ideas: {
  name: string;
  description: string;
  target_audience?: string;
  tech_stack?: string[];
  track?: string;
}[]) {
  const payload = {
    domain: "AI/ML",
    experience: "intermediate",
    languages: ["Python", "JavaScript"],
    time_weeks: 4,
    team_size: 1,
    candidates: ideas.map((idea) => ({
      title: idea.name,
      description: idea.description,
    })),
  };

  const res = await apiRequest<any>("/api/projects/compare", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const bestProject = res.recommended_project || res.all_scored_projects?.[0];

  return {
    comparison_id: res.comparison_id,
    winner: {
      name: bestProject?.title || ideas[0].name,
      overall_score: Math.round(bestProject?.composite_score || 88),
      reasoning: bestProject?.strongest_reason || res.scoring_weights_explanation || "Strong balance of technical feasibility and 48-hour scope viability.",
      archetype: bestProject?.category || "RAG_PIPELINE",
      target_audience: "Engineering teams & developers",
    },
    evaluations: (res.all_scored_projects || []).map((p: any) => ({
      name: p.title,
      feasibility_score: Math.round(p.composite_score || 85),
      uniqueness_score: Math.round((p.criteria?.find((c: any) => c.name === "uniqueness")?.score || 8) * 10),
      market_score: Math.round((p.criteria?.find((c: any) => c.name === "practical_utility")?.score || 8.5) * 10),
      strengths: [p.strongest_reason || p.mvp_summary || "Clear modular architecture."],
      blindspots: [p.largest_risk || "Watch out for scope creep in the 48-hour build window."],
    })),
    recommendations: bestProject?.technical_challenges || [],
  };
}

// Generate Build Contract
export async function generateContract(payload: {
  project_name: string;
  archetype?: string;
  target_audience?: string;
  key_assumptions?: string[];
  first_hour_milestone?: string;
  out_of_scope?: string[];
  suggested_stack?: Record<string, string>;
  comparison_id?: string;
}) {
  const body = {
    selected_project_title: payload.project_name,
    selected_project_description: payload.first_hour_milestone
      ? `Goal: ${payload.first_hour_milestone}. Target Audience: ${payload.target_audience || "Engineers"}`
      : "A high-impact 48-hour build prototype with verifiable milestones.",
    domain: "AI/ML",
    experience: "intermediate",
    languages: ["Python"],
    comparison_id: payload.comparison_id,
  };

  return apiRequest<any>("/api/contracts", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// Get Build Contract
export async function getContract(contractId: string) {
  const data = await apiRequest<any>(`/api/contracts/${contractId}`);

  return {
    contract_id: data.contract_id,
    project_name: data.project_title || data.project_name || "AI Build Blueprint",
    project_title: data.project_title || data.project_name || "AI Build Blueprint",
    feasibility_score: data.feasibility_score || 88,
    original_idea: data.original_idea || "",
    archetype: data.category || data.archetype || "RAG_PIPELINE",
    category: data.category || "AI/ML",
    difficulty: data.difficulty || "Intermediate",
    target_audience: data.target_audience || "Developers & Student Engineers",
    critical_assumption: data.critical_assumption || "The user assumes core dependencies and APIs will operate with zero network latency and perfect schema compliance.",
    failure_scenarios: data.failure_scenarios || [],
    mvp_features: data.mvp_features || [],
    deferred_features: data.deferred_features || [],
    plan_60min: data.plan_60min || [],
    immediate_action: data.immediate_action || "Create a new git repository and scaffold the FastAPI CPU endpoint.",
    peer_challenge_prompt: data.peer_challenge_prompt || "Can you identify any architectural bottleneck or edge-case failure trap in this 48-hour build specification?",
    first_hour_milestone: data.immediate_action || data.first_hour_milestone || "Working API prototype verified with test",
    key_assumptions: data.failure_scenarios && data.failure_scenarios.length > 0
      ? data.failure_scenarios.map((f: any) => `${f.test_name}: ${f.what_is_tested}`)
      : (data.key_assumptions || ["Core value demonstrated in 3 steps", "Latency stays under 500ms", "Zero migration lock"]),
    out_of_scope: data.deferred_features && data.deferred_features.length > 0
      ? data.deferred_features
      : (data.out_of_scope || [
          "Custom authentication & multi-tenant permissions",
          "Production payment gateways & subscriptions",
          "Non-essential third-party integrations",
        ]),
    suggested_stack: {
      frontend: data.frontend_rec || "Next.js 14 + Tailwind CSS",
      backend: data.backend_rec || "FastAPI + Pydantic v2",
      ai_model: data.ai_model_rec || "Local CPU Embeddings (all-MiniLM-L6-v2)",
      database: data.db_rec || "SQLite / PostgreSQL",
      tech_reasoning: data.tech_reasoning || "Zero cloud dependencies, runs natively on CPU with zero paid subscription costs.",
      required_data: data.required_data || "Local sample dataset or public open-access corpus.",
    },
    frontend_rec: data.frontend_rec || "Next.js / HTML5 Chat Interface",
    backend_rec: data.backend_rec || "FastAPI + Pydantic v2",
    ai_model_rec: data.ai_model_rec || "Sentence-Transformers on CPU",
    db_rec: data.db_rec || "SQLite (Local ₹0)",
    challenges: data.challenges || [],
    created_at: data.created_at,
  };
}

// Submit Break My Build challenge
export async function submitChallenge(
  contractId: string,
  payload: {
    challenger_name: string;
    challenger_role?: string;
    challenge_type: string;
    critique: string;
    suggested_fix?: string;
  }
) {
  const body = {
    peer_name: payload.challenger_name || "Anonymous Peer",
    challenge_text: payload.critique,
    why_it_matters: `Attack Vector: ${payload.challenge_type}`,
    improvement_suggestion: payload.suggested_fix || undefined,
  };

  return apiRequest<any>(`/api/contracts/${contractId}/challenges`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// Register for Demo Day workshop
export async function registerWorkshop(payload: {
  full_name: string;
  email: string;
  phone_whatsapp?: string;
  track?: string;
  github_handle?: string;
}) {
  const body = {
    name: payload.full_name,
    email: payload.email,
    phone: payload.phone_whatsapp,
    college: payload.track || "NxtWave Sprint 2026",
    year_of_study: 4,
  };

  return apiRequest<any>("/api/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// Track growth event
export async function trackAnalyticsEvent(
  eventType: string,
  payload: Record<string, any> = {}
) {
  try {
    return await apiRequest<any>("/api/analytics/event", {
      method: "POST",
      body: JSON.stringify({
        event_type: eventType,
        payload,
      }),
    });
  } catch {
    // Silent fail for background telemetry
    return null;
  }
}

// Admin Metrics
export async function getAdminMetrics(token: string) {
  return apiRequest<any>(`/api/admin/metrics?token=${encodeURIComponent(token)}`);
}

// Reset Demo Data
export async function resetAdminData(token: string) {
  return apiRequest<any>(`/api/admin/reset?token=${encodeURIComponent(token)}`, {
    method: "POST",
  });
}

// WhatsApp Simulator
export async function simulateWhatsAppMessage(
  fromNumber: string,
  text: string
) {
  const data = await apiRequest<any>("/api/whatsapp/simulate", {
    method: "POST",
    body: JSON.stringify({
      message: text,
      sender_name: "Campus Student",
      domain: "AI/ML",
      experience: "intermediate",
    }),
  });

  return {
    reply: data.reply_text,
    contract_url: data.contract_url,
    workshop_cta: data.workshop_cta,
  };
}

// WhatsApp Status
export async function getWhatsAppStatus() {
  return apiRequest<any>("/api/whatsapp/status");
}

// Interactive AI Chat with Project Build Contract
export async function chatWithContract(
  contractId: string,
  message: string,
  peerName: string = "Classmate"
) {
  return apiRequest<{
    reply: string;
    is_critique: boolean;
    model_used?: string;
    status: string;
  }>(`/api/contracts/${contractId}/challenges/chat`, {
    method: "POST",
    body: JSON.stringify({ message, peer_name: peerName }),
  });
}
