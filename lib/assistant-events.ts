export const ASSISTANT_OPEN_EVENT = "omniweb:assistant-open"

export type AssistantOpenMode = "select" | "text" | "voice"

export type AssistantOpenOptions = {
  clientId?: string | null
}

export function dispatchAssistantOpen(mode: AssistantOpenMode = "voice", options: AssistantOpenOptions = {}) {
  if (typeof window === "undefined") {
    return
  }

  window.dispatchEvent(
    new CustomEvent(ASSISTANT_OPEN_EVENT, {
      detail: { mode, clientId: options.clientId },
    }),
  )
}
