export const ASSISTANT_OPEN_EVENT = "omniweb:assistant-open"

export type AssistantOpenMode = "select" | "text" | "voice"

export function dispatchAssistantOpen(mode: AssistantOpenMode = "voice") {
  if (typeof window === "undefined") {
    return
  }

  window.dispatchEvent(
    new CustomEvent(ASSISTANT_OPEN_EVENT, {
      detail: { mode },
    }),
  )
}
