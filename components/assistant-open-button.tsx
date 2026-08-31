"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AssistantOpenButtonProps = {
  mode?: "select" | "text" | "voice"
  children: ReactNode
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  href?: string
}

export function AssistantOpenButton({
  children,
  className,
  size = "lg",
  variant = "default",
  href = "/demo",
}: AssistantOpenButtonProps) {
  return (
    <Button
      asChild
      size={size}
      variant={variant}
      className={cn(className)}
    >
      <Link href={href}>
        {children}
      </Link>
    </Button>
  )
}
