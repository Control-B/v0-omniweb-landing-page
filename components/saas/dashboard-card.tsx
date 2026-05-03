import type { ComponentPropsWithoutRef, ElementType } from "react"
import { cn } from "@/lib/utils"

type DashboardCardProps<T extends ElementType = "section"> = {
  as?: T
  tone?: "default" | "muted" | "highlight"
  density?: "comfortable" | "compact"
} & Omit<ComponentPropsWithoutRef<T>, "as">

export function DashboardCard<T extends ElementType = "section">({
  as,
  className,
  tone = "default",
  density = "comfortable",
  ...props
}: DashboardCardProps<T>) {
  const Component = (as || "section") as ElementType

  return (
    <Component
      className={cn(
        "dashboard-card-surface min-h-[140px] min-w-0 max-w-full overflow-hidden rounded-[20px] break-words",
        density === "comfortable" ? "p-4 sm:p-6 lg:p-7" : "p-4 sm:p-5",
        tone === "muted" && "dashboard-card-muted",
        tone === "highlight" && "dashboard-card-highlight",
        className,
      )}
      {...(props as Record<string, unknown>)}
    />
  )
}