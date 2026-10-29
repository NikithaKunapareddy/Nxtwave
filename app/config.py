import os
from pathlib import Path
from typing import Optional, List

# Base directory of the repository
BASE_DIR = Path(__file__).resolve().parent.parent

def load_dotenv(env_path: Path):
    """Simple zero-dependency .env parser."""
    if not env_path.exists():
        return
    try:
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip("'\"")
                if k not in os.environ:
                    os.environ[k] = v
    except Exception:
        pass

# Load .env if present
load_dotenv(BASE_DIR / ".env")

class Settings:
    """Application Settings for Project Compass."""
    APP_NAME: str = "Project Compass"
    APP_TAGLINE: str = "Choose. Test. Prove."
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = os.getenv("APP_ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./local_compass.db")

    # Supabase Cloud Database Configuration
    USE_SUPABASE: bool = os.getenv("USE_SUPABASE", "True").lower() in ("true", "1", "yes")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "").strip()
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "").strip()
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "").strip()
    SUPABASE_SECRET_KEY: str = os.getenv("SUPABASE_SECRET_KEY", "").strip()
    SUPABASE_PUBLISHABLE_KEY: str = os.getenv("SUPABASE_PUBLISHABLE_KEY", "").strip()

    @property
    def supabase_configured(self) -> bool:
        return bool(self.USE_SUPABASE and self.SUPABASE_URL and self.SUPABASE_KEY)

    # Security
    ADMIN_TOKEN: str = os.getenv("ADMIN_TOKEN", "compass_growth_admin_secret_2026")

    # Workshop Destination:
    # If empty, runs in Mode B (Local Demonstration Mode)
    # If set, runs in Mode A (External NxtWave Workshop Page)
    WORKSHOP_REGISTRATION_URL: str = os.getenv("WORKSHOP_REGISTRATION_URL", "").strip()

    # Optional AI Integration (Zero cost default is False)
    ENABLE_OPTIONAL_LLM: bool = os.getenv("ENABLE_OPTIONAL_LLM", "False").lower() in ("true", "1", "yes")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "gemini").strip().lower()
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", "").strip() or None
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-4o-mini").strip()
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", "").strip() or None
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()

    # ===========================================================================
    # META WHATSAPP CLOUD API CONFIGURATION
    # mode: "local_simulation" | "test" | "production"
    #   local_simulation → zero network calls; full UI works, logs simulated msgs
    #   test             → sends real messages only to WHATSAPP_ALLOWED_RECIPIENTS
    #   production       → full access; disabled by default, requires explicit opt-in
    # ===========================================================================
    WHATSAPP_MODE: str = os.getenv("WHATSAPP_MODE", "local_simulation").strip().lower()
    # Legacy compatibility flag — derived from WHATSAPP_MODE
    @property
    def WHATSAPP_DRY_RUN(self) -> bool:
        return self.WHATSAPP_MODE == "local_simulation"

    WHATSAPP_VERIFY_TOKEN: str = os.getenv("WHATSAPP_VERIFY_TOKEN", "compass_whatsapp_webhook_token_2026")
    WHATSAPP_ACCESS_TOKEN: Optional[str] = os.getenv("WHATSAPP_ACCESS_TOKEN", "").strip() or None
    WHATSAPP_PHONE_NUMBER_ID: Optional[str] = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "").strip() or None
    WHATSAPP_API_VERSION: str = os.getenv("WHATSAPP_API_VERSION", "v21.0").strip()

    # Comma-separated E.164 numbers authorised to receive test messages
    WHATSAPP_ALLOWED_RECIPIENTS_RAW: str = os.getenv("WHATSAPP_ALLOWED_RECIPIENTS", "").strip()
    @property
    def WHATSAPP_ALLOWED_RECIPIENTS(self) -> List[str]:
        if not self.WHATSAPP_ALLOWED_RECIPIENTS_RAW:
            return []
        return [r.strip() for r in self.WHATSAPP_ALLOWED_RECIPIENTS_RAW.split(",") if r.strip()]

    # Meta App Secret for HMAC-SHA256 webhook signature validation
    META_APP_SECRET: Optional[str] = os.getenv("META_APP_SECRET", "").strip() or None

    # Public base URL (required for ngrok/cloud webhook registration)
    PUBLIC_BASE_URL: str = os.getenv("PUBLIC_BASE_URL", "http://127.0.0.1:8000").strip()

    # Frontend URL (e.g. deployed Vercel URL: https://project-compass.vercel.app)
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "").strip()

    # Allowed CORS origins (comma-separated, e.g. https://my-frontend.vercel.app,http://localhost:3000)
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "").strip()

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

    @property
    def has_external_workshop(self) -> bool:
        return bool(self.WORKSHOP_REGISTRATION_URL and self.WORKSHOP_REGISTRATION_URL.startswith("http"))

    @property
    def whatsapp_graph_url(self) -> str:
        return f"https://graph.facebook.com/{self.WHATSAPP_API_VERSION}/{self.WHATSAPP_PHONE_NUMBER_ID}/messages"

    @property
    def whatsapp_ready(self) -> bool:
        """True when real API credentials are configured."""
        return bool(
            self.WHATSAPP_ACCESS_TOKEN
            and self.WHATSAPP_PHONE_NUMBER_ID
            and self.WHATSAPP_MODE in ("test", "production")
        )

settings = Settings()
