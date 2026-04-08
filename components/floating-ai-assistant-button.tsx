import { Bot, MessageSquareText, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function FloatingAIAssistantButton({
  isOpen,
  onClick,
}: {
  isOpen: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-4 z-50 flex items-center gap-3 rounded-full border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.95),rgba(59,130,246,0.92),rgba(147,51,234,0.92))] px-4 py-3 text-white shadow-[0_20px_60px_rgba(31,41,55,0.5)] transition hover:scale-[1.02] active:scale-[0.98]",
        isOpen ? "pl-3 pr-3" : "pl-3.5 pr-4",
      )}
      aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/20 backdrop-blur-sm">
        {isOpen ? <X className="h-4.5 w-4.5" /> : <Bot className="h-4.5 w-4.5" />}
      </span>
      <span className="hidden text-left sm:block">
        <span className="block text-[10px] uppercase tracking-[0.25em] text-white/70">AI concierge</span>
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          <MessageSquareText className="h-3.5 w-3.5" />
          {isOpen ? "Close AI" : "Talk to Omniweb AI"}
        </span>
      </span>
    </button>
  )
}
