import type { AgentTemplateRecord } from "@/lib/saas/types"

export function getTemplateSummary(template: AgentTemplateRecord) {
  return `${template.name} · ${template.agentMode.replaceAll("_", " ")}`
}
