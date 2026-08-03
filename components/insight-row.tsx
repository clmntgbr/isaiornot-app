"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Info } from "lucide-react"

export function InsightRow({
  label,
  value,
  description,
  help,
}: {
  label: string
  value: number
  description: string
  help?: string
}) {
  const colorVar =
    value >= 60
      ? "--color-red-500"
      : value >= 40
        ? "--color-yellow-500"
        : "--color-green-500"

  return (
    <div className="group rounded-xl border bg-card p-3 transition-colors hover:bg-accent/30">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="text-sm font-extrabold text-foreground">{label}</span>
          {help && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={`Help: ${label}`}
                    onClick={(event) => event.preventDefault()}
                  >
                    <Info className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-64 text-left">
                  {help}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <span
          className="text-sm font-bold tabular-nums"
          style={{ color: `var(${colorVar})` }}
        >
          {value.toFixed(1)}
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${value}%`,
            backgroundColor: `var(${colorVar})`,
          }}
        />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
