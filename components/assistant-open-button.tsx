"use client"

import type { ReactNode } from "react"
import { dispatchAssistantOpen, type AssistantOpenMode } from "@/lib/assistant-events"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AssistantOpenButtonProps = {
  mode?: AssistantOpenMode
  children: ReactNode
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function AssistantOpenButton({
  mode = "voice",
  children,
  className,
  size = "lg",
  variant = "default",
}: AssistantOpenButtonProps) {
  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={cn(className)}
      onClick={() => dispatchAssistantOpen(mode)}
    >
      {children}
    </Button>
  )
}
