import type { ComponentPropsWithoutRef, ElementType } from "react"
import { cn } from "@/lib/utils"

type DashboardCardProps<T extends ElementType = "section"> = {
  as?: T
  tone?: "default" | "muted" | "highlight"
} & Omit<ComponentPropsWithoutRef<T>, "as">

export function DashboardCard<T extends ElementType = "section">({
  as,
  className,
  tone = "default",
  ...props
}: DashboardCardProps<T>) {
  const Component = as || "section"

  return (
    <Component
      className={cn(
        "dashboard-card-surface min-h-[140px] rounded-[24px] p-6 lg:p-7",
        tone === "muted" && "dashboard-card-muted",
        tone === "highlight" && "dashboard-card-highlight",
        className,
      )}
      {...props}
    />
  )
}