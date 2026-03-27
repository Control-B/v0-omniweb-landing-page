"""
app/routers/legacy.py
──────────────────────
Backward-compatible endpoints that the existing Node.js backend calls.

  POST /assistant/respond
  POST /assistant/automate

These are preserved exactly as-is from the v0 orchestrator so the
Node backend (services/backend) requires zero changes during migration.
All logic is self-contained here; as the new platform matures these
routes will be thin wrappers over the v1 conversation service.
"""

from __future__ import annotations

import logging
from typing import Literal

import httpx
from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────

class LegacyChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str


class LegacyAssistantAction(BaseModel):
    type: Literal["navigate", "support", "lead"]
    label: str
    href: str
    service: str | None = None
    intent: str | None = None
    summary: str | None = None


class LegacyAssistantRequest(BaseModel):
    messages: list[LegacyChatMessage] = Field(default_factory=list)
    mode: Literal["text", "voice"] = "text"
    current_path: str | None = None


class LegacyAutomationRequest(BaseModel):
    message: str
    mode: Literal["text", "voice"] = "voice"
    current_path: str | None = None


class LegacyAssistantResponse(BaseModel):
    content: str
    actions: list[LegacyAssistantAction] = Field(default_factory=list)


# ── Page navigation rule table ────────────────────────────────────────────────

_PAGE_RULES: list[dict] = [
    {"keywords": ["home", "homepage", "home page", "landing page", "main page", "main website"],
     "action": LegacyAssistantAction(type="navigate", label="Open Home", href="/", summary="Opening the home page now.")},
    {"keywords": ["faq", "faqs", "frequently asked questions", "pricing faq"],
     "action": LegacyAssistantAction(type="navigate", label="Open FAQ Section", href="/pricing#faq", summary="Opening the FAQ section now.")},
    {"keywords": ["pricing plans", "plans section", "pricing section", "plans"],
     "action": LegacyAssistantAction(type="navigate", label="Open Plans Section", href="/pricing#plans", summary="Opening the plans section now.")},
    {"keywords": ["industry solutions", "solution types", "solutions section"],
     "action": LegacyAssistantAction(type="navigate", label="Open Industry Solutions Section", href="/solutions#industry-solutions", summary="Opening the industry solutions section now.")},
    {"keywords": ["features", "features section", "ai features"],
     "action": LegacyAssistantAction(type="navigate", label="Open Features Section", href="/solutions#features", summary="Opening the features section now.")},
    {"keywords": ["how it works", "process", "steps"],
     "action": LegacyAssistantAction(type="navigate", label="Open How It Works Section", href="/solutions#how-it-works", summary="Opening the how-it-works section now.")},
    {"keywords": ["testimonials", "reviews", "customer stories", "results"],
     "action": LegacyAssistantAction(type="navigate", label="Open Testimonials Section", href="/solutions#testimonials", summary="Opening the testimonials section now.")},
    {"keywords": ["solution", "solutions", "service", "services", "what you offer", "offerings"],
     "action": LegacyAssistantAction(type="navigate", label="Open Solutions", href="/solutions", summary="Showing the Solutions page so you can explore Omniweb service options.")},
    {"keywords": ["pricing", "price", "cost", "plan", "plans", "packages"],
     "action": LegacyAssistantAction(type="navigate", label="Open Pricing", href="/pricing", summary="Opening the Pricing page to compare plans and features.")},
    {"keywords": ["template categories", "categories", "template filter"],
     "action": LegacyAssistantAction(type="navigate", label="Open Template Categories", href="/templates#categories", summary="Opening the template categories section now.")},
    {"keywords": ["template grid", "template list", "browse templates"],
     "action": LegacyAssistantAction(type="navigate", label="Open Template Grid", href="/templates#template-grid", summary="Opening the template grid now.")},
    {"keywords": ["custom design", "custom template", "bespoke design"],
     "action": LegacyAssistantAction(type="navigate", label="Open Custom Design Section", href="/templates#custom-design", summary="Opening the custom design section now.")},
    {"keywords": ["template", "templates", "design", "example", "examples", "layouts"],
     "action": LegacyAssistantAction(type="navigate", label="Open Templates", href="/templates", summary="Opening the Templates page so you can browse layouts and categories.")},
    {"keywords": ["resource library", "browse library"],
     "action": LegacyAssistantAction(type="navigate", label="Open Resource Library", href="/resources#library", summary="Opening the resource library section now.")},
    {"keywords": ["articles", "featured articles", "blog articles", "case studies section"],
     "action": LegacyAssistantAction(type="navigate", label="Open Articles Section", href="/resources#articles", summary="Opening the articles section now.")},
    {"keywords": ["video library", "videos section", "popular videos"],
     "action": LegacyAssistantAction(type="navigate", label="Open Videos Section", href="/resources#videos", summary="Opening the videos section now.")},
    {"keywords": ["newsletter", "subscribe", "newsletter signup"],
     "action": LegacyAssistantAction(type="navigate", label="Open Newsletter Section", href="/resources#newsletter", summary="Opening the newsletter section now.")},
    {"keywords": ["resource", "resources", "case study", "case studies", "guide", "guides", "learn", "docs", "blog", "videos", "video library", "knowledge hub"],
     "action": LegacyAssistantAction(type="navigate", label="Open Resources", href="/resources", summary="Opening the Resources page for guides, videos, and case studies.")},
    {"keywords": ["company", "about", "about us", "team"],
     "action": LegacyAssistantAction(type="navigate", label="Open Company", href="/company", summary="Opening the Company page so you can learn more about Omniweb.")},
    {"keywords": ["contact", "contact us", "get in touch", "sales", "talk to sales", "company contact"],
     "action": LegacyAssistantAction(type="navigate", label="Open Company Contact", href="/company#contact", summary="Opening the Company contact section so you can talk to the team.")},
    {"keywords": ["careers", "career", "jobs", "job openings", "open positions", "hiring"],
     "action": LegacyAssistantAction(type="navigate", label="Open Careers Section", href="/company#careers", summary="Opening the careers section so you can review roles and openings.")},
    {"keywords": ["start", "trial", "sign up", "get started", "onboard", "onboarding"],
     "action": LegacyAssistantAction(type="lead", label="Go To Get Started", href="/get-started", summary="Opening the Get Started page so you can begin the onboarding flow.")},
    {"keywords": ["sign in", "log in", "login", "account login"],
     "action": LegacyAssistantAction(type="navigate", label="Open Sign In", href="/signin", summary="Opening the Sign In page now.")},
    {"keywords": ["dashboard", "my dashboard", "account dashboard"],
     "action": LegacyAssistantAction(type="navigate", label="Open Dashboard", href="/dashboard", summary="Opening the Dashboard page now.")},
    {"keywords": ["admin", "admin page", "admin panel"],
     "action": LegacyAssistantAction(type="navigate", label="Open Admin", href="/admin", summary="Opening the Admin page now.")},
]

_SUPPORT_KEYWORDS = ["support", "billing", "account", "login", "technical", "bug", "issue", "problem", "help"]
_LEAD_KEYWORDS = ["need a website", "need more leads", "book more calls", "interested", "demo", "quote", "proposal", "hire", "timeline", "budget"]
_SERVICE_SIGNALS: dict[str, list[str]] = {
    "contractors": ["contractor", "plumber", "roofer", "electrician", "hvac", "trade"],
    "professional-services": ["lawyer", "consultant", "agency", "accountant", "professional service", "coach"],
    "ecommerce": ["ecommerce", "e-commerce", "shop", "store", "product", "brand"],
}


# ── Helpers ───────────────────────────────────────────────────────────────────

def _normalize(text: str) -> str:
    n = " ".join(text.lower().strip().split())
    n = n.replace("resorces", "resources").replace("recources", "resources")
    n = n.replace("signin", "sign in").replace("signup", "sign up")
    return n


def _detect_service(message: str) -> str | None:
    n = _normalize(message)
    for svc, kws in _SERVICE_SIGNALS.items():
        if any(k in n for k in kws):
            return svc
    return None


def _detect_actions(message: str) -> list[LegacyAssistantAction]:
    n = _normalize(message)
    actions: list[LegacyAssistantAction] = []

    for rule in _PAGE_RULES:
        if any(k in n for k in rule["keywords"]):
            actions.append(rule["action"])
            break

    if any(k in n for k in _SUPPORT_KEYWORDS):
        actions.append(LegacyAssistantAction(
            type="support", label="Email Support", href="mailto:support@omniweb.ai",
            summary="You can contact the support team directly at support@omniweb.ai.",
        ))

    if any(k in n for k in _LEAD_KEYWORDS):
        if not any(a.href == "/get-started" for a in actions):
            actions.append(LegacyAssistantAction(
                type="lead", label="Start Qualification", href="/get-started",
                summary="The best next step is the Get Started flow so Omniweb can learn about your business and goals.",
            ))

    svc = _detect_service(message)
    if svc == "contractors" and not any(a.href == "/solutions" for a in actions):
        actions.insert(0, LegacyAssistantAction(
            type="navigate", label="View Contractor Solutions", href="/solutions", service=svc,
            summary="Opening the Solutions page with contractor-friendly service options.",
        ))
    elif svc == "professional-services" and not any(a.href == "/templates" for a in actions):
        actions.append(LegacyAssistantAction(
            type="navigate", label="View Professional Templates", href="/templates", service=svc,
            summary="Opening templates suited for consultants and professional services.",
        ))

    unique: list[LegacyAssistantAction] = []
    seen: set[tuple[str, str]] = set()
    for a in actions:
        key = (a.type, a.href)
        if key not in seen:
            seen.add(key)
            unique.append(a)
    return unique[:2]


def _build_system_prompt(actions: list[LegacyAssistantAction]) -> str:
    notes = "\n".join(f"- Suggested next step: {a.label} -> {a.href}" for a in actions)
    return (
        "You are the Omniweb assistant. Help visitors with pricing, templates, solutions, support, and lead qualification. "
        "Keep replies concise, clear, and sales-aware. If someone sounds like a buyer, naturally ask about business type, goals, timeline, and budget. "
        "If support is needed, point them to support@omniweb.ai. "
        "Relevant pages: /solutions, /pricing, /templates, /resources, /company#contact, /get-started.\n"
        f"{notes}".strip()
    )


def _build_fallback(messages: list[LegacyChatMessage], actions: list[LegacyAssistantAction]) -> str:
    latest = next((m.content for m in reversed(messages) if m.role == "user"), "")
    svc = _detect_service(latest)
    if any(a.type == "support" for a in actions):
        return "I can help with that. For account or technical issues, the fastest path is support@omniweb.ai."
    if svc == "contractors":
        return "For contractors and trades, Omniweb focuses on lead capture, quote requests, service-area pages, and project galleries. The Solutions page is a great place to start."
    if svc == "professional-services":
        return "For professional services, Omniweb is strongest for credibility, client intake, booking, and lead qualification. I recommend looking at our solutions and templates next."
    if any(a.href == "/pricing" for a in actions):
        return "I can walk you through plan options and features. The Pricing page is the best next step for comparing packages."
    if any(a.href == "/templates" for a in actions):
        return "I can show you templates that match your business type and goals. The Templates page is the best place to browse options."
    if any(a.href == "/solutions" for a in actions):
        return "I can take you to the Solutions page so you can see how Omniweb fits your business and goals."
    if any(a.href == "/get-started" for a in actions):
        return "A good next step is the Get Started flow. It helps qualify your needs and match you to the right setup."
    return (
        "I can help you explore Omniweb services, pricing, templates, support, or the best next step for your business. "
        "If you'd like, tell me your business type and goal, and I'll point you to the right page."
    )


async def _generate_response(
    messages: list[LegacyChatMessage],
    actions: list[LegacyAssistantAction],
) -> str:
    settings = get_settings()
    api_key = settings.llm_api_key
    if not api_key or api_key.startswith("your_"):
        return _build_fallback(messages, actions)

    chat_url = f"{settings.llm_base_url}/chat/completions"
    system_prompt = _build_system_prompt(actions)
    payload_msgs = [{"role": "system", "content": system_prompt}] + [
        m.model_dump() for m in messages[-10:]
    ]

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                chat_url,
                headers={"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"},
                json={
                    "model": settings.llm_model,
                    "messages": payload_msgs,
                    "stream": False,
                    "max_tokens": settings.llm_max_tokens,
                    "temperature": settings.llm_temperature,
                },
            )
        resp.raise_for_status()
        content = resp.json().get("choices", [{}])[0].get("message", {}).get("content", "").strip()
        return content or _build_fallback(messages, actions)
    except Exception as exc:
        logger.warning("LLM call failed: %s", exc)
        return _build_fallback(messages, actions)


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/assistant/automate", response_model=LegacyAssistantResponse)
async def automate(request: LegacyAutomationRequest) -> LegacyAssistantResponse:
    actions = _detect_actions(request.message)
    first = actions[0] if actions else None
    if first:
        if first.type == "navigate":
            content = first.summary or f"Opening {first.label.lower()} now."
        elif first.type == "support":
            content = "I can help you contact support right away."
        else:
            content = "I can take you to the best next step so we can qualify your needs."
    else:
        content = _build_fallback([LegacyChatMessage(role="user", content=request.message)], actions)
    return LegacyAssistantResponse(content=content, actions=actions)


@router.post("/assistant/respond", response_model=LegacyAssistantResponse)
async def respond(request: LegacyAssistantRequest) -> LegacyAssistantResponse:
    if not request.messages:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="messages array required")
    latest = next((m.content for m in reversed(request.messages) if m.role == "user"), "")
    actions = _detect_actions(latest)
    generated = await _generate_response(request.messages, actions)
    return LegacyAssistantResponse(content=generated, actions=actions)
