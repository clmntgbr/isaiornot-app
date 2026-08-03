import { cn } from "@/lib/utils"
import type { ComponentType, ReactNode } from "react"

interface PillBadgeProps {
  children: ReactNode
  className?: string
  icon?: ComponentType<{ className?: string }>
  iconClassName?: string
  title?: string
}

export function PillBadge({
  children,
  className,
  icon: Icon,
  iconClassName,
  title,
}: PillBadgeProps) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        className
      )}
    >
      {Icon ? (
        <Icon
          className={cn("size-3.5 shrink-0", iconClassName)}
          aria-hidden="true"
        />
      ) : null}
      {children}
    </span>
  )
}
