import Link from "next/link"
import { cn } from "@/lib/utils"

type OmniwebMarkProps = {
  className?: string
  textClassName?: string
}

type OmniwebLogoProps = OmniwebMarkProps & {
  href?: string
  label?: string
  sublabel?: string
  sublabelClassName?: string
}

export function OmniwebMark({ className, textClassName }: OmniwebMarkProps) {
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-sm font-semibold text-cyan-200 shadow-[0_10px_30px_rgba(34,211,238,0.12)]",
        className,
      )}
      aria-hidden="true"
    >
      <span className={cn("leading-none", textClassName)}>O</span>
    </span>
  )
}

export function OmniwebLogo({
  href = "/",
  label = "omniweb",
  sublabel,
  className,
  textClassName,
  sublabelClassName,
}: OmniwebLogoProps) {
  return (
    <Link href={href} className={cn("flex items-center gap-3", className)}>
      <OmniwebMark />
      <span className="min-w-0">
        <span className={cn("block text-xl font-bold tracking-tight text-foreground", textClassName)}>{label}</span>
        {sublabel ? <span className={cn("block truncate text-[11px] text-slate-400", sublabelClassName)}>{sublabel}</span> : null}
      </span>
    </Link>
  )
}