import type {
  AgentBuildPromptResponse,
  AgentConfigRecord,
  AgentConfigUpdatePayload,
  AgentTemplateRecord,
  AgentTestResponse,
} from "@/lib/saas/types"

async function parseJson<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error((payload as { detail?: string; error?: string } | null)?.detail ?? (payload as { error?: string } | null)?.error ?? "Request failed")
  }
  return payload as T
}

export async function fetchAgentConfig() {
  const response = await fetch("/api/agent/config", { cache: "no-store" })
  return parseJson<AgentConfigRecord>(response)
}

export async function saveAgentConfig(payload: AgentConfigUpdatePayload) {
  const response = await fetch("/api/agent/config", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  return parseJson<AgentConfigRecord>(response)
}

export async function fetchAgentTemplates(agentMode?: string) {
  const query = agentMode ? `?agentMode=${encodeURIComponent(agentMode)}` : ""
  const response = await fetch(`/api/agent/templates${query}`, { cache: "no-store" })
  return parseJson<{ templates: AgentTemplateRecord[] }>(response)
}

export async function applyAgentTemplate(templateId: string) {
  const response = await fetch("/api/agent/apply-template", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ templateId }),
  })
  return parseJson<{ template: AgentTemplateRecord; config: AgentConfigRecord }>(response)
}

export async function buildAgentPrompt(payload: AgentConfigUpdatePayload) {
  const response = await fetch("/api/agent/build-prompt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  return parseJson<AgentBuildPromptResponse>(response)
}

export async function testAgent(payload: AgentConfigUpdatePayload & { message: string }) {
  const response = await fetch("/api/agent/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  return parseJson<AgentTestResponse>(response)
}
