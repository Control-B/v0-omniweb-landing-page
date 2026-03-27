from __future__ import annotations

import os
from pathlib import Path
from typing import Literal

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env.local")
load_dotenv(BASE_DIR.parent / ".env.local")

# Import the multi-tenant AI system
from app.main import create_app

# Create the integrated app with multi-tenant capabilities
app = create_app()

# Keep existing legacy endpoints for backward compatibility
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str


class AssistantAction(BaseModel):
    type: Literal["navigate", "support", "lead"]
    label: str
    href: str
    service: str | None = None
    intent: str | None = None
    summary: str | None = None


class AssistantRequest(BaseModel):
    messages: list[ChatMessage] = Field(default_factory=list)
    mode: Literal["text", "voice"] = "text"
    current_path: str | None = None


class AutomationRequest(BaseModel):
    message: str
    mode: Literal["text", "voice"] = "voice"
    current_path: str | None = None


class AssistantResponse(BaseModel):
    content: str
    actions: list[AssistantAction] = Field(default_factory=list)


PAGE_RULES = [
    {
        "keywords": ["home", "homepage", "home page", "landing page", "main page", "main website"],
        "action": AssistantAction(
            type="navigate",
            label="Open Home",
            href="/",
            summary="Opening the home page now.",
        ),
    },
    {
        "keywords": ["faq", "faqs", "frequently asked questions", "pricing faq"],
        "action": AssistantAction(
            type="navigate",
            label="Open FAQ Section",
            href="/pricing#faq",
            summary="Opening the FAQ section now.",
        ),
    },
    {
        "keywords": ["pricing plans", "plans section", "pricing section", "plans"],
        "action": AssistantAction(
            type="navigate",
            label="Open Plans Section",
            href="/pricing#plans",
            summary="Opening the plans section now.",
        ),
    },
    {
        "keywords": ["industry solutions", "solution types", "solutions section"],
        "action": AssistantAction(
            type="navigate",
            label="Open Industry Solutions Section",
            href="/solutions#industry-solutions",
            summary="Opening the industry solutions section now.",
        ),
    },
    {
        "keywords": ["features", "features section", "ai features"],
        "action": AssistantAction(
            type="navigate",
            label="Open Features Section",
            href="/solutions#features",
            summary="Opening the features section now.",
        ),
    },
    {
        "keywords": ["how it works", "process", "steps"],
        "action": AssistantAction(
            type="navigate",
            label="Open How It Works Section",
            href="/solutions#how-it-works",
            summary="Opening the how-it-works section now.",
        ),
    },
    {
        "keywords": ["testimonials", "reviews", "customer stories", "results"],
        "action": AssistantAction(
            type="navigate",
            label="Open Testimonials Section",
            href="/solutions#testimonials",
            summary="Opening the testimonials section now.",
        ),
    },
    {
        "keywords": ["solution", "solutions", "service", "services", "what you offer", "offerings"],
        "action": AssistantAction(
            type="navigate",
            label="Open Solutions",
            href="/solutions",
            summary="Showing the Solutions page so you can explore Omniweb service options.",
        ),
    },
    {
        "keywords": ["pricing", "price", "cost", "plan", "plans", "packages"],
        "action": AssistantAction(
            type="navigate",
            label="Open Pricing",
            href="/pricing",
            summary="Opening the Pricing page to compare plans and features.",
        ),
    },
    {
        "keywords": ["template categories", "categories", "template filter"],
        "action": AssistantAction(
            type="navigate",
            label="Open Template Categories",
            href="/templates#categories",
            summary="Opening the template categories section now.",
        ),
    },
    {
        "keywords": ["template grid", "template list", "browse templates"],
        "action": AssistantAction(
            type="navigate",
            label="Open Template Grid",
            href="/templates#template-grid",
            summary="Opening the template grid now.",
        ),
    },
    {
        "keywords": ["custom design", "custom template", "bespoke design"],
        "action": AssistantAction(
            type="navigate",
            label="Open Custom Design Section",
            href="/templates#custom-design",
            summary="Opening the custom design section now.",
        ),
    },
    {
        "keywords": ["template", "templates", "design", "example", "examples", "layouts"],
        "action": AssistantAction(
            type="navigate",
            label="Open Templates",
            href="/templates",
            summary="Opening the Templates page so you can browse layouts and categories.",
        ),
    },
    {
        "keywords": ["resource library", "browse library"],
        "action": AssistantAction(
            type="navigate",
            label="Open Resource Library",
            href="/resources#library",
            summary="Opening the resource library section now.",
        ),
    },
    {
        "keywords": ["articles", "featured articles", "blog articles", "case studies section"],
        "action": AssistantAction(
            type="navigate",
            label="Open Articles Section",
            href="/resources#articles",
            summary="Opening the articles section now.",
        ),
    },
    {
        "keywords": ["video library", "videos section", "popular videos"],
        "action": AssistantAction(
            type="navigate",
            label="Open Videos Section",
            href="/resources#videos",
            summary="Opening the videos section now.",
        ),
    },
    {
        "keywords": ["newsletter", "subscribe", "newsletter signup"],
        "action": AssistantAction(
            type="navigate",
            label="Open Newsletter Section",
            href="/resources#newsletter",
            summary="Opening the newsletter section now.",
        ),
    },
    {
        "keywords": ["resource", "resources", "case study", "case studies", "guide", "guides", "learn", "docs", "blog", "videos", "video library", "knowledge hub"],
        "action": AssistantAction(
            type="navigate",
            label="Open Resources",
            href="/resources",
            summary="Opening the Resources page for guides, videos, and case studies.",
        ),
    },
    {
        "keywords": ["company", "about", "about us", "team"],
        "action": AssistantAction(
            type="navigate",
            label="Open Company",
            href="/company",
            summary="Opening the Company page so you can learn more about Omniweb.",
        ),
    },
    {
        "keywords": ["contact", "contact us", "get in touch", "sales", "talk to sales", "company contact"],
        "action": AssistantAction(
            type="navigate",
            label="Open Company Contact",
            href="/company#contact",
            summary="Opening the Company contact section so you can talk to the team.",
        ),
    },
    {
        "keywords": ["careers", "career", "jobs", "job openings", "open positions", "hiring"],
        "action": AssistantAction(
            type="navigate",
            label="Open Careers Section",
            href="/company#careers",
            summary="Opening the careers section so you can review roles and openings.",
        ),
    },
    {
        "keywords": ["start", "trial", "sign up", "get started", "onboard", "onboarding"],
        "action": AssistantAction(
            type="lead",
            label="Go To Get Started",
            href="/get-started",
            summary="Opening the Get Started page so you can begin the onboarding flow.",
        ),
    },
    {
        "keywords": ["sign in", "log in", "login", "account login"],
        "action": AssistantAction(
            type="navigate",
            label="Open Sign In",
            href="/signin",
            summary="Opening the Sign In page now.",
        ),
    },
    {
        "keywords": ["dashboard", "my dashboard", "account dashboard"],
        "action": AssistantAction(
            type="navigate",
            label="Open Dashboard",
            href="/dashboard",
            summary="Opening the Dashboard page now.",
        ),
    },
    {
        "keywords": ["admin", "admin page", "admin panel"],
        "action": AssistantAction(
            type="navigate",
            label="Open Admin",
            href="/admin",
            summary="Opening the Admin page now.",
        ),
    },
]

SUPPORT_KEYWORDS = ["support", "billing", "account", "login", "technical", "bug", "issue", "problem", "help"]
LEAD_KEYWORDS = ["need a website", "need more leads", "book more calls", "interested", "demo", "quote", "proposal", "hire", "timeline", "budget"]
SERVICE_SIGNALS = {
    "contractors": ["contractor", "plumber", "roofer", "electrician", "hvac", "trade"],
    "professional-services": ["lawyer", "consultant", "agency", "accountant", "professional service", "coach"],
    "ecommerce": ["ecommerce", "e-commerce", "shop", "store", "product", "brand"],
}


@app.get("/health")
async def health() -> dict[str, object]:
    return {
        "status": "ok",
        "services": {
            "supabase": {
                "configured": bool(
                    os.getenv("NEXT_PUBLIC_SUPABASE_URL")
                    and os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
                    and os.getenv("SUPABASE_SERVICE_ROLE_KEY")
                ),
                "urlConfigured": bool(os.getenv("NEXT_PUBLIC_SUPABASE_URL")),
                "anonKeyConfigured": bool(os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")),
                "serviceRoleConfigured": bool(os.getenv("SUPABASE_SERVICE_ROLE_KEY")),
                "dbUrlConfigured": bool(os.getenv("SUPABASE_DB_URL")),
            }
        },
    }


@app.post("/assistant/automate", response_model=AssistantResponse)
async def automate(request: AutomationRequest) -> AssistantResponse:
    actions = detect_actions(request.message)
    content = build_automation_reply(request.message, actions)
    return AssistantResponse(content=content, actions=actions)


@app.post("/assistant/respond", response_model=AssistantResponse)
async def respond(request: AssistantRequest) -> AssistantResponse:
    if not request.messages:
        raise HTTPException(status_code=400, detail="messages array required")

    latest_user_message = next((message.content for message in reversed(request.messages) if message.role == "user"), "")
    actions = detect_actions(latest_user_message)
    generated = await generate_response(request.messages, actions)
    return AssistantResponse(content=generated, actions=actions)


async def generate_response(messages: list[ChatMessage], actions: list[AssistantAction]) -> str:
    api_key = os.getenv("DIGITALOCEAN_API_KEY", "")
    if not api_key or api_key.startswith("your_"):
        return build_fallback_reply(messages, actions)

    endpoint = os.getenv("DIGITALOCEAN_GENAI_ENDPOINT", "https://inference.do-ai.run/v1")
    agent_id = os.getenv("DIGITALOCEAN_AGENT_ID", "")
    model = os.getenv("DIGITALOCEAN_MODEL") or os.getenv("OMNIWEB_LLM_MODEL", "openai/gpt-4o-mini")
    chat_url = f"https://{agent_id}.agents.digitalocean.com/api/v1/chat/completions" if agent_id and not agent_id.startswith("your_") else f"{endpoint}/chat/completions"

    system_prompt = build_system_prompt(actions)
    payload_messages = [{"role": "system", "content": system_prompt}] + [message.model_dump() for message in messages[-10:]]

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(
                chat_url,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}",
                },
                json={
                    "model": model,
                    "messages": payload_messages,
                    "stream": False,
                    "max_tokens": 500,
                    "temperature": 0.6,
                },
            )
        response.raise_for_status()
        data = response.json()
        content = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
        return content or build_fallback_reply(messages, actions)
    except Exception:
        return build_fallback_reply(messages, actions)


def build_system_prompt(actions: list[AssistantAction]) -> str:
    action_notes = "\n".join(f"- Suggested next step: {action.label} -> {action.href}" for action in actions)
    return (
        "You are the Omniweb assistant. Help visitors with pricing, templates, solutions, support, and lead qualification. "
        "Keep replies concise, clear, and sales-aware. If someone sounds like a buyer, naturally ask about business type, goals, timeline, and budget. "
        "If support is needed, point them to support@omniweb.ai. "
        "Relevant pages: /solutions, /pricing, /templates, /resources, /company#contact, /get-started.\n"
        f"{action_notes}".strip()
    )


def detect_actions(message: str) -> list[AssistantAction]:
    normalized = normalize(message)
    actions: list[AssistantAction] = []

    for rule in PAGE_RULES:
        if any(keyword in normalized for keyword in rule["keywords"]):
            actions.append(rule["action"])
            break

    if any(keyword in normalized for keyword in SUPPORT_KEYWORDS):
        actions.append(
            AssistantAction(
                type="support",
                label="Email Support",
                href="mailto:support@omniweb.ai",
                summary="You can contact the support team directly at support@omniweb.ai.",
            )
        )

    if any(keyword in normalized for keyword in LEAD_KEYWORDS):
        if not any(action.href == "/get-started" for action in actions):
            actions.append(
                AssistantAction(
                    type="lead",
                    label="Start Qualification",
                    href="/get-started",
                    summary="The best next step is the Get Started flow so Omniweb can learn about your business and goals.",
                )
            )

    service = detect_service(message)
    if service == "contractors" and not any(action.href == "/solutions" for action in actions):
        actions.insert(
            0,
            AssistantAction(
                type="navigate",
                label="View Contractor Solutions",
                href="/solutions",
                service=service,
                summary="Opening the Solutions page with contractor-friendly service options.",
            ),
        )
    elif service == "professional-services" and not any(action.href == "/templates" for action in actions):
        actions.append(
            AssistantAction(
                type="navigate",
                label="View Professional Templates",
                href="/templates",
                service=service,
                summary="Opening templates suited for consultants and professional services.",
            )
        )

    unique: list[AssistantAction] = []
    seen: set[tuple[str, str]] = set()
    for action in actions:
        key = (action.type, action.href)
        if key not in seen:
            seen.add(key)
            unique.append(action)
    return unique[:2]


def build_automation_reply(message: str, actions: list[AssistantAction]) -> str:
    if actions:
        first = actions[0]
        if first.type == "navigate":
            return first.summary or f"Opening {first.label.lower()} now."
        if first.type == "support":
            return "I can help you contact support right away."
        if first.type == "lead":
            return "I can take you to the best next step so we can qualify your needs."
    return build_fallback_reply([ChatMessage(role="user", content=message)], actions)


def build_fallback_reply(messages: list[ChatMessage], actions: list[AssistantAction]) -> str:
    latest_user_message = next((message.content for message in reversed(messages) if message.role == "user"), "")
    service = detect_service(latest_user_message)

    if any(action.type == "support" for action in actions):
        return "I can help with that. For account or technical issues, the fastest path is support@omniweb.ai."
    if service == "contractors":
        return "For contractors and trades, Omniweb focuses on lead capture, quote requests, service-area pages, and project galleries. The Solutions page is a great place to start."
    if service == "professional-services":
        return "For professional services, Omniweb is strongest for credibility, client intake, booking, and lead qualification. I recommend looking at our solutions and templates next."
    if any(action.href == "/pricing" for action in actions):
        return "I can walk you through plan options and features. The Pricing page is the best next step for comparing packages."
    if any(action.href == "/templates" for action in actions):
        return "I can show you templates that match your business type and goals. The Templates page is the best place to browse options."
    if any(action.href == "/solutions" for action in actions):
        return "I can take you to the Solutions page so you can see how Omniweb fits your business and goals."
    if any(action.href == "/get-started" for action in actions):
        return "A good next step is the Get Started flow. It helps qualify your needs and match you to the right setup."

    return (
        "I can help you explore Omniweb services, pricing, templates, support, or the best next step for your business. "
        "If you'd like, tell me your business type and goal, and I’ll point you to the right page."
    )


def detect_service(message: str) -> str | None:
    normalized = normalize(message)
    for service, keywords in SERVICE_SIGNALS.items():
        if any(keyword in normalized for keyword in keywords):
            return service
    return None


def normalize(text: str) -> str:
    normalized = " ".join(text.lower().strip().split())
    normalized = normalized.replace("resorces", "resources")
    normalized = normalized.replace("recources", "resources")
    normalized = normalized.replace("signin", "sign in")
    normalized = normalized.replace("signup", "sign up")
    return normalized
